import { RestApi } from '@servicenow/sdk/core'

RestApi({
    $id: Now.ID['618fbefe1b5a0fd05fdb2f05604bcbf5'],
    name: 'Entrust IDV Webhook',
    serviceId: 'entrust_idv_webhook',
    routes: [
        {
            $id: Now.ID['5fef72721b9a0fd05fdb2f05604bcb20'],
            name: 'Receive Result',
            consumes: 'application/json,application/xml,text/xml',
            method: 'POST',
            script: Now.include('./sys_ws_operation_5fef72721b9a0fd05fdb2f05604bcb20.js'),
            produces: 'application/json,application/xml,text/xml',
            path: '/result',
            enforceAcl: [],
        },
    ],
})
