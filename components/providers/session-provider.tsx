"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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
      // Call logout API
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Ensure cookies are sent
      });

      if (response.ok) {
        // Clear user state immediately
        setUser(null);
        // Small delay to ensure state is updated
        await new Promise((resolve) => setTimeout(resolve, 100));
        // Use Next.js router for navigation
        router.push("/auth/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Clear user state anyway and redirect
      setUser(null);
      // Force page reload to clear any cached state
      window.location.href = "/auth/login";
    }
    // Note: Don't set isSigningOut to false here since we're redirecting
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
