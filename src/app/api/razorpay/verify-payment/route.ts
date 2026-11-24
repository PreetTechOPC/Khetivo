import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { APPWRITE_CONFIG } from "@/lib/appwriteConfig";
import { getServerDatabases } from "@/lib/appwriteServer";
import { ID, Query } from "node-appwrite";
import { sendSubscriptionInvoiceEmail } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      billingCycle,
      userId,
      amount,
      maxAcres,
      farmerName,
      userEmail,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing Razorpay verification credentials" },
        { status: 400 }
      );
    }

    const key_secret =
      process.env.RAZORPAY_KEY_SECRET || "kbOODk2gSwFbzsJrkhsNgkTK";

    // Verify HMAC SHA256 signature
    const hmac = crypto.createHmac("sha256", key_secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    const isSignatureValid = generatedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature verification failed" },
        { status: 400 }
      );
    }

    // Payment is valid! Update user subscription in Appwrite
    let subscriptionDoc = null;
    let invoiceDoc = null;

    if (userId) {
      try {
        const databases = getServerDatabases();
        const startDate = new Date().toISOString();
        const durationDays = billingCycle === "monthly" ? 30 : 365;
        const renewalDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

        // 1. Check or update user subscription
        const existing = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.USER_SUBSCRIPTIONS,
          [Query.equal("userId", userId), Query.limit(1)]
        );

        const subPayload = {
          planTier: planId,
          status: "active",
          maxAcres: Number(maxAcres) || (planId === "enterprise" ? 50 : 25),
          startDate,
          renewalDate,
          annualFee: Number(amount) || 0,
          paymentMethod: `Razorpay (${razorpay_payment_id.slice(-6)})`,
        };

        if (existing.documents.length > 0) {
          subscriptionDoc = await databases.updateDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.USER_SUBSCRIPTIONS,
            existing.documents[0].$id,
            subPayload
          );
        } else {
          subscriptionDoc = await databases.createDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.USER_SUBSCRIPTIONS,
            ID.unique(),
            {
              userId,
              acresAllocated: 0,
              ...subPayload,
            }
          );
        }

        // 2. Create official billing tax invoice
        const invNo = `KH-RZP-${Date.now().toString().slice(-6)}`;
        const planDisplayName =
          planId === "enterprise"
            ? `Enterprise Agri (${billingCycle === "annual" ? "Annual" : "Monthly"})`
            : `Precision Pro (${billingCycle === "annual" ? "Annual" : "Monthly"})`;

        invoiceDoc = await databases.createDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.BILLING_INVOICES,
          ID.unique(),
          {
            userId,
            invoiceNo: invNo,
            date: startDate,
            period: billingCycle === "annual" ? "1 Year Full Access" : "1 Month Full Access",
            planName: planDisplayName,
            amount: Number(amount) || 0,
            paymentMethod: `Razorpay Online (${razorpay_payment_id})`,
            status: "Paid",
          }
        );

        // 3. Send purchased successfully email with invoice
        const targetEmail = userEmail || "farmer@khetivo.com";
        const targetName = farmerName || "Valued Farmer";
        const formattedDate = new Date(startDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        // Fire and forget or await dispatch
        sendSubscriptionInvoiceEmail({
          toEmail: targetEmail,
          farmerName: targetName,
          invoiceNo: invNo,
          planName: planDisplayName,
          period: billingCycle === "annual" ? "Annual License (1 Year)" : "Monthly License (1 Month)",
          amount: Number(amount) || 0,
          paymentMethod: `Razorpay (${razorpay_payment_id})`,
          date: formattedDate,
          paymentId: razorpay_payment_id,
        }).catch((e) => console.error("[Background email send error]:", e));
      } catch (dbErr: any) {
        console.warn("[Appwrite sync after Razorpay payment warning]:", dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and subscription activated!",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      subscription: subscriptionDoc,
      invoice: invoiceDoc,
    });
  } catch (error: any) {
    console.error("[Razorpay verify payment error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify Razorpay payment" },
      { status: 500 }
    );
  }
}
