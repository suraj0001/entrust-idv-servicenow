import { gs, GlideRecord } from '@servicenow/glide'
import { ALIAS_ID, CONFIG_TABLE } from '../constants.ts'
import { ConnectionInfoProvider } from '@servicenow/glide/sn_cc'

export interface ConfigRecord   { sysId: string; region: string }
export interface AliasRecord    { sysId: string }
export interface OAuthEntityRecord { sysId: string; profileSysId: string }
export interface RuntimeConnectionInfo {
    baseUrl: string
    credentialSysId: string
}

export interface EntrustRuntimeConnection {
    baseUrl: string
    oauthProfileId: string
    requestorContext: string
    requestorId: string
}

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
    
        gr.addQuery('id', ALIAS_ID)
        gr.query()
    
        if (!gr.next()) {
            return null
        }
    
        return {
            sysId: gr.getUniqueValue()
        }
    }

    findOAuthEntity(
        credentialSysId: string
    ): OAuthEntityRecord | null {
    
        const credGr =
            getRecord(
                'oauth_2_0_credentials',
                credentialSysId
            )
    
        if (!credGr) return null
    
        const profileSysId =
            (credGr.getValue(
                'oauth_entity_profile'
            ) as string) || ''
    
        const profileGr =
            getRecord(
                'oauth_entity_profile',
                profileSysId
            )
    
        if (!profileGr) return null
    
        return {
            sysId:
                (profileGr.getValue(
                    'oauth_entity'
                ) as string) || '',
    
            profileSysId,
        }
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

    getConnectionInfo(
        aliasSysId: string
    ): RuntimeConnectionInfo | null {
    
        const provider = new ConnectionInfoProvider()
    
        const connectionInfo =
            provider.getConnectionInfo(aliasSysId)
    
        if (!connectionInfo) {
            return null
        }
    
        const baseUrl =
            String(
                connectionInfo.getAttribute('connection_url') || ''
            )
    
        const credentialSysId =
            String(
                connectionInfo.getCredentialAttribute('sys_id') || ''
            )
    
        if (!baseUrl || !credentialSysId) {
            return null
        }
    
        return {
            baseUrl,
            credentialSysId,
        }
    }

    getRuntimeConnection(): EntrustRuntimeConnection | null {

        const alias = this.findAlias()
    if (!alias) return null

    const provider = new ConnectionInfoProvider()

    const connectionInfo =
        provider.getConnectionInfo(alias.sysId)

    if (!connectionInfo) {
        return null
    }
    
        const baseUrl =
            connectionInfo.getAttribute('connection_url') || ''
    
        const credentialSysId =
            connectionInfo.getCredentialAttribute('sys_id') || ''
    
        if (!baseUrl || !credentialSysId) {
            return null
        }
    
        const oauthEntity =
            this.findOAuthEntity(credentialSysId)
    
        if (!oauthEntity || !oauthEntity.profileSysId) {
            return null
        }
    
        return {
            baseUrl: baseUrl.replace(
                /\/v\d+\.\d+\/?$/,
                ''
            ),
    
            oauthProfileId:
                oauthEntity.profileSysId,
    
            requestorContext:
                'oauth_2_0_credentials',
    
            requestorId:
                credentialSysId,
        }
    }
}