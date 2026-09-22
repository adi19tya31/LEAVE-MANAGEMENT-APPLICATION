import keycloak from "../keycloak";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

export async function apiFetch(
  path,
  {
    method = "GET",
    token,
    body,
    signal,
  } = {}
) {

  if (keycloak.authenticated) {

    try {

      await keycloak.updateToken(30);

    } catch (error) {

      console.error(
        "Failed to refresh Keycloak token:",
        error
      );

      await keycloak.login();
      return;
    }

    token = keycloak.token;
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      method,
      signal,

      headers: {
        ...(body
          ? {
              "Content-Type":
                "application/json",
            }
          : {}),

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),
      },

      body: body
        ? JSON.stringify(body)
        : undefined,
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {}

  if (!response.ok) {

    throw new Error(
      data?.error ||
      `Request failed with status ${response.status}`
    );
  }

  return data;
}

export { API_BASE_URL };