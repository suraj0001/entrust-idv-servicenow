import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
   $id: Now.ID['verification-settings-ajax'],
   name: 'VerificationSettingsAjax',
   apiName: 'x_entru_entrustidv.VerificationSettingsAjax',
   description: 'GlideAjax bridge for the Verification Settings setup page.',
   script: Now.include(
       '../../../server/setup/verification-settings-ajax.server.js'
   ),
   clientCallable: true,
   mobileCallable: false,
   sandboxCallable: false,
   accessibleFrom: 'package_private',
   active: true,
})