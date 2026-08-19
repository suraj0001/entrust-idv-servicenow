import {
  EntrustConnectionTestResult,
  testEntrustConnection,
} from "../entrust/entrust-auth-client.ts";

import { EntrustRegion, BASE_URLS, API_VERSION } from "../constants.ts";

import {
  ApiConnectionRepository,
  AliasRecord,
  HttpConnectionRecord,
  OAuthCredentialRecord,
  OAuthEntityRecord,
} from "../repositories/connection-credential-repository.ts";

import {
  validateSaveInput,
  isSupportedRegion,
  SaveConfigInput,
} from "../setup/api-connection-validator.ts";

import { gs } from "@servicenow/glide";

export interface GetConfigResult {
  success: boolean;
  region?: string;
  baseUrl?: string;
  tokenUrl?: string;
  connectionTested?: boolean;
  message?: string;
}

export interface AliasInfoResult {
  success: boolean;
  aliasSysId?: string;
  hasConnection?: boolean;
  message?: string;
}

export interface SaveConfigResult {
  success: boolean;
  message: string;
}

interface ConnectionSetupState {
  alias: AliasRecord;

  connection: HttpConnectionRecord | null;

  credential: OAuthCredentialRecord | null;

  oauthEntity: OAuthEntityRecord | null;

  /**
   * true when the credential was found through
   * http_connection.credential rather than credential_alias.
   *
   * This supports credentials created by the old implementation.
   */
  credentialFoundViaConnection: boolean;
}

interface EnsureCredentialResult {
  credentialSysId: string;

  /**
   * true when this save operation created a brand-new
   * OAuth credential chain.
   */
  created: boolean;

  /**
   * If an existing credential had a broken OAuth chain,
   * we create a replacement first and remove the old chain
   * only after the replacement is successfully attached.
   */
  replacedCredentialSysId?: string;
}

const repo = new ApiConnectionRepository();

// -------------------------------------------------------------------------
// URL helpers
// -------------------------------------------------------------------------

function apiUrl(region: EntrustRegion): string {
  const base = BASE_URLS[region].replace(/\/+$/, "");

  return base + "/" + API_VERSION;
}

function tokenUrl(region: EntrustRegion): string {
  return apiUrl(region) + "/oauth/token";
}

// -------------------------------------------------------------------------
// Setup-state resolution
// -------------------------------------------------------------------------

/**
 * Loads the existing records underneath the packaged alias.
 *
 * No records are created or updated here.
 */
function loadConnectionSetupState(): ConnectionSetupState | null {
  const alias = repo.findAlias();

  if (!alias) {
    gs.warn(
      "[ApiConnection] " + "loadConnectionSetupState: " + "alias not found",
    );

    return null;
  }

  const connection = repo.findHttpConnection(alias.sysId);

  /*
   * Preferred lookup:
   *
   * Alias
   *   └── OAuth Credential
   */
  let credential = repo.findOAuthCredentialByAlias(alias.sysId);

  let credentialFoundViaConnection = false;

  /*
   * Backwards compatibility:
   *
   * Older code attached the credential directly to
   * http_connection but did not populate credential_alias
   * on oauth_2_0_credentials.
   */
  if (!credential && connection?.credentialSysId) {
    credential = repo.findOAuthCredentialById(connection.credentialSysId);

    credentialFoundViaConnection = !!credential;
  }

  const oauthEntity = credential
    ? repo.findOAuthEntity(credential.sysId)
    : null;

  return {
    alias,
    connection,
    credential,
    oauthEntity,
    credentialFoundViaConnection,
  };
}

// -------------------------------------------------------------------------
// HTTP connection reconciliation
// -------------------------------------------------------------------------

function ensureHttpConnection(
  state: ConnectionSetupState,
  connectionUrl: string,
): string | null {
  if (state.connection) {
    gs.info(
      "[ApiConnection] " +
        "ensureHttpConnection: " +
        "existing connection found sysId=" +
        state.connection.sysId,
    );

    const updated = repo.updateHttpConnection(
      state.connection.sysId,
      connectionUrl,
    );

    if (!updated) {
      gs.error(
        "[ApiConnection] " +
          "ensureHttpConnection: " +
          "failed to update existing connection",
      );

      return null;
    }

    return state.connection.sysId;
  }

  gs.info(
    "[ApiConnection] " +
      "ensureHttpConnection: " +
      "no connection found; creating",
  );

  return repo.createHttpConnection(state.alias.sysId, connectionUrl);
}

// -------------------------------------------------------------------------
// OAuth reconciliation
// -------------------------------------------------------------------------

function ensureOAuthCredential(
  state: ConnectionSetupState,
  clientId: string,
  clientSecret: string,
  oauthTokenUrl: string,
): EnsureCredentialResult | null {
  /*
   * Existing credential.
   */
  if (state.credential) {
    /*
     * Migration from the old implementation:
     *
     * Credential was attached to the connection,
     * but credential_alias wasn't populated.
     */
    if (state.credentialFoundViaConnection) {
      gs.info(
        "[ApiConnection] " +
          "ensureOAuthCredential: " +
          "adopting existing credential into alias",
      );

      const assigned = repo.assignCredentialAlias(
        state.credential.sysId,
        state.alias.sysId,
      );

      if (!assigned) {
        gs.error(
          "[ApiConnection] " +
            "ensureOAuthCredential: " +
            "failed to assign credential alias",
        );

        return null;
      }
    }

    /*
     * Complete existing OAuth chain.
     *
     * Update runtime values.
     */
    if (state.oauthEntity) {
      gs.info(
        "[ApiConnection] " +
          "ensureOAuthCredential: " +
          "existing OAuth chain found; updating",
      );

      const updated = repo.updateOAuthCredentials(
        state.oauthEntity.sysId,
        state.oauthEntity.profileSysId,
        clientId,
        clientSecret,
        oauthTokenUrl,
      );

      if (!updated) {
        gs.error(
          "[ApiConnection] " +
            "ensureOAuthCredential: " +
            "failed to update OAuth chain",
        );

        return null;
      }

      return {
        credentialSysId: state.credential.sysId,

        created: false,
      };
    }

    /*
     * Credential exists but its OAuth Profile / Entity
     * chain is incomplete.
     *
     * Do not delete it yet.
     *
     * Create the replacement first, attach it to the
     * HTTP connection, and only then remove the broken
     * credential.
     */
    gs.warn(
      "[ApiConnection] " +
        "ensureOAuthCredential: " +
        "existing credential has broken OAuth chain; " +
        "creating replacement",
    );

    const replacementCredentialSysId = repo.createCredentialChain(
      state.alias.sysId,
      clientId,
      clientSecret,
      oauthTokenUrl,
    );

    if (!replacementCredentialSysId) {
      return null;
    }

    return {
      credentialSysId: replacementCredentialSysId,

      created: true,

      replacedCredentialSysId: state.credential.sysId,
    };
  }

  /*
   * No credential at all.
   */
  gs.info(
    "[ApiConnection] " +
      "ensureOAuthCredential: " +
      "no OAuth credential found; creating",
  );

  const credentialSysId = repo.createCredentialChain(
    state.alias.sysId,
    clientId,
    clientSecret,
    oauthTokenUrl,
  );

  if (!credentialSysId) {
    return null;
  }

  return {
    credentialSysId,
    created: true,
  };
}

// -------------------------------------------------------------------------
// Main reconciliation operation
// -------------------------------------------------------------------------

function saveConnectionDetails(input: SaveConfigInput): boolean {
  const state = loadConnectionSetupState();

  /*
   * Alias is part of the packaged application.
   *
   * We intentionally do not create it dynamically.
   */
  if (!state) {
    gs.error(
      "[ApiConnection] " +
        "saveConnectionDetails: " +
        "connection & credential alias is missing",
    );

    return false;
  }

  const normalisedRegion = input.region.toLowerCase();

  if (!isSupportedRegion(normalisedRegion)) {
    gs.error(
      "[ApiConnection] " +
        "saveConnectionDetails: " +
        "unsupported region=" +
        input.region,
    );

    return false;
  }

  const region = normalisedRegion as EntrustRegion;

  const desiredConnectionUrl = apiUrl(region);

  const desiredTokenUrl = tokenUrl(region);

  // -----------------------------------------------------------------
  // 1. Ensure HTTP connection exists and contains current runtime URL
  // -----------------------------------------------------------------

  const connectionSysId = ensureHttpConnection(state, desiredConnectionUrl);

  if (!connectionSysId) {
    gs.error(
      "[ApiConnection] " +
        "saveConnectionDetails: " +
        "unable to create/update HTTP connection",
    );

    return false;
  }

  /*
   * Region-only save.
   *
   * If credentials were not supplied, do not create or change
   * the OAuth chain.
   */
  if (!input.clientId || !input.clientSecret) {
    gs.info(
      "[ApiConnection] " +
        "saveConnectionDetails: " +
        "no credentials supplied; HTTP connection updated only",
    );

    return true;
  }

  // -----------------------------------------------------------------
  // 2. Ensure OAuth credential chain exists and contains runtime values
  // -----------------------------------------------------------------

  const credentialResult = ensureOAuthCredential(
    state,
    input.clientId,
    input.clientSecret,
    desiredTokenUrl,
  );

  if (!credentialResult) {
    gs.error(
      "[ApiConnection] " +
        "saveConnectionDetails: " +
        "unable to create/update OAuth credential",
    );

    return false;
  }

  // -----------------------------------------------------------------
  // 3. Ensure HTTP connection references the correct credential
  // -----------------------------------------------------------------

  const alreadyAttached =
    state.connection?.sysId === connectionSysId &&
    state.connection?.credentialSysId === credentialResult.credentialSysId;

  if (!alreadyAttached) {
    const attached = repo.attachCredentialToConnection(
      connectionSysId,
      credentialResult.credentialSysId,
    );

    if (!attached) {
      gs.error(
        "[ApiConnection] " +
          "saveConnectionDetails: " +
          "failed to attach credential to HTTP connection",
      );

      /*
       * If this operation created a new credential chain,
       * clean it up rather than leaving orphan records.
       */
      if (credentialResult.created) {
        repo.deleteCredentialChain(credentialResult.credentialSysId);
      }

      return false;
    }
  }

  /*
   * If we replaced a broken credential, it is now safe to
   * remove the old one because the HTTP connection points
   * to the replacement.
   */
  if (credentialResult.replacedCredentialSysId) {
    repo.deleteCredentialChain(credentialResult.replacedCredentialSysId);
  }

  return true;
}

// -------------------------------------------------------------------------
// Read configuration
// -------------------------------------------------------------------------

function isConnectionConfigured(): boolean {
  const state = loadConnectionSetupState();

  if (!state) {
    return false;
  }

  return !!(state.connection && state.credential && state.oauthEntity);
}

export function getConfig(): GetConfigResult {
  try {
    const config = repo.findConfiguration();

    const configured = isConnectionConfigured();

    if (!config) {
      return {
        success: true,

        connectionTested: configured,
      };
    }

    const region = config.region.toLowerCase();

    const supported = isSupportedRegion(region);

    const base = supported ? BASE_URLS[region as EntrustRegion] : "";

    return {
      success: true,

      region: config.region,

      baseUrl: base,

      tokenUrl: base ? tokenUrl(region as EntrustRegion) : "",

      connectionTested: configured,
    };
  } catch (err) {
    gs.error("[ApiConnection] " + "getConfig: " + String(err));

    return {
      success: false,

      message: "Failed to load configuration: " + String(err),
    };
  }
}

// -------------------------------------------------------------------------
// Alias / setup information
// -------------------------------------------------------------------------

export function getAliasInfo(): AliasInfoResult {
  try {
    const alias = repo.findAlias();

    if (!alias) {
      return {
        success: false,

        message: "Connection alias not found.",
      };
    }

    /*
     * Setup state should be determined directly from
     * the http_connection record.
     *
     * Do not use ConnectionInfoProvider here because
     * the credential may legitimately not exist yet.
     */
    const connection = repo.findHttpConnection(alias.sysId);

    return {
      success: true,

      aliasSysId: alias.sysId,

      hasConnection: !!connection,
    };
  } catch (err) {
    gs.error("[ApiConnection] " + "getAliasInfo: " + String(err));

    return {
      success: false,

      message: "Failed to look up connection alias: " + String(err),
    };
  }
}

// -------------------------------------------------------------------------
// Save
// -------------------------------------------------------------------------

export function saveConfig(input: SaveConfigInput): SaveConfigResult {
  const validationError = validateSaveInput(input);

  if (validationError) {
    return {
      success: false,

      message: validationError,
    };
  }

  gs.info(
    "[ApiConnection] " +
      "saveConfig: region=" +
      input.region +
      " hasClientId=" +
      !!input.clientId +
      " hasClientSecret=" +
      !!input.clientSecret,
  );

  try {
    const saved = saveConnectionDetails(input);

    if (!saved) {
      return {
        success: false,

        message: "Failed to save connection configuration.",
      };
    }

    repo.saveRegion(input.region);

    gs.info(
      "[ApiConnection] " + "saveConfig: configuration saved successfully",
    );

    return {
      success: true,

      message: "Configuration saved.",
    };
  } catch (err) {
    gs.error(
      "[ApiConnection] " + "saveConfig: unexpected error: " + String(err),
    );

    return {
      success: false,

      message: "Failed to save configuration: " + String(err),
    };
  }
}

// -------------------------------------------------------------------------
// Test connection
// -------------------------------------------------------------------------

export function testConnection(
  region: string,
  clientId: string,
  clientSecret: string,
): EntrustConnectionTestResult {
  if (!region || !clientId || !clientSecret) {
    return {
      success: false,

      message: "Region, Client ID and Client Secret are all required.",
    };
  }

  const normalised = region.toLowerCase();

  if (!isSupportedRegion(normalised)) {
    return {
      success: false,

      message: "Unsupported region: " + region,
    };
  }

  return testEntrustConnection(
    normalised as EntrustRegion,
    clientId,
    clientSecret,
  );
}
