import { RestApi } from "@servicenow/sdk/core";
import { processWebhook } from "../../server/webhook/webhook-handler.ts";
import { webhookRestAcl } from "../security/webhook-rest-acl.now.ts";

RestApi({
  $id: Now.ID["entrust-idv-webhook-api"],

  name: "Identity Verification Webhook",

  serviceId: "entrust-idv",

  active: true,

  shortDescription:
    "Receives identity verification webhook events from Entrust Identity Verification.",

  consumes: "application/json",

  enforceAcl: [],

  routes: [
    {
      $id: Now.ID["idv-webhook-public-route"],

      name: "Identity Verification Webhook",

      path: "/webhook/events",

      method: "POST",

      script: processWebhook,

      authorization: false,

      authentication: false,

      internalRole: false,

      enforceAcl: [],
    },

    {
      $id: Now.ID["idv-webhook-oauth-route"],

      name: "Identity Verification OAuth Webhook",

      path: "/webhook/events/oauth",

      method: "POST",

      script: processWebhook,

      authorization: true,

      authentication: true,

      internalRole: false,

      enforceAcl: [webhookRestAcl],
    },
  ],
});
