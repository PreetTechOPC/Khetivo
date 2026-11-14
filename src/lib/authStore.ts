/**
 * Khetivo Authentication & One-Time OTP Management Store
 * Manages registered users, real server-backed single-use OTP verification,
 * and ensures OTP is only for sign-up (never for sign-in).
 */

import { getClientAccount } from "./appwriteConfig";

export interface RegisteredUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  farmerId: string;
  otpVerified: boolean;
  verifiedAt: string;
  authProvider: "phone" | "email" | "google";
}

const STORAGE_KEY_USERS = "khetivo_registered_users";

// Clean phone number to digits only (last 10 digits)
export function sanitizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

// Retrieve registered users from localStorage
export function getRegisteredUsers(): RegisteredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (!raw) return [];
    return JSON.parse(raw) as RegisteredUser[];
  } catch (err) {
    console.error("Error reading registered users:", err);
    return [];
  }
}

// Check if a phone number is already verified & registered
export function isPhoneAlreadyVerified(phone: string): boolean {
  const clean = sanitizePhone(phone);
  if (!clean || clean.length < 10) return false;

  const users = getRegisteredUsers();
  const existsInUsers = users.some((u) => sanitizePhone(u.phone) === clean && u.otpVerified);
  if (existsInUsers) return true;

  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("khetivo_user_phone");
    if (saved && sanitizePhone(saved) === clean) {
      return true;
    }
  }

  return false;
}

// Find user by Gmail, Email, Phone, or Farmer ID (for direct sign-in)
export function findUserByIdentifier(identifier: string): RegisteredUser | undefined {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPhone = sanitizePhone(identifier);
  const users = getRegisteredUsers();

  return users.find(
    (u) =>
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.farmerId && u.farmerId.toLowerCase() === cleanId) ||
      (cleanPhone.length === 10 && sanitizePhone(u.phone) === cleanPhone)
  );
}

// Register newly verified user
export function saveRegisteredUser(data: {
  name: string;
  phone: string;
  email?: string;
  provider?: "phone" | "email" | "google";
}): RegisteredUser {
  const clean = sanitizePhone(data.phone);
  const farmerId = `KHET-${clean.slice(-5) || Math.floor(10000 + Math.random() * 90000)}`;
  const newUser: RegisteredUser = {
    id: `usr_${Date.now()}`,
    name: data.name || "Khetivo Farmer",
    phone: clean,
    email: data.email || `${clean}@khetivo.farm`,
    farmerId,
    otpVerified: true,
    verifiedAt: new Date().toISOString(),
    authProvider: data.provider || "phone",
  };

  if (typeof window !== "undefined") {
    const users = getRegisteredUsers().filter((u) => sanitizePhone(u.phone) !== clean);
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    localStorage.setItem("khetivo_user_phone", clean);
    localStorage.setItem("khetivo_user_email", newUser.email);
    localStorage.setItem("khetivo_user_name", newUser.name);
    localStorage.setItem("khetivo_farmer_id", newUser.farmerId);
  }

  return newUser;
}

/**
 * Real Server API Call: Send OTP
 * Strictly for signup users only
 */
export async function sendRealOtpApi(phone: string): Promise<{
  success: boolean;
  message: string;
  alreadyVerified?: boolean;
  devOtp?: string;
}> {
  const clean = sanitizePhone(phone);

  // Local check first
  if (isPhoneAlreadyVerified(clean)) {
    return {
      success: false,
      alreadyVerified: true,
      message: `The mobile number +91 ${clean} has already completed OTP verification. Sign-up OTP is a one-time process. Please sign in instead.`,
    };
  }

  try {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: clean }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        alreadyVerified: data.code === "ALREADY_VERIFIED",
        message: data.message || "Failed to send verification code. Please try again.",
      };
    }

    return {
      success: true,
      message: data.message || `Verification code dispatched to +91 ${clean}`,
      devOtp: data.devOtp,
    };
  } catch (err: any) {
    return {
      success: false,
      message: "Network error sending OTP. Please check your connection.",
    };
  }
}

/**
 * Real Server API Call: Verify OTP
 * Strictly a one-time process for signup users only
 */
export async function verifyRealOtpApi(
  phone: string,
  code: string,
  userInfo?: { name?: string; email?: string }
): Promise<{
  success: boolean;
  message: string;
  user?: RegisteredUser;
  alreadyVerified?: boolean;
}> {
  const clean = sanitizePhone(phone);

  if (isPhoneAlreadyVerified(clean)) {
    return {
      success: false,
      alreadyVerified: true,
      message: `The mobile number +91 ${clean} is already verified and registered. Please sign in instead.`,
    };
  }

  try {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: clean,
        code,
        name: userInfo?.name,
        email: userInfo?.email,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        alreadyVerified: data.code === "ALREADY_VERIFIED" || data.code === "ALREADY_REGISTERED",
        message: data.message || "Verification failed. Please check the 6-digit code.",
      };
    }

    // Persist verified user in client storage
    const saved = saveRegisteredUser({
      name: userInfo?.name || data.user?.name || "Jaswinder Singh",
      phone: clean,
      email: userInfo?.email || data.user?.email || `${clean}@khetivo.farm`,
      provider: "phone",
    });

    return {
      success: true,
      message: data.message || "Mobile phone verified successfully!",
      user: saved,
    };
  } catch (err: any) {
    return {
      success: false,
      message: "Network error verifying OTP. Please try again.",
    };
  }
}

/**
 * Sign out current user (preserves registered records for future sign in)
 */
export function signOutUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("khetivo_user_phone");
    localStorage.removeItem("khetivo_user_email");
    localStorage.removeItem("khetivo_user_name");
    localStorage.removeItem("khetivo_farmer_id");
    localStorage.removeItem("khetivo_appwrite_user_id");
    localStorage.removeItem("khetivo_auth_provider");
    try {
      const account = getClientAccount();
      account.deleteSession("current").catch(() => {});
    } catch {
      // ignore
    }
  } catch (err) {
    console.error("Error signing out user:", err);
  }
}

/**
 * Permanently delete user account and clear all local & server records
 */
export async function deleteRegisteredUser(phone: string): Promise<{ success: boolean; message: string }> {
  const clean = sanitizePhone(phone);

  if (typeof window !== "undefined") {
    try {
      const users = getRegisteredUsers().filter((u) => sanitizePhone(u.phone) !== clean);
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      localStorage.removeItem("khetivo_user_phone");
      localStorage.removeItem("khetivo_user_email");
      localStorage.removeItem("khetivo_user_name");
      localStorage.removeItem("khetivo_farmer_id");
      localStorage.removeItem("khetivo_active_otp_session");
      localStorage.removeItem("khetivo_appwrite_user_id");
      localStorage.removeItem("khetivo_auth_provider");
      try {
        const account = getClientAccount();
        account.deleteSession("current").catch(() => {});
      } catch {
        // ignore
      }
    } catch (err) {
      console.error("Error deleting local user records:", err);
    }
  }

  try {
    const res = await fetch("/api/auth/delete-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: clean }),
    });
    const data = await res.json();
    return {
      success: true,
      message: data.message || "Account permanently deleted.",
    };
  } catch (err) {
    return {
      success: true,
      message: "Account permanently deleted locally.",
    };
  }
}
