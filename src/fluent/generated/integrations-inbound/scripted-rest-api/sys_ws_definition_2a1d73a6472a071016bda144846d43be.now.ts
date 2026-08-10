import { RestApi } from '@servicenow/sdk/core'

RestApi({
    $id: Now.ID['2a1d73a6472a071016bda144846d43be'],
    name: 'IDV Webhook API',
    serviceId: 'idv_webhook_api',
    routes: [
        {
            $id: Now.ID['9b8d77e6472a071016bda144846d437e'],
            name: 'Receive Workflow Complete Event',
            consumes: 'application/json',
            method: 'POST',
            script: Now.include('./sys_ws_operation_9b8d77e6472a071016bda144846d437e.js'),
            produces: 'application/json',
            path: '/events',
            enforceAcl: [],
            authentication: false,
        },
    ],
})
