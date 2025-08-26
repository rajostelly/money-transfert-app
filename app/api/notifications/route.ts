import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createNotificationSchema = z.object({
  userId: z.string(),
  type: z.enum([
    "TRANSFER_REMINDER",
    "TRANSFER_COMPLETED",
    "TRANSFER_FAILED",
    "SUBSCRIPTION_CREATED",
    "SUBSCRIPTION_CANCELLED",
    "PAYMENT_FAILED",
  ]),
  title: z.string(),
  message: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, type, title, message } = createNotificationSchema.parse(body)

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        isRead: false,
      },
    })

    return NextResponse.json(notification)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Notification creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Notifications fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
