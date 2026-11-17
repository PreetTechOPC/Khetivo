import { NextRequest, NextResponse } from "next/server";
import { APPWRITE_CONFIG } from "@/lib/appwriteConfig";
import { getServerDatabases } from "@/lib/appwriteServer";
import { ID, Query } from "node-appwrite";


// GET: List financial transactions
export async function GET(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const farmId = searchParams.get("farmId");
    const userId = searchParams.get("userId");

    const queries: string[] = [Query.limit(100), Query.orderDesc("$createdAt")];
    if (farmId && farmId !== "all") queries.push(Query.equal("farmId", farmId));
    if (userId) queries.push(Query.equal("userId", userId));

    const res = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.FINANCIAL_TRANSACTIONS,
      queries
    );

    return NextResponse.json({
      success: true,
      total: res.total,
      transactions: res.documents,
    });
  } catch (error: any) {
    console.error("[Appwrite list financials error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve transactions" },
      { status: 500 }
    );
  }
}

// POST: Record financial transaction
export async function POST(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const body = await req.json();

    const {
      farmId = "default_farm",
      userId = "usr_default_farmer",
      type = "expense",
      title,
      category = "General",
      amount = 0,
      date = new Date().toISOString(),
      quantity = "",
      status = "Completed",
      reference = "",
      crop = "",
      notes = "",
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Transaction title is required" },
        { status: 400 }
      );
    }

    const doc = await databases.createDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.FINANCIAL_TRANSACTIONS,
      ID.unique(),
      {
        farmId,
        userId,
        type,
        title: title.trim(),
        category,
        amount: Number(amount) || 0,
        date: new Date(date).toISOString(),
        quantity: quantity || "",
        status: status && ["Cleared", "Pending", "Claimed", "Recorded"].includes(status) ? status : "Cleared",
        reference: reference || "",
        crop: crop || "",
        notes: notes || "",
      }
    );

    return NextResponse.json({
      success: true,
      message: "Transaction saved in Appwrite",
      transaction: doc,
    });
  } catch (error: any) {
    console.error("[Appwrite create transaction error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create transaction" },
      { status: 500 }
    );
  }
}

// DELETE: Delete transaction
export async function DELETE(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("id");

    if (!transactionId) {
      return NextResponse.json(
        { success: false, message: "Transaction ID is required" },
        { status: 400 }
      );
    }

    await databases.deleteDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.FINANCIAL_TRANSACTIONS,
      transactionId
    );

    return NextResponse.json({ success: true, message: "Transaction deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
