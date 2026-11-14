/**
 * Khetivo Appwrite Authentication Helpers
 * Implements Google OAuth2 sign-in via Appwrite Cloud Account SDK
 */

import { OAuthProvider } from "appwrite";
import { getClientAccount } from "@/lib/appwriteConfig";
import {
  saveRegisteredUser,
  sanitizePhone,
  getRegisteredUsers,
  RegisteredUser,
} from "@/lib/authStore";

/**
 * Initiates Google OAuth2 authentication flow via Appwrite
 * Automatically redirects the user to Google OAuth consent screen
 */
export async function signInWithGoogleAppwrite(redirectPath: string = "/dashboard"): Promise<void> {
  if (typeof window === "undefined") return;

  const origin = window.location.origin;
  const successUrl = `${origin}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`;
  const failureUrl = `${origin}/signin?error=oauth_failed`;

  const account = getClientAccount();

  try {
    // Appwrite SDK creates the OAuth2 session and redirects to Google login
    const redirectUrl = account.createOAuth2Session(
      OAuthProvider.Google,
      successUrl,
      failureUrl
    );

    // In case redirect is returned as string rather than auto-navigated
    if (redirectUrl && typeof redirectUrl === "string") {
      window.location.href = redirectUrl;
    }
  } catch (err) {
    console.error("Error initiating Appwrite Google OAuth:", err);
    throw err;
  }
}

/**
 * Completes the Appwrite OAuth flow after Google redirects back to /auth/callback
 * Retrieves the authenticated Appwrite user, syncs with local store, and returns user details
 */
export async function handleAppwriteOAuthCallback(): Promise<{
  success: boolean;
  user?: RegisteredUser;
  error?: string;
}> {
  if (typeof window === "undefined") {
    return { success: false, error: "Window undefined" };
  }

  const account = getClientAccount();

  try {
    // Fetch active authenticated user from Appwrite session
    const appwriteUser = await account.get();

    if (!appwriteUser || !appwriteUser.$id) {
      return { success: false, error: "Failed to retrieve user session from Appwrite." };
    }

    const email = appwriteUser.email || "";
    const name = appwriteUser.name || "Khetivo Farmer";

    // Check if user already exists in local registered store by email
    const existingUsers = getRegisteredUsers();
    const existing = existingUsers.find(
      (u) => u.email && u.email.toLowerCase() === email.toLowerCase()
    );

    let phone = existing?.phone;
    if (!phone && appwriteUser.phone) {
      phone = sanitizePhone(appwriteUser.phone);
    }
    if (!phone) {
      const savedPhone = localStorage.getItem("khetivo_user_phone");
      phone = savedPhone ? sanitizePhone(savedPhone) : "9814054321";
    }

    // Persist verified farmer user in local auth store
    const saved = saveRegisteredUser({
      name,
      email,
      phone,
      provider: "google",
    });

    // Save Appwrite session metadata
    localStorage.setItem("khetivo_appwrite_user_id", appwriteUser.$id);
    localStorage.setItem("khetivo_auth_provider", "google");

    return {
      success: true,
      user: saved,
    };
  } catch (err: any) {
    console.error("Appwrite OAuth callback error:", err);
    return {
      success: false,
      error: err?.message || "Appwrite authentication failed. Please try again.",
    };
  }
}

/**
 * Check if there is an active Appwrite session
 */
export async function getAppwriteSessionUser() {
  if (typeof window === "undefined") return null;
  try {
    const account = getClientAccount();
    return await account.get();
  } catch {
    return null;
  }
}

/**
 * Sign out from Appwrite session
 */
export async function signOutAppwrite(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const account = getClientAccount();
    await account.deleteSession("current");
  } catch (err) {
    // Session might already be expired or local
    console.warn("Appwrite sign out notice:", err);
  }
}
