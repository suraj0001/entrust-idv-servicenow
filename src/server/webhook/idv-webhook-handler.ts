import { gs, GlideRecord } from '@servicenow/glide'
import { VERIFICATION_REQUEST_TABLE } from '../constants.ts'

export interface WebhookHandleResult {
    status: 'success' | 'ignored' | 'not_found' | 'error'
    message?: string
}

interface WorkflowRunPayload {
    payload?: {
        action?: string
        resource_type?: string
        resource?: {
            id?: string
            applicant_id?: string
            workflow_id?: string
            status?: string
        }
        object?: {
            id?: string
            status?: string
            completed_at_iso8601?: string
        }
    }
}

export function handleWebhookEvent(
    body: WorkflowRunPayload,
): WebhookHandleResult {
    const payload = body && body.payload

    if (!payload || !payload.resource) {
        gs.error(
            '[IDV_WEBHOOK] Invalid or missing payload: ' + JSON.stringify(body),
        )
        return { status: 'error', message: 'Invalid payload structure' }
    }

    if (
        payload.action !== 'workflow_run.completed' ||
        payload.resource_type !== 'workflow_run'
    ) {
        return { status: 'ignored' }
    }

    const resource = payload.resource
    const object = payload.object
    const workflowRunId = resource.id || (object && object.id) || ''
    const status = resource.status || (object && object.status) || ''
    const completedAt = (object && object.completed_at_iso8601) || ''

    if (!workflowRunId) {
        gs.error('[IDV_WEBHOOK] Missing workflow run id in payload')
        return { status: 'error', message: 'Missing workflow run id' }
    }

    gs.info(
        '[IDV_WEBHOOK] workflow_run.completed: id=' +
            workflowRunId +
            ', status=' +
            status,
    )

    const verificationRequest = new GlideRecord(VERIFICATION_REQUEST_TABLE)
    verificationRequest.addQuery('workflow_run_id', workflowRunId)
    verificationRequest.setLimit(1)
    verificationRequest.query()

    if (!verificationRequest.next()) {
        gs.warn(
            '[IDV_WEBHOOK] No verification request found for workflow_run_id=' +
                workflowRunId,
        )
        return { status: 'not_found' }
    }

    if (status) {
        verificationRequest.setValue('status', status)
    }
    if (completedAt) {
        verificationRequest.setValue(
            'completed_at',
            completedAt.replace('T', ' ').replace('Z', ''),
        )
    }
    verificationRequest.update()

    const sourceTable = verificationRequest.getValue('source_table') as string
    const sourceRecordId = verificationRequest.getValue(
        'source_record',
    ) as string

    if (sourceTable && sourceRecordId && status) {
        const sourceRecord = new GlideRecord(sourceTable)
        sourceRecord.get(sourceRecordId)

        if (sourceRecord.isValidRecord()) {
            sourceRecord.setValue(
                'x_entru_entrustidv_verification_status',
                status,
            )
            sourceRecord.update()
        }
    }

    return { status: 'success' }
}
