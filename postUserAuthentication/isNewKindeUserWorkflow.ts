import {
  onPostAuthenticationEvent,
  WorkflowSettings,
  WorkflowTrigger,
} from "@kinde/infrastructure";

// The settings for this workflow
export const workflowSettings: WorkflowSettings = {
  id: "postAuthentication",
  name: "Post authentication",
  failurePolicy: {
    action: "stop",
  },
  trigger: WorkflowTrigger.PostAuthentication,
};

// The workflow code to be executed when the event is triggered
export default async function handlePostAuth(event: onPostAuthenticationEvent) {
  const isNewKindeUser = event.context.auth.isNewUserRecordCreated;

  // The user has been added to the Kinde user pool for the first time
  if (isNewKindeUser) {
    // do something
    console.log("New Kinde user created");
  }
}
