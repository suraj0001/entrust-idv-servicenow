import { gs, GlideRecord } from '@servicenow/glide'
import { RESTMessageV2 } from '@servicenow/glide/sn_ws'

/**
 * Result of starting an Entrust IDV verification from the incident UI Action.
 */
export interface VerifyResult {
    success: boolean
    message: string
    linkUrl?: string
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
const SMART_CAPTURE_EVENT = 'x_entru_entrustidv.smart_capture.created'
const DEFAULT_WORKFLOW_ID = '4aa50569-b226-4785-b5e1-ee9e30eee7e6'

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
    // Traverse alias → http_connection → oauth_2_0_credentials → oauth_entity_profile.
    const aliasGr = new GlideRecord('sys_alias')
    aliasGr.addQuery('name', ENTRUST_ALIAS_NAME)
    aliasGr.query()
    if (!aliasGr.next()) {
        gs.error(
            '[EntrustIDV] createApplicant: alias "' +
                ENTRUST_ALIAS_NAME +
                '" not found.',
        )
        return {
            success: false,
            message:
                'Entrust IDV is not configured. Connection alias not found.',
        }
    }

    const connGr = new GlideRecord('http_connection')
    connGr.addQuery('connection_alias', aliasGr.getUniqueValue())
    connGr.orderByDesc('sys_created_on')
    connGr.query()
    if (!connGr.next()) {
        gs.error(
            '[EntrustIDV] createApplicant: no http_connection linked to alias.',
        )
        return {
            success: false,
            message: 'Entrust IDV is not configured. Run setup first.',
        }
    }

    const baseUrl = connGr.getValue('connection_url') as string
    if (!baseUrl) {
        gs.error(
            '[EntrustIDV] createApplicant: http_connection.connection_url is empty.',
        )
        return {
            success: false,
            message: 'Entrust IDV base URL is not set. Re-run setup.',
        }
    }

    const credGr = new GlideRecord('oauth_2_0_credentials')
    credGr.get(connGr.getValue('credential'))
    if (!credGr.isValidRecord()) {
        gs.error(
            '[EntrustIDV] createApplicant: oauth_2_0_credentials not found.',
        )
        return {
            success: false,
            message: 'OAuth credentials not configured. Re-run setup.',
        }
    }

    // sys_id of the oauth_entity_profile record — required by setAuthenticationProfile.
    const oauthEntityProfileId = credGr.getValue(
        'oauth_entity_profile',
    ) as string
    // sys_id of the oauth_2_0_credentials record — used by setRequestorProfile so ServiceNow
    // reuses the cached token generated via the C&C alias rather than requesting a new one.
    const credentialSysId = credGr.getUniqueValue()

    const payload: Record<string, unknown> = {
        first_name: normaliseWhitespace(firstName),
        last_name: normaliseWhitespace(lastName),
        email: email,
    }
    if (phoneNumber) {
        payload.phone_number = phoneNumber
    }

    const request = new RESTMessageV2()
    try {
        request.setEndpoint(baseUrl + '/applicants/')
        request.setHttpMethod('post')
        // Pass the oauth_entity_profile sys_id — not the provider, credential, or alias sys_id.
        request.setAuthenticationProfile('oauth2', oauthEntityProfileId)
        // Point ServiceNow to the requestor under which the C&C alias token was stored so it
        // returns the cached token instead of hitting the token endpoint on every call.
        // Cast needed because the TS typings omit this runtime-only method.
        ;(request as any).setRequestorProfile(
            'oauth_2_0_credentials',
            credentialSysId,
        )
        request.setRequestHeader('Accept', 'application/json')
        request.setRequestHeader('Content-Type', 'application/json')
        request.setRequestBody(JSON.stringify(payload))
        request.setHttpTimeout(30000)

        const response = request.execute()

        if (response.haveError()) {
            gs.error(
                '[EntrustIDV] createApplicant transport error: ' +
                    response.getErrorMessage(),
            )
            return {
                success: false,
                message: 'Network error reaching Entrust IDV.',
            }
        }

        const status = response.getStatusCode()
        const body = response.getBody()

        if (status === 201) {
            let parsed: { id?: string } = {}
            try {
                parsed = body ? JSON.parse(body) : {}
            } catch (_) {
                parsed = {}
            }
            if (!parsed || !parsed.id) {
                gs.error(
                    '[EntrustIDV] createApplicant: 201 but no id in response: ' +
                        body,
                )
                return {
                    success: false,
                    message: 'Applicant created but no ID returned.',
                }
            }
            return {
                success: true,
                applicantId: parsed.id,
                message: 'Applicant created.',
            }
        }

        gs.error(
            '[EntrustIDV] createApplicant failed HTTP ' + status + ': ' + body,
        )
        if (status === 401 || status === 403) {
            return {
                success: false,
                message:
                    'Authentication error creating applicant (HTTP ' +
                    status +
                    '). Re-run setup.',
            }
        }
        if (status === 422) {
            return {
                success: false,
                message:
                    'Invalid applicant data (HTTP 422). Check caller name and email.',
            }
        }
        return {
            success: false,
            message:
                'Entrust IDV returned HTTP ' +
                status +
                ' for applicant creation.',
        }
    } catch (err) {
        gs.error('[EntrustIDV] createApplicant error: ' + String(err))
        return {
            success: false,
            message: 'Error creating applicant: ' + String(err),
        }
    }
}

interface CreateWorkflowRunResult {
    success: boolean
    workflowRunId?: string
    linkUrl?: string
    message: string
}

/**
 * Create a Workflow Run and an English Smart Capture link in Entrust IDV.
 * Uses the same alias traversal as createApplicant.
 */
function createWorkflowRun(
    applicantId: string,
    workflowId: string,
): CreateWorkflowRunResult {
    const aliasGr = new GlideRecord('sys_alias')
    aliasGr.addQuery('name', ENTRUST_ALIAS_NAME)
    aliasGr.query()
    if (!aliasGr.next()) {
        gs.error(
            '[EntrustIDV] createWorkflowRun: alias "' +
                ENTRUST_ALIAS_NAME +
                '" not found.',
        )
        return {
            success: false,
            message:
                'Entrust IDV is not configured. Connection alias not found.',
        }
    }

    const connGr = new GlideRecord('http_connection')
    connGr.addQuery('connection_alias', aliasGr.getUniqueValue())
    connGr.orderByDesc('sys_created_on')
    connGr.query()
    if (!connGr.next()) {
        gs.error(
            '[EntrustIDV] createWorkflowRun: no http_connection linked to alias.',
        )
        return {
            success: false,
            message: 'Entrust IDV is not configured. Run setup first.',
        }
    }

    const baseUrl = connGr.getValue('connection_url') as string
    if (!baseUrl) {
        gs.error(
            '[EntrustIDV] createWorkflowRun: http_connection.connection_url is empty.',
        )
        return {
            success: false,
            message: 'Entrust IDV base URL is not set. Re-run setup.',
        }
    }

    const credGr = new GlideRecord('oauth_2_0_credentials')
    credGr.get(connGr.getValue('credential'))
    if (!credGr.isValidRecord()) {
        gs.error(
            '[EntrustIDV] createWorkflowRun: oauth_2_0_credentials not found.',
        )
        return {
            success: false,
            message: 'OAuth credentials not configured. Re-run setup.',
        }
    }

    const oauthEntityProfileId = credGr.getValue(
        'oauth_entity_profile',
    ) as string
    const credentialSysId = credGr.getUniqueValue()

    const payload = {
        workflow_id: workflowId,
        applicant_id: applicantId,
        link: {
            language: 'en_US',
        },
    }

    const request = new RESTMessageV2()
    try {
        request.setEndpoint(baseUrl + '/workflow_runs/')
        request.setHttpMethod('post')
        request.setAuthenticationProfile('oauth2', oauthEntityProfileId)
        ;(request as any).setRequestorProfile(
            'oauth_2_0_credentials',
            credentialSysId,
        )
        request.setRequestHeader('Accept', 'application/json')
        request.setRequestHeader('Content-Type', 'application/json')
        request.setRequestBody(JSON.stringify(payload))
        request.setHttpTimeout(30000)

        const response = request.execute()
        const status = response.getStatusCode()
        const body = response.getBody()

        if (response.haveError()) {
            const errorMessage = response.getErrorMessage()
            if (!status || status < 0) {
                gs.error(
                    '[EntrustIDV] createWorkflowRun transport error: ' +
                        errorMessage,
                )
                return {
                    success: false,
                    message:
                        'Network error reaching Entrust IDV: ' + errorMessage,
                }
            }
        }

        if (status === 201) {
            let parsed: { id?: string; link?: { url?: string } } = {}
            try {
                parsed = body ? JSON.parse(body) : {}
            } catch (_) {
                parsed = {}
            }
            if (!parsed || !parsed.id) {
                gs.error(
                    '[EntrustIDV] createWorkflowRun: 201 but no id in response: ' +
                        body,
                )
                return {
                    success: false,
                    message: 'Workflow run created but no ID returned.',
                }
            }
            return {
                success: true,
                workflowRunId: parsed.id,
                linkUrl: parsed.link && parsed.link.url,
                message: 'Workflow run created.',
            }
        }

        gs.error(
            '[EntrustIDV] createWorkflowRun failed HTTP ' +
                status +
                ': ' +
                body,
        )
        if (status === 401 || status === 403) {
            return {
                success: false,
                message:
                    'Authentication error creating workflow run (HTTP ' +
                    status +
                    '). Confirm the Entrust OAuth application has workflows:write scope and refresh the cached ServiceNow OAuth token.',
            }
        }
        if (status === 422) {
            return {
                success: false,
                message:
                    'Invalid workflow run data (HTTP 422). Confirm the workflow is active and that all Studio input data is present.',
            }
        }
        return {
            success: false,
            message:
                'Entrust IDV returned HTTP ' +
                status +
                ' for workflow run creation.',
        }
    } catch (err) {
        gs.error('[EntrustIDV] createWorkflowRun error: ' + String(err))
        return {
            success: false,
            message: 'Error creating workflow run: ' + String(err),
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

    const workflowId = DEFAULT_WORKFLOW_ID

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
        return {
            success: false,
            message:
                'Caller has no email address — cannot create an applicant.',
        }
    }

    const applicantResult = createApplicant(
        firstName,
        lastName,
        email,
        phoneNumber || undefined,
    )
    if (!applicantResult.success) {
        return { success: false, message: applicantResult.message }
    }

    const workflowResult = createWorkflowRun(
        applicantResult.applicantId!,
        workflowId,
    )
    if (!workflowResult.success) {
        return { success: false, message: workflowResult.message }
    }

    if (!workflowResult.linkUrl) {
        return {
            success: false,
            message:
                'Workflow run created, but Entrust did not return a Smart Capture Link.',
        }
    }

    const emailQueued = config.getValue('delivery_channel') === 'email'
    if (emailQueued) {
        gs.eventQueue(SMART_CAPTURE_EVENT, incident, workflowResult.linkUrl, '')
    }

    const incidentNumber = incident.getValue('number') as string
    const callerName = normaliseWhitespace(firstName + ' ' + lastName)

    return {
        success: true,
        linkUrl: workflowResult.linkUrl,
        message:
            'Identity verification started for ' +
            callerName +
            ' on ' +
            incidentNumber +
            (emailQueued
                                ? '. The Smart Capture Link email event has been queued for ' +
                  email +
                  '.'
                : '. The configured delivery channel is not email, so no email was queued.'),
    }
}
