import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['d203f3dc1b224f145fdb2f05604bcb88'],
    table: 'sys_trigger_runner_mapping',
    data: {
        active: 'true',
        data: '{"trigger_on_unique_change":"false","parent_record":{"elementMapping":"{{triggerRecord}}","variableValue":"{{triggerRecord}}","elementMappingOrVariableValue":"{{triggerRecord}}"},"run_trigger":"run_once"}',
        identifier: '81c5cb434712c31016bda144846d431b',
        identifier_type: 'playbook',
        runner: 'PDTriggerRunner',
        trigger: '1e03f3dc1b224f145fdb2f05604bcb86',
    },
})
Record({
    $id: Now.ID['1e03f3dc1b224f145fdb2f05604bcb86'],
    table: 'sys_flow_record_trigger',
    data: {
        active: 'true',
        condition: 'guidance.process_definition=41c5cb434712c31016bda144846d431b',
        on_delete: 'false',
        on_insert: 'true',
        on_update: 'true',
        run_flow_in: 'background',
        run_on_extended: 'false',
        run_when_setting: 'both',
        run_when_user_setting: 'any',
        sys_domain: 'global',
        sys_domain_path: '/',
        table: 'help_user_interaction',
    },
})
Record({
    $id: Now.ID['25a6257c1bae03545fdb2f05604bcb8f'],
    table: 'sys_trigger_runner_mapping',
    data: {
        active: 'true',
        data: '{"trigger_on_unique_change":"false","parent_record":{"elementMapping":"{{triggerRecord}}","variableValue":"{{triggerRecord}}","elementMappingOrVariableValue":"{{triggerRecord}}"},"run_trigger":"run_once"}',
        identifier: '81c5cb434712c31016bda144846d431b',
        identifier_type: 'playbook',
        runner: 'PDTriggerRunner',
        trigger: 'eda6257c1bae03545fdb2f05604bcb8d',
    },
})
Record({
    $id: Now.ID['eda6257c1bae03545fdb2f05604bcb8d'],
    table: 'sys_flow_record_trigger',
    data: {
        active: 'true',
        condition: 'guidance.process_definition=41c5cb434712c31016bda144846d431b',
        on_delete: 'false',
        on_insert: 'true',
        on_update: 'true',
        run_flow_in: 'background',
        run_on_extended: 'false',
        run_when_setting: 'both',
        run_when_user_setting: 'any',
        sys_domain: 'global',
        sys_domain_path: '/',
        table: 'help_user_interaction',
    },
})
Record({
    $id: Now.ID['71e942f04726075016bda144846d4314'],
    table: 'sys_trigger_runner_mapping',
    data: {
        active: 'true',
        data: '{"trigger_on_unique_change":"false","parent_record":{"elementMapping":"{{triggerRecord}}","variableValue":"{{triggerRecord}}","elementMappingOrVariableValue":"{{triggerRecord}}"},"run_trigger":"run_once"}',
        identifier: '81c5cb434712c31016bda144846d431b',
        identifier_type: 'playbook',
        runner: 'PDTriggerRunner',
        trigger: '3de942f04726075016bda144846d4312',
    },
})
Record({
    $id: Now.ID['3de942f04726075016bda144846d4312'],
    table: 'sys_flow_record_trigger',
    data: {
        active: 'true',
        condition: 'guidance.process_definition=41c5cb434712c31016bda144846d431b',
        on_delete: 'false',
        on_insert: 'true',
        on_update: 'true',
        run_flow_in: 'background',
        run_on_extended: 'false',
        run_when_setting: 'both',
        run_when_user_setting: 'any',
        sys_domain: 'global',
        sys_domain_path: '/',
        table: 'help_user_interaction',
    },
})
