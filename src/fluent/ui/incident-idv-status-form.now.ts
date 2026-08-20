import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

const INCIDENT_IDV_SECTION_ID = 'd121a50b6a704cf68ff01dab43bac001'

Record({
    $id: Now.ID[INCIDENT_IDV_SECTION_ID],
    table: 'sys_ui_section',
    data: {
        caption: 'Identity Verification',
        header: false,
        name: 'incident',
        sys_domain: 'global',
        sys_domain_path: '/',
        title: true,
        view: 'NULL',
    },
})

Record({
    $id: Now.ID['d121a50b6a704cf68ff01dab43bac004'],
    table: 'sys_ui_element',
    data: {
        element: 'x_entru_entrustidv_idv_status',
        position: 0,
        sys_ui_section: INCIDENT_IDV_SECTION_ID,
    },
})
