import nodemailer from "nodemailer";

interface EmailConfig {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail({ to, subject, html }: EmailConfig) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.APP_NAME || "TransferApp"}" <${
          process.env.EMAIL_FROM
        }>`,
        to,
        subject,
        html,
      });

      console.log("Email sent: %s", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Email sending failed:", error);
      return { success: false, error };
    }
  }

  // Email templates
  async sendWelcomeEmail(
    email: string,
    name: string,
    verificationToken: string
  ) {
    const verificationUrl = `${process.env.APP_URL}/auth/verify-email?token=${verificationToken}`;

    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to TransferApp!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151; margin-bottom: 20px;">Hello ${name},</h2>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Thank you for joining TransferApp! To complete your registration and start sending money to Madagascar, please verify your email address.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px;">
            If you didn't create this account, you can safely ignore this email.
          </p>
          
          <p style="color: #9ca3af; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #10b981;">${verificationUrl}</a>
          </p>
        </div>
        
        <div style="background: #374151; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © 2025 TransferApp. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: "Welcome to TransferApp - Verify Your Email",
      html,
    });
  }

  async sendTransferReminderEmail(
    email: string,
    name: string,
    beneficiaryName: string,
    amount: number,
    nextChargeDate: Date
  ) {
    const formattedDate = nextChargeDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Transfer Reminder</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151; margin-bottom: 20px;">Hello ${name},</h2>
          
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-weight: 600;">
              📅 Upcoming Transfer Reminder
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Your recurring transfer is scheduled to be processed in <strong>24 hours</strong>.
          </p>
          
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #374151;">Transfer Details:</h3>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Recipient:</strong> ${beneficiaryName}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Amount:</strong> $${amount} CAD</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Processing Date:</strong> ${formattedDate}</p>
          </div>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Please ensure your payment method has sufficient funds. If you need to cancel or modify this transfer, please log in to your account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL}/dashboard/subscriptions" 
               style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Manage Subscriptions
            </a>
          </div>
        </div>
        
        <div style="background: #374151; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © 2025 TransferApp. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Transfer Reminder: $${amount} CAD to ${beneficiaryName} tomorrow`,
      html,
    });
  }

  async sendTransferCompletedEmail(
    email: string,
    name: string,
    beneficiaryName: string,
    amountCAD: number,
    amountMGA: number,
    transferId: string
  ) {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Transfer Completed</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151; margin-bottom: 20px;">Hello ${name},</h2>
          
          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; color: #065f46; font-weight: 600;">
              🎉 Your transfer has been completed successfully!
            </p>
          </div>
          
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #374151;">Transfer Summary:</h3>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Transfer ID:</strong> ${transferId}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Recipient:</strong> ${beneficiaryName}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Amount Sent:</strong> $${amountCAD} CAD</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Amount Received:</strong> ${amountMGA.toLocaleString()} MGA</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Status:</strong> <span style="color: #10b981; font-weight: 600;">Completed</span></p>
          </div>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            The recipient has been notified and can now collect the money at any authorized agent location in Madagascar.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL}/dashboard/transfers/${transferId}" 
               style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              View Transfer Details
            </a>
          </div>
        </div>
        
        <div style="background: #374151; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © 2025 TransferApp. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Transfer Completed: $${amountCAD} CAD sent to ${beneficiaryName}`,
      html,
    });
  }

  async sendSubscriptionCreatedEmail(
    email: string,
    name: string,
    beneficiaryName: string,
    amount: number,
    frequency: string
  ) {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔄 Subscription Created</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151; margin-bottom: 20px;">Hello ${name},</h2>
          
          <div style="background: #f3e8ff; border-left: 4px solid #8b5cf6; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; color: #6b21a8; font-weight: 600;">
              📋 Your recurring transfer subscription is now active!
            </p>
          </div>
          
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #374151;">Subscription Details:</h3>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Recipient:</strong> ${beneficiaryName}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Amount:</strong> $${amount} CAD</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Frequency:</strong> ${frequency}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Status:</strong> <span style="color: #10b981; font-weight: 600;">Active</span></p>
          </div>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Your first transfer will be processed according to your selected schedule. You'll receive email reminders 24 hours before each transfer.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL}/dashboard/subscriptions" 
               style="background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Manage Subscription
            </a>
          </div>
        </div>
        
        <div style="background: #374151; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © 2025 TransferApp. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Subscription Created: ${frequency} transfers to ${beneficiaryName}`,
      html,
    });
  }

  async sendPaymentFailedEmail(
    email: string,
    name: string,
    beneficiaryName: string,
    amount: number
  ) {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">❌ Payment Failed</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151; margin-bottom: 20px;">Hello ${name},</h2>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; color: #b91c1c; font-weight: 600;">
              💳 Your recent payment could not be processed
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            We were unable to process your scheduled transfer payment. Your subscription has been temporarily paused.
          </p>
          
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #374151;">Failed Transfer Details:</h3>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Recipient:</strong> ${beneficiaryName}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Amount:</strong> $${amount} CAD</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Status:</strong> <span style="color: #ef4444; font-weight: 600;">Payment Failed</span></p>
          </div>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Please update your payment method to resume automatic transfers. Common reasons for payment failures include:
          </p>
          
          <ul style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            <li>Insufficient funds</li>
            <li>Expired credit card</li>
            <li>Bank security hold</li>
            <li>Billing address mismatch</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL}/dashboard/subscriptions" 
               style="background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Update Payment Method
            </a>
          </div>
        </div>
        
        <div style="background: #374151; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © 2025 TransferApp. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Payment Failed: $${amount} CAD transfer to ${beneficiaryName}`,
      html,
    });
  }

  async sendSubscriptionCancelledEmail(
    email: string,
    name: string,
    beneficiaryName: string
  ) {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #6b7280, #4b5563); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚫 Subscription Cancelled</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151; margin-bottom: 20px;">Hello ${name},</h2>
          
          <div style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; color: #374151; font-weight: 600;">
              📋 Your recurring transfer subscription has been cancelled
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Your recurring transfer to <strong>${beneficiaryName}</strong> has been successfully cancelled. No further automatic transfers will be processed.
          </p>
          
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #374151;">What happens next:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
              <li>No more automatic charges to your payment method</li>
              <li>No more scheduled transfers to ${beneficiaryName}</li>
              <li>You can still send one-time transfers anytime</li>
              <li>You can create a new subscription if needed</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            If you cancelled by mistake or want to resume transfers, you can create a new subscription at any time.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL}/dashboard/subscriptions/new" 
               style="background: #6b7280; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Create New Subscription
            </a>
          </div>
        </div>
        
        <div style="background: #374151; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © 2025 TransferApp. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Subscription Cancelled: Transfers to ${beneficiaryName}`,
      html,
    });
  }
}

export const emailService = new EmailService();
