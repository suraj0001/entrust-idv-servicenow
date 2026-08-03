import { gs, GlideRecord } from '@servicenow/glide'
import { RESTMessageV2 } from '@servicenow/glide/sn_ws'
import { ConnectionInfoProvider } from '@servicenow/glide/sn_cc'

/**
 * Result of starting an Entrust IDV verification from the incident UI Action.
 */
export interface VerifyResult {
    success: boolean
    message: string
}

/**
 * Result of creating an Entrust applicant.
 */
interface CreateApplicantResult {
    success: boolean
    applicantId?: string
    message: string
}

const ENTRUST_ALIAS_NAME = 'entrust_idv_api'

/**
 * Normalise whitespace in a name field per the Entrust API requirement:
 * collapse any run of whitespace to a single space and trim edges.
 */
function normaliseWhitespace(value: string): string {
    return value.replace(/\s+/g, ' ').trim()
}

/**
 * Create an applicant record in Entrust IDV via POST /v3.6/applicants/.
 * Resolves the OAuth profile from the Connection & Credential Alias at runtime.
 */
function createApplicant(
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber?: string,
): CreateApplicantResult {
    const aliasGr = new GlideRecord('sys_alias')
    aliasGr.addQuery('name', ENTRUST_ALIAS_NAME)
    aliasGr.query()
    if (!aliasGr.next()) {
        gs.error('[EntrustIDV] createApplicant: alias "' + ENTRUST_ALIAS_NAME + '" not found.')
        return { success: false, message: 'Entrust IDV connection alias not found.' }
    }
    const aliasSysId = aliasGr.getUniqueValue()

    // Official IntegrationHub API for reading connection attributes from an alias in scoped apps.
    const connectionInfo = new ConnectionInfoProvider().getConnectionInfo(aliasSysId)
    if (!connectionInfo) {
        return { success: false, message: 'Entrust IDV connection not configured. Complete the setup page first.' }
    }
    const baseUrl = connectionInfo.getAttribute('connection_url')
    if (!baseUrl) {
        gs.error('[EntrustIDV] createApplicant: connection_url is blank for alias "' + ENTRUST_ALIAS_NAME + '".')
        return { success: false, message: 'Connection URL is blank. Set it on the http_connection record and re-run setup.' }
    }

    // Traverse connection → credential to get the oauth_entity_profile sys_id for setAuthenticationProfile.
    const connGr = new GlideRecord('http_connection')
    connGr.addQuery('connection_alias', aliasSysId)
    connGr.orderByDesc('sys_created_on')
    connGr.query()
    if (!connGr.next()) {
        return {
            success: false,
            message: 'Entrust IDV connection not configured. Complete the setup page first.',
        }
    }

    const credGr = new GlideRecord('oauth_2_0_credentials')
    credGr.get(connGr.getValue('credential'))
    if (!credGr.isValidRecord()) {
        gs.error('[EntrustIDV] createApplicant: oauth_2_0_credentials not found for connection.')
        return { success: false, message: 'Entrust IDV OAuth credentials not found. Re-run setup.' }
    }

    const profileSysId = credGr.getValue('oauth_entity_profile')
    if (!profileSysId) {
        gs.error('[EntrustIDV] createApplicant: no oauth_entity_profile on credentials.')
        return { success: false, message: 'Entrust IDV OAuth profile not found. Re-run setup.' }
    }

    gs.info('[EntrustIDV] createApplicant: using profile=' + profileSysId)

    const body: Record<string, string> = {
        first_name: normaliseWhitespace(firstName),
        last_name: normaliseWhitespace(lastName),
        email: email,
    }
    if (phoneNumber) {
        body.phone_number = phoneNumber
    }

    const endpoint = baseUrl + '/applicants/'
    gs.info('[EntrustIDV] createApplicant: POST ' + endpoint)

    try {
        const request = new RESTMessageV2()
        request.setHttpMethod('POST')
        request.setEndpoint(endpoint)
        // Platform fetches/caches the Bearer token; no manual token management needed.
        request.setAuthenticationProfile('oauth2', profileSysId)
        request.setRequestHeader('Content-Type', 'application/json')
        request.setRequestHeader('Accept', 'application/json')
        request.setRequestBody(JSON.stringify(body))
        request.setHttpTimeout(30000)

        const response = request.execute()

        if (response.haveError()) {
            const transportErr = response.getErrorMessage()
            gs.error('[EntrustIDV] createApplicant transport error: ' + transportErr)
            return {
                success: false,
                message: 'Could not reach Entrust IDV: ' + transportErr,
            }
        }

        const status = response.getStatusCode()
        const responseBody = response.getBody()

        if (status === 201) {
            let parsed: { id?: string } = {}
            try {
                parsed = responseBody ? JSON.parse(responseBody) : {}
            } catch (_) {
                parsed = {}
            }
            if (!parsed.id) {
                gs.error(
                    '[EntrustIDV] createApplicant: 201 response missing applicant id. Body: ' +
                        responseBody,
                )
                return {
                    success: false,
                    message: 'Applicant created but ID was not returned by Entrust IDV.',
                }
            }
            gs.info('[EntrustIDV] Applicant created with id=' + parsed.id)
            return { success: true, applicantId: parsed.id, message: 'Applicant created.' }
        }

        if (status === 422) {
            gs.warn('[EntrustIDV] createApplicant validation error (422): ' + responseBody)
            return {
                success: false,
                message: 'Entrust IDV rejected the applicant data. Check the caller fields on the incident.',
            }
        }

        if (status === 401 || status === 403) {
            gs.error('[EntrustIDV] createApplicant auth error (HTTP ' + status + '): ' + responseBody)
            return {
                success: false,
                message:
                    'Entrust IDV authentication failed (HTTP ' +
                    status +
                    '). Check the connection credentials.',
            }
        }

        gs.error('[EntrustIDV] createApplicant unexpected HTTP ' + status + ': ' + responseBody)
        return {
            success: false,
            message: 'Entrust IDV returned an unexpected status (HTTP ' + status + ').',
        }
    } catch (err) {
        gs.error('[EntrustIDV] createApplicant error: ' + String(err))
        return {
            success: false,
            message: 'Server error while creating applicant: ' + String(err),
        }
    }
}

/**
 * Kick off an Entrust IDV verification for the person on the given incident.
 * Requires the app to have been configured via the setup page first.
 */
export function startVerification(incidentId: string): VerifyResult {
    if (!incidentId) {
        return { success: false, message: 'No incident was provided.' }
    }

    const config = new GlideRecord('x_entru_entrustidv_config')
    config.query()
    if (!config.next()) {
        return {
            success: false,
            message:
                'Entrust IDV is not configured yet. Complete the setup page first.',
        }
    }

    const active = config.getValue('active')
    if (active !== 'true' && active !== '1') {
        return {
            success: false,
            message:
                'Entrust IDV configuration is inactive. Enable it on the setup page.',
        }
    }

    const workflowId = config.getValue('default_workflow_id')
    if (!workflowId) {
        return {
            success: false,
            message: 'No default workflow is configured for Entrust IDV.',
        }
    }

    const incident = new GlideRecord('incident')
    incident.get(incidentId)
    if (!incident.isValidRecord()) {
        return { success: false, message: 'Incident not found.' }
    }

    // Resolve the caller (subject of the identity verification).
    const callerSysId = incident.getValue('caller_id')
    if (!callerSysId) {
        return {
            success: false,
            message: 'The incident has no caller — cannot create an applicant.',
        }
    }

    const caller = new GlideRecord('sys_user')
    caller.get(callerSysId)
    if (!caller.isValidRecord()) {
        return { success: false, message: 'Caller user record not found.' }
    }

    const firstName = caller.getValue('first_name') || ''
    const lastName = caller.getValue('last_name') || ''
    const email = caller.getValue('email') || ''
    const phoneNumber =
        caller.getValue('mobile_phone') || caller.getValue('phone') || ''

    if (!firstName || !lastName) {
        return {
            success: false,
            message:
                'Caller is missing a first or last name — cannot create an applicant.',
        }
    }
    if (!email) {
        // email is required because Smart Capture Link uses applicant_provides_data=true.
        return {
            success: false,
            message:
                'Caller has no email address — cannot create an applicant.',
        }
    }

    gs.info(
        '[EntrustIDV] startVerification: creating applicant for incident ' +
            incident.getValue('number') +
            ' (caller sys_id=' +
            callerSysId +
            ')',
    )

    const applicantResult = createApplicant(
        firstName,
        lastName,
        email,
        phoneNumber || undefined,
    )
    if (!applicantResult.success) {
        return { success: false, message: applicantResult.message }
    }

    // TODO: Next step — create a Workflow Run with applicantResult.applicantId + workflowId
    // and return the Smart Capture Link URL to send to the caller.
    gs.info(
        '[EntrustIDV] Applicant created (id=' +
            applicantResult.applicantId +
            ') for incident ' +
            incident.getValue('number') +
            ' — next: create Workflow Run with workflow ' +
            workflowId,
    )

    return {
        success: true,
        message:
            'Applicant created for ' +
            incident.getValue('number') +
            '. Ready to start workflow run.',
    }
}
