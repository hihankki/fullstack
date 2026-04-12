import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, setAccessToken, getApiUrl } from "../api/http";

type Role = "guest" | "user" | "admin";

type AuthState = {
  isLoggedIn: boolean;
  role: Role;
  fullName: string;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const API_URL = getApiUrl();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>("guest");
  const [fullName, setFullName] = useState("Гость");
  const [loading, setLoading] = useState(true);

  const setGuest = () => {
    setIsLoggedIn(false);
    setRole("guest");
    setFullName("Гость");
    setAccessToken(null);
  };

  const refreshMe = async () => {
    const res = await apiFetch("/api/auth/me");
    if (!res.ok) {
      setGuest();
      return;
    }

    const data = await res.json();
    setIsLoggedIn(true);
    setRole((data.role as Role) ?? "user");
    setFullName(data.full_name ?? data.username);
  };

  useEffect(() => {
    (async () => {
      try {
        await refreshMe();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (username: string, password: string) => {
    const body = new URLSearchParams();
    body.append("username", username);
    body.append("password", password);

    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.detail || "Ошибка входа");
    }

    const data = await res.json();
    setAccessToken(data.access_token);
    await refreshMe();
  };

  const logout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setGuest();
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, role, fullName, loading, login, logout, refreshMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}