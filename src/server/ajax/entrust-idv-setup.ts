import { gs } from '@servicenow/glide'
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
