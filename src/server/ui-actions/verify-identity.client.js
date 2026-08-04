/* eslint-disable */
/**
 * Client-side onClick handler for the incident "Verify Identity" UI Action.
 * Runs in the browser (Client = true); calls the scoped GlideAjax bridge.
 */
function x_entru_idvVerifyIdentity() {
    if (!confirm('Start Entrust identity verification for this incident?')) {
        return;
    }

    var ga = new GlideAjax('x_entru_entrustidv.EntrustIDVVerifyAjax');
    ga.addParam('sysparm_name', 'startVerification');
    ga.addParam('sysparm_incident_id', g_form.getUniqueValue());
    ga.getXMLAnswer(function (answer) {
        var result;
        try {
            result = JSON.parse(answer);
        } catch (e) {
            g_form.addErrorMessage('Unexpected response from server.');
            return;
        }

        if (result && result.success) {
            var msg = result.message || 'Identity verification started.';
            if (result.linkUrl) {
                msg += ' <a href="' + result.linkUrl + '" target="_blank" rel="noopener noreferrer">Open Smart Capture Link</a>';
            }
            g_form.addInfoMessage(msg);
        } else {
            g_form.addErrorMessage((result && result.message) || 'Could not start identity verification.');
        }
    });
}
