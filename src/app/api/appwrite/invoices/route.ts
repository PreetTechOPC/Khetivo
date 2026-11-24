import { NextRequest, NextResponse } from "next/server";
import { APPWRITE_CONFIG } from "@/lib/appwriteConfig";
import { getServerDatabases } from "@/lib/appwriteServer";
import { Query } from "node-appwrite";


// GET: List invoices
export async function GET(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const userId = req.nextUrl.searchParams.get("userId");

    const queries: string[] = [Query.limit(50), Query.orderDesc("$createdAt")];
    if (userId) queries.push(Query.equal("userId", userId));

    const res = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.BILLING_INVOICES,
      queries
    );

    return NextResponse.json({
      success: true,
      total: res.total,
      invoices: res.documents,
    });
  } catch (error: any) {
    console.error("[Appwrite list invoices error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve invoices" },
      { status: 500 }
    );
  }
}
