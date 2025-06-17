import { onPostAuthenticationEvent, denyAccess, createKindeAPI } from "@kinde/infrastructure";

export const workflowSettings = {
  id: "impossibleTravelCheck",
  trigger: "user:post_authentication",
  bindings: {
    "kinde.auth": {},
    "kinde.secureFetch": {}
  }
};

export default onPostAuthenticationEvent(async (event) => {
  const kindeAPI = await createKindeAPI(event);
  const { data: user } = await kindeAPI.get({ endpoint: `user?id=${event.context.user.id}` });

  const payload = {
    ip: event.request.ip.split(",")[0].trim(),
    email: user.preferred_email,
    user: {
      user_id: event.context.user.id,
      first_name: user.first_name,
      last_name: user.last_name
    },
    event_type: event.context.auth.isNewUserRecordCreated
      ? "account_register"
      : "account_login"
  };

  const resp = await kinde.secureFetch("https://api.trustpath.io/v1/risk/evaluate", {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${process.env.TRUSTPATH_API_KEY}`, 
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const { state } = (await resp.json()).data.score;
  if (state === "decline") {
    denyAccess("Access blocked due to impossible travel risk.");
  }
});
