import { gs, GlideRecord } from '@servicenow/glide'
import { RESTMessageV2 } from '@servicenow/glide/sn_ws'

/**
 * Result of a connectivity/credential check against Entrust IDV.
 */
export interface TestConnectionResult {
    success: boolean
    message: string
}

// Must mirror BASE_URLS in src/server/ui-pages/entrust-idv-setup.client.js (browser JS can't import server modules).
const REGION_BASE_URLS: Record<string, string> = {
    us: 'https://api.us.onfido.com/v3.6',
    eu: 'https://api.eu.onfido.com/v3.6',
    ca: 'https://api.ca.onfido.com/v3.6',
}

/**
 * Validate the admin-supplied credentials by performing an OAuth Client
 * Credentials token request against the region-specific Entrust IDV endpoint.
 *
 * Nothing is persisted — the values come from the setup form and are used only
 * to verify connectivity + credentials.
 */
export function testConnection(
    clientId: string,
    clientSecret: string,
    region: string,
): TestConnectionResult {
    if (!clientId || !clientSecret || !region) {
        return {
            success: false,
            message: 'Client ID, Client Secret and Region are all required.',
        }
    }

    const baseUrl = REGION_BASE_URLS[String(region).toLowerCase()]
    if (!baseUrl) {
        return { success: false, message: 'Unknown region: ' + region }
    }

    const request = new RESTMessageV2()
    try {
        // Endpoint is derived only from the trusted region allow-list above — never from
        // client input — to avoid SSRF via a tampered/forged URL from the browser.
        request.setEndpoint(baseUrl + '/oauth/token')
        request.setHttpMethod('post')
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
        request.setRequestHeader('Accept', 'application/json')
        // Client Credentials grant — no grant_type per the Entrust IDV spec.
        request.setRequestBody(
            'client_id=' +
                encodeURIComponent(clientId) +
                '&client_secret=' +
                encodeURIComponent(clientSecret),
        )
        request.setHttpTimeout(30000)

        const response = request.execute()

        if (response.haveError()) {
            gs.error('[EntrustIDV] Test connection transport error: ' + response.getErrorMessage())
            return {
                success: false,
                message: 'Connection failed. Please try again later or contact your administrator.',
            }
        }

        const status = response.getStatusCode()
        const body = response.getBody()

        if (status >= 200 && status < 300) {
            let parsed: { access_token?: string } = {}
            try {
                parsed = body ? JSON.parse(body) : {}
            } catch (parseErr) {
                parsed = {}
            }
            if (parsed && parsed.access_token) {
                return { success: true, message: 'Connection successful.' }
            }
            return {
                success: false,
                message:
                    'Reached Entrust but no access token was returned. Please re-check your credentials.',
            }
        }

        if (status === 401 || status === 403) {
            return {
                success: false,
                message:
                    'Authentication failed (HTTP ' + status + '). Check your Client ID and Client Secret.',
            }
        }

        gs.error('[EntrustIDV] Test connection failed with HTTP ' + status + ': ' + body)
        return { success: false, message: 'Connection failed (HTTP ' + status + ').' }
    } catch (err) {
        gs.error('[EntrustIDV] Test connection error: ' + String(err))
        return {
            success: false,
            message:
                'Could not reach Entrust IDV. Verify the region and that outbound access is allowed.',
        }
    }
}

/**
 * Result of saving the Entrust IDV configuration.
 */
export interface SaveConfigResult {
    success: boolean
    message: string
}

// No UI field yet — defaulted until a delivery-channel selector is added to the setup page.
const DEFAULT_DELIVERY_CHANNEL = 'email'

// Existing Connection & Credential Alias (created manually in the instance) that our
// http_connection/oauth_2_0_credentials records must link to.
const ENTRUST_ALIAS_NAME = 'entrust_idv_api'

/**
 * Result of looking up the Entrust IDV Connection & Credential alias.
 */
export interface AliasInfoResult {
    success: boolean
    message: string
    aliasSysId?: string
    hasConnection?: boolean
}

/**
 * Look up the entrust_idv_api alias and whether it already has a linked http_connection.
 * Used by the client to decide whether to call the platform's own
 * ConnectionAndCredentialHelper.createConnectionAndCredential (first time) or let Save
 * update the existing connection/credential directly (subsequent times).
 */
export function getAliasInfo(): AliasInfoResult {
    try {
        const aliasGr = new GlideRecord('sys_alias')
        aliasGr.addQuery('name', ENTRUST_ALIAS_NAME)
        aliasGr.query()
        if (!aliasGr.next()) {
            return { success: false, message: 'Entrust IDV connection alias not found.' }
        }
        const aliasSysId = aliasGr.getUniqueValue()

        const connGr = new GlideRecord('http_connection')
        connGr.addQuery('connection_alias', aliasSysId)
        // If earlier testing left duplicate connections behind, always treat the newest as "the" connection.
        connGr.orderByDesc('sys_created_on')
        connGr.query()

        return { success: true, message: '', aliasSysId: aliasSysId, hasConnection: connGr.next() }
    } catch (err) {
        gs.error('[EntrustIDV] getAliasInfo error: ' + String(err))
        return { success: false, message: 'Could not look up the Entrust IDV connection alias.' }
    }
}

/**
 * Update the oauth_entity / oauth_entity_profile backing the Connection & Credential Alias.
 * Traverses alias → newest http_connection → credential → profile → entity so Setup always
 * updates the same profile that createApplicant will use at runtime.
 */
function updateEntrustConnection(
    clientId: string,
    clientSecret: string,
    baseUrl: string,
    tokenUrl: string,
): SaveConfigResult {
    const aliasGr = new GlideRecord('sys_alias')
    aliasGr.addQuery('name', ENTRUST_ALIAS_NAME)
    aliasGr.query()
    if (!aliasGr.next()) {
        gs.error('[EntrustIDV] Connection & Credential alias "' + ENTRUST_ALIAS_NAME + '" not found.')
        return { success: false, message: 'Could not save credentials: connection alias not found.' }
    }
    const aliasSysId = aliasGr.getUniqueValue()

    const connGr = new GlideRecord('http_connection')
    connGr.addQuery('connection_alias', aliasSysId)
    connGr.orderByDesc('sys_created_on')
    connGr.query()
    if (!connGr.next()) {
        gs.error('[EntrustIDV] No http_connection linked to alias "' + ENTRUST_ALIAS_NAME + '".')
        return {
            success: false,
            message: 'No connection found for alias. Complete the initial Connection & Credential setup first.',
        }
    }

    const credGr = new GlideRecord('oauth_2_0_credentials')
    credGr.get(connGr.getValue('credential'))
    if (!credGr.isValidRecord()) {
        gs.error('[EntrustIDV] updateEntrustConnection: oauth_2_0_credentials not found for connection.')
        return { success: false, message: 'OAuth credentials not found. Re-create the Connection & Credential.' }
    }

    const profileGr = new GlideRecord('oauth_entity_profile')
    profileGr.get(credGr.getValue('oauth_entity_profile'))
    if (!profileGr.isValidRecord()) {
        gs.error('[EntrustIDV] updateEntrustConnection: oauth_entity_profile not found.')
        return { success: false, message: 'OAuth profile not found. Re-create the Connection & Credential.' }
    }

    const entityGr = new GlideRecord('oauth_entity')
    entityGr.get(profileGr.getValue('oauth_entity'))
    if (!entityGr.isValidRecord()) {
        gs.error('[EntrustIDV] updateEntrustConnection: oauth_entity not found.')
        return { success: false, message: 'OAuth entity not found. Re-create the Connection & Credential.' }
    }

    entityGr.setValue('client_id', clientId)
    entityGr.setValue('client_secret', clientSecret)
    entityGr.setValue('token_url', tokenUrl)
    entityGr.setValue('refresh_token_url', tokenUrl)
    entityGr.setValue('default_grant_type', 'client_credentials')
    // Onfido requires credentials in the POST body, not as a Basic auth header.
    entityGr.setValue('send_client_credentials_as', 'request_body_parameter')
    entityGr.update()

    profileGr.setValue('grant_type', 'client_credentials')
    profileGr.update()

    // http_connection.connection_url is blocked from scoped-app writes; warn on mismatch only.
    const existingUrl = connGr.getValue('connection_url')
    if (existingUrl && existingUrl !== baseUrl) {
        gs.warn(
            '[EntrustIDV] http_connection.connection_url ("' +
                existingUrl +
                '") differs from selected region Base URL ("' +
                baseUrl +
                '") but cannot be updated from this scope.',
        )
        return {
            success: true,
            message:
                'Credentials saved. Note: the connection\'s Base URL ("' +
                existingUrl +
                '") differs from "' +
                baseUrl +
                '" — ask an admin to update it on the http_connection record.',
        }
    }

    return { success: true, message: 'Credentials saved.' }
}

/**
 * Persist the Entrust IDV setup: Client ID/Secret/Base URL/Token URL go to the
 * entrust_idv_api Connection & Credential alias; everything else goes to the
 * singleton x_entru_entrustidv_config record.
 *
 * Only called after a successful Test Connection, so connection_tested/active are set true.
 */
export function saveConfig(
    clientId: string,
    clientSecret: string,
    baseUrl: string,
    tokenUrl: string,
    region: string,
    defaultWorkflowId: string,
): SaveConfigResult {
    if (!clientId || !clientSecret || !baseUrl || !tokenUrl || !region || !defaultWorkflowId) {
        return { success: false, message: 'All fields are required.' }
    }

    try {
        const credentialResult = updateEntrustConnection(clientId, clientSecret, baseUrl, tokenUrl)
        if (!credentialResult.success) {
            return credentialResult
        }

        const gr = new GlideRecord('x_entru_entrustidv_config')
        gr.query()
        const isNew = !gr.next()
        if (isNew) {
            gr.initialize()
        }

        gr.setValue('region', region)
        gr.setValue('default_workflow_id', defaultWorkflowId)
        if (!gr.getValue('delivery_channel')) {
            gr.setValue('delivery_channel', DEFAULT_DELIVERY_CHANNEL)
        }
        if (!gr.getValue('webhook_secret')) {
            // Placeholder until we decide whether this is user-supplied — randomly generated
            // rather than a fixed default so it isn't a predictable shared secret.
            gr.setValue('webhook_secret', gs.generateGUID())
        }
        gr.setValue('connection_tested', true)
        gr.setValue('active', true)

        const sysId = isNew ? gr.insert() : gr.update()
        if (!sysId) {
            gs.error('[EntrustIDV] saveConfig: insert/update returned no sys_id')
            return { success: false, message: 'Could not save configuration. Please try again.' }
        }

        return { success: true, message: 'Configuration saved successfully.' }
    } catch (err) {
        gs.error('[EntrustIDV] saveConfig error: ' + String(err))
        return { success: false, message: 'Could not save configuration: ' + String(err) }
    }
}
