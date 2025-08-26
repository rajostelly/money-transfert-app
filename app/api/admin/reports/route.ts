import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
} from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "daily";
    const date =
      searchParams.get("date") || new Date().toISOString().split("T")[0];
    const format_type = searchParams.get("format") || "json";

    let startDate: Date;
    let endDate: Date;

    switch (reportType) {
      case "daily":
        startDate = startOfDay(new Date(date));
        endDate = endOfDay(new Date(date));
        break;
      case "monthly":
        startDate = startOfMonth(new Date(date));
        endDate = endOfMonth(new Date(date));
        break;
      case "period":
        const endDateParam = searchParams.get("endDate");
        startDate = startOfDay(new Date(date));
        endDate = endOfDay(new Date(endDateParam || date));
        break;
      default:
        startDate = startOfDay(new Date(date));
        endDate = endOfDay(new Date(date));
    }

    // Get transfers for the period
    const transfers = await prisma.transfer.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: true,
        beneficiary: true,
        subscription: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Get all users created in period
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calculate statistics
    const completedTransfers = transfers.filter(
      (t) => t.status === "COMPLETED"
    );
    const pendingTransfers = transfers.filter((t) => t.status === "PENDING");
    const failedTransfers = transfers.filter((t) => t.status === "FAILED");

    const totalVolume = completedTransfers.reduce(
      (sum, t) => sum + Number(t.amountCAD),
      0
    );
    const totalFees = completedTransfers.reduce(
      (sum, t) => sum + Number(t.feeCAD),
      0
    );
    const totalRevenue = totalFees;

    const subscriptionTransfers = transfers.filter(
      (t) => t.type === "SUBSCRIPTION"
    );
    const oneTimeTransfers = transfers.filter((t) => t.type === "ONE_TIME");

    const reportData = {
      period: {
        type: reportType,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      },
      summary: {
        totalTransfers: transfers.length,
        completedTransfers: completedTransfers.length,
        pendingTransfers: pendingTransfers.length,
        failedTransfers: failedTransfers.length,
        newUsers,
        totalVolume,
        totalFees,
        totalRevenue,
        averageTransferAmount:
          completedTransfers.length > 0
            ? totalVolume / completedTransfers.length
            : 0,
      },
      breakdown: {
        byType: {
          subscription: subscriptionTransfers.length,
          oneTime: oneTimeTransfers.length,
        },
        byStatus: {
          completed: completedTransfers.length,
          pending: pendingTransfers.length,
          failed: failedTransfers.length,
          processing: transfers.filter((t) => t.status === "PROCESSING").length,
          cancelled: transfers.filter((t) => t.status === "CANCELLED").length,
        },
      },
      transfers: transfers.map((transfer) => ({
        id: transfer.id,
        date: format(new Date(transfer.createdAt), "yyyy-MM-dd HH:mm:ss"),
        sender: transfer.user.name,
        senderEmail: transfer.user.email,
        beneficiary: transfer.beneficiary.name,
        amountCAD: Number(transfer.amountCAD),
        amountMGA: Number(transfer.amountMGA),
        feeCAD: Number(transfer.feeCAD),
        exchangeRate: Number(transfer.exchangeRate),
        status: transfer.status,
        type: transfer.type,
        isSubscription: !!transfer.subscriptionId,
      })),
    };

    if (format_type === "csv") {
      const csvContent = [
        // Summary section
        "FINANCIAL REPORT",
        `Period: ${reportData.period.startDate} to ${reportData.period.endDate}`,
        `Generated: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}`,
        "",
        "SUMMARY",
        `Total Transfers,${reportData.summary.totalTransfers}`,
        `Completed Transfers,${reportData.summary.completedTransfers}`,
        `Pending Transfers,${reportData.summary.pendingTransfers}`,
        `Failed Transfers,${reportData.summary.failedTransfers}`,
        `New Users,${reportData.summary.newUsers}`,
        `Total Volume (CAD),$${reportData.summary.totalVolume.toFixed(2)}`,
        `Total Fees (CAD),$${reportData.summary.totalFees.toFixed(2)}`,
        `Total Revenue (CAD),$${reportData.summary.totalRevenue.toFixed(2)}`,
        `Average Transfer Amount (CAD),$${reportData.summary.averageTransferAmount.toFixed(
          2
        )}`,
        "",
        "TRANSFERS DETAIL",
        [
          "Date",
          "Sender",
          "Sender Email",
          "Beneficiary",
          "Amount CAD",
          "Amount MGA",
          "Fee CAD",
          "Exchange Rate",
          "Status",
          "Type",
        ].join(","),
        ...reportData.transfers.map((transfer) =>
          [
            transfer.date,
            `"${transfer.sender}"`,
            transfer.senderEmail,
            `"${transfer.beneficiary}"`,
            transfer.amountCAD.toFixed(2),
            transfer.amountMGA.toFixed(2),
            transfer.feeCAD.toFixed(2),
            transfer.exchangeRate.toFixed(2),
            transfer.status,
            transfer.type,
          ].join(",")
        ),
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="financial-report-${reportData.period.startDate}-to-${reportData.period.endDate}.csv"`,
        },
      });
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Admin reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
