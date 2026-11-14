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

    const ticketQueries: string[] = [Query.limit(50), Query.orderDesc("$createdAt")];
    const visitQueries: string[] = [Query.limit(50), Query.orderDesc("$createdAt")];

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

