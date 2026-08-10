/* eslint-disable */
/**
 * onLoad client script for incident — fetches IDV status from the verification request table.
 */
function onLoad() {
    var incidentId = g_form.getUniqueValue();

    g_form.setReadOnly('x_entru_entrustidv_idv_status', true);

    if (!incidentId) {
        return;
    }

    var ga = new GlideAjax('x_entru_entrustidv.EntrustIDVVerifyAjax');
    ga.addParam('sysparm_name', 'getIdvStatus');
    ga.addParam('sysparm_incident_id', incidentId);
    ga.getXMLAnswer(function (status) {
        if (status) {
            g_form.setValue('x_entru_entrustidv_idv_status', status);
        }
    });
}
