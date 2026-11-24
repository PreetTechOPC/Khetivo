import { NextRequest, NextResponse } from "next/server";
import { APPWRITE_CONFIG } from "@/lib/appwriteConfig";
import { getServerDatabases } from "@/lib/appwriteServer";
import { ID, Query } from "node-appwrite";

// GET: Retrieve user subscription
export async function GET(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId parameter is required" },
        { status: 400 }
      );
    }

    const res = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.USER_SUBSCRIPTIONS,
      [Query.equal("userId", userId), Query.orderDesc("$createdAt"), Query.limit(1)]
    );

    if (res.documents.length === 0) {
      return NextResponse.json({
        success: true,
        subscription: null,
      });
    }

    return NextResponse.json({
      success: true,
      subscription: res.documents[0],
    });
  } catch (error: any) {
    console.error("[Appwrite get subscription error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve subscription" },
      { status: 500 }
    );
  }
}

// POST: Upgrade or update user subscription plan
export async function POST(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const body = await req.json();

    const {
      userId,
      planTier, // "starter" | "pro" | "enterprise"
      maxAcres = 5,
      acresAllocated = 0,
      annualFee = 0,
      paymentMethod = "UPI AutoPay",
    } = body;

    if (!userId || !planTier) {
      return NextResponse.json(
        { success: false, message: "userId and planTier are required" },
        { status: 400 }
      );
    }

    const startDate = new Date().toISOString();
    const renewalDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    // Check if subscription doc already exists for this user
    const existing = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.USER_SUBSCRIPTIONS,
      [Query.equal("userId", userId), Query.limit(1)]
    );

    let subDoc;
    if (existing.documents.length > 0) {
      subDoc = await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.USER_SUBSCRIPTIONS,
        existing.documents[0].$id,
        {
          planTier,
          status: "active",
          acresAllocated: Number(acresAllocated) || 0,
          maxAcres: Number(maxAcres) || 5,
          startDate,
          renewalDate,
          annualFee: Number(annualFee) || 0,
          paymentMethod,
        }
      );
    } else {
      subDoc = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.USER_SUBSCRIPTIONS,
        ID.unique(),
        {
          userId,
          planTier,
          status: "active",
          acresAllocated: Number(acresAllocated) || 0,
          maxAcres: Number(maxAcres) || 5,
          startDate,
          renewalDate,
          annualFee: Number(annualFee) || 0,
          paymentMethod,
        }
      );
    }

    // Automatically create a billing invoice receipt in Appwrite if it's a paid tier
    if (Number(annualFee) > 0) {
      try {
        const invNo = `KH-${Date.now().toString().slice(-6)}`;
        await databases.createDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.BILLING_INVOICES,
          ID.unique(),
          {
            userId,
            invoiceNo: invNo,
            date: startDate,
            period: "Annual License (1 Year)",
            planName: planTier === "pro" ? "Precision Pro (Annual)" : "Enterprise Agri (Annual)",
            amount: Number(annualFee),
            paymentMethod,
            status: "Paid",
          }
        );
      } catch (invErr: any) {
        console.warn("Could not record billing invoice in Appwrite:", invErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Subscription successfully updated",
      subscription: subDoc,
    });
  } catch (error: any) {
    console.error("[Appwrite save subscription error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update subscription" },
      { status: 500 }
    );
  }
}
