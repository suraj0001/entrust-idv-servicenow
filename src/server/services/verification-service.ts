import { gs } from '@servicenow/glide'
import { findSourceRecordContext } from '../repositories/source-record-repository.ts'
import { findSubjectUser } from '../repositories/subject-user-repository.ts'
import { getVerificationConfiguration } from '../repositories/verification-configuration-repository.ts'
import { createVerificationRequest, findApplicantIdBySubjectUser } from '../repositories/verification-request-repository.ts'
import { ApiConnectionRepository } from '../repositories/connection-credential-repository.ts'
import { createApplicant, createWorkflowRun } from '../entrust/entrust-verification-client.ts'
import { sendVerificationLinkEmail } from './verification-email-service.ts'


export interface StartVerificationResult {
    verificationRequestId: string
    workflowRunId: string
    smartCaptureUrl: string
}

export function startVerification(
    sourceTable: string,
    sourceRecordId: string,
): StartVerificationResult {

    // Resolve source record and determine the subject user (incident → caller_id, HR case → subject_person)
    const sourceContext = findSourceRecordContext(sourceTable, sourceRecordId)
    if (!sourceContext) {
        throw new Error('Unable to resolve the source record or subject user.')
    }

    // Load the ServiceNow user record
    const subjectUser = findSubjectUser(sourceContext.subjectUserId)
    if (!subjectUser) {
        throw new Error('Unable to resolve the subject user.')
    }

    // Validate required fields before making any Entrust API calls
    if (!subjectUser.firstName || !subjectUser.lastName) {
        throw new Error('The subject user must have a first name and last name.')
    }
    if (!subjectUser.email) {
        throw new Error('The subject user must have an email address.')
    }

    // Load verification configuration (workflow ID, link expiry, redirect URL)
    const configuration = getVerificationConfiguration()
    if (!configuration) {
        throw new Error('Identity Verification configuration is incomplete.')
    }

    // Resolve the Entrust API connection and OAuth credentials
    const connection = new ApiConnectionRepository().getRuntimeConnection()
    if (!connection) {
        throw new Error('Entrust API connection is not configured.')
    }

    // Reuse an existing Entrust applicant for this subject user if one already exists
    let applicantId = findApplicantIdBySubjectUser(sourceContext.subjectUserId)
    if (!applicantId) {
        const applicant = createApplicant(connection, {
            firstName: subjectUser.firstName,
            lastName: subjectUser.lastName,
        })
        applicantId = applicant.applicantId
    }

    // Always create a fresh workflow run, even when reusing an existing applicant
    const workflowRun = createWorkflowRun(connection, {
        applicantId,
        workflowId: configuration.workflowId,
        expiresAt: calculateExpiry(configuration.linkExpiryMinutes),
        redirectUrl: configuration.redirectUrl || undefined,
    })

    // Persist only after Entrust confirms the workflow run was created
    const verificationRequestId = createVerificationRequest({
        sourceTable: sourceContext.sourceTable,
        sourceRecordId: sourceContext.sourceRecordId,
        subjectUserId: sourceContext.subjectUserId,
        applicantId,
        workflowId: configuration.workflowId,
        workflowVersionId: String(workflowRun.workflowVersionId),
        workflowRunId: workflowRun.workflowRunId,
        status: workflowRun.status,
    })

    // Email the Smart Capture link to the subject user; log but don't fail on email errors
    try {
        sendVerificationLinkEmail(subjectUser.email, subjectUser.firstName, workflowRun.smartCaptureUrl)
    } catch (emailError) {
        gs.warn('[IdentityVerification] Failed to send verification email: ' + emailError)
    }

    return {
        verificationRequestId,
        workflowRunId: workflowRun.workflowRunId,
        smartCaptureUrl: workflowRun.smartCaptureUrl,
    }
}


function calculateExpiry(linkExpiryMinutes: number): string {
    return new Date(Date.now() + linkExpiryMinutes * 60 * 1000).toISOString()
}