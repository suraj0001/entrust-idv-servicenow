import '@servicenow/sdk/global'
import { ClientScript } from '@servicenow/sdk/core'

export const IdvStatusOnLoad = ClientScript({
    $id: Now.ID['idv-status-onload-cs'],
    name: 'IDV Status - Load from Verification Request',
    table: 'incident',
    type: 'onLoad',
    active: false, // TODO: re-activate once EntrustIDVVerifyAjax bridge is re-implemented
    script: Now.include('../../server/ui-actions/idv-status-onload.client.js'),
})
