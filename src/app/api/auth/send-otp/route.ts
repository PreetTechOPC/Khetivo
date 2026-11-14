import { NextRequest, NextResponse } from "next/server";
import { generateRealOtp, dispatchRealSms, isServerUserVerified } from "@/lib/serverOtp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { success: false, message: "Please provide a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, message: "Mobile number must be at least 10 digits." },
        { status: 400 }
      );
    }

    // Check if this user is already verified on the server
    if (isServerUserVerified(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          code: "ALREADY_VERIFIED",
          message: `The mobile number +91 ${cleanPhone} is already verified and registered. OTP verification is a one-time process for signup only. Please sign in instead.`,
        },
        { status: 400 }
      );
    }

    // Generate real secure 6-digit OTP
    const { record } = generateRealOtp(cleanPhone);

    // Dispatch real SMS
    await dispatchRealSms(cleanPhone, record.code);

    return NextResponse.json({
      success: true,
      message: `A real 6-digit verification code has been dispatched to +91 ${cleanPhone}.`,
      phone: cleanPhone,
      expiresAt: record.expiresAt,
      // For developer testing when no carrier API key is set, also deliver the code in dev mode
      devOtp: process.env.NODE_ENV !== "production" ? record.code : undefined,
    });
  } catch (error: any) {
    console.error("[send-otp API error]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error dispatching OTP." },
      { status: 500 }
    );
  }
}

