/* eslint-disable */
/**
 * onLoad client script for incident — fetches IDV status from the verification request table.
 */
function onLoad() {
    var STATUS_LABELS = {
        'awaiting':       'Pending',
        'pending':        'Pending',
        'processing':     'In Process',
        'review':         'Review Required',
        'awaiting_input': 'Awaiting Input',
        'approved':       'Approved',
        'declined':       'Declined',
    };

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
            var label = STATUS_LABELS[status] || status;
            g_form.setValue('x_entru_entrustidv_idv_status', label);
            // A verification is already in progress — hide the button.
            g_ui_actions.setVisible('x_entru_entrustidv_verify_identity', false);
        }
    });
}
