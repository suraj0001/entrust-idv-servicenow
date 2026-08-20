import "@servicenow/sdk/global";
import { UiPage } from "@servicenow/sdk/core";

UiPage({
  $id: Now.ID["setup-information-page"],
  endpoint: "x_entru_entrustidv_setup-information.do",
  description: "Configure the Entrust Identity Verification API connection.",
  category: "general",
  html: Now.include("../../../client/setup/setup-information.html"),
  clientScript: Now.include(
    "../../../client/setup/setup-information.client.js",
  ),
  direct: false,
});
