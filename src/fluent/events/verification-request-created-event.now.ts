import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

export const verificationCreatedEvent = Record({
    $id: Now.ID['verification-requested-created-event'],
    table: 'sysevent_register',
    data: {
        event_name:
            'x_entru_entrustidv.verification-request.created',
        table:
            'x_entru_entrustidv_verification_request',
        description:
            'Triggered after an Entrust identity verification workflow has been created.'
    }
})