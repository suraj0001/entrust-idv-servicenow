import { GlideRecord } from '@servicenow/glide'

const VERIFICATION_REQUEST_TABLE = 'x_entru_entrustidv_verification_request'

export interface CreateVerificationRequest {
    sourceTable: string
    sourceRecordId: string
    subjectUserId: string
    applicantId: string
    workflowId: string
    workflowVersionId: string
    workflowRunId: string
    status: string
}

export function createVerificationRequest(input: CreateVerificationRequest): string {
    const gr = new GlideRecord(VERIFICATION_REQUEST_TABLE)
    gr.initialize()
    gr.setValue('source_table', input.sourceTable)
    gr.setValue('source_record', input.sourceRecordId)
    gr.setValue('subject_user', input.subjectUserId)
    gr.setValue('applicant_id', input.applicantId)
    gr.setValue('workflow_id', input.workflowId)
    gr.setValue('workflow_version_id', input.workflowVersionId)
    gr.setValue('workflow_run_id', input.workflowRunId)
    gr.setValue('status', input.status)

    const sysId = gr.insert()
    if (!sysId) {
        throw new Error('Unable to create verification request.')
    }
    return sysId.toString()
}

export function findApplicantIdBySubjectUser(subjectUserId: string): string | null {
    if (!subjectUserId) {
        return null
    }

    const gr = new GlideRecord(VERIFICATION_REQUEST_TABLE)
    gr.addQuery('subject_user', subjectUserId)
    gr.addNotNullQuery('applicant_id')
    gr.orderByDesc('sys_created_on')
    gr.setLimit(1)
    gr.query()

    if (!gr.next()) {
        return null
    }

    return (gr.getValue('applicant_id') as string) || null
}