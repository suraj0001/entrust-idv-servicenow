import { Table, StringColumn, DateTimeColumn, ChoiceColumn, ReferenceColumn } from '@servicenow/sdk/core'

export const x_entru_entrustidv_verification_request = Table({
    allowWebServiceAccess: true,
    attributes: {
        enforce_dot_walk_cross_scope_access: true,
    },
    label: 'Entrust IDV Verification Request',
    name: 'x_entru_entrustidv_verification_request',
    schema: {
        incident: ReferenceColumn({
            label: 'Incident',
            referenceTable: 'incident',
        }),
        workflow_run_id: StringColumn({
            label: 'Workflow Run ID',
            mandatory: true,
            maxLength: 100,
        }),
        triggered_by: StringColumn({
            label: 'Triggered By',
            maxLength: 50,
        }),
        source_record_id: StringColumn({
            label: 'Source Record ID',
            maxLength: 100,
        }),
        completed_at: DateTimeColumn({
            label: 'Completed At',
        }),
        outcome: ChoiceColumn({
            dropdown: 'dropdown_with_none',
            label: 'Outcome',
            maxLength: 30,
        }),
        applicant_id: StringColumn({
            label: 'Applicant ID',
            mandatory: true,
            maxLength: 100,
        }),
        raw_webhook_payload: StringColumn({
            label: 'Raw Webhook Payload',
            maxLength: 4000,
        }),
        status: ChoiceColumn({
            dropdown: 'dropdown_with_none',
            label: 'Status',
            maxLength: 20,
        }),
        link_sent_to: StringColumn({
            label: 'Link Sent To',
            maxLength: 50,
        }),
    },
    createAccessControls: true,
})
