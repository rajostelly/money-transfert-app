import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, MapPin, User, TrendingUp, CreditCard } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { notFound } from "next/navigation"

async function getTransfer(transferId: string, userId: string) {
  return await prisma.transfer.findFirst({
    where: {
      id: transferId,
      userId,
    },
    include: {
      beneficiary: true,
      subscription: true,
      user: true,
    },
  })
}

export default async function TransferDetailsPage({ params }: { params: { id: string } }) {
  const user = await requireAuth()
  const transfer = await getTransfer(params.id, user.id)

  if (!transfer) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "PROCESSING":
        return "bg-blue-100 text-blue-800"
      case "FAILED":
        return "bg-red-100 text-red-800"
      case "CANCELLED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/transfers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Transfers
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-foreground">Transfer Details</h1>
          <p className="text-muted-foreground mt-2">Complete information about your transfer</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Transfer Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Transfer Information</CardTitle>
                  <Badge className={getStatusColor(transfer.status)}>{transfer.status.toLowerCase()}</Badge>
                </div>
                <CardDescription>Transfer ID: {transfer.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Beneficiary</p>
                      <p className="font-medium">{transfer.beneficiary.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">
                        {transfer.beneficiary.city}, {transfer.beneficiary.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Transfer Date</p>
                      <p className="font-medium">{format(new Date(transfer.createdAt), "MMMM dd, yyyy 'at' HH:mm")}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">{transfer.type === "SUBSCRIPTION" ? "Recurring" : "One-time"}</p>
                    </div>
                  </div>
                </div>

                {transfer.status === "COMPLETED" && transfer.confirmedAt && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm font-medium text-emerald-800">Transfer Completed</p>
                    <p className="text-sm text-emerald-700">
                      Confirmed on {format(new Date(transfer.confirmedAt), "MMMM dd, yyyy 'at' HH:mm")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Beneficiary Details */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Beneficiary Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{transfer.beneficiary.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{transfer.beneficiary.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{transfer.beneficiary.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Country</p>
                    <p className="font-medium">{transfer.beneficiary.country}</p>
                  </div>
                  {transfer.beneficiary.address && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{transfer.beneficiary.address}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Amount Summary */}
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Amount Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Transfer amount:</span>
                    <span className="font-medium">${transfer.amountCAD.toString()} CAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Service fee:</span>
                    <span className="font-medium">${transfer.feeCAD.toString()} CAD</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-medium">Total charged:</span>
                    <span className="font-semibold">${transfer.totalCAD.toString()} CAD</span>
                  </div>
                  <div className="flex justify-between bg-emerald-50 p-3 rounded-lg">
                    <span className="text-emerald-800 font-medium">Amount received:</span>
                    <span className="text-emerald-800 font-semibold">{transfer.amountMGA.toLocaleString()} MGA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Exchange Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Rate used for this transfer</span>
                </div>
                <p className="text-lg font-semibold">1 CAD = {transfer.exchangeRate.toLocaleString()} MGA</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
