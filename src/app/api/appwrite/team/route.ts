import { NextRequest, NextResponse } from "next/server";
import { APPWRITE_CONFIG } from "@/lib/appwriteConfig";
import { getServerDatabases } from "@/lib/appwriteServer";
import { ID, Query } from "node-appwrite";


// GET: List team members and designations
export async function GET(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const farmId = searchParams.get("farmId");

    const memberQueries: string[] = [Query.limit(100)];
    if (farmId && farmId !== "all") memberQueries.push(Query.equal("farmId", farmId));

    const [membersRes, designationsRes] = await Promise.all([
      databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.TEAM_MEMBERS,
        memberQueries
      ),
      databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.TEAM_DESIGNATIONS,
        [Query.limit(50)]
      ),
    ]);

    return NextResponse.json({
      success: true,
      members: membersRes.documents,
      designations: designationsRes.documents,
    });
  } catch (error: any) {
    console.error("[Appwrite list team error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve team" },
      { status: 500 }
    );
  }
}

// POST: Add team member or designation
export async function POST(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const body = await req.json();
    const { action = "member" } = body;

    // Action: create designation
    if (action === "designation") {
      const { title, description = "", allowedModules = [], color = "#0C4B32", isSystemDefault = false } = body;
      const desDoc = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.TEAM_DESIGNATIONS,
        ID.unique(),
        {
          title: title.trim(),
          description,
          allowedModules: Array.isArray(allowedModules) ? allowedModules : [],
          color,
          isSystemDefault: Boolean(isSystemDefault),
        }
      );
      return NextResponse.json({ success: true, designation: desDoc });
    }

    // Default: create team member
    const {
      farmId = "default_farm",
      userId = "usr_default_farmer",
      name,
      phone,
      email = "",
      roleCategory = "worker",
      designationTitle = "Farm Worker",
      status = "Active",
      assignedParcels = "",
      allowedModules = [],
      joinedDate = new Date().toISOString(),
      notes = "",
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "Member name and phone number are required" },
        { status: 400 }
      );
    }

    const doc = await databases.createDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.TEAM_MEMBERS,
      ID.unique(),
      {
        farmId,
        userId,
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : null,
        roleCategory: roleCategory || "worker",
        designationTitle: designationTitle || "Operator",
        status: status || "Active",
        assignedParcels: assignedParcels || "",
        allowedModules: Array.isArray(allowedModules) ? allowedModules : [],
        joinedDate: new Date(joinedDate).toISOString(),
        notes: notes || "",
      }
    );

    return NextResponse.json({
      success: true,
      message: "Team member added to Appwrite",
      member: doc,
    });
  } catch (error: any) {
    console.error("[Appwrite create team error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save team member" },
      { status: 500 }
    );
  }
}
