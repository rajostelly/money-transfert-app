import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    let exchangeRate = await prisma.exchangeRate.findFirst({
      orderBy: { createdAt: "desc" },
    });

    // If no exchange rate exists, create a default one
    if (!exchangeRate) {
      exchangeRate = await prisma.exchangeRate.create({
        data: {
          fromCurrency: "CAD",
          toCurrency: "MGA",
          rate: 3200.0,
        },
      });
    }

    return NextResponse.json({
      rate: Number(exchangeRate.rate),
      fromCurrency: exchangeRate.fromCurrency,
      toCurrency: exchangeRate.toCurrency,
      updatedAt: exchangeRate.createdAt,
    });
  } catch (error) {
    console.error("Exchange rate fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
