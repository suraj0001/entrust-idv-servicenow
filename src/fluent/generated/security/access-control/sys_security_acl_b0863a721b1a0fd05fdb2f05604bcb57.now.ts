import { Acl } from '@servicenow/sdk/core'

Acl({
    $id: Now.ID['b0863a721b1a0fd05fdb2f05604bcb57'],
    description:
        'Allow create for records in x_entru_entrustidv_verification_request, never (all ACL conditions are empty).',
    localOrExisting: 'Existing',
    type: 'record',
    operation: 'create',
    table: 'x_entru_entrustidv_verification_request',
    script: `answer = gs.getSession().isLoggedIn();
if (!answer) {
    answer = gs.getProperty('glide.security.allow_unauth_roleless_acl', false);
}`,
})
