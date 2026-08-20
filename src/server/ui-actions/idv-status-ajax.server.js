/* eslint-disable */
var IdvStatusAjax = Class.create()
IdvStatusAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    getLatestStatus: function () {
        var sourceTable = this.getParameter('sysparm_source_table')
        var sourceRecordId = this.getParameter('sysparm_source_record_id')

        if (sourceTable !== 'incident' || !sourceRecordId) {
            return ''
        }

        try {
            var repository = require('./src/server/repositories/verification-request-repository.ts')
            return repository.findLatestVerificationStatus(
                sourceTable,
                sourceRecordId,
            )
        } catch (error) {
            gs.error('[IdvStatusAjax] ' + String(error))
            return ''
        }
    },

    type: 'IdvStatusAjax',
})
