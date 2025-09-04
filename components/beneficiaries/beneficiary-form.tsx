"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, User, Phone, MapPin, Home, Smartphone } from "lucide-react";
import type { Beneficiary } from "@prisma/client";

interface BeneficiaryFormProps {
  beneficiary?: Beneficiary;
  mode?: "create" | "edit";
}

export function BeneficiaryForm({
  beneficiary,
  mode = "create",
}: BeneficiaryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    country: "Madagascar",
    operator: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Initialize form data with beneficiary data if in edit mode
  useEffect(() => {
    if (beneficiary && mode === "edit") {
      setFormData({
        name: beneficiary.name,
        phone: beneficiary.phone,
        address: beneficiary.address || "",
        city: beneficiary.city,
        country: beneficiary.country,
        operator: (beneficiary as any).operator || "none",
      });
    }
  }, [beneficiary, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const url =
        mode === "edit" && beneficiary
          ? `/api/beneficiaries/${beneficiary.id}`
          : "/api/beneficiaries";

      const method = mode === "edit" ? "PUT" : "POST";

      const processedFormData = {
        ...formData,
        operator: formData.operator === "none" ? null : formData.operator,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || `Failed to ${mode} beneficiary`);
      } else {
        router.push("/dashboard/beneficiaries");
        router.refresh();
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Full Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
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
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
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
        <p className="text-xs text-muted-foreground">
          Include country code (e.g., +261 for Madagascar)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="operator" className="text-sm font-medium">
          Mobile Money Operator (Optional)
        </Label>
        <div className="relative">
          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Select
            value={formData.operator}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, operator: value }))
            }
          >
            <SelectTrigger className="pl-10 h-12">
              <SelectValue placeholder="Select mobile money operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No operator</SelectItem>
              <SelectItem value="Orange Money">Orange Money</SelectItem>
              <SelectItem value="Airtel Money">Airtel Money</SelectItem>
              <SelectItem value="Telma Money">Telma Money</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          Selecting an operator enables automatic transfers for this beneficiary
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-medium">
          Address (Optional)
        </Label>
        <div className="relative">
          <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
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
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
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
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
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
        <p className="text-sm text-muted-foreground">
          Currently only supporting transfers to Madagascar
        </p>
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
        <Button
          type="submit"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "edit" ? "Updating..." : "Adding..."}
            </>
          ) : mode === "edit" ? (
            "Update Beneficiary"
          ) : (
            "Add Beneficiary"
          )}
        </Button>
      </div>
    </form>
  );
}
