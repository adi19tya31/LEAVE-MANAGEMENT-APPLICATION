import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import keycloak from "../keycloak";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(keycloak.token || null);
  const [user, setUser] = useState(keycloak.tokenParsed || null);

  const logout = useCallback(async () => {
    try {
      setToken(null);
      setUser(null);

      localStorage.removeItem("leave-management-auth");

      await keycloak.logout({
        redirectUri: `${window.location.origin}/`,
      });
    } catch (error) {
      console.error("Keycloak logout failed:", error);
    }
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(keycloak.authenticated),
      logout,
    }),
    [token, user, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
