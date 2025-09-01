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
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  useEffect(() => {
    // Don't check auth if user just logged out
    if (hasLoggedOut) {
      setLoading(false);
      return;
    }

    // Check if user is logged in on mount
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user && !hasLoggedOut) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // User not logged in
      })
      .finally(() => setLoading(false));
  }, [hasLoggedOut]);

  const signOut = async () => {
    if (isSigningOut) return; // Prevent multiple simultaneous logout requests

    setIsSigningOut(true);
    setHasLoggedOut(true); // Mark that logout has been initiated

    // Clear user state immediately to update UI
    setUser(null);

    try {
      // Call logout API to clear server-side session
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Ensure cookies are sent
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      console.log("Logout API response:", response.status);
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with logout even if API fails
    }

    // Clear any potential client-side storage
    if (typeof window !== "undefined") {
      // Clear localStorage
      localStorage.clear();
      // Clear sessionStorage
      sessionStorage.clear();
    }

    // Always redirect after logout attempt with longer delay
    setTimeout(() => {
      console.log("Redirecting to login...");
      window.location.replace("/auth/login"); // Use replace instead of href
    }, 100);
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
