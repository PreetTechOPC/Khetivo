import { NextRequest, NextResponse } from "next/server";
import { APPWRITE_CONFIG } from "@/lib/appwriteConfig";
import { getServerDatabases } from "@/lib/appwriteServer";
import { ID, Query } from "node-appwrite";

// GET: List stores and inventory items
export async function GET(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const { searchParams } = new URL(req.url);
    const farmId = searchParams.get("farmId");
    const userId = searchParams.get("userId");

    const itemQueries: string[] = [Query.limit(100)];
    const storeQueries: string[] = [Query.limit(50)];

    if (farmId) {
      itemQueries.push(Query.equal("farmId", farmId));
      storeQueries.push(Query.equal("farmId", farmId));
    }
    if (userId) {
      itemQueries.push(Query.equal("userId", userId));
      storeQueries.push(Query.equal("userId", userId));
    }

    const [itemsRes, storesRes] = await Promise.all([
      databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.INVENTORY_ITEMS,
        itemQueries
      ),
      databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.FARM_STORES,
        storeQueries
      ),
    ]);

    return NextResponse.json({
      success: true,
      items: itemsRes.documents,
      stores: storesRes.documents,
    });
  } catch (error: any) {
    console.error("[Appwrite list inventory error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve inventory" },
      { status: 500 }
    );
  }
}

// POST: Add new inventory item, store, or usage log
export async function POST(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const body = await req.json();
    const { action = "item" } = body;

    // Action: create store
    if (action === "store") {
      const { farmId, userId = "usr_default_farmer", name, type = "Warehouse", location = "", notes = "" } = body;
      const storeDoc = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.FARM_STORES,
        ID.unique(),
        {
          farmId: farmId || "default_farm",
          userId,
          name: name?.trim() || "Main Shed",
          type: type || "Warehouse",
          location: location || "",
          notes: notes || "",
        }
      );
      return NextResponse.json({ success: true, store: storeDoc });
    }

    // Action: log usage
    if (action === "usage") {
      const { itemId, farmId, storeId, userId = "usr_default_farmer", quantityUsed, unit, purpose, crop, appliedBy } = body;
      const usageDoc = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.INVENTORY_USAGE_LOGS,
        ID.unique(),
        {
          itemId: itemId || "",
          farmId: farmId || "default_farm",
          storeId: storeId || "",
          userId,
          quantityUsed: Number(quantityUsed) || 0,
          unit: unit || "kg",
          date: new Date().toISOString(),
          purpose: purpose || "Field application",
          crop: crop || "",
          appliedBy: appliedBy || "Farmer",
        }
      );

      // Decrement item quantity if itemId provided
      if (itemId) {
        try {
          const item = await databases.getDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.INVENTORY_ITEMS,
            itemId
          );
          const newQty = Math.max(0, (item.quantity || 0) - (Number(quantityUsed) || 0));
          await databases.updateDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.INVENTORY_ITEMS,
            itemId,
            { quantity: newQty }
          );
        } catch (err) {
          console.warn("Could not update item stock after usage:", err);
        }
      }

      return NextResponse.json({ success: true, usageLog: usageDoc });
    }

    // Default action: create inventory item
    const {
      farmId = "default_farm",
      storeId = "store_main",
      userId = "usr_default_farmer",
      name,
      category = "Fertilizers",
      batchNumber = `BAT-${Date.now().toString().slice(-5)}`,
      purchasedDate = new Date().toISOString(),
      expiryDate = new Date(Date.now() + 365 * 86400000).toISOString(),
      quantity = 10,
      unit = "Bags",
      rate = 300,
      lowStockThreshold = 5,
    } = body;

    const itemDoc = await databases.createDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.INVENTORY_ITEMS,
      ID.unique(),
      {
        farmId,
        storeId,
        userId,
        name: name?.trim() || "Inventory Item",
        category,
        batchNumber,
        purchasedDate: new Date(purchasedDate).toISOString(),
        expiryDate: new Date(expiryDate).toISOString(),
        quantity: Number(quantity) || 0,
        unit,
        rate: Number(rate) || 0,
        lowStockThreshold: Number(lowStockThreshold) || 1,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Inventory item added to Appwrite",
      item: itemDoc,
    });
  } catch (error: any) {
    console.error("[Appwrite create inventory error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save inventory item" },
      { status: 500 }
    );
  }
}

// PATCH: Restock or update quantity
export async function PATCH(req: NextRequest) {
  try {
    const databases = getServerDatabases();
    const body = await req.json();
    const { itemId, quantity, addedQuantity } = body;

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: "itemId is required" },
        { status: 400 }
      );
    }

    let finalQty = quantity;
    if (addedQuantity !== undefined) {
      const existing = await databases.getDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.INVENTORY_ITEMS,
        itemId
      );
      finalQty = (existing.quantity || 0) + Number(addedQuantity);
    }

    const updated = await databases.updateDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.INVENTORY_ITEMS,
      itemId,
      { quantity: Number(finalQty) }
    );

    return NextResponse.json({
      success: true,
      message: "Stock quantity updated in Appwrite",
      item: updated,
    });
  } catch (error: any) {
    console.error("[Appwrite update inventory error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update inventory stock" },
      { status: 500 }
    );
  }
}

