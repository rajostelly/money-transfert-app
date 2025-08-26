import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const transfer = await prisma.transfer.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        beneficiary: true,
        subscription: true,
        user: true,
      },
    })

    if (!transfer) {
      return NextResponse.json({ error: "Transfer not found" }, { status: 404 })
    }

    return NextResponse.json(transfer)
  } catch (error) {
    console.error("Transfer fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
