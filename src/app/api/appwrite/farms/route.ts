import { NextRequest, NextResponse } from "next/server";
import { APPWRITE_CONFIG } from "@/lib/appwriteConfig";
import { getServerDatabases } from "@/lib/appwriteServer";
import { ID, Query } from "node-appwrite";

// GET: List all farms (optionally filtered by userId)
export async function GET(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const queries: string[] = [Query.equal("isArchived", false), Query.limit(100)];
    if (userId) {
      queries.push(Query.equal("userId", userId));
    }

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.FARMS,
      queries
    );

    return NextResponse.json({
      success: true,
      total: response.total,
      farms: response.documents,
    });
  } catch (error: any) {
    console.error("[Appwrite list farms error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve farms" },
      { status: 500 }
    );
  }
}

// POST: Create a new farm
export async function POST(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const body = await req.json();

    const {
      userId = "usr_default_farmer",
      name,
      address = "",
      village = "",
      district = "Ludhiana",
      state = "Punjab",
      pinCode = "",
      totalArea = 10,
      areaUnit = "Acres",
      ownership = "Owned",
      latitude = 30.901,
      longitude = 75.8573,
      soilType = "Alluvial Loam (Good Drainage)",
      irrigationType = "Drip + Solar Tubewell",
      waterSource = "Canal + Deep Borewell",
      cropTemplate = "",
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Farm name is required" },
        { status: 400 }
      );
    }

    const doc = await databases.createDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.FARMS,
      ID.unique(),
      {
        userId,
        name: name.trim(),
        address: address || "",
        village: village || "",
        district: district || "Ludhiana",
        state: state || "Punjab",
        pinCode: pinCode || "",
        totalArea: Number(totalArea) || 1,
        areaUnit: areaUnit || "Acres",
        ownership: ownership || "Owned",
        latitude: Number(latitude) || 30.901,
        longitude: Number(longitude) || 75.8573,
        soilType: soilType || "Alluvial Loam",
        irrigationType: irrigationType || "Tubewell",
        waterSource: waterSource || "Groundwater",
        cropTemplate: cropTemplate || "",
        isArchived: false,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Farm successfully registered in Appwrite",
      farm: doc,
    });
  } catch (error: any) {
    console.error("[Appwrite create farm error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create farm in database" },
      { status: 500 }
    );
  }
}

// DELETE: Archive / remove a farm
export async function DELETE(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const farmId = searchParams.get("farmId");

    if (!farmId) {
      return NextResponse.json(
        { success: false, message: "farmId query parameter is required" },
        { status: 400 }
      );
    }

    // Soft delete / mark archived or delete
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.FARMS,
        farmId,
        { isArchived: true }
      );
    } catch {
      await databases.deleteDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.FARMS,
        farmId
      );
    }

    return NextResponse.json({
      success: true,
      message: "Farm archived / deleted successfully",
      farmId,
    });
  } catch (error: any) {
    console.error("[Appwrite delete farm error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete farm" },
      { status: 500 }
    );
  }
}

