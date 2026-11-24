/**
 * Helper to obtain the current authenticated user's ID or unique phone identifier.
 * Ensures data isolation so new users only see their own farms, tasks, crops, and records.
 */

export function getCurrentUserId(): string {
  if (typeof window === "undefined") return "usr_default_farmer";

  // 1. Check Appwrite account ID
  const appwriteUid = localStorage.getItem("khetivo_appwrite_user_id");
  if (appwriteUid && appwriteUid.trim()) return appwriteUid.trim();

  // 2. Check Farmer ID
  const farmerId = localStorage.getItem("khetivo_farmer_id");
  if (farmerId && farmerId.trim()) return farmerId.trim();

  // 3. Check Phone number
  const phone = localStorage.getItem("khetivo_user_phone");
  if (phone && phone.trim()) {
    const clean = phone.replace(/\D/g, "").slice(-10);
    if (clean) return `usr_${clean}`;
  }

  // 4. Check Email address
  const email = localStorage.getItem("khetivo_user_email");
  if (email && email.trim()) {
    return `usr_${email.trim().toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  }

  return "usr_guest";
}
