import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { isRead } = updateNotificationSchema.parse(body)

    // Verify notification belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingNotification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    const notification = await prisma.notification.update({
      where: { id: params.id },
      data: { isRead },
    })

    return NextResponse.json(notification)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Notification update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify notification belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingNotification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    await prisma.notification.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Notification deleted successfully" })
  } catch (error) {
    console.error("Notification deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
