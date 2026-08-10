import { Acl } from '@servicenow/sdk/core'

Acl({
    $id: Now.ID['30863a721b1a0fd05fdb2f05604bcbc1'],
    description:
        'Allow delete for records in x_entru_entrustidv_verification_request, never (all ACL conditions are empty).',
    localOrExisting: 'Existing',
    type: 'record',
    operation: 'delete',
    table: 'x_entru_entrustidv_verification_request',
    script: `answer = gs.getSession().isLoggedIn();
if (!answer) {
    answer = gs.getProperty('glide.security.allow_unauth_roleless_acl', false);
}`,
})
