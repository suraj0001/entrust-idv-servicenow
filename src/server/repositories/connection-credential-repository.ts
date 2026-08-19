import { gs, GlideRecord } from "@servicenow/glide";
import { ConnectionInfoProvider } from "@servicenow/glide/sn_cc";
import { ALIAS_ID, CONFIG_TABLE } from "../constants.ts";

export interface ConfigRecord {
  sysId: string;
  region: string;
}

export interface AliasRecord {
  sysId: string;
}

export interface HttpConnectionRecord {
  sysId: string;
  credentialSysId: string;
  connectionUrl: string;
}

export interface OAuthCredentialRecord {
  sysId: string;
}

export interface OAuthEntityRecord {
  sysId: string;
  profileSysId: string;
}

export interface RuntimeConnectionInfo {
  baseUrl: string;
  credentialSysId: string;
}

export interface EntrustRuntimeConnection {
  baseUrl: string;
  oauthProfileId: string;
  requestorContext: string;
  requestorId: string;
}

/**
 * Gets a record by sys_id.
 */
function getRecord(table: string, sysId: string): GlideRecord | null {
  if (!sysId) {
    return null;
  }

  const gr = new GlideRecord(table);

  gr.get(sysId);

  return gr.isValidRecord() ? gr : null;
}

export class ApiConnectionRepository {
  // ---------------------------------------------------------------------
  // Application configuration
  // ---------------------------------------------------------------------

  findConfiguration(): ConfigRecord | null {
    const gr = new GlideRecord(CONFIG_TABLE);

    gr.setLimit(1);
    gr.query();

    if (!gr.next()) {
      return null;
    }

    return {
      sysId: gr.getUniqueValue(),

      region: (gr.getValue("region") as string) || "",
    };
  }

  saveRegion(region: string): void {
    const gr = new GlideRecord(CONFIG_TABLE);

    gr.setLimit(1);
    gr.query();

    if (gr.next()) {
      if ((gr.getValue("region") as string) !== region) {
        gr.setValue("region", region);

        gr.update();
      }

      return;
    }

    gr.initialize();

    gr.setValue("region", region);

    gr.insert();
  }

  // ---------------------------------------------------------------------
  // Alias
  // ---------------------------------------------------------------------

  findAlias(): AliasRecord | null {
    const gr = new GlideRecord("sys_alias");

    gr.addQuery("id", ALIAS_ID);

    gr.setLimit(1);
    gr.query();

    if (!gr.next()) {
      return null;
    }

    return {
      sysId: gr.getUniqueValue(),
    };
  }

  // ---------------------------------------------------------------------
  // HTTP connection
  // ---------------------------------------------------------------------

  findHttpConnection(aliasSysId: string): HttpConnectionRecord | null {
    const gr = new GlideRecord("http_connection");

    gr.addQuery("credential_alias", aliasSysId);

    gr.setLimit(1);
    gr.query();

    if (!gr.next()) {
      return null;
    }

    return {
      sysId: gr.getUniqueValue(),

      credentialSysId: (gr.getValue("credential") as string) || "",

      connectionUrl: (gr.getValue("connection_url") as string) || "",
    };
  }

  /**
   * Kept for compatibility with any existing callers.
   * New setup/service code should use findHttpConnection().
   */
  findRawHttpConnection(aliasSysId: string): HttpConnectionRecord | null {
    return this.findHttpConnection(aliasSysId);
  }

  createHttpConnection(
    aliasSysId: string,
    connectionUrl: string,
  ): string | null {
    const gr = new GlideRecord("http_connection");

    gr.initialize();

    gr.setValue("name", "Entrust IDV Connection");

    gr.setValue("credential_alias", aliasSysId);

    gr.setValue("connection_url", connectionUrl);

    gr.setValue("active", true);

    const sysId = String(gr.insert() || "");

    if (!sysId) {
      gs.error("[ApiConnection] " + "createHttpConnection: insert failed");

      return null;
    }

    gs.info("[ApiConnection] " + "HTTP connection created sysId=" + sysId);

    return sysId;
  }

  updateHttpConnection(
    connectionSysId: string,
    connectionUrl: string,
  ): boolean {
    const gr = getRecord("http_connection", connectionSysId);

    if (!gr) {
      gs.error(
        "[ApiConnection] " +
          "updateHttpConnection: " +
          "connection not found: " +
          connectionSysId,
      );

      return false;
    }

    gr.setValue("connection_url", connectionUrl);

    gr.setValue("active", true);

    gr.update();

    return true;
  }

  attachCredentialToConnection(
    connectionSysId: string,
    credentialSysId: string,
  ): boolean {
    const gr = getRecord("http_connection", connectionSysId);

    if (!gr) {
      gs.error(
        "[ApiConnection] " +
          "attachCredentialToConnection: " +
          "http_connection not found: " +
          connectionSysId,
      );

      return false;
    }

    const existingCredential = (gr.getValue("credential") as string) || "";

    if (existingCredential === credentialSysId) {
      return true;
    }

    gr.setValue("credential", credentialSysId);

    gr.update();

    return true;
  }

  // ---------------------------------------------------------------------
  // OAuth credential
  // ---------------------------------------------------------------------

  findOAuthCredentialByAlias(aliasSysId: string): OAuthCredentialRecord | null {
    const gr = new GlideRecord("oauth_2_0_credentials");

    gr.addQuery("credential_alias", aliasSysId);

    gr.setLimit(1);
    gr.query();

    if (!gr.next()) {
      return null;
    }

    return {
      sysId: gr.getUniqueValue(),
    };
  }

  findOAuthCredentialById(
    credentialSysId: string,
  ): OAuthCredentialRecord | null {
    const gr = getRecord("oauth_2_0_credentials", credentialSysId);

    if (!gr) {
      return null;
    }

    return {
      sysId: gr.getUniqueValue(),
    };
  }

  /**
   * Supports credentials created by the older implementation where
   * the credential was attached to http_connection but credential_alias
   * was not populated on oauth_2_0_credentials.
   */
  assignCredentialAlias(credentialSysId: string, aliasSysId: string): boolean {
    const gr = getRecord("oauth_2_0_credentials", credentialSysId);

    if (!gr) {
      gs.error(
        "[ApiConnection] " +
          "assignCredentialAlias: " +
          "credential not found: " +
          credentialSysId,
      );

      return false;
    }

    const currentAlias = (gr.getValue("credential_alias") as string) || "";

    if (currentAlias === aliasSysId) {
      return true;
    }

    gr.setValue("credential_alias", aliasSysId);

    gr.update();

    return true;
  }

  // ---------------------------------------------------------------------
  // OAuth Entity / Profile
  // ---------------------------------------------------------------------

  findOAuthEntity(credentialSysId: string): OAuthEntityRecord | null {
    const credGr = getRecord("oauth_2_0_credentials", credentialSysId);

    if (!credGr) {
      return null;
    }

    const profileSysId =
      (credGr.getValue("oauth_entity_profile") as string) || "";

    if (!profileSysId) {
      return null;
    }

    const profileGr = getRecord("oauth_entity_profile", profileSysId);

    if (!profileGr) {
      return null;
    }

    const entitySysId = (profileGr.getValue("oauth_entity") as string) || "";

    if (!entitySysId) {
      return null;
    }

    const entityGr = getRecord("oauth_entity", entitySysId);

    if (!entityGr) {
      return null;
    }

    return {
      sysId: entitySysId,

      profileSysId,
    };
  }

  updateOAuthCredentials(
    entitySysId: string,
    profileSysId: string,
    clientId: string,
    clientSecret: string,
    tokenUrl: string,
  ): boolean {
    const entityGr = getRecord("oauth_entity", entitySysId);

    if (!entityGr) {
      gs.error(
        "[ApiConnection] " +
          "updateOAuthCredentials: " +
          "oauth_entity not found: " +
          entitySysId,
      );

      return false;
    }

    entityGr.setValue("client_id", clientId);

    entityGr.setValue("client_secret", clientSecret);

    entityGr.setValue("token_url", tokenUrl);

    entityGr.setValue("refresh_token_url", "");

    entityGr.setValue("default_grant_type", "client_credentials");

    // Entrust / Onfido expects client credentials
    // in the POST body rather than Basic authentication.
    entityGr.setValue("send_client_credentials_as", "request_body_parameter");

    entityGr.update();

    const profileGr = getRecord("oauth_entity_profile", profileSysId);

    if (!profileGr) {
      gs.error(
        "[ApiConnection] " +
          "updateOAuthCredentials: " +
          "oauth_entity_profile not found: " +
          profileSysId,
      );

      return false;
    }

    profileGr.setValue("grant_type", "client_credentials");

    profileGr.setValue("default", true);

    profileGr.update();

    return true;
  }

  /**
   * Creates:
   *
   * oauth_entity
   *      ↓
   * oauth_entity_profile
   *      ↓
   * oauth_2_0_credentials
   *
   * The OAuth credential is associated with the packaged alias.
   */
  createCredentialChain(
    aliasSysId: string,
    clientId: string,
    clientSecret: string,
    tokenUrl: string,
  ): string | null {
    // -------------------------------------------------------------
    // OAuth Entity
    // -------------------------------------------------------------

    const entityGr = new GlideRecord("oauth_entity");

    entityGr.initialize();

    entityGr.setValue("name", "Entrust IDV OAuth");

    entityGr.setValue("type", "consumer");

    entityGr.setValue("client_id", clientId);

    entityGr.setValue("client_secret", clientSecret);

    entityGr.setValue("token_url", tokenUrl);

    entityGr.setValue("refresh_token_url", "");

    entityGr.setValue("default_grant_type", "client_credentials");

    entityGr.setValue("send_client_credentials_as", "request_body_parameter");

    const entitySysId = String(entityGr.insert() || "");

    if (!entitySysId) {
      gs.error(
        "[ApiConnection] " +
          "createCredentialChain: " +
          "oauth_entity insert failed",
      );

      return null;
    }

    // -------------------------------------------------------------
    // OAuth Entity Profile
    // -------------------------------------------------------------

    const profileGr = new GlideRecord("oauth_entity_profile");

    profileGr.initialize();

    profileGr.setValue("name", "Entrust IDV Profile");

    profileGr.setValue("oauth_entity", entitySysId);

    profileGr.setValue("grant_type", "client_credentials");

    profileGr.setValue("default", true);

    const profileSysId = String(profileGr.insert() || "");

    if (!profileSysId) {
      gs.error(
        "[ApiConnection] " +
          "createCredentialChain: " +
          "oauth_entity_profile insert failed",
      );

      // Compensating cleanup
      const entity = getRecord("oauth_entity", entitySysId);

      if (entity) {
        entity.deleteRecord();
      }

      return null;
    }

    // -------------------------------------------------------------
    // OAuth Credential
    // -------------------------------------------------------------

    const credentialGr = new GlideRecord("oauth_2_0_credentials");

    credentialGr.initialize();

    credentialGr.setValue("name", "Entrust IDV Credential");

    credentialGr.setValue("oauth_entity_profile", profileSysId);

    credentialGr.setValue("credential_alias", aliasSysId);

    credentialGr.setValue("active", true);

    const credentialSysId = String(credentialGr.insert() || "");

    if (!credentialSysId) {
      gs.error(
        "[ApiConnection] " +
          "createCredentialChain: " +
          "oauth_2_0_credentials insert failed",
      );

      // Compensating cleanup
      const profile = getRecord("oauth_entity_profile", profileSysId);

      if (profile) {
        profile.deleteRecord();
      }

      const entity = getRecord("oauth_entity", entitySysId);

      if (entity) {
        entity.deleteRecord();
      }

      return null;
    }

    gs.info(
      "[ApiConnection] " +
        "OAuth credential chain created " +
        "credentialSysId=" +
        credentialSysId,
    );

    return credentialSysId;
  }

  /**
   * Used only for compensating cleanup when a newly-created
   * credential cannot ultimately be attached to the connection,
   * or when a broken credential chain is replaced successfully.
   */
  deleteCredentialChain(credentialSysId: string): void {
    const oauth = this.findOAuthEntity(credentialSysId);

    const credentialGr = getRecord("oauth_2_0_credentials", credentialSysId);

    if (credentialGr) {
      credentialGr.deleteRecord();
    }

    if (!oauth) {
      return;
    }

    const profileGr = getRecord("oauth_entity_profile", oauth.profileSysId);

    if (profileGr) {
      profileGr.deleteRecord();
    }

    const entityGr = getRecord("oauth_entity", oauth.sysId);

    if (entityGr) {
      entityGr.deleteRecord();
    }
  }

  // ---------------------------------------------------------------------
  // Runtime resolution
  // ---------------------------------------------------------------------

  getConnectionInfo(aliasSysId: string): RuntimeConnectionInfo | null {
    const provider = new ConnectionInfoProvider();

    const connectionInfo = provider.getConnectionInfo(aliasSysId);

    if (!connectionInfo) {
      return null;
    }

    const baseUrl = String(connectionInfo.getAttribute("connection_url") || "");

    const credentialSysId = String(
      connectionInfo.getCredentialAttribute("sys_id") || "",
    );

    if (!baseUrl || !credentialSysId) {
      return null;
    }

    return {
      baseUrl,
      credentialSysId,
    };
  }

  getRuntimeConnection(): EntrustRuntimeConnection | null {
    const alias = this.findAlias();

    if (!alias) {
      return null;
    }

    const provider = new ConnectionInfoProvider();

    const connectionInfo = provider.getConnectionInfo(alias.sysId);

    if (!connectionInfo) {
      return null;
    }

    const baseUrl = String(connectionInfo.getAttribute("connection_url") || "");

    const credentialSysId = String(
      connectionInfo.getCredentialAttribute("sys_id") || "",
    );

    if (!baseUrl || !credentialSysId) {
      return null;
    }

    const oauthEntity = this.findOAuthEntity(credentialSysId);

    if (!oauthEntity || !oauthEntity.profileSysId) {
      return null;
    }

    return {
      baseUrl: baseUrl.replace(/\/v\d+\.\d+\/?$/, ""),

      oauthProfileId: oauthEntity.profileSysId,

      requestorContext: "oauth_2_0_credentials",

      requestorId: credentialSysId,
    };
  }
}
