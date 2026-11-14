/**
 * Khetivo Appwrite Cloud Synchronization Service
 * Handles transparent two-way synchronization between client UI and Appwrite database
 */

export interface CloudFarm {
  $id?: string;
  userId?: string;
  name: string;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  totalArea: number;
  areaUnit: string;
  ownership?: string;
  latitude?: number;
  longitude?: number;
  soilType?: string;
  irrigationType?: string;
  waterSource?: string;
  cropTemplate?: string;
}

export interface CloudTask {
  $id?: string;
  farmId: string;
  userId?: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  dueDate: string;
  assignedTo?: string;
  zone?: string;
  crop?: string;
  instructions?: string;
  description?: string;
}

export interface CloudCrop {
  $id?: string;
  farmId: string;
  userId?: string;
  name: string;
  variety: string;
  area: number;
  areaUnit: string;
  season: string;
  stage: string;
  stageStep: number;
  currentDay: number;
  totalDays: number;
  health: string;
  sownDate: string;
  harvestDate: string;
  nextMilestone: string;
  color?: string;
}

export interface CloudInventoryItem {
  $id?: string;
  farmId: string;
  storeId: string;
  userId?: string;
  name: string;
  category: string;
  batchNumber?: string;
  purchasedDate?: string;
  expiryDate?: string;
  quantity: number;
  unit: string;
  rate: number;
  lowStockThreshold: number;
}

export interface CloudEquipment {
  $id?: string;
  farmId: string;
  userId?: string;
  name: string;
  category?: string;
  model?: string;
  operator?: string;
  status: string;
  runtimeHours: number;
  nextServiceHours?: number;
  fuelLevel?: number;
  fuelEfficiency?: string;
}

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------
export async function checkAppwriteHealth(): Promise<{
  connected: boolean;
  database?: string;
  collections?: number;
  error?: string;
}> {
  try {
    const res = await fetch("/api/appwrite/health");
    const data = await res.json();
    if (res.ok && data.success) {
      return {
        connected: true,
        database: data.database?.name,
        collections: data.database?.collectionsTotal,
      };
    }
    return { connected: false, error: data.message };
  } catch (err: any) {
    return { connected: false, error: err.message || "Network error connecting to Appwrite" };
  }
}

// ---------------------------------------------------------------------------
// Farms
// ---------------------------------------------------------------------------
export async function syncFarmsFromAppwrite(userId?: string): Promise<CloudFarm[] | null> {
  try {
    const url = userId ? `/api/appwrite/farms?userId=${encodeURIComponent(userId)}` : "/api/appwrite/farms";
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.farms || [];
  } catch (err) {
    console.warn("[AppwriteSync] Error fetching farms:", err);
    return null;
  }
}

export async function createFarmInAppwrite(farm: CloudFarm): Promise<CloudFarm | null> {
  try {
    const res = await fetch("/api/appwrite/farms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(farm),
    });
    const data = await res.json();
    return data.success ? data.farm : null;
  } catch (err) {
    console.warn("[AppwriteSync] Error saving farm:", err);
    return null;
  }
}

export async function deleteFarmInAppwrite(farmId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/appwrite/farms?farmId=${encodeURIComponent(farmId)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.warn("[AppwriteSync] Error deleting farm:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------
export async function syncTasksFromAppwrite(farmId?: string): Promise<CloudTask[] | null> {
  try {
    const url = farmId ? `/api/appwrite/tasks?farmId=${encodeURIComponent(farmId)}` : "/api/appwrite/tasks";
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.tasks || [];
  } catch (err) {
    console.warn("[AppwriteSync] Error fetching tasks:", err);
    return null;
  }
}

export async function createTaskInAppwrite(task: CloudTask): Promise<CloudTask | null> {
  try {
    const res = await fetch("/api/appwrite/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    const data = await res.json();
    return data.success ? data.task : null;
  } catch (err) {
    console.warn("[AppwriteSync] Error creating task:", err);
    return null;
  }
}

export async function updateTaskStatusInAppwrite(taskId: string, status: string): Promise<boolean> {
  try {
    const res = await fetch("/api/appwrite/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status }),
    });
    return res.ok;
  } catch (err) {
    console.warn("[AppwriteSync] Error updating task status:", err);
    return false;
  }
}

export async function deleteTaskFromAppwrite(taskId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/appwrite/tasks?taskId=${encodeURIComponent(taskId)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.warn("[AppwriteSync] Error deleting task:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Crops
// ---------------------------------------------------------------------------
export async function syncCropsFromAppwrite(farmId?: string): Promise<CloudCrop[] | null> {
  try {
    const url = farmId ? `/api/appwrite/crops?farmId=${encodeURIComponent(farmId)}` : "/api/appwrite/crops";
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.crops || [];
  } catch (err) {
    console.warn("[AppwriteSync] Error fetching crops:", err);
    return null;
  }
}

export async function createCropInAppwrite(crop: CloudCrop): Promise<CloudCrop | null> {
  try {
    const res = await fetch("/api/appwrite/crops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(crop),
    });
    const data = await res.json();
    return data.success ? data.crop : null;
  } catch (err) {
    console.warn("[AppwriteSync] Error creating crop:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Inventory & Stores
// ---------------------------------------------------------------------------
export async function syncInventoryFromAppwrite(farmId?: string): Promise<{ items: CloudInventoryItem[]; stores: any[] } | null> {
  try {
    const url = farmId ? `/api/appwrite/inventory?farmId=${encodeURIComponent(farmId)}` : "/api/appwrite/inventory";
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return { items: data.items || [], stores: data.stores || [] };
  } catch (err) {
    console.warn("[AppwriteSync] Error fetching inventory:", err);
    return null;
  }
}

export async function createInventoryItemInAppwrite(item: CloudInventoryItem): Promise<CloudInventoryItem | null> {
  try {
    const res = await fetch("/api/appwrite/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    const data = await res.json();
    return data.success ? data.item : null;
  } catch (err) {
    console.warn("[AppwriteSync] Error saving inventory item:", err);
    return null;
  }
}

export async function logUsageInAppwrite(usage: {
  itemId: string;
  farmId: string;
  storeId: string;
  quantityUsed: number;
  unit: string;
  purpose: string;
  crop?: string;
  appliedBy?: string;
}): Promise<boolean> {
  try {
    const res = await fetch("/api/appwrite/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "usage", ...usage }),
    });
    return res.ok;
  } catch (err) {
    console.warn("[AppwriteSync] Error logging inventory usage:", err);
    return false;
  }
}

export async function restockItemInAppwrite(itemId: string, addedQuantity: number): Promise<boolean> {
  try {
    const res = await fetch("/api/appwrite/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, addedQuantity }),
    });
    return res.ok;
  } catch (err) {
    console.warn("[AppwriteSync] Error restocking inventory item:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Equipment
// ---------------------------------------------------------------------------
export async function syncEquipmentFromAppwrite(farmId?: string): Promise<{ equipment: CloudEquipment[]; issues: any[] } | null> {
  try {
    const url = farmId ? `/api/appwrite/equipment?farmId=${encodeURIComponent(farmId)}` : "/api/appwrite/equipment";
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return { equipment: data.equipment || [], issues: data.issues || [] };
  } catch (err) {
    console.warn("[AppwriteSync] Error fetching equipment:", err);
    return null;
  }
}

export async function createEquipmentInAppwrite(item: CloudEquipment): Promise<CloudEquipment | null> {
  try {
    const res = await fetch("/api/appwrite/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    const data = await res.json();
    return data.success ? data.equipment : null;
  } catch (err) {
    console.warn("[AppwriteSync] Error saving equipment:", err);
    return null;
  }
}

export async function reportEquipmentProblemInAppwrite(problem: {
  equipmentId: string;
  farmId: string;
  issueType: string;
  severity: string;
  description: string;
  reportedBy?: string;
}): Promise<boolean> {
  try {
    const res = await fetch("/api/appwrite/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "issue", ...problem }),
    });
    return res.ok;
  } catch (err) {
    console.warn("[AppwriteSync] Error reporting equipment issue:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Support & Field Visits
// ---------------------------------------------------------------------------
export async function createSupportTicketInAppwrite(ticket: {
  farmName: string;
  cropName: string;
  subject: string;
  category: string;
  priority: string;
  description: string;
}): Promise<any | null> {
  try {
    const res = await fetch("/api/appwrite/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticket),
    });
    const data = await res.json();
    return data.success ? data.ticket : null;
  } catch (err) {
    console.warn("[AppwriteSync] Error creating support ticket:", err);
    return null;
  }
}

export async function bookFieldVisitInAppwrite(visit: {
  farmerName: string;
  phone: string;
  farmName: string;
  crop: string;
  reason: string;
  scheduledDate: string;
  timeSlot: string;
  tier: string;
  fee: number;
}): Promise<any | null> {
  try {
    const res = await fetch("/api/appwrite/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "field_visit", ...visit }),
    });
    const data = await res.json();
    return data.success ? data.fieldVisit : null;
  } catch (err) {
    console.warn("[AppwriteSync] Error booking field visit:", err);
    return null;
  }
}
