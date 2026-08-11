import { Acl } from '@servicenow/sdk/core'

Acl({
    $id: Now.ID['2d61f2f21bd60fd05fdb2f05604bcbd7'],
    description: 'Allow delete for records in x_entru_entrustidv_config, never (all ACL conditions are empty).',
    localOrExisting: 'Existing',
    type: 'record',
    operation: 'delete',
    table: 'x_entru_entrustidv_config',
    script: `answer = gs.getSession().isLoggedIn();
if (!answer) {
    answer = gs.getProperty('glide.security.allow_unauth_roleless_acl', false);
}`,
})
