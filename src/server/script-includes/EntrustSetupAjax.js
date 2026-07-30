/* eslint-disable */
/**
 * EntrustSetupAjax — thin GlideAjax bridge.
 *
 * Must remain platform JavaScript (Class.create / AbstractAjaxProcessor).
 * All real logic lives in the TypeScript module src/server/setup/entrust-setup.ts,
 * bundled to dist/modules at build time.
 */
var EntrustSetupAjax = Class.create();

EntrustSetupAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    /**
     * GlideAjax entry point for the "Test Connection" button.
     * Returns a JSON string: { success: boolean, message: string }.
     */
    testConnection: function () {
        var setup = require('./dist/modules/setup/entrust-setup.js');
        return JSON.stringify(setup.testConnection(
            this.getParameter('sysparm_client_id'),
            this.getParameter('sysparm_client_secret'),
            this.getParameter('sysparm_region')
        ));
    },

    type: 'EntrustSetupAjax'
});
