/* eslint-disable */
var ApiConnectionAjax = Class.create();
ApiConnectionAjax.prototype = Object.extendsObject(
   global.AbstractAjaxProcessor,
   {
       getConfig: function () {
           return _call(this, function (svc) { return svc.getConfig(); });
       },

       getAliasInfo: function () {
           return _call(this, function (svc) { return svc.getAliasInfo(); });
       },

       saveConfig: function () {
           var self = this;
           return _call(this, function (svc) {
               return svc.saveConfig({
                   region: self.getParameter('sysparm_region'),
                   clientId: self.getParameter('sysparm_client_id') || undefined,
                   clientSecret: self.getParameter('sysparm_client_secret') || undefined,
               });
           });
       },

       testConnection: function () {
           var self = this;
           return _call(this, function (svc) {
               return svc.testConnection(
                   self.getParameter('sysparm_region'),
                   self.getParameter('sysparm_client_id'),
                   self.getParameter('sysparm_client_secret')
               );
           });
       },

       type: 'ApiConnectionAjax'
   }
);

function _call(ctx, fn) {
    try {
        var svc = require('./src/server/setup/api-connection/api-connection-service.ts');
        return JSON.stringify(fn(svc));
    } catch (err) {
        gs.error('[ApiConnectionAjax] ' + err);
        return JSON.stringify({ success: false, message: 'Server error: ' + err });
    }
}