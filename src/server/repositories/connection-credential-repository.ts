import { gs, GlideRecord } from '@servicenow/glide'
import { ALIAS_NAME, CONFIG_TABLE } from '../constants.ts'

export interface ConfigRecord   { sysId: string; region: string }
export interface AliasRecord    { sysId: string }
export interface OAuthEntityRecord { sysId: string; profileSysId: string }

// Returns a GlideRecord after get(); null if the record doesn't exist
function getRecord(table: string, sysId: string): GlideRecord | null {
    const gr = new GlideRecord(table)
    gr.get(sysId)
    return gr.isValidRecord() ? gr : null
}

export class ApiConnectionRepository {

    findConfiguration(): ConfigRecord | null {
        const gr = new GlideRecord(CONFIG_TABLE)
        gr.query()
        if (!gr.next()) return null
        return { sysId: gr.getUniqueValue(), region: (gr.getValue('region') as string) || '' }
    }

    saveRegion(region: string): void {
        const gr = new GlideRecord(CONFIG_TABLE)
        gr.query()
        if (gr.next()) {
            gr.setValue('region', region)
            gr.update()
        } else {
            gr.initialize()
            gr.setValue('region', region)
            gr.insert()
        }
    }

    findAlias(): AliasRecord | null {
        const gr = new GlideRecord('sys_alias')
        gr.addQuery('name', ALIAS_NAME)
        gr.query()
        return gr.next() ? { sysId: gr.getUniqueValue() } : null
    }

    findConnection(aliasSysId: string): ConnectionRecord | null {
        const gr = new GlideRecord('http_connection')
        gr.addQuery('connection_alias', aliasSysId)
        gr.addQuery('active', true)
        gr.orderByDesc('sys_created_on')
        gr.query()

        if (!gr.next()) return null

        return {
            sysId: gr.getUniqueValue(),
            baseUrl: (gr.getValue('connection_url') as string) || '',
            credentialSysId: (gr.getValue('credential') as string) || '',
        }
    }

    findOAuthEntity(credentialSysId: string): OAuthEntityRecord | null {
        const credGr = getRecord('oauth_2_0_credentials', credentialSysId)
        if (!credGr) return null

        const profileSysId = (credGr.getValue('oauth_entity_profile') as string) || ''
        const profileGr = getRecord('oauth_entity_profile', profileSysId)
        if (!profileGr) return null

        return { sysId: (profileGr.getValue('oauth_entity') as string) || '', profileSysId }
    }

    updateOAuthCredentials(
        entitySysId: string,
        profileSysId: string,
        clientId: string,
        clientSecret: string,
        tokenUrl: string,
    ): boolean {
        const entityGr = getRecord('oauth_entity', entitySysId)
        if (!entityGr) {
            gs.error('[ApiConnection] oauth_entity not found: ' + entitySysId)
            return false
        }
        entityGr.setValue('client_id', clientId)
        entityGr.setValue('client_secret', clientSecret)
        entityGr.setValue('token_url', tokenUrl)
        entityGr.setValue('refresh_token_url', '')
        entityGr.setValue('default_grant_type', 'client_credentials')
        // Onfido requires credentials in the POST body, not as Basic auth
        entityGr.setValue('send_client_credentials_as', 'request_body_parameter')
        entityGr.update()

        const profileGr = getRecord('oauth_entity_profile', profileSysId)
        if (profileGr) {
            profileGr.setValue('grant_type', 'client_credentials')
            profileGr.update()
        }
        return true
    }

    getRuntimeConnection(): EntrustRuntimeConnection | null {

    const alias = this.findAlias()
    if (!alias) return null

    const connection = this.findConnection(alias.sysId)
    if (!connection) return null

    if (!connection.baseUrl || !connection.credentialSysId) {
        return null
    }

    const oauthEntity =
        this.findOAuthEntity(connection.credentialSysId)

    if (!oauthEntity || !oauthEntity.profileSysId) {
        return null
    }

    return {
        baseUrl: connection.baseUrl,

        oauthProfileId:
            oauthEntity.profileSysId,

        requestorContext:
            'oauth_2_0_credentials',

        requestorId:
            connection.credentialSysId,
    }
}
}

export interface EntrustRuntimeConnection {
    baseUrl: string
    oauthProfileId: string
    requestorContext: string
    requestorId: string
}

export interface ConnectionRecord {
    sysId: string
    baseUrl: string
    credentialSysId: string
}