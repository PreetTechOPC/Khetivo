import { NextRequest, NextResponse } from "next/server";
import { APPWRITE_CONFIG } from "@/lib/appwriteConfig";
import { getServerDatabases } from "@/lib/appwriteServer";
import { ID, Query } from "node-appwrite";

// GET: List equipment and breakdown issues
export async function GET(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const farmId = searchParams.get("farmId");
    const userId = searchParams.get("userId");

    const eqQueries: string[] = [Query.limit(100)];
    const issueQueries: string[] = [Query.limit(100), Query.orderDesc("$createdAt")];

    if (farmId && farmId !== "all") {
      eqQueries.push(Query.equal("farmId", farmId));
      issueQueries.push(Query.equal("farmId", farmId));
    }
    if (userId) {
      eqQueries.push(Query.equal("userId", userId));
      issueQueries.push(Query.equal("userId", userId));
    }

    const [equipmentRes, issuesRes, farmsRes] = await Promise.all([
      databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.EQUIPMENT,
        eqQueries
      ),
      databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.EQUIPMENT_ISSUES,
        issueQueries
      ),
      databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.FARMS,
        [Query.limit(100)]
      ).catch(() => ({ documents: [] })),
    ]);

    // Build farm lookup map for accurate farmName
    const farmMap = new Map<string, string>();
    for (const f of farmsRes.documents) {
      farmMap.set(f.$id, f.name);
    }

    const enrichedEquipment = equipmentRes.documents.map((eq: any) => ({
      ...eq,
      farmName: farmMap.get(eq.farmId) || eq.farmName || "Farm",
    }));

    const enrichedIssues = issuesRes.documents.map((iss: any) => ({
      ...iss,
      farmName: farmMap.get(iss.farmId) || iss.farmName || "Farm",
    }));

    return NextResponse.json({
      success: true,
      equipment: enrichedEquipment,
      issues: enrichedIssues,
    });
  } catch (error: any) {
    console.error("[Appwrite list equipment error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve equipment" },
      { status: 500 }
    );
  }
}

// POST: Register equipment or report problem
export async function POST(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const body = await req.json();
    const { action = "equipment" } = body;

    // Action: report breakdown issue
    if (action === "issue") {
      const {
        equipmentId = "",
        farmId = "default_farm",
        userId = "usr_default_farmer",
        issueType = "Engine / Mechanical",
        severity = "Medium",
        description,
        reportedBy = "Operator",
      } = body;

      const issueDoc = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.EQUIPMENT_ISSUES,
        ID.unique(),
        {
          equipmentId,
          farmId,
          userId,
          issueType,
          severity,
          description: description || "Reported maintenance issue",
          reportedBy,
          reportedDate: new Date().toISOString(),
          status: "Open",
        }
      );

      // Optionally update equipment status to Under Maintenance
      if (equipmentId) {
        try {
          await databases.updateDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.EQUIPMENT,
            equipmentId,
            { status: "Under Maintenance" }
          );
        } catch (err) {
          console.warn("Could not set equipment status to maintenance:", err);
        }
      }

      return NextResponse.json({ success: true, issue: issueDoc });
    }

    // Default action: register new equipment
    const {
      farmId = "default_farm",
      userId = "usr_default_farmer",
      name,
      category = "Tractor",
      model = "Standard Model",
      operator = "General Operator",
      status = "Operational",
      runtimeHours = 0,
      nextServiceHours = 250,
      fuelLevel = 85,
      fuelEfficiency = "4.2 L/hr",
      lastServiceDate = new Date().toISOString(),
      nextServiceDate = new Date(Date.now() + 60 * 86400000).toISOString(),
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Equipment name is required" },
        { status: 400 }
      );
    }

    const doc = await databases.createDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.EQUIPMENT,
      ID.unique(),
      {
        farmId,
        userId,
        name: name.trim(),
        category,
        model,
        operator,
        status,
        runtimeHours: Number(runtimeHours) || 0,
        nextServiceHours: Number(nextServiceHours) || 250,
        fuelLevel: Number(fuelLevel) || 80,
        fuelEfficiency,
        lastServiceDate: new Date(lastServiceDate).toISOString(),
        nextServiceDate: new Date(nextServiceDate).toISOString(),
      }
    );

    return NextResponse.json({
      success: true,
      message: "Equipment registered in Appwrite",
      equipment: doc,
    });
  } catch (error: any) {
    console.error("[Appwrite equipment post error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save equipment" },
      { status: 500 }
    );
  }
}

// DELETE: Delete equipment or equipment issue
export async function DELETE(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const equipmentId = searchParams.get("equipmentId") || searchParams.get("id");
    const issueId = searchParams.get("issueId");

    if (issueId) {
      await databases.deleteDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.EQUIPMENT_ISSUES,
        issueId
      );
      return NextResponse.json({
        success: true,
        message: "Equipment issue deleted successfully",
      });
    }

    if (equipmentId) {
      await databases.deleteDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.EQUIPMENT,
        equipmentId
      );
      return NextResponse.json({
        success: true,
        message: "Equipment deleted successfully",
      });
    }

    return NextResponse.json(
      { success: false, message: "equipmentId or issueId query parameter is required" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Appwrite delete equipment error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete equipment" },
      { status: 500 }
    );
  }
}

// PATCH/PUT: Update equipment status or issue status
export async function PATCH(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const body = await req.json();
    const { equipmentId, issueId, status } = body;

    if (issueId && status) {
      const updated = await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.EQUIPMENT_ISSUES,
        issueId,
        { status }
      );
      return NextResponse.json({ success: true, issue: updated });
    }

    if (equipmentId && status) {
      const updated = await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.EQUIPMENT,
        equipmentId,
        { status }
      );
      return NextResponse.json({ success: true, equipment: updated });
    }

    return NextResponse.json(
      { success: false, message: "Invalid update payload" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Appwrite update equipment error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update equipment" },
      { status: 500 }
    );
  }
}

