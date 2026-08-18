import { GlideRecord } from '@servicenow/glide'
import { CONFIG_TABLE, DEFAULT_WORKFLOW_ID, DEFAULT_LINK_EXPIRY_MINUTES } from '../constants.ts'

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
        return {
            workflowId: DEFAULT_WORKFLOW_ID,
            linkExpiryMinutes: DEFAULT_LINK_EXPIRY_MINUTES,
            redirectUrl: '',
        }
    }

    const workflowId =
        (config.getValue('workflow_id') as string) || DEFAULT_WORKFLOW_ID

    const linkExpiryValue =
        (config.getValue('link_expiry_minutes') as string) || ''

    const redirectUrl =
        (config.getValue('redirect_url') as string) || ''

    const linkExpiryMinutes =
        parseInt(linkExpiryValue, 10)

    return {
        workflowId,
        linkExpiryMinutes: (Number.isNaN(linkExpiryMinutes) || linkExpiryMinutes <= 0)
            ? DEFAULT_LINK_EXPIRY_MINUTES
            : linkExpiryMinutes,
        redirectUrl,
    }
}