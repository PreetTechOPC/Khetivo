import { NextRequest, NextResponse } from "next/server";
import { getRazorpayServerInstance } from "@/lib/razorpayServer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", receipt, planId, billingCycle, userId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount specified" },
        { status: 400 }
      );
    }

    const razorpay = getRazorpayServerInstance();

    // Razorpay amount is in paise (1 INR = 100 paise)
    const options = {
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt: receipt || `rcpt_${Date.now().toString().slice(-8)}`,
      notes: {
        planId: planId || "pro",
        billingCycle: billingCycle || "annual",
        userId: userId || "anonymous",
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId:
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        process.env.RAZORPAY_KEY_ID ||
        "rzp_test_U2pWJ8lM7zk2AU",
    });
  } catch (error: any) {
    console.error("[Razorpay create order error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.error?.description || error?.message || "Failed to create Razorpay order",
      },
      { status: 500 }
    );
  }
}
