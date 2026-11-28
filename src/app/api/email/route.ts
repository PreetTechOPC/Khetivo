import { NextRequest, NextResponse } from "next/server";
import {
  sendWelcomeEmail,
  sendSubscriptionInvoiceEmail,
  sendForgotPasswordEmail,
} from "@/lib/emailService";

// POST: Trigger custom emails for New User, Subscription, or Forgot Password
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, payload } = body;

    if (!type || !payload || !payload.toEmail) {
      return NextResponse.json(
        { success: false, message: "type and payload (with toEmail) are required." },
        { status: 400 }
      );
    }

    switch (type) {
      case "welcome": {
        const res = await sendWelcomeEmail({
          toEmail: payload.toEmail,
          farmerName: payload.farmerName || "Progressive Farmer",
          farmerId: payload.farmerId,
          phone: payload.phone,
          dashboardUrl: payload.dashboardUrl,
        });
        return NextResponse.json(res);
      }

      case "subscription": {
        const res = await sendSubscriptionInvoiceEmail({
          toEmail: payload.toEmail,
          farmerName: payload.farmerName || "Progressive Farmer",
          invoiceNo: payload.invoiceNo || `KH-${Date.now().toString().slice(-6)}`,
          planName: payload.planName || "Khetivo Farm Pro",
          period: payload.period || "Annual (1 Year)",
          amount: Number(payload.amount) || 0,
          paymentMethod: payload.paymentMethod || "UPI / Online",
          date: payload.date || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          paymentId: payload.paymentId,
          acresLimit: payload.acresLimit,
          renewalDate: payload.renewalDate,
        });
        return NextResponse.json(res);
      }

      case "forgot_password": {
        const res = await sendForgotPasswordEmail({
          toEmail: payload.toEmail,
          farmerName: payload.farmerName || "Farmer",
          resetLink: payload.resetLink,
          resetCode: payload.resetCode,
          expiresInMinutes: payload.expiresInMinutes || 60,
        });
        return NextResponse.json(res);
      }

      default:
        return NextResponse.json(
          { success: false, message: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("[Email API Error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process email request" },
      { status: 500 }
    );
  }
}
