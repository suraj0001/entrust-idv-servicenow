import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const EntrustIDVSetupAjaxSI = ScriptInclude({
    $id: Now.ID['entrust-setup-ajax-si'],
    name: 'EntrustIDVSetupAjax',
    active: true,
    // Client-callable so the Getting Started page can invoke it via GlideAjax.
    clientCallable: true,
    accessibleFrom: 'package_private',
    description: 'Setup helper for the Entrust IDV Getting Started page. Provides testConnection().',
    script: Now.include('../../server/ui-pages/EntrustIDVSetupAjax.js'),
})

