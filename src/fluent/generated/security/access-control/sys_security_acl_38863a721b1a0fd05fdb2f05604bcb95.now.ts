import { Acl } from '@servicenow/sdk/core'

Acl({
    $id: Now.ID['38863a721b1a0fd05fdb2f05604bcb95'],
    description:
        'Allow write for records in x_entru_entrustidv_verification_request, never (all ACL conditions are empty).',
    localOrExisting: 'Existing',
    type: 'record',
    operation: 'write',
    table: 'x_entru_entrustidv_verification_request',
})
