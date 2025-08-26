import { prisma } from "./prisma"
import type { NotificationType } from "@prisma/client"

export class NotificationService {
  static async createNotification(userId: string, type: NotificationType, title: string, message: string) {
    try {
      return await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          isRead: false,
        },
      })
    } catch (error) {
      console.error("Failed to create notification:", error)
      throw error
    }
  }

  static async notifyTransferCompleted(userId: string, beneficiaryName: string, amount: number) {
    return this.createNotification(
      userId,
      "TRANSFER_COMPLETED",
      "Transfer Completed",
      `Your transfer of $${amount} CAD to ${beneficiaryName} has been completed successfully.`,
    )
  }

  static async notifyTransferFailed(userId: string, beneficiaryName: string, amount: number) {
    return this.createNotification(
      userId,
      "TRANSFER_FAILED",
      "Transfer Failed",
      `Your transfer of $${amount} CAD to ${beneficiaryName} has failed. Please contact support.`,
    )
  }

  static async notifyTransferReminder(userId: string, beneficiaryName: string, amount: number, daysUntil: number) {
    return this.createNotification(
      userId,
      "TRANSFER_REMINDER",
      "Upcoming Transfer",
      `Your recurring transfer of $${amount} CAD to ${beneficiaryName} is scheduled in ${daysUntil} days.`,
    )
  }

  static async notifySubscriptionCreated(userId: string, beneficiaryName: string, amount: number, frequency: string) {
    return this.createNotification(
      userId,
      "SUBSCRIPTION_CREATED",
      "Subscription Created",
      `Your ${frequency} subscription of $${amount} CAD to ${beneficiaryName} has been created successfully.`,
    )
  }

  static async notifySubscriptionCancelled(userId: string, beneficiaryName: string) {
    return this.createNotification(
      userId,
      "SUBSCRIPTION_CANCELLED",
      "Subscription Cancelled",
      `Your recurring transfer to ${beneficiaryName} has been cancelled.`,
    )
  }

  static async notifyPaymentFailed(userId: string, amount: number) {
    return this.createNotification(
      userId,
      "PAYMENT_FAILED",
      "Payment Failed",
      `Payment of $${amount} CAD failed. Please update your payment method.`,
    )
  }
}
