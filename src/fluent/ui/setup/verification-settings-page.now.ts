import "@servicenow/sdk/global";
import { UiPage } from "@servicenow/sdk/core";

UiPage({
  $id: Now.ID["verification-settings-setup-page"],
  endpoint: "x_entru_entrustidv_verification_settings_setup.do",
  description: "Configure the Entrust Identity Verification settings.",
  category: "general",
  html: Now.include("../../../client/setup/verification-settings.html"),
  clientScript: Now.include(
    "../../../client/setup/verification-settings.client.js",
  ),
  direct: false,
});
