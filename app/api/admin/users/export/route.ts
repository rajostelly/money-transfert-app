import { type NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    // Require ADMIN role to access this endpoint
    const user = await requireRole(["ADMIN"]);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format_type = searchParams.get("format") || "json";
    const status = searchParams.get("status");
    const role = searchParams.get("role");

    const where: any = {};
    if (status && status !== "all") where.status = status;
    if (role && role !== "all") where.role = role;

    const users = await prisma.user.findMany({
      where,
      include: {
        transfers: {
          where: { status: "COMPLETED" },
        },
        subscriptions: {
          where: { status: "ACTIVE" },
        },
        beneficiaries: {
          where: { isActive: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const usersData = users.map((user) => {
      const totalTransferred = user.transfers.reduce(
        (sum, t) => sum + Number(t.amountCAD),
        0
      );
      const totalFees = user.transfers.reduce(
        (sum, t) => sum + Number(t.feeCAD),
        0
      );

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified ? "Yes" : "No",
        createdAt: format(new Date(user.createdAt), "yyyy-MM-dd HH:mm:ss"),
        lastLogin: user.lastLogin
          ? format(new Date(user.lastLogin), "yyyy-MM-dd HH:mm:ss")
          : "Never",
        totalTransfers: user.transfers.length,
        activeSubscriptions: user.subscriptions.length,
        activeBeneficiaries: user.beneficiaries.length,
        totalTransferred: totalTransferred,
        totalFeesGenerated: totalFees,
      };
    });

    if (format_type === "csv") {
      const csvContent = [
        "USER EXPORT REPORT",
        `Generated: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}`,
        `Total Users: ${usersData.length}`,
        "",
        [
          "ID",
          "Name",
          "Email",
          "Role",
          "Status",
          "Email Verified",
          "Created Date",
          "Last Login",
          "Total Transfers",
          "Active Subscriptions",
          "Active Beneficiaries",
          "Total Transferred (CAD)",
          "Total Fees Generated (CAD)",
        ].join(","),
        ...usersData.map((user) =>
          [
            user.id,
            `"${user.name}"`,
            user.email,
            user.role,
            user.status,
            user.emailVerified,
            user.createdAt,
            user.lastLogin,
            user.totalTransfers,
            user.activeSubscriptions,
            user.activeBeneficiaries,
            user.totalTransferred.toFixed(2),
            user.totalFeesGenerated.toFixed(2),
          ].join(",")
        ),
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="users-export-${format(
            new Date(),
            "yyyy-MM-dd"
          )}.csv"`,
        },
      });
    }

    return NextResponse.json({ users: usersData });
  } catch (error) {
    console.error("Admin users export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
