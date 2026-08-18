import {
    EntrustRegion,
    EntrustConnectionTestResult,
    testEntrustConnection,
    BASE_URLS,
} from '../../entrust/entrust-auth-client.ts'
import { ApiConnectionRepository } from './api-connection-repository.ts'
import { validateSaveInput, isSupportedRegion, SaveConfigInput } from './api-connection-validator.ts'

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
    return BASE_URLS[region] + '/oauth/token'
}

// Traverses alias → connection; returns null if either is missing
function resolveConnection() {
    const alias = repo.findAlias()
    if (!alias) return null
    const connection = repo.findConnection(alias.sysId)
    return connection ? { alias, connection } : null
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
            tokenUrl: base ? base + '/oauth/token' : '',
            connectionTested: connected,
        }
    } catch (err) {
        return { success: false, message: 'Failed to load configuration: ' + String(err) }
    }
}

export function getAliasInfo(): AliasInfoResult {
    try {
        const alias = repo.findAlias()
        if (!alias) return { success: false, message: 'Connection alias not found.' }
        const connection = repo.findConnection(alias.sysId)
        return { success: true, aliasSysId: alias.sysId, hasConnection: !!connection }
    } catch (err) {
        return { success: false, message: 'Failed to look up connection alias: ' + String(err) }
    }
}

export function saveConfig(input: SaveConfigInput): SaveConfigResult {
    const validationError = validateSaveInput(input)
    if (validationError) return { success: false, message: validationError }

    try {
        if (input.clientId && input.clientSecret) {
            const chain = resolveConnection()
            if (!chain) return { success: false, message: 'No connection found. Complete initial setup first.' }

            const entity = repo.findOAuthEntity(chain.connection.credentialSysId)
            if (!entity) return { success: false, message: 'OAuth credentials not found. Re-run initial setup.' }

            const updated = repo.updateOAuthCredentials(
                entity.sysId, entity.profileSysId,
                input.clientId, input.clientSecret,
                tokenUrl(input.region.toLowerCase() as EntrustRegion),
            )
            if (!updated) return { success: false, message: 'Failed to update credentials.' }
        }

        repo.saveRegion(input.region)
        return { success: true, message: 'Configuration saved.' }
    } catch (err) {
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