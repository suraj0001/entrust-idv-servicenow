/* eslint-disable */
/**
 * Client-side JavaScript for the Entrust IDV Setup UI Page.
 * Handles region auto-fill and Test Connection via GlideAjax.
 */

// Must mirror REGION_BASE_URLS in src/server/ajax/entrust-idv-setup.ts (browser JS can't import server modules).
var BASE_URLS = {
    us: 'https://api.us.onfido.com/v3.6',
    eu: 'https://api.eu.onfido.com/v3.6',
    ca: 'https://api.ca.onfido.com/v3.6'
};

// Auto-fill Base URL and Token URL when region changes
document.getElementById('idv_region').addEventListener('change', function () {
    var base = BASE_URLS[this.value] || '';
    document.getElementById('idv_base_url').value  = base;
    document.getElementById('idv_token_url').value = base ? base + '/oauth/token' : '';
    _idvShowStatus('', '');
});

// Test Connection button
document.getElementById('btn_test').addEventListener('click', function () {
    var region       = document.getElementById('idv_region').value.trim();
    var clientId     = document.getElementById('idv_client_id').value.trim();
    var clientSecret = document.getElementById('idv_client_secret').value;
    var btn          = document.getElementById('btn_test');

    if (!region || !clientId || !clientSecret) {
        _idvShowStatus('error', 'Region, Client ID, and Client Secret are all required.');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Testing…';
    _idvShowStatus('', 'Connecting to Entrust IDV…');

    var ga = new GlideAjax('EntrustIDVSetupAjax');
    ga.addParam('sysparm_name', 'testConnection');
    ga.addParam('sysparm_client_id', clientId);
    ga.addParam('sysparm_client_secret', clientSecret);
    ga.addParam('sysparm_region', region);

    ga.getXMLAnswer(function (answer) {
        btn.disabled = false;
        btn.textContent = 'Test Connection';

        var result;
        try {
            result = JSON.parse(answer);
        } catch (e) {
            _idvShowStatus('error', '❌ Unexpected response from server.');
            return;
        }

        if (result && result.success) {
            _idvShowStatus('success', '✅ ' + result.message);
        } else {
            _idvShowStatus('error', '❌ ' + (result ? result.message : 'Unknown error.'));
        }
    });
});

function _idvShowStatus(type, message) {
    var box = document.getElementById('status_box');
    box.className = 'status' + (type ? ' ' + type : '');
    box.textContent = message;
    box.style.display = message ? 'block' : 'none';
}
