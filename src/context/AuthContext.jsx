import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { login as loginApi, logout as logoutApi, refresh as refreshApi, register as registerApi } from "../api/auth";
import { getProfile } from "../api/user";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  setAuthFailureHandler,
  setSessionRefreshHandler
} from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const establishSession = useCallback((session) => {
    if (session?.accessToken) {
      setAccessToken(session.accessToken);
    }
    if (session?.user) {
      setUser(session.user);
    }
  }, []);

  const clearSession = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const session = await loginApi(credentials);
      establishSession(session);
      return session;
    },
    [establishSession]
  );

  const register = useCallback(
    async (payload) => {
      const session = await registerApi(payload);
      establishSession(session);
      return session;
    },
    [establishSession]
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refreshSession = useCallback(async () => {
    const session = await refreshApi();
    establishSession(session);
    return session;
  }, [establishSession]);

  useEffect(() => {
    setAuthFailureHandler(clearSession);
    setSessionRefreshHandler((session) => {
      establishSession(session);
    });

    return () => {
      setAuthFailureHandler(() => {});
      setSessionRefreshHandler(() => {});
    };
  }, [clearSession, establishSession]);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const token = getAccessToken();

      try {
        if (token) {
          try {
            const profile = await getProfile();
            if (mounted) {
              setUser(profile);
            }
          } catch {
            const session = await refreshApi();
            if (mounted) {
              establishSession(session);
            }
          }
        } else {
          const session = await refreshApi();
          if (mounted) {
            establishSession(session);
          }
        }
      } catch {
        if (mounted) {
          clearSession();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [clearSession, establishSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user && getAccessToken()),
      setUser,
      login,
      register,
      logout,
      refreshSession
    }),
    [user, loading, login, register, logout, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used inside AuthProvider");
  return context;
}
