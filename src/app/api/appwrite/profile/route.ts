import { NextRequest, NextResponse } from "next/server";
import { APPWRITE_CONFIG } from "@/lib/appwriteConfig";
import { getServerDatabases } from "@/lib/appwriteServer";
import { ID, Query } from "node-appwrite";

// GET: Retrieve user profile by userId, phone, or email
export async function GET(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const phone = searchParams.get("phone");
    const email = searchParams.get("email");

    const queries: string[] = [Query.limit(1)];
    if (userId) {
      queries.push(Query.equal("userId", userId));
    } else if (phone) {
      const cleanPhone = phone.replace(/^\+91/, "").replace(/\D/g, "");
      queries.push(Query.equal("phone", cleanPhone));
    } else if (email) {
      queries.push(Query.equal("email", email.toLowerCase().trim()));
    } else {
      return NextResponse.json({ success: false, message: "Missing search identifier" }, { status: 400 });
    }

    const res = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.USER_PROFILES,
      queries
    );

    if (res.documents.length === 0) {
      return NextResponse.json({ success: true, profile: null });
    }

    return NextResponse.json({ success: true, profile: res.documents[0] });
  } catch (error: any) {
    console.error("[Profile GET Error]:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to fetch profile" }, { status: 500 });
  }
}

// POST: Update or create user profile in Appwrite Cloud DB
export async function POST(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const body = await req.json();

    const {
      userId,
      name,
      phone,
      email,
      district = "Ludhiana",
      state = "Punjab",
      measurementUnit = "Acres",
      preferredLanguage = "en",
      mandiLinkage = "Local APMC Mandi",
      farmAddress = "",
    } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: "Farmer name is required" }, { status: 400 });
    }

    // Clean phone number (strip +91 and spaces)
    const cleanPhone = phone ? phone.replace(/^\+91/, "").replace(/\D/g, "") : "";

    // Search for existing document by userId, phone or email
    let existingDocId: string | null = null;
    const searchQueries: string[] = [Query.limit(1)];
    if (userId) {
      searchQueries.push(Query.equal("userId", userId));
    } else if (cleanPhone) {
      searchQueries.push(Query.equal("phone", cleanPhone));
    } else if (email) {
      searchQueries.push(Query.equal("email", email.toLowerCase().trim()));
    }

    if (searchQueries.length > 1) {
      try {
        const found = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.USER_PROFILES,
          searchQueries
        );
        if (found.documents.length > 0) {
          existingDocId = found.documents[0].$id;
        }
      } catch (e) {
        console.warn("Lookup profile existing document error:", e);
      }
    }

    // Validate preferredLanguage enum ('en' | 'pa' | 'hi')
    const validLang = ["en", "pa", "hi"].includes(preferredLanguage) ? preferredLanguage : "en";

    const profileData: Record<string, any> = {
      name: name.trim(),
      phone: cleanPhone || "9876543210",
      email: email ? email.toLowerCase().trim() : undefined,
      district: district.trim() || "Ludhiana",
      state: state.trim() || "Punjab",
      measurementUnit: measurementUnit || "Acres",
      preferredLanguage: validLang,
      mandiLinkage: mandiLinkage || "Local APMC Mandi",
      farmAddress: farmAddress.trim(),
      role: "farmer",
      offlineSync: true,
      motorAutomation: true,
    };

    if (userId) {
      profileData.userId = userId;
    }

    let savedDoc;
    if (existingDocId) {
      savedDoc = await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.USER_PROFILES,
        existingDocId,
        profileData
      );
    } else {
      profileData.userId = userId || `usr_${Date.now()}`;
      savedDoc = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.USER_PROFILES,
        ID.unique(),
        profileData
      );
    }

    return NextResponse.json({
      success: true,
      profile: savedDoc,
    });
  } catch (error: any) {
    console.error("[Profile POST Error]:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to save profile" }, { status: 500 });
  }
}
