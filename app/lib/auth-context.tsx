"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  roles?: string[];
  isActive?: boolean;
  driverProfile?: {
    truckNo?: string;
    licenseNumber?: string;
    vehicleType?: string;
    status?: string;
  };
  adminProfile?: {
    department?: string;
    designation?: string;
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isDriver: boolean;
  isAdmin: boolean;
  isUser: boolean;
  truckNo: string | null;
  setUser: (u: AuthUser | null) => void;
  logout: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoggedIn: false,
  isDriver: false,
  isAdmin: false,
  isUser: false,
  truckNo: null,
  setUser: () => {},
  logout: async () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("maarg-user");
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage once mounted (avoids SSR mismatch)
  useEffect(() => {
    setUserState(readStoredUser());
    setMounted(true);
  }, []);

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
    if (typeof window !== "undefined") {
      if (u) {
        window.localStorage.setItem("maarg-user", JSON.stringify(u));
      } else {
        window.localStorage.removeItem("maarg-user");
      }
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
      // Non-fatal — clear client state regardless
    }
    setUser(null);
  }, [setUser]);

  const roles = Array.isArray(user?.roles) ? user!.roles : [];
  const isLoggedIn = mounted && user !== null;
  const isAdmin = roles.includes("admin");
  const isDriver = roles.includes("driver");
  const isUser = roles.includes("user");
  const truckNo = user?.driverProfile?.truckNo ?? null;

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn, isDriver, isAdmin, isUser, truckNo, setUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}
