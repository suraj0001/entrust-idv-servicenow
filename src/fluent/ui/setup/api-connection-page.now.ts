import "@servicenow/sdk/global";
import { UiPage } from "@servicenow/sdk/core";

UiPage({
  $id: Now.ID["entrust_idv_connection-setup-page"],
  endpoint: "x_entru_entrustidv_entrust_api_connection_setup.do",
  description: "Configure the Entrust Identity Verification API connection.",
  category: "general",
  html: Now.include("../../../client/setup/api-connection.html"),
  clientScript: Now.include("../../../client/setup/api-connection.client.js"),
  direct: false,
});
