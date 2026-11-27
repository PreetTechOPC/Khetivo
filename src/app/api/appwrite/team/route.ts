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
    const userId = searchParams.get("userId");

    const memberQueries: string[] = [Query.limit(100)];
    if (farmId && farmId !== "all") memberQueries.push(Query.equal("farmId", farmId));
    if (userId) memberQueries.push(Query.equal("userId", userId));

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
          allowedModules,
          color,
          isSystemDefault,
        }
      );
      return NextResponse.json({ success: true, designation: desDoc });
    }

    // Action: create team member
    const {
      farmId = "all",
      name,
      phone,
      email = "",
      roleCategory = "worker",
      designationTitle = "Farm Worker",
      designationId = "des-custom",
      userId = "usr_default_farmer",
      allowedModules = [],
      notes = "",
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Member name is required" },
        { status: 400 }
      );
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { success: false, message: "Member phone number is required" },
        { status: 400 }
      );
    }

    const memberDoc = await databases.createDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.TEAM_MEMBERS,
      ID.unique(),
      {
        farmId,
        userId,
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : "",
        roleCategory,
        designationTitle,
        status: "Active",
        allowedModules: Array.isArray(allowedModules) ? allowedModules : [],
        joinedDate: new Date().toISOString(),
        notes: notes || "",
      }
    );

    return NextResponse.json({
      success: true,
      message: "Team member registered in Appwrite",
      member: memberDoc,
    });
  } catch (error: any) {
    console.error("[Appwrite create team error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create team record" },
      { status: 500 }
    );
  }
}

// DELETE: Delete team member or designation
export async function DELETE(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "member"; // "member" or "designation"

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID parameter is required" },
        { status: 400 }
      );
    }

    const collectionId =
      type === "designation"
        ? APPWRITE_CONFIG.COLLECTIONS.TEAM_DESIGNATIONS
        : APPWRITE_CONFIG.COLLECTIONS.TEAM_MEMBERS;

    await databases.deleteDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      collectionId,
      id
    );

    return NextResponse.json({
      success: true,
      message: type === "designation" ? "Designation deleted" : "Team member deleted",
    });
  } catch (error: any) {
    console.error("[Appwrite delete team error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete team record" },
      { status: 500 }
    );
  }
}
