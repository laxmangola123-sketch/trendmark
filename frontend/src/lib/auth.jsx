import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  api,
  saveAuth,
  clearAuth,
  getStoredUser,
  getToken,
} from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(!!getToken());

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const { data } = await api.get("/auth/me");

      setUser(data.user);

      saveAuth({
        token: getToken(),
        user: data.user,
      });

      return data.user;
    } catch (err) {
      clearAuth();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", {
      email,
      password,
    });

    saveAuth(data);

    setUser(data.user);

    return data.user;
  };

  const signup = async (name, email, password) => {
    const { data } = await api.post("/auth/signup", {
      name,
      email,
      password,
    });

    saveAuth(data);

    setUser(data.user);

    return data.user;
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refresh,
        setUser,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);