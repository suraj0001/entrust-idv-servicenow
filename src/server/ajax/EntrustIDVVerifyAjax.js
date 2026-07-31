/* eslint-disable */
/**
 * EntrustIDVVerifyAjax — thin GlideAjax bridge for the incident "Verify Identity" UI Action.
 *
 * Must remain platform JavaScript (Class.create / AbstractAjaxProcessor).
 * All real logic lives in the TypeScript module src/server/ajax/entrust-idv-verify.ts,
 * bundled to dist/modules at build time.
 */
var EntrustIDVVerifyAjax = Class.create();

EntrustIDVVerifyAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    /**
     * GlideAjax entry point for the incident "Verify Identity" button.
     * Returns a JSON string: { success: boolean, message: string }.
     */
    startVerification: function () {
        try {
            var verify = require('./src/server/ajax/entrust-idv-verify.ts');
            return JSON.stringify(verify.startVerification(
                this.getParameter('sysparm_incident_id')
            ));
        } catch (e) {
            gs.error('[EntrustIDV] EntrustIDVVerifyAjax.startVerification failed: ' + e);
            return JSON.stringify({ success: false, message: 'Server error: ' + e });
        }
    },

    type: 'EntrustIDVVerifyAjax'
});
