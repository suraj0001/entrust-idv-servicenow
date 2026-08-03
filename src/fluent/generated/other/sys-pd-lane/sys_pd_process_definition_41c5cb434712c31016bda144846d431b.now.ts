import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['218374889c745419824b5c329776bcce'],
    table: 'sys_pd_lane',
    data: {
        active: 'true',
        description: `Connect to your Entrust IDV tenant by entering your API credentials and Workflow ID. 
Test the connection to confirm everything is working before proceeding.`,
        label: 'Entrust IDV API Configurations',
        name: 'new_stage',
        order: '1',
        permission: '{}',
        process_definition: '41c5cb434712c31016bda144846d431b',
        restart_rule: 'RUN_ONLY_ONCE',
        start_rule_name: 'immediate',
    },
})
