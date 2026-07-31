import { AliasTemplate } from '@servicenow/sdk/core'

AliasTemplate({
    $id: Now.ID['a06e26f61b960fd05fdb2f05604bcba7'],
    name: 'Entrust IDV OAuth Connection',
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
                label: 'API Base URL',
                type: 'text',
                defaultValue: '',
                hint: 'US: https://api.us.onfido.com/v3.6 | EU: https://api.eu.onfido.com/v3.6 | Canada: https://api.ca.onfido.com/v3.6',
                mandatory: true,
            },
        ],
        credentialFields: [
            {
                name: 'credential.oauth_entity.client_id',
                label: 'Client ID',
                type: 'text',
                hint: 'Client ID from your Entrust IDV dashboard',
                mandatory: true,
            },
            {
                name: 'credential.oauth_entity.client_secret',
                label: 'Client Secret',
                type: 'password',
                hint: 'Client Secret from your Entrust IDV dashboard',
                mandatory: true,
            },
            {
                name: 'credential.oauth_entity.token_url',
                label: 'Token URL',
                type: 'text',
                defaultValue: '',
                hint: 'US: .../v3.6/oauth/token | EU: api.eu.onfido.com/v3.6/oauth/token | Canada: api.ca.onfido.com/v3.6/oauth/token',
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
                code_challenge_method: 'S256',
                type: 'consumer',
                oauth_entity_scope: [],
                client_id: '',
                use_mutual_auth: false,
                default_grant_type: 'client_credentials',
                public_client: false,
                oauth_api_script: '3e3a3a11c333210016194ffe5bba8f70',
                name: 'Entrust IDV Spoke OAuth',
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
