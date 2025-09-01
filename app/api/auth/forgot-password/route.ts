import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { emailService } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account with that email exists, we've sent password reset instructions.",
      });
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store reset token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Create reset URL
    const resetUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/auth/reset-password?token=${resetToken}`;

    // Send email
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; margin-bottom: 10px;">TransferApp</h1>
          <p style="color: #6b7280;">Secure money transfers to Madagascar</p>
        </div>
        
        <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
          <h2 style="color: #111827; margin-bottom: 20px;">Reset Your Password</h2>
          <p style="color: #374151; margin-bottom: 20px;">
            Hi ${user.name},
          </p>
          <p style="color: #374151; margin-bottom: 20px;">
            We received a request to reset your password for your TransferApp account. 
            Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(to right, #059669, #047857); 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      display: inline-block;
                      font-weight: 500;">
              Reset My Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
            This link will expire in 1 hour for security reasons.
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request this password reset, you can safely ignore this email. 
            Your password will remain unchanged.
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin-bottom: 10px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #059669; font-size: 12px; word-break: break-all;">
            ${resetUrl}
          </p>
          
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
            🔒 This email was sent from a secure, monitored system.
          </p>
        </div>
      </div>
    `;

    await emailService.sendEmail({
      to: user.email,
      subject: "Reset Your TransferApp Password",
      html: emailContent,
    });

    return NextResponse.json({
      success: true,
      message:
        "Password reset instructions have been sent to your email address.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {
        error:
          "An error occurred while processing your request. Please try again.",
      },
      { status: 500 }
    );
  }
}
