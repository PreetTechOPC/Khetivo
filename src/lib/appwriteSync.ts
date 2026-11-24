/**
 * Khetivo Appwrite Cloud Synchronization & Realtime Service
 * Handles transparent two-way synchronization and WebSocket realtime subscriptions
 * between the React client and the Appwrite Cloud Database.
 */

import { getClientAppwrite, APPWRITE_CONFIG } from "./appwriteConfig";
import { getCurrentUserId } from "./currentSession";

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
// Realtime Subscriptions (Appwrite WebSockets)
// ---------------------------------------------------------------------------
export function subscribeToDatabaseChanges(callback: (event: any) => void): () => void {
  if (typeof window === "undefined") return () => {};
  try {
    const client = getClientAppwrite();
    const channels = [
      `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${APPWRITE_CONFIG.COLLECTIONS.FARMS}.documents`,
      `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${APPWRITE_CONFIG.COLLECTIONS.FARM_CROPS}.documents`,
      `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${APPWRITE_CONFIG.COLLECTIONS.CROP_TEMPLATES}.documents`,
      `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${APPWRITE_CONFIG.COLLECTIONS.TASKS}.documents`,
      `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${APPWRITE_CONFIG.COLLECTIONS.INVENTORY_ITEMS}.documents`,
      `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${APPWRITE_CONFIG.COLLECTIONS.FARM_STORES}.documents`,
      `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${APPWRITE_CONFIG.COLLECTIONS.EQUIPMENT}.documents`,
      `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${APPWRITE_CONFIG.COLLECTIONS.EQUIPMENT_ISSUES}.documents`,
      `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${APPWRITE_CONFIG.COLLECTIONS.SUPPORT_TICKETS}.documents`,
      `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${APPWRITE_CONFIG.COLLECTIONS.FIELD_VISITS}.documents`,
      `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${APPWRITE_CONFIG.COLLECTIONS.FINANCIAL_TRANSACTIONS}.documents`,
      `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${APPWRITE_CONFIG.COLLECTIONS.TEAM_MEMBERS}.documents`,
    ];

    const unsubscribe = client.subscribe(channels, (response) => {
      callback(response);
    });

    return unsubscribe;
  } catch (err) {
    console.warn("[Appwrite Realtime] Subscription not available:", err);
    return () => {};
  }
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
    const uid = userId || getCurrentUserId();
    const url = uid ? `/api/appwrite/farms?userId=${encodeURIComponent(uid)}` : "/api/appwrite/farms";
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
    const uid = farm.userId || getCurrentUserId();
    const res = await fetch("/api/appwrite/farms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...farm, userId: uid }),
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
export async function syncTasksFromAppwrite(farmId?: string, userId?: string): Promise<CloudTask[] | null> {
  try {
    const uid = userId || getCurrentUserId();
    const params = new URLSearchParams();
    if (farmId && farmId !== "all") params.append("farmId", farmId);
    if (uid) params.append("userId", uid);

    const queryString = params.toString();
    const url = queryString ? `/api/appwrite/tasks?${queryString}` : "/api/appwrite/tasks";
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
    const uid = task.userId || getCurrentUserId();
    const res = await fetch("/api/appwrite/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, userId: uid }),
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
export async function syncCropsFromAppwrite(farmId?: string, userId?: string): Promise<CloudCrop[] | null> {
  try {
    const uid = userId || getCurrentUserId();
    const params = new URLSearchParams();
    if (farmId && farmId !== "all") params.append("farmId", farmId);
    if (uid) params.append("userId", uid);

    const queryString = params.toString();
    const url = queryString ? `/api/appwrite/crops?${queryString}` : "/api/appwrite/crops";
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
    const uid = crop.userId || getCurrentUserId();
    const res = await fetch("/api/appwrite/crops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...crop, userId: uid }),
    });
    const data = await res.json();
    return data.success ? data.crop : null;
  } catch (err) {
    console.warn("[AppwriteSync] Error creating crop:", err);
    return null;
  }
}

export async function deleteCropInAppwrite(cropId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/appwrite/crops?cropId=${encodeURIComponent(cropId)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.warn("[AppwriteSync] Error deleting crop:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Inventory & Stores
// ---------------------------------------------------------------------------
export async function syncInventoryFromAppwrite(farmId?: string, userId?: string): Promise<{ items: CloudInventoryItem[]; stores: any[] } | null> {
  try {
    const uid = userId || getCurrentUserId();
    const params = new URLSearchParams();
    if (farmId && farmId !== "all") params.append("farmId", farmId);
    if (uid) params.append("userId", uid);

    const queryString = params.toString();
    const url = queryString ? `/api/appwrite/inventory?${queryString}` : "/api/appwrite/inventory";
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
    const uid = item.userId || getCurrentUserId();
    const res = await fetch("/api/appwrite/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, userId: uid }),
    });
    const data = await res.json();
    return data.success ? data.item : null;
  } catch (err) {
    console.warn("[AppwriteSync] Error saving inventory item:", err);
    return null;
  }
}

export async function createFarmStoreInAppwrite(store: { farmId: string; name: string; type?: string; location?: string; notes?: string; userId?: string }): Promise<any | null> {
  try {
    const uid = store.userId || getCurrentUserId();
    const res = await fetch("/api/appwrite/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "store", ...store, userId: uid }),
    });
    const data = await res.json();
    return data.success ? data.store : null;
  } catch (err) {
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
  userId?: string;
}): Promise<boolean> {
  try {
    const uid = usage.userId || getCurrentUserId();
    const res = await fetch("/api/appwrite/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "usage", ...usage, userId: uid }),
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
export async function syncEquipmentFromAppwrite(farmId?: string, userId?: string): Promise<{ equipment: CloudEquipment[]; issues: any[] } | null> {
  try {
    const uid = userId || getCurrentUserId();
    const params = new URLSearchParams();
    if (farmId && farmId !== "all") params.append("farmId", farmId);
    if (uid) params.append("userId", uid);

    const queryString = params.toString();
    const url = queryString ? `/api/appwrite/equipment?${queryString}` : "/api/appwrite/equipment";
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
    const uid = item.userId || getCurrentUserId();
    const res = await fetch("/api/appwrite/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, userId: uid }),
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
  userId?: string;
}): Promise<boolean> {
  try {
    const uid = problem.userId || getCurrentUserId();
    const res = await fetch("/api/appwrite/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "issue", ...problem, userId: uid }),
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
export async function syncSupportFromAppwrite(userId?: string): Promise<{ tickets: any[]; fieldVisits: any[] } | null> {
  try {
    const uid = userId || getCurrentUserId();
    const url = uid ? `/api/appwrite/support?userId=${encodeURIComponent(uid)}` : "/api/appwrite/support";
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return { tickets: data.tickets || [], fieldVisits: data.fieldVisits || [] };
  } catch (err) {
    return null;
  }
}

export async function createSupportTicketInAppwrite(ticket: {
  farmName: string;
  cropName: string;
  subject: string;
  category: string;
  priority: string;
  description: string;
  userId?: string;
}): Promise<any | null> {
  try {
    const uid = ticket.userId || getCurrentUserId();
    const res = await fetch("/api/appwrite/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...ticket, userId: uid }),
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
  userId?: string;
}): Promise<any | null> {
  try {
    const uid = visit.userId || getCurrentUserId();
    const res = await fetch("/api/appwrite/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "field_visit", ...visit, userId: uid }),
    });
    const data = await res.json();
    return data.success ? data.fieldVisit : null;
  } catch (err) {
    console.warn("[AppwriteSync] Error booking field visit:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Financial Transactions
// ---------------------------------------------------------------------------
export async function syncFinancialsFromAppwrite(farmId?: string, userId?: string): Promise<any[] | null> {
  try {
    const uid = userId || getCurrentUserId();
    const params = new URLSearchParams();
    if (farmId && farmId !== "all") params.append("farmId", farmId);
    if (uid) params.append("userId", uid);

    const queryString = params.toString();
    const url = queryString ? `/api/appwrite/financials?${queryString}` : "/api/appwrite/financials";
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.transactions || [];
  } catch (err) {
    return null;
  }
}

export async function createFinancialTransactionInAppwrite(tx: {
  farmId: string;
  type: string;
  title: string;
  category: string;
  amount: number;
  date?: string;
  quantity?: string;
  crop?: string;
  notes?: string;
  userId?: string;
}): Promise<any | null> {
  try {
    const uid = tx.userId || getCurrentUserId();
    const res = await fetch("/api/appwrite/financials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...tx, userId: uid }),
    });
    const data = await res.json();
    return data.success ? data.transaction : null;
  } catch (err) {
    return null;
  }
}

export async function deleteFinancialTransactionInAppwrite(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/appwrite/financials?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.warn("[AppwriteSync] Error deleting financial transaction:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------
export async function syncTeamFromAppwrite(farmId?: string, userId?: string): Promise<{ members: any[]; designations: any[] } | null> {
  try {
    const uid = userId || getCurrentUserId();
    const params = new URLSearchParams();
    if (farmId && farmId !== "all") params.append("farmId", farmId);
    if (uid) params.append("userId", uid);

    const queryString = params.toString();
    const url = queryString ? `/api/appwrite/team?${queryString}` : "/api/appwrite/team";
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return { members: data.members || [], designations: data.designations || [] };
  } catch (err) {
    return null;
  }
}

export async function createTeamMemberInAppwrite(member: {
  farmId: string;
  name: string;
  phone: string;
  email?: string;
  roleCategory?: string;
  designationTitle?: string;
  allowedModules?: string[];
  userId?: string;
  notes?: string;
}): Promise<any | null> {
  try {
    const uid = member.userId || getCurrentUserId();
    const res = await fetch("/api/appwrite/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...member, userId: uid }),
    });
    const data = await res.json();
    return data.success ? data.member : null;
  } catch (err) {
    return null;
  }
}

export async function deleteTeamMemberInAppwrite(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/appwrite/team?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------
export async function syncInvoicesFromAppwrite(userId?: string): Promise<any[] | null> {
  try {
    const uid = userId || getCurrentUserId();
    const url = uid ? `/api/appwrite/invoices?userId=${encodeURIComponent(uid)}` : "/api/appwrite/invoices";
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.invoices || [];
  } catch (err) {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Agronomy Advisories (Platform broadcasts - visible to all farmers)
// ---------------------------------------------------------------------------
export async function syncAdvisoriesFromAppwrite(): Promise<any[] | null> {
  try {
    const res = await fetch("/api/appwrite/advisories");
    if (!res.ok) return null;
    const data = await res.json();
    return data.advisories || [];
  } catch (err) {
    return null;
  }
}

// ---------------------------------------------------------------------------
// User Subscription & Plans
// ---------------------------------------------------------------------------
export async function syncSubscriptionFromAppwrite(userId?: string): Promise<any | null> {
  try {
    const uid = userId || getCurrentUserId();
    if (!uid) return null;
    const res = await fetch(`/api/appwrite/subscription?userId=${encodeURIComponent(uid)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.subscription || null;
  } catch (err) {
    return null;
  }
}

export async function deleteFarmStoreFromAppwrite(storeId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/appwrite/inventory?storeId=${encodeURIComponent(storeId)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}


export async function updateSubscriptionInAppwrite(payload: {
  userId?: string;
  planTier: string;
  maxAcres?: number;
  acresAllocated?: number;
  annualFee?: number;
  paymentMethod?: string;
}): Promise<any | null> {
  try {
    const uid = payload.userId || getCurrentUserId();
    const res = await fetch("/api/appwrite/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        userId: uid,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.subscription || null;
  } catch (err) {
    return null;
  }
}



// ---------------------------------------------------------------------------
// Crop Master Templates (Shared between Admin & Farmer Dashboard)
// ---------------------------------------------------------------------------
export async function syncCropTemplatesFromAppwrite(): Promise<any[] | null> {
  try {
    const res = await fetch("/api/appwrite/crop-templates");
    if (!res.ok) return null;
    const data = await res.json();
    return data.templates || [];
  } catch (err) {
    console.warn("[AppwriteSync] Error fetching crop templates:", err);
    return null;
  }
}

export async function createCropTemplateInAppwrite(template: any): Promise<any | null> {
  try {
    const res = await fetch("/api/appwrite/crop-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(template),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.template || null;
  } catch (err) {
    console.warn("[AppwriteSync] Error creating crop template:", err);
    return null;
  }
}

export async function deleteCropTemplateFromAppwrite(templateId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/appwrite/crop-templates?templateId=${encodeURIComponent(templateId)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.warn("[AppwriteSync] Error deleting crop template:", err);
    return false;
  }
}
