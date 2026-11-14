import { NextRequest, NextResponse } from "next/server";
import { deleteServerUser } from "@/lib/serverOtp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required to delete account." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    deleteServerUser(cleanPhone);

    return NextResponse.json({
      success: true,
      message: `Account associated with +91 ${cleanPhone} has been permanently deleted from server records.`,
      phone: cleanPhone,
    });
  } catch (error: any) {
    console.error("[delete-account API error]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error deleting account." },
      { status: 500 }
    );
  }
}
