/* eslint-disable */
/**
 * onLoad client script for incident — fetches IDV status from the verification request table.
 */
function onLoad() {
    var STATUS_LABELS = {
        awaiting: 'Pending',
        pending: 'Pending',
        processing: 'In Process',
        review: 'Review Required',
        awaiting_input: 'Awaiting Input',
        awaiting_client_input: 'Awaiting Customer Input',
        approved: 'Approved',
        declined: 'Declined',
        abandoned: 'Abandoned',
        error: 'Error',
    }

    var STATUS_FIELD = 'x_entru_entrustidv_idv_status'

    function applyStatus(rawStatus) {
        var label = STATUS_LABELS[rawStatus] || rawStatus
        g_form.setValue(STATUS_FIELD, label)
        g_ui_actions.setVisible('Verify Identity', false)
    }

    var incidentId = g_form.getUniqueValue()

    g_form.setReadOnly(STATUS_FIELD, true)

    // Apply label mapping synchronously if the field already has a value on the record.
    var existingStatus = g_form.getValue(STATUS_FIELD)
    if (existingStatus) {
        applyStatus(existingStatus)
    }

    if (!incidentId) {
        return
    }

    // Ajax call gets the freshest status from the verification request table.
    var ga = new GlideAjax('x_entru_entrustidv.IdvStatusAjax')
    ga.addParam('sysparm_name', 'getLatestStatus')
    ga.addParam('sysparm_source_table', 'incident')
    ga.addParam('sysparm_source_record_id', incidentId)
    ga.getXMLAnswer(function (status) {
        if (status) {
            applyStatus(status)
        }
    })
}
