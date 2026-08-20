import { Acl } from "@servicenow/sdk/core";
import { webhookRole } from "../security/roles.now.ts";

export const webhookRestAcl = Acl({
  $id: Now.ID["idv-webhook-rest-acl"],
  name: "Identity Verification Webhook",
  type: "rest_endpoint",
  operation: "execute",
  active: true,
  adminOverrides: false,
  roles: [webhookRole],
});
