import '@servicenow/sdk/global'
import { ClientScript } from '@servicenow/sdk/core'

export const IdvStatusOnLoad = ClientScript({
    name: 'IDV Status - Load from Verification Request',
    table: 'incident',
    type: 'onLoad',
    active: true,
    description: 'Fetches the latest IDV status from x_entru_entrustidv_verification_request and displays it read-only on the incident form.',
    script: Now.include('../../server/ui-actions/idv-status-onload.client.js'),
})
