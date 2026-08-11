(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        var handler = require('./src/server/webhook/idv-webhook-handler.ts');
        var result  = handler.handleWebhookEvent(request.body.data);

        // Always return 200 — non-success statuses are logged inside the handler.
        response.setStatus(200);
        response.setBody(result);
    } catch (e) {
        gs.error('[IDV_WEBHOOK] Unexpected error: ' + e);
        response.setStatus(200);
        response.setBody({ status: 'error', message: String(e) });
    }

})(request, response);