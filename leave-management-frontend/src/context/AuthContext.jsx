import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import * as authApi from "../api/authApi";

const STORAGE_KEY = "leave-management-auth";
const AuthContext = createContext(null);

function readStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const stored = readStoredAuth();
  const [token, setToken] = useState(stored?.token || null);
  const [user, setUser] = useState(stored?.user || null);

  const login = useCallback(async (email, password) => {
    const result = await authApi.login(email, password);
    const next = { token: result.token, user: result.employee };
    setToken(next.token);
    setUser(next.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return result;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [token, user, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
