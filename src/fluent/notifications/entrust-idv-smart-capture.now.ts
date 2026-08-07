import '@servicenow/sdk/global'
import { EmailNotification, Record } from '@servicenow/sdk/core'

const SMART_CAPTURE_EVENT = 'x_entru_entrustidv.smart_capture.created'

export const SmartCaptureEvent = Record({
    $id: Now.ID['entrust-idv-smart-capture-event'],
    table: 'sysevent_register',
    data: {
        event_name: SMART_CAPTURE_EVENT,
        table: 'incident',
        description: 'An Entrust IDV Smart Capture link is ready for delivery.',
    },
})

export const SmartCaptureEmailNotification = EmailNotification({
    $id: Now.ID['entrust-idv-smart-capture-email'],
    table: 'incident',
    name: 'Entrust IDV Smart Capture Link',
    description:
        'Send an Entrust IDV Smart Capture link to the incident caller.',
    active: true,
    triggerConditions: {
        generationType: 'event',
        eventName: SMART_CAPTURE_EVENT,
    },
    recipientDetails: {
        recipientFields: ['caller_id'],
        sendToCreator: false,
    },
    emailContent: {
        subject: 'Complete identity verification for incident ${number}',
        messageHtml: `<p>Hello \${caller_id.first_name},</p>
            <p>Please use the secure link below to complete your identity verification for incident <strong>\${number}</strong>.</p>
            <p><a href="\${event.parm1}">Start identity verification</a></p>
            <p>Do not forward or share this link.</p>`,
        omitWatermark: true,
        forceDelivery: true,
    },
})
