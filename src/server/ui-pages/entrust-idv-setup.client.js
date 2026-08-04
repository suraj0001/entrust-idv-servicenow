/* eslint-disable */
/**
 * Client-side JavaScript for the Entrust IDV Setup UI Page.
 * Handles region auto-fill, Test Connection, and Save.
 */

// Must mirror REGION_BASE_URLS in src/server/ajax/entrust-idv-setup.ts (browser JS can't import server modules).
var BASE_URLS = {
    us: 'https://api.us.onfido.com/v3.6',
    eu: 'https://api.eu.onfido.com/v3.6',
    ca: 'https://api.ca.onfido.com/v3.6',
}

// Pre-populate form fields from the server.
document.addEventListener('DOMContentLoaded', function () {
    var ga = new GlideAjax('EntrustIDVSetupAjax')
    ga.addParam('sysparm_name', 'getConfig')
    ga.getXMLAnswer(function (answer) {
        var config
        try { config = JSON.parse(answer) } catch (e) { config = null }
        if (!config || !config.success) return

        if (config.region) {
            document.getElementById('idv_region').value = config.region
        }
        if (config.baseUrl) {
            document.getElementById('idv_base_url').value = config.baseUrl
        }
        if (config.tokenUrl) {
            document.getElementById('idv_token_url').value = config.tokenUrl
        }
        if (config.workflowId) {
            document.getElementById('idv_workflow_id').value = config.workflowId
        }
        // If the connection was already tested and saved, Save can be used immediately.
        if (config.connectionTested) {
            document.getElementById('btn_save').disabled = false
        }
    })
})

document.getElementById('idv_region').addEventListener('change', function () {
    var base = BASE_URLS[this.value] || ''
    document.getElementById('idv_base_url').value = base
    document.getElementById('idv_token_url').value = base ? base + '/oauth/token' : ''
    _idvShowStatus('', '')
    _idvDisableSave()
})

// Any credential/config edit invalidates the last successful test — force a re-test before saving.
;['idv_client_id', 'idv_client_secret', 'idv_workflow_id'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', _idvDisableSave)
})

// Test Connection button
document.getElementById('btn_test').addEventListener('click', function () {
    var region = document.getElementById('idv_region').value.trim()
    var clientId = document.getElementById('idv_client_id').value.trim()
    var clientSecret = document.getElementById('idv_client_secret').value
    var btn = document.getElementById('btn_test')

    if (!region || !clientId || !clientSecret) {
        _idvShowStatus('error', 'Region, Client ID, and Client Secret are all required.')
        return
    }

    btn.disabled = true
    btn.textContent = 'Testing…'
    _idvShowStatus('', 'Connecting to Entrust IDV…')

    var ga = new GlideAjax('EntrustIDVSetupAjax')
    ga.addParam('sysparm_name', 'testConnection')
    ga.addParam('sysparm_client_id', clientId)
    ga.addParam('sysparm_client_secret', clientSecret)
    ga.addParam('sysparm_region', region)

    ga.getXMLAnswer(function (answer) {
        console.log('[EntrustIDV] testConnection raw answer:', answer)
        btn.disabled = false
        btn.textContent = 'Test Connection'

        var result
        try {
            result = JSON.parse(answer)
        } catch (e) {
            console.error('[EntrustIDV] testConnection: could not parse answer as JSON.', e)
            _idvShowStatus('error', '❌ Unexpected response from server.')
            return
        }

        if (result && result.success) {
            _idvShowStatus('success', '✅ ' + result.message)
            document.getElementById('btn_save').disabled = false
        } else {
            _idvShowStatus('error', '❌ ' + (result ? result.message : 'Unknown error.'))
            _idvDisableSave()
        }
    })
})

// Save button — only enabled after a successful Test Connection against the current field values.
document.getElementById('btn_save').addEventListener('click', function () {
    var region = document.getElementById('idv_region').value.trim()
    var baseUrl = document.getElementById('idv_base_url').value.trim()
    var tokenUrl = document.getElementById('idv_token_url').value.trim()
    var clientId = document.getElementById('idv_client_id').value.trim()
    var clientSecret = document.getElementById('idv_client_secret').value
    var workflowId = document.getElementById('idv_workflow_id').value.trim()
    var btn = this

    if (!region || !baseUrl || !tokenUrl || !clientId || !clientSecret || !workflowId) {
        _idvShowStatus('error', 'All fields are required.')
        return
    }

    btn.disabled = true
    btn.textContent = 'Saving…'
    _idvShowStatus('', 'Saving configuration…')

    var infoGa = new GlideAjax('EntrustIDVSetupAjax')
    infoGa.addParam('sysparm_name', 'getAliasInfo')
    infoGa.getXMLAnswer(function (infoAnswer) {
        console.log('[EntrustIDV] getAliasInfo raw answer:', infoAnswer)
        var info
        try {
            info = JSON.parse(infoAnswer)
        } catch (e) {
            console.error('[EntrustIDV] getAliasInfo: could not parse answer as JSON.', e)
            btn.disabled = false
            btn.textContent = 'Save'
            _idvShowStatus('error', '❌ Unexpected response from server.')
            return
        }

        if (!info || !info.success) {
            console.error('[EntrustIDV] getAliasInfo failed:', info)
            btn.disabled = false
            btn.textContent = 'Save'
            _idvShowStatus('error', '❌ ' + (info ? info.message : 'Unknown error.'))
            return
        }

        if (info.hasConnection) {
            _idvFinishSave(region, baseUrl, tokenUrl, clientId, clientSecret, workflowId, btn)
            return
        }

        // First-time setup — create the Connection & Credential via the platform's own
        // wizard helper instead of hand-rolling the record chain ourselves.
        var formData = {
            'connection.name': 'Entrust IDV Connection',
            'connection.connection_url': baseUrl,
            'credential.oauth_entity.client_id': clientId,
            'credential.oauth_entity.client_secret': clientSecret,
            'credential.oauth_entity.token_url': tokenUrl,
        }

        var ccGa = new GlideAjax('global.ConnectionAndCredentialHelper')
        ccGa.addParam('sysparm_name', 'createConnectionAndCredential')
        ccGa.addParam('sysparm_formData', JSON.stringify(formData))
        ccGa.addParam('sysparm_aliasSysID', info.aliasSysId)
        ccGa.getXMLAnswer(function (ccAnswer) {
            console.log('[EntrustIDV] createConnectionAndCredential raw answer:', ccAnswer)

            // This processor doesn't document a success payload, so only treat it as an
            // error when the answer clearly says so — anything else falls through to Save,
            // which will surface a specific failure if the connection/credential still isn't there.
            if (ccAnswer && /error|exception/i.test(ccAnswer)) {
                console.error('[EntrustIDV] createConnectionAndCredential returned an error:', ccAnswer)
                btn.disabled = false
                btn.textContent = 'Save'
                _idvShowStatus('error', '❌ Failed to create connection: ' + ccAnswer)
                return
            }

            _idvFinishSave(region, baseUrl, tokenUrl, clientId, clientSecret, workflowId, btn)
        })
    })
})

function _idvFinishSave(region, baseUrl, tokenUrl, clientId, clientSecret, workflowId, btn) {
    var ga = new GlideAjax('EntrustIDVSetupAjax')
    ga.addParam('sysparm_name', 'saveConfig')
    ga.addParam('sysparm_region', region)
    ga.addParam('sysparm_base_url', baseUrl)
    ga.addParam('sysparm_token_url', tokenUrl)
    ga.addParam('sysparm_client_id', clientId)
    ga.addParam('sysparm_client_secret', clientSecret)
    ga.addParam('sysparm_workflow_id', workflowId)

    ga.getXMLAnswer(function (answer) {
        console.log('[EntrustIDV] saveConfig raw answer:', answer)
        btn.textContent = 'Save'

        var result
        try {
            result = JSON.parse(answer)
        } catch (e) {
            console.error('[EntrustIDV] saveConfig: could not parse answer as JSON.', e)
            btn.disabled = false
            _idvShowStatus('error', '❌ Unexpected response from server.')
            return
        }

        if (result && result.success) {
            btn.disabled = false
            _idvShowStatus('success', '✅ ' + result.message)
        } else {
            btn.disabled = false
            _idvShowStatus('error', '❌ ' + (result ? result.message : 'Unknown error.'))
        }
    })
}

function _idvDisableSave() {
    document.getElementById('btn_save').disabled = true
}

function _idvShowStatus(type, message) {
    var box = document.getElementById('status_box')
    box.className = 'status' + (type ? ' ' + type : '')
    box.textContent = message
    box.style.display = message ? 'block' : 'none'
}
