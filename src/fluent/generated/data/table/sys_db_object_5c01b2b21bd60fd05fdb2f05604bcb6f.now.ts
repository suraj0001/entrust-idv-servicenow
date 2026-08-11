import { Table, StringColumn, Password2Column, ChoiceColumn, IntegerColumn, BooleanColumn } from '@servicenow/sdk/core'

export const x_entru_entrustidv_config = Table({
    allowWebServiceAccess: true,
    attributes: {
        enforce_dot_walk_cross_scope_access: true,
    },
    label: 'Entrust IDV Config',
    name: 'x_entru_entrustidv_config',
    schema: {
        default_workflow_id: StringColumn({
            label: 'Default Workflow Id',
            maxLength: 100,
        }),
        webhook_secret: Password2Column({
            label: 'Webhook Secret',
            maxLength: 256,
        }),
        delivery_channel: ChoiceColumn({
            default: 'email',
            dropdown: 'dropdown_with_none',
            label: 'Delivery Channel',
            mandatory: true,
        }),
        region: StringColumn({
            label: 'Region',
            mandatory: true,
            maxLength: 10,
        }),
        link_expiry_minutes: IntegerColumn({
            label: 'Link Expiry Minutes',
        }),
        connection_tested: BooleanColumn({
            default: false,
            label: 'Connection Tested',
        }),
        active: BooleanColumn({
            default: true,
            label: 'Active',
        }),
    },
    createAccessControls: true,
})
