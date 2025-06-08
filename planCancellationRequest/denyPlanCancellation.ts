import {
  onPlanCancellationRequestEvent,
  WorkflowSettings,
  WorkflowTrigger,
  denyPlanCancellation,
} from "@kinde/infrastructure";

// The setting for this workflow
export const workflowSettings: WorkflowSettings = {
  id: "onUserPlanCancellationRequest",
  trigger: WorkflowTrigger.UserPlanCancellationRequest,
  failurePolicy: {
    action: "stop",
  },
  bindings: {
    "kinde.plan": {},
  },
};

// This workflow demonstrates denying a plan cancellation

// The workflow code to be executed when the event is triggered
export default async function Workflow(event: onPlanCancellationRequestEvent) {
  //    some code here to check if user can perform the plan cancellation
  denyPlanCancellation(
    "The plan cancellation request cannot be processed at this time as you are currently in breach of the terms of service."
  );
}
