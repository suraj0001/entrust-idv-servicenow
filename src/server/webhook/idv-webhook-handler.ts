import { gs, GlideRecord } from '@servicenow/glide'

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
            output?: { workflow_output?: string }
        }
        object?: {
            id?: string
            status?: string
            completed_at_iso8601?: string
        }
    }
}

export function handleWebhookEvent(body: WorkflowRunPayload): WebhookHandleResult {
    const payload = body && body.payload

    if (!payload || !payload.resource) {
        gs.error('[IDV_WEBHOOK] Invalid or missing payload: ' + JSON.stringify(body))
        return { status: 'error', message: 'Invalid payload structure' }
    }

    if (payload.action !== 'workflow_run.completed') {
        return { status: 'ignored' }
    }

    const resource      = payload.resource
    const object        = payload.object
    const workflowRunId = resource.id
    const status        = resource.status || ''
    const completedAt   = (object && object.completed_at_iso8601) || ''
    const outcome       = (resource.output && resource.output.workflow_output) || ''

    if (!workflowRunId) {
        gs.error('[IDV_WEBHOOK] Missing workflow run id in payload')
        return { status: 'error', message: 'Missing workflow run id' }
    }

    gs.info('[IDV_WEBHOOK] workflow_run.completed: id=' + workflowRunId + ', status=' + status)

    const vr = new GlideRecord('x_entru_entrustidv_verification_request')
    vr.addQuery('workflow_run_id', workflowRunId)
    vr.setLimit(1)
    vr.query()

    if (!vr.next()) {
        gs.warn('[IDV_WEBHOOK] No verification request found for workflow_run_id=' + workflowRunId)
        // Return success so Entrust does not keep retrying an unresolvable event.
        return { status: 'not_found' }
    }

    vr.setValue('status',              status)
    vr.setValue('completed_at',        completedAt)
    vr.setValue('outcome',             outcome)
    vr.setValue('raw_webhook_payload', JSON.stringify(body))
    vr.update()

    // Propagate status to the linked incident.
    const incidentSysId = vr.getValue('incident') as string
    if (incidentSysId && status) {
        const incident = new GlideRecord('incident')
        incident.get(incidentSysId)
        if (incident.isValidRecord()) {
            incident.setValue('x_entru_entrustidv_idv_status', status)
            incident.update()
        }
    }

    return { status: 'success' }
}
