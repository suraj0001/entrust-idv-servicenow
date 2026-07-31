/* eslint-disable */
/**
 * EntrustIDVSetupAjax — thin GlideAjax bridge.
 *
 * Must remain platform JavaScript (Class.create / AbstractAjaxProcessor).
 * All real logic lives in the TypeScript module src/server/ajax/entrust-idv-setup.ts,
 * bundled to dist/modules at build time.
 */
var EntrustIDVSetupAjax = Class.create();

EntrustIDVSetupAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    /**
     * GlideAjax entry point for the "Test Connection" button.
     * Returns a JSON string: { success: boolean, message: string }.
     */
    testConnection: function () {
        try {
            var setup = require('./src/server/ajax/entrust-idv-setup.ts');
            return JSON.stringify(setup.testConnection(
                this.getParameter('sysparm_client_id'),
                this.getParameter('sysparm_client_secret'),
                this.getParameter('sysparm_region')
            ));
        } catch (e) {
            gs.error('[EntrustIDV] EntrustIDVSetupAjax.testConnection failed: ' + e);
            return JSON.stringify({ success: false, message: 'Server error: ' + e });
        }
    },

    /**
     * GlideAjax entry point for the "Save" button.
     * Returns a JSON string: { success: boolean, message: string }.
     */
    /**
     * GlideAjax entry point used before Save to decide whether the client needs to invoke
     * ConnectionAndCredentialHelper.createConnectionAndCredential first.
     * Returns a JSON string: { success, message, aliasSysId, hasConnection }.
     */
    getAliasInfo: function () {
        try {
            var setup = require('./src/server/ajax/entrust-idv-setup.ts');
            return JSON.stringify(setup.getAliasInfo());
        } catch (e) {
            gs.error('[EntrustIDV] EntrustIDVSetupAjax.getAliasInfo failed: ' + e);
            return JSON.stringify({ success: false, message: 'Server error: ' + e });
        }
    },

    saveConfig: function () {
        try {
            var setup = require('./src/server/ajax/entrust-idv-setup.ts');
            return JSON.stringify(setup.saveConfig(
                this.getParameter('sysparm_client_id'),
                this.getParameter('sysparm_client_secret'),
                this.getParameter('sysparm_base_url'),
                this.getParameter('sysparm_token_url'),
                this.getParameter('sysparm_region'),
                this.getParameter('sysparm_workflow_id')
            ));
        } catch (e) {
            gs.error('[EntrustIDV] EntrustIDVSetupAjax.saveConfig failed: ' + e);
            return JSON.stringify({ success: false, message: 'Server error: ' + e });
        }
    },

    type: 'EntrustIDVSetupAjax'
});
