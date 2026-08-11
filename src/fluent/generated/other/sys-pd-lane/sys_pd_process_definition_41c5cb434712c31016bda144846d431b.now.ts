import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['218374889c745419824b5c329776bcce'],
    table: 'sys_pd_lane',
    data: {
        active: 'true',
        description:
            'Configure the core settings required to connect ServiceNow with Identity Verification and enable verification workflows.',
        label: 'Entrust IDV Setup',
        name: 'new_stage',
        order: '1',
        permission: '{}',
        process_definition: '41c5cb434712c31016bda144846d431b',
        restart_rule: 'RUN_ONLY_ONCE',
        start_rule_name: 'immediate',
    },
})
