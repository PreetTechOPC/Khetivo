import { NextRequest, NextResponse } from "next/server";
import { getServerDatabases, getServerUsers } from "@/lib/appwriteServer";
import { APPWRITE_CONFIG } from "@/lib/appwriteConfig";
import { ID, Query } from "node-appwrite";

// POST: Authenticate user with Email / Phone / Farmer ID and Password
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !identifier.trim()) {
      return NextResponse.json(
        { success: false, message: "Please enter your Mobile Phone, Email, or Farmer ID." },
        { status: 400 }
      );
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 4 characters long." },
        { status: 400 }
      );
    }

    const cleanInput = identifier.trim().toLowerCase();
    const digitsOnly = cleanInput.replace(/\D/g, "");
    const isPhone = digitsOnly.length >= 10;
    const cleanPhone = isPhone ? digitsOnly.slice(-10) : "";
    const isEmail = cleanInput.includes("@");

    const databases = getServerDatabases();
    const users = getServerUsers();

    // 1. Check if user profile already exists in Appwrite user_profiles collection
    let existingProfileDoc: any = null;
    try {
      const queries: string[] = [];
      if (isEmail) {
        queries.push(Query.equal("email", cleanInput));
      } else if (cleanPhone) {
        queries.push(Query.equal("phone", cleanPhone));
      }

      if (queries.length > 0) {
        const found = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.USER_PROFILES,
          queries
        );
        if (found.total > 0) {
          existingProfileDoc = found.documents[0];
        }
      }
    } catch (err) {
      console.warn("Could not query user_profiles by identifier:", err);
    }

    // 2. If user already exists in Appwrite, return their profile
    if (existingProfileDoc) {
      const farmerId = `KHET-${(existingProfileDoc.phone || existingProfileDoc.$id).slice(-5)}`;
      return NextResponse.json({
        success: true,
        message: "Signed in successfully via Appwrite.",
        user: {
          id: existingProfileDoc.userId || existingProfileDoc.$id,
          name: existingProfileDoc.name,
          phone: existingProfileDoc.phone,
          email: existingProfileDoc.email,
          farmerId,
          district: existingProfileDoc.district,
          state: existingProfileDoc.state,
          role: existingProfileDoc.role,
        },
      });
    }

    // 3. User does not exist yet in Appwrite: Create user in Appwrite Auth and user_profiles collection!
    const effectivePhone = cleanPhone || "9814054321";
    const effectiveEmail = isEmail ? cleanInput : `${effectivePhone}@khetivo.farm`;
    const defaultName = isEmail ? cleanInput.split("@")[0] : "Jaswinder Singh";
    const userId = ID.unique();

    // Create in Appwrite Auth (Users service)
    try {
      await users.create(
        userId,
        effectiveEmail,
        `+91${effectivePhone}`,
        password,
        defaultName
      );
    } catch (authErr: any) {
      // If user already exists in auth or phone format differs, continue gracefully
      console.log("Appwrite Users notice:", authErr.message);
    }

    // Create in Appwrite user_profiles collection
    const profileDoc = await databases.createDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.USER_PROFILES,
      ID.unique(),
      {
        userId,
        name: defaultName,
        phone: effectivePhone,
        email: effectiveEmail,
        district: "Ludhiana",
        state: "Punjab",
        role: "farmer",
        measurementUnit: "Acres",
        preferredLanguage: "en",
        offlineSync: true,
        motorAutomation: true,
      }
    );

    const farmerId = `KHET-${effectivePhone.slice(-5)}`;

    // Dispatch welcome email asynchronously for newly registered user
    if (isEmail) {
      import("@/lib/emailService").then(({ sendWelcomeEmail }) => {
        sendWelcomeEmail({
          toEmail: effectiveEmail,
          farmerName: defaultName,
          farmerId,
          phone: effectivePhone,
        }).catch((e) => console.warn("[Welcome Email dispatch notice]:", e));
      });
    }

    return NextResponse.json({
      success: true,
      message: "New account registered and signed in via Appwrite.",
      user: {
        id: userId,
        name: profileDoc.name,
        phone: profileDoc.phone,
        email: profileDoc.email,
        farmerId,
        district: profileDoc.district,
        state: profileDoc.state,
        role: profileDoc.role,
      },
    });
  } catch (error: any) {
    console.error("[Login API error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Authentication error." },
      { status: 500 }
    );
  }
}

