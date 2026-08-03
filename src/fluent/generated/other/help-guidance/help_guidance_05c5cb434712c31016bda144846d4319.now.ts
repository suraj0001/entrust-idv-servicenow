import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['05c5cb434712c31016bda144846d4319'],
    table: 'help_guidance',
    data: {
        active: 'true',
        checklist:
            '<ul><li>You have an active Entrust Identity Verification account and tenant</li><li>You have your Entrust Client ID and Client Secret <br />  (available in Entrust Dashboard &gt; API Credentials)</li><li>You know your region — US, EU, or Canada <br />  (determines which API endpoint to connect to)</li><li>You have created a Workflow in Entrust Dashboard and have the Workflow ID (UUID)<br />  (e.g. 3f6b2c1a-4d5e-7890-abcd-ef1234567890)</li><li>You have registered a webhook in Entrust Dashboard pointing to:<br />  https://&lt;your-instance&gt;.service-now.com/api/x_entru_idv/entrust_idv_webhook/result<br />  and have the Webhook Secret Token ready</li><li>You have the x_entru_entrustidv.admin or admin role in ServiceNow</li></ul>',
        description: 'Configure the Entrust Identity Verification',
        interaction_status: 'COMPLETE',
        name: 'Entrust Identity Verification Setup',
        process_definition: '41c5cb434712c31016bda144846d431b',
        product_name: 'Entrust Identity Verification Setup',
        roles: 'x_entru_entrustidv..admin',
        setup_execution_type: 'single',
        setup_layout: 'focused_view',
        skip_execution_page: 'false',
        snc_created: 'false',
        status: 'published',
        sys_domain: 'global',
        sys_domain_path: '/',
        type: 'global_setup',
        version: 'australia',
    },
})
