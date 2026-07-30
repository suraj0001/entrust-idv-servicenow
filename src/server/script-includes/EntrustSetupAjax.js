/* eslint-disable */
/**
 * EntrustSetupAjax — thin GlideAjax bridge.
 *
 * This is a ServiceNow Script Include *body* (platform JavaScript inlined via
 * Now.include), NOT a Node/ES module — so it uses `Class.create` and extends
 * `global.AbstractAjaxProcessor`, the correct runtime reference for a scoped,
 * client-callable GlideAjax processor. The file-level eslint-disable keeps the
 * Node-oriented static analysis from flagging these platform globals.
 *
 * All real logic lives in the typed TypeScript module
 * `src/server/setup/entrust-setup.ts`. This bridge only reads the GlideAjax
 * parameters and delegates to it (bundled to ./dist/modules at build time).
 */
var EntrustSetupAjax = Class.create();

EntrustSetupAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    /**
     * GlideAjax entry point for the Getting Started page "Test Connection"
     * button. Returns a JSON string: { success: boolean, message: string }.
     */
    testConnection: function () {
        var setup = require('./dist/modules/setup/entrust-setup.js');
        var clientId = this.getParameter('sysparm_client_id');
        var clientSecret = this.getParameter('sysparm_client_secret');
        var region = this.getParameter('sysparm_region');

        return JSON.stringify(setup.testConnection(clientId, clientSecret, region));
    },

    type: 'EntrustSetupAjax'
});

