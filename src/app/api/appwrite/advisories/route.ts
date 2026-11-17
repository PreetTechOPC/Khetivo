import { NextRequest, NextResponse } from "next/server";
import { APPWRITE_CONFIG } from "@/lib/appwriteConfig";
import { getServerDatabases } from "@/lib/appwriteServer";
import { Query } from "node-appwrite";


// GET: List active advisories
export async function GET(req: NextRequest) {
  try {
    const databases = getServerDatabases();

    const res = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.ADVISORIES,
      [Query.equal("isActive", true), Query.limit(50), Query.orderDesc("$createdAt")]
    );

    return NextResponse.json({
      success: true,
      total: res.total,
      advisories: res.documents,
    });
  } catch (error: any) {
    console.error("[Appwrite list advisories error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve advisories" },
      { status: 500 }
    );
  }
}
