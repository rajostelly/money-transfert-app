import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const limit = searchParams.get("limit")

    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    const transfers = await prisma.transfer.findMany({
      where,
      include: {
        user: true,
        beneficiary: true,
        subscription: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit ? Number.parseInt(limit) : undefined,
    })

    return NextResponse.json(transfers)
  } catch (error) {
    console.error("Admin transfers fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
