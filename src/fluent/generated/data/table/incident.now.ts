import { Table, StringColumn } from '@servicenow/sdk/core'

export const incident = Table({
    augments: 'incident',
    schema: {
        x_entru_entrustidv_idv_status: StringColumn({
            label: 'IDV Status',
            maxLength: 100,
        }),
    },
})
