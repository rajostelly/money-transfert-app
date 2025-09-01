"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSigningOut: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // User not logged in
      })
      .finally(() => setLoading(false));
  }, []);

  const signOut = async () => {
    if (isSigningOut) return; // Prevent multiple simultaneous logout requests

    setIsSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect to login on error
      window.location.href = "/auth/login";
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isSigningOut, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSession must be used within an AuthSessionProvider");
  }
  return {
    data: context.user ? { user: context.user } : null,
    status: context.loading ? "loading" : "authenticated",
  };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthSessionProvider");
  }
  return context;
}
