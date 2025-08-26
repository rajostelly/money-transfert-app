import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ user: null })
  }
}
