import { onPostAuthenticationEvent, denyAccess, createKindeAPI } from "@kinde/infrastructure";

export default onPostAuthenticationEvent(async (event) => {
  const kindeAPI = await createKindeAPI(event);
  const { data: user } = await kindeAPI.get({endpoint: `user?id=${event.context.user.id}`});

  const tpKey = process.env.TRUSTPATH_API_KEY!;
  const eventType = event.context.auth.isNewUserRecordCreated ? "account_register" : "account_login";

  const ip = event.request.ip.split(",")[0].trim();
  const payload = {
    ip,
    email: user.preferred_email,
    user: {
      user_id: event.context.user.id,
      first_name: user.first_name,
      last_name: user.last_name
    },
    event_type: eventType
  };

  const resp = await kinde.fetch("https://api.trustpath.io/v1/risk/evaluate", {
    method: "POST",
    headers: { Authorization: `Bearer ${tpKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    responseFormat: "json"
  });

  const state = resp.json.data.score.state;
  if (state === "decline") {
    denyAccess("Access blocked due to impossible travel risk.");
  }
});
