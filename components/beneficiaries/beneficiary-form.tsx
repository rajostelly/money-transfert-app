"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Phone, MapPin, Home } from "lucide-react"

export function BeneficiaryForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    country: "Madagascar",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/beneficiaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create beneficiary")
      } else {
        router.push("/dashboard/beneficiaries")
        router.refresh()
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Add Beneficiary</CardTitle>
          <CardDescription>Add someone who will receive your money transfers</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                Address (Optional)
              </Label>
              <div className="relative">
                <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleChange}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">
                City
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">
                Country
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="country"
                  name="country"
                  type="text"
                  value={formData.country}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  readOnly
                />
              </div>
              <p className="text-sm text-muted-foreground">Currently only supporting transfers to Madagascar</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => router.push("/dashboard/beneficiaries")}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Beneficiary"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
