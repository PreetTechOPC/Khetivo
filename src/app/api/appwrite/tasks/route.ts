import { NextRequest, NextResponse } from "next/server";
import { APPWRITE_CONFIG } from "@/lib/appwriteConfig";
import { getServerDatabases } from "@/lib/appwriteServer";
import { ID, Query } from "node-appwrite";

// GET: List tasks (by farmId or userId)
export async function GET(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const farmId = searchParams.get("farmId");
    const userId = searchParams.get("userId");

    const queries: string[] = [Query.limit(100), Query.orderDesc("$createdAt")];
    if (farmId) queries.push(Query.equal("farmId", farmId));
    if (userId) queries.push(Query.equal("userId", userId));

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.TASKS,
      queries
    );

    return NextResponse.json({
      success: true,
      total: response.total,
      tasks: response.documents,
    });
  } catch (error: any) {
    console.error("[Appwrite list tasks error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve tasks" },
      { status: 500 }
    );
  }
}

// POST: Create a task
export async function POST(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const body = await req.json();

    const {
      farmId = "default_farm",
      userId = "usr_default_farmer",
      title,
      category = "Field Work",
      priority = "Medium",
      status = "Pending",
      dueDate = new Date().toISOString(),
      assignedTo = "Unassigned",
      zone = "Field Parcel",
      crop = "General",
      instructions = "",
      description = "",
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Task title is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["To Do", "In Progress", "Completed"];
    let mappedStatus = status;
    if (status === "Pending" || !validStatuses.includes(status)) {
      mappedStatus = "To Do";
    }

    const doc = await databases.createDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.TASKS,
      ID.unique(),
      {
        farmId,
        userId,
        title: title.trim(),
        category,
        priority,
        status: mappedStatus,
        dueDate: new Date(dueDate).toISOString(),
        assignedTo,
        zone,
        crop,
        instructions: instructions || "",
        description: description || "",
      }
    );

    return NextResponse.json({
      success: true,
      message: "Task created in Appwrite",
      task: doc,
    });
  } catch (error: any) {
    console.error("[Appwrite create task error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create task" },
      { status: 500 }
    );
  }
}

// PATCH: Update task status (e.g. toggle completion)
export async function PATCH(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const body = await req.json();
    const { taskId, status } = body;

    if (!taskId) {
      return NextResponse.json(
        { success: false, message: "taskId is required" },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};
    if (status) {
      const validStatuses = ["To Do", "In Progress", "Completed"];
      const mapped = status === "Pending" || !validStatuses.includes(status) ? "To Do" : status;
      updates.status = mapped;
      if (mapped === "Completed") {
        updates.completedDate = new Date().toISOString();
      }
    }

    const updated = await databases.updateDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.TASKS,
      taskId,
      updates
    );

    return NextResponse.json({
      success: true,
      message: "Task updated in Appwrite",
      task: updated,
    });
  } catch (error: any) {
    console.error("[Appwrite update task error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a task
export async function DELETE(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { success: false, message: "taskId query param is required" },
        { status: 400 }
      );
    }

    await databases.deleteDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.TASKS,
      taskId
    );

    return NextResponse.json({
      success: true,
      message: "Task deleted from Appwrite",
      taskId,
    });
  } catch (error: any) {
    console.error("[Appwrite delete task error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete task" },
      { status: 500 }
    );
  }
}
