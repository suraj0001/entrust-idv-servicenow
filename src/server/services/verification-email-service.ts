import { GlideRecord } from '@servicenow/glide'

export interface VerificationEmailRequest {
    recipientEmail: string
    firstName: string
    smartCaptureUrl: string
    linkExpiryMinutes: number
}

export function queueVerificationEmail(
    input: VerificationEmailRequest
): boolean {

    if (!input.recipientEmail || !input.smartCaptureUrl) {
        return false
    }

    const email = new GlideRecord('sys_email')
    email.initialize()

    email.setValue(
        'type',
        'send-ready'
    )

    email.setValue(
        'recipients',
        input.recipientEmail
    )

    email.setValue(
        'subject',
        'Complete your identity verification'
    )

    email.setValue(
        'body_text',
        buildEmailBody(input)
    )

    const emailSysId = email.insert()

    return !!emailSysId
}

function buildEmailBody(
    input: VerificationEmailRequest
): string {

    return (
        'Hello ' + input.firstName + ',\n\n' +

        'Please complete your identity verification using the secure link below:\n\n' +

        input.smartCaptureUrl + '\n\n' +

        'This link will expire in ' +
        input.linkExpiryMinutes +
        ' minutes.\n\n' +

        'If you did not expect this identity verification request, ' +
        'please contact your support team.\n\n' +

        'Thank you.'
    )
}