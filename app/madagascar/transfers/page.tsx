import { requireRole } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Phone, MapPin } from "lucide-react"
import { format } from "date-fns"

async function getPendingTransfers() {
  return await prisma.transfer.findMany({
    where: { status: "PENDING" },
    include: {
      user: true,
      beneficiary: true,
    },
    orderBy: { createdAt: "asc" },
  })
}

async function confirmTransfer(transferId: string, confirmedBy: string) {
  "use server"
  await prisma.transfer.update({
    where: { id: transferId },
    data: {
      status: "COMPLETED",
      confirmedAt: new Date(),
      confirmedBy,
    },
  })
}

export default async function MadagascarTransfersPage() {
  const user = await requireRole(["MADAGASCAR_TEAM"])
  const pendingTransfers = await getPendingTransfers()

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pending Transfers</h1>
          <p className="text-muted-foreground mt-2">Confirm money transfers for beneficiaries</p>
        </div>

        {pendingTransfers.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">All transfers confirmed</h3>
              <p className="text-muted-foreground">Great work! All pending transfers have been processed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingTransfers.map((transfer) => (
              <Card key={transfer.id} className="shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{transfer.beneficiary.name}</CardTitle>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Clock className="mr-1 h-3 w-3" />
                      Pending
                    </Badge>
                  </div>
                  <CardDescription>
                    Transfer from {transfer.user.name} •{" "}
                    {format(new Date(transfer.createdAt), "MMMM dd, yyyy 'at' HH:mm")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Transfer Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount (CAD):</span>
                            <span className="font-medium">${transfer.amountCAD.toString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount (MGA):</span>
                            <span className="font-medium">{transfer.amountMGA.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Exchange Rate:</span>
                            <span className="font-medium">1 CAD = {transfer.exchangeRate.toLocaleString()} MGA</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Beneficiary Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{transfer.beneficiary.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {transfer.beneficiary.city}, {transfer.beneficiary.country}
                            </span>
                          </div>
                          {transfer.beneficiary.address && (
                            <div className="text-sm text-muted-foreground">{transfer.beneficiary.address}</div>
                          )}
                        </div>
                      </div>

                      <form action={confirmTransfer.bind(null, transfer.id, user.id)}>
                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Confirm Transfer
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
