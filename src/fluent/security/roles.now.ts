import "@servicenow/sdk/global";
import { Role } from "@servicenow/sdk/core";

export const adminRole = Role({
  $id: Now.ID["idv_admin_role"],
  name: "x_entru_entrustidv.admin",
  description:
    "Allows administrators to configure and manage Entrust Identity Verification.",
  canDelegate: false,
});

export const agentRole = Role({
  $id: Now.ID["idv_agent_role"],
  name: "x_entru_entrustidv.agent",
  description: "Allows agents to initiate and view identity verification.",
  canDelegate: false,
});

export const webhookRole = Role({
  $id: Now.ID["idv-webhook-role"],
  name: "x_entru_entrustidv.webhook",
  description:
    "Allows an integration user to invoke the authenticated Identity Verification webhook endpoint.",
  canDelegate: false,
  grantable: true,
});
