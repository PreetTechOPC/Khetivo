/**
 * Khetivo Appwrite Client Configuration
 * Safe for both client-side and server-side bundling (NO Node.js built-ins)
 */

import { Client as ClientSdk, Databases as DatabasesSdk, Storage as StorageSdk, Account as AccountSdk } from "appwrite";

// Export standard configuration reading from environment with safe fallbacks
export const APPWRITE_CONFIG = {
  ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6ae72036002d13f9c902",
  DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "khetivo_main",
  STORAGE_BUCKET_ID: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || "khetivo_storage",
  API_KEY: process.env.APPWRITE_API_KEY || "",
  COLLECTIONS: {
    USER_PROFILES: process.env.NEXT_PUBLIC_APPWRITE_COL_USER_PROFILES || "user_profiles",
    FARMS: process.env.NEXT_PUBLIC_APPWRITE_COL_FARMS || "farms",
    FARM_CROPS: process.env.NEXT_PUBLIC_APPWRITE_COL_FARM_CROPS || "farm_crops",
    CROP_TEMPLATES: process.env.NEXT_PUBLIC_APPWRITE_COL_CROP_TEMPLATES || "crop_templates",
    TASKS: process.env.NEXT_PUBLIC_APPWRITE_COL_TASKS || "tasks",
    FARM_STORES: process.env.NEXT_PUBLIC_APPWRITE_COL_FARM_STORES || "farm_stores",
    INVENTORY_ITEMS: process.env.NEXT_PUBLIC_APPWRITE_COL_INVENTORY_ITEMS || "inventory_items",
    INVENTORY_USAGE_LOGS: process.env.NEXT_PUBLIC_APPWRITE_COL_INVENTORY_USAGE_LOGS || "inventory_usage_logs",
    EQUIPMENT: process.env.NEXT_PUBLIC_APPWRITE_COL_EQUIPMENT || "equipment",
    EQUIPMENT_ISSUES: process.env.NEXT_PUBLIC_APPWRITE_COL_EQUIPMENT_ISSUES || "equipment_issues",
    TEAM_DESIGNATIONS: process.env.NEXT_PUBLIC_APPWRITE_COL_TEAM_DESIGNATIONS || "team_designations",
    TEAM_MEMBERS: process.env.NEXT_PUBLIC_APPWRITE_COL_TEAM_MEMBERS || "team_members",
    FINANCIAL_TRANSACTIONS: process.env.NEXT_PUBLIC_APPWRITE_COL_FINANCIAL_TRANSACTIONS || "financial_transactions",
    ADVISORIES: process.env.NEXT_PUBLIC_APPWRITE_COL_ADVISORIES || "advisories",
    MANDI_RATES: process.env.NEXT_PUBLIC_APPWRITE_COL_MANDI_RATES || "mandi_rates",
    FIELD_VISITS: process.env.NEXT_PUBLIC_APPWRITE_COL_FIELD_VISITS || "field_visits",
    SUPPORT_TICKETS: process.env.NEXT_PUBLIC_APPWRITE_COL_SUPPORT_TICKETS || "support_tickets",
    SUPPORT_MESSAGES: process.env.NEXT_PUBLIC_APPWRITE_COL_SUPPORT_MESSAGES || "support_messages",
    SUBSCRIPTION_PLANS: process.env.NEXT_PUBLIC_APPWRITE_COL_SUBSCRIPTION_PLANS || "subscription_plans",
    USER_SUBSCRIPTIONS: process.env.NEXT_PUBLIC_APPWRITE_COL_USER_SUBSCRIPTIONS || "user_subscriptions",
    BILLING_INVOICES: process.env.NEXT_PUBLIC_APPWRITE_COL_BILLING_INVOICES || "billing_invoices",
    AUDIT_REPORTS: process.env.NEXT_PUBLIC_APPWRITE_COL_AUDIT_REPORTS || "audit_reports",
    SENSOR_TELEMETRY: process.env.NEXT_PUBLIC_APPWRITE_COL_SENSOR_TELEMETRY || "sensor_telemetry",
    ADMIN_AUDIT_LOGS: process.env.NEXT_PUBLIC_APPWRITE_COL_ADMIN_AUDIT_LOGS || "admin_audit_logs",
  },
} as const;

// =============================================================================
// CLIENT-SIDE APPWRITE CLIENT (Safe for React components and browser execution)
// =============================================================================
let clientSdk: ClientSdk | null = null;
let clientDatabases: DatabasesSdk | null = null;
let clientStorage: StorageSdk | null = null;
let clientAccount: AccountSdk | null = null;

export function getClientAppwrite() {
  if (typeof window === "undefined") {
    return new ClientSdk()
      .setEndpoint(APPWRITE_CONFIG.ENDPOINT)
      .setProject(APPWRITE_CONFIG.PROJECT_ID);
  }
  if (!clientSdk) {
    clientSdk = new ClientSdk()
      .setEndpoint(APPWRITE_CONFIG.ENDPOINT)
      .setProject(APPWRITE_CONFIG.PROJECT_ID);
  }
  return clientSdk;
}

export function getClientDatabases() {
  if (!clientDatabases) {
    clientDatabases = new DatabasesSdk(getClientAppwrite());
  }
  return clientDatabases;
}

export function getClientStorage() {
  if (!clientStorage) {
    clientStorage = new StorageSdk(getClientAppwrite());
  }
  return clientStorage;
}

export function getClientAccount() {
  if (!clientAccount) {
    clientAccount = new AccountSdk(getClientAppwrite());
  }
  return clientAccount;
}
