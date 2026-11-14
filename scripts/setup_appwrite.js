const sdk = require("../node_modules/node-appwrite");
const fs = require("fs");
const path = require("path");

const apiKeyPath = path.resolve(__dirname, "../../.appwrite_api_key");
if (!fs.existsSync(apiKeyPath)) {
  console.error("API Key file not found at", apiKeyPath);
  process.exit(1);
}
const apiKey = fs.readFileSync(apiKeyPath, "utf8").trim();

const client = new sdk.Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("6ae72036002d13f9c902")
  .setKey(apiKey);

const databases = new sdk.Databases(client);
const DB_ID = "khetivo_main";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const collections = [
  {
    id: "user_profiles",
    name: "User Profiles",
    attributes: [
      { type: "string", key: "userId", size: 36, required: true },
      { type: "string", key: "name", size: 120, required: true },
      { type: "string", key: "phone", size: 20, required: true },
      { type: "email", key: "email", required: false },
      { type: "enum", key: "role", elements: ["farmer", "admin", "agronomist", "worker"], required: true, xdefault: "farmer" },
      { type: "string", key: "district", size: 80, required: true },
      { type: "string", key: "state", size: 80, required: true },
      { type: "string", key: "measurementUnit", size: 30, required: true, xdefault: "Acres" },
      { type: "enum", key: "preferredLanguage", elements: ["en", "pa", "hi"], required: true, xdefault: "en" },
      { type: "boolean", key: "offlineSync", required: true, xdefault: true },
      { type: "boolean", key: "motorAutomation", required: true, xdefault: true },
      { type: "url", key: "avatarUrl", required: false },
    ],
    indexes: [
      { key: "idx_user_profiles_userId", type: "key", attributes: ["userId"] },
      { key: "idx_user_profiles_phone", type: "key", attributes: ["phone"] },
    ],
  },
  {
    id: "farms",
    name: "Farms",
    attributes: [
      { type: "string", key: "userId", size: 36, required: true },
      { type: "string", key: "name", size: 150, required: true },
      { type: "string", key: "address", size: 255, required: false },
      { type: "string", key: "village", size: 100, required: false },
      { type: "string", key: "district", size: 80, required: true },
      { type: "string", key: "state", size: 80, required: true },
      { type: "string", key: "pinCode", size: 10, required: false },
      { type: "float", key: "totalArea", required: true, min: 0 },
      { type: "string", key: "areaUnit", size: 30, required: true, xdefault: "Acres" },
      { type: "string", key: "ownership", size: 50, required: false, xdefault: "Owned" },
      { type: "float", key: "latitude", required: false },
      { type: "float", key: "longitude", required: false },
      { type: "string", key: "soilType", size: 100, required: false },
      { type: "string", key: "irrigationType", size: 100, required: false },
      { type: "string", key: "waterSource", size: 100, required: false },
      { type: "string", key: "cropTemplate", size: 100, required: false },
      { type: "boolean", key: "isArchived", required: true, xdefault: false },
    ],
    indexes: [
      { key: "idx_farms_userId", type: "key", attributes: ["userId"] },
      { key: "idx_farms_district", type: "key", attributes: ["district"] },
    ],
  },
  {
    id: "farm_crops",
    name: "Farm Crops",
    attributes: [
      { type: "string", key: "farmId", size: 36, required: true },
      { type: "string", key: "userId", size: 36, required: true },
      { type: "string", key: "name", size: 100, required: true },
      { type: "string", key: "variety", size: 100, required: true },
      { type: "float", key: "area", required: true, min: 0 },
      { type: "string", key: "areaUnit", size: 30, required: true, xdefault: "Acres" },
      { type: "enum", key: "season", elements: ["Rabi", "Kharif", "Zaid", "Annual"], required: true },
      { type: "string", key: "stage", size: 120, required: true },
      { type: "integer", key: "stageStep", required: true, xdefault: 1 },
      { type: "integer", key: "currentDay", required: true, xdefault: 0 },
      { type: "integer", key: "totalDays", required: true, xdefault: 120 },
      { type: "string", key: "health", size: 60, required: false, xdefault: "Healthy" },
      { type: "datetime", key: "sownDate", required: false },
      { type: "datetime", key: "harvestDate", required: false },
      { type: "string", key: "nextMilestone", size: 150, required: false },
      { type: "string", key: "color", size: 20, required: false, xdefault: "#278449" },
      { type: "float", key: "currentMoisture", required: false },
      { type: "float", key: "lowMoistureAlert", required: false },
      { type: "string", key: "dos", size: 255, array: true, required: false },
      { type: "string", key: "donts", size: 255, array: true, required: false },
      { type: "string", key: "diseases", size: 1000, required: false },
      { type: "string", key: "sprayGuide", size: 1000, required: false },
    ],
    indexes: [
      { key: "idx_farm_crops_farmId", type: "key", attributes: ["farmId"] },
      { key: "idx_farm_crops_userId", type: "key", attributes: ["userId"] },
    ],
  },
  {
    id: "crop_templates",
    name: "Crop Master Templates",
    attributes: [
      { type: "string", key: "cropName", size: 100, required: true },
      { type: "string", key: "varieties", size: 100, array: true, required: false },
      { type: "enum", key: "season", elements: ["Rabi", "Kharif", "Zaid", "Annual"], required: true },
      { type: "string", key: "sowingWindow", size: 100, required: false },
      { type: "integer", key: "durationDays", required: true },
      { type: "string", key: "defaultSoil", size: 100, required: false },
      { type: "string", key: "defaultIrrigation", size: 100, required: false },
      { type: "string", key: "targetYield", size: 50, required: false },
      { type: "float", key: "irrigationThresholdMoisture", required: false },
      { type: "string", key: "criticalIrrigationStages", size: 100, array: true, required: false },
      { type: "string", key: "majorDiseases", size: 100, array: true, required: false },
      { type: "string", key: "growthTimeline", size: 5000, required: false },
      { type: "string", key: "pauPrescription", size: 2000, required: false },
      { type: "string", key: "dos", size: 255, array: true, required: false },
      { type: "string", key: "donts", size: 255, array: true, required: false },
    ],
  },
  {
    id: "tasks",
    name: "Tasks",
    attributes: [
      { type: "string", key: "farmId", size: 36, required: true },
      { type: "string", key: "userId", size: 36, required: true },
      { type: "string", key: "title", size: 200, required: true },
      { type: "string", key: "category", size: 100, required: true },
      { type: "enum", key: "priority", elements: ["Low", "Medium", "High", "Urgent"], required: true, xdefault: "Medium" },
      { type: "enum", key: "status", elements: ["To Do", "In Progress", "Completed"], required: true, xdefault: "To Do" },
      { type: "datetime", key: "dueDate", required: false },
      { type: "string", key: "assignedTo", size: 120, required: false },
      { type: "string", key: "zone", size: 100, required: false },
      { type: "string", key: "crop", size: 100, required: false },
      { type: "string", key: "instructions", size: 2000, required: false },
      { type: "string", key: "description", size: 2000, required: false },
      { type: "datetime", key: "completedDate", required: false },
    ],
    indexes: [
      { key: "idx_tasks_farmId", type: "key", attributes: ["farmId"] },
      { key: "idx_tasks_status", type: "key", attributes: ["status"] },
    ],
  },
  {
    id: "farm_stores",
    name: "Farm Stores",
    attributes: [
      { type: "string", key: "farmId", size: 36, required: true },
      { type: "string", key: "userId", size: 36, required: true },
      { type: "string", key: "name", size: 100, required: true },
      { type: "string", key: "type", size: 60, required: false },
      { type: "string", key: "location", size: 150, required: false },
      { type: "string", key: "notes", size: 1000, required: false },
    ],
    indexes: [
      { key: "idx_farm_stores_farmId", type: "key", attributes: ["farmId"] },
    ],
  },
  {
    id: "inventory_items",
    name: "Inventory Items",
    attributes: [
      { type: "string", key: "farmId", size: 36, required: true },
      { type: "string", key: "storeId", size: 36, required: true },
      { type: "string", key: "userId", size: 36, required: true },
      { type: "string", key: "name", size: 150, required: true },
      { type: "string", key: "category", size: 60, required: true },
      { type: "string", key: "batchNumber", size: 60, required: false },
      { type: "datetime", key: "purchasedDate", required: false },
      { type: "datetime", key: "expiryDate", required: false },
      { type: "float", key: "quantity", required: true, min: 0 },
      { type: "string", key: "unit", size: 30, required: true },
      { type: "float", key: "rate", required: true, xdefault: 0 },
      { type: "float", key: "lowStockThreshold", required: true, xdefault: 0 },
    ],
    indexes: [
      { key: "idx_inventory_farmId", type: "key", attributes: ["farmId"] },
      { key: "idx_inventory_storeId", type: "key", attributes: ["storeId"] },
    ],
  },
  {
    id: "inventory_usage_logs",
    name: "Inventory Usage Logs",
    attributes: [
      { type: "string", key: "itemId", size: 36, required: true },
      { type: "string", key: "farmId", size: 36, required: true },
      { type: "string", key: "storeId", size: 36, required: true },
      { type: "string", key: "userId", size: 36, required: true },
      { type: "float", key: "quantityUsed", required: true, min: 0 },
      { type: "string", key: "unit", size: 30, required: true },
      { type: "datetime", key: "date", required: false },
      { type: "string", key: "purpose", size: 255, required: true },
      { type: "string", key: "crop", size: 100, required: false },
      { type: "string", key: "appliedBy", size: 100, required: true },
    ],
    indexes: [
      { key: "idx_inv_usage_farmId", type: "key", attributes: ["farmId"] },
      { key: "idx_inv_usage_itemId", type: "key", attributes: ["itemId"] },
    ],
  },
  {
    id: "equipment",
    name: "Equipment",
    attributes: [
      { type: "string", key: "farmId", size: 36, required: true },
      { type: "string", key: "userId", size: 36, required: true },
      { type: "string", key: "name", size: 150, required: true },
      { type: "string", key: "category", size: 100, required: false },
      { type: "string", key: "model", size: 100, required: false },
      { type: "string", key: "operator", size: 100, required: false },
      { type: "enum", key: "status", elements: ["Operational", "In Field", "Service Due", "Problem Reported"], required: true, xdefault: "Operational" },
      { type: "float", key: "runtimeHours", required: true, xdefault: 0 },
      { type: "float", key: "nextServiceHours", required: false },
      { type: "integer", key: "fuelLevel", required: false, min: 0, max: 100, xdefault: 100 },
      { type: "string", key: "fuelEfficiency", size: 50, required: false },
      { type: "datetime", key: "lastServiceDate", required: false },
      { type: "datetime", key: "nextServiceDate", required: false },
    ],
    indexes: [
      { key: "idx_equipment_farmId", type: "key", attributes: ["farmId"] },
    ],
  },
  {
    id: "equipment_issues",
    name: "Equipment Issues",
    attributes: [
      { type: "string", key: "equipmentId", size: 36, required: true },
      { type: "string", key: "farmId", size: 36, required: true },
      { type: "string", key: "userId", size: 36, required: true },
      { type: "string", key: "issueType", size: 100, required: true },
      { type: "enum", key: "severity", elements: ["Low", "Medium", "High", "Critical"], required: true, xdefault: "Medium" },
      { type: "string", key: "description", size: 1500, required: true },
      { type: "string", key: "reportedBy", size: 100, required: true },
      { type: "datetime", key: "reportedDate", required: false },
      { type: "enum", key: "status", elements: ["Open", "In Progress", "Resolved"], required: true, xdefault: "Open" },
    ],
    indexes: [
      { key: "idx_eq_issues_equipmentId", type: "key", attributes: ["equipmentId"] },
      { key: "idx_eq_issues_farmId", type: "key", attributes: ["farmId"] },
    ],
  },
  {
    id: "team_designations",
    name: "Team Designations",
    attributes: [
      { type: "string", key: "farmId", size: 36, required: false },
      { type: "string", key: "title", size: 100, required: true },
      { type: "string", key: "description", size: 500, required: false },
      { type: "string", key: "allowedModules", size: 50, array: true, required: false },
      { type: "string", key: "color", size: 20, required: false },
      { type: "boolean", key: "isSystemDefault", required: true, xdefault: false },
    ],
  },
  {
    id: "team_members",
    name: "Team Members",
    attributes: [
      { type: "string", key: "farmId", size: 36, required: true },
      { type: "string", key: "userId", size: 36, required: true },
      { type: "string", key: "memberUserId", size: 36, required: false },
      { type: "string", key: "name", size: 120, required: true },
      { type: "string", key: "phone", size: 20, required: true },
      { type: "email", key: "email", required: false },
      { type: "enum", key: "roleCategory", elements: ["admin", "supervisor", "agronomist", "operator", "inventory", "accountant", "worker"], required: true, xdefault: "worker" },
      { type: "string", key: "designationTitle", size: 100, required: false },
      { type: "enum", key: "status", elements: ["Active", "Pending Invite", "Off Duty"], required: true, xdefault: "Active" },
      { type: "string", key: "assignedParcels", size: 200, required: false },
      { type: "string", key: "allowedModules", size: 50, array: true, required: false },
      { type: "datetime", key: "joinedDate", required: false },
      { type: "string", key: "notes", size: 1000, required: false },
    ],
    indexes: [
      { key: "idx_team_farmId", type: "key", attributes: ["farmId"] },
    ],
  },
  {
    id: "financial_transactions",
    name: "Financial Transactions",
    attributes: [
      { type: "string", key: "farmId", size: 36, required: true },
      { type: "string", key: "userId", size: 36, required: true },
      { type: "enum", key: "type", elements: ["production", "loss", "expense"], required: true },
      { type: "string", key: "title", size: 200, required: true },
      { type: "string", key: "category", size: 120, required: true },
      { type: "float", key: "amount", required: true, min: 0 },
      { type: "datetime", key: "date", required: false },
      { type: "string", key: "quantity", size: 100, required: false },
      { type: "enum", key: "status", elements: ["Cleared", "Pending", "Claimed", "Recorded"], required: true, xdefault: "Cleared" },
      { type: "string", key: "reference", size: 100, required: false },
      { type: "string", key: "crop", size: 100, required: false },
      { type: "string", key: "notes", size: 1000, required: false },
    ],
    indexes: [
      { key: "idx_fin_farmId", type: "key", attributes: ["farmId"] },
      { key: "idx_fin_type", type: "key", attributes: ["type"] },
    ],
  },
  {
    id: "advisories",
    name: "Advisories",
    attributes: [
      { type: "string", key: "title", size: 255, required: true },
      { type: "string", key: "category", size: 100, required: true },
      { type: "enum", key: "priority", elements: ["High / Emergency", "Medium / Advisory", "Standard", "Info"], required: true, xdefault: "Medium / Advisory" },
      { type: "string", key: "targetCrop", size: 100, required: false, xdefault: "All" },
      { type: "string", key: "targetDistrict", size: 100, required: false, xdefault: "All" },
      { type: "string", key: "targetState", size: 100, required: false, xdefault: "Punjab" },
      { type: "string", key: "message", size: 3000, required: true },
      { type: "string", key: "actionPrescription", size: 3000, required: false },
      { type: "datetime", key: "dispatchedAt", required: false },
      { type: "string", key: "dispatchedBy", size: 100, required: false },
      { type: "boolean", key: "isActive", required: true, xdefault: true },
    ],
    indexes: [
      { key: "idx_advisories_category", type: "key", attributes: ["category"] },
      { key: "idx_advisories_priority", type: "key", attributes: ["priority"] },
    ],
  },
  {
    id: "mandi_rates",
    name: "Mandi Rates",
    attributes: [
      { type: "string", key: "mandi", size: 150, required: true },
      { type: "string", key: "district", size: 100, required: true },
      { type: "string", key: "state", size: 100, required: true, xdefault: "Punjab" },
      { type: "string", key: "crop", size: 100, required: true },
      { type: "string", key: "variety", size: 100, required: false },
      { type: "float", key: "modalPrice", required: true, min: 0 },
      { type: "float", key: "minPrice", required: false },
      { type: "float", key: "maxPrice", required: false },
      { type: "float", key: "msp", required: false },
      { type: "enum", key: "trend", elements: ["up", "down", "stable"], required: true, xdefault: "stable" },
      { type: "string", key: "date", size: 100, required: false },
    ],
    indexes: [
      { key: "idx_mandi_district", type: "key", attributes: ["district"] },
      { key: "idx_mandi_crop", type: "key", attributes: ["crop"] },
    ],
  },
  {
    id: "field_visits",
    name: "Field Visits",
    attributes: [
      { type: "string", key: "userId", size: 36, required: false },
      { type: "string", key: "farmerName", size: 120, required: true },
      { type: "string", key: "phone", size: 20, required: true },
      { type: "string", key: "farmName", size: 150, required: true },
      { type: "string", key: "plotLandmark", size: 200, required: false },
      { type: "string", key: "crop", size: 100, required: false },
      { type: "string", key: "reason", size: 255, required: true },
      { type: "string", key: "scheduledDate", size: 60, required: false },
      { type: "string", key: "timeSlot", size: 60, required: false },
      { type: "string", key: "tier", size: 60, required: false },
      { type: "float", key: "fee", required: false, xdefault: 499 },
      { type: "string", key: "paymentStatus", size: 60, required: false, xdefault: "Pending Payment" },
      { type: "string", key: "workflowStage", size: 60, required: false, xdefault: "Lead Captured" },
      { type: "string", key: "assignedSpecialist", size: 120, required: false },
      { type: "string", key: "notes", size: 1500, required: false },
    ],
    indexes: [
      { key: "idx_field_visits_phone", type: "key", attributes: ["phone"] },
    ],
  },
  {
    id: "support_tickets",
    name: "Support Tickets",
    attributes: [
      { type: "string", key: "ticketNo", size: 30, required: true },
      { type: "string", key: "userId", size: 36, required: true },
      { type: "string", key: "farmName", size: 150, required: false },
      { type: "string", key: "cropName", size: 100, required: false },
      { type: "string", key: "subject", size: 200, required: true },
      { type: "string", key: "category", size: 100, required: true },
      { type: "enum", key: "priority", elements: ["Low", "Normal", "Urgent"], required: true, xdefault: "Normal" },
      { type: "enum", key: "status", elements: ["Open", "In Review", "Resolved"], required: true, xdefault: "Open" },
      { type: "string", key: "assignedAgronomist", size: 120, required: false },
      { type: "string", key: "description", size: 3000, required: true },
      { type: "string", key: "resolution", size: 3000, required: false },
    ],
    indexes: [
      { key: "idx_support_userId", type: "key", attributes: ["userId"] },
      { key: "idx_support_status", type: "key", attributes: ["status"] },
    ],
  },
  {
    id: "support_messages",
    name: "Support Messages",
    attributes: [
      { type: "string", key: "ticketId", size: 36, required: true },
      { type: "string", key: "senderId", size: 36, required: true },
      { type: "string", key: "senderName", size: 120, required: true },
      { type: "enum", key: "senderRole", elements: ["farmer", "agronomist", "admin"], required: true, xdefault: "farmer" },
      { type: "string", key: "text", size: 3000, required: true },
      { type: "string", key: "attachmentFileId", size: 50, required: false },
    ],
    indexes: [
      { key: "idx_support_msg_ticketId", type: "key", attributes: ["ticketId"] },
    ],
  },
  {
    id: "subscription_plans",
    name: "Subscription Plans",
    attributes: [
      { type: "enum", key: "tier", elements: ["Free", "Basic", "Pro", "Enterprise"], required: true },
      { type: "string", key: "name", size: 100, required: true },
      { type: "float", key: "pricePerYear", required: true, min: 0 },
      { type: "string", key: "billingPeriod", size: 50, required: false, xdefault: "Annual" },
      { type: "string", key: "tagline", size: 200, required: false },
      { type: "integer", key: "maxFarms", required: false, xdefault: 1 },
      { type: "float", key: "maxAcreage", required: true, min: 1 },
      { type: "string", key: "satelliteRefresh", size: 50, required: false },
      { type: "integer", key: "teamSeats", required: false, xdefault: 1 },
      { type: "string", key: "features", size: 255, array: true, required: false },
    ],
  },
  {
    id: "user_subscriptions",
    name: "User Subscriptions",
    attributes: [
      { type: "string", key: "userId", size: 36, required: true },
      { type: "enum", key: "planTier", elements: ["Free", "Basic", "Pro", "Enterprise"], required: true, xdefault: "Free" },
      { type: "enum", key: "status", elements: ["Active", "Trial", "Renewal Due", "Suspended"], required: true, xdefault: "Active" },
      { type: "float", key: "acresAllocated", required: true, xdefault: 0 },
      { type: "float", key: "maxAcres", required: true, xdefault: 10 },
      { type: "datetime", key: "startDate", required: false },
      { type: "datetime", key: "renewalDate", required: false },
      { type: "float", key: "annualFee", required: false, xdefault: 0 },
      { type: "string", key: "paymentMethod", size: 100, required: false },
    ],
    indexes: [
      { key: "idx_user_sub_userId", type: "key", attributes: ["userId"] },
    ],
  },
  {
    id: "billing_invoices",
    name: "Billing Invoices",
    attributes: [
      { type: "string", key: "userId", size: 36, required: true },
      { type: "string", key: "invoiceNo", size: 50, required: true },
      { type: "datetime", key: "date", required: false },
      { type: "string", key: "period", size: 80, required: false },
      { type: "string", key: "planName", size: 120, required: true },
      { type: "float", key: "amount", required: true, min: 0 },
      { type: "string", key: "paymentMethod", size: 100, required: false },
      { type: "enum", key: "status", elements: ["Paid", "Pending", "Failed"], required: true, xdefault: "Paid" },
    ],
    indexes: [
      { key: "idx_invoices_userId", type: "key", attributes: ["userId"] },
    ],
  },
  {
    id: "audit_reports",
    name: "Audit Reports",
    attributes: [
      { type: "string", key: "farmId", size: 36, required: true },
      { type: "string", key: "userId", size: 36, required: true },
      { type: "string", key: "title", size: 200, required: true },
      { type: "string", key: "category", size: 100, required: true },
      { type: "string", key: "period", size: 100, required: false },
      { type: "enum", key: "status", elements: ["Audit Ready", "Generated"], required: true, xdefault: "Audit Ready" },
      { type: "string", key: "summary", size: 2000, required: false },
      { type: "string", key: "metric1Label", size: 50, required: false },
      { type: "string", key: "metric1Val", size: 50, required: false },
      { type: "string", key: "metric2Label", size: 50, required: false },
      { type: "string", key: "metric2Val", size: 50, required: false },
      { type: "string", key: "pdfFileId", size: 50, required: false },
    ],
    indexes: [
      { key: "idx_audit_farmId", type: "key", attributes: ["farmId"] },
    ],
  },
  {
    id: "sensor_telemetry",
    name: "Sensor Telemetry",
    attributes: [
      { type: "string", key: "farmId", size: 36, required: true },
      { type: "string", key: "cropId", size: 36, required: false },
      { type: "string", key: "sensorNodeId", size: 50, required: true },
      { type: "float", key: "soilMoisture", required: false },
      { type: "float", key: "soilTemp", required: false },
      { type: "float", key: "ambientTemp", required: false },
      { type: "float", key: "ambientHumidity", required: false },
      { type: "integer", key: "batteryLevel", required: false, min: 0, max: 100 },
      { type: "datetime", key: "timestamp", required: false },
    ],
    indexes: [
      { key: "idx_telemetry_farmId", type: "key", attributes: ["farmId"] },
    ],
  },
  {
    id: "admin_audit_logs",
    name: "Admin Audit Logs",
    attributes: [
      { type: "string", key: "actorId", size: 36, required: false },
      { type: "string", key: "actorName", size: 100, required: true },
      { type: "string", key: "action", size: 150, required: true },
      { type: "string", key: "entity", size: 100, required: true },
      { type: "string", key: "entityId", size: 50, required: false },
      { type: "enum", key: "status", elements: ["Success", "Warning", "Error"], required: true, xdefault: "Success" },
      { type: "string", key: "ipAddress", size: 50, required: false },
      { type: "string", key: "details", size: 2000, required: false },
    ],
    indexes: [
      { key: "idx_admin_audit_entity", type: "key", attributes: ["entity"] },
    ],
  },
];

async function createAttribute(colId, attr) {
  try {
    const defaultVal = attr.required ? null : (attr.xdefault !== undefined ? attr.xdefault : null);
    switch (attr.type) {
      case "string":
        await databases.createStringAttribute({
          databaseId: DB_ID,
          collectionId: colId,
          key: attr.key,
          size: attr.size,
          required: attr.required,
          xdefault: defaultVal,
          array: attr.array || false,
        });
        break;
      case "integer":
        await databases.createIntegerAttribute({
          databaseId: DB_ID,
          collectionId: colId,
          key: attr.key,
          required: attr.required,
          min: attr.min !== undefined ? attr.min : null,
          max: attr.max !== undefined ? attr.max : null,
          xdefault: defaultVal,
          array: attr.array || false,
        });
        break;
      case "float":
        await databases.createFloatAttribute({
          databaseId: DB_ID,
          collectionId: colId,
          key: attr.key,
          required: attr.required,
          min: attr.min !== undefined ? attr.min : null,
          max: attr.max !== undefined ? attr.max : null,
          xdefault: defaultVal,
          array: attr.array || false,
        });
        break;
      case "boolean":
        await databases.createBooleanAttribute({
          databaseId: DB_ID,
          collectionId: colId,
          key: attr.key,
          required: attr.required,
          xdefault: defaultVal,
          array: attr.array || false,
        });
        break;
      case "email":
        await databases.createEmailAttribute({
          databaseId: DB_ID,
          collectionId: colId,
          key: attr.key,
          required: attr.required,
          xdefault: defaultVal,
          array: attr.array || false,
        });
        break;
      case "url":
        await databases.createUrlAttribute({
          databaseId: DB_ID,
          collectionId: colId,
          key: attr.key,
          required: attr.required,
          xdefault: defaultVal,
          array: attr.array || false,
        });
        break;
      case "datetime":
        await databases.createDatetimeAttribute({
          databaseId: DB_ID,
          collectionId: colId,
          key: attr.key,
          required: attr.required,
          xdefault: defaultVal,
          array: attr.array || false,
        });
        break;
      case "enum":
        await databases.createEnumAttribute({
          databaseId: DB_ID,
          collectionId: colId,
          key: attr.key,
          elements: attr.elements,
          required: attr.required,
          xdefault: defaultVal,
          array: attr.array || false,
        });
        break;
    }
    console.log(`    ✓ Attribute added: ${attr.key} (${attr.type})`);
  } catch (err) {
    if (err.code === 409) {
      console.log(`    - Attribute already exists: ${attr.key}`);
    } else {
      console.error(`    ✗ Error adding attribute ${attr.key}:`, err.message);
    }
  }
}

async function waitForAttributes(colId) {
  let pending = true;
  let attempts = 0;
  while (pending && attempts < 30) {
    attempts++;
    const res = await databases.listAttributes({
      databaseId: DB_ID,
      collectionId: colId,
    });
    const notReady = res.attributes.filter(
      (a) => a.status !== "available" && a.status !== "failed"
    );
    if (notReady.length === 0) {
      pending = false;
    } else {
      await sleep(1000);
    }
  }
}

async function createIndex(colId, idx) {
  try {
    await databases.createIndex({
      databaseId: DB_ID,
      collectionId: colId,
      key: idx.key,
      type: idx.type,
      attributes: idx.attributes,
    });
    console.log(`    ✓ Index created: ${idx.key}`);
  } catch (err) {
    if (err.code === 409) {
      console.log(`    - Index already exists: ${idx.key}`);
    } else {
      console.error(`    ✗ Error creating index ${idx.key}:`, err.message);
    }
  }
}

async function main() {
  console.log("=== Starting Khetivo Appwrite Database Setup ===");
  console.log("Target Database:", DB_ID);

  for (const col of collections) {
    console.log(`\n[Collection] ${col.name} (${col.id})`);

    // 1. Create collection if needed
    try {
      await databases.createCollection({
        databaseId: DB_ID,
        collectionId: col.id,
        name: col.name,
        permissions: [
          sdk.Permission.read(sdk.Role.any()),
          sdk.Permission.create(sdk.Role.users()),
          sdk.Permission.update(sdk.Role.users()),
          sdk.Permission.delete(sdk.Role.users()),
        ],
        documentSecurity: false,
        enabled: true,
      });
      console.log(`  ✓ Collection created: ${col.id}`);
    } catch (e) {
      if (e.code === 409) {
        console.log(`  - Collection already exists: ${col.id}`);
      } else {
        console.error(`  ✗ Error creating collection ${col.id}:`, e.message);
        continue;
      }
    }

    // 2. Create attributes
    for (const attr of col.attributes) {
      await createAttribute(col.id, attr);
      // Tiny throttle to avoid rate limiting
      await sleep(150);
    }

    // 3. Wait for attributes to be ready before creating indexes
    if (col.indexes && col.indexes.length > 0) {
      console.log(`  ... Waiting for attributes to become ready for indexing ...`);
      await waitForAttributes(col.id);
      for (const idx of col.indexes) {
        await createIndex(col.id, idx);
        await sleep(200);
      }
    }
  }

  console.log("\n=== Appwrite Database Structure Setup Completed! ===");
}

main().catch((err) => {
  console.error("Fatal error during database setup:", err);
  process.exit(1);
});
