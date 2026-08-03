(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // 1. Get raw body string and signature header
    var rawBody = request.body.dataString;
    var signatureHex = request.headers['x-sha2-signature'];

    if (!signatureHex) {
        gs.warn('Entrust IDV Webhook: Missing x-sha2-signature header');
        response.setStatus(401);
        response.setBody({ error: 'Missing signature' });
        return;
    }

    if (!rawBody) {
        gs.warn('Entrust IDV Webhook: Empty body received');
        response.setStatus(400);
        response.setBody({ error: 'Empty body' });
        return;
    }

    // 2. STUB: Signature verification
    // TODO: Replace with WebhookValidator.verify(rawBody, signatureHex, webhookSecret)
    gs.info('Entrust IDV Webhook: Signature header received - ' + signatureHex);

    // 3. Parse body
    var body;
    try {
        body = JSON.parse(rawBody);
    } catch (e) {
        gs.error('Entrust IDV Webhook: Failed to parse JSON - ' + e.message);
        response.setStatus(400);
        response.setBody({ error: 'Invalid JSON' });
        return;
    }

    // 4. Check event type
    var action = body && body.payload && body.payload.action;
    gs.info('Entrust IDV Webhook: Received event - ' + action);

    if (action !== 'workflow_run.completed') {
        // Acknowledge but ignore other events
        response.setStatus(200);
        response.setBody({ received: true, processed: false });
        return;
    }

    // 5. STUB: Route to handler
    // TODO: Replace with WebhookHandler.processWorkflowCompleted(body)
    var workflowRunId = body.payload.object && body.payload.object.id;
    gs.info('Entrust IDV Webhook: workflow_run.completed for run - ' + workflowRunId);

    response.setStatus(200);
    response.setBody({ received: true, processed: true });

})(request, response);