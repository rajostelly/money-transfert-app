import { prisma } from "./prisma";

// Re-export prisma for convenience
export { prisma };

export async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function createUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  phone?: string;
}) {
  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        phone: data.phone,
        role: (data.role as any) || "CLIENT",
        status: "ACTIVE",
      },
    });
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}

export async function updateUser(
  id: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    status: string;
  }>
) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        status: data.status as any,
      },
    });
    return user;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}
