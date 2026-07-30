import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'

export const EntrustSetupPage = UiPage({
    $id: Now.ID['entrust-setup-ui-page'],
    endpoint: 'x_entru_entrustidv_entrust_idv_setup.do',
    description: 'Getting Started setup page for Entrust Identity Verification.',
    direct: true,
    category: 'general',
    clientScript: Now.include('../../server/ui-pages/entrust-setup-client.js'),
})
