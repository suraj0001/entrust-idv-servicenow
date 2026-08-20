import '@servicenow/sdk/global'
import { CrossScopePrivilege, Record } from '@servicenow/sdk/core'

// Scripting API access
CrossScopePrivilege({ $id: Now.ID['31feec671b52c3145fdb2f05604bcb6b'], operation: 'execute', status: 'allowed', targetName: 'Glide API: scripting',            targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['9b5030ab1b52c3145fdb2f05604bcbcf'], operation: 'execute', status: 'allowed', targetName: 'Glide API: string utilities',     targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['d78b88a447e6035016bda144846d4396'], operation: 'execute', status: 'allowed', targetName: 'Glide API: user roles and groups', targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['a35dadb9476e8f5016bda144846d43c8'], operation: 'execute', status: 'allowed', targetName: 'Glide API: event management',    targetScope: 'global', targetType: 'scriptable' })

// GlideRecord operations
CrossScopePrivilege({ $id: Now.ID['df5030ab1b52c3145fdb2f05604bcbd3'], operation: 'execute', status: 'allowed', targetName: 'GlideRecord.insert',      targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['575030ab1b52c3145fdb2f05604bcbb6'], operation: 'execute', status: 'allowed', targetName: 'GlideRecord.update',      targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['db5030ab1b52c3145fdb2f05604bcbb1'], operation: 'execute', status: 'allowed', targetName: 'GlideRecord.setValue',    targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['c590b5e01ba68f145fdb2f05604bcb89'], operation: 'execute', status: 'allowed', targetName: 'GlideRecord.setWorkflow', targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['3dfee0eb1b12c3145fdb2f05604bcb7d'], operation: 'execute', status: 'allowed', targetName: 'GlideRecord.deleteRecord', targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['0458c30f4712c31016bda144846d4349'], operation: 'execute', status: 'allowed', targetName: 'ScopedGlideElement',       targetScope: 'global', targetType: 'scriptable' })

// REST / HTTP client
CrossScopePrivilege({ $id: Now.ID['408b9017479ec31016bda144846d435a'], operation: 'execute', status: 'allowed', targetName: 'ScriptableRESTMessageClient.execute',                targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['4c8b5cd3479ec31016bda144846d4310'], operation: 'execute', status: 'allowed', targetName: 'ScriptableRESTMessageClient.setEndpoint',             targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['848b9017479ec31016bda144846d433d'], operation: 'execute', status: 'allowed', targetName: 'ScriptableRESTMessageClient.setHttpMethod',           targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['008b9017479ec31016bda144846d4356'], operation: 'execute', status: 'allowed', targetName: 'ScriptableRESTMessageClient.setHttpTimeout',          targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['c48b9017479ec31016bda144846d4341'], operation: 'execute', status: 'allowed', targetName: 'ScriptableRESTMessageClient.setRequestHeader',        targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['cc8b9017479ec31016bda144846d4351'], operation: 'execute', status: 'allowed', targetName: 'ScriptableRESTMessageClient.setRequestBody',          targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['e13dc8e847e6035016bda144846d43b7'], operation: 'execute', status: 'allowed', targetName: 'ScriptableRESTMessageClient.setAuthenticationProfile', targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['bce720341b2603545fdb2f05604bcbf1'], operation: 'execute', status: 'allowed', targetName: 'ScriptableRESTMessageClient.setRequestorProfile',      targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['188b9017479ec31016bda144846d4366'], operation: 'execute', status: 'allowed', targetName: 'ScriptableRESTResponse.getBody',        targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['948b9017479ec31016bda144846d435e'], operation: 'execute', status: 'allowed', targetName: 'ScriptableRESTResponse.haveError',       targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['d48b9017479ec31016bda144846d4362'], operation: 'execute', status: 'allowed', targetName: 'ScriptableRESTResponse.getStatusCode',   targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['af9b14d3475ec31016bda144846d43e8'], operation: 'execute', status: 'allowed', targetName: 'ScriptableRESTResponse.getErrorMessage', targetScope: 'global', targetType: 'scriptable' })

// Scripted REST API (webhook)
CrossScopePrivilege({ $id: Now.ID['24fc043247ea071016bda144846d43b0'], operation: 'execute', status: 'allowed', targetName: 'RESTAPIRequest',                    targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['ecfcc43247ea071016bda144846d4324'], operation: 'execute', status: 'allowed', targetName: 'RESTAPIRequestBody',                 targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['20fcc43247ea071016bda144846d4329'], operation: 'execute', status: 'allowed', targetName: 'ScriptableServiceResultBuilder.setStatus', targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['2cfcc43247ea071016bda144846d432c'], operation: 'execute', status: 'allowed', targetName: 'ScriptableServiceResultBuilder.setBody',   targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['f1feec671b52c3145fdb2f05604bcb6f'], operation: 'execute', status: 'allowed', targetName: 'ResourceSupport', targetScope: 'global', targetType: 'sys_script_include' })

// OAuth
CrossScopePrivilege({ $id: Now.ID['9a6de1681b668f145fdb2f05604bcbaa'], operation: 'execute', status: 'allowed', targetName: 'GlideOAuthClient.requestToken',         targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['9c3ae5601b668f145fdb2f05604bcbe2'], operation: 'execute', status: 'allowed', targetName: 'GlideOAuthClient.getToken',             targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['2e6d69a81b668f145fdb2f05604bcb21'], operation: 'execute', status: 'allowed', targetName: 'GlideOAuthClientResponse.getToken',     targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['566d69a81b668f145fdb2f05604bcb1c'], operation: 'execute', status: 'allowed', targetName: 'GlideOAuthClientResponse.getBody',      targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['5e6d29a81b668f145fdb2f05604bcbbf'], operation: 'execute', status: 'allowed', targetName: 'GlideOAuthClientResponse.getErrorMessage', targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['966d29a81b668f145fdb2f05604bcbba'], operation: 'execute', status: 'allowed', targetName: 'GlideOAuthClientResponse.getResponseCode', targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['d43a69601b668f145fdb2f05604bcbf4'], operation: 'execute', status: 'allowed', targetName: 'GlideOAuthToken.getAccessToken', targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['4590f5201ba68f145fdb2f05604bcbd3'], operation: 'execute', status: 'allowed', targetName: 'GlideOAuthToken.getExpiresIn',  targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['0cd4a9a01b268f145fdb2f05604bcbc7'], operation: 'execute', status: 'allowed', targetName: 'ScriptableConnectionInfo.getAttribute',            targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['7bc469a01b268f145fdb2f05604bcb53'], operation: 'execute', status: 'allowed', targetName: 'ScriptableConnectionInfoProvider.getConnectionInfo', targetScope: 'global', targetType: 'scriptable' })
CrossScopePrivilege({ $id: Now.ID['833814a34796871016bda144846d43b5'], operation: 'execute', status: 'allowed', targetName: 'ConnectionAndCredentialHelper', targetScope: 'global', targetType: 'sys_script_include' })

// Email (VerificationEmailService)
CrossScopePrivilege({ $id: Now.ID['cross-scope-email-outbound'], operation: 'execute', status: 'allowed', targetName: 'GlideEmailOutbound', targetScope: 'global', targetType: 'scriptable' })

// Webhook HMAC signature verification (IdvWebhookSignatureVerifier)
CrossScopePrivilege({ $id: Now.ID['cross-scope-certificate-encryption'], operation: 'execute', status: 'allowed', targetName: 'GlideCertificateEncryption', targetScope: 'global', targetType: 'scriptable' })

// Table read / write access
CrossScopePrivilege({ $id: Now.ID['693dc4e847e6035016bda144846d4320'], operation: 'read',   status: 'allowed', targetName: 'sys_user',              targetScope: 'global', targetType: 'sys_db_object' })
CrossScopePrivilege({ $id: Now.ID['6b9f04eb4716871016bda144846d4361'], operation: 'read',   status: 'allowed', targetName: 'sys_alias',             targetScope: 'global', targetType: 'sys_db_object' })
CrossScopePrivilege({ $id: Now.ID['6f9f04eb4716871016bda144846d4367'], operation: 'read',   status: 'allowed', targetName: 'http_connection',       targetScope: 'global', targetType: 'sys_db_object' })
CrossScopePrivilege({ $id: Now.ID['cross-scope-http-connection-write'], operation: 'write',  status: 'allowed', targetName: 'http_connection',       targetScope: 'global', targetType: 'sys_db_object' })
CrossScopePrivilege({ $id: Now.ID['573858a34796871016bda144846d43e4'], operation: 'read',   status: 'allowed', targetName: 'oauth_entity',          targetScope: 'global', targetType: 'sys_db_object' })
CrossScopePrivilege({ $id: Now.ID['902d60631b52c3145fdb2f05604bcbd1'], operation: 'read',   status: 'allowed', targetName: 'oauth_entity_profile',  targetScope: 'global', targetType: 'sys_db_object' })
CrossScopePrivilege({ $id: Now.ID['5f38d06f4756871016bda144846d4326'], operation: 'read',   status: 'allowed', targetName: 'oauth_2_0_credentials', targetScope: 'global', targetType: 'sys_db_object' })
CrossScopePrivilege({ $id: Now.ID['6be20da7475e871016bda144846d436a'], operation: 'read',   status: 'allowed', targetName: 'sys_db_object',         targetScope: 'global', targetType: 'sys_db_object' })
CrossScopePrivilege({ $id: Now.ID['23e20da7475e871016bda144846d4373'], operation: 'read',   status: 'allowed', targetName: 'sys_scope_privilege',   targetScope: 'global', targetType: 'sys_db_object' })

// Incident
CrossScopePrivilege({ $id: Now.ID['dec13827479a871016bda144846d43a5'], operation: 'read',   status: 'allowed', targetName: 'incident', targetScope: 'global', targetType: 'sys_db_object' })
CrossScopePrivilege({ $id: Now.ID['1342b8a7479a871016bda144846d4352'], operation: 'write',  status: 'allowed', targetName: 'incident', targetScope: 'global', targetType: 'sys_db_object' })
CrossScopePrivilege({ $id: Now.ID['0762fca7479a871016bda144846d4363'], operation: 'create', status: 'allowed', targetName: 'incident', targetScope: 'global', targetType: 'sys_db_object' })

// HR Case (HrCaseAdapter)
CrossScopePrivilege({ $id: Now.ID['cross-scope-hr-case-read'],  operation: 'read',  status: 'allowed', targetName: 'sn_hr_core_case', targetScope: 'sn_hr_core', targetType: 'sys_db_object' })
CrossScopePrivilege({ $id: Now.ID['cross-scope-hr-case-write'], operation: 'write', status: 'allowed', targetName: 'sn_hr_core_case', targetScope: 'sn_hr_core', targetType: 'sys_db_object' })

// Design access (allows this scope to load platform records from target package)
Record({
    $id: Now.ID['019aa463475a871016bda144846d43f5'],
    table: 'sys_scope_design_access',
    data: {
        source_scope: '307c9ef21bd20fd05fdb2f05604bcbf7',
        target_package: '253a221f1b83121067b6653b234bcb6a',
    },
})
