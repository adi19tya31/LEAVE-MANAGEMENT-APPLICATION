import axios from "axios";

const KEYCLOAK_URL = process.env.KEYCLOAK_URL!;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM!;

interface CreateKeycloakUserInput {
  name: string;
  email: string;
  password: string;
}

interface KeycloakUser {
  id: string;
}

export async function createKeycloakUser(
  accessToken: string,
  input: CreateKeycloakUserInput,
): Promise<KeycloakUser> {

  const username = input.email;

  const response = await axios.post(
    `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users`,
    {
      username,
      email: input.email,
      firstName: input.name,
      enabled: true,
      emailVerified: false,

      credentials: [
        {
          type: "password",
          value: input.password,
          temporary: true,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    },
  );

  if (response.status === 409) {
    throw new Error(
      "A Keycloak user with this email already exists.",
    );
  }

  if (response.status === 403) {
    throw new Error(
      "You do not have permission to create users in Keycloak.",
    );
  }

  if (response.status < 200 || response.status >= 300) {
    console.error(
      "Keycloak create user error:",
      response.status,
      response.data,
    );

    throw new Error(
      "Failed to create user in Keycloak.",
    );
  }

  /*
   * Keycloak normally returns the created user's ID
   * in the Location response header.
   */
  const location =
    response.headers.location;

  if (!location) {
    throw new Error(
      "Keycloak created the user but did not return the user ID.",
    );
  }

  const keycloakId =
    location.substring(
      location.lastIndexOf("/") + 1,
    );

  return {
    id: keycloakId,
  };
}