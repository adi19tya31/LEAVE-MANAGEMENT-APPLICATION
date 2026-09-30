import keycloak from "../keycloak";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `https://${window.location.hostname}:5000`;

export async function apiFetch(
  path,
  {
    method = "GET",
    token,
    body,
    signal,
  } = {},
) {
  // ==================================================
  // GET FRESH KEYCLOAK TOKEN
  // ==================================================

  if (keycloak.authenticated) {
    try {
      // Refresh token if it expires within 30 seconds
      await keycloak.updateToken(30);

      // Always use the refreshed Keycloak token
      token = keycloak.token;

    } catch (error) {
      console.error(
        "Failed to refresh Keycloak token:",
        error,
      );

      // Keycloak session is no longer valid
      try {
        await keycloak.login();
      } catch (loginError) {
        console.error(
          "Keycloak login failed:",
          loginError,
        );
      }

      throw new Error(
        "Keycloak session expired. Please login again.",
      );
    }
  }

  // ==================================================
  // REQUEST HEADERS
  // ==================================================

  const headers = {
    ...(body !== undefined
      ? {
          "Content-Type": "application/json",
        }
      : {}),

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };

  // ==================================================
  // API REQUEST
  // ==================================================

  const sendRequest = async () => {
    const response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        method,
        signal,
        headers,
        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,
      },
    );

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    return { response, data };
  };

  let { response, data } = await sendRequest();

  if (
    response.status === 401 &&
    data?.error === "Invalid or expired Keycloak token." &&
    keycloak.authenticated
  ) {
    try {
      await keycloak.updateToken(-1);
      token = keycloak.token;
      headers.Authorization = `Bearer ${token}`;
      ({ response, data } = await sendRequest());
    } catch (error) {
      console.error(
        "Failed to refresh Keycloak token after API rejection:",
        error,
      );

      throw new Error(
        "Keycloak session expired. Please sign in again.",
      );
    }
  }

  // ==================================================
  // HANDLE UNAUTHORIZED
  // ==================================================

  if (response.status === 401) {
    console.error(
      "API returned 401 Unauthorized:",
      data,
    );

    throw new Error(
      data?.error ||
        "Unauthorized. Your Keycloak session may have expired.",
    );
  }

  // ==================================================
  // HANDLE OTHER ERRORS
  // ==================================================

  if (!response.ok) {
    throw new Error(
      data?.error ||
        `Request failed with status ${response.status}`,
    );
  }

  return data;
}

export { API_BASE_URL };