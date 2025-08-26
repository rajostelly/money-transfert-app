// Mobile Money API integration for Madagascar operators
// This service handles automated transfers via Mobile Money APIs

export interface MobileMoneyProvider {
  name: string;
  apiEndpoint: string;
  supports: string[]; // phone number prefixes
}

export interface MobileMoneyTransferRequest {
  recipientPhone: string;
  amount: number;
  currency: string;
  reference: string;
  transferId: string;
  beneficiaryName: string;
}

export interface MobileMoneyTransferResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
}

// Mobile Money providers in Madagascar
export const MOBILE_MONEY_PROVIDERS: MobileMoneyProvider[] = [
  {
    name: "Orange Money",
    apiEndpoint: process.env.ORANGE_MONEY_API_URL || "",
    supports: ["032", "033", "038", "039"], // Orange prefixes
  },
  {
    name: "Airtel Money",
    apiEndpoint: process.env.AIRTEL_MONEY_API_URL || "",
    supports: ["031", "037"], // Airtel prefixes
  },
  {
    name: "Telma Money",
    apiEndpoint: process.env.TELMA_MONEY_API_URL || "",
    supports: ["034"], // Telma prefixes
  },
];

export class MobileMoneyService {
  private static getProviderFromPhone(
    phone: string
  ): MobileMoneyProvider | null {
    // Clean phone number (remove + and country code)
    const cleanPhone = phone.replace(/\+261|261/, "").substring(0, 3);

    return (
      MOBILE_MONEY_PROVIDERS.find((provider) =>
        provider.supports.some((prefix) => cleanPhone.startsWith(prefix))
      ) || null
    );
  }

  static async sendMoney(
    request: MobileMoneyTransferRequest
  ): Promise<MobileMoneyTransferResponse> {
    try {
      const provider = this.getProviderFromPhone(request.recipientPhone);

      if (!provider) {
        return {
          success: false,
          error: "Unsupported mobile operator",
          status: "FAILED",
        };
      }

      // For now, simulate the API call - replace with actual provider APIs
      return await this.simulateTransfer(provider, request);
    } catch (error) {
      console.error("Mobile Money transfer failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        status: "FAILED",
      };
    }
  }

  private static async simulateTransfer(
    provider: MobileMoneyProvider,
    request: MobileMoneyTransferRequest
  ): Promise<MobileMoneyTransferResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // For demo purposes, randomly succeed/fail to show the flow
    const success = Math.random() > 0.1; // 90% success rate

    if (success) {
      return {
        success: true,
        transactionId: `${provider.name
          .replace(" ", "")
          .toUpperCase()}_${Date.now()}`,
        status: "COMPLETED",
      };
    } else {
      return {
        success: false,
        error: "Insufficient funds in mobile money account",
        status: "FAILED",
      };
    }
  }

  // Real implementation would look like this for Orange Money:
  private static async sendOrangeMoney(
    request: MobileMoneyTransferRequest
  ): Promise<MobileMoneyTransferResponse> {
    try {
      const response = await fetch(
        `${process.env.ORANGE_MONEY_API_URL}/transfer`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.ORANGE_MONEY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient: request.recipientPhone,
            amount: request.amount,
            currency: request.currency,
            reference: request.reference,
            beneficiary_name: request.beneficiaryName,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          transactionId: data.transaction_id,
          status: data.status === "SUCCESS" ? "COMPLETED" : "PENDING",
        };
      } else {
        return {
          success: false,
          error: data.error || "Orange Money transfer failed",
          status: "FAILED",
        };
      }
    } catch (error) {
      throw new Error(`Orange Money API error: ${error}`);
    }
  }

  // Helper to get operator name from phone
  static getOperatorName(phone: string): string {
    const provider = this.getProviderFromPhone(phone);
    return provider?.name || "Unknown Operator";
  }

  // Check if automation is available for a phone number
  static isAutomationSupported(phone: string): boolean {
    return this.getProviderFromPhone(phone) !== null;
  }
}
