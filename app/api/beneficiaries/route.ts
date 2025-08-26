import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createBeneficiarySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  country: z.string().default("Madagascar"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, address, city, country } = createBeneficiarySchema.parse(body)

    const beneficiary = await prisma.beneficiary.create({
      data: {
        userId: session.user.id,
        name,
        phone,
        address: address || null,
        city,
        country,
        isActive: true,
      },
    })

    return NextResponse.json(beneficiary)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Beneficiary creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const beneficiaries = await prisma.beneficiary.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(beneficiaries)
  } catch (error) {
    console.error("Beneficiaries fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
