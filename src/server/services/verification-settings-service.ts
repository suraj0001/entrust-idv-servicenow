import {
    validateVerificationSettings,
    type VerificationSettingsInput,
} from '../setup/verification-settings-validator.ts'

import {
    saveVerificationSettingsConfig,
    type VerificationSettingsConfig,
} from '../repositories/configuration-repository.ts'

export type SaveVerificationSettingsResult = {
    success: boolean
    message: string
}

export function saveVerificationSettings(
    input: VerificationSettingsInput,
): SaveVerificationSettingsResult {
    // 1. Server-side validation
    validateVerificationSettings(input)

    // 2. Business logic / normalization
    var settings: VerificationSettingsConfig = {
        workflowId: input.workflowId.trim(),
        linkExpiry: Number(input.linkExpiry),
        linkDeliveryChannel: input.deliveryChannel.trim().toLowerCase(),
        webhookSecret: input.webhookSecret.trim(),
        redirectUrl: input.redirectUrl ? input.redirectUrl.trim() : '',
    }

    // 3. Persistence
    saveVerificationSettingsConfig(settings)

    return {
        success: true,
        message: 'Verification settings saved successfully.',
    }
}