import 'react-native-url-polyfill/auto';
import {
  Client,
  Account,
  Databases,
  Storage,
  ID,
  Query,
  OAuthProvider,
} from 'react-native-appwrite';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import { APPWRITE_CONFIG } from './appwriteConfig';
import { Farm, Crop, Task, InventoryItem, MandiRate } from '../data/mockData';

// Initialize WebBrowser auth session handler
WebBrowser.maybeCompleteAuthSession();

// Initialize Appwrite Client
const client = new Client();
client
  .setEndpoint(APPWRITE_CONFIG.ENDPOINT)
  .setProject(APPWRITE_CONFIG.PROJECT_ID);

if (Platform.OS !== 'web') {
  client.setPlatform('com.khetivo.app');
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Query, OAuthProvider, client };

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role?: string;
}

// =============================================================================
// AUTHENTICATION SERVICES
// =============================================================================

/**
 * Perform Google OAuth login using Appwrite and Expo WebBrowser
 */
export async function loginWithGoogle(): Promise<AppUser | null> {
  try {
    const callbackScheme = `appwrite-callback-${APPWRITE_CONFIG.PROJECT_ID}`;
    const redirectUrl = Platform.OS === 'web'
      ? makeRedirectUri({ preferLocalhost: true })
      : `${callbackScheme}://auth`;

    const tokenUrl = account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUrl,
      redirectUrl
    );

    if (!tokenUrl) {
      throw new Error('Failed to generate Google OAuth URL from Appwrite.');
    }

    const tokenUrlStr = tokenUrl.toString();
    const authResult = await WebBrowser.openAuthSessionAsync(
      tokenUrlStr,
      redirectUrl
    );

    if (authResult.type !== 'success' || !authResult.url) {
      return null;
    }

    const responseUrl = new URL(authResult.url);
    const secret = responseUrl.searchParams.get('secret');
    const userId = responseUrl.searchParams.get('userId');

    if (!secret || !userId) {
      throw new Error('Authentication callback missing userId or secret parameter.');
    }

    await account.createSession(userId, secret);
    const currentAccount = await account.get();

    const appUser: AppUser = {
      id: currentAccount.$id,
      name: currentAccount.name || (currentAccount.email ? currentAccount.email.split('@')[0] : 'Kisan Farmer'),
      email: currentAccount.email,
      phone: currentAccount.phone || undefined,
    };

    // User profile sync
    try {
      const existing = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.USER_PROFILES,
        [Query.equal('userId', currentAccount.$id)]
      );
      if (existing.total === 0) {
        await databases.createDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.USER_PROFILES,
          ID.unique(),
          {
            userId: currentAccount.$id,
            name: appUser.name,
            phone: appUser.phone || '+91 98000-00000',
            email: appUser.email || '',
            role: 'farmer',
            district: 'Ludhiana',
            state: 'Punjab',
            measurementUnit: 'Acres',
            preferredLanguage: 'en',
            offlineSync: true,
            motorAutomation: true,
          }
        );
      }
    } catch (profileErr) {
      console.warn('User profile sync notice:', profileErr);
    }

    return appUser;
  } catch (error: any) {
    console.error('Appwrite Google Sign-In Error:', error);
    throw error;
  }
}

/**
 * Retrieve the currently logged in Appwrite user (if session exists)
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  try {
    const currentAccount = await account.get();
    return {
      id: currentAccount.$id,
      name: currentAccount.name || (currentAccount.email ? currentAccount.email.split('@')[0] : 'Kisan Farmer'),
      email: currentAccount.email,
      phone: currentAccount.phone || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Terminate current Appwrite session
 */
export async function logout(): Promise<void> {
  try {
    await account.deleteSession('current');
  } catch (err) {
    console.warn('Logout notice:', err);
  }
}

/**
 * Sign in with Email and Password using Appwrite
 */
export async function loginWithEmail(email: string, password: string): Promise<AppUser> {
  try {
    await account.deleteSession('current');
  } catch {
    // Ignore if no active session
  }

  await account.createEmailPasswordSession(email, password);
  const currentAccount = await account.get();
  return {
    id: currentAccount.$id,
    name: currentAccount.name || email.split('@')[0],
    email: currentAccount.email,
    phone: currentAccount.phone || undefined,
  };
}

/**
 * Register a new user with Email and Password using Appwrite
 */
export async function registerWithEmail(
  email: string,
  password: string,
  name: string,
  phone?: string
): Promise<AppUser> {
  const newId = ID.unique();
  await account.create(newId, email, password, name);
  await account.createEmailPasswordSession(email, password);
  const currentAccount = await account.get();

  try {
    await databases.createDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.USER_PROFILES,
      ID.unique(),
      {
        userId: currentAccount.$id,
        name: name,
        phone: phone || '+91 98000-00000',
        email: email,
        role: 'farmer',
        district: 'Ludhiana',
        state: 'Punjab',
        measurementUnit: 'Acres',
        preferredLanguage: 'en',
        offlineSync: true,
        motorAutomation: true,
      }
    );
  } catch (profileErr) {
    console.warn('Profile sync notice on register:', profileErr);
  }

  // Dispatch Welcome Email via custom email API
  try {
    const webEndpoint =
      Platform.OS === 'android'
        ? 'http://10.0.2.2:3000/api/email'
        : 'http://localhost:3000/api/email';

    fetch(webEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'welcome',
        payload: {
          toEmail: email,
          farmerName: name,
          farmerId: `KHET-${(phone || currentAccount.$id).replace(/\D/g, '').slice(-5)}`,
          phone: phone,
        },
      }),
    }).catch(() => {});
  } catch {}

  return {
    id: currentAccount.$id,
    name: currentAccount.name || name,
    email: currentAccount.email,
    phone: phone || currentAccount.phone || undefined,
  };
}

/**
 * Send password recovery email via Appwrite & Custom Khetivo Email Service
 */
export async function sendPasswordRecovery(email: string): Promise<void> {
  const redirectUrl = makeRedirectUri({
    scheme: 'khetivo',
    path: 'auth',
    preferLocalhost: Platform.OS === 'web',
  });

  // 1. Trigger Appwrite native account recovery
  try {
    await account.createRecovery(email, redirectUrl);
  } catch (err) {
    console.warn('Appwrite createRecovery notice:', err);
  }

  // 2. Dispatch custom branded Khetivo HTML reset email
  try {
    const webEndpoint =
      Platform.OS === 'android'
        ? 'http://10.0.2.2:3000/api/email'
        : 'http://localhost:3000/api/email';

    await fetch(webEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'forgot_password',
        payload: {
          toEmail: email,
          farmerName: email.split('@')[0],
          resetLink: `${redirectUrl}?email=${encodeURIComponent(email)}`,
          resetCode: Math.floor(100000 + Math.random() * 900000).toString(),
        },
      }),
    });
  } catch (customEmailErr) {
    console.log('Custom recovery email dispatch notice:', customEmailErr);
  }
}

// =============================================================================
// DATABASE SERVICES (FARMS, CROPS, TASKS, INVENTORY, FINANCIALS)
// =============================================================================

/**
 * Fetch all farms for the current farmer from Appwrite Database
 */
export async function fetchFarmsFromDB(userId?: string): Promise<Farm[]> {
  try {
    const queries: string[] = [Query.limit(50)];
    if (userId) {
      queries.push(Query.equal('userId', userId));
    }

    const res = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.FARMS,
      queries
    );

    return res.documents.map((doc: any) => ({
      id: doc.$id,
      name: doc.name || 'My Farm',
      address: doc.address || '',
      district: doc.district || 'Punjab',
      state: doc.state || 'Punjab',
      pinCode: doc.pinCode || '',
      totalArea: Number(doc.totalArea) || 1,
      areaUnit: doc.areaUnit || 'Acres',
      soilType: doc.soilType || 'Alluvial Loam',
      irrigationType: doc.irrigationType || 'Tubewell',
      waterSource: doc.waterSource || 'Groundwater',
      cropTemplate: doc.cropTemplate || '',
      crops: [],
    }));
  } catch (error) {
    console.warn('[Appwrite fetchFarms Error]:', error);
    return [];
  }
}

/**
 * Create a new Farm in Appwrite Database
 */
export async function createFarmInDB(farm: Partial<Farm>, userId: string): Promise<Farm> {
  const doc = await databases.createDocument(
    APPWRITE_CONFIG.DATABASE_ID,
    APPWRITE_CONFIG.COLLECTIONS.FARMS,
    ID.unique(),
    {
      userId,
      name: farm.name || 'New Farm',
      address: farm.address || '',
      district: farm.district || 'Ludhiana',
      state: farm.state || 'Punjab',
      pinCode: farm.pinCode || '',
      totalArea: Number(farm.totalArea) || 10,
      areaUnit: farm.areaUnit || 'Acres',
      ownership: 'Owned',
      soilType: farm.soilType || 'Alluvial Loam',
      irrigationType: farm.irrigationType || 'Drip Irrigation',
      waterSource: farm.waterSource || 'Borewell',
      cropTemplate: farm.cropTemplate || '',
      isArchived: false,
    }
  );

  return {
    id: doc.$id,
    name: doc.name,
    address: doc.address,
    district: doc.district,
    state: doc.state,
    pinCode: doc.pinCode,
    totalArea: Number(doc.totalArea),
    areaUnit: doc.areaUnit,
    soilType: doc.soilType,
    irrigationType: doc.irrigationType,
    waterSource: doc.waterSource,
    cropTemplate: doc.cropTemplate,
    crops: [],
  };
}

/**
 * Fetch Crops from Appwrite Database
 */
export async function fetchCropsFromDB(farmId?: string): Promise<Crop[]> {
  try {
    const queries: string[] = [Query.limit(50)];
    if (farmId) {
      queries.push(Query.equal('farmId', farmId));
    }

    const res = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.FARM_CROPS,
      queries
    );

    return res.documents.map((doc: any) => ({
      id: doc.$id,
      name: doc.cropName || doc.name || 'Crop',
      variety: doc.variety || '',
      area: Number(doc.area) || 0,
      areaUnit: doc.areaUnit || 'Acres',
      season: doc.season || 'Rabi',
      stage: doc.stage || 'Sprouting',
      stageStep: Number(doc.stageStep) || 1,
      currentDay: Number(doc.currentDay) || 1,
      totalDays: Number(doc.totalDays) || 95,
      health: doc.health || 'Optimal',
      sownDate: doc.sownDate || '',
      nextMilestone: doc.nextMilestone || '',
      harvestDate: doc.harvestDate || '',
      color: doc.color || '#278449',
      lowMoistureAlert: Number(doc.lowMoistureAlert) || 30,
      currentMoisture: Number(doc.currentMoisture) || 35,
      dos: doc.dos ? (typeof doc.dos === 'string' ? JSON.parse(doc.dos) : doc.dos) : [],
      donts: doc.donts ? (typeof doc.donts === 'string' ? JSON.parse(doc.donts) : doc.donts) : [],
      diseases: doc.diseases || '',
      sprayGuide: doc.sprayGuide || '',
    }));
  } catch (error) {
    console.warn('[Appwrite fetchCrops Error]:', error);
    return [];
  }
}

/**
 * Create Crop in Appwrite Database
 */
export async function createCropInDB(crop: any, userId?: string): Promise<Crop> {
  const doc = await databases.createDocument(
    APPWRITE_CONFIG.DATABASE_ID,
    APPWRITE_CONFIG.COLLECTIONS.FARM_CROPS,
    ID.unique(),
    {
      farmId: crop.farmId || 'default_farm',
      userId: userId || 'usr_default_farmer',
      name: crop.name,
      cropName: crop.name,
      variety: crop.variety || 'Standard',
      area: Number(crop.area) || 1,
      areaUnit: crop.areaUnit || 'Acres',
      season: crop.season || 'Rabi',
      stage: crop.stage || 'Sowing & Germination',
      stageStep: Number(crop.stageStep) || 1,
      currentDay: Number(crop.currentDay) || 1,
      totalDays: Number(crop.totalDays) || 95,
      health: crop.health || 'Optimal',
      sownDate: crop.sownDate || new Date().toISOString(),
      harvestDate: crop.harvestDate || new Date().toISOString(),
      nextMilestone: crop.nextMilestone || '',
      color: crop.color || '#278449',
      currentMoisture: 35,
      lowMoistureAlert: 30,
    }
  );

  return {
    id: doc.$id,
    name: doc.name,
    variety: doc.variety,
    area: doc.area,
    areaUnit: doc.areaUnit,
    season: doc.season,
    stage: doc.stage,
    stageStep: doc.stageStep,
    currentDay: doc.currentDay,
    totalDays: doc.totalDays,
    health: doc.health,
    sownDate: doc.sownDate,
    nextMilestone: doc.nextMilestone,
    harvestDate: doc.harvestDate,
    color: doc.color,
    lowMoistureAlert: doc.lowMoistureAlert,
    currentMoisture: doc.currentMoisture,
    dos: [],
    donts: [],
    diseases: '',
    sprayGuide: '',
  };
}

/**
 * Fetch Inventory Items from Appwrite Database
 */
export async function fetchInventoryFromDB(farmId?: string): Promise<InventoryItem[]> {
  try {
    const queries: string[] = [Query.limit(50)];
    if (farmId) {
      queries.push(Query.equal('farmId', farmId));
    }

    const res = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.INVENTORY_ITEMS,
      queries
    );

    return res.documents.map((doc: any) => ({
      id: doc.$id,
      farmId: doc.farmId,
      farmName: doc.farmName,
      storeId: doc.storeId,
      storeName: doc.storeName || 'Main Store',
      name: doc.name || '',
      category: doc.category || 'Input',
      batchNumber: doc.batchNumber,
      purchasedDate: doc.purchasedDate,
      expiryDate: doc.expiryDate,
      quantity: Number(doc.quantity) || 0,
      unit: doc.unit || 'kg',
      rate: Number(doc.rate) || 0,
      lowStockThreshold: Number(doc.lowStockThreshold) || 10,
    }));
  } catch (error) {
    console.warn('[Appwrite fetchInventory Error]:', error);
    return [];
  }
}

/**
 * Fetch Financial Transactions from Appwrite Database
 */
export async function fetchTransactionsFromDB(farmId?: string): Promise<any[]> {
  try {
    const queries: string[] = [Query.limit(50)];
    if (farmId) {
      queries.push(Query.equal('farmId', farmId));
    }

    const res = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.FINANCIAL_TRANSACTIONS,
      queries
    );

    return res.documents.map((doc: any) => ({
      id: doc.$id,
      type: doc.type,
      title: doc.title,
      category: doc.category,
      amount: Number(doc.amount) || 0,
      date: doc.date,
      farmId: doc.farmId,
      farmName: doc.farmName,
      crop: doc.crop,
      quantity: doc.quantity,
      status: doc.status,
      reference: doc.reference,
      notes: doc.notes,
    }));
  } catch (error) {
    console.warn('[Appwrite fetchTransactions Error]:', error);
    return [];
  }
}

/**
 * Create a new Financial Transaction in Appwrite Database
 */
export async function createTransactionInDB(transaction: any, userId: string): Promise<any> {
  const doc = await databases.createDocument(
    APPWRITE_CONFIG.DATABASE_ID,
    APPWRITE_CONFIG.COLLECTIONS.FINANCIAL_TRANSACTIONS,
    ID.unique(),
    {
      userId,
      type: transaction.type,
      title: transaction.title,
      category: transaction.category,
      amount: Number(transaction.amount) || 0,
      date: transaction.date || new Date().toISOString().split('T')[0],
      farmId: transaction.farmId || '',
      farmName: transaction.farmName || '',
      crop: transaction.crop || '',
      quantity: transaction.quantity || '',
      status: transaction.status || 'Recorded (Internal Log)',
      reference: transaction.reference || '',
      notes: transaction.notes || '',
    }
  );

  return {
    id: doc.$id,
    type: doc.type,
    title: doc.title,
    category: doc.category,
    amount: Number(doc.amount),
    date: doc.date,
    farmId: doc.farmId,
    farmName: doc.farmName,
    crop: doc.crop,
    quantity: doc.quantity,
    status: doc.status,
    reference: doc.reference,
    notes: doc.notes,
  };
}

/**
 * Delete a Financial Transaction from Appwrite Database
 */
export async function deleteTransactionInDB(id: string): Promise<boolean> {
  try {
    await databases.deleteDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.FINANCIAL_TRANSACTIONS,
      id
    );
    return true;
  } catch (error) {
    console.error('[Appwrite deleteTransactionInDB Error]:', error);
    return false;
  }
}

/**
 * Fetch Tasks from Appwrite Database
 */
export async function fetchTasksFromDB(farmId?: string): Promise<Task[]> {
  try {
    const queries: string[] = [Query.limit(50)];
    if (farmId) {
      queries.push(Query.equal('farmId', farmId));
    }

    const res = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.TASKS,
      queries
    );

    return res.documents.map((doc: any) => ({
      id: doc.$id,
      farmId: doc.farmId,
      farmName: doc.farmName || 'Khetivo Green Acres',
      title: doc.title,
      category: doc.category || 'General',
      priority: doc.priority || 'Medium',
      status: doc.status || 'To Do',
      dueDate: doc.dueDate,
      assignedTo: doc.assignedTo || 'Harpreet Singh',
      zone: doc.zone,
      crop: doc.crop,
      instructions: doc.instructions,
      description: doc.description,
      completedDate: doc.completedDate,
    }));
  } catch (error) {
    console.warn('[Appwrite fetchTasks Error]:', error);
    return [];
  }
}

/**
 * Create a Task in Appwrite Database
 */
export async function createTaskInDB(task: Partial<Task>, userId?: string): Promise<Task> {
  const doc = await databases.createDocument(
    APPWRITE_CONFIG.DATABASE_ID,
    APPWRITE_CONFIG.COLLECTIONS.TASKS,
    ID.unique(),
    {
      farmId: task.farmId || 'default_farm',
      userId: userId || 'usr_default_farmer',
      title: task.title || 'Untitled Task',
      category: task.category || 'General',
      priority: task.priority || 'Medium',
      status: task.status || 'To Do',
      dueDate: task.dueDate || new Date().toISOString(),
      assignedTo: task.assignedTo || 'Harpreet Singh',
      zone: task.zone || '',
      crop: task.crop || '',
      instructions: task.instructions || '',
      description: task.description || '',
    }
  );

  return {
    id: doc.$id,
    farmId: doc.farmId,
    farmName: task.farmName || 'Khetivo Farm',
    title: doc.title,
    category: doc.category,
    priority: doc.priority,
    status: doc.status,
    dueDate: doc.dueDate,
    assignedTo: doc.assignedTo,
    zone: doc.zone,
    crop: doc.crop,
    instructions: doc.instructions,
    description: doc.description,
  };
}

/**
 * Update Task Status in Appwrite Database
 */
export async function updateTaskStatusInDB(taskId: string, status: 'To Do' | 'In Progress' | 'Completed'): Promise<void> {
  try {
    await databases.updateDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.TASKS,
      taskId,
      {
        status,
        ...(status === 'Completed' ? { completedDate: new Date().toISOString() } : {}),
      }
    );
  } catch (error) {
    console.warn('[Appwrite updateTaskStatus Error]:', error);
  }
}

/**
 * Delete a Task in Appwrite Database
 */
export async function deleteTaskInDB(taskId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.TASKS,
      taskId
    );
  } catch (error) {
    console.warn('[Appwrite deleteTask Error]:', error);
  }
}

/**
 * Create an Inventory Item in Appwrite Database
 */
export async function createInventoryItemInDB(item: Partial<InventoryItem>, userId?: string): Promise<InventoryItem> {
  const doc = await databases.createDocument(
    APPWRITE_CONFIG.DATABASE_ID,
    APPWRITE_CONFIG.COLLECTIONS.INVENTORY_ITEMS,
    ID.unique(),
    {
      farmId: item.farmId || 'default_farm',
      storeId: item.storeId || 'store_main',
      userId: userId || 'usr_default_farmer',
      name: item.name || 'Item',
      category: item.category || 'General',
      batchNumber: item.batchNumber || `BAT-${Date.now().toString().slice(-5)}`,
      purchasedDate: item.purchasedDate || new Date().toISOString(),
      expiryDate: item.expiryDate || new Date().toISOString(),
      quantity: Number(item.quantity) || 0,
      unit: item.unit || 'kg',
      rate: Number(item.rate) || 0,
      lowStockThreshold: Number(item.lowStockThreshold) || 5,
    }
  );

  return {
    id: doc.$id,
    farmId: doc.farmId,
    farmName: item.farmName || 'Khetivo Farm',
    storeId: doc.storeId,
    storeName: item.storeName || 'Main Store',
    name: doc.name,
    category: doc.category,
    batchNumber: doc.batchNumber,
    purchasedDate: doc.purchasedDate,
    expiryDate: doc.expiryDate,
    quantity: doc.quantity,
    unit: doc.unit,
    rate: doc.rate,
    lowStockThreshold: doc.lowStockThreshold,
  };
}

/**
 * Update Inventory Item Quantity in Appwrite Database
 */
export async function updateInventoryQtyInDB(itemId: string, quantity: number): Promise<void> {
  try {
    await databases.updateDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.INVENTORY_ITEMS,
      itemId,
      { quantity }
    );
  } catch (error) {
    console.warn('[Appwrite updateInventoryQty Error]:', error);
  }
}

/**
 * Delete Inventory Item from Appwrite Database
 */
export async function deleteInventoryItemInDB(itemId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.INVENTORY_ITEMS,
      itemId
    );
  } catch (error) {
    console.warn('[Appwrite deleteInventoryItem Error]:', error);
  }
}

/**
 * Fetch Equipment from Appwrite Database
 */
export async function fetchEquipmentFromDB(farmId?: string): Promise<any[]> {
  try {
    const queries: string[] = [Query.limit(50)];
    if (farmId) {
      queries.push(Query.equal('farmId', farmId));
    }

    const res = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.EQUIPMENT,
      queries
    );

    return res.documents.map((doc: any) => ({
      id: doc.$id,
      name: doc.name || 'Equipment',
      model: doc.model || '',
      category: doc.category || 'Tractor',
      hoursRun: Number(doc.runtimeHours) || 0,
      nextServiceHours: Number(doc.nextServiceHours) || 250,
      status: doc.status || 'Operational',
      fuelLevel: Number(doc.fuelLevel) || 80,
      operator: doc.operator || 'Operator',
      fuelEfficiency: doc.fuelEfficiency || '4.0 L/hr',
      nextServiceDate: doc.nextServiceDate || '',
      farm: doc.farmName || 'Khetivo Farm',
    }));
  } catch (error) {
    console.warn('[Appwrite fetchEquipment Error]:', error);
    return [];
  }
}

/**
 * Create Equipment in Appwrite Database
 */
export async function createEquipmentInDB(eq: any, userId?: string): Promise<any> {
  const doc = await databases.createDocument(
    APPWRITE_CONFIG.DATABASE_ID,
    APPWRITE_CONFIG.COLLECTIONS.EQUIPMENT,
    ID.unique(),
    {
      farmId: eq.farmId || 'default_farm',
      userId: userId || 'usr_default_farmer',
      name: eq.name,
      category: eq.category || 'Tractor',
      model: eq.model || 'Standard',
      operator: eq.operator || 'Operator',
      status: eq.status || 'Operational',
      runtimeHours: Number(eq.hoursRun) || 0,
      nextServiceHours: Number(eq.nextServiceHours) || 250,
      fuelLevel: Number(eq.fuelLevel) || 100,
      fuelEfficiency: eq.fuelEfficiency || '4.0 L/hr',
      lastServiceDate: new Date().toISOString(),
      nextServiceDate: eq.nextServiceDate || new Date().toISOString(),
    }
  );

  return {
    id: doc.$id,
    name: doc.name,
    category: doc.category,
    model: doc.model,
    operator: doc.operator,
    status: doc.status,
    hoursRun: doc.runtimeHours,
    nextServiceHours: doc.nextServiceHours,
    fuelLevel: doc.fuelLevel,
    fuelEfficiency: doc.fuelEfficiency,
    nextServiceDate: doc.nextServiceDate,
  };
}

/**
 * Fetch Team Members from Appwrite Database
 */
export async function fetchTeamFromDB(farmId?: string): Promise<any[]> {
  try {
    const queries: string[] = [Query.limit(50)];
    if (farmId) {
      queries.push(Query.equal('farmId', farmId));
    }

    const res = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.TEAM_MEMBERS,
      queries
    );

    return res.documents.map((doc: any) => ({
      id: doc.$id,
      name: doc.name || 'Worker',
      role: doc.designationTitle || doc.roleCategory || 'Worker',
      phone: doc.phone || '+91 98000-00000',
      assignedParcels: doc.assignedParcels || 'All Holdings',
      status: doc.status === 'Active' ? 'On Duty' : 'Off Duty',
    }));
  } catch (error) {
    console.warn('[Appwrite fetchTeam Error]:', error);
    return [];
  }
}

/**
 * Create Team Member in Appwrite Database
 */
export async function createTeamMemberInDB(member: any, userId?: string): Promise<any> {
  const doc = await databases.createDocument(
    APPWRITE_CONFIG.DATABASE_ID,
    APPWRITE_CONFIG.COLLECTIONS.TEAM_MEMBERS,
    ID.unique(),
    {
      farmId: member.farmId || 'default_farm',
      userId: userId || 'usr_default_farmer',
      name: member.name,
      phone: member.phone || '+91 98000-00000',
      roleCategory: 'worker',
      designationTitle: member.role || 'Field Worker',
      status: member.status === 'Off Duty' ? 'Inactive' : 'Active',
      joinedDate: new Date().toISOString(),
    }
  );

  return {
    id: doc.$id,
    name: doc.name,
    role: doc.designationTitle,
    phone: doc.phone,
    assignedParcels: member.assignedParcels || 'All Holdings',
    status: doc.status === 'Active' ? 'On Duty' : 'Off Duty',
  };
}

/**
 * Fetch Advisories from Appwrite Database
 */
export async function fetchAdvisoriesFromDB(): Promise<any[]> {
  try {
    const res = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.ADVISORIES,
      [Query.limit(50), Query.orderDesc('$createdAt')]
    );

    return res.documents.map((doc: any) => ({
      id: doc.$id,
      title: doc.title || 'Advisory',
      category: doc.category || 'Pest & Disease Alert',
      priority: doc.priority || 'High',
      targetCrop: doc.targetCrop || 'All Crops',
      targetDistrict: doc.targetDistrict || 'All Districts',
      targetState: doc.targetState || 'Punjab',
      message: doc.message || '',
      actionPrescription: doc.actionPrescription || '',
      dispatchedAt: doc.dispatchedAt ? new Date(doc.dispatchedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today',
      dispatchedBy: doc.dispatchedBy || 'PAU University Agronomist',
      isActive: doc.isActive !== false,
    }));
  } catch (error) {
    console.warn('[Appwrite fetchAdvisories Error]:', error);
    return [];
  }
}

/**
 * Fetch Support Tickets from Appwrite Database
 */
export async function fetchSupportTicketsFromDB(userId?: string): Promise<any[]> {
  try {
    const queries: string[] = [Query.limit(50), Query.orderDesc('$createdAt')];
    if (userId) {
      queries.push(Query.equal('userId', userId));
    }

    const res = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.SUPPORT_TICKETS,
      queries
    );

    return res.documents.map((doc: any) => ({
      id: doc.$id,
      ticketNo: doc.ticketNo || 'TKT-0000',
      subject: doc.subject || 'Support Request',
      category: doc.category || 'General Support',
      farmName: doc.farmName || 'Khetivo Farm',
      cropName: doc.cropName || 'General',
      priority: doc.priority || 'Normal',
      status: doc.status || 'Open',
      createdAt: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
      lastReply: doc.resolution || 'Waiting for specialist agronomist review.',
      assignedAgronomist: doc.assignedAgronomist || 'PAU duty agronomist',
      description: doc.description || '',
    }));
  } catch (error) {
    console.warn('[Appwrite fetchSupportTickets Error]:', error);
    return [];
  }
}

/**
 * Create Support Ticket in Appwrite Database
 */
export async function createSupportTicketInDB(ticket: any, userId?: string): Promise<any> {
  const doc = await databases.createDocument(
    APPWRITE_CONFIG.DATABASE_ID,
    APPWRITE_CONFIG.COLLECTIONS.SUPPORT_TICKETS,
    ID.unique(),
    {
      ticketNo: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: userId || 'usr_default_farmer',
      farmName: ticket.farmName || 'Khetivo Farm',
      cropName: ticket.cropName || 'General',
      subject: ticket.subject || 'Farmer Query',
      category: ticket.category || 'Crop Health & Pathology',
      priority: ticket.priority || 'Normal',
      status: 'Open',
      description: ticket.description || '',
      assignedAgronomist: 'PAU Agronomist',
    }
  );

  return {
    id: doc.$id,
    ticketNo: doc.ticketNo,
    subject: doc.subject,
    category: doc.category,
    farmName: doc.farmName,
    cropName: doc.cropName,
    priority: doc.priority,
    status: doc.status,
    createdAt: 'Just now',
    lastReply: 'Ticket registered. Duty agronomist will review within 2 hours.',
    assignedAgronomist: doc.assignedAgronomist,
    description: doc.description,
  };
}
