import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Check if any exchange rate exists
    const existingRate = await prisma.exchangeRate.findFirst();

    if (existingRate) {
      return NextResponse.json({
        message: "Exchange rate already exists",
        rate: existingRate,
      });
    }

    // Create initial exchange rate
    const newRate = await prisma.exchangeRate.create({
      data: {
        fromCurrency: "CAD",
        toCurrency: "MGA",
        rate: 3200.0,
      },
    });

    return NextResponse.json({
      message: "Exchange rate initialized successfully",
      rate: newRate,
    });
  } catch (error) {
    console.error("Exchange rate initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize exchange rate" },
      { status: 500 }
    );
  }
}
