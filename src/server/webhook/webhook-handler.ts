import { gs, GlideRecord } from "@servicenow/glide";

export interface WebhookHandleResult {
  status: "success" | "ignored" | "not_found" | "error";
  message?: string;
}

interface WorkflowRunPayload {
  payload?: {
    action?: string;
    resource_type?: string;
    resource?: {
      id?: string;
      applicant_id?: string;
      workflow_id?: string;
      status?: string;
      output?: { workflow_output?: string };
    };
    object?: {
      id?: string;
      status?: string;
      completed_at_iso8601?: string;
    };
  };
}

export function processWebhook(_body: WorkflowRunPayload): WebhookHandleResult {
  // TODO: re-implement using the new verification_request schema (source_table/source_record)
  gs.info(
    "[IDV_WEBHOOK] Webhook received — processing temporarily disabled pending schema migration.",
  );
  return { status: "ignored" };

  return { status: "success" };
}
