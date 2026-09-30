import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import keycloak from "../keycloak";
import { apiFetch } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==================================================
  // GET FRESH KEYCLOAK TOKEN
  // ==================================================

  const getToken = useCallback(async () => {

    if (!keycloak.authenticated) {
      return null;
    }

    try {

      // Refresh token if it will expire within 30 seconds
      await keycloak.updateToken(30);

      return keycloak.token;

    } catch (error) {

      console.error(
        "Failed to refresh Keycloak token:",
        error
      );

      setUser(null);

      return null;
    }

  }, []);

  // ==================================================
  // LOAD APPLICATION USER
  // ==================================================

  const loadUser = useCallback(async () => {

    if (!keycloak.authenticated) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {

      const token = await getToken();

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await apiFetch(
        "/api/auth/me",
        {
          method: "GET",
          token,
        }
      );

      console.log(
        "APPLICATION USER:",
        data.user
      );

      setUser(data.user);

    } catch (error) {

      console.error(
        "Failed to load application user:",
        error
      );

      setUser(null);

    } finally {

      setLoading(false);

    }

  }, [getToken]);

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {

    loadUser();

  }, [loadUser]);

  // ==================================================
  // LOGOUT
  // ==================================================

  const logout = useCallback(async () => {

    try {

      setUser(null);

      await keycloak.logout({
        redirectUri:
          window.location.origin,
      });

    } catch (error) {

      console.error(
        "Keycloak logout failed:",
        error
      );

    }

  }, []);

  // ==================================================
  // CONTEXT VALUE
  // ==================================================

  const value = useMemo(
    () => ({
      token: keycloak.token,
      user,
      loading,
      isAuthenticated:
        Boolean(keycloak.authenticated),

      getToken,
      logout,
      refreshUser: loadUser,
    }),
    [
      user,
      loading,
      getToken,
      logout,
      loadUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const value = useContext(AuthContext);

  if (!value) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return value;
}