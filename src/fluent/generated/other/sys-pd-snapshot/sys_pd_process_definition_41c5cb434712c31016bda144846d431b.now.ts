import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['1603f3dc1b224f145fdb2f05604bcb8a'],
    table: 'sys_pd_snapshot',
    data: {
        access: 'public',
        derivatives:
            '{"table":"sys_pd_snapshot","id":"1603f3dc1b224f145fdb2f05604bcb8a","name":"derivatives","type":"com.snc.pd.model.serialization.DerivativeFetcher"}',
        name: 'entrust_identity_verification_setup',
        process_definition:
            '{"table":"sys_pd_snapshot","id":"1603f3dc1b224f145fdb2f05604bcb8a","name":"process_definition","type":"com.snc.pd.model.ProcessDefinition"}',
        process_dependencies:
            '{"table":"sys_pd_snapshot","id":"1603f3dc1b224f145fdb2f05604bcb8a","name":"process_dependencies","type":"com.snc.pd.model.dependency.InstructionBasedProcessDependenciesCollection"}',
        process_plan:
            '{"table":"sys_pd_snapshot","id":"1603f3dc1b224f145fdb2f05604bcb8a","name":"process_plan","type":"com.snc.process_flow.engine.ProcessPlan"}',
        source: '41c5cb434712c31016bda144846d431b',
    },
})
