import { NextRequest, NextResponse } from "next/server";
import { APPWRITE_CONFIG } from "@/lib/appwriteConfig";
import { getServerDatabases } from "@/lib/appwriteServer";
import { ID, Query } from "node-appwrite";

// GET: List advisories (with optional all=true for admin to view both active & expired)
export async function GET(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get("all") === "true";

    const queries: string[] = [Query.limit(100), Query.orderDesc("$createdAt")];
    if (!showAll) {
      queries.push(Query.equal("isActive", true));
    }

    const res = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.ADVISORIES,
      queries
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

// POST: Create or update an advisory / broadcast
export async function POST(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const body = await req.json();

    const {
      id,
      title,
      category = "Pest Warning",
      priority = "High",
      targetCrop = "All Crops",
      targetDistrict = "All Districts",
      targetState = "Punjab",
      message,
      actionPrescription = "",
      dispatchedBy = "Dr. Amanpreet Singh (PAU)",
      isActive = true,
    } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: "Title and message are required" },
        { status: 400 }
      );
    }

    const payload = {
      title: title.trim(),
      category: category || "Pest Warning",
      priority: priority || "High",
      targetCrop: targetCrop || "All Crops",
      targetDistrict: targetDistrict || "All Districts",
      targetState: targetState || "Punjab",
      message: message.trim(),
      actionPrescription: actionPrescription || "",
      dispatchedAt: new Date().toISOString(),
      dispatchedBy: dispatchedBy || "Dr. Amanpreet Singh",
      isActive: Boolean(isActive),
    };

    let doc;
    if (id && !id.startsWith("bc-")) {
      doc = await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.ADVISORIES,
        id,
        payload
      );
    } else {
      doc = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.ADVISORIES,
        ID.unique(),
        payload
      );
    }

    return NextResponse.json({
      success: true,
      message: "Advisory saved successfully in Appwrite",
      advisory: doc,
    });
  } catch (error: any) {
    console.error("[Appwrite save advisory error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save advisory" },
      { status: 500 }
    );
  }
}

// DELETE: Remove an advisory
export async function DELETE(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const advisoryId = searchParams.get("advisoryId");

    if (!advisoryId) {
      return NextResponse.json(
        { success: false, message: "advisoryId is required" },
        { status: 400 }
      );
    }

    await databases.deleteDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.ADVISORIES,
      advisoryId
    );

    return NextResponse.json({
      success: true,
      message: "Advisory deleted successfully",
      advisoryId,
    });
  } catch (error: any) {
    console.error("[Appwrite delete advisory error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete advisory" },
      { status: 500 }
    );
  }
}
