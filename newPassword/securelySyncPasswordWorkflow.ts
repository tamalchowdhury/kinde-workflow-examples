import {
  onNewPasswordProvidedEvent,
  WorkflowSettings,
  WorkflowTrigger,
  secureFetch,
} from "@kinde/infrastructure";

// The setting for this workflow
export const workflowSettings: WorkflowSettings = {
  id: "passwordReset",
  name: "Reset password",
  trigger: WorkflowTrigger.NewPasswordProvided,
  bindings: {
    "kinde.env": {}, // required to access your environment variables
    "kinde.secureFetch": {}, // Required for secure external API calls
  },
};

// This workflow requires you to set up your encryption key for the workflow
// This enabled `secureFetch` to encrypt the payload sent to your API
//
// In Settings -> Environment variables set up the following variables with the
// values from the M2M application you created above:
//
// * SECURE_API_URL - The URL of the API you want to send the payload to
//
// Ensure you have the encryption key available in your API to decrypt the payload

// The workflow code to be executed when the event is triggered
export default async function Workflow(event: onNewPasswordProvidedEvent) {
  try {
    const SECURE_API_URL = getEnvironmentVariable("SECURE_API_URL")?.value;

    if (!SECURE_API_URL) {
      throw Error("Endpoint not set");
    }

    // The payload you want to send
    const payload = {
      type: "new_password_provided",
      user: event.context.user,
      newPasswordReason: event.context.auth.newPasswordReason,
    };

    await secureFetch(SECURE_API_URL, {
      method: "POST",
      responseFormat: "json",
      headers: {
        "content-type": "application/json",
      },
      body: payload,
    });
  } catch (error) {
    console.error("error", error);
  }
}
