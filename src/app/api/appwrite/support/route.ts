import { NextRequest, NextResponse } from "next/server";
import { APPWRITE_CONFIG } from "@/lib/appwriteConfig";
import { getServerDatabases } from "@/lib/appwriteServer";
import { ID, Query } from "node-appwrite";

// GET: List support tickets and field visits
export async function GET(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const ticketQueries: string[] = [Query.limit(100), Query.orderDesc("$createdAt")];
    const visitQueries: string[] = [Query.limit(100), Query.orderDesc("$createdAt")];

    if (userId) {
      ticketQueries.push(Query.equal("userId", userId));
      visitQueries.push(Query.equal("userId", userId));
    }

    const [ticketsRes, visitsRes] = await Promise.all([
      databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.SUPPORT_TICKETS,
        ticketQueries
      ),
      databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.FIELD_VISITS,
        visitQueries
      ),
    ]);

    return NextResponse.json({
      success: true,
      tickets: ticketsRes.documents,
      fieldVisits: visitsRes.documents,
    });
  } catch (error: any) {
    console.error("[Appwrite list support error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve support records" },
      { status: 500 }
    );
  }
}

// POST: Create ticket or book field visit
export async function POST(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const body = await req.json();
    const { action = "ticket" } = body;

    // Action: Book field visit
    if (action === "field_visit") {
      const {
        userId = "usr_default_farmer",
        farmerName = "Jaswinder Singh",
        phone = "9814054321",
        farmName = "Main Farm",
        plotLandmark = "",
        crop = "Wheat",
        reason = "Crop Health & Soil Inspection",
        scheduledDate = new Date().toISOString(),
        timeSlot = "10:00 AM - 12:00 PM",
        tier = "Standard Diagnostic",
        fee = 499,
        paymentStatus = "Pending / Pay on Arrival",
        workflowStage = "Requested",
        assignedSpecialist = "PAU Agronomy Specialist",
        notes = "",
      } = body;

      const visitDoc = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.FIELD_VISITS,
        ID.unique(),
        {
          userId,
          farmerName,
          phone,
          farmName,
          plotLandmark: plotLandmark || "",
          crop: crop || "Wheat",
          reason: reason || "Field scouting",
          scheduledDate: new Date(scheduledDate).toISOString(),
          timeSlot: timeSlot || "Morning",
          tier: tier || "Standard Diagnostic",
          fee: Number(fee) || 499,
          paymentStatus: paymentStatus || "Pending",
          workflowStage: workflowStage || "Requested",
          assignedSpecialist: assignedSpecialist || "PAU Specialist",
          notes: notes || "",
        }
      );

      return NextResponse.json({
        success: true,
        message: "Field visit booked in Appwrite",
        fieldVisit: visitDoc,
      });
    }

    // Default action: Create support ticket
    const {
      userId = "usr_default_farmer",
      ticketNo = `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      farmName = "Main Farm",
      cropName = "Wheat",
      subject,
      category = "Crop Health & Pathology",
      priority = "Normal",
      status = "Open",
      assignedAgronomist = "Dr. Harpreet Singh (PAU)",
      description,
      resolution = "",
    } = body;

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { success: false, message: "Ticket subject is required" },
        { status: 400 }
      );
    }

    const ticketDoc = await databases.createDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.SUPPORT_TICKETS,
      ID.unique(),
      {
        ticketNo,
        userId,
        farmName: farmName || "Main Farm",
        cropName: cropName || "Wheat",
        subject: subject.trim(),
        category,
        priority,
        status,
        assignedAgronomist: assignedAgronomist || "Dr. Harpreet Singh",
        description: description || subject,
        resolution: resolution || "",
      }
    );

    return NextResponse.json({
      success: true,
      message: "Support ticket created in Appwrite",
      ticket: ticketDoc,
    });
  } catch (error: any) {
    console.error("[Appwrite create support error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create ticket" },
      { status: 500 }
    );
  }
}

// PATCH: Update ticket status/resolution or update field visit status/specialist
export async function PATCH(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const body = await req.json();
    const { type = "ticket", id, status, resolution, assignedAgronomist, workflowStage, assignedSpecialist, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    if (type === "field_visit") {
      const updateData: any = {};
      if (workflowStage) updateData.workflowStage = workflowStage;
      if (assignedSpecialist) updateData.assignedSpecialist = assignedSpecialist;
      if (notes !== undefined) updateData.notes = notes;

      const updated = await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.FIELD_VISITS,
        id,
        updateData
      );
      return NextResponse.json({ success: true, message: "Field visit updated", fieldVisit: updated });
    }

    // Default: update support ticket
    const updateData: any = {};
    if (status) updateData.status = status;
    if (resolution !== undefined) updateData.resolution = resolution;
    if (assignedAgronomist) updateData.assignedAgronomist = assignedAgronomist;

    const updated = await databases.updateDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.SUPPORT_TICKETS,
      id,
      updateData
    );

    return NextResponse.json({ success: true, message: "Support ticket updated", ticket: updated });
  } catch (error: any) {
    console.error("[Appwrite patch support error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update support record" },
      { status: 500 }
    );
  }
}

// DELETE: Delete ticket or field visit
export async function DELETE(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "ticket";

    if (!id) {
      return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    }

    const collectionId =
      type === "field_visit"
        ? APPWRITE_CONFIG.COLLECTIONS.FIELD_VISITS
        : APPWRITE_CONFIG.COLLECTIONS.SUPPORT_TICKETS;

    await databases.deleteDocument(APPWRITE_CONFIG.DATABASE_ID, collectionId, id);

    return NextResponse.json({ success: true, message: "Record deleted successfully", id });
  } catch (error: any) {
    console.error("[Appwrite delete support error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete support record" },
      { status: 500 }
    );
  }
}
