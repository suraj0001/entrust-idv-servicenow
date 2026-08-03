import { Table, ChoiceColumn, ReferenceColumn } from '@servicenow/sdk/core'

export const incident = Table({
    augments: 'incident',
    schema: {
        x_entru_entrustidv_idv_status: ChoiceColumn({
            dropdown: 'dropdown_with_none',
            label: 'IDV Status',
            maxLength: 100,
        }),
        x_entru_entrustidv_idv_outcome: ChoiceColumn({
            dropdown: 'dropdown_with_none',
            label: 'IDV Outcome',
        }),
        x_entru_entrustidv_idv_verification: ReferenceColumn({
            label: 'IDV Verification',
            referenceTable: 'x_entru_entrustidv_verification_request',
        }),
    },
})
