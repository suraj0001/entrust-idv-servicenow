import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['e682c1fe196c676e71706da4f9f5cb06'],
    table: 'sys_pd_activity',
    data: {
        active: 'true',
        activity_definition: 'fcbbb246eb7331107626211f1a522853',
        ai_agent_execution_mode: 'off',
        ai_agent_run_as: 'playbook_user',
        description:
            'Configure the API connection that ServiceNow uses to communicate with Entrust Identity Verification.',
        enable_ai_agent: 'false',
        label: 'Configure Entrust API Credentials',
        lane: '218374889c745419824b5c329776bcce',
        name: 'iframe',
        order: '1',
        process_definition: '41c5cb434712c31016bda144846d431b',
        restart_rule: 'RUN_ALWAYS',
        start_rule_name: 'immediate',
    },
})
Record({
    $id: Now.ID['d2e8624a87891e006d7b8ff907860bd4'],
    table: 'sys_pd_activity',
    data: {
        active: 'true',
        activity_definition: 'fcbbb246eb7331107626211f1a522853',
        ai_agent_execution_mode: 'off',
        ai_agent_run_as: 'playbook_user',
        description: 'Configure how Entrust identity verification requests are created and delivered.',
        enable_ai_agent: 'false',
        label: 'Identity Verification Settings',
        lane: '218374889c745419824b5c329776bcce',
        name: 'iframe_1',
        order: '2',
        process_definition: '41c5cb434712c31016bda144846d431b',
        restart_rule: 'RUN_ONLY_ONCE',
        start_rule_name: 'after_items',
        starts_after_activities: 'e682c1fe196c676e71706da4f9f5cb06',
    },
})
