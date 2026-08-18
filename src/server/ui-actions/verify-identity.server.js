(function executeVerifyIdentity() {

    try {

        var verificationService = require(
            '../services/verification-service.ts'
        );

        verificationService.startVerification(
            current.getTableName(),
            current.getUniqueValue()
        );

        gs.addInfoMessage(
            'Identity verification started successfully.'
        );

    } catch (error) {

        var errorMessage =
            error && error.message
                ? error.message
                : 'Unknown error';

        gs.error(
            '[IdentityVerification] Failed to start verification. ' +
            'Source table: ' +
            current.getTableName() +
            ', source record: ' +
            current.getUniqueValue() +
            ', error: ' +
            errorMessage
        );

        gs.addErrorMessage(
            'Unable to start identity verification.'
        );
    }

    action.setRedirectURL(current);

})();