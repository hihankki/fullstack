import React from "react";
import { Navigate } from "react-router-dom";

type Role = "guest" | "user" | "admin";

export function RequireAuth({ isLoggedIn, children }: { isLoggedIn: boolean; children: React.ReactNode }) {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RequireRole({
  role,
  allowed,
  children,
}: {
  role: Role;
  allowed: Role[];
  children: React.ReactNode;
}) {
  if (!allowed.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}