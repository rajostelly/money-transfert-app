import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const count = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Unread count fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
