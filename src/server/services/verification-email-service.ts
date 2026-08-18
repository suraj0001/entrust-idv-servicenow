// GlideEmailOutbound is not in @servicenow/glide stubs
declare const GlideEmailOutbound: any

export function sendVerificationLinkEmail(
    toEmail: string,
    firstName: string,
    smartCaptureUrl: string,
): void {
    const email = new GlideEmailOutbound()
    email.setTo(toEmail)
    email.setSubject('Action Required: Complete Your Identity Verification')
    email.setBody(
        'Hello ' + firstName + ',\n\n' +
        'You have been requested to complete an identity verification. ' +
        'Please click the link below to begin:\n\n' +
        smartCaptureUrl + '\n\n' +
        'This link will expire, so please complete the verification promptly.\n\n' +
        'If you did not expect this request, please contact your administrator.'
    )
    email.save()
}
