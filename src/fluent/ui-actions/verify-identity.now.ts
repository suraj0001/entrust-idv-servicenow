import '@servicenow/sdk/global'
import { UiAction } from '@servicenow/sdk/core'

export const VerifyIdentityUiAction = UiAction({
    $id: Now.ID['verify-identity-ui-action'],
    table: 'incident',
    name: 'Verify Identity',
    actionName: 'x_entru_entrustidv_verify_identity',
    active: true,
    order: 100,
    form: {
        showButton: true,
        style: 'unstyled',
    },
    client: {
        isClient: true,
        onClick: 'x_entru_idvVerifyIdentity()',
    },
    showInsert: false,
    showUpdate: true,
    script: Now.include('../../server/ui-actions/verify-identity.client.js'),
    roles: ['x_entru_entrustidv.agent', 'admin'],
    comments: 'Starts an Entrust identity verification for the incident.',
})
