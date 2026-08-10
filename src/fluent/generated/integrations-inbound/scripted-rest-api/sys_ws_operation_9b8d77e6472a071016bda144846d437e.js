(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var body = request.body.data;

    // The actual payload is nested under body.payload
    var payload = body.payload;

    if (!payload || !payload.resource) {
        gs.error('[IDV_WEBHOOK] Invalid or missing payload: ' + JSON.stringify(body));
        response.setStatus(400);
        response.setBody({ status: 'error', message: 'Invalid payload structure' });
        return;
    }

    var resource = payload.resource;
    var object   = payload.object;

    gs.info(
        '[IDV_WEBHOOK] action='         + payload.action +
        ', resourceType='               + payload.resource_type +
        ', workflowRunId='              + resource.id +
        ', applicantId='                + resource.applicant_id +
        ', workflowId='                 + resource.workflow_id +
        ', status='                     + resource.status +
        ', workflowOutput='             + resource.output.workflow_output +
        ', completedAt='                + object.completed_at_iso8601
    );

    response.setStatus(200);
    response.setBody({ status: 'success' });

})(request, response);