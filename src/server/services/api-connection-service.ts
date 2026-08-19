import {
    EntrustConnectionTestResult,
    testEntrustConnection,
} from '../entrust/entrust-auth-client.ts'
import { EntrustRegion, BASE_URLS, API_VERSION } from '../constants.ts'
import { ApiConnectionRepository } from '../repositories/connection-credential-repository.ts'
import { validateSaveInput, isSupportedRegion, SaveConfigInput } from '../setup/api-connection-validator.ts'
import { gs } from '@servicenow/glide'

export interface GetConfigResult {
    success: boolean
    region?: string
    baseUrl?: string
    tokenUrl?: string
    connectionTested?: boolean
    message?: string
}

export interface AliasInfoResult {
    success: boolean
    aliasSysId?: string
    hasConnection?: boolean
    message?: string
}

export interface SaveConfigResult {
    success: boolean
    message: string
}

const repo = new ApiConnectionRepository()

function tokenUrl(region: EntrustRegion): string {
    return BASE_URLS[region] + '/' + API_VERSION + '/oauth/token'
}

function resolveConnection() {
    const alias = repo.findAlias()

    if (!alias) {
        gs.warn('[ApiConnection] resolveConnection: alias not found (ALIAS_ID lookup returned null)')
        return null
    }

    gs.info('[ApiConnection] resolveConnection: alias found sysId=' + alias.sysId)

    const connection = repo.getConnectionInfo(alias.sysId)

    if (!connection) {
        gs.warn('[ApiConnection] resolveConnection: getConnectionInfo returned null for aliasSysId=' + alias.sysId)
        return null
    }

    gs.info('[ApiConnection] resolveConnection: connection found baseUrl=' + connection.baseUrl + ' credentialSysId=' + connection.credentialSysId)

    return {
        alias,
        connection
    }
}

export function getConfig(): GetConfigResult {
    try {
        const config = repo.findConfiguration()
        const connected = !!resolveConnection()
        if (!config) return { success: true, connectionTested: connected }

        const region = config.region.toLowerCase()
        const base = isSupportedRegion(region) ? BASE_URLS[region as EntrustRegion] : ''
        return {
            success: true,
            region: config.region,
            baseUrl: base,
            tokenUrl: base ? base + '/' + API_VERSION + '/oauth/token' : '',
            connectionTested: connected,
        }
    } catch (err) {
        return { success: false, message: 'Failed to load configuration: ' + String(err) }
    }
}

export function getAliasInfo(): AliasInfoResult {
    try {
        const alias = repo.findAlias()

        if (!alias) {
            return {
                success: false,
                message: 'Connection alias not found.'
            }
        }

        const connection =
            repo.getConnectionInfo(alias.sysId)

        return {
            success: true,
            aliasSysId: alias.sysId,
            hasConnection: !!connection
        }

    } catch (err) {
        return {
            success: false,
            message:
                'Failed to look up connection alias: ' +
                String(err)
        }
    }
}

export function saveConfig(input: SaveConfigInput): SaveConfigResult {
    const validationError = validateSaveInput(input)
    if (validationError) return { success: false, message: validationError }

    gs.info('[ApiConnection] saveConfig: region=' + input.region + ' hasClientId=' + !!input.clientId + ' hasClientSecret=' + !!input.clientSecret)

    try {
        if (input.clientId && input.clientSecret) {
            gs.info('[ApiConnection] saveConfig: credentials provided, resolving connection chain')
            const chain = resolveConnection()
            if (!chain) return { success: false, message: 'No connection found. Complete initial setup first.' }

            gs.info('[ApiConnection] saveConfig: looking up OAuth entity for credentialSysId=' + chain.connection.credentialSysId)
            const entity = repo.findOAuthEntity(chain.connection.credentialSysId)
            if (!entity) {
                gs.warn('[ApiConnection] saveConfig: OAuth entity not found for credentialSysId=' + chain.connection.credentialSysId)
                return { success: false, message: 'OAuth credentials not found. Re-run initial setup.' }
            }

            gs.info('[ApiConnection] saveConfig: OAuth entity found sysId=' + entity.sysId + ' profileSysId=' + entity.profileSysId)

            const updated = repo.updateOAuthCredentials(
                entity.sysId, entity.profileSysId,
                input.clientId, input.clientSecret,
                tokenUrl(input.region.toLowerCase() as EntrustRegion),
            )
            if (!updated) {
                gs.warn('[ApiConnection] saveConfig: updateOAuthCredentials returned false')
                return { success: false, message: 'Failed to update credentials.' }
            }

            gs.info('[ApiConnection] saveConfig: OAuth credentials updated successfully')
        }

        repo.saveRegion(input.region)
        gs.info('[ApiConnection] saveConfig: region saved successfully')
        return { success: true, message: 'Configuration saved.' }
    } catch (err) {
        gs.error('[ApiConnection] saveConfig: unexpected error: ' + String(err))
        return { success: false, message: 'Failed to save configuration: ' + String(err) }
    }
}

export function testConnection(
    region: string,
    clientId: string,
    clientSecret: string,
): EntrustConnectionTestResult {
    if (!region || !clientId || !clientSecret) {
        return { success: false, message: 'Region, Client ID and Client Secret are all required.' }
    }
    const normalised = region.toLowerCase()
    if (!isSupportedRegion(normalised)) {
        return { success: false, message: 'Unsupported region: ' + region }
    }
    return testEntrustConnection(normalised as EntrustRegion, clientId, clientSecret)
}
