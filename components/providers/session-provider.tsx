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

    // Clear user state immediately to update UI
    setUser(null);

    try {
      // Call logout API to clear server-side session
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Ensure cookies are sent
      });
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with logout even if API fails
    }

    // Always redirect after logout attempt
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      window.location.href = "/auth/login";
    }, 50);
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
    status: context.loading
      ? "loading"
      : context.user
      ? "authenticated"
      : "unauthenticated",
  };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthSessionProvider");
  }
  return context;
}
