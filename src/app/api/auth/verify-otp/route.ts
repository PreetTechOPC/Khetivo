import { NextRequest, NextResponse } from "next/server";
import { verifyRealOtp } from "@/lib/serverOtp";
import { getServerDatabases, getServerUsers } from "@/lib/appwriteServer";
import { APPWRITE_CONFIG } from "@/lib/appwriteConfig";
import { ID } from "node-appwrite";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, code, name, email } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, message: "Phone number and 6-digit verification code are required." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const cleanCode = code.toString().trim();

    if (cleanCode.length !== 6) {
      return NextResponse.json(
        { success: false, message: "Please enter the complete 6-digit verification code." },
        { status: 400 }
      );
    }

    // Perform one-time verification
    const result = verifyRealOtp(cleanPhone, cleanCode);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          code: result.code,
          message: result.message,
        },
        { status: 400 }
      );
    }

    // Success: Account activated - collect and persist user in Appwrite!
    const effectiveName = name || "Khetivo Farmer";
    const effectiveEmail = email || `${cleanPhone}@khetivo.farm`;
    const userId = ID.unique();
    const farmerId = `KHET-${cleanPhone.slice(-5)}`;

    try {
      const databases = getServerDatabases();
      const users = getServerUsers();

      // Create in Appwrite Auth
      try {
        await users.create(
          userId,
          effectiveEmail,
          `+91${cleanPhone}`,
          `khetivo_${cleanPhone}`,
          effectiveName
        );
      } catch (authErr: any) {
        console.log("Appwrite Users notice:", authErr.message);
      }

      // Save user profile to Appwrite user_profiles collection
      await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.USER_PROFILES,
        ID.unique(),
        {
          userId,
          name: effectiveName,
          phone: cleanPhone,
          email: effectiveEmail,
          district: "Ludhiana",
          state: "Punjab",
          role: "farmer",
          measurementUnit: "Acres",
          preferredLanguage: "en",
          offlineSync: true,
          motorAutomation: true,
        }
      );
    } catch (dbErr: any) {
      console.warn("Could not save to Appwrite user_profiles:", dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "Mobile phone verified successfully! User profile registered in Appwrite.",
      user: {
        id: userId,
        name: effectiveName,
        phone: cleanPhone,
        email: effectiveEmail,
        farmerId,
        otpVerified: true,
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[verify-otp API error]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error verifying OTP." },
      { status: 500 }
    );
  }
}
