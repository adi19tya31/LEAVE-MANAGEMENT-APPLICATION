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

  const loadUser = useCallback(async () => {
    if (!keycloak.authenticated) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch("/api/auth/me");

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
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

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

  const value = useMemo(
    () => ({
      token: keycloak.token,
      user,
      loading,
      isAuthenticated:
        Boolean(keycloak.authenticated),
      logout,
      refreshUser: loadUser,
    }),
    [
      user,
      loading,
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
  const value =
    useContext(AuthContext);

  if (!value) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return value;
}