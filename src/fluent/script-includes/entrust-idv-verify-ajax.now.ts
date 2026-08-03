import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const EntrustIDVVerifyAjaxSI = ScriptInclude({
    $id: Now.ID['entrust-verify-ajax-si'],
    name: 'EntrustIDVVerifyAjax',
    active: true,
    // Client-callable so the incident "Verify Identity" UI Action can invoke it via GlideAjax.
    clientCallable: true,
    accessibleFrom: 'package_private',
    description: 'Starts an Entrust IDV verification for an incident. Provides startVerification().',
    script: Now.include('../../server/ajax/EntrustIDVVerifyAjax.js'),
})
