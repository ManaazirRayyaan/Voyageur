import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, getStoredTokens, setStoredTokens } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [tokens, setTokens] = useState(() => getStoredTokens());
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(getStoredTokens()));

  useEffect(() => {
    setStoredTokens(tokens);
  }, [tokens]);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      if (!tokens?.access) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        const profile = await apiRequest("/api/profile/", { token: tokens.access });
        if (active) setUser(profile);
      } catch {
        if (active) {
          setTokens(null);
          setUser(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadProfile();
    return () => {
      active = false;
    };
  }, [tokens]);

  const value = useMemo(
    () => ({
      user,
      tokens,
      isLoading,
      isAuthenticated: Boolean(user && tokens?.access),
      async login(payload) {
        const data = await apiRequest("/api/login/", {
          method: "POST",
          body: { identifier: payload.identifier, password: payload.password },
        });
        setTokens({ access: data.access, refresh: data.refresh });
        setUser(data.user);
        return data.user;
      },
      async register(payload) {
        const data = await apiRequest("/api/register/", {
          method: "POST",
          body: payload,
        });
        setTokens({ access: data.access, refresh: data.refresh });
        setUser(data.user);
        return data.user;
      },
      async logout() {
        try {
          if (tokens?.refresh) {
            await apiRequest("/api/logout/", {
              method: "POST",
              body: { refresh: tokens.refresh },
              token: tokens.access,
            });
          }
        } catch {
          // Ignore logout transport failures and clear local auth state.
        } finally {
          setTokens(null);
          setUser(null);
        }
      },
      async refreshProfile() {
        if (!tokens?.access) return null;
        const profile = await apiRequest("/api/profile/", { token: tokens.access });
        setUser(profile);
        return profile;
      },
      async updateProfile(payload) {
        const profile = await apiRequest("/api/profile/update/", {
          method: "PUT",
          body: payload,
          token: tokens.access,
        });
        setUser(profile);
        return profile;
      },
    }),
    [isLoading, tokens, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
