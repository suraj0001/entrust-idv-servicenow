/* eslint-disable */
/**
 * onLoad client script for incident — fetches IDV status from the verification request table.
 */
function onLoad() {
  var STATUS_LABELS = {
    awaiting: "Pending",
    pending: "Pending",
    processing: "In Process",
    review: "Review Required",
    awaiting_input: "Awaiting Input",
    approved: "Approved",
    declined: "Declined",
  };

  function applyStatus(rawStatus) {
    var label = STATUS_LABELS[rawStatus] || rawStatus;
    g_form.setValue("x_entru_entrustidv_idv_status", label);
    g_ui_actions.setVisible("Verify Identity", false);
  }

  var incidentId = g_form.getUniqueValue();

  g_form.setReadOnly("x_entru_entrustidv_idv_status", true);

  // Apply label mapping synchronously if the field already has a value on the record.
  var existingStatus = g_form.getValue("x_entru_entrustidv_idv_status");
  if (existingStatus) {
    applyStatus(existingStatus);
  }

  if (!incidentId) {
    return;
  }

  // Ajax call gets the freshest status from the verification request table.
  var ga = new GlideAjax("x_entru_entrustidv.EntrustIDVVerifyAjax");
  ga.addParam("sysparm_name", "getIdvStatus");
  ga.addParam("sysparm_incident_id", incidentId);
  ga.getXMLAnswer(function (status) {
    if (status) {
      applyStatus(status);
    }
  });
}
