import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { NotificationService } from "@/lib/notification-service"

const createTransferSchema = z.object({
  beneficiaryId: z.string().min(1, "Beneficiary is required"),
  amountCAD: z.number().min(10, "Minimum amount is $10").max(5000, "Maximum amount is $5000"),
  type: z.enum(["ONE_TIME", "SUBSCRIPTION"]),
  subscriptionId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { beneficiaryId, amountCAD, type, subscriptionId } = createTransferSchema.parse(body)

    // Verify beneficiary belongs to user
    const beneficiary = await prisma.beneficiary.findFirst({
      where: {
        id: beneficiaryId,
        userId: session.user.id,
        isActive: true,
      },
    })

    if (!beneficiary) {
      return NextResponse.json({ error: "Beneficiary not found" }, { status: 404 })
    }

    // Get current exchange rate
    const exchangeRate = await prisma.exchangeRate.findFirst({
      orderBy: { createdAt: "desc" },
    })

    if (!exchangeRate) {
      return NextResponse.json({ error: "Exchange rate not available" }, { status: 500 })
    }

    // Calculate amounts
    const rate = Number(exchangeRate.rate)
    const amountMGA = amountCAD * rate
    const feeCAD = amountCAD * 0.025
    const totalCAD = amountCAD + feeCAD

    // Create transfer
    const transfer = await prisma.transfer.create({
      data: {
        userId: session.user.id,
        beneficiaryId,
        subscriptionId: subscriptionId || null,
        amountCAD,
        amountMGA,
        exchangeRate: rate,
        feeCAD,
        totalCAD,
        type,
        status: "PENDING",
      },
      include: {
        beneficiary: true,
        user: true,
      },
    })

    try {
      await NotificationService.createNotification(
        session.user.id,
        "TRANSFER_REMINDER",
        "Transfer Created",
        `Your transfer of $${amountCAD} CAD to ${beneficiary.name} has been created and is being processed.`,
      )
    } catch (notificationError) {
      console.error("Failed to create notification:", notificationError)
      // Don't fail the transfer if notification fails
    }

    return NextResponse.json(transfer)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Transfer creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const type = searchParams.get("type")

    const where: any = { userId: session.user.id }
    if (status) where.status = status
    if (type) where.type = type

    const transfers = await prisma.transfer.findMany({
      where,
      include: {
        beneficiary: true,
        subscription: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(transfers)
  } catch (error) {
    console.error("Transfers fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
