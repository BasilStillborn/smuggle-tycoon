"use client";

import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import type { User } from "./types";

interface AdminState {
  admin: User | null;
  isAdmin: boolean;
  adminLogin: (user: User) => void;
  adminLogout: () => void;
}

const AdminContext = createContext<AdminState | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("forge_admin");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.role === "admin") {
          setAdmin(parsed);
        } else {
          localStorage.removeItem("forge_admin");
        }
      } catch {
        localStorage.removeItem("forge_admin");
      }
    }
  }, []);

  const adminLogin = (user: User) => {
    setAdmin(user);
    localStorage.setItem("forge_admin", JSON.stringify(user));
  };

  const adminLogout = () => {
    setAdmin(null);
    localStorage.removeItem("forge_admin");
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        isAdmin: admin !== null && admin.role === "admin",
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
