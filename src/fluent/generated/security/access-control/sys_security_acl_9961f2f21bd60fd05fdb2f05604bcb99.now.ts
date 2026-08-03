import { Acl } from '@servicenow/sdk/core'

Acl({
    $id: Now.ID['9961f2f21bd60fd05fdb2f05604bcb99'],
    description: 'Allow read for records in x_entru_entrustidv_config, never (all ACL conditions are empty).',
    localOrExisting: 'Existing',
    type: 'record',
    operation: 'read',
    table: 'x_entru_entrustidv_config',
})
