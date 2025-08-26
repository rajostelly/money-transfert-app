import bcrypt from "bcryptjs";
import { prisma } from "./db";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// Simple JWT-like token creation using base64 encoding (no crypto dependency)
export function createToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: `${user.first_name} ${user.last_name}`,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  return btoa(JSON.stringify(payload));
}

export function verifyToken(token: string): Session | null {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) {
      return null;
    }
    return {
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
    };
  } catch {
    return null;
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  try {
    console.log("[v0] Authenticating user:", email);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log("[v0] Database query result:", user);

    if (!user) {
      console.log("[v0] No user found for email:", email);
      return null;
    }

    console.log("[v0] User data:", user);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log("[v0] Password validation result:", isPasswordValid);

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      first_name: user.name.split(" ")[0] || "User",
      last_name: user.name.split(" ").slice(1).join(" ") || "",
      role: user.role,
    };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export function getRoleBasedRedirect(role: string): string {
  switch (role) {
    case "CLIENT":
      return "/dashboard";
    case "ADMIN":
      return "/admin";
    case "MADAGASCAR_TEAM":
      return "/madagascar";
    default:
      return "/dashboard";
  }
}

export const authOptions = {
  // This is a placeholder for backward compatibility
  // The actual auth logic is now handled by the custom functions above
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
};
