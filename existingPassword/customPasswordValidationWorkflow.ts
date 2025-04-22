import {
  onExistingPasswordProvidedEvent,
  WorkflowSettings,
  WorkflowTrigger,
  invalidateFormField,
} from "@kinde/infrastructure";

// The setting for this workflow
export const workflowSettings: WorkflowSettings = {
  id: "onExistingPasswordProvided",
  trigger: WorkflowTrigger.ExistingPasswordProvided,
  failurePolicy: {
    action: "stop",
  },
  bindings: {
    "kinde.widget": {}, // Required for accessing the UI
  },
};

// The workflow code to be executed when the event is triggered
export default async function Workflow(event: onExistingPasswordProvidedEvent) {
  const isMinCharacters = context.auth.Password.length >= 50;

  if (!isMinCharacters) {
    // Custom form validation
    invalidateFormField(
      "p_first_password",
      "Your password must be at least 50 characters long"
    );
  }
}
