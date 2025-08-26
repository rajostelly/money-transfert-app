import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const exchangeRate = await prisma.exchangeRate.findFirst({
      orderBy: { createdAt: "desc" },
    })

    if (!exchangeRate) {
      return NextResponse.json({ error: "Exchange rate not found" }, { status: 404 })
    }

    return NextResponse.json({
      rate: Number(exchangeRate.rate),
      fromCurrency: exchangeRate.fromCurrency,
      toCurrency: exchangeRate.toCurrency,
      updatedAt: exchangeRate.createdAt,
    })
  } catch (error) {
    console.error("Exchange rate fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
