import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['idv-status-ajax'],
    name: 'IdvStatusAjax',
    apiName: 'x_entru_entrustidv.IdvStatusAjax',
    description:
        'Returns the latest identity verification status for a source record.',
    script: Now.include('../../server/ui-actions/idv-status-ajax.server.js'),
    clientCallable: true,
    mobileCallable: false,
    sandboxCallable: false,
    accessibleFrom: 'package_private',
    active: true,
})
