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

  return {
    id: currentAccount.$id,
    name: currentAccount.name || name,
    email: currentAccount.email,
    phone: phone || currentAccount.phone || undefined,
  };
}

/**
 * Send password recovery email via Appwrite
 */
export async function sendPasswordRecovery(email: string): Promise<void> {
  const redirectUrl = makeRedirectUri({
    scheme: 'khetivo',
    path: 'auth',
    preferLocalhost: Platform.OS === 'web',
  });
  await account.createRecovery(email, redirectUrl);
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
