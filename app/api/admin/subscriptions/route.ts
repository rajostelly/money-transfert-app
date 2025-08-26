import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ACTIVE";
    const format_type = searchParams.get("format") || "json";

    const subscriptions = await prisma.subscription.findMany({
      where: { status },
      include: {
        user: true,
        beneficiary: true,
        transfers: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const subscriptionsData = subscriptions.map((sub) => {
      const totalTransfers = sub.transfers.length;
      const lastTransfer = sub.transfers[0];
      const totalAmountTransferred = sub.transfers
        .filter((t) => t.status === "COMPLETED")
        .reduce((sum, t) => sum + Number(t.amountCAD), 0);

      return {
        id: sub.id,
        user: sub.user.name,
        userEmail: sub.user.email,
        beneficiary: sub.beneficiary.name,
        beneficiaryLocation: `${sub.beneficiary.city}, ${sub.beneficiary.country}`,
        amountCAD: Number(sub.amountCAD),
        frequency: sub.frequency,
        status: sub.status,
        createdAt: format(new Date(sub.createdAt), "yyyy-MM-dd HH:mm:ss"),
        nextTransferDate: sub.nextTransferDate
          ? format(new Date(sub.nextTransferDate), "yyyy-MM-dd")
          : "N/A",
        lastTransferDate: lastTransfer
          ? format(new Date(lastTransfer.createdAt), "yyyy-MM-dd")
          : "N/A",
        lastTransferStatus: lastTransfer?.status || "N/A",
        totalTransfers,
        totalAmountTransferred,
        stripeSubscriptionId: sub.stripeSubscriptionId,
      };
    });

    if (format_type === "csv") {
      const csvContent = [
        "SUBSCRIPTIONS EXPORT",
        `Status Filter: ${status}`,
        `Generated: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}`,
        `Total Subscriptions: ${subscriptionsData.length}`,
        "",
        [
          "ID",
          "User",
          "User Email",
          "Beneficiary",
          "Beneficiary Location",
          "Amount (CAD)",
          "Frequency",
          "Status",
          "Created Date",
          "Next Transfer Date",
          "Last Transfer Date",
          "Last Transfer Status",
          "Total Transfers",
          "Total Amount Transferred (CAD)",
          "Stripe Subscription ID",
        ].join(","),
        ...subscriptionsData.map((sub) =>
          [
            sub.id,
            `"${sub.user}"`,
            sub.userEmail,
            `"${sub.beneficiary}"`,
            `"${sub.beneficiaryLocation}"`,
            sub.amountCAD.toFixed(2),
            sub.frequency,
            sub.status,
            sub.createdAt,
            sub.nextTransferDate,
            sub.lastTransferDate,
            sub.lastTransferStatus,
            sub.totalTransfers,
            sub.totalAmountTransferred.toFixed(2),
            sub.stripeSubscriptionId || "",
          ].join(",")
        ),
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="subscriptions-${status.toLowerCase()}-${format(
            new Date(),
            "yyyy-MM-dd"
          )}.csv"`,
        },
      });
    }

    return NextResponse.json({ subscriptions: subscriptionsData });
  } catch (error) {
    console.error("Admin subscriptions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
