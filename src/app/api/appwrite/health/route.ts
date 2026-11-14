import { NextResponse } from "next/server";
import { APPWRITE_CONFIG } from "@/lib/appwriteConfig";
import { getServerDatabases, getServerStorage } from "@/lib/appwriteServer";

export async function GET() {
  try {
    const databases = getServerDatabases();
    const storage = getServerStorage();

    // Verify database access
    const db = await databases.get(APPWRITE_CONFIG.DATABASE_ID);
    const collectionsList = await databases.listCollections(APPWRITE_CONFIG.DATABASE_ID);
    const bucketsList = await storage.listBuckets();

    return NextResponse.json({
      success: true,
      status: "connected",
      database: {
        id: db.$id,
        name: db.name,
        collectionsTotal: collectionsList.total,
        collections: collectionsList.collections.map((c) => c.$id),
      },
      storage: {
        bucketsTotal: bucketsList.total,
        buckets: bucketsList.buckets.map((b) => b.$id),
      },
      configuredCollections: APPWRITE_CONFIG.COLLECTIONS,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Appwrite Health Check Error]:", error);
    return NextResponse.json(
      {
        success: false,
        status: "error",
        message: error.message || "Failed to connect to Appwrite Cloud",
        endpoint: APPWRITE_CONFIG.ENDPOINT,
        projectId: APPWRITE_CONFIG.PROJECT_ID,
        databaseId: APPWRITE_CONFIG.DATABASE_ID,
      },
      { status: 500 }
    );
  }
}

