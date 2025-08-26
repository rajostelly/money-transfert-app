import * as cron from "node-cron";
import { prisma } from "./prisma";
import { emailService } from "./email-service";

class ScheduledJobsService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  start() {
    console.log("Starting scheduled jobs...");

    // Run transfer reminders daily at 10 AM
    const reminderJob = cron.schedule(
      "0 10 * * *",
      this.checkTransferReminders,
      {
        timezone: "America/Toronto", // Adjust based on your timezone
      }
    );

    this.jobs.set("transfer-reminders", reminderJob);
    reminderJob.start();

    console.log("Scheduled jobs started successfully");
  }

  stop() {
    console.log("Stopping scheduled jobs...");
    this.jobs.forEach((job, name) => {
      job.stop();
      job.destroy();
      console.log(`Stopped job: ${name}`);
    });
    this.jobs.clear();
    console.log("All scheduled jobs stopped");
  }

  private async checkTransferReminders() {
    try {
      console.log("Checking for transfer reminders...");

      // Get all active subscriptions with next transfer date tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);

      const subscriptions = await prisma.subscription.findMany({
        where: {
          status: "ACTIVE",
          nextTransferDate: {
            gte: tomorrow,
            lte: endOfTomorrow,
          },
        },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
          beneficiary: {
            select: {
              name: true,
            },
          },
        },
      });

      console.log(
        `Found ${subscriptions.length} subscriptions due for reminder`
      );

      // Send reminder emails
      for (const subscription of subscriptions) {
        try {
          await emailService.sendTransferReminderEmail(
            subscription.user.email,
            subscription.user.name,
            subscription.beneficiary.name,
            Number(subscription.amountCAD),
            subscription.nextTransferDate
          );

          // Create a notification
          await prisma.notification.create({
            data: {
              userId: subscription.userId,
              type: "TRANSFER_REMINDER",
              title: "Transfer Reminder",
              message: `Your recurring transfer of $${subscription.amountCAD} CAD to ${subscription.beneficiary.name} will be processed tomorrow.`,
            },
          });

          console.log(`Sent reminder for subscription ${subscription.id}`);
        } catch (error) {
          console.error(
            `Failed to send reminder for subscription ${subscription.id}:`,
            error
          );
        }
      }

      console.log("Transfer reminder check completed");
    } catch (error) {
      console.error("Error in checkTransferReminders:", error);
    }
  }

  // Method to manually trigger reminder check (useful for testing)
  async triggerReminderCheck() {
    await this.checkTransferReminders();
  }
}

export const scheduledJobsService = new ScheduledJobsService();
