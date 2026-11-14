import { NextRequest, NextResponse } from "next/server";
import { APPWRITE_CONFIG } from "@/lib/appwriteConfig";
import { getServerDatabases } from "@/lib/appwriteServer";
import { ID, Query } from "node-appwrite";

// GET: List crops
export async function GET(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const farmId = searchParams.get("farmId");
    const userId = searchParams.get("userId");

    const queries: string[] = [Query.limit(100), Query.orderAsc("sownDate")];
    if (farmId) queries.push(Query.equal("farmId", farmId));
    if (userId) queries.push(Query.equal("userId", userId));

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.FARM_CROPS,
      queries
    );

    return NextResponse.json({
      success: true,
      total: response.total,
      crops: response.documents,
    });
  } catch (error: any) {
    console.error("[Appwrite list crops error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve crops" },
      { status: 500 }
    );
  }
}

// POST: Add a new crop cycle
export async function POST(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const body = await req.json();

    const {
      farmId = "default_farm",
      userId = "usr_default_farmer",
      name,
      variety = "Standard Variety",
      area = 5,
      areaUnit = "Acres",
      season = "Rabi",
      stage = "Vegetative",
      stageStep = 1,
      currentDay = 15,
      totalDays = 120,
      health = "Good",
      sownDate = new Date().toISOString(),
      harvestDate = new Date(Date.now() + 105 * 86400000).toISOString(),
      nextMilestone = "Crown Root Initiation",
      color = "#278449",
      currentMoisture = 34,
      lowMoistureAlert = 28,
      dos = "",
      donts = "",
      diseases = "",
      sprayGuide = "",
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Crop name is required" },
        { status: 400 }
      );
    }

    const dosArray = Array.isArray(dos) ? dos : (typeof dos === "string" && dos.trim() ? [dos.trim()] : []);
    const dontsArray = Array.isArray(donts) ? donts : (typeof donts === "string" && donts.trim() ? [donts.trim()] : []);

    const doc = await databases.createDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.FARM_CROPS,
      ID.unique(),
      {
        farmId,
        userId,
        name: name.trim(),
        variety: variety || "Standard",
        area: Number(area) || 1,
        areaUnit: areaUnit || "Acres",
        season: season || "Rabi",
        stage: stage || "Vegetative",
        stageStep: Number(stageStep) || 1,
        currentDay: Number(currentDay) || 1,
        totalDays: Number(totalDays) || 120,
        health: health || "Good",
        sownDate: new Date(sownDate).toISOString(),
        harvestDate: new Date(harvestDate).toISOString(),
        nextMilestone: nextMilestone || "Next Stage",
        color: color || "#278449",
        currentMoisture: Number(currentMoisture) || 30,
        lowMoistureAlert: Number(lowMoistureAlert) || 25,
        dos: dosArray,
        donts: dontsArray,
        diseases: typeof diseases === "string" ? diseases : "",
        sprayGuide: typeof sprayGuide === "string" ? sprayGuide : "",
      }
    );

    return NextResponse.json({
      success: true,
      message: "Crop cycle registered in Appwrite",
      crop: doc,
    });
  } catch (error: any) {
    console.error("[Appwrite create crop error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create crop" },
      { status: 500 }
    );
  }
}

