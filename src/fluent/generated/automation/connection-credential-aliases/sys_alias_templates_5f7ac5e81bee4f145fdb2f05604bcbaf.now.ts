import { AliasTemplate } from '@servicenow/sdk/core'

AliasTemplate({
    $id: Now.ID['5f7ac5e81bee4f145fdb2f05604bcbaf'],
    name: 'Entrust IDV API OAuth Connection',
    dynamicDataSchema: {
        connectionFields: [
            {
                name: 'connection.name',
                label: 'Connection Name',
                type: 'text',
                defaultValue: 'Entrust IDV Connection',
                hint: 'Display name for the Connection',
                mandatory: true,
            },
            {
                name: 'connection.connection_url',
                label: 'Connection URL',
                type: 'text',
                defaultValue: '',
                hint: 'Base URL for the Entrust IDV API (e.g. https://api.us.onfido.com/v3.6)',
                mandatory: true,
            },
        ],
        credentialFields: [
            {
                name: 'credential.oauth_entity.client_id',
                label: 'Client ID',
                type: 'text',
                hint: 'Client ID for Entrust IDV',
                mandatory: true,
            },
            {
                name: 'credential.oauth_entity.client_secret',
                label: 'Client Secret',
                type: 'password',
                hint: 'Client Secret for Entrust IDV',
                mandatory: true,
            },
            {
                name: 'credential.oauth_entity.token_url',
                label: 'Token URL',
                type: 'text',
                defaultValue: '',
                hint: 'Token URL for Entrust IDV (e.g. https://api.eu.onfido.com/v3.6/oauth/token)',
                mandatory: true,
            },
        ],
    },
    defaultDataTemplate: {
        credential: {
            oauth_entity: {
                oauth_entity_profile: [
                    {
                        grant_type: 'client_credentials',
                        name: 'Entrust IDV Profile',
                        default: true,
                        oauth_entity_profile_scope: [],
                    },
                ],
                code_challenge_method: '',
                type: 'consumer',
                oauth_entity_scope: [],
                client_id: '',
                use_mutual_auth: false,
                default_grant_type: 'client_credentials',
                public_client: false,
                oauth_api_script: '',
                name: 'Entrust IDV OAuth',
                client_secret: '',
                token_url: '',
            },
            name: 'Entrust IDV Credential',
            table: 'oauth_2_0_credentials',
        },
        connection: {
            connectionUrl: '',
            name: 'Entrust IDV Connection',
            table: 'http_connection',
        },
    },
})
