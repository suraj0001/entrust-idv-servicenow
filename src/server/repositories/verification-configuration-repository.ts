import { GlideRecord } from '@servicenow/glide'

const CONFIG_TABLE =
    'x_entru_entrustidv_configuration'

export interface VerificationConfiguration {
    workflowId: string
    linkExpiryMinutes: number
    redirectUrl: string
}

export function getVerificationConfiguration():
    VerificationConfiguration | null {

    const config = new GlideRecord(CONFIG_TABLE)
    config.setLimit(1)
    config.query()

    if (!config.next()) {
        return null
    }

    const workflowId =
        (config.getValue('workflow_id') as string) || ''

    const linkExpiryValue =
        (config.getValue('link_expiry_minutes') as string) || ''

    const redirectUrl =
        (config.getValue('redirect_url') as string) || ''

    if (!workflowId || !linkExpiryValue) {
        return null
    }

    const linkExpiryMinutes =
        parseInt(linkExpiryValue, 10)

    if (
        Number.isNaN(linkExpiryMinutes) ||
        linkExpiryMinutes <= 0
    ) {
        return null
    }

    return {
        workflowId,
        linkExpiryMinutes,
        redirectUrl,
    }
}