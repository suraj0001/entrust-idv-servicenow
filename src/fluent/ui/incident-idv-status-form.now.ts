import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

const INCIDENT_MAIN_SECTION_ID = 'd121a50b6a704cf68ff01dab43bac003'

Record({
    $id: Now.ID[INCIDENT_MAIN_SECTION_ID],
    table: 'sys_ui_section',
    data: {
        header: false,
        name: 'incident',
        sys_domain: 'global',
        sys_domain_path: '/',
        title: true,
        view: 'NULL',
    },
})

Record({
    $id: Now.ID['d121a50b6a704cf68ff01dab43bac002'],
    table: 'sys_ui_element',
    data: {
        element: 'x_entru_entrustidv_verification_status',
        position: 4,
        sys_ui_section: INCIDENT_MAIN_SECTION_ID,
    },
})
