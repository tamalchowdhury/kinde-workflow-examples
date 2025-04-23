import {
  onPostAuthenticationEvent,
  WorkflowSettings,
  WorkflowTrigger,
  getEnvironmentVariable,
  createKindeAPI,
  fetch,
} from "@kinde/infrastructure";

// The settings for this workflow
export const workflowSettings: WorkflowSettings = {
  id: "postAuthentication",
  name: "HubspotSync",
  failurePolicy: {
    action: "stop",
  },
  trigger: WorkflowTrigger.PostAuthentication,
  bindings: {
    "kinde.env": {},
    "kinde.fetch": {},
    url: {},
  },
};

// This workflow requires you to set up the Kinde management API
// You can do this by going to the Kinde dashboard.
//
// Create an M2M application with the following scopes enabled:
// * read:user_properties
// * read:users
//
// In Settings -> Environment variables set up the following variables with the
// values from the M2M application you created above:
//
// * KINDE_WF_M2M_CLIENT_ID
// * KINDE_WF_M2M_CLIENT_SECRET - Ensure this is setup with sensitive flag
// enabled to prevent accidental sharing
//
// Add 2 more variables with the following keys:
// * HUBSPOT_TOKEN - The token for the Hubspot API
// * HUBSPOT_CONTACT_OWNER_ID - The ID of the Hubspot contact owner
// This will be used to set the owner of the contact in Hubspot.

// The workflow code to be executed when the event is triggered
export default async function handlePostAuth(event: onPostAuthenticationEvent) {
  const isNewKindeUser = event.context.auth.isNewUserRecordCreated;

  // The user has been added to the Kinde user pool for the first time
  if (isNewKindeUser) {
    // Get a token for Kinde management API
    const kindeAPI = await createKindeAPI(event);

    const userId = event.context.user.id;

    // Call Kinde user properties API to get UTM tags
    const { data } = await kindeAPI.get({
      endpoint: `users/${userId}/properties`,
    });
    const { properties } = data;

    const propertiesToGetValuesFor = new Set([
      "kp_usr_utm_campaign",
      "kp_usr_utm_content",
      "kp_usr_utm_medium",
      "kp_usr_utm_source",
      "kp_usr_utm_term",
    ]);

    function extractMatchingProperties(
      props: Array<{ key: string; value: string }>
    ) {
      return props.reduce((acc, property) => {
        if (propertiesToGetValuesFor.has(property.key)) {
          acc[property.key] = property.value;
        }

        return acc;
      }, {} as Record<string, string>);
    }

    // Extract the properties that match the keys in the Set
    const props = extractMatchingProperties(properties);

    // call user api
    const { data: user } = await kindeAPI.get({
      endpoint: `user?id=${userId}`,
    });

    // Map the Kinde user data to Hubspot properties
    const hubspotProperties = {
      email: user.preferred_email,
      firstname: user.first_name,
      lastname: user.last_name,
      hs_facebook_click_id: props.kp_org_fbclid,
      hs_google_click_id: props.kp_org_gclid,
      hubspot_owner_id: getEnvironmentVariable("HUBSPOT_CONTACT_OWNER_ID")
        ?.value,
      utm_campaign: props.kp_org_utm_campaign,
      utm_content: props.kp_org_utm_content,
      utm_medium: props.kp_org_utm_medium,
      utm_source: props.kp_org_utm_source,
      utm_term: props.kp_org_utm_term,
    };

    // Get the Hubspot token from your Kinde environment variables
    const HUBSPOT_TOKEN = getEnvironmentVariable("HUBSPOT_TOKEN")?.value;

    // POST TO HUBSPOT API
    const { data: hubspotData } = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        body: {
          properties: hubspotProperties,
        },
        headers: {
          Authorization: `Bearer ${HUBSPOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      }
    );
  }
}
