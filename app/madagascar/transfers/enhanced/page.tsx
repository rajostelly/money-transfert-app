import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { MadagascarTransfersClient } from "@/components/madagascar/madagascar-transfers-client";

interface SearchParams {
  dateFrom?: string;
  dateTo?: string;
  minAmount?: string;
  maxAmount?: string;
  beneficiary?: string;
  operator?: string;
  status?: string;
  search?: string;
}

async function getFilteredTransfers(searchParams: SearchParams) {
  const where: any = {};

  // Date filtering
  if (searchParams.dateFrom || searchParams.dateTo) {
    where.createdAt = {};
    if (searchParams.dateFrom) {
      where.createdAt.gte = new Date(searchParams.dateFrom);
    }
    if (searchParams.dateTo) {
      where.createdAt.lte = new Date(searchParams.dateTo + "T23:59:59.999Z");
    }
  }

  // Amount filtering (MGA)
  if (searchParams.minAmount || searchParams.maxAmount) {
    where.amountMGA = {};
    if (searchParams.minAmount) {
      where.amountMGA.gte = Number(searchParams.minAmount);
    }
    if (searchParams.maxAmount) {
      where.amountMGA.lte = Number(searchParams.maxAmount);
    }
  }

  // Beneficiary filtering
  if (searchParams.beneficiary) {
    where.beneficiaryId = searchParams.beneficiary;
  }

  // Operator filtering
  if (searchParams.operator) {
    where.beneficiary = {
      operator: searchParams.operator,
    };
  }

  // Status filtering
  if (searchParams.status) {
    where.status = searchParams.status;
  }

  // Search filtering
  if (searchParams.search) {
    where.OR = [
      {
        beneficiary: {
          name: {
            contains: searchParams.search,
            mode: "insensitive",
          },
        },
      },
      {
        beneficiary: {
          phone: {
            contains: searchParams.search,
            mode: "insensitive",
          },
        },
      },
      {
        id: {
          contains: searchParams.search,
          mode: "insensitive",
        },
      },
    ];
  }

  return await prisma.transfer.findMany({
    where,
    include: {
      user: true,
      beneficiary: true,
    },
    orderBy: [
      { status: "asc" }, // Pending first
      { createdAt: "desc" },
    ],
  });
}

async function getBeneficiaries() {
  return await prisma.beneficiary.findMany({
    where: { isActive: true },
    select: { id: true, name: true, operator: true },
    orderBy: { name: "asc" },
  });
}

async function getOperators() {
  const beneficiaries = await prisma.beneficiary.findMany({
    where: {
      isActive: true,
      operator: { not: null },
    },
    select: { operator: true },
    distinct: ["operator"],
  });

  return beneficiaries.map((b) => b.operator).filter(Boolean) as string[];
}

export default async function MadagascarTransfersPageEnhanced({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireRole(["MADAGASCAR_TEAM"]);

  const [transfers, beneficiaries, operators] = await Promise.all([
    getFilteredTransfers(searchParams),
    getBeneficiaries(),
    getOperators(),
  ]);

  return (
    <MadagascarTransfersClient
      transfers={transfers}
      beneficiaries={beneficiaries}
      operators={operators}
      user={user}
    />
  );
}
