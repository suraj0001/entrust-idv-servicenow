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
 * Update the oauth_entity / oauth_entity_profile / oauth_2_0_credentials / http_connection
 * chain backing the entrust_idv_api Connection & Credential alias. Does not create records —
 * the initial Connection & Credential must already exist (created once via
 * ConnectionAndCredentialHelper.createConnectionAndCredential); Save only updates it.
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
    // If earlier testing left duplicate connections behind, always update the newest one.
    connGr.orderByDesc('sys_created_on')
    connGr.query()
    if (!connGr.next()) {
        gs.error('[EntrustIDV] No http_connection linked to alias "' + ENTRUST_ALIAS_NAME + '" (alias sys_id ' + aliasSysId + ').')
        return {
            success: false,
            message:
                'No http_connection found linked to alias "' + ENTRUST_ALIAS_NAME + '" (alias sys_id ' +
                aliasSysId + '). Check the connection_alias field on http_connection.',
        }
    }

    const credentialRef = connGr.getValue('credential')
    const credGr = new GlideRecord('oauth_2_0_credentials')
    credGr.get(credentialRef)
    if (!credGr.isValidRecord()) {
        gs.error('[EntrustIDV] oauth_2_0_credentials lookup failed for http_connection.credential="' + credentialRef + '".')
        return {
            success: false,
            message:
                'Could not resolve oauth_2_0_credentials from http_connection.credential="' + credentialRef +
                '". The "credential" field name on http_connection may be wrong — check the actual reference field.',
        }
    }

    const profileRef = credGr.getValue('oauth_entity_profile')
    const profileGr = new GlideRecord('oauth_entity_profile')
    profileGr.get(profileRef)
    if (!profileGr.isValidRecord()) {
        gs.error('[EntrustIDV] oauth_entity_profile lookup failed for oauth_2_0_credentials.oauth_entity_profile="' + profileRef + '".')
        return {
            success: false,
            message:
                'Could not resolve oauth_entity_profile from oauth_2_0_credentials.oauth_entity_profile="' + profileRef + '".',
        }
    }

    const entityRef = profileGr.getValue('oauth_entity')
    const entityGr = new GlideRecord('oauth_entity')
    entityGr.get(entityRef)
    if (!entityGr.isValidRecord()) {
        gs.error('[EntrustIDV] oauth_entity lookup failed for oauth_entity_profile.oauth_entity="' + entityRef + '".')
        return {
            success: false,
            message:
                'Could not resolve oauth_entity from oauth_entity_profile.oauth_entity="' + entityRef + '".',
        }
    }
    entityGr.setValue('client_id', clientId)
    entityGr.setValue('client_secret', clientSecret)
    entityGr.setValue('token_url', tokenUrl)
    entityGr.update()

    // http_connection.connection_url is deliberately blocked from scoped-app writes by the
    // platform (prevents a compromised scoped app from redirecting a credentialed connection),
    // so we don't attempt it here — only report a mismatch for an admin to fix manually.
    const existingUrl = connGr.getValue('connection_url')
    if (existingUrl && existingUrl !== baseUrl) {
        gs.error('[EntrustIDV] http_connection.connection_url ("' + existingUrl + '") differs from the selected region\'s Base URL ("' + baseUrl + '") but cannot be updated from this scope.')
        return {
            success: true,
            message:
                'Credentials saved. Note: the connection\'s Base URL ("' + existingUrl + '") differs from "' +
                baseUrl + '" — ask an admin to update it directly on the http_connection record, as scoped ' +
                'apps cannot modify it.',
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
