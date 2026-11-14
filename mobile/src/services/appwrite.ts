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

/**
 * Perform Google OAuth login using Appwrite and Expo WebBrowser
 */
export async function loginWithGoogle(): Promise<AppUser | null> {
  try {
    // 1. Generate deep link redirect URI compatible with Expo & Appwrite
    let redirectUrl = makeRedirectUri({
      scheme: 'khetivo',
      path: 'auth',
      preferLocalhost: Platform.OS === 'web',
    });

    // Appwrite validation requires a hostname component for native schemes
    try {
      const parsed = new URL(redirectUrl);
      if (!parsed.hostname || parsed.hostname === '') {
        redirectUrl = `${parsed.protocol}//localhost${parsed.pathname ? (parsed.pathname.startsWith('/') ? parsed.pathname : '/' + parsed.pathname) : ''}`;
      }
    } catch {
      // Keep redirectUrl as is if URL constructor fails
    }

    // 2. Request OAuth2 token URL from Appwrite
    const tokenUrl = account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUrl,
      redirectUrl
    );

    if (!tokenUrl) {
      throw new Error('Failed to generate Google OAuth URL from Appwrite.');
    }

    const tokenUrlStr = tokenUrl.toString();

    // 3. Open browser auth session
    const authResult = await WebBrowser.openAuthSessionAsync(tokenUrlStr, redirectUrl);

    if (authResult.type !== 'success' || !authResult.url) {
      // User dismissed or cancelled
      return null;
    }

    // 4. Parse redirect URL to extract secret and userId
    const responseUrl = new URL(authResult.url);
    const secret = responseUrl.searchParams.get('secret');
    const userId = responseUrl.searchParams.get('userId');

    if (!secret || !userId) {
      throw new Error('Authentication callback missing userId or secret parameter.');
    }

    // 5. Establish Appwrite session
    await account.createSession(userId, secret);

    // 6. Fetch current logged-in user details from Appwrite
    const currentAccount = await account.get();

    const appUser: AppUser = {
      id: currentAccount.$id,
      name: currentAccount.name || (currentAccount.email ? currentAccount.email.split('@')[0] : 'Kisan Farmer'),
      email: currentAccount.email,
      phone: currentAccount.phone || undefined,
    };

    // Optionally check or create user profile in user_profiles collection
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
      // Profile creation is non-blocking for auth
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

