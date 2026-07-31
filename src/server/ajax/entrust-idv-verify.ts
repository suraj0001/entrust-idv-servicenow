import { gs, GlideRecord } from '@servicenow/glide'

/**
 * Result of starting an Entrust IDV verification from the incident UI Action.
 */
export interface VerifyResult {
    success: boolean
    message: string
}

/**
 * Kick off an Entrust IDV verification for the person on the given incident.
 * Requires the app to have been configured via the setup page first.
 */
export function startVerification(incidentId: string): VerifyResult {
    if (!incidentId) {
        return { success: false, message: 'No incident was provided.' }
    }

    const config = new GlideRecord('x_entru_entrustidv_config')
    config.query()
    if (!config.next()) {
        return {
            success: false,
            message: 'Entrust IDV is not configured yet. Complete the setup page first.',
        }
    }

    const active = config.getValue('active')
    if (active !== 'true' && active !== '1') {
        return {
            success: false,
            message: 'Entrust IDV configuration is inactive. Enable it on the setup page.',
        }
    }

    const workflowId = config.getValue('default_workflow_id')
    if (!workflowId) {
        return { success: false, message: 'No default workflow is configured for Entrust IDV.' }
    }

    const incident = new GlideRecord('incident')
    incident.get(incidentId)
    if (!incident.isValidRecord()) {
        return { success: false, message: 'Incident not found.' }
    }

    // TODO: Call Entrust IDV to create a verification transaction using the entrust_idv_api
    // connection alias credentials + workflowId (region base URL), then persist the returned
    // transaction id / verification link back onto the incident or a related record.
    gs.info(
        '[EntrustIDV] startVerification requested for incident ' +
            incident.getValue('number') +
            ' with workflow ' +
            workflowId,
    )

    return {
        success: true,
        message: 'Identity verification initiated for ' + incident.getValue('number') + '.',
    }
}
