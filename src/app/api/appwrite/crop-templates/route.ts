import { NextRequest, NextResponse } from "next/server";
import { APPWRITE_CONFIG } from "@/lib/appwriteConfig";
import { getServerDatabases } from "@/lib/appwriteServer";
import { ID, Query } from "node-appwrite";

// GET: List all crop master templates
export async function GET(req: NextRequest) {
  try {
    const databases = getServerDatabases();

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.CROP_TEMPLATES,
      [Query.limit(100), Query.orderAsc("cropName")]
    );

    return NextResponse.json({
      success: true,
      total: response.total,
      templates: response.documents,
    });
  } catch (error: any) {
    console.error("[Appwrite list crop_templates error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve crop templates" },
      { status: 500 }
    );
  }
}

// POST: Create or update a crop master template
export async function POST(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const body = await req.json();

    const {
      id,
      cropName,
      name,
      varieties = [],
      variety = "",
      season = "Rabi",
      sowingWindow = "",
      durationDays = 120,
      defaultSoil = "",
      defaultIrrigation = "",
      targetYield = "",
      targetYieldQuintals = "",
      irrigationThresholdMoisture = 30,
      criticalIrrigationStages = [],
      majorDiseases = [],
      growthTimeline = [],
      pauPrescription = "",
      pauFungicidePrescription = "",
      dos = [],
      donts = [],
    } = body;

    const finalCropName = (cropName || name || "").trim();
    if (!finalCropName) {
      return NextResponse.json(
        { success: false, message: "Crop name is required" },
        { status: 400 }
      );
    }

    const varArray = Array.isArray(varieties)
      ? varieties
      : (typeof varieties === "string" && varieties.trim() ? varieties.split(",").map((v: string) => v.trim()).filter(Boolean) : []);
    if (variety && !varArray.includes(variety)) {
      varArray.unshift(variety);
    }

    const critArray = Array.isArray(criticalIrrigationStages)
      ? criticalIrrigationStages
      : (typeof criticalIrrigationStages === "string" && criticalIrrigationStages.trim() ? [criticalIrrigationStages.trim()] : []);

    const disArray = Array.isArray(majorDiseases)
      ? majorDiseases
      : (typeof majorDiseases === "string" && majorDiseases.trim() ? majorDiseases.split(",").map((d: string) => d.trim()).filter(Boolean) : []);

    const dosArray = Array.isArray(dos)
      ? dos
      : (typeof dos === "string" && dos.trim() ? [dos.trim()] : []);

    const dontsArray = Array.isArray(donts)
      ? donts
      : (typeof donts === "string" && donts.trim() ? [donts.trim()] : []);

    const growthTimelineStr = typeof growthTimeline === "string"
      ? growthTimeline
      : JSON.stringify(growthTimeline || []);

    const documentData = {
      cropName: finalCropName,
      varieties: varArray,
      season: season || "Rabi",
      sowingWindow: sowingWindow || "",
      durationDays: Number(durationDays) || 120,
      defaultSoil: defaultSoil || "",
      defaultIrrigation: defaultIrrigation || "",
      targetYield: targetYield || targetYieldQuintals || "",
      irrigationThresholdMoisture: Number(irrigationThresholdMoisture) || 30,
      criticalIrrigationStages: critArray,
      majorDiseases: disArray,
      growthTimeline: growthTimelineStr,
      pauPrescription: pauPrescription || pauFungicidePrescription || "",
      dos: dosArray,
      donts: dontsArray,
    };

    // If ID is provided, try updating first; otherwise create
    if (id && !id.startsWith("cr-") && !id.startsWith("wheat") && !id.startsWith("paddy")) {
      try {
        const updated = await databases.updateDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.CROP_TEMPLATES,
          id,
          documentData
        );
        return NextResponse.json({
          success: true,
          message: "Crop template updated in Appwrite",
          template: updated,
        });
      } catch (err: any) {
        // If not found, fall through to create
      }
    }

    const created = await databases.createDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.CROP_TEMPLATES,
      ID.unique(),
      documentData
    );

    return NextResponse.json({
      success: true,
      message: "Crop template registered in Appwrite",
      template: created,
    });
  } catch (error: any) {
    console.error("[Appwrite create crop_template error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create crop template" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a crop master template
export async function DELETE(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("templateId");

    if (!templateId) {
      return NextResponse.json(
        { success: false, message: "templateId query parameter is required" },
        { status: 400 }
      );
    }

    await databases.deleteDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.CROP_TEMPLATES,
      templateId
    );

    return NextResponse.json({
      success: true,
      message: "Crop template deleted from Appwrite",
      templateId,
    });
  } catch (error: any) {
    console.error("[Appwrite delete crop_template error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete crop template" },
      { status: 500 }
    );
  }
}
