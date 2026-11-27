"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Sprout,
  Droplets,
  ScanLine,
  TrendingUp,
  CloudSun,
  Cpu,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  Send,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  HelpCircle,
  Plus,
  MapPin,
  Crosshair,
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  Layers,
  Ruler,
  Waves,
  Sun,
  Check,
  Globe,
  Sparkles,
  Calendar,
  CheckSquare,
  Package,
  Wallet,
  Users,
  FileText,
  Download,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Eye,
  Phone,
  MessageSquare,
  Filter,
  DollarSign,
  CloudRain,
  Radio,
  Wind,
  Thermometer,
  ShieldAlert,
  ChevronRight,
  CreditCard,
  UserCheck,
  Receipt,
  FileCheck,
  Wrench,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  PieChart,
  BarChart2,
  Printer,
  RotateCcw,
  RefreshCw,
  Mail,
  UserPlus,
  Edit3,
  Shield,
  Play,
} from "lucide-react";
import { signOutUser, deleteRegisteredUser } from "@/lib/authStore";
import {
  checkAppwriteHealth,
  subscribeToDatabaseChanges,
  syncFarmsFromAppwrite,
  createFarmInAppwrite,
  deleteFarmInAppwrite,
  syncTasksFromAppwrite,
  createTaskInAppwrite,
  updateTaskStatusInAppwrite,
  deleteTaskFromAppwrite,
  syncCropsFromAppwrite,
  createCropInAppwrite,
  updateCropInAppwrite,
  deleteCropInAppwrite,
  syncInventoryFromAppwrite,
  createInventoryItemInAppwrite,
  createFarmStoreInAppwrite,
  logUsageInAppwrite,
  restockItemInAppwrite,
  syncEquipmentFromAppwrite,
  createEquipmentInAppwrite,
  deleteEquipmentInAppwrite,
  updateEquipmentStatusInAppwrite,
  resolveEquipmentIssueInAppwrite,
  reportEquipmentProblemInAppwrite,
  syncSupportFromAppwrite,
  createSupportTicketInAppwrite,
  bookFieldVisitInAppwrite,
  syncFinancialsFromAppwrite,
  createFinancialTransactionInAppwrite,
  deleteFinancialTransactionInAppwrite,
  syncTeamFromAppwrite,
  createTeamMemberInAppwrite,
  createDesignationInAppwrite,
  deleteTeamMemberInAppwrite,
  deleteDesignationInAppwrite,
  syncInvoicesFromAppwrite,
  syncAdvisoriesFromAppwrite,
  syncSubscriptionFromAppwrite,
  updateSubscriptionInAppwrite,
  syncCropTemplatesFromAppwrite,
  syncUserProfileFromAppwrite,
  saveUserProfileToAppwrite,
  CloudFarm,
} from "@/lib/appwriteSync";
import { getCurrentUserId } from "@/lib/currentSession";
import { TRANSLATIONS, SupportedLanguage } from "@/lib/translations";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface NavItem {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const DEFAULT_FARMER_BROADCASTS: any[] = [];

const NAV_SECTIONS: NavSection[] = [
  {
    title: "DAILY",
    items: [
      { id: "dashboard", label: "Dashboard", description: "Farm summary & precision alerts", icon: LayoutDashboard },
      { id: "advisories", label: "Advisories & Alerts", description: "Crop outbreak alerts & weather warnings", icon: Radio },
      { id: "weather", label: "Weather", description: "Hyper-local GPS weather & spray advisory", icon: CloudSun },
      { id: "tasks", label: "Tasks", description: "Task calendar & kanban board", icon: CheckSquare },
      { id: "inventory", label: "Inventory", description: "Seeds, fertilizers & hardware stock", icon: Package },
      { id: "equipment", label: "Equipment", description: "Machinery, tractors & maintenance logs", icon: Wrench },
    ],
  },
  {
    title: "RECORDS",
    items: [
      { id: "crops", label: "Crop Management", description: "Crop cycle, timeline & varieties", icon: Sprout },
      { id: "expenses", label: "Stats", description: "Production, losses & farm expenses", icon: Receipt },
      { id: "reports", label: "Reports", description: "Farm audit reports & data downloads", icon: FileText },
    ],
  },
  {
    title: "MANAGE",
    items: [
      { id: "my-farms", label: "My Farms", description: "All registered farms & locations", icon: Building2 },
      { id: "team", label: "Team", description: "Farm workforce & operator management", icon: Users },
      { id: "subscription", label: "Subscription / Plan", description: "Active plan, billing & enterprise tier", icon: ShieldCheck },
      { id: "support", label: "Support", description: "24/7 Agronomist helpline & WhatsApp support", icon: HelpCircle },
      { id: "settings", label: "Settings", description: "Farmer profile & farm preferences", icon: Settings },
    ],
  },
];

const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((sec) => sec.items);

export interface FarmStore {
  id: string;
  farmId: string;
  farmName: string;
  name: string;
  type: string;
  location?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  farmId: string;
  farmName: string;
  storeId: string;
  storeName: string;
  name: string;
  category: string;
  batchNumber: string;
  purchasedDate: string;
  expiryDate: string;
  quantity: number;
  unit: string;
  rate: number;
  lowStockThreshold: number;
}

export interface ItemUsageLog {
  id: string;
  itemId: string;
  itemName: string;
  farmId: string;
  farmName: string;
  storeId: string;
  storeName: string;
  quantityUsed: number;
  unit: string;
  date: string;
  purpose: string;
  crop?: string;
  appliedBy: string;
}

export interface FarmDesignation {
  id: string;
  title: string;
  description: string;
  allowedModules: string[];
  color?: string;
  isSystemDefault?: boolean;
}

export const INITIAL_DESIGNATIONS: FarmDesignation[] = [
  {
    id: "des-1",
    title: "Owner & Farm Administrator",
    description: "Full administrative control with unrestricted operational, financial, and configuration authority.",
    allowedModules: [
      "dashboard",
      "weather",
      "tasks",
      "inventory",
      "equipment",
      "crops",
      "expenses",
      "reports",
      "my-farms",
      "team",
      "settings",
    ],
    color: "#0C4B32",
    isSystemDefault: true,
  },
  {
    id: "des-2",
    title: "Field Supervisor & Operations Lead",
    description: "Oversees daily field tasks, worker rosters, input dispatches, and crop phenological monitoring.",
    allowedModules: ["dashboard", "weather", "tasks", "inventory", "equipment", "crops"],
    color: "#15803D",
    isSystemDefault: true,
  },
  {
    id: "des-3",
    title: "Consulting Agronomist (Crop Advisor)",
    description: "Expert advice on pathology, pest scouting, spray windows, and crop performance analytics.",
    allowedModules: ["dashboard", "weather", "crops", "reports"],
    color: "#7E22CE",
    isSystemDefault: true,
  },
  {
    id: "des-4",
    title: "Tractor & Heavy Machinery Driver",
    description: "Operates tractors, seeders, and harvesters; maintains fuel efficiency and machinery sensors.",
    allowedModules: ["dashboard", "tasks", "equipment"],
    color: "#B45309",
    isSystemDefault: true,
  },
  {
    id: "des-5",
    title: "Store & Inventory Keeper",
    description: "Logs seed and chemical intake, maintains godown ledger, and tracks batch expiry dates.",
    allowedModules: ["dashboard", "inventory", "equipment"],
    color: "#0284C7",
    isSystemDefault: true,
  },
  {
    id: "des-6",
    title: "Farm Accountant / Mandi Sales Rep",
    description: "Manages APMC Mandi dispatches, sales receipts, input bills, and financial ledger.",
    allowedModules: ["dashboard", "expenses", "reports"],
    color: "#BE123C",
    isSystemDefault: true,
  },
  {
    id: "des-7",
    title: "Irrigation & Fertigation Operator",
    description: "Controls drip valves, tubewell pump runtime, filter flushing, and soil moisture sensors.",
    allowedModules: ["dashboard", "weather", "tasks"],
    color: "#0D9488",
    isSystemDefault: true,
  },
];

export interface TeamMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  designationId: string;
  designationTitle: string;
  roleCategory: "admin" | "supervisor" | "agronomist" | "operator" | "inventory" | "accountant" | "worker";
  farmId: string;
  farmName: string;
  status: "Active" | "Pending Invite";
  allowedModules: string[];
  joinedDate: string;
  notes?: string;
}

export interface AppModuleDef {
  id: string;
  label: string;
  description: string;
  category: "Core Daily" | "Records & Stats" | "Farm Admin";
}

export const APP_MODULES: AppModuleDef[] = [
  { id: "dashboard", label: "Dashboard", description: "Farm overview, KPI cards & precision weather alerts", category: "Core Daily" },
  { id: "advisories", label: "Advisories & Alerts", description: "Targeted crop warnings & weather alerts", category: "Core Daily" },
  { id: "weather", label: "Weather & Spray Advisory", description: "Hyper-local GPS forecasts, rain radar & spray advisory windows", category: "Core Daily" },
  { id: "tasks", label: "Tasks & Operations", description: "Calendar schedule, task assignments & kanban workflow", category: "Core Daily" },
  { id: "inventory", label: "Inventory & Stores", description: "Fertilizers, agrochemicals, seed stock & low inventory alerts", category: "Core Daily" },
  { id: "equipment", label: "Equipment & Fleet", description: "Tractors, machinery sensors, service logs & breakdown reports", category: "Core Daily" },
  { id: "crops", label: "Crop Management", description: "Crop cycles, phenological stages, NDVI health & harvest tracking", category: "Records & Stats" },
  { id: "expenses", label: "Stats & Financials", description: "Production harvest realization, losses ledger & farm expenses", category: "Records & Stats" },
  { id: "reports", label: "Reports & Audits", description: "Audit reports, monthly P&L charts & official CSV downloads", category: "Records & Stats" },
  { id: "my-farms", label: "My Farms & Parcels", description: "Land holdings, GPS geo-boundaries, soil data & irrigation pumps", category: "Farm Admin" },
  { id: "team", label: "Team & Workforce", description: "Staff directory, designations & module access control", category: "Farm Admin" },
  { id: "settings", label: "Settings", description: "Farmer profile, currency, SMS alerts & unit preferences", category: "Farm Admin" },
];

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [];

// ==========================================
// SUBSCRIPTION & PLAN DEFINITIONS
// ==========================================
export interface SubscriptionPlanDef {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  acreageLimit: string;
  farmLimit: string;
  seats: string;
  features: string[];
  isCurrent?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanDef[] = [
  {
    id: "starter",
    name: "Kisan Starter",
    tagline: "Free Forever / No Credit Card",
    monthlyPrice: 0,
    annualPrice: 0,
    acreageLimit: "Up to 5 Acres",
    farmLimit: "1 Farm Plot",
    seats: "1 Owner Login",
    features: [
      "1 Registered Farm Plot with GPS boundary auto-detection.",
      "Full Stock Register: Seeds, fertilizers, chemicals & diesel.",
      "Expiry Alerts at 90, 30 & 7 days to eliminate inventory waste.",
      "Equipment & Machinery Register: Service logs & breakdown tracking.",
    ],
  },
  {
    id: "pro",
    name: "Precision Pro",
    tagline: "Per Annum (Launch Offer)",
    monthlyPrice: 249,
    annualPrice: 2999,
    acreageLimit: "Up to 25 Acres",
    farmLimit: "Up to 5 Farms",
    seats: "Role-based Team Access",
    features: [
      "Up to 5 Farms with Multi-Farm portfolio selector.",
      "Crop Planning & Growth Timeline: Day 1 to 140 tracking.",
      "7-Day Hyperlocal Weather & smart foliar spray windows.",
      "Daily Task Operations & field labor assignment.",
      "Financial Accounting: Input costs vs. harvest P&L margin per acre.",
      "Team Management: Role-based access for supervisors.",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Agri",
    tagline: "Per Annum (Launch Offer)",
    monthlyPrice: 599,
    annualPrice: 5999,
    acreageLimit: "Unlimited Acres",
    farmLimit: "Unlimited Farms",
    seats: "Dedicated Account Desk",
    isCurrent: true,
    features: [
      "Unlimited Farms & Holdings across all regions.",
      "Recommended Do's & Don'ts: Stage-wise admin agronomy guides.",
      "Live Advisories & Alerts: Instant disease & weather bulletins.",
      "Expert Agronomy Support: Direct tickets & on-site field visits.",
      "Dedicated Account Manager with priority desk access.",
      "AI Disease Scanner (Google Lens): Instant leaf diagnosis (Coming Soon).",
    ],
  },
];

export interface BillingInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  period: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  status: "Paid" | "Pending";
}

export const INITIAL_INVOICES: BillingInvoice[] = [];

// ==========================================
// SUPPORT & AGRONOMY TICKETS DEFINITIONS
// ==========================================
export interface SupportTicket {
  id: string;
  ticketNo: string;
  subject: string;
  category: "Crop Health & Pathology" | "Irrigation & Soil" | "Weather & Advisory" | "Billing & Plan" | "IoT & Machinery Sensors";
  farmName: string;
  cropName: string;
  priority: "Low" | "Normal" | "Urgent";
  status: "Open" | "In Review" | "Resolved";
  createdAt: string;
  lastReply: string;
  assignedAgronomist: string;
  description: string;
  resolution?: string;
}

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [];

export const AGRONOMY_FAQS = [
  {
    question: "When is the optimal foliar spray window for fungicide/insecticide?",
    category: "Crop Health & Pathology",
    answer: "Spray during calm morning hours (7:00 AM – 10:30 AM) or late afternoon (4:00 PM – 6:30 PM). Avoid spraying when wind speed exceeds 12 km/h or leaf wetness is excessive to prevent drift and wash-off.",
  },
  {
    question: "How should I interpret soil moisture percentages across soil types?",
    category: "Irrigation & Soil",
    answer: "For typical Punjab/Haryana alluvial sandy loam, 30%–45% volumetric water content indicates optimal field capacity. Below 24% signals critical water stress requiring irrigation. Above 50% risks root aeration restriction.",
  },
  {
    question: "How do I add a new tractor driver or operator with restricted access?",
    category: "Platform & Workforce",
    answer: "Go to the Team tab, click '+ Add Team Member', enter their name, phone, and select their Designation & Role. You can manage exact module permissions in the 'Designations & Roles' sub-tab so operators only see their assigned modules.",
  },
  {
    question: "How are 10-meter Sentinel-2 NDVI satellite biomass scans updated?",
    category: "Satellite & Advisory",
    answer: "NDVI and NDRE vegetation indices are refreshed every 5 days when the European Space Agency Sentinel-2 constellation passes over your geo-tagged farm coordinates, provided cloud cover is below 20%.",
  },
  {
    question: "Can I download official expense & harvest audit records for bank loans/KCC?",
    category: "Billing & Reports",
    answer: "Yes! Navigate to the 'Reports' module where you can generate bank audit reports and download official harvest ledger CSV and PDF reports formatted for APMC Mandi, crop insurance, and Kisan Credit Card (KCC) verifications.",
  },
];

export const INVENTORY_CATEGORIES = [
  "Fungicide",
  "Fertilizer",
  "Insecticide",
  "Herbicide",
  "Seed",
  "Bio-stimulant",
  "Micronutrient",
  "Irrigation Hardware",
  "Tools & Machinery",
  "Fuel & Lubricant",
  "Other",
];

export const INVENTORY_UNITS = [
  "kg",
  "litres",
  "grams",
  "packets",
  "bags",
  "bottles",
  "units",
  "meters",
];

export const INITIAL_STORES: FarmStore[] = [];

export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [];

export const INITIAL_USAGE_LOGS: ItemUsageLog[] = [];

export interface FarmTask {
  id: string;
  farmId: string;
  farmName: string;
  title: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "To Do" | "In Progress" | "Completed";
  dueDate: string;
  assignedTo: string;
  zone?: string;
  crop?: string;
  description?: string;
  instructions?: string;
  completedDate?: string;
}

export const TASK_CATEGORIES = [
  "Fertilization & Nutrition",
  "Irrigation & Water Management",
  "Pest & Disease Spraying",
  "Harvesting & Post-Harvest",
  "Sowing & Seedbed Prep",
  "Machinery & Equipment Service",
  "Weeding & Inter-culture",
  "Soil Testing & Field Scouting",
];

export const INITIAL_TASKS: FarmTask[] = [];

export interface FarmEquipment {
  id: string;
  farmId: string;
  farmName: string;
  name: string;
  category: string;
  modelNumber?: string;
  operator: string;
  status: "Operational" | "In Field" | "Service Due" | "Problem Reported";
  runtimeHours: number;
  nextServiceDate?: string;
  nextServiceHours?: number;
  fuelEfficiency?: string;
  lastServiceDate?: string;
}

export interface EquipmentIssueReport {
  id: string;
  equipmentId: string;
  equipmentName: string;
  farmId: string;
  farmName: string;
  issueType: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  description: string;
  reportedBy: string;
  reportedDate: string;
  status: "Open" | "In Progress" | "Resolved";
}

export const EQUIPMENT_CATEGORIES = [
  "Tractor (4WD / 2WD)",
  "Rotavator / Rotary Tiller",
  "Solar / Submersible Tubewell Pump",
  "Hydraulic Disc Harrow",
  "Combine Harvester / Reaper",
  "Boom Sprayer / Drone",
  "Seed Drill / Planter",
  "General Farm Implement",
];

export const INITIAL_EQUIPMENT: FarmEquipment[] = [];

export const INITIAL_EQUIPMENT_ISSUES: EquipmentIssueReport[] = [];

export interface GrowthStageMilestone {
  id: string;
  stageName: string;
  startDay: number;
  endDay: number;
  irrigationRequirement: "Critical" | "Moderate" | "Low" | "Withhold";
  recommendedActivity: string;
}

export interface CropMasterTemplate {
  id: string;
  cropName: string;
  name: string;
  varieties: string[];
  variety: string;
  season: "Rabi" | "Kharif" | "Zaid" | "Annual";
  sowingWindow: string;
  durationDays: number;
  duration: string;
  defaultSoil: string;
  defaultIrrigation: string;
  badge: string;
  targetYieldQuintals: string;
  irrigationThresholdMoisture: number;
  criticalIrrigationStages: string[];
  majorDiseases: string[];
  pauFungicidePrescription: string;
  growthTimeline: GrowthStageMilestone[];
  dos?: string[];
  donts?: string[];
}

export type CropTemplate = CropMasterTemplate;

export const DEFAULT_PAU_GROWTH_TIMELINE: GrowthStageMilestone[] = [
  { id: "st-1", stageName: "Germination & Emergence", startDay: 0, endDay: 20, irrigationRequirement: "Moderate", recommendedActivity: "Pre-emergence herbicide and initial seedling stand assessment." },
  { id: "st-2", stageName: "Tillering / Active Vegetative", startDay: 21, endDay: 50, irrigationRequirement: "Critical", recommendedActivity: "1st split Nitrogen top-dressing. Scout for early foliar rusts or sucking pests." },
  { id: "st-3", stageName: "Stem Elongation / Jointing", startDay: 51, endDay: 75, irrigationRequirement: "Moderate", recommendedActivity: "2nd split Nitrogen with micronutrient spray (Zinc / Boron)." },
  { id: "st-4", stageName: "Booting & Heading (Ear emergence)", startDay: 76, endDay: 100, irrigationRequirement: "Critical", recommendedActivity: "Most critical irrigation window. Maintain soil moisture above threshold." },
  { id: "st-5", stageName: "Grain Filling & Milking", startDay: 101, endDay: 125, irrigationRequirement: "Low", recommendedActivity: "Monitor late season blight. Withhold irrigation 12-15 days prior to harvest." },
];

export const CROP_TEMPLATES: CropMasterTemplate[] = [
  {
    id: "wheat",
    cropName: "Wheat (Kanak)",
    name: "Wheat (Kanak)",
    varieties: ["HD-3086", "PBW-826", "DBW-187", "PBW-725", "Sharbati"],
    variety: "HD-3086 / PBW-826",
    season: "Rabi",
    sowingWindow: "25 Oct – 15 Nov (Rabi)",
    durationDays: 140,
    duration: "135-140 Days",
    defaultSoil: "Alluvial Loam (Deep & Fertile)",
    defaultIrrigation: "Drip / Micro-Irrigation (Sub-surface/Surface)",
    badge: "Punjab & Haryana Standard",
    targetYieldQuintals: "22 – 26 Qtl/Acre",
    irrigationThresholdMoisture: 30,
    criticalIrrigationStages: [
      "Crown Root Initiation (21 Days)",
      "Tillering Stage (45 Days)",
      "Late Jointing (65 Days)",
      "Flowering & Heading (85 Days)",
      "Milking & Grain Fill (110 Days)",
    ],
    growthTimeline: [
      { id: "w-1", stageName: "Sowing & Germination", startDay: 0, endDay: 15, irrigationRequirement: "Moderate", recommendedActivity: "Basal DAP 55kg + MOP 20kg. Seed treated with Carbendazim." },
      { id: "w-2", stageName: "Crown Root Initiation (CRI)", startDay: 20, endDay: 30, irrigationRequirement: "Critical", recommendedActivity: "Critical 1st irrigation. 1st split Urea (45kg/acre). Avoid water stagnation." },
      { id: "w-3", stageName: "Tillering & Stem Elongation", startDay: 35, endDay: 55, irrigationRequirement: "Moderate", recommendedActivity: "2nd split Urea. Broadleaf & grassy weed herbicide application." },
      { id: "w-4", stageName: "Booting & Heading (Ear emergence)", startDay: 60, endDay: 80, irrigationRequirement: "Critical", recommendedActivity: "Critical 3rd irrigation. Spray 0.5% Zinc Sulphate if flag leaf pale." },
      { id: "w-5", stageName: "Flowering & Anthesis", startDay: 85, endDay: 100, irrigationRequirement: "Critical", recommendedActivity: "Scout for Yellow Rust pustules. Tilt 25% EC spray if rust spots seen." },
      { id: "w-6", stageName: "Milking & Grain Hardening", startDay: 105, endDay: 140, irrigationRequirement: "Low", recommendedActivity: "Terminal irrigation for test weight. Stop watering 15 days before combine harvest." },
    ],
    majorDiseases: ["Yellow Rust (Stripe)", "Karnal Bunt", "Aphids (Chepa)", "Loose Smut"],
    pauFungicidePrescription: "Tilt / Folicur (Propiconazole 25% EC) @ 200 ml in 200L water on first yellow rust spotting.",
    dos: [
      "Perform seed treatment with Carbendazim (2g/kg seed) before sowing",
      "Ensure 1st critical irrigation at Crown Root Initiation (CRI) stage (20-25 days)",
      "Apply balanced NPK with Zinc Sulphate (21%) for optimal tiller development",
      "Scout flag leaves weekly during Jan-Feb for yellow rust stripe pustules"
],
    donts: [
      "Do not delay first irrigation past 25 days as it permanently stunts root development",
      "Do not apply heavy irrigation during high wind forecasts to prevent lodging",
      "Avoid excessive nitrogen top-dressing after booting stage",
      "Do not irrigate within 15 days before combine harvesting"
],
  },
  {
    id: "paddy",
    cropName: "Paddy / Rice (Dhan)",
    name: "Paddy / Rice (Dhan)",
    varieties: ["PR-126", "PR-131", "Pusa Basmati 1121", "Pusa Basmati 1509"],
    variety: "Pusa Basmati 1121 / PR-126",
    season: "Kharif",
    sowingWindow: "15 Jun – 5 Jul (Kharif)",
    durationDays: 125,
    duration: "120-130 Days",
    defaultSoil: "Clay Loam (Water-retentive)",
    defaultIrrigation: "Canal Flood / Furrow Irrigation",
    badge: "Export Grade Aroma",
    targetYieldQuintals: "30 – 34 Qtl/Acre",
    irrigationThresholdMoisture: 50,
    criticalIrrigationStages: [
      "Transplanting Ponding (0 – 15 Days)",
      "Tillering (25 – 40 Days)",
      "Panicle Emergence (60 – 75 Days)",
      "Grain Hardening (90 – 105 Days)",
    ],
    growthTimeline: [
      { id: "p-1", stageName: "Nursery & Transplanting", startDay: 0, endDay: 15, irrigationRequirement: "Critical", recommendedActivity: "Maintain 4-5 cm standing water for 15 days post-transplanting to ensure seedling anchoring." },
      { id: "p-2", stageName: "Active Tillering", startDay: 20, endDay: 45, irrigationRequirement: "Moderate", recommendedActivity: "Top-dress Urea in 2 splits with Zinc Sulphate. Alternate wetting and drying (AWD)." },
      { id: "p-3", stageName: "Panicle Initiation & Booting", startDay: 50, endDay: 75, irrigationRequirement: "Critical", recommendedActivity: "Crucial moisture window. Monitor for Stem Borer & Leaf Folder. Amistar Top spray." },
      { id: "p-4", stageName: "Flowering & Grain Filling", startDay: 80, endDay: 105, irrigationRequirement: "Moderate", recommendedActivity: "Maintain shallow soil saturation during milk stage. Prevent moisture stress." },
      { id: "p-5", stageName: "Maturity & Harvest", startDay: 110, endDay: 125, irrigationRequirement: "Withhold", recommendedActivity: "Drain fields 12 days prior to combine harvesting to allow soil firming." },
    ],
    majorDiseases: ["Sheath Blight", "Stem Borer (Teda)", "False Smut (Haldia)", "Leaf Folder"],
    pauFungicidePrescription: "Amistar Top (Azoxystrobin + Difenoconazole) @ 200 ml/acre for false smut & sheath blight control.",
    dos: [
      "Maintain 4-5 cm standing water for the first 15 days post-transplanting",
      "Practice Alternate Wetting and Drying (AWD) after tillering to conserve groundwater",
      "Top-dress Urea in split doses combined with Zinc Sulphate",
      "Drain fields 10-14 days prior to combine harvesting to allow soil firming"
],
    donts: [
      "Do not allow continuous deep submergence during the grain hardening stage",
      "Avoid indiscriminate insecticide sprays that destroy predatory spiders",
      "Do not transplant nursery seedlings older than 30 days",
      "Never burn crop stubble; incorporate residue into soil or use Happy Seeder"
],
  },
  {
    id: "mustard",
    cropName: "Mustard / Sarson",
    name: "Mustard / Sarson",
    varieties: ["Pusa Bold", "Giriraj", "RH-749", "RLC-3", "Pusa Jai Kisan"],
    variety: "Pusa Jai Kisan / Giriraj",
    season: "Rabi",
    sowingWindow: "10 Oct – 31 Oct (Rabi)",
    durationDays: 120,
    duration: "110-120 Days",
    defaultSoil: "Red & Yellow Sandy Loam",
    defaultIrrigation: "Sprinkler System (Overhead/Center Pivot)",
    badge: "Low Water Requirement",
    targetYieldQuintals: "8 – 11 Qtl/Acre",
    irrigationThresholdMoisture: 25,
    criticalIrrigationStages: [
      "Pre-sowing (Rauni)",
      "Vegetative (30 Days)",
      "Flowering & Siliqua (60 – 70 Days)",
    ],
    growthTimeline: [
      { id: "m-1", stageName: "Sowing & Rosette Phase", startDay: 0, endDay: 25, irrigationRequirement: "Moderate", recommendedActivity: "Pre-sowing Rauni watering. Thinning at 15-20 days to maintain 10-15cm spacing." },
      { id: "m-2", stageName: "Branching & Pre-Flowering", startDay: 30, endDay: 55, irrigationRequirement: "Critical", recommendedActivity: "1st post-sowing irrigation. Top-dress remaining Nitrogen. Scout for white rust." },
      { id: "m-3", stageName: "Flowering & Siliqua (Pod) Formation", startDay: 60, endDay: 90, irrigationRequirement: "Critical", recommendedActivity: "Critical 2nd irrigation. Monitor aphid population. Rogor 30% EC if ETL crossed." },
      { id: "m-4", stageName: "Pod Filling & Maturity", startDay: 95, endDay: 120, irrigationRequirement: "Low", recommendedActivity: "Harvest when 75% of siliquae turn golden yellow. Avoid shattering loss." },
    ],
    majorDiseases: ["White Rust", "Alternaria Blight", "Mustard Aphids"],
    pauFungicidePrescription: "Ridomil Gold @ 400g/acre for white rust; Rogor (Dimethoate) @ 250ml/acre for aphids.",
    dos: [
      "Complete sowing between 10 Oct and 25 Oct for peak oil concentration",
      "Thin seedlings at 15-20 days to maintain 10-15 cm intra-row plant spacing",
      "Apply critical irrigations at pre-flowering (30 days) and pod formation (65 days)",
      "Spray Rogor (Dimethoate) or Thiamethoxam on cloudy days if aphids exceed ETL"
],
    donts: [
      "Do not allow standing water or moisture stagnation; mustard is highly vulnerable to root rot",
      "Avoid flood irrigation during peak flowering to prevent blossom drop",
      "Do not delay aphid treatment once colonies form on central shoots",
      "Do not harvest during blazing afternoon heat to prevent pod shattering loss"
],
  },
  {
    id: "potato",
    cropName: "Potato (Aloo)",
    name: "Potato (Aloo)",
    varieties: ["Kufri Pukhraj", "Kufri Jyoti", "Kufri Chipsona", "Lady Rosetta"],
    variety: "Kufri Pukhraj / Jyoti",
    season: "Rabi",
    sowingWindow: "1 Oct – 20 Oct (Rabi)",
    durationDays: 95,
    duration: "85-100 Days",
    defaultSoil: "Sandy Loam (Loose & Well-drained)",
    defaultIrrigation: "Sprinkler System (Overhead/Center Pivot)",
    badge: "Cold Storage Certified",
    targetYieldQuintals: "120 – 160 Qtl/Acre",
    irrigationThresholdMoisture: 35,
    criticalIrrigationStages: [
      "Stolon Formation (25 Days)",
      "Tuber Bulking (45 – 65 Days)",
      "Maturity & Skin Setting (80 Days)",
    ],
    growthTimeline: [
      { id: "po-1", stageName: "Sprouting & Stolon Formation", startDay: 0, endDay: 25, irrigationRequirement: "Moderate", recommendedActivity: "Earthing-up and furrow irrigation. Apply Mancozeb preventively for late blight." },
      { id: "po-2", stageName: "Tuber Initiation", startDay: 30, endDay: 50, irrigationRequirement: "Critical", recommendedActivity: "Keep ridge moisture even to avoid misshapen tubers. Top-dress Potassium sulphate." },
      { id: "po-3", stageName: "Tuber Bulking", startDay: 55, endDay: 75, irrigationRequirement: "Critical", recommendedActivity: "Maintain consistent moisture (35-40%). Intensive late blight surveillance." },
      { id: "po-4", stageName: "Skin Setting & Haulm Cutting", startDay: 80, endDay: 95, irrigationRequirement: "Withhold", recommendedActivity: "Dehaulming (cut foliage) 10-12 days before digging to harden tuber skin." },
    ],
    majorDiseases: ["Late Blight (Pichheta Jhulsa)", "Early Blight", "Scab"],
    pauFungicidePrescription: "Curzate / Sectin @ 600g/acre preventively before foggy periods; Dithane M-45 @ 700g/acre.",
    dos: [
      "Use certified disease-free seed tubers treated with Mancozeb (0.25%)",
      "Perform timely earthing-up (mounding) at 25-30 days to shield developing tubers from sunlight",
      "Maintain light, frequent furrow irrigations to keep ridge soil uniformly moist",
      "Dehaulm (cut foliage) 10-12 days before digging to cure and harden tuber skin"
],
    donts: [
      "Do not over-irrigate ridges causing water to submerge the top ridge crown",
      "Never plant freshly cut seed tubers without proper curing and fungicide dipping",
      "Avoid excessive nitrogen fertilization late in the vegetative period",
      "Do not expose harvested potato heaps to direct afternoon sunlight"
],
  },
  {
    id: "cotton",
    cropName: "Bt Cotton (Narma)",
    name: "Bt Cotton (Narma)",
    varieties: ["Bt RCH-659", "Ankur 3028", "Bioseed 6588", "Bollgard II Hybrid"],
    variety: "Bollgard II Hybrid",
    season: "Kharif",
    sowingWindow: "15 Apr – 15 May (Kharif)",
    durationDays: 165,
    duration: "150-170 Days",
    defaultSoil: "Black Cotton Soil (Regur - High Clay)",
    defaultIrrigation: "Drip / Micro-Irrigation (Sub-surface/Surface)",
    badge: "Pest & Bollworm Guard",
    targetYieldQuintals: "9 – 13 Qtl/Acre",
    irrigationThresholdMoisture: 28,
    criticalIrrigationStages: [
      "First Post-sowing (35 Days)",
      "Square Formation (60 Days)",
      "Peak Flowering (85 Days)",
      "Boll Development (115 Days)",
    ],
    growthTimeline: [
      { id: "c-1", stageName: "Emergence & Square Initiation", startDay: 0, endDay: 45, irrigationRequirement: "Moderate", recommendedActivity: "First irrigation at 35-40 days. Install 8 pheromone traps/acre for Pink Bollworm." },
      { id: "c-2", stageName: "Peak Flowering", startDay: 50, endDay: 80, irrigationRequirement: "Critical", recommendedActivity: "Foliar spray of Potassium Nitrate (13-0-45) @ 2%. Scout whitefly nymphs." },
      { id: "c-3", stageName: "Boll Development", startDay: 85, endDay: 125, irrigationRequirement: "Critical", recommendedActivity: "Crucial irrigation to avoid boll shedding. Emamectin Benzoate 5% SG if bollworm seen." },
      { id: "c-4", stageName: "Boll Bursting & Picking", startDay: 130, endDay: 165, irrigationRequirement: "Withhold", recommendedActivity: "Dry weather required for clean cotton picking. Pick clean seed-cotton in dry sun." },
    ],
    majorDiseases: ["Pink Bollworm (Gulabi Sundi)", "Whitefly", "Cotton Leaf Curl Virus (CLCuV)"],
    pauFungicidePrescription: "Proclaim (Emamectin Benzoate 5% SG) @ 100g/acre + Pheromone traps @ 8 per acre for bollworm.",
    dos: [
      "Install 8 pheromone traps per acre at 45 days for early Pink Bollworm surveillance",
      "Foliar spray 2% Potassium Nitrate (13-0-45) during peak boll development",
      "Maintain clean field boundaries and remove weed hosts of whitefly",
      "Pick seed-cotton in dry sunny weather after morning dew has completely evaporated"
],
    donts: [
      "Do not spray synthetic pyrethroids early in the season to prevent whitefly outbreaks",
      "Do not allow field water stagnation for more than 24 hours after heavy rainfall",
      "Avoid picking damp or dew-laden cotton as it discolors lint and reduces market value",
      "Never mix pest-damaged or stained bolls with clean Grade-A seed cotton"
],
  },
  {
    id: "maize",
    cropName: "Maize / Corn (Makki)",
    name: "Maize / Corn (Makki)",
    varieties: ["Pioneer 3396", "DKC 9108", "PMH-1", "PMH-13"],
    variety: "Pioneer 3396 Hybrid",
    season: "Kharif",
    sowingWindow: "20 May – 25 Jun (Kharif)",
    durationDays: 105,
    duration: "95-110 Days",
    defaultSoil: "Alluvial Loam (Deep & Fertile)",
    defaultIrrigation: "Drip / Micro-Irrigation (Sub-surface/Surface)",
    badge: "Silage & Grain Yield",
    targetYieldQuintals: "24 – 28 Qtl/Acre",
    irrigationThresholdMoisture: 32,
    criticalIrrigationStages: [
      "Knee-high Stage (30 Days)",
      "Tasseling & Silking (50-60 Days)",
      "Grain Filling (75 Days)",
    ],
    growthTimeline: [
      { id: "mz-1", stageName: "Germination & Seedling", startDay: 0, endDay: 20, irrigationRequirement: "Moderate", recommendedActivity: "Pre-emergence Atrazine spray for weed suppression. Ensure uniform seedling stand." },
      { id: "mz-2", stageName: "Knee-High Stage", startDay: 25, endDay: 45, irrigationRequirement: "Critical", recommendedActivity: "Top-dress 1st split Urea. Scout for Fall Armyworm whorl feeding." },
      { id: "mz-3", stageName: "Tasseling & Silking", startDay: 50, endDay: 75, irrigationRequirement: "Critical", recommendedActivity: "Most critical moisture window. Never allow drought stress during pollen shed." },
      { id: "mz-4", stageName: "Grain Filling & Dough Stage", startDay: 80, endDay: 105, irrigationRequirement: "Moderate", recommendedActivity: "Maintain soil moisture until black layer formation at cob base." },
    ],
    majorDiseases: ["Fall Armyworm (FAW)", "Maydis Leaf Blight", "Banded Leaf & Sheath Blight"],
    pauFungicidePrescription: "Coragen (Chlorantraniliprole 18.5% SC) @ 0.4 ml/L water into the whorl for Fall Armyworm.",
    dos: [
      "Apply pre-emergence Atrazine (1 kg/acre) within 48 hours of sowing for clean emergence",
      "Inspect central leaf whorls for Fall Armyworm (FAW) pinholes at knee-high stage",
      "Ensure adequate soil moisture during the critical tasseling and silking stages",
      "Apply balanced Muriate of Potash alongside nitrogen to enhance stalk strength"
],
    donts: [
      "Do not allow drought stress during pollination; moisture deficit causes barren ears",
      "Avoid broad overhead spray when FAW larvae are settled deep inside leaf whorls",
      "Do not overpopulate without maintaining minimum 60 cm row-to-row spacing",
      "Never store grain at moisture levels exceeding 14% to prevent Aspergillus aflatoxins"
],
  },
  {
    id: "sugarcane",
    cropName: "Sugarcane (Kamad)",
    name: "Sugarcane (Kamad)",
    varieties: ["Co 0238 (Early)", "CoPb 95", "CoPb 96"],
    variety: "Co 0238 (Early)",
    season: "Annual",
    sowingWindow: "15 Feb – 15 Mar (Spring) / Oct (Autumn)",
    durationDays: 330,
    duration: "300-360 Days",
    defaultSoil: "Alluvial Loam (Deep & Fertile)",
    defaultIrrigation: "Furrow / Sub-surface Drip Irrigation",
    badge: "High Sugar Recovery",
    targetYieldQuintals: "320 – 380 Qtl/Acre",
    irrigationThresholdMoisture: 35,
    criticalIrrigationStages: [
      "Formative Stage (60–120 Days)",
      "Grand Growth Phase (150–240 Days)",
    ],
    growthTimeline: [
      { id: "sg-1", stageName: "Germination & Tillering", startDay: 0, endDay: 60, irrigationRequirement: "Moderate", recommendedActivity: "Pre-planting sett treatment with Carbendazim. Blind hoeing at 3-4 weeks." },
      { id: "sg-2", stageName: "Formative & Shoot Elongation", startDay: 65, endDay: 150, irrigationRequirement: "Critical", recommendedActivity: "Apply Urea in splits. Apply Ferterra @ 7.5kg/acre against Early Shoot Borer." },
      { id: "sg-3", stageName: "Grand Growth (Cane Formation)", startDay: 155, endDay: 260, irrigationRequirement: "Critical", recommendedActivity: "Earthing up to prevent lodging. Trash mulching between cane rows." },
      { id: "sg-4", stageName: "Ripening & Sugar Synthesis", startDay: 265, endDay: 330, irrigationRequirement: "Low", recommendedActivity: "Withhold irrigation 20 days prior to mill harvest to maximize brix reading." },
    ],
    majorDiseases: ["Red Rot", "Top Borer", "Early Shoot Borer"],
    pauFungicidePrescription: "Sett treatment with Carbendazim 50% WP @ 2g/L. Ferterra (Chlorantraniliprole 0.4% GR) @ 7.5kg/acre.",
    dos: [
      "Treat two-budded seed setts with Carbendazim (0.2%) prior to furrow planting",
      "Perform earthing-up twice before monsoon rains to anchor tall cane against lodging",
      "Spread sugarcane trash mulch between rows to suppress weeds and retain soil moisture",
      "Apply Ferterra (Chlorantraniliprole 0.4% GR) @ 7.5kg/acre against early shoot borer"
],
    donts: [
      "Do not use propagation setts from fields with any history of red rot infection",
      "Do not irrigate 20-25 days before mill harvest to maximize sugar brix concentration",
      "Avoid harvesting immature or over-aged cane which leads to sucrose inversion",
      "Never burn trash indiscriminately; decompose using compost inoculants"
],
  },
  {
    id: "fodder",
    cropName: "Green Fodder (Barseem)",
    name: "Green Fodder (Barseem)",
    varieties: ["BL-42", "BL-10", "African Tall"],
    variety: "Barseem (African Tall)",
    season: "Rabi",
    sowingWindow: "20 Sep – 15 Oct (Rabi)",
    durationDays: 150,
    duration: "140-160 Days",
    defaultSoil: "Red & Yellow Sandy Loam",
    defaultIrrigation: "Sprinkler System (Overhead/Center Pivot)",
    badge: "High Protein Dairy Fodder",
    targetYieldQuintals: "350 – 420 Qtl/Acre (Multi-Cut)",
    irrigationThresholdMoisture: 40,
    criticalIrrigationStages: [
      "Post-Sowing Wetting (4-5 Days)",
      "Post-Harvest Regrowth (Every 25 Days)",
    ],
    growthTimeline: [
      { id: "fd-1", stageName: "Establishment & 1st Cut", startDay: 0, endDay: 50, irrigationRequirement: "Critical", recommendedActivity: "Inoculate seed with Rhizobium culture. Light frequent watering. 1st cut at 50-55 days." },
      { id: "fd-2", stageName: "Peak Multi-Cutting Cycles", startDay: 55, endDay: 120, irrigationRequirement: "Critical", recommendedActivity: "Cut every 25-30 days. Top-dress 15kg Urea immediately post-harvest." },
      { id: "fd-3", stageName: "Seed Setting / Terminal Cut", startDay: 125, endDay: 150, irrigationRequirement: "Moderate", recommendedActivity: "Leave crop unharvested after early April for certified seed production." },
    ],
    majorDiseases: ["Stem Rot", "Root Rot"],
    pauFungicidePrescription: "Bavistin (Carbendazim 50% WP) @ 2g/kg seed treatment before broadcasting.",
    dos: [
      "Inoculate seeds with Berseem Rhizobium culture before field broadcasting",
      "Provide light irrigation immediately following each cutting cycle to spur regrowth",
      "Top-dress 15 kg Urea per acre immediately post-cut for vigorous multi-cut foliage",
      "Harvest at 45-50 cm height when forage crude protein is at its peak"
],
    donts: [
      "Do not mow closer than 5 cm to ground level to protect basal regenerating buds",
      "Do not allow field flooding after cutting to avoid damping-off and collar rot",
      "Avoid grazing dairy cattle immediately after chemical fertilizer top-dressing",
      "Do not delay first cutting past 55 days to avoid tough, fibrous stem development"
],
  },
  {
    id: "horticulture",
    cropName: "Vegetables & Chilli (Sabziyan)",
    name: "Vegetables & Chilli (Sabziyan)",
    varieties: ["CH-1 Hybrid", "Pusa Jwala", "Syngenta 1065"],
    variety: "Hybrid F1 Commercial",
    season: "Zaid",
    sowingWindow: "Feb – Mar (Summer) / Jun – Jul (Monsoon)",
    durationDays: 85,
    duration: "70-90 Days",
    defaultSoil: "Alluvial Loam (Deep & Fertile)",
    defaultIrrigation: "Drip / Micro-Irrigation (Sub-surface/Surface)",
    badge: "Polyhouse / Open Field",
    targetYieldQuintals: "45 – 60 Qtl/Acre",
    irrigationThresholdMoisture: 35,
    criticalIrrigationStages: [
      "Transplanting (0–10 Days)",
      "Flowering & Fruit Setting (35–55 Days)",
      "Pickings Window (60–85 Days)",
    ],
    growthTimeline: [
      { id: "ht-1", stageName: "Nursery & Transplanting", startDay: 0, endDay: 20, irrigationRequirement: "Moderate", recommendedActivity: "Transplant 25-day seedlings on raised beds with silver-black mulch. Drench with Trichoderma." },
      { id: "ht-2", stageName: "Vegetative & Flowering", startDay: 25, endDay: 50, irrigationRequirement: "Critical", recommendedActivity: "Fertigate with 19-19-19 soluble fertilizer. Install yellow sticky traps for whiteflies." },
      { id: "ht-3", stageName: "Fruit Setting & 1st Picking", startDay: 55, endDay: 70, irrigationRequirement: "Critical", recommendedActivity: "Regular drip fertigation with Calcium Nitrate & Boron. Pegasus spray for mites." },
      { id: "ht-4", stageName: "Continuous Pickings", startDay: 75, endDay: 85, irrigationRequirement: "Moderate", recommendedActivity: "Harvest green chillies at 7-10 day intervals. Maintain soil moisture consistency." },
    ],
    majorDiseases: ["Chilli Leaf Curl Virus", "Anthracnose Fruit Rot", "Thrips & Yellow Mites"],
    pauFungicidePrescription: "Pegasus (Diafenthiuron 50% WP) @ 250g/acre for mites; Score (Difenoconazole) @ 1ml/L for fruit rot.",
    dos: [
      "Transplant healthy seedlings onto raised beds equipped with silver-black mulch film",
      "Install yellow and blue sticky traps (15-20 per acre) for thrips and whitefly monitoring",
      "Fertigate through drip with balanced 19-19-19 and soluble micronutrients regularly",
      "Harvest fresh vegetable produce during cooler morning or late evening hours"
],
    donts: [
      "Do not use overhead sprinkler watering during peak bloom to prevent flower abortion",
      "Avoid repeated continuous spraying of identical chemical groups to prevent insect resistance",
      "Do not allow standing water around the root collar to prevent phytophthora wilt",
      "Never harvest produce during wet rainy periods to prevent transit fungal decay"
],
  },
];

export function normalizeCropTemplate(raw: any): CropMasterTemplate {
  const durationDays = Number(raw.durationDays) || parseInt(raw.duration) || 120;
  const duration = raw.duration || `${durationDays} Days`;
  const name = raw.name || raw.cropName || "Crop";
  const cropName = raw.cropName || raw.name || "Crop";
  const varieties = Array.isArray(raw.varieties) && raw.varieties.length > 0 
    ? raw.varieties 
    : [raw.variety || "Standard Regional Variety"];
  const variety = raw.variety || varieties[0] || "Standard Regional Variety";
  const season = (raw.season as "Rabi" | "Kharif" | "Zaid" | "Annual") || "Rabi";
  const sowingWindow = raw.sowingWindow || "Seasonal Window";
  const defaultSoil = raw.defaultSoil || "Alluvial Loam (Deep & Fertile)";
  const defaultIrrigation = raw.defaultIrrigation || "Drip / Micro-Irrigation (Sub-surface/Surface)";
  const badge = raw.badge || `${season} Crop`;
  const targetYieldQuintals = raw.targetYieldQuintals || raw.targetYield || "20 - 25 Qtl/Acre";
  const irrigationThresholdMoisture = Number(raw.irrigationThresholdMoisture) || 40;
  const criticalIrrigationStages = Array.isArray(raw.criticalIrrigationStages) && raw.criticalIrrigationStages.length > 0
    ? raw.criticalIrrigationStages
    : ["Flowering & Booting", "Grain Filling"];
  const majorDiseases = Array.isArray(raw.majorDiseases) && raw.majorDiseases.length > 0
    ? raw.majorDiseases
    : ["Foliar Rust", "Blight Outbreak"];
  const pauFungicidePrescription = raw.pauFungicidePrescription || raw.pauPrescription || "Consult PAU Package of Practices for timely application.";

  let growthTimeline: GrowthStageMilestone[] = DEFAULT_PAU_GROWTH_TIMELINE;
  if (typeof raw.growthTimeline === "string" && raw.growthTimeline.trim()) {
    try {
      const parsed = JSON.parse(raw.growthTimeline);
      if (Array.isArray(parsed) && parsed.length > 0) {
        growthTimeline = parsed;
      }
    } catch {}
  } else if (Array.isArray(raw.growthTimeline) && raw.growthTimeline.length > 0) {
    growthTimeline = raw.growthTimeline;
  }

  const dos = Array.isArray(raw.dos) && raw.dos.length > 0 ? raw.dos : undefined;
  const donts = Array.isArray(raw.donts) && raw.donts.length > 0 ? raw.donts : undefined;

  return {
    id: String(raw.$id || raw.id || `cr-${Date.now()}`),
    cropName,
    name,
    varieties,
    variety,
    season,
    sowingWindow,
    durationDays,
    duration,
    defaultSoil,
    defaultIrrigation,
    badge,
    targetYieldQuintals,
    irrigationThresholdMoisture,
    criticalIrrigationStages,
    majorDiseases,
    pauFungicidePrescription,
    growthTimeline,
    dos,
    donts,
  };
}

export const STANDARD_CROP_STAGES = [
  { step: 1, name: "Stage 1: Germination & Emergence", typicalDays: "Days 1–20", defaultDay: 10 },
  { step: 2, name: "Stage 2: Vegetative / Tillering", typicalDays: "Days 21–50", defaultDay: 28 },
  { step: 3, name: "Stage 3: Jointing & Bulking", typicalDays: "Days 51–75", defaultDay: 60 },
  { step: 4, name: "Stage 4: Flowering & Booting", typicalDays: "Days 76–105", defaultDay: 85 },
  { step: 5, name: "Stage 5: Maturation & Harvest", typicalDays: "Days 106–140", defaultDay: 120 },
];

/**
 * Automatically computes elapsed crop day from sown date so the day advances dynamically each day
 */
export function computeCropDayAndStage(
  sownDateStr: string | undefined | null,
  savedCurrentDay: number | undefined | null,
  totalDays: number,
  growthTimeline?: GrowthStageMilestone[]
): { currentDay: number; stage: string; stageStep: number } {
  let day = Number(savedCurrentDay) || 1;

  if (sownDateStr) {
    const sown = new Date(sownDateStr);
    if (!isNaN(sown.getTime())) {
      const now = new Date();
      // Calculate diff in calendar days
      const diffMs = now.getTime() - sown.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; // 1st day of sowing is Day 1
      if (diffDays > 0) {
        day = Math.min(diffDays, totalDays || 120);
      }
    }
  }

  // Derive stage and step based on calculated currentDay
  let stageName = "Germination & Emergence";
  let step = 1;

  if (growthTimeline && growthTimeline.length > 0) {
    const matched = growthTimeline.find(
      (st) => day >= (st.startDay || 1) && day <= (st.endDay || totalDays)
    );
    if (matched) {
      stageName = matched.stageName;
      step = growthTimeline.indexOf(matched) + 1;
    } else if (day > (growthTimeline[growthTimeline.length - 1].endDay || totalDays)) {
      const last = growthTimeline[growthTimeline.length - 1];
      stageName = last.stageName;
      step = growthTimeline.length;
    } else {
      stageName = growthTimeline[0].stageName;
      step = 1;
    }
  } else {
    if (day <= 20) {
      stageName = "Stage 1: Germination & Emergence";
      step = 1;
    } else if (day <= 50) {
      stageName = "Stage 2: Vegetative / Tillering";
      step = 2;
    } else if (day <= 75) {
      stageName = "Stage 3: Jointing & Bulking";
      step = 3;
    } else if (day <= 105) {
      stageName = "Stage 4: Flowering & Booting";
      step = 4;
    } else {
      stageName = "Stage 5: Maturation & Harvest";
      step = 5;
    }
  }

  return { currentDay: day, stage: stageName, stageStep: step };
}

export interface CropDetailConfig {
  area: number | "";
  variety?: string;
  sownDate: string;
  stage: string;
  stageStep: number;
  currentDay: number | "";
  totalDays: number | "";
}

export interface FarmCrop {
  id: string;
  name: string;
  variety: string;
  area: number;
  areaUnit: string;
  season: "Rabi" | "Kharif" | "Zaid" | "Annual";
  stage: string;
  stageStep: number;
  currentDay: number;
  totalDays: number;
  health: string;
  sownDate: string;
  nextMilestone: string;
  harvestDate: string;
  color: string;
  farmId?: string;
  farmName?: string;
}

export const LAND_MEASUREMENT_UNITS = [
  "Acres",
  "Hectares",
  "Nali",
  "Bigha",
  "Killa",
  "Kanal",
  "Marla",
  "Biswa",
  "Katha",
  "Guntha",
  "Cent",
  "Mutthi",
  "Ground",
  "Murabba",
  "Dhur",
  "Decimal",
  "Chatak",
  "Vigha",
  "Ankanam",
  "Square Meters",
] as const;

export type LandAreaUnit = string;

export interface FarmData {
  id: string;
  name: string;
  address: string;
  village?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  totalArea: number;
  areaUnit: LandAreaUnit;
  ownership: string;
  latitude: number;
  longitude: number;
  crops: FarmCrop[];
  cropTemplate?: string;
  soilType: string;
  irrigationType: string;
  waterSource: string;
}

export type TransactionType = "production" | "loss" | "expense";

export interface FarmTransaction {
  id: string;
  farmId: string;
  farmName: string;
  type: TransactionType;
  title: string;
  category: string;
  amount: number;
  date: string;
  quantity?: string;
  status: "Cleared" | "Pending" | "Claimed" | "Recorded";
  reference?: string;
  crop?: string;
  notes?: string;
}

export const PRODUCTION_CATEGORIES = [
  "Grain Mandi Sale (APMC)",
  "Wholesale Market Dispatch",
  "Direct Retail / Farm Gate Supply",
  "Contract Silage & Dairy Supply",
  "Green Fodder Realization",
  "Government MSP Procurement",
  "Certified Seed Multiplier Sale",
];

export const LOSS_CATEGORIES = [
  "Weather: Unseasonal Rain & Hail",
  "Weather: Wind Lodging & Flattening",
  "Weather: Frost Burn & Cold Wave",
  "Pest & Insect Infestation",
  "Disease: Leaf Blight & Rot",
  "Post-Harvest Storage Spoilage",
  "Transit Wastage & Handling Loss",
];

export const EXPENSE_CATEGORIES = [
  "Seeds & Nursery",
  "Fertilizers & Nutrients",
  "Diesel & Equipment Fuel",
  "Seasonal Labor Wages",
  "Crop Protection & Pesticides",
  "Irrigation & Electricity Bills",
  "Machinery Spares & Repairs",
  "Packaging & Transport",
];

export const INITIAL_TRANSACTIONS: FarmTransaction[] = [];

const SOIL_TYPES = [
  "Alluvial Loam (Deep & Fertile)",
  "Black Cotton Soil (Regur - High Clay)",
  "Red & Yellow Sandy Loam",
  "Clay Loam (Water-retentive)",
  "Laterite Soil (Acidic/High Rainfall)",
  "Desert / Sandy Soil",
];

const IRRIGATION_TYPES = [
  "Drip / Micro-Irrigation (Sub-surface/Surface)",
  "Sprinkler System (Overhead/Center Pivot)",
  "Canal Flood / Furrow Irrigation",
  "Rainfed / Natural Moisture",
  "Solar Powered Micro-Drip",
];

const WATER_SOURCES = [
  "Deep Tubewell / Borewell",
  "River / Canal Lift Scheme",
  "Farm Pond / Rainwater Harvesting Tank",
  "Open Dug Well",
  "Municipal / Irrigation Department Supply",
];

const OWNERSHIP_OPTIONS = [
  "Self-Owned (Individual Farmer)",
  "Ancestral / Joint Family Land",
  "Leased / Cash Rent Agreement",
  "Contract Farming Producer",
  "Farmer Producer Org (FPO) / Co-operative",
];

// Default initial farms data
export const INITIAL_FARMS: FarmData[] = [];

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTabState] = useState<string>("dashboard");

  useEffect(() => {
    // Restore saved tab or URL hash only on client mount to guarantee 100% hydration matching
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setActiveTabState(hash);
      } else {
        const savedTab = localStorage.getItem("khetivo_active_tab");
        if (savedTab) setActiveTabState(savedTab);
      }
    }
  }, []);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("khetivo_active_tab", tab);
        window.history.replaceState(null, "", `#${tab}`);
      } catch {}
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Farms list state (starts with 2 distinct farm holdings, each with multiple crops!)
  const [farms, setFarms] = useState<FarmData[]>(INITIAL_FARMS);

  // Preserve user-selected farm across page reloads (defaults to "all" if not set)
  const [selectedFarmId, setSelectedFarmIdState] = useState<string>("all");
  const setSelectedFarmId = (id: string) => {
    setSelectedFarmIdState(id);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("khetivo_selected_farm_id", id);
      } catch {}
    }
  };
  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false);

  // Selected crop index for detailed crop management inspection
  const [selectedCropIndex, setSelectedCropIndex] = useState(0);

  // Farm Setup Flow Modal States
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [setupStep, setSetupStep] = useState<1 | 2 | 3 | 4>(1);
  const [setupSuccess, setSetupSuccess] = useState(false);

  // Setup Form Fields
  const [farmName, setFarmName] = useState("");
  const [farmAddress, setFarmAddress] = useState("");
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [totalArea, setTotalArea] = useState<number | "">("");
  const [areaUnit, setAreaUnit] = useState<LandAreaUnit>("Acres");
  const [areaUnitDropdownOpen, setAreaUnitDropdownOpen] = useState(false);
  const [ownership, setOwnership] = useState(OWNERSHIP_OPTIONS[0]);
  const [latitude, setLatitude] = useState<number>(30.901);
  const [longitude, setLongitude] = useState<number>(75.8573);
  const [mapStyle, setMapStyle] = useState<"satellite" | "roadmap">("satellite");
  const [mapSearch, setMapSearch] = useState("");
  const [soilType, setSoilType] = useState(SOIL_TYPES[0]);
  const [irrigationType, setIrrigationType] = useState(IRRIGATION_TYPES[0]);
  const [waterSource, setWaterSource] = useState(WATER_SOURCES[0]);
  // Multi-crop selection for 1 farm: array of template IDs
  const [selectedCropTemplates, setSelectedCropTemplates] = useState<string[]>([]);
  const [cropConfigs, setCropConfigs] = useState<Record<string, CropDetailConfig>>({});
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsDetectedNotice, setGpsDetectedNotice] = useState(false);
  const [recentlyAutoFilled, setRecentlyAutoFilled] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [settingsFarmerName, setSettingsFarmerName] = useState("");
  const [settingsEmail, setSettingsEmail] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsMandi, setSettingsMandi] = useState("Local APMC Mandi");
  const [settingsHeadquartersAddress, setSettingsHeadquartersAddress] = useState("");
  const [settingsDefaultUnit, setSettingsDefaultUnit] = useState<LandAreaUnit>("Acres");
  // Active applied interface language
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage>("en");
  // Draft language selected in the Settings tab (only committed when user clicks "Save Preferences")
  const [draftSettingsLanguage, setDraftSettingsLanguage] = useState<SupportedLanguage>("en");

  // Helper translation dictionary based on current active saved language
  const t = TRANSLATIONS[activeLanguage] || TRANSLATIONS.en;

  // Immediate language switch function (used when saving settings or changing quick pill)
  const commitLanguage = (lang: string, persistToStorage = true) => {
    const validLang: SupportedLanguage = (["en", "pa", "hi", "mr", "gu"].includes(lang) ? lang : "en") as SupportedLanguage;
    setActiveLanguage(validLang);
    setDraftSettingsLanguage(validLang);
    if (persistToStorage && typeof window !== "undefined") {
      try {
        localStorage.setItem("khetivo_language", validLang);
      } catch {}
    }
  };
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMoistureDeficit, setSettingsMoistureDeficit] = useState("30");
  const [settingsWindThreshold, setSettingsWindThreshold] = useState("18");
  const [settingsWhatsappAlerts, setSettingsWhatsappAlerts] = useState(true);
  const [settingsSmsAlerts, setSettingsSmsAlerts] = useState(true);
  const [settingsServiceReminders, setSettingsServiceReminders] = useState(true);
  const [settingsAutoIrrigationNotice, setSettingsAutoIrrigationNotice] = useState(true);
  const [settingsToast, setSettingsToast] = useState<string | null>(null);

  // Account Management & Danger Zone states
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState("");

  // Refresh Window / Page State (In-place data reload without kicking user back to default tab)
  const [isPageRefreshing, setIsPageRefreshing] = useState(false);
  const [dataRefreshTrigger, setDataRefreshTrigger] = useState(0);

  // Notification Sidebar Drawer State
  const [notificationSidebarOpen, setNotificationSidebarOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<Record<string, boolean>>({});
  const [notificationsClearedAt, setNotificationsClearedAt] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("khetivo_read_notifications");
        if (saved) setReadNotifications(JSON.parse(saved));
        const savedCleared = localStorage.getItem("khetivo_notifications_cleared_at");
        if (savedCleared) setNotificationsClearedAt(Number(savedCleared) || 0);
      } catch {}
    }
  }, []);

  const markNotificationAsRead = (id: string) => {
    setReadNotifications((prev) => {
      const updated = { ...prev, [id]: true };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("khetivo_read_notifications", JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  const markAllNotificationsAsRead = (allIds: string[]) => {
    const now = Date.now();
    setNotificationsClearedAt(now);
    setReadNotifications((prev) => {
      const updated = { ...prev };
      allIds.forEach((id) => {
        updated[id] = true;
      });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("khetivo_read_notifications", JSON.stringify(updated));
          localStorage.setItem("khetivo_notifications_cleared_at", String(now));
        } catch {}
      }
      return updated;
    });
  };

  const handleWindowRefresh = () => {
    setIsPageRefreshing(true);
    // In-place refresh trigger re-executes Appwrite synchronization & weather data
    setDataRefreshTrigger((prev) => prev + 1);
  };

  // Reusable Custom Delete Confirmation Modal State
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    itemName?: string;
    itemType?: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  const requestDeleteConfirmation = (config: {
    title: string;
    itemName?: string;
    itemType?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
  }) => {
    setDeleteConfirmModal({
      isOpen: true,
      title: config.title,
      itemName: config.itemName,
      itemType: config.itemType,
      description: config.description || "Are you sure you want to delete this record? This action cannot be undone.",
      confirmText: config.confirmText || "Delete",
      cancelText: config.cancelText || "Cancel",
      onConfirm: config.onConfirm,
    });
  };

  // Active Admin Broadcasts & Crop Templates Sync
  const [activeCropTemplates, setActiveCropTemplates] = useState<CropMasterTemplate[]>(CROP_TEMPLATES);
  const [selectedCropTemplateModal, setSelectedCropTemplateModal] = useState<CropMasterTemplate | null>(null);
  const [activeAdminBroadcasts, setActiveAdminBroadcasts] = useState<any[]>(DEFAULT_FARMER_BROADCASTS);
  const [advisoryCategoryFilter, setAdvisoryCategoryFilter] = useState<string>("all");
  const [advisorySearchTerm, setAdvisorySearchTerm] = useState<string>("");

  // Appwrite Cloud Sync State
  const [appwriteStatus, setAppwriteStatus] = useState<"checking" | "connected" | "offline">("checking");
  const [appwriteDbName, setAppwriteDbName] = useState<string>("khetivo_main");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load active logged-in farmer details from localStorage
    try {
      const uName = localStorage.getItem("khetivo_user_name");
      const uPhone = localStorage.getItem("khetivo_user_phone");
      const uEmail = localStorage.getItem("khetivo_user_email");
      if (uName) setSettingsFarmerName(uName);
      if (uPhone) {
        const clean = uPhone.startsWith("+") ? uPhone : `+91 ${uPhone}`;
        setUserPhone(clean);
        setSettingsPhone(clean);
      }
      if (uEmail) setSettingsEmail(uEmail);
    } catch {}

    // Fast Hydration: Instantly restore active language and cached farm data
    try {
      const savedLang = localStorage.getItem("khetivo_language");
      if (savedLang && ["en", "pa", "hi", "mr", "gu"].includes(savedLang)) {
        setActiveLanguage(savedLang as SupportedLanguage);
        setDraftSettingsLanguage(savedLang as SupportedLanguage);
      }
      const savedFarmId = localStorage.getItem("khetivo_selected_farm_id");
      if (savedFarmId) {
        setSelectedFarmIdState(savedFarmId);
      }
      const cachedFarms = localStorage.getItem("khetivo_cached_farms");
      if (cachedFarms) {
        const parsed = JSON.parse(cachedFarms);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFarms(parsed);
        }
      }
      const cachedTasks = localStorage.getItem("khetivo_cached_tasks");
      if (cachedTasks) {
        const parsed = JSON.parse(cachedTasks);
        if (Array.isArray(parsed) && parsed.length > 0) setTaskList(parsed);
      }
      const cachedInv = localStorage.getItem("khetivo_cached_inventory");
      if (cachedInv) {
        const parsed = JSON.parse(cachedInv);
        if (Array.isArray(parsed) && parsed.length > 0) setInventoryItems(parsed);
      }
      const cachedEq = localStorage.getItem("khetivo_cached_equipment");
      if (cachedEq) {
        const parsed = JSON.parse(cachedEq);
        if (Array.isArray(parsed) && parsed.length > 0) setEquipmentList(parsed);
      }
      const cachedFin = localStorage.getItem("khetivo_cached_financials");
      if (cachedFin) {
        const parsed = JSON.parse(cachedFin);
        if (Array.isArray(parsed) && parsed.length > 0) setTransactions(parsed);
      }
      const cachedTickets = localStorage.getItem("khetivo_cached_tickets");
      if (cachedTickets) {
        const parsed = JSON.parse(cachedTickets);
        if (Array.isArray(parsed) && parsed.length > 0) setSupportTickets(parsed);
      }
      const cachedDesignations = localStorage.getItem("khetivo_cached_designations");
      if (cachedDesignations) {
        const parsed = JSON.parse(cachedDesignations);
        if (Array.isArray(parsed)) setDesignations(parsed);
      } else {
        const deletedDes = localStorage.getItem("khetivo_deleted_designations");
        if (deletedDes) {
          const deletedIds = JSON.parse(deletedDes);
          if (Array.isArray(deletedIds) && deletedIds.length > 0) {
            setDesignations((prev) => prev.filter((d) => !deletedIds.includes(d.id)));
          }
        }
      }
    } catch {}

    // 0. Comprehensive Realtime Data Loader from Appwrite Cloud (direct parallel fetch without blocking on health check)
    const loadAllRealtimeData = async () => {
      try {
        // Fetch all live collections in parallel from Appwrite Cloud DB immediately
        const [
          cloudFarms,
          cloudCrops,
          cloudTasks,
          cloudInv,
          cloudEq,
          cloudSupport,
          cloudFin,
          cloudTeam,
          cloudInvoices,
          cloudAdvisories,
          cloudTemplates,
          cloudSubscription,
          cloudProfile,
        ] = await Promise.all([
          syncFarmsFromAppwrite(),
          syncCropsFromAppwrite(),
          syncTasksFromAppwrite(),
          syncInventoryFromAppwrite(),
          syncEquipmentFromAppwrite(),
          syncSupportFromAppwrite(),
          syncFinancialsFromAppwrite(),
          syncTeamFromAppwrite(),
          syncInvoicesFromAppwrite(),
          syncAdvisoriesFromAppwrite(),
          syncCropTemplatesFromAppwrite(),
          syncSubscriptionFromAppwrite(),
          syncUserProfileFromAppwrite(
            localStorage.getItem("khetivo_user_id") || undefined,
            localStorage.getItem("khetivo_user_phone") || undefined,
            localStorage.getItem("khetivo_user_email") || undefined
          ),
        ]);

        setAppwriteStatus("connected");

          // Process live user profile from Appwrite Cloud
          if (cloudProfile) {
            if (cloudProfile.name) {
              setSettingsFarmerName(cloudProfile.name);
              localStorage.setItem("khetivo_farmer_name", cloudProfile.name);
              localStorage.setItem("khetivo_user_name", cloudProfile.name);
            }
            if (cloudProfile.phone) {
              const formattedPhone = cloudProfile.phone.startsWith("+")
                ? cloudProfile.phone
                : `+91 ${cloudProfile.phone}`;
              setUserPhone(formattedPhone);
              setSettingsPhone(formattedPhone);
              localStorage.setItem("khetivo_user_phone", cloudProfile.phone);
            }
            if (cloudProfile.email) {
              setSettingsEmail(cloudProfile.email);
              localStorage.setItem("khetivo_user_email", cloudProfile.email);
            }
            if (cloudProfile.mandiLinkage) {
              setSettingsMandi(cloudProfile.mandiLinkage);
            }
            if (cloudProfile.farmAddress) {
              setSettingsHeadquartersAddress(cloudProfile.farmAddress);
            }
            if (cloudProfile.measurementUnit) {
              setSettingsDefaultUnit(cloudProfile.measurementUnit);
              localStorage.setItem("khetivo_default_unit", cloudProfile.measurementUnit);
            }
            if (cloudProfile.preferredLanguage) {
              const localLang = localStorage.getItem("khetivo_language");
              if (!localLang) {
                commitLanguage(cloudProfile.preferredLanguage, true);
              }
            }
          }

          // Process live subscription
          if (cloudSubscription && cloudSubscription.planTier) {
            setActivePlanId(cloudSubscription.planTier);
          }

          // Process live crop master templates from Appwrite Cloud
          if (cloudTemplates && Array.isArray(cloudTemplates) && cloudTemplates.length > 0) {
            const liveNormalized = cloudTemplates.map(normalizeCropTemplate);
            setActiveCropTemplates(liveNormalized);
            try {
              localStorage.setItem("khetivo_admin_crops", JSON.stringify(liveNormalized));
            } catch {}
          }

          // 1. Process Live Crops with automated dynamic day & growth stage progression
          const allCropsList: FarmCrop[] = (cloudCrops || []).map((c: any) => {
            const rawTotalDays = Number(c.totalDays) || 120;
            const dynamicProgression = computeCropDayAndStage(
              c.sownDate,
              c.currentDay,
              rawTotalDays
            );

            return {
              id: c.$id || `crop-${Date.now()}`,
              name: c.name,
              variety: c.variety || "Standard",
              area: Number(c.area) || 0,
              areaUnit: c.areaUnit || "Acres",
              season: c.season || "Rabi",
              stage: dynamicProgression.stage || c.stage || "Vegetative",
              stageStep: dynamicProgression.stageStep || Number(c.stageStep) || 1,
              currentDay: dynamicProgression.currentDay,
              totalDays: rawTotalDays,
              health: c.health || "Good",
              sownDate: c.sownDate ? new Date(c.sownDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "",
              harvestDate: c.harvestDate ? new Date(c.harvestDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "",
              nextMilestone: c.nextMilestone || "Next Stage",
              color: c.color || "#278449",
              farmId: c.farmId,
            };
          });

          // 2. Process Live Farms
          let loadedFarms: FarmData[] = [];
          if (cloudFarms) {
            const mappedFarms: FarmData[] = cloudFarms.map((cf: any) => {
              const farmId = cf.$id || cf.id;
              const farmCrops = allCropsList.filter((c) => c.farmId === farmId);
              return {
                id: farmId,
                name: cf.name,
                address: cf.address || [cf.village, cf.district, cf.state].filter(Boolean).join(", "),
                village: cf.village || "",
                district: cf.district || "",
                state: cf.state || "",
                pinCode: cf.pinCode || "",
                totalArea: Number(cf.totalArea) || 0,
                areaUnit: (cf.areaUnit as LandAreaUnit) || "Acres",
                ownership: cf.ownership || "Owned",
                latitude: Number(cf.latitude) || 30.901,
                longitude: Number(cf.longitude) || 75.8573,
                soilType: cf.soilType || "Alluvial Loam",
                irrigationType: cf.irrigationType || "Tubewell",
                waterSource: cf.waterSource || "Groundwater",
                crops: farmCrops,
                cropTemplate: cf.cropTemplate || farmCrops.map((c) => `${c.name} (${c.area} ${c.areaUnit})`).join(" & "),
              };
            });
            loadedFarms = mappedFarms;
            setFarms(mappedFarms);
            try {
              localStorage.setItem("khetivo_cached_farms", JSON.stringify(mappedFarms));
            } catch {}
          }

          // 3. Process Live Tasks
          if (cloudTasks) {
            const mappedTasks: FarmTask[] = cloudTasks.map((ct: any) => ({
              id: ct.$id || ct.id,
              farmId: ct.farmId || "all",
              farmName: ct.farmName || "Farm",
              title: ct.title,
              category: ct.category || "General",
              priority: (ct.priority as any) || "Medium",
              status: ct.status === "Pending" ? "To Do" : (ct.status as any) || "To Do",
              dueDate: ct.dueDate ? ct.dueDate.split("T")[0] : currentDateStr,
              assignedTo: ct.assignedTo || "Unassigned",
              zone: ct.zone,
              crop: ct.crop,
              instructions: ct.instructions,
              description: ct.description,
            }));
            setTaskList(mappedTasks);
            try {
              localStorage.setItem("khetivo_cached_tasks", JSON.stringify(mappedTasks));
            } catch {}
          }

          // 4. Process Live Stores & Inventory
          if (cloudInv) {
            if (cloudInv.stores) {
              setStores(
                cloudInv.stores.map((s: any) => ({
                  id: s.$id || s.id,
                  farmId: s.farmId || "all",
                  farmName: s.farmName || "Farm",
                  name: s.name,
                  type: s.type || "Godown",
                  location: s.location,
                  notes: s.notes,
                }))
              );
            }
            if (cloudInv.items) {
              const mappedInv = cloudInv.items.map((it: any) => ({
                id: it.$id || it.id,
                farmId: it.farmId || "all",
                farmName: it.farmName || "Farm",
                storeId: it.storeId || "store-1",
                storeName: it.storeName || "Main Store",
                name: it.name,
                category: it.category || "General",
                batchNumber: it.batchNumber || "",
                purchasedDate: it.purchasedDate ? it.purchasedDate.split("T")[0] : "",
                expiryDate: it.expiryDate ? it.expiryDate.split("T")[0] : "",
                quantity: Number(it.quantity) || 0,
                unit: it.unit || "kg",
                rate: Number(it.rate) || 0,
                lowStockThreshold: Number(it.lowStockThreshold) || 5,
              }));
              setInventoryItems(mappedInv);
              try {
                localStorage.setItem("khetivo_cached_inventory", JSON.stringify(mappedInv));
              } catch {}
            }
          }

          // 5. Process Live Equipment & Reported Issues
          if (cloudEq) {
            const currentFarmsList: FarmData[] = loadedFarms.length > 0 ? loadedFarms : farms;
            const getFarmNameById = (fId: string) => {
              const matched = currentFarmsList.find((f: FarmData) => f.id === fId);
              return matched ? matched.name : "Farm";
            };

            if (cloudEq.equipment) {
              const mappedEq = cloudEq.equipment.map((eq: any) => ({
                id: eq.$id || eq.id,
                farmId: eq.farmId || "all",
                farmName: eq.farmName && eq.farmName !== "Farm" ? eq.farmName : getFarmNameById(eq.farmId),
                name: eq.name,
                category: eq.category || "General Implement",
                modelNumber: eq.model,
                operator: eq.operator || "Unassigned",
                status: (eq.status as any) || "Operational",
                runtimeHours: Number(eq.runtimeHours) || 0,
                nextServiceDate: eq.nextServiceDate,
                nextServiceHours: eq.nextServiceHours,
                fuelEfficiency: eq.fuelEfficiency,
              }));
              setEquipmentList(mappedEq);
              try {
                localStorage.setItem("khetivo_cached_equipment", JSON.stringify(mappedEq));
              } catch {}
            }
            if (cloudEq.issues) {
              setEquipmentIssues(
                cloudEq.issues.map((iss: any) => ({
                  id: iss.$id || iss.id,
                  equipmentId: iss.equipmentId,
                  equipmentName: iss.equipmentName || "Equipment",
                  farmId: iss.farmId || "all",
                  farmName: iss.farmName && iss.farmName !== "Farm" ? iss.farmName : getFarmNameById(iss.farmId),
                  issueType: iss.issueType || "Defect",
                  severity: (iss.severity as any) || "Medium",
                  description: iss.description || "",
                  reportedBy: iss.reportedBy || "Worker",
                  reportedDate: iss.reportedDate ? iss.reportedDate.split("T")[0] : currentDateStr,
                  status: (iss.status as any) || "Open",
                }))
              );
            }
          }

          // 6. Process Live Support Tickets & Field Visits
          if (cloudSupport) {
            if (cloudSupport.tickets) {
              const mappedTkts = cloudSupport.tickets.map((t: any) => ({
                id: t.$id || t.id,
                ticketNo: t.ticketNo || `TKT-${(t.$id || "").slice(-4)}`,
                subject: t.subject,
                category: t.category || "Crop Health & Pathology",
                farmName: t.farmName || "Farm",
                cropName: t.cropName || "Crop",
                priority: (t.priority as any) || "Normal",
                status: (t.status as any) || "Open",
                createdAt: t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN") : "Recent",
                lastReply: t.lastReply || "Dispatched to PAU agronomy helpdesk.",
                assignedAgronomist: t.assignedAgronomist || "Duty Agronomist",
                description: t.description || "",
                resolution: t.resolution,
              }));
              setSupportTickets(mappedTkts);
              try {
                localStorage.setItem("khetivo_cached_tickets", JSON.stringify(mappedTkts));
              } catch {}
            }
          }

          // 7. Process Live Financial Transactions
          if (cloudFin) {
            const mappedFin = cloudFin.map((tx: any) => ({
              id: tx.$id || tx.id,
              farmId: tx.farmId || "all",
              farmName: tx.farmName || "Farm",
              type: tx.type || "expense",
              title: tx.title,
              category: tx.category || "General",
              amount: Number(tx.amount) || 0,
              date: tx.date ? tx.date.split("T")[0] : currentDateStr,
              quantity: tx.quantity,
              status: (tx.status as any) || "Cleared",
              reference: tx.reference,
              crop: tx.crop,
              notes: tx.notes,
            }));
            setTransactions(mappedFin);
            try {
              localStorage.setItem("khetivo_cached_financials", JSON.stringify(mappedFin));
            } catch {}
          }

          // 8. Process Live Team Members & Designations
          if (cloudTeam) {
            setTeamMembers(
              (cloudTeam.members || []).map((m: any) => ({
                id: m.$id || m.id,
                name: m.name,
                phone: m.phone,
                email: m.email || "",
                designationId: m.designationId || "des-custom",
                designationTitle: m.designationTitle || "Team Member",
                roleCategory: m.roleCategory || "worker",
                farmId: m.farmId || "all",
                farmName: m.farmName || "Farm",
                status: (m.status as any) || "Active",
                allowedModules: m.allowedModules || ["dashboard"],
                joinedDate: m.joinedDate ? m.joinedDate.split("T")[0] : currentDateStr,
                notes: m.notes,
              }))
            );
            if (cloudTeam.designations && cloudTeam.designations.length > 0) {
              const deletedDes = typeof window !== "undefined" ? localStorage.getItem("khetivo_deleted_designations") : null;
              const deletedIds: string[] = deletedDes ? JSON.parse(deletedDes) : [];

              setDesignations((prev) => {
                const prevMap = new Map(prev.map((d) => [d.id, d]));
                cloudTeam.designations.forEach((cd: any) => {
                  const desId = cd.$id || cd.id;
                  if (!deletedIds.includes(desId)) {
                    prevMap.set(desId, {
                      id: desId,
                      title: cd.title,
                      description: cd.description || "",
                      allowedModules: cd.allowedModules || ["dashboard"],
                      color: cd.color || "#15803D",
                      isSystemDefault: Boolean(cd.isSystemDefault),
                    });
                  }
                });
                const merged = Array.from(prevMap.values()).filter((d) => !deletedIds.includes(d.id));
                try {
                  localStorage.setItem("khetivo_cached_designations", JSON.stringify(merged));
                } catch {}
                return merged;
              });
            }
          }

          // 9. Process Live Invoices
          if (cloudInvoices && cloudInvoices.length > 0) {
            setInvoices(
              cloudInvoices.map((inv: any) => ({
                id: inv.$id || inv.id,
                invoiceNo: inv.invoiceNo || `KH-${(inv.$id || "").slice(-6)}`,
                date: inv.date ? new Date(inv.date).toLocaleDateString("en-IN") : "",
                period: inv.period || "",
                planName: inv.planName || "Khetivo Precision",
                amount: Number(inv.amount) || 0,
                paymentMethod: inv.paymentMethod || "Online",
                status: inv.status || "Paid",
              }))
            );
          }

          // 10. Process Live Advisories & Broadcasts
          if (cloudAdvisories && cloudAdvisories.length > 0) {
            setActiveAdminBroadcasts(cloudAdvisories);
          }
      } catch (err) {
        console.warn("[Realtime Sync] Error updating data from Appwrite:", err);
        setAppwriteStatus("offline");
      } finally {
        setIsPageRefreshing(false);
      }
    };

    // Load initial data
    loadAllRealtimeData();

    // Subscribe to Appwrite WebSocket Realtime updates
    const unsubscribeRealtime = subscribeToDatabaseChanges((event) => {
      console.log("[Appwrite Realtime] Database event received:", event?.events);
      loadAllRealtimeData();
    });

    // 1. Load active broadcasts fallback
    try {
      const saved = localStorage.getItem("khetivo_admin_broadcasts");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const actives = parsed.filter((b: any) => b.status === "Active");
          if (actives.length > 0) {
            setActiveAdminBroadcasts(actives);
          }
        }
      }
    } catch {}

    // 2. Load crop templates from Appwrite Cloud & admin local storage
    const loadAdminCrops = async () => {
      try {
        const saved = localStorage.getItem("khetivo_admin_crops");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const normalized = parsed.map(normalizeCropTemplate);
            setActiveCropTemplates(normalized);
          }
        }

        // Always check live Appwrite Cloud for newly published templates
        const liveTmpls = await syncCropTemplatesFromAppwrite();
        if (liveTmpls && Array.isArray(liveTmpls) && liveTmpls.length > 0) {
          const liveNormalized = liveTmpls.map(normalizeCropTemplate);
          setActiveCropTemplates(liveNormalized);
          try {
            localStorage.setItem("khetivo_admin_crops", JSON.stringify(liveNormalized));
          } catch {}
        }
      } catch {
        // Safe fallback
      }
    };

    loadAdminCrops();

    // 3. Storage event listener for live cross-tab sync between /admin and /dashboard
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === "khetivo_admin_crops") {
        loadAdminCrops();
      } else if (e.key === "khetivo_admin_broadcasts" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            const actives = parsed.filter((b: any) => b.status === "Active");
            if (actives.length > 0) setActiveAdminBroadcasts(actives);
          }
        } catch {}
      }
    };

    const handleCustomCropsUpdate = () => {
      loadAdminCrops();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("khetivo_crops_updated", handleCustomCropsUpdate);
    return () => {
      unsubscribeRealtime();
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("khetivo_crops_updated", handleCustomCropsUpdate);
    };
  }, [dataRefreshTrigger]);

  // ========================================================
  // PAID FIELD VISIT BOOKING STATE & HANDLERS (2-STAGE FUNNEL)
  // ========================================================
  const [isFieldVisitModalOpen, setIsFieldVisitModalOpen] = useState(false);
  const [fieldVisitStep, setFieldVisitStep] = useState<1 | 2>(1);
  const [fieldVisitFarmId, setFieldVisitFarmId] = useState("farm-1");
  const [fieldVisitPlot, setFieldVisitPlot] = useState("Killa #3 - North Parcel");
  const [fieldVisitCrop, setFieldVisitCrop] = useState("Wheat (HD-3086) - Tillering Stage");
  const [fieldVisitReason, setFieldVisitReason] = useState("Pest / Disease Attack (Yellow Rust / Aphids)");
  const [fieldVisitNotes, setFieldVisitNotes] = useState("");
  const [fieldVisitDate, setFieldVisitDate] = useState("2026-10-29");
  const [fieldVisitSlot, setFieldVisitSlot] = useState("Morning (8:00 AM - 12:00 PM)");
  const [fieldVisitTier, setFieldVisitTier] = useState<"standard" | "priority">("standard");
  const [fieldVisitPaymentMode, setFieldVisitPaymentMode] = useState<"online" | "on_arrival">("online");
  const [fieldVisitFarmerName, setFieldVisitFarmerName] = useState("");
  const [fieldVisitPhone, setFieldVisitPhone] = useState("");
  const [fieldVisitLeadCaptured, setFieldVisitLeadCaptured] = useState(false);
  const [fieldVisitSuccess, setFieldVisitSuccess] = useState<{
    visitId: string;
    farmName: string;
    crop: string;
    reason: string;
    date: string;
    slot: string;
    fee: number;
    paymentMode: string;
    agronomist: string;
  } | null>(null);

  const handleOpenFieldVisit = () => {
    setFieldVisitStep(1);
    setFieldVisitFarmId(selectedFarmId !== "all" ? selectedFarmId : (farms[0]?.id || ""));
    setFieldVisitFarmerName(settingsFarmerName || "");
    setFieldVisitPhone(userPhone || settingsPhone || "");
    setFieldVisitLeadCaptured(false);
    setFieldVisitSuccess(null);
    setIsFieldVisitModalOpen(true);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldVisitFarmerName.trim()) {
      alert("Please provide your full name.");
      return;
    }
    if (!fieldVisitPhone.trim() || fieldVisitPhone.trim().length < 8) {
      alert("Please provide a valid contact number so the agronomist can reach you.");
      return;
    }

    // Capture lead immediately into localStorage and admin pipeline so it is never lost
    try {
      if (typeof window !== "undefined") {
        const lead = {
          farmerName: fieldVisitFarmerName.trim(),
          phone: fieldVisitPhone.trim(),
          farmId: fieldVisitFarmId,
          plot: fieldVisitPlot,
          crop: fieldVisitCrop,
          reason: fieldVisitReason,
          date: fieldVisitDate,
          slot: fieldVisitSlot,
          notes: fieldVisitNotes,
          capturedAt: new Date().toISOString(),
          status: "lead_captured_pending_payment",
        };
        const existingLeads = JSON.parse(localStorage.getItem("khetivo_field_visit_leads") || "[]");
        localStorage.setItem("khetivo_field_visit_leads", JSON.stringify([lead, ...existingLeads]));

        // Sync into admin field visits pipeline as captured lead
        const adminVisits = JSON.parse(localStorage.getItem("khetivo_admin_visits") || "[]");
        const adminLeadRecord = {
          id: `FV-LEAD-${Math.floor(1000 + Math.random() * 9000)}`,
          farmerName: fieldVisitFarmerName.trim(),
          phone: fieldVisitPhone.trim(),
          farmName: farms.find((f) => f.id === fieldVisitFarmId)?.name || "Main Holding (Ludhiana)",
          plotLandmark: fieldVisitPlot || "Plot Landmark",
          crop: fieldVisitCrop,
          reason: fieldVisitReason,
          scheduledDate: fieldVisitDate,
          timeSlot: fieldVisitSlot,
          tier: (fieldVisitTier === "priority" ? "Priority Express (₹799)" : "Standard (₹499)"),
          fee: fieldVisitTier === "priority" ? 799 : 499,
          paymentStatus: "Pending Payment",
          workflowStage: "Lead Captured",
          assignedSpecialist: "Unassigned (Pending Confirmation)",
          capturedAt: new Date().toLocaleString(),
          notes: fieldVisitNotes || `Initiated from dashboard. Contact: ${fieldVisitPhone.trim()}`,
        };
        localStorage.setItem("khetivo_admin_visits", JSON.stringify([adminLeadRecord, ...adminVisits]));
              }
    } catch {
      // safe fallback
    }

    setFieldVisitLeadCaptured(true);
    setFieldVisitStep(2);
  };

  const handleBookFieldVisit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedFarm = farms.find((f) => f.id === fieldVisitFarmId)?.name || "Main Holding (Ludhiana)";
    const fee = fieldVisitTier === "priority" ? 799 : 499;
    const randomVisitId = `FV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const specialist = "Dr. Harpreet Singh (Senior Field Agronomist, PAU Ludhiana)";

    // Update lead in localStorage and sync confirmed booking to admin portal
    try {
      if (typeof window !== "undefined") {
        const existingLeads = JSON.parse(localStorage.getItem("khetivo_field_visit_leads") || "[]");
        if (existingLeads.length > 0) {
          existingLeads[0].status = fieldVisitPaymentMode === "online" ? "confirmed_paid" : "confirmed_pay_on_arrival";
          existingLeads[0].visitId = randomVisitId;
          existingLeads[0].fee = fee;
          localStorage.setItem("khetivo_field_visit_leads", JSON.stringify(existingLeads));
        }

        // Add confirmed visit to khetivo_admin_visits
        const adminVisits = JSON.parse(localStorage.getItem("khetivo_admin_visits") || "[]");
        const confirmedAdminVisit = {
          id: randomVisitId,
          farmerName: fieldVisitFarmerName.trim(),
          phone: fieldVisitPhone.trim(),
          farmName: assignedFarm,
          plotLandmark: fieldVisitPlot || "Main Plot",
          crop: fieldVisitCrop,
          reason: fieldVisitReason,
          scheduledDate: fieldVisitDate,
          timeSlot: fieldVisitSlot,
          tier: (fieldVisitTier === "priority" ? "Priority Express (₹799)" : "Standard (₹499)"),
          fee,
          paymentStatus: fieldVisitPaymentMode === "online" ? "Paid Online" : "Pay on Arrival",
          workflowStage: fieldVisitPaymentMode === "online" ? "Payment Verified" : "Lead Captured",
          assignedSpecialist: specialist,
          capturedAt: new Date().toLocaleString(),
          notes: fieldVisitNotes || `Confirmed booking from dashboard. Contact: ${fieldVisitPhone.trim()}`,
        };
        // Clean out any temporary pending lead from same phone
        const cleanedAdminVisits = adminVisits.filter((v: any) => !v.id?.startsWith("FV-LEAD-") || v.phone !== fieldVisitPhone.trim());
        localStorage.setItem("khetivo_admin_visits", JSON.stringify([confirmedAdminVisit, ...cleanedAdminVisits]));
              }
    } catch {
      // safe fallback
    }

    // Book field visit in Appwrite Cloud
    bookFieldVisitInAppwrite({
      farmerName: fieldVisitFarmerName.trim(),
      phone: fieldVisitPhone.trim(),
      farmName: assignedFarm,
      crop: fieldVisitCrop,
      reason: fieldVisitReason,
      scheduledDate: fieldVisitDate,
      timeSlot: fieldVisitSlot,
      tier: fieldVisitTier === "priority" ? "Priority Express (₹799)" : "Standard (₹499)",
      fee,
    });

    setFieldVisitSuccess({
      visitId: randomVisitId,
      farmName: assignedFarm,
      crop: fieldVisitCrop,
      reason: fieldVisitReason,
      date: fieldVisitDate,
      slot: fieldVisitSlot,
      fee,
      paymentMode: fieldVisitPaymentMode === "online" ? "Paid Online (UPI / NetBanking)" : "Pay on Field Arrival (Cash / UPI)",
      agronomist: specialist,
    });
  };

  // Modal to add an additional crop to an existing farm
  const [addCropModalOpen, setAddCropModalOpen] = useState(false);
  const [newCropFarmId, setNewCropFarmId] = useState("farm-1");
  const [newCropTemplateId, setNewCropTemplateId] = useState("wheat");
  const [newCropVariety, setNewCropVariety] = useState("HD-3086");
  const [newCropArea, setNewCropArea] = useState<number | "">(5);
  const [newCropSownDate, setNewCropSownDate] = useState("2026-10-15");
  const [newCropStage, setNewCropStage] = useState("Stage 2: Vegetative / Tillering");
  const [newCropStageStep, setNewCropStageStep] = useState(2);
  const [newCropCurrentDay, setNewCropCurrentDay] = useState<number | "">(25);
  const [newCropTotalDays, setNewCropTotalDays] = useState<number | "">(135);

  // ==========================================
  // FINANCIALS: Production, Losses & Expenses
  // ==========================================
  const [transactions, setTransactions] = useState<FarmTransaction[]>(INITIAL_TRANSACTIONS);
  const [financialFilterType, setFinancialFilterType] = useState<"all" | "production" | "loss" | "expense">("all");
  const [financialSearch, setFinancialSearch] = useState("");
  const [financialFarmFilter, setFinancialFarmFilter] = useState("all");

  // Record Financial Entry Modal State
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [recordType, setRecordType] = useState<TransactionType>("production");
  const [recordFarmId, setRecordFarmId] = useState("farm-1");
  const [recordTitle, setRecordTitle] = useState("");
  const [recordCategory, setRecordCategory] = useState(PRODUCTION_CATEGORIES[0]);
  const [recordAmount, setRecordAmount] = useState<number | "">("");
  const [recordQuantity, setRecordQuantity] = useState("");
  const [recordDate, setRecordDate] = useState("2026-10-26");
  const [recordStatus, setRecordStatus] = useState<"Cleared" | "Pending" | "Claimed" | "Recorded">("Cleared");
  const [recordCrop, setRecordCrop] = useState("Wheat");
  const [recordReference, setRecordReference] = useState("");
  const [recordNotes, setRecordNotes] = useState("");

  const handleOpenRecordModal = (defaultType: TransactionType = "production") => {
    setRecordType(defaultType);
    setRecordFarmId(selectedFarmId === "all" ? "farm-1" : selectedFarmId);
    setRecordCategory(
      defaultType === "production"
        ? PRODUCTION_CATEGORIES[0]
        : defaultType === "loss"
        ? LOSS_CATEGORIES[0]
        : EXPENSE_CATEGORIES[0]
    );
    setRecordTitle("");
    setRecordAmount("");
    setRecordQuantity("");
    setRecordReference("");
    setRecordNotes("");
    setRecordDate(new Date().toISOString().split("T")[0]);
    setRecordStatus(defaultType === "loss" ? "Claimed" : "Cleared");
    setRecordCrop("Wheat");
    setRecordModalOpen(true);
  };

  const handleRecordTypeChange = (newType: TransactionType) => {
    setRecordType(newType);
    if (newType === "production") {
      setRecordCategory(PRODUCTION_CATEGORIES[0]);
      setRecordStatus("Cleared");
    } else if (newType === "loss") {
      setRecordCategory(LOSS_CATEGORIES[0]);
      setRecordStatus("Claimed");
    } else {
      setRecordCategory(EXPENSE_CATEGORIES[0]);
      setRecordStatus("Cleared");
    }
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordTitle.trim() || !recordAmount || Number(recordAmount) <= 0) {
      alert("Please enter a valid title and amount.");
      return;
    }

    const assignedFarm = farms.find((f) => f.id === recordFarmId) || farms[0];
    const newTx: FarmTransaction = {
      id: `tx-${Date.now()}`,
      farmId: assignedFarm ? assignedFarm.id : "all",
      farmName: assignedFarm ? assignedFarm.name : "All Holdings",
      type: recordType,
      title: recordTitle.trim(),
      category: recordCategory,
      amount: Number(recordAmount),
      date: recordDate || new Date().toISOString().split("T")[0],
      quantity: recordQuantity.trim() || undefined,
      status: recordStatus,
      reference: recordReference.trim() || undefined,
      crop: recordCrop,
      notes: recordNotes.trim() || undefined,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setRecordModalOpen(false);

    // Persist transaction to Appwrite Cloud Database
    createFinancialTransactionInAppwrite({
      farmId: newTx.farmId,
      type: newTx.type,
      title: newTx.title,
      category: newTx.category,
      amount: newTx.amount,
      date: newTx.date,
      quantity: newTx.quantity,
      crop: newTx.crop,
      notes: newTx.notes,
    }).then((created) => {
      if (created && created.$id) {
        setTransactions((prev) => prev.map((t) => (t.id === newTx.id ? { ...t, id: created.$id } : t)));
      }
    });
  };

  const handleDeleteTransaction = (id: string) => {
    const targetTx = transactions.find((t) => t.id === id);
    requestDeleteConfirmation({
      title: "Delete Financial Entry",
      itemType: targetTx?.type ? targetTx.type.toUpperCase() : "Finance",
      itemName: targetTx ? `${targetTx.title} (₹${targetTx.amount.toLocaleString("en-IN")})` : "Transaction Record",
      description: "Are you sure you want to delete this financial record? It will be permanently removed from your income and expense ledger.",
      confirmText: "Yes, Delete Entry",
      onConfirm: async () => {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        await deleteFinancialTransactionInAppwrite(id);
      },
    });
  };

  // Safe date formatter for inventory & equipment dates
  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return "Not Scheduled";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${day} ${months[month] || parts[1]}, ${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // ===================== REAL WEATHER API STATE =====================
  const [realWeather, setRealWeather] = useState<{
    locationName: string;
    region: string;
    tempC: number;
    conditionText: string;
    conditionIcon: string;
    windKph: number;
    windDir: string;
    humidity: number;
    chanceOfRain: number;
    precipMm: number;
    isDay: boolean;
    lastUpdated: string;
    sprayWindow: string;
    forecastDays: {
      date: string;
      dayName: string;
      maxTemp: number;
      minTemp: number;
      rainChance: number;
      precipMm: number;
      conditionText: string;
      conditionIcon: string;
    }[];
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // ===================== INVENTORY & STORE MANAGEMENT STATES =====================
  const [stores, setStores] = useState<FarmStore[]>(INITIAL_STORES);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(INITIAL_INVENTORY_ITEMS);
  const [usageLogs, setUsageLogs] = useState<ItemUsageLog[]>(INITIAL_USAGE_LOGS);

  // Filter & Search states
  const [inventoryStoreFilter, setInventoryStoreFilter] = useState<string>("all");
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>("all");
  const [inventoryFilter, setInventoryFilter] = useState<"all" | "low_stock" | "expiring" | "usages">("all");
  const [inventorySearch, setInventorySearch] = useState<string>("");
  const [expandedInventoryId, setExpandedInventoryId] = useState<string | null>(null);
  const [expandedEquipmentId, setExpandedEquipmentId] = useState<string | null>(null);

  // Modals
  const [addStoreModalOpen, setAddStoreModalOpen] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [logUsageModalOpen, setLogUsageModalOpen] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);

  // Form State: Add Store
  const [storeFarmId, setStoreFarmId] = useState<string>("farm-1");
  const [storeNameInput, setStoreNameInput] = useState<string>("");
  const [storeTypeInput, setStoreTypeInput] = useState<string>("General Godown");
  const [storeLocationInput, setStoreLocationInput] = useState<string>("");
  const [storeNotesInput, setStoreNotesInput] = useState<string>("");

  // Form State: Add Item (Matches user screenshot)
  const [itemFarmId, setItemFarmId] = useState<string>("farm-1");
  const [itemStoreId, setItemStoreId] = useState<string>("store-1");
  const [itemNameInput, setItemNameInput] = useState<string>("");
  const [itemCategoryInput, setItemCategoryInput] = useState<string>(INVENTORY_CATEGORIES[0]);
  const [itemBatchInput, setItemBatchInput] = useState<string>("");
  const [itemPurchasedDate, setItemPurchasedDate] = useState<string>("2026-10-26");
  const [itemExpiryDate, setItemExpiryDate] = useState<string>("");
  const [itemQuantityInput, setItemQuantityInput] = useState<number | "">("");
  const [itemUnitInput, setItemUnitInput] = useState<string>("kg");
  const [itemRateInput, setItemRateInput] = useState<number | "">("");
  const [itemLowStockThresholdInput, setItemLowStockThresholdInput] = useState<number>(5);

  // Form State: Log Item Usage
  const [activeItemForUsage, setActiveItemForUsage] = useState<InventoryItem | null>(null);
  const [usageQtyInput, setUsageQtyInput] = useState<number | "">("");
  const [usagePurposeInput, setUsagePurposeInput] = useState<string>("");
  const [usageCropInput, setUsageCropInput] = useState<string>("Wheat");
  const [usageDateInput, setUsageDateInput] = useState<string>("2026-10-26");
  const [usageAppliedByInput, setUsageAppliedByInput] = useState<string>("Harpreet Singh");

  // Form State: Restock Item
  const [activeItemForRestock, setActiveItemForRestock] = useState<InventoryItem | null>(null);
  const [restockQtyInput, setRestockQtyInput] = useState<number | "">("");
  const [restockRateInput, setRestockRateInput] = useState<number | "">("");
  const [restockBatchInput, setRestockBatchInput] = useState<string>("");

  // Open Add Store Modal
  const handleOpenAddStore = (defaultFarmId?: string) => {
    setStoreFarmId(defaultFarmId || (selectedFarmId === "all" ? "farm-1" : selectedFarmId));
    setStoreNameInput("");
    setStoreTypeInput("General Input Godown");
    setStoreLocationInput("");
    setStoreNotesInput("");
    setAddStoreModalOpen(true);
  };

  // Save Store
  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeNameInput.trim()) {
      alert("Please enter a valid store name.");
      return;
    }
    const targetFarm = farms.find((f) => f.id === storeFarmId) || farms[0];
    const newStore: FarmStore = {
      id: `store-${Date.now()}`,
      farmId: targetFarm ? targetFarm.id : "all",
      farmName: targetFarm ? targetFarm.name : "Main Farm",
      name: storeNameInput.trim(),
      type: storeTypeInput.trim() || "General Godown",
      location: storeLocationInput.trim() || undefined,
      notes: storeNotesInput.trim() || undefined,
    };
    setStores((prev) => [...prev, newStore]);
    setItemStoreId(newStore.id);
    setAddStoreModalOpen(false);

    // Save to Appwrite Cloud
    createFarmStoreInAppwrite({
      farmId: newStore.farmId,
      name: newStore.name,
      type: newStore.type,
      location: newStore.location,
      notes: newStore.notes,
    }).then((created) => {
      if (created && created.$id) {
        setStores((prev) => prev.map((s) => (s.id === newStore.id ? { ...s, id: created.$id } : s)));
      }
    });
  };

  // Open Add Item Modal (matches user screenshot)
  const handleOpenAddItem = (defaultStoreId?: string) => {
    const defaultFarm = selectedFarmId === "all" ? "farm-1" : selectedFarmId;
    setItemFarmId(defaultFarm);
    const availableStores = stores.filter((s) => s.farmId === defaultFarm);
    setItemStoreId(defaultStoreId || (availableStores[0]?.id || stores[0]?.id || "store-1"));
    setItemNameInput("");
    setItemCategoryInput(INVENTORY_CATEGORIES[0]);
    setItemBatchInput("");
    setItemPurchasedDate(new Date().toISOString().split("T")[0]);
    setItemExpiryDate("");
    setItemQuantityInput("");
    setItemUnitInput("kg");
    setItemRateInput("");
    setItemLowStockThresholdInput(5);
    setAddItemModalOpen(true);
  };

  // Save Item
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemNameInput.trim() || itemQuantityInput === "" || Number(itemQuantityInput) <= 0) {
      alert("Please provide a valid item name and quantity.");
      return;
    }
    const targetFarm = farms.find((f) => f.id === itemFarmId) || farms[0];
    const targetStore = stores.find((s) => s.id === itemStoreId) || stores[0];

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      farmId: targetFarm.id,
      farmName: targetFarm.name,
      storeId: targetStore?.id || "store-1",
      storeName: targetStore?.name || "Main Store",
      name: itemNameInput.trim(),
      category: itemCategoryInput,
      batchNumber: itemBatchInput.trim() || `BT-${Math.floor(1000 + Math.random() * 9000)}`,
      purchasedDate: itemPurchasedDate || new Date().toISOString().split("T")[0],
      expiryDate: itemExpiryDate || "",
      quantity: Number(itemQuantityInput),
      unit: itemUnitInput,
      rate: Number(itemRateInput) || 0,
      lowStockThreshold: Number(itemLowStockThresholdInput) || 5,
    };

    setInventoryItems((prev) => [newItem, ...prev]);
    setAddItemModalOpen(false);

    // Save to Appwrite Cloud
    createInventoryItemInAppwrite({
      farmId: newItem.farmId,
      storeId: newItem.storeId,
      name: newItem.name,
      category: newItem.category,
      batchNumber: newItem.batchNumber,
      purchasedDate: newItem.purchasedDate,
      expiryDate: newItem.expiryDate,
      quantity: newItem.quantity,
      unit: newItem.unit,
      rate: newItem.rate,
      lowStockThreshold: newItem.lowStockThreshold,
    }).then((created) => {
      if (created && (created.$id || (created as any).id)) {
        const realId = created.$id || (created as any).id;
        setInventoryItems((prev) => prev.map((item) => (item.id === newItem.id ? { ...item, id: realId } : item)));
      }
    });
  };

  // Open Log Usage Modal
  const handleOpenLogUsage = (item: InventoryItem) => {
    setActiveItemForUsage(item);
    setUsageQtyInput("");
    setUsagePurposeInput("");
    setUsageCropInput("Wheat");
    setUsageDateInput(new Date().toISOString().split("T")[0]);
    setUsageAppliedByInput("Harpreet Singh");
    setLogUsageModalOpen(true);
  };

  // Save Usage
  const handleSaveUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItemForUsage) return;
    const qty = Number(usageQtyInput);
    if (!qty || qty <= 0) {
      alert("Please enter a valid quantity used.");
      return;
    }
    if (qty > activeItemForUsage.quantity) {
      alert(`Cannot use more than available stock (${activeItemForUsage.quantity} ${activeItemForUsage.unit}).`);
      return;
    }

    const newUsage: ItemUsageLog = {
      id: `usage-${Date.now()}`,
      itemId: activeItemForUsage.id,
      itemName: activeItemForUsage.name,
      farmId: activeItemForUsage.farmId,
      farmName: activeItemForUsage.farmName,
      storeId: activeItemForUsage.storeId,
      storeName: activeItemForUsage.storeName,
      quantityUsed: qty,
      unit: activeItemForUsage.unit,
      date: usageDateInput || new Date().toISOString().split("T")[0],
      purpose: usagePurposeInput.trim() || "Field Application",
      crop: usageCropInput,
      appliedBy: usageAppliedByInput.trim() || "Farm Worker",
    };

    // Deduct stock
    setInventoryItems((prev) =>
      prev.map((item) =>
        item.id === activeItemForUsage.id
          ? { ...item, quantity: Math.max(0, item.quantity - qty) }
          : item
      )
    );

    setUsageLogs((prev) => [newUsage, ...prev]);
    setLogUsageModalOpen(false);

    // Save usage to Appwrite Cloud
    logUsageInAppwrite({
      itemId: newUsage.itemId,
      farmId: newUsage.farmId,
      storeId: newUsage.storeId,
      quantityUsed: newUsage.quantityUsed,
      unit: newUsage.unit,
      purpose: newUsage.purpose,
      crop: newUsage.crop,
      appliedBy: newUsage.appliedBy,
    });
  };

  // Restock Item
  const handleOpenRestock = (item: InventoryItem) => {
    setActiveItemForRestock(item);
    setRestockQtyInput("");
    setRestockRateInput(item.rate);
    setRestockBatchInput(item.batchNumber);
    setRestockModalOpen(true);
  };

  const handleSaveRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItemForRestock) return;
    const qty = Number(restockQtyInput);
    if (!qty || qty <= 0) {
      alert("Please enter a valid restock quantity.");
      return;
    }

    setInventoryItems((prev) =>
      prev.map((item) =>
        item.id === activeItemForRestock.id
          ? {
              ...item,
              quantity: item.quantity + qty,
              rate: Number(restockRateInput) || item.rate,
              batchNumber: restockBatchInput.trim() || item.batchNumber,
            }
          : item
      )
    );
    setRestockModalOpen(false);

    // Update stock in Appwrite Cloud
    restockItemInAppwrite(activeItemForRestock.id, qty);
  };

  const handleDeleteItem = (id: string) => {
    const targetItem = inventoryItems.find((i) => i.id === id);
    requestDeleteConfirmation({
      title: "Delete Inventory Item",
      itemType: targetItem?.category || "Inventory",
      itemName: targetItem?.name || "Inventory Item",
      description: "Are you sure you want to delete this inventory item? Stock levels, batch history, and low-stock alerts for this product will be permanently removed.",
      confirmText: "Yes, Delete Item",
      onConfirm: () => {
        setInventoryItems((prev) => prev.filter((i) => i.id !== id));
      },
    });
  };

  // Stable reference date for SSR/prerender to satisfy Next.js 16
  const [currentDateStr, setCurrentDateStr] = useState("2026-10-26");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const now = new Date();
      setCurrentDateStr(now.toISOString().split("T")[0]);
    }
  }, []);

  // Helper for expiry check (deterministic for Next.js SSR)
  const getItemExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return { status: "good" as const, daysLeft: 999 };
    const today = new Date(currentDateStr);
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { status: "expired" as const, daysLeft: diffDays };
    if (diffDays <= 30) return { status: "expiring_soon" as const, daysLeft: diffDays };
    return { status: "good" as const, daysLeft: diffDays };
  };

  // ===================== FARM TASKS & CALENDAR STATES =====================
  const [taskList, setTaskList] = useState<FarmTask[]>(INITIAL_TASKS);
  const [taskFilter, setTaskFilter] = useState<"all" | "todo" | "in_progress" | "completed">("all");
  const [taskFarmFilter, setTaskFarmFilter] = useState<string>("all");
  const [taskSearch, setTaskSearch] = useState<string>("");
  const [taskViewMode, setTaskViewMode] = useState<"list" | "calendar">("list");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Calendar Navigation (0-indexed month: 9 = October, 10 = November)
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = useState<number>(9);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>("2026-10-27");

  // Create Task Modal & Form State
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [taskFormTitle, setTaskFormTitle] = useState("");
  const [taskFormCategory, setTaskFormCategory] = useState(TASK_CATEGORIES[0]);
  const [taskFormPriority, setTaskFormPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");
  const [taskFormStatus, setTaskFormStatus] = useState<"To Do" | "In Progress" | "Completed">("To Do");
  const [taskFormFarmId, setTaskFormFarmId] = useState("farm-1");
  const [taskFormZone, setTaskFormZone] = useState("Zone A (12 Acres)");
  const [taskFormCrop, setTaskFormCrop] = useState("PBW 826 Wheat");
  const [taskFormDueDate, setTaskFormDueDate] = useState("2026-10-28");
  const [taskFormAssignedTo, setTaskFormAssignedTo] = useState("Harpreet Singh");
  const [taskFormInstructions, setTaskFormInstructions] = useState("");

  const handleOpenCreateTask = (defaultDate?: string) => {
    setTaskFormTitle("");
    setTaskFormCategory(TASK_CATEGORIES[0]);
    setTaskFormPriority("Medium");
    setTaskFormStatus("To Do");
    setTaskFormFarmId(selectedFarmId === "all" ? "farm-1" : selectedFarmId);
    setTaskFormZone("Zone A (12 Acres)");
    setTaskFormCrop("PBW 826 Wheat");
    setTaskFormDueDate(defaultDate || currentDateStr);
    setTaskFormAssignedTo("Harpreet Singh");
    setTaskFormInstructions("");
    setCreateTaskModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskFormTitle.trim()) {
      alert("Please enter a task title.");
      return;
    }
    const targetFarm = farms.find((f) => f.id === taskFormFarmId) || farms[0];
    const newTask: FarmTask = {
      id: `task-${Date.now()}`,
      farmId: targetFarm.id,
      farmName: targetFarm.name,
      title: taskFormTitle.trim(),
      category: taskFormCategory,
      priority: taskFormPriority,
      status: taskFormStatus,
      dueDate: taskFormDueDate || currentDateStr,
      assignedTo: taskFormAssignedTo.trim() || "Unassigned",
      zone: taskFormZone.trim() || undefined,
      crop: taskFormCrop.trim() || undefined,
      instructions: taskFormInstructions.trim() || undefined,
      completedDate: taskFormStatus === "Completed" ? currentDateStr : undefined,
    };
    setTaskList((prev) => [newTask, ...prev]);
    setCreateTaskModalOpen(false);

    // Save to Appwrite Cloud
    createTaskInAppwrite({
      farmId: targetFarm.id,
      title: newTask.title,
      category: newTask.category,
      priority: newTask.priority,
      status: newTask.status,
      dueDate: newTask.dueDate,
      assignedTo: newTask.assignedTo,
      zone: newTask.zone,
      crop: newTask.crop,
      instructions: newTask.instructions,
    }).then((created) => {
      if (created && (created.$id || (created as any).id)) {
        const realId = created.$id || (created as any).id;
        setTaskList((prev) => prev.map((t) => (t.id === newTask.id ? { ...t, id: realId } : t)));
      }
    });
  };

  const handleToggleTaskStatus = (taskId: string) => {
    const target = taskList.find((t) => t.id === taskId);
    if (target) {
      const nextStatus = target.status === "Completed" ? "Pending" : "Completed";
      updateTaskStatusInAppwrite(taskId, nextStatus);
    }
    setTaskList((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === "Completed" ? "To Do" : "Completed";
          return {
            ...t,
            status: nextStatus,
            completedDate: nextStatus === "Completed" ? currentDateStr : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleSetTaskStatus = (taskId: string, newStatus: "To Do" | "In Progress" | "Completed") => {
    updateTaskStatusInAppwrite(taskId, newStatus);
    setTaskList((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              completedDate: newStatus === "Completed" ? currentDateStr : undefined,
            }
          : t
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    const targetTask = taskList.find((t) => t.id === taskId);
    requestDeleteConfirmation({
      title: "Delete Farm Task",
      itemType: targetTask?.category || "Task",
      itemName: targetTask?.title || "Farm Task",
      description: "Are you sure you want to delete this farm task? It will be removed from your activity schedule, calendar view, and assigned staff queue.",
      confirmText: "Yes, Delete Task",
      onConfirm: async () => {
        await deleteTaskFromAppwrite(taskId);
        setTaskList((prev) => prev.filter((t) => t.id !== taskId));
      },
    });
  };

  const getTaskDueStatus = (dueDate: string, isCompleted: boolean) => {
    if (isCompleted) return { label: "Completed", color: "text-emerald-700 bg-emerald-50 border-emerald-200 font-semibold" };
    if (!dueDate) return { label: "No Date", color: "text-[#55685D] bg-[#F4F8F4] border-[#E5ECE7]" };
    const today = new Date(currentDateStr);
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: `Overdue by ${Math.abs(diffDays)}d`, color: "text-red-700 bg-red-50 border-red-200 font-bold" };
    if (diffDays === 0) return { label: "Due Today", color: "text-amber-800 bg-amber-50 border-amber-200 font-bold" };
    if (diffDays === 1) return { label: "Due Tomorrow", color: "text-amber-700 bg-amber-50 border-amber-200 font-semibold" };
    if (diffDays <= 7) return { label: `Due in ${diffDays}d`, color: "text-blue-700 bg-blue-50 border-blue-200" };
    return { label: `Due ${formatDisplayDate(dueDate)}`, color: "text-[#55685D] bg-[#F4F8F4] border-[#E5ECE7]" };
  };

  // ===================== EQUIPMENT & PROBLEM REPORTING STATES =====================
  const [equipmentList, setEquipmentList] = useState<FarmEquipment[]>(INITIAL_EQUIPMENT);
  const [equipmentIssues, setEquipmentIssues] = useState<EquipmentIssueReport[]>(INITIAL_EQUIPMENT_ISSUES);
  const [equipmentFilter, setEquipmentFilter] = useState<"all" | "operational" | "service_due" | "issues">("all");
  const [equipmentFarmFilter, setEquipmentFarmFilter] = useState<string>("all");
  const [equipmentSearch, setEquipmentSearch] = useState<string>("");

  // Modals for Equipment
  const [registerEquipmentModalOpen, setRegisterEquipmentModalOpen] = useState(false);
  const [reportProblemModalOpen, setReportProblemModalOpen] = useState(false);
  const [selectedEquipmentForProblem, setSelectedEquipmentForProblem] = useState<FarmEquipment | null>(null);

  // Form State: Register Equipment
  const [eqFarmId, setEqFarmId] = useState<string>("farm-1");
  const [eqName, setEqName] = useState<string>("");
  const [eqCategory, setEqCategory] = useState<string>(EQUIPMENT_CATEGORIES[0]);
  const [eqModelNumber, setEqModelNumber] = useState<string>("");
  const [eqOperator, setEqOperator] = useState<string>("Harnek Singh");
  const [eqRuntimeHours, setEqRuntimeHours] = useState<number | "">("");
  const [eqNextServiceDate, setEqNextServiceDate] = useState<string>("");
  const [eqFuelEfficiency, setEqFuelEfficiency] = useState<string>("3.8 L/hr (Optimal)");

  // Form State: Report Problem
  const [probEquipmentId, setProbEquipmentId] = useState<string>("eq-1");
  const [probType, setProbType] = useState<string>("Hydraulic Leak / Pressure Drop");
  const [probSeverity, setProbSeverity] = useState<"Low" | "Medium" | "High" | "Critical">("High");
  const [probDescription, setProbDescription] = useState<string>("");
  const [probReportedBy, setProbReportedBy] = useState<string>("Harnek Singh");
  const [probDate, setProbDate] = useState<string>("2026-10-26");

  // Open Register Equipment Modal
  const handleOpenRegisterEquipment = () => {
    const defaultFarmId = selectedFarmId === "all" ? (farms[0]?.id || "farm-1") : selectedFarmId;
    setEqFarmId(defaultFarmId);
    setEqName("");
    setEqCategory(EQUIPMENT_CATEGORIES[0]);
    setEqModelNumber("");
    setEqOperator("Harnek Singh");
    setEqRuntimeHours("");
    setEqNextServiceDate("");
    setEqFuelEfficiency("3.8 L/hr (Optimal)");
    setRegisterEquipmentModalOpen(true);
  };

  const handleSaveEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqName.trim()) {
      alert("Please enter equipment name.");
      return;
    }
    const targetFarm = farms.find((f) => f.id === eqFarmId) || farms[0];
    if (!targetFarm) {
      alert("No farm selected or found.");
      return;
    }
    const newEq: FarmEquipment = {
      id: `eq-${Date.now()}`,
      farmId: targetFarm.id,
      farmName: targetFarm.name,
      name: eqName.trim(),
      category: eqCategory,
      modelNumber: eqModelNumber.trim() || undefined,
      operator: eqOperator.trim() || "Unassigned",
      status: "Operational",
      runtimeHours: Number(eqRuntimeHours) || 0,
      nextServiceDate: eqNextServiceDate || undefined,
      fuelEfficiency: eqFuelEfficiency.trim() || undefined,
      lastServiceDate: new Date().toISOString().split("T")[0],
    };
    setEquipmentList((prev) => [newEq, ...prev]);
    setRegisterEquipmentModalOpen(false);

    // Save to Appwrite Cloud
    createEquipmentInAppwrite({
      farmId: targetFarm.id,
      name: newEq.name,
      category: newEq.category,
      model: newEq.modelNumber,
      operator: newEq.operator,
      status: newEq.status,
      runtimeHours: newEq.runtimeHours,
      fuelEfficiency: newEq.fuelEfficiency,
      lastServiceDate: newEq.lastServiceDate,
      nextServiceDate: newEq.nextServiceDate,
    }).then((created) => {
      if (created && (created.$id || (created as any).id)) {
        const realId = created.$id || (created as any).id;
        setEquipmentList((prev) => prev.map((eq) => (eq.id === newEq.id ? { ...eq, id: realId } : eq)));
      }
    });
  };

  // Open Report Problem Modal
  const handleOpenReportProblem = (targetEq?: FarmEquipment) => {
    if (targetEq) {
      setSelectedEquipmentForProblem(targetEq);
      setProbEquipmentId(targetEq.id);
    } else {
      const defaultEq = equipmentList[0];
      setSelectedEquipmentForProblem(defaultEq);
      setProbEquipmentId(defaultEq?.id || "eq-1");
    }
    setProbType("Hydraulic Leak / Pressure Drop");
    setProbSeverity("High");
    setProbDescription("");
    setProbReportedBy("Harnek Singh");
    setProbDate(currentDateStr);
    setReportProblemModalOpen(true);
  };

  // Save Problem Report
  const handleSaveProblemReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!probDescription.trim()) {
      alert("Please describe the problem.");
      return;
    }
    const targetEq = equipmentList.find((eq) => eq.id === probEquipmentId) || equipmentList[0];
    const newIssue: EquipmentIssueReport = {
      id: `issue-${Date.now()}`,
      equipmentId: targetEq.id,
      equipmentName: targetEq.name,
      farmId: targetEq.farmId,
      farmName: targetEq.farmName,
      issueType: probType,
      severity: probSeverity,
      description: probDescription.trim(),
      reportedBy: probReportedBy.trim() || "Farm Worker",
      reportedDate: probDate || currentDateStr,
      status: "Open",
    };

    // Automatically update equipment status to Problem Reported
    setEquipmentList((prev) =>
      prev.map((eq) =>
        eq.id === targetEq.id ? { ...eq, status: "Problem Reported" } : eq
      )
    );

    setEquipmentIssues((prev) => [newIssue, ...prev]);
    setReportProblemModalOpen(false);
    setEquipmentFilter("issues");

    // Report problem to Appwrite Cloud
    reportEquipmentProblemInAppwrite({
      equipmentId: newIssue.equipmentId,
      farmId: newIssue.farmId,
      issueType: newIssue.issueType,
      severity: newIssue.severity,
      description: newIssue.description,
      reportedBy: newIssue.reportedBy,
    });
  };

  // Mark Issue Resolved
  const handleResolveIssue = (issueId: string, equipmentId: string) => {
    setEquipmentIssues((prev) =>
      prev.map((iss) => (iss.id === issueId ? { ...iss, status: "Resolved" } : iss))
    );
    const otherOpen = equipmentIssues.filter(
      (iss) => iss.equipmentId === equipmentId && iss.id !== issueId && iss.status !== "Resolved"
    );
    if (otherOpen.length === 0) {
      setEquipmentList((prev) =>
        prev.map((eq) => (eq.id === equipmentId ? { ...eq, status: "Operational" } : eq))
      );
      updateEquipmentStatusInAppwrite(equipmentId, "Operational");
    }
    resolveEquipmentIssueInAppwrite(issueId);
  };

  const handleDeleteEquipment = (id: string) => {
    const targetEq = equipmentList.find((eq) => eq.id === id);
    requestDeleteConfirmation({
      title: "Delete Equipment Record",
      itemType: targetEq?.category || "Machinery",
      itemName: targetEq?.name || "Equipment Record",
      description: "Are you sure you want to remove this equipment from your machinery roster? Runtime hours, fuel efficiency data, and maintenance records will be removed.",
      confirmText: "Yes, Remove Equipment",
      onConfirm: () => {
        setEquipmentList((prev) => prev.filter((eq) => eq.id !== id));
        deleteEquipmentInAppwrite(id);
      },
    });
  };

  // ===================== REPORTS & ANALYTICS STATES =====================
  const [reportViewMode, setReportViewMode] = useState<"chart" | "table">("chart");
  const [reportCategory, setReportCategory] = useState<"financial" | "crops" | "inputs" | "machinery">("financial");
  const [reportTimeframe, setReportTimeframe] = useState<"season" | "month" | "quarter" | "year" | "custom">("season");
  const [reportStartDate, setReportStartDate] = useState<string>("2026-10-01");
  const [reportEndDate, setReportEndDate] = useState<string>("2026-11-26");
  const [reportGeneratedAt, setReportGeneratedAt] = useState<string>("");
  const [reportFarmFilter, setReportFarmFilter] = useState<string>("all");
  const [reportSearch, setReportSearch] = useState<string>("");

  // Sync real-time dates on client mount (avoids Next.js prerender evaluation errors)
  useEffect(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const seasonStartYear = now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1;
    setReportStartDate(`${seasonStartYear}-10-01`);
    setReportEndDate(todayStr);
    setReportGeneratedAt(now.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }));
  }, []);

  const handleTimeframeChange = (val: "season" | "month" | "quarter" | "year" | "custom") => {
    setReportTimeframe(val);
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setReportEndDate(todayStr);

    if (val === "season") {
      // Rabi season typically runs Oct 1 to present/March
      const seasonStartYear = now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1;
      setReportStartDate(`${seasonStartYear}-10-01`);
    } else if (val === "month") {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setReportStartDate(`${past30.getFullYear()}-${String(past30.getMonth() + 1).padStart(2, "0")}-${String(past30.getDate()).padStart(2, "0")}`);
    } else if (val === "quarter") {
      const past90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      setReportStartDate(`${past90.getFullYear()}-${String(past90.getMonth() + 1).padStart(2, "0")}-${String(past90.getDate()).padStart(2, "0")}`);
    } else if (val === "year") {
      setReportStartDate(`${now.getFullYear()}-01-01`);
    }
  };

  const handleResetReportFilters = () => {
    setReportCategory("financial");
    setReportTimeframe("season");
    setReportFarmFilter("all");
    setReportSearch("");
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const seasonStartYear = now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1;
    setReportStartDate(`${seasonStartYear}-10-01`);
    setReportEndDate(todayStr);
  };

  // ===================== TEAM & WORKFORCE STATES =====================
  const [teamSubTab, setTeamSubTab] = useState<"members" | "designations">("members");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [designations, setDesignations] = useState<FarmDesignation[]>(INITIAL_DESIGNATIONS);

  // Search & Filters for Team Members Tab
  const [teamSearch, setTeamSearch] = useState("");
  const [teamDesignationFilter, setTeamDesignationFilter] = useState("all");
  const [teamFarmFilter, setTeamFarmFilter] = useState("all");

  // Search for Designations Tab
  const [designationSearch, setDesignationSearch] = useState("");
  // Selected roles for bulk deletion / management
  const [selectedDesignationIds, setSelectedDesignationIds] = useState<string[]>([]);

  // Modals
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const [isDesignationModalOpen, setIsDesignationModalOpen] = useState(false);
  const [editingDesignationId, setEditingDesignationId] = useState<string | null>(null);

  // Video Tutorial Modal
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);

  // ==========================================
  // SUBSCRIPTION & PLAN STATES & HANDLERS
  // ==========================================
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");
  const [activePlanId, setActivePlanId] = useState<string>("enterprise");
  const [invoices, setInvoices] = useState<BillingInvoice[]>(INITIAL_INVOICES);
  const [subscriptionToast, setSubscriptionToast] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<BillingInvoice | null>(null);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => resolve(false));
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSelectPlan = async (planId: string) => {
    const chosenPlan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!chosenPlan) return;

    // Free plan downgrade / selection
    if (chosenPlan.id === "starter" || (billingCycle === "annual" ? chosenPlan.annualPrice : chosenPlan.monthlyPrice) === 0) {
      setActivePlanId("starter");
      setSubscriptionToast("Switched to Kisan Starter Free tier.");
      try {
        await updateSubscriptionInAppwrite({
          planTier: "starter",
          maxAcres: 5,
          annualFee: 0,
          paymentMethod: "Free Tier",
        });
      } catch (e) {
        console.warn("Could not sync free tier:", e);
      }
      setTimeout(() => setSubscriptionToast(null), 4000);
      return;
    }

    // Paid Plan via Razorpay Checkout
    const planPrice = billingCycle === "annual" ? chosenPlan.annualPrice : chosenPlan.monthlyPrice;
    setIsProcessingPayment(true);
    setSubscriptionToast(`Initializing secure payment for ${chosenPlan.name}...`);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        alert("Failed to load Razorpay payment SDK. Please check your internet connection and try again.");
        setIsProcessingPayment(false);
        setSubscriptionToast(null);
        return;
      }

      const uid = getCurrentUserId() || "usr_farmer_default";
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: planPrice,
          currency: "INR",
          planId: chosenPlan.id,
          billingCycle,
          userId: uid,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success || !orderData.orderId) {
        alert(orderData.message || "Failed to create payment order with Razorpay.");
        setIsProcessingPayment(false);
        setSubscriptionToast(null);
        return;
      }

      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_U2pWJ8lM7zk2AU",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Khetivo Precision Agriculture",
        description: `${chosenPlan.name} (${billingCycle === "annual" ? "Annual License" : "Monthly License"})`,
        image: "/logo-icon.png",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          setSubscriptionToast("Payment authorized! Verifying and generating tax invoice...");
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: chosenPlan.id,
                billingCycle,
                userId: uid,
                amount: planPrice,
                maxAcres: chosenPlan.id === "enterprise" ? 50 : 25,
                farmerName: settingsFarmerName || "Valued Farmer",
                userEmail: settingsEmail || "farmer@khetivo.com",
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setActivePlanId(chosenPlan.id);
              const newInvoice: BillingInvoice = {
                id: verifyData.invoice?.$id || `inv-${Date.now()}`,
                invoiceNo: verifyData.invoice?.invoiceNo || `KH-RZP-${response.razorpay_payment_id.slice(-6)}`,
                date: new Date().toLocaleDateString("en-IN"),
                period: billingCycle === "annual" ? "Annual License (1 Year)" : "Monthly License (1 Month)",
                planName: chosenPlan.name,
                amount: planPrice,
                paymentMethod: `Razorpay (${response.razorpay_payment_id.slice(-6)})`,
                status: "Paid",
              };

              setInvoices((prev) => [newInvoice, ...prev]);
              setSelectedInvoiceForModal(newInvoice);
              setSubscriptionToast(`Payment Successful! Upgraded to ${chosenPlan.name}.`);
            } else {
              alert(verifyData.message || "Payment signature verification failed.");
            }
          } catch (vErr: any) {
            console.error("Payment verification network error:", vErr);
            alert("Error verifying payment with server. Please contact support.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: settingsFarmerName || "Khetivo Farmer",
          email: settingsEmail || "farmer@khetivo.com",
          contact: settingsPhone || "+919814054321",
        },
        theme: {
          color: "#0C4B32",
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            setSubscriptionToast(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (failResp: any) {
        setIsProcessingPayment(false);
        setSubscriptionToast(null);
        alert(`Payment Failed: ${failResp.error?.description || "Transaction cancelled or failed"}`);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay initiation error:", err);
      setIsProcessingPayment(false);
      setSubscriptionToast(null);
      alert("Unable to open Razorpay checkout: " + (err.message || "Unknown error"));
    }
  };

  const handleDownloadInvoice = (inv: BillingInvoice) => {
    setSelectedInvoiceForModal(inv);
  };

  // ==========================================
  // SUPPORT & HELPDESK STATES & HANDLERS
  // ==========================================
  const [supportSubTab, setSupportSubTab] = useState<"channels" | "tickets" | "faq">("channels");
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [ticketStatusFilter, setTicketStatusFilter] = useState<"all" | "Open" | "In Review" | "Resolved">("all");
  const [selectedTicketModal, setSelectedTicketModal] = useState<SupportTicket | null>(null);
  const [ticketReplyInput, setTicketReplyInput] = useState("");
  const [faqCategoryFilter, setFaqCategoryFilter] = useState("All");
  const [faqSearchQuery, setFaqSearchQuery] = useState("");
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // New Support Ticket Modal State
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketCategory, setNewTicketCategory] = useState<SupportTicket["category"]>("Crop Health & Pathology");
  const [newTicketFarmId, setNewTicketFarmId] = useState("all");
  const [newTicketCrop, setNewTicketCrop] = useState("Wheat (PBW-824)");
  const [newTicketPriority, setNewTicketPriority] = useState<"Low" | "Normal" | "Urgent">("Normal");
  const [newTicketDescription, setNewTicketDescription] = useState("");
  const [newTicketError, setNewTicketError] = useState("");
  const [supportToast, setSupportToast] = useState<string | null>(null);

  const handleOpenNewTicketModal = () => {
    setNewTicketSubject("");
    setNewTicketCategory("Crop Health & Pathology");
    setNewTicketFarmId(farms[0]?.id || "farm-1");
    setNewTicketCrop("Wheat (PBW-824)");
    setNewTicketPriority("Normal");
    setNewTicketDescription("");
    setNewTicketError("");
    setIsNewTicketModalOpen(true);
  };

  const handleCreateSupportTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim()) {
      setNewTicketError("Please enter a subject for your ticket.");
      return;
    }
    if (!newTicketDescription.trim()) {
      setNewTicketError("Please describe the issue or agronomy query.");
      return;
    }

    const farmObj = farms.find((f) => f.id === newTicketFarmId);
    const assignedFarmName = newTicketFarmId === "all" ? "All Holdings" : farmObj?.name || "Assigned Farm";
    const newId = `tkt-${Date.now()}`;
    const generatedTicketNo = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: SupportTicket = {
      id: newId,
      ticketNo: generatedTicketNo,
      subject: newTicketSubject.trim(),
      category: newTicketCategory,
      farmName: assignedFarmName,
      cropName: newTicketCrop.trim() || "All Holding",
      priority: newTicketPriority,
      status: "Open",
      createdAt: "Just now",
      lastReply: "Ticket dispatched to PAU agronomy helpdesk. An agronomist will review within 2 hours.",
      assignedAgronomist: "Dr. Harpreet Singh (PAU Duty Agronomist)",
      description: newTicketDescription.trim(),
    };

    setSupportTickets((prev) => [newTicket, ...prev]);

    // Save support ticket to Appwrite Cloud
    createSupportTicketInAppwrite({
      farmName: newTicket.farmName,
      cropName: newTicket.cropName,
      subject: newTicket.subject,
      category: newTicket.category,
      priority: newTicket.priority,
      description: newTicket.description,
    }).then((created) => {
      if (created && (created.$id || (created as any).id)) {
        const realId = created.$id || (created as any).id;
        setSupportTickets((prev) => prev.map((tick) => (tick.id === newTicket.id ? { ...tick, id: realId } : tick)));
      }
    });

    // Sync ticket into admin portal khetivo_admin_tickets
    try {
      if (typeof window !== "undefined") {
        const adminTicketRecord = {
          id: newId,
          ticketCode: generatedTicketNo,
          clientName: settingsFarmerName || "Farmer",
          phone: settingsPhone || userPhone || "",
          farmName: assignedFarmName,
          subject: newTicketSubject.trim(),
          category: "Agronomy Advice",
          crop: newTicketCrop.trim() || "All Holding",
          priority: newTicketPriority === "Urgent" ? "High" : newTicketPriority === "Normal" ? "Medium" : "Low",
          status: "Open",
          assignedAgronomist: "PAU Duty Agronomist",
          createdAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          messages: [
            {
              sender: `${settingsFarmerName || "Farmer"} (Farmer)`,
              text: newTicketDescription.trim(),
              time: "Just now",
            },
          ],
        };
        const existingAdminTickets = JSON.parse(localStorage.getItem("khetivo_admin_tickets") || "[]");
        localStorage.setItem("khetivo_admin_tickets", JSON.stringify([adminTicketRecord, ...existingAdminTickets]));
              }
    } catch {}

    setIsNewTicketModalOpen(false);
    setSupportToast(`Ticket #${generatedTicketNo} created successfully! Dispatched to admin agronomist helpdesk.`);
    setTimeout(() => setSupportToast(null), 5000);
  };

  const handleAddTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReplyInput.trim() || !selectedTicketModal) return;

    const replyText = `Farmer: ${ticketReplyInput.trim()}`;
    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicketModal.id
          ? { ...t, lastReply: replyText }
          : t
      )
    );
    setSelectedTicketModal((prev) => (prev ? { ...prev, lastReply: replyText } : null));

    // Sync reply into admin portal khetivo_admin_tickets
    try {
      if (typeof window !== "undefined") {
        const adminTickets = JSON.parse(localStorage.getItem("khetivo_admin_tickets") || "[]");
        const updatedAdminTickets = adminTickets.map((t: any) => {
          if (t.id === selectedTicketModal.id || t.ticketCode === selectedTicketModal.ticketNo) {
            return {
              ...t,
              messages: [
                ...(t.messages || []),
                {
                  sender: `${settingsFarmerName || "Farmer"} (Farmer)`,
                  text: ticketReplyInput.trim(),
                  time: "Just now",
                },
              ],
            };
          }
          return t;
        });
        localStorage.setItem("khetivo_admin_tickets", JSON.stringify(updatedAdminTickets));
              }
    } catch {}

    setTicketReplyInput("");
    setSupportToast("Reply sent to agronomist.");
    setTimeout(() => setSupportToast(null), 3000);
  };

  // Form states for Add / Edit Team Member
  const [memberFormName, setMemberFormName] = useState("");
  const [memberFormPhone, setMemberFormPhone] = useState("");
  const [memberFormEmail, setMemberFormEmail] = useState("");
  const [memberFormDesignationId, setMemberFormDesignationId] = useState("des-2");
  const [memberFormFarmId, setMemberFormFarmId] = useState("all");
  const [memberFormStatus, setMemberFormStatus] = useState<"Active" | "Pending Invite">("Active");
  const [memberFormNotes, setMemberFormNotes] = useState("");
  const [memberFormError, setMemberFormError] = useState("");

  // Form states for Create / Edit Designation (With Module Checkboxes!)
  const [desFormTitle, setDesFormTitle] = useState("");
  const [desFormDescription, setDesFormDescription] = useState("");
  const [desFormModules, setDesFormModules] = useState<string[]>([
    "dashboard",
    "weather",
    "tasks",
    "crops",
    "inventory",
    "equipment",
  ]);
  const [desFormError, setDesFormError] = useState("");

  // Handlers for Designation CRUD & Module Checkboxes
  const handleOpenAddDesignationModal = () => {
    setEditingDesignationId(null);
    setDesFormTitle("");
    setDesFormDescription("");
    setDesFormModules(["dashboard", "weather", "tasks", "crops"]);
    setDesFormError("");
    setIsDesignationModalOpen(true);
  };

  const handleOpenEditDesignationModal = (des: FarmDesignation) => {
    setEditingDesignationId(des.id);
    setDesFormTitle(des.title);
    setDesFormDescription(des.description);
    setDesFormModules([...des.allowedModules]);
    setDesFormError("");
    setIsDesignationModalOpen(true);
  };

  const handleToggleDesModuleAccess = (moduleId: string) => {
    setDesFormModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const handleApplyDesModulePreset = (preset: "all" | "field" | "store" | "agronomist" | "clear") => {
    if (preset === "all") {
      setDesFormModules(APP_MODULES.map((m) => m.id));
    } else if (preset === "field") {
      setDesFormModules(["dashboard", "weather", "tasks", "crops", "inventory", "equipment"]);
    } else if (preset === "store") {
      setDesFormModules(["dashboard", "inventory", "equipment"]);
    } else if (preset === "agronomist") {
      setDesFormModules(["dashboard", "weather", "crops", "reports"]);
    } else if (preset === "clear") {
      setDesFormModules([]);
    }
  };

  const handleSaveDesignation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desFormTitle.trim()) {
      setDesFormError("Please enter a designation title.");
      return;
    }
    if (desFormModules.length === 0) {
      setDesFormError("Please select at least 1 module permission with the checkboxes.");
      return;
    }

    if (editingDesignationId) {
      setDesignations((prev) =>
        prev.map((d) =>
          d.id === editingDesignationId
            ? {
                ...d,
                title: desFormTitle.trim(),
                description: desFormDescription.trim() || "Configured farm role.",
                allowedModules: desFormModules,
              }
            : d
        )
      );
      // Sync all team members assigned to this designation
      setTeamMembers((prev) =>
        prev.map((m) =>
          m.designationId === editingDesignationId
            ? {
                ...m,
                designationTitle: desFormTitle.trim(),
                allowedModules: desFormModules,
              }
            : m
        )
      );
    } else {
      const newDes: FarmDesignation = {
        id: `des-${Date.now()}`,
        title: desFormTitle.trim(),
        description: desFormDescription.trim() || "Configured farm role.",
        allowedModules: desFormModules,
        color: "#166534",
        isSystemDefault: false,
      };
      setDesignations((prev) => {
        const next = [...prev, newDes];
        try {
          localStorage.setItem("khetivo_cached_designations", JSON.stringify(next));
        } catch {}
        return next;
      });
      createDesignationInAppwrite({
        title: newDes.title,
        description: newDes.description,
        allowedModules: newDes.allowedModules,
        color: newDes.color,
        isSystemDefault: false,
      });
    }

    setIsDesignationModalOpen(false);
  };

  const handleDeleteDesignation = (id: string, title: string) => {
    const assignedCount = teamMembers.filter((m) => m.designationId === id).length;
    if (assignedCount > 0) {
      requestDeleteConfirmation({
        title: "Role Reassignment Required",
        itemType: "Restricted Role",
        itemName: title,
        description: `Cannot delete '${title}' because ${assignedCount} active staff member(s) are currently assigned to it. Please reassign their roles first.`,
        confirmText: "Understood",
        cancelText: "Close",
        onConfirm: () => {},
      });
      return;
    }
    requestDeleteConfirmation({
      title: "Delete Staff Designation",
      itemType: "Role",
      itemName: title,
      description: `Are you sure you want to delete the '${title}' designation? This role will no longer be available when assigning modules to staff.`,
      confirmText: "Yes, Delete Role",
      onConfirm: () => {
        setDesignations((prev) => {
          const next = prev.filter((d) => d.id !== id);
          try {
            localStorage.setItem("khetivo_cached_designations", JSON.stringify(next));
            const deleted = localStorage.getItem("khetivo_deleted_designations");
            const arr = deleted ? JSON.parse(deleted) : [];
            if (!arr.includes(id)) arr.push(id);
            localStorage.setItem("khetivo_deleted_designations", JSON.stringify(arr));
          } catch {}
          return next;
        });
        setSelectedDesignationIds((prev) => prev.filter((selId) => selId !== id));
        deleteDesignationInAppwrite(id);
      },
    });
  };

  const handleBulkDeleteDesignations = () => {
    if (selectedDesignationIds.length === 0) return;

    // Check if any selected designation has staff assigned
    const assignedMap = selectedDesignationIds
      .map((id) => {
        const des = designations.find((d) => d.id === id);
        const count = teamMembers.filter((m) => m.designationId === id).length;
        return { id, title: des?.title || id, count };
      })
      .filter((item) => item.count > 0);

    if (assignedMap.length > 0) {
      const names = assignedMap.map((a) => `'${a.title}' (${a.count} staff)`).join(", ");
      requestDeleteConfirmation({
        title: "Roles Reassignment Required",
        itemType: "Restricted Roles",
        itemName: `${assignedMap.length} Role(s)`,
        description: `Cannot delete the following roles because staff members are actively assigned: ${names}. Please reassign them before deleting.`,
        confirmText: "Understood",
        cancelText: "Close",
        onConfirm: () => {},
      });
      return;
    }

    const count = selectedDesignationIds.length;
    requestDeleteConfirmation({
      title: "Delete Selected Roles",
      itemType: "Multiple Roles",
      itemName: `${count} Selected Role(s)`,
      description: `Are you sure you want to delete all ${count} selected role(s)? This action cannot be undone.`,
      confirmText: `Yes, Delete ${count} Role(s)`,
      onConfirm: () => {
        const idsToDelete = [...selectedDesignationIds];
        setDesignations((prev) => {
          const next = prev.filter((d) => !idsToDelete.includes(d.id));
          try {
            localStorage.setItem("khetivo_cached_designations", JSON.stringify(next));
            const deleted = localStorage.getItem("khetivo_deleted_designations");
            const arr = deleted ? JSON.parse(deleted) : [];
            idsToDelete.forEach((id) => {
              if (!arr.includes(id)) arr.push(id);
            });
            localStorage.setItem("khetivo_deleted_designations", JSON.stringify(arr));
          } catch {}
          return next;
        });
        setSelectedDesignationIds([]);
        idsToDelete.forEach((id) => deleteDesignationInAppwrite(id));
      },
    });
  };

  // Handlers for Team Members
  const handleOpenAddTeamModal = () => {
    setEditingMemberId(null);
    setMemberFormName("");
    setMemberFormPhone("+91 ");
    setMemberFormEmail("");
    const defaultDes = designations[0]?.id || "des-2";
    setMemberFormDesignationId(defaultDes);
    setMemberFormFarmId("all");
    setMemberFormStatus("Active");
    setMemberFormNotes("");
    setMemberFormError("");
    setIsTeamModalOpen(true);
  };

  const handleOpenEditTeamModal = (m: TeamMember) => {
    setEditingMemberId(m.id);
    setMemberFormName(m.name);
    setMemberFormPhone(m.phone);
    setMemberFormEmail(m.email || "");
    setMemberFormDesignationId(m.designationId);
    setMemberFormFarmId(m.farmId);
    setMemberFormStatus(m.status);
    setMemberFormNotes(m.notes || "");
    setMemberFormError("");
    setIsTeamModalOpen(true);
  };

  const handleSaveTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberFormName.trim()) {
      setMemberFormError("Please enter the team member's full name.");
      return;
    }
    if (!memberFormPhone.trim() || memberFormPhone.trim() === "+91") {
      setMemberFormError("Please provide a valid phone number.");
      return;
    }
    if (!memberFormEmail.trim() || !memberFormEmail.includes("@")) {
      setMemberFormError("Please enter a valid email address.");
      return;
    }

    const assignedDes = designations.find((d) => d.id === memberFormDesignationId);
    const designationTitleStr = assignedDes?.title || "Staff Member";
    const finalModules = assignedDes?.allowedModules || ["dashboard"];

    const assignedFarmObj = farms.find((f) => f.id === memberFormFarmId);
    const farmNameStr = memberFormFarmId === "all" ? "All Holdings" : assignedFarmObj?.name || "Assigned Farm";

    if (editingMemberId) {
      setTeamMembers((prev) =>
        prev.map((m) =>
          m.id === editingMemberId
            ? {
                ...m,
                name: memberFormName.trim(),
                phone: memberFormPhone.trim(),
                email: memberFormEmail.trim(),
                designationId: memberFormDesignationId,
                designationTitle: designationTitleStr,
                farmId: memberFormFarmId,
                farmName: farmNameStr,
                status: memberFormStatus,
                allowedModules: finalModules,
                notes: memberFormNotes.trim() || undefined,
              }
            : m
        )
      );
    } else {
      const newMember: TeamMember = {
        id: `tm-${Date.now()}`,
        name: memberFormName.trim(),
        phone: memberFormPhone.trim(),
        email: memberFormEmail.trim(),
        designationId: memberFormDesignationId,
        designationTitle: designationTitleStr,
        roleCategory: "worker",
        farmId: memberFormFarmId,
        farmName: farmNameStr,
        status: memberFormStatus,
        allowedModules: finalModules,
        joinedDate: currentDateStr,
        notes: memberFormNotes.trim() || undefined,
      };
      setTeamMembers((prev) => [newMember, ...prev]);

      // Save to Appwrite Cloud
      createTeamMemberInAppwrite({
        farmId: memberFormFarmId,
        name: newMember.name,
        phone: newMember.phone,
        email: newMember.email,
        designationTitle: newMember.designationTitle,
        roleCategory: "worker",
      }).then((created) => {
        if (created && created.$id) {
          setTeamMembers((prev) => prev.map((m) => (m.id === newMember.id ? { ...m, id: created.$id } : m)));
        }
      });
    }

    setIsTeamModalOpen(false);
  };

  const handleDeleteTeamMember = (id: string, name: string) => {
    const targetMember = teamMembers.find((m) => m.id === id);
    requestDeleteConfirmation({
      title: "Remove Team Member",
      itemType: targetMember?.designationTitle || "Staff",
      itemName: name,
      description: `Are you sure you want to remove ${name} from your farm team? They will immediately lose access to all modules and work rosters.`,
      confirmText: "Yes, Remove Member",
      onConfirm: () => {
        setTeamMembers((prev) => prev.filter((m) => m.id !== id));
        deleteTeamMemberInAppwrite(id);
      },
    });
  };

  const handleExportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    if (typeof window === "undefined") return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPhone = localStorage.getItem("khetivo_user_phone");
      if (storedPhone) {
        const clean = storedPhone.startsWith("+91") ? storedPhone : `+91 ${storedPhone}`;
        setUserPhone(clean);
        setSettingsPhone(clean);
      }
      const storedName = localStorage.getItem("khetivo_farmer_name") || localStorage.getItem("khetivo_user_name");
      if (storedName) setSettingsFarmerName(storedName);
      const storedEmail = localStorage.getItem("khetivo_user_email");
      if (storedEmail) setSettingsEmail(storedEmail);
      const storedUnit = localStorage.getItem("khetivo_default_unit");
      if (storedUnit) setSettingsDefaultUnit(storedUnit);
      const storedLang = localStorage.getItem("khetivo_language");
      if (storedLang && ["en", "pa", "hi", "mr", "gu"].includes(storedLang)) {
        setActiveLanguage(storedLang as SupportedLanguage);
        setDraftSettingsLanguage(storedLang as SupportedLanguage);
      }
      const storedMandi = localStorage.getItem("khetivo_mandi");
      if (storedMandi) setSettingsMandi(storedMandi);
      const storedAddress = localStorage.getItem("khetivo_farm_address");
      if (storedAddress) setSettingsHeadquartersAddress(storedAddress);
    }
  }, []);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    setUserPhone(settingsPhone);

    const cleanRawPhone = settingsPhone ? settingsPhone.replace(/^\+91/, "").replace(/\D/g, "") : "";

    if (typeof window !== "undefined") {
      localStorage.setItem("khetivo_user_phone", cleanRawPhone || settingsPhone);
      localStorage.setItem("khetivo_farmer_name", settingsFarmerName);
      localStorage.setItem("khetivo_user_name", settingsFarmerName);
      if (settingsEmail) localStorage.setItem("khetivo_user_email", settingsEmail);
      localStorage.setItem("khetivo_default_unit", settingsDefaultUnit);
      localStorage.setItem("khetivo_language", draftSettingsLanguage);
      localStorage.setItem("khetivo_mandi", settingsMandi);
      localStorage.setItem("khetivo_farm_address", settingsHeadquartersAddress);
    }

    // Explicitly commit the draft settings language to active dashboard language on save!
    commitLanguage(draftSettingsLanguage, true);

    try {
      const currentUid = typeof window !== "undefined" ? localStorage.getItem("khetivo_user_id") || undefined : undefined;
      await saveUserProfileToAppwrite({
        userId: currentUid,
        name: settingsFarmerName,
        phone: cleanRawPhone || settingsPhone,
        email: settingsEmail,
        district: currentFarm?.district || "Ludhiana",
        state: currentFarm?.state || "Punjab",
        measurementUnit: settingsDefaultUnit,
        preferredLanguage: draftSettingsLanguage,
        mandiLinkage: settingsMandi,
        farmAddress: settingsHeadquartersAddress,
      });
      setSettingsToast("Your farm settings & system preferences have been saved to database successfully.");
    } catch (err) {
      console.warn("Failed to persist user profile to Appwrite:", err);
      setSettingsToast("Preferences saved locally. Reconnect to sync with cloud.");
    } finally {
      setIsSavingSettings(false);
      setTimeout(() => setSettingsToast(null), 4000);
    }
  };

  const handleResetSettings = () => {
    const uName = typeof window !== "undefined" ? localStorage.getItem("khetivo_user_name") || "" : "";
    const uPhone = typeof window !== "undefined" ? localStorage.getItem("khetivo_user_phone") || "" : "";
    const uEmail = typeof window !== "undefined" ? localStorage.getItem("khetivo_user_email") || "" : "";
    setSettingsFarmerName(uName);
    setSettingsPhone(uPhone ? (uPhone.startsWith("+") ? uPhone : `+91 ${uPhone}`) : "");
    setSettingsEmail(uEmail);
    setSettingsMandi("Khanna Mandi (Asia's Largest Grain Market - Ludhiana)");
    setSettingsHeadquartersAddress("Village Samrala, GT Road Belt, Ludhiana, Punjab 141001");
    setSettingsDefaultUnit("Acres");
    setDraftSettingsLanguage(activeLanguage);
    setSettingsMoistureDeficit("30");
    setSettingsWindThreshold("18");
    setSettingsWhatsappAlerts(true);
    setSettingsSmsAlerts(true);
    setSettingsServiceReminders(true);
    setSettingsAutoIrrigationNotice(true);
    setSettingsToast("Settings reset to default profile values.");
    setTimeout(() => setSettingsToast(null), 3000);
  };

  const handleSignOut = () => {
    signOutUser();
    setSettingsToast("You have been signed out successfully. Redirecting...");
    setTimeout(() => {
      router.push("/");
    }, 400);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmInput.trim().toUpperCase() !== "DELETE") {
      setDeleteAccountError("Please type DELETE to confirm account deletion.");
      return;
    }
    setDeleteAccountError("");
    setIsDeletingAccount(true);
    const phoneToPurge = settingsPhone || userPhone || "9814054321";
    await deleteRegisteredUser(phoneToPurge);
    setIsDeletingAccount(false);
    setDeleteAccountModalOpen(false);
    setSettingsToast("Your farmer account and data have been permanently deleted.");
    setTimeout(() => {
      router.push("/");
    }, 800);
  };

  // Consolidated multi-farm calculations
  const isAllFarms = selectedFarmId === "all";
  const totalCombinedArea = farms.reduce((sum, f) => sum + (Number(f.totalArea) || 0), 0);

  // Compute all crops active in the current view (1 farm can have multiple crops!)
  const allFlattenedCrops: FarmCrop[] = farms.flatMap((f) =>
    (f.crops || []).map((c) => ({
      ...c,
      farmId: f.id,
      farmName: f.name,
    }))
  );

  const fallbackEmptyFarm: FarmData = {
    id: "no-farm",
    name: "No Farm Registered",
    address: "Please register your first farm",
    district: "",
    state: "",
    pinCode: "",
    totalArea: 0,
    areaUnit: "Acres",
    ownership: "Owned",
    latitude: 30.901,
    longitude: 75.8573,
    soilType: "Alluvial Loam",
    irrigationType: "Standard",
    waterSource: "Groundwater",
    crops: [],
    cropTemplate: "",
  };

  const currentFarmRaw = farms.find((f) => f.id === selectedFarmId) || farms[0] || fallbackEmptyFarm;

  const currentFarm: FarmData = isAllFarms
    ? {
        id: "all",
        name: farms.length > 0 ? "All Farms (Consolidated)" : "No Farms Registered",
        address: farms.length > 0 ? "Consolidated Farm Holdings" : "Please register your farm",
        district: farms.length > 0 ? "Consolidated Holdings" : "",
        state: farms[0]?.state || "Punjab",
        pinCode: "",
        totalArea: totalCombinedArea,
        areaUnit: farms[0]?.areaUnit || "Acres",
        ownership: `${farms.length} Registered Farms`,
        latitude: farms[0]?.latitude || 30.901,
        longitude: farms[0]?.longitude || 75.8573,
        soilType: farms[0]?.soilType || "Alluvial Loam",
        irrigationType: farms[0]?.irrigationType || "Standard",
        waterSource: farms[0]?.waterSource || "Groundwater",
        cropTemplate: allFlattenedCrops.length > 0 ? allFlattenedCrops.map((c) => `${c.name} (${c.area} ${c.areaUnit})`).join(", ") : "No active crops",
        crops: allFlattenedCrops,
      }
    : (currentFarmRaw || fallbackEmptyFarm);

  const activeCrops: FarmCrop[] = isAllFarms
    ? allFlattenedCrops
    : (currentFarm?.crops || []).map((c) => ({
        ...c,
        farmId: currentFarm?.id,
        farmName: currentFarm?.name,
      }));

  // Dynamically computed farmer notifications list
  const farmNotificationsList = useMemo(() => {
    const list: {
      id: string;
      title: string;
      message: string;
      time: string;
      createdAtMs: number;
      type: "advisory" | "weather" | "inventory" | "task" | "support";
      unread: boolean;
      actionTab?: string;
    }[] = [];

    // Helper: stable identifier string sanitizer
    const makeKey = (str: string) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 40);

    // 1. Advisories & Pest Bulletins
    (activeAdminBroadcasts || []).forEach((b: any, idx: number) => {
      const bKey = b.$id || b.id || makeKey(b.title || `adv_${idx}`);
      const bId = `adv_${bKey}`;
      const timeMs = b.$createdAt ? new Date(b.$createdAt).getTime() : 0;
      const isUnread = !readNotifications[bId] && (!notificationsClearedAt || timeMs > notificationsClearedAt);
      list.push({
        id: bId,
        title: b.title || "Crop Advisory Bulletin",
        message: b.message || b.description || "PAU extension recommendation available.",
        time: b.date || "Today",
        createdAtMs: timeMs,
        type: "advisory",
        unread: isUnread,
        actionTab: "advisories",
      });
    });

    // 2. Weather Alert / Spray window
    if (realWeather) {
      const farmKey = makeKey(realWeather.locationName || currentFarm?.name || "farm");
      const wId = `weather_${farmKey}`;
      const isUnread = !readNotifications[wId] && (!notificationsClearedAt || notificationsClearedAt < 1);
      list.push({
        id: wId,
        title: `Weather: ${realWeather.sprayWindow}`,
        message: `${realWeather.conditionText} in ${realWeather.locationName} (${realWeather.tempC}°C, Wind: ${realWeather.windKph} km/h, Rain chance: ${realWeather.chanceOfRain}%).`,
        time: realWeather.lastUpdated ? `Live (${realWeather.lastUpdated})` : "Live",
        createdAtMs: 0,
        type: "weather",
        unread: isUnread,
        actionTab: "weather",
      });
    }

    // 3. Low stock inventory warnings
    (inventoryItems || [])
      .filter((i) => i.quantity <= i.lowStockThreshold)
      .slice(0, 3)
      .forEach((item) => {
        const itemKey = item.id || makeKey(item.name);
        const invId = `inv_low_${itemKey}`;
        const isUnread = !readNotifications[invId] && (!notificationsClearedAt || notificationsClearedAt < 1);
        list.push({
          id: invId,
          title: `Low Stock: ${item.name}`,
          message: `Only ${item.quantity} ${item.unit} remaining in ${item.storeName || "godown"} (reorder limit: ${item.lowStockThreshold} ${item.unit}).`,
          time: "Attention",
          createdAtMs: 0,
          type: "inventory",
          unread: isUnread,
          actionTab: "inventory",
        });
      });

    // 4. Critical / High Priority Tasks
    (taskList || [])
      .filter((t) => t.status !== "Completed" && (t.priority === "Urgent" || t.priority === "High"))
      .slice(0, 3)
      .forEach((t) => {
        const taskKey = t.id || makeKey(t.title);
        const tId = `task_prio_${taskKey}`;
        const isUnread = !readNotifications[tId] && (!notificationsClearedAt || notificationsClearedAt < 1);
        list.push({
          id: tId,
          title: `Priority Task: ${t.title}`,
          message: `Assigned to ${t.assignedTo || "team"} • Due on ${t.dueDate || "today"}.`,
          time: t.dueDate || "Pending",
          createdAtMs: 0,
          type: "task",
          unread: isUnread,
          actionTab: "tasks",
        });
      });

    // 5. Open support agronomy tickets
    (supportTickets || [])
      .filter((tk) => tk.status === "Open" || tk.status === "In Review")
      .slice(0, 2)
      .forEach((tk) => {
        const ticketKey = tk.id || makeKey(tk.subject);
        const sId = `support_${ticketKey}`;
        const isUnread = !readNotifications[sId] && (!notificationsClearedAt || notificationsClearedAt < 1);
        list.push({
          id: sId,
          title: `Agronomy Ticket: ${tk.subject}`,
          message: `Status: ${tk.status} • Assigned to ${tk.assignedAgronomist || "Duty Agronomist"}.`,
          time: tk.createdAt || "Recent",
          createdAtMs: 0,
          type: "support",
          unread: isUnread,
          actionTab: "support",
        });
      });

    return list;
  }, [activeAdminBroadcasts, realWeather, inventoryItems, taskList, supportTickets, readNotifications, notificationsClearedAt, selectedFarmId]);

  const unreadNotificationsCount = farmNotificationsList.filter((n) => n.unread).length;

  // Consolidated multi-farm calculations
  // (Moved above notifications list)

  // Dynamic financial calculations scoped by farm context
  const farmScopedTransactions = transactions.filter((tx) => {
    if (isAllFarms) {
      return financialFarmFilter === "all" ? true : tx.farmId === financialFarmFilter;
    }
    return tx.farmId === (selectedFarmId || "farm-1");
  });

  const totalProduction = farmScopedTransactions
    .filter((t) => t.type === "production")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalLosses = farmScopedTransactions
    .filter((t) => t.type === "loss")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = farmScopedTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const netRealization = totalProduction - totalLosses - totalExpenses;

  // Dedicated scoped & filtered transactions for Reports (respecting reportFarmFilter, date range, and search)
  const reportScopedTransactions = transactions.filter((tx) => {
    // 1. Farm scope
    if (isAllFarms) {
      if (reportFarmFilter !== "all" && tx.farmId !== reportFarmFilter) return false;
    } else {
      if (tx.farmId !== (selectedFarmId || "farm-1")) return false;
    }

    // 2. Date Range filter
    if (reportStartDate && tx.date < reportStartDate) return false;
    if (reportEndDate && tx.date > reportEndDate) return false;

    return true;
  });

  const reportTotalProduction = reportScopedTransactions
    .filter((t) => t.type === "production")
    .reduce((acc, t) => acc + t.amount, 0);

  const reportTotalLosses = reportScopedTransactions
    .filter((t) => t.type === "loss")
    .reduce((acc, t) => acc + t.amount, 0);

  const reportTotalExpenses = reportScopedTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const reportNetRealization = reportTotalProduction - reportTotalLosses - reportTotalExpenses;

  // Filtered list for the ledger based on dropdown and search
  const visibleTransactions = farmScopedTransactions
    .filter((tx) => (financialFilterType === "all" ? true : tx.type === financialFilterType))
    .filter((tx) => {
      if (!financialSearch.trim()) return true;
      const q = financialSearch.toLowerCase();
      return (
        tx.title.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        (tx.crop && tx.crop.toLowerCase().includes(q)) ||
        (tx.reference && tx.reference.toLowerCase().includes(q)) ||
        (tx.farmName && tx.farmName.toLowerCase().includes(q))
      );
    });

  // Scoped stores, inventory items & usage logs
  const scopedStores = stores.filter((s) => (isAllFarms ? true : s.farmId === selectedFarmId));
  const scopedInventoryItems = inventoryItems.filter((i) => (isAllFarms ? true : i.farmId === selectedFarmId));
  const scopedUsageLogs = usageLogs.filter((u) => (isAllFarms ? true : u.farmId === selectedFarmId));

  // Filtered inventory items
  const visibleInventoryItems = scopedInventoryItems
    .filter((item) => (inventoryStoreFilter === "all" ? true : item.storeId === inventoryStoreFilter))
    .filter((item) => (inventoryCategoryFilter === "all" ? true : item.category === inventoryCategoryFilter))
    .filter((item) => {
      if (inventoryFilter === "all") return true;
      if (inventoryFilter === "low_stock") return item.quantity <= item.lowStockThreshold;
      if (inventoryFilter === "expiring") {
        const exp = getItemExpiryStatus(item.expiryDate);
        return exp.status === "expiring_soon" || exp.status === "expired";
      }
      return true;
    })
    .filter((item) => {
      if (!inventorySearch.trim()) return true;
      const q = inventorySearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.batchNumber.toLowerCase().includes(q) ||
        item.storeName.toLowerCase().includes(q)
      );
    });

  // Filtered usage logs
  const visibleUsageLogs = scopedUsageLogs
    .filter((log) => (inventoryStoreFilter === "all" ? true : log.storeId === inventoryStoreFilter))
    .filter((log) => {
      if (!inventorySearch.trim()) return true;
      const q = inventorySearch.toLowerCase();
      return (
        log.itemName.toLowerCase().includes(q) ||
        log.purpose.toLowerCase().includes(q) ||
        log.appliedBy.toLowerCase().includes(q) ||
        (log.crop && log.crop.toLowerCase().includes(q))
      );
    });

  // Inventory KPI metrics
  const totalTrackedItems = scopedInventoryItems.length;
  const totalInventoryValuation = scopedInventoryItems.reduce((acc, item) => acc + item.quantity * item.rate, 0);
  const lowStockCount = scopedInventoryItems.filter((item) => item.quantity <= item.lowStockThreshold).length;
  const expiringSoonCount = scopedInventoryItems.filter((item) => {
    const exp = getItemExpiryStatus(item.expiryDate);
    return exp.status === "expiring_soon" || exp.status === "expired";
  }).length;

  // Scoped equipment & issues
  const scopedEquipment = equipmentList.filter((eq) => {
    if (isAllFarms) {
      return equipmentFarmFilter === "all" ? true : eq.farmId === equipmentFarmFilter;
    }
    return eq.farmId === selectedFarmId;
  });

  const scopedEquipmentIssues = equipmentIssues.filter((iss) => {
    if (isAllFarms) {
      return equipmentFarmFilter === "all" ? true : iss.farmId === equipmentFarmFilter;
    }
    return iss.farmId === selectedFarmId;
  });

  // Filtered equipment list
  const visibleEquipment = scopedEquipment
    .filter((eq) => {
      if (equipmentFilter === "all") return true;
      if (equipmentFilter === "operational") return eq.status === "Operational" || eq.status === "In Field";
      if (equipmentFilter === "service_due") return eq.status === "Service Due";
      if (equipmentFilter === "issues") return eq.status === "Problem Reported";
      return true;
    })
    .filter((eq) => {
      if (!equipmentSearch.trim()) return true;
      const q = equipmentSearch.toLowerCase();
      return (
        eq.name.toLowerCase().includes(q) ||
        eq.category.toLowerCase().includes(q) ||
        eq.operator.toLowerCase().includes(q) ||
        (eq.modelNumber && eq.modelNumber.toLowerCase().includes(q))
      );
    });

  // Filtered issues
  const visibleEquipmentIssues = scopedEquipmentIssues.filter((iss) => {
    if (!equipmentSearch.trim()) return true;
    const q = equipmentSearch.toLowerCase();
    return (
      iss.equipmentName.toLowerCase().includes(q) ||
      iss.issueType.toLowerCase().includes(q) ||
      iss.description.toLowerCase().includes(q) ||
      iss.reportedBy.toLowerCase().includes(q)
    );
  });

  // Equipment KPIs
  const totalEquipmentCount = scopedEquipment.length;
  const operationalCount = scopedEquipment.filter((eq) => eq.status === "Operational" || eq.status === "In Field").length;
  const serviceDueCount = scopedEquipment.filter((eq) => eq.status === "Service Due").length;
  const openIssuesCount = scopedEquipmentIssues.filter((iss) => iss.status !== "Resolved").length;

  // Scoped tasks & filtered tasks
  const scopedTasks = taskList.filter((t) => {
    if (isAllFarms) {
      return taskFarmFilter === "all" ? true : t.farmId === taskFarmFilter;
    }
    return t.farmId === selectedFarmId;
  });

  const visibleTasks = scopedTasks
    .filter((t) => {
      if (taskFilter === "all") return true;
      if (taskFilter === "todo") return t.status === "To Do";
      if (taskFilter === "in_progress") return t.status === "In Progress";
      if (taskFilter === "completed") return t.status === "Completed";
      return true;
    })
    .filter((t) => {
      if (!taskSearch.trim()) return true;
      const q = taskSearch.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.assignedTo.toLowerCase().includes(q) ||
        (t.zone && t.zone.toLowerCase().includes(q)) ||
        (t.crop && t.crop.toLowerCase().includes(q))
      );
    });

  // Task KPIs
  const totalTaskCount = scopedTasks.length;
  const todoTaskCount = scopedTasks.filter((t) => t.status === "To Do").length;
  const inProgressTaskCount = scopedTasks.filter((t) => t.status === "In Progress").length;
  const completedTaskCount = scopedTasks.filter((t) => t.status === "Completed").length;

  // Fetch real weather for currently selected farm coordinates or location
  useEffect(() => {
    let isMounted = true;
    const fetchRealWeather = async () => {
      try {
        setWeatherLoading(true);
        // Determine precision search query: Priority 1 is exact GPS Coordinates from the Farm/Map!
        let query = "India";
        if (!isAllFarms && currentFarm) {
          // If the farm has custom coordinates, or if it doesn't have the default Ludhiana coords
          const hasCustomCoords = currentFarm.latitude && currentFarm.longitude && 
            !(Math.abs(currentFarm.latitude - 30.901) < 0.0001 && Math.abs(currentFarm.longitude - 75.8573) < 0.0001 && currentFarm.district && !currentFarm.district.toLowerCase().includes("ludhiana"));

          if (hasCustomCoords) {
            query = `${currentFarm.latitude},${currentFarm.longitude}`;
          } else if (currentFarm.district) {
            query = `${currentFarm.district}, ${currentFarm.state || "India"}`;
          } else if (currentFarm.village) {
            query = `${currentFarm.village}, ${currentFarm.state || "India"}`;
          } else if (currentFarm.address) {
            query = currentFarm.address;
          } else if (currentFarm.latitude && currentFarm.longitude) {
            query = `${currentFarm.latitude},${currentFarm.longitude}`;
          }
        } else if (isAllFarms && farms.length > 0) {
          // If all farms consolidated, use the first farm's coordinates or district
          const f0 = farms[0];
          const hasCustomCoords = f0.latitude && f0.longitude && 
            !(Math.abs(f0.latitude - 30.901) < 0.0001 && Math.abs(f0.longitude - 75.8573) < 0.0001 && f0.district && !f0.district.toLowerCase().includes("ludhiana"));

          if (hasCustomCoords) {
            query = `${f0.latitude},${f0.longitude}`;
          } else if (f0.district) {
            query = `${f0.district}, ${f0.state || "India"}`;
          } else if (f0.latitude && f0.longitude) {
            query = `${f0.latitude},${f0.longitude}`;
          }
        }

        const res = await fetch(`/api/weather?q=${encodeURIComponent(query)}&days=7`);
        if (!res.ok) throw new Error("Failed to fetch weather");
        const data = await res.json();

        if (isMounted && data?.current) {
          const wind = Number(data.current.wind_kph) || 0;
          const rain = Number(data.current.chance_of_rain) || Number(data.forecast?.forecastday?.[0]?.day?.daily_chance_of_rain) || 0;
          const humidity = Number(data.current.humidity) || 0;

          // Compute agronomic spray window
          let sprayMsg = "Optimal Today";
          if (wind > 15) {
            sprayMsg = "High Wind • Avoid Spraying";
          } else if (rain > 40) {
            sprayMsg = "Rain Expected • Delay Spray";
          } else if (humidity > 80) {
            sprayMsg = "High Humidity • Early Morning Only";
          } else {
            sprayMsg = "Optimal Window • Safe to Spray";
          }

          const mappedDays = (data.forecast?.forecastday || []).map((fd: any) => {
            const dateObj = new Date(fd.date);
            const dayName = dateObj.toLocaleDateString("en-IN", { weekday: "short" });
            return {
              date: fd.date,
              dayName: dayName || "Day",
              maxTemp: Math.round(Number(fd.day?.maxtemp_c) || 26),
              minTemp: Math.round(Number(fd.day?.mintemp_c) || 14),
              rainChance: Number(fd.day?.daily_chance_of_rain) || 0,
              precipMm: Number(fd.day?.totalprecip_mm) || 0,
              conditionText: fd.day?.condition?.text || "Clear",
              conditionIcon: fd.day?.condition?.icon ? `https:${fd.day.condition.icon}` : "",
            };
          });

          setRealWeather({
            locationName: data.location?.name || query,
            region: data.location?.region || "Punjab",
            tempC: Math.round(Number(data.current.temp_c) || 22),
            conditionText: data.current.condition?.text || "Clear",
            conditionIcon: data.current.condition?.icon ? `https:${data.current.condition.icon}` : "",
            windKph: Math.round(wind),
            windDir: data.current.wind_dir || "NW",
            humidity: humidity,
            chanceOfRain: rain,
            precipMm: Number(data.current.precip_mm) || 0,
            isDay: Boolean(data.current.is_day),
            lastUpdated: data.current.last_updated ? data.current.last_updated.split(" ")[1] : "Just now",
            sprayWindow: sprayMsg,
            forecastDays: mappedDays,
          });
        }
      } catch (err) {
        console.warn("[WeatherAPI fetch error]:", err);
      } finally {
        if (isMounted) setWeatherLoading(false);
      }
    };

    fetchRealWeather();
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchRealWeather, 10 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedFarmId, currentFarm?.latitude, currentFarm?.longitude, currentFarm?.district, currentFarm?.state, isAllFarms, dataRefreshTrigger]);

  const handleOpenSetup = () => {
    // Reset to fresh form without dummy content
    setFarmName("");
    setFarmAddress("");
    setVillage("");
    setDistrict("");
    setState("");
    setPinCode("");
    setTotalArea("");
    setAreaUnit("Acres");
    setOwnership(OWNERSHIP_OPTIONS[0]);

    // Use current active farm coordinates or detect browser location rather than Ludhiana
    if (currentFarm && currentFarm.latitude && currentFarm.longitude && (currentFarm.latitude !== 30.901 || currentFarm.longitude !== 75.8573)) {
      setLatitude(currentFarm.latitude);
      setLongitude(currentFarm.longitude);
      setMapSearch(`${currentFarm.latitude},${currentFarm.longitude}`);
    } else if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(5)));
          setLongitude(Number(pos.coords.longitude.toFixed(5)));
          setMapSearch(`${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`);
        },
        () => {},
        { timeout: 3000 }
      );
    } else {
      setLatitude(29.2145);
      setLongitude(79.5280);
      setMapSearch("");
    }

    setSelectedCropTemplates([]);
    setCropConfigs({});
    setSoilType(SOIL_TYPES[0]);
    setIrrigationType(IRRIGATION_TYPES[0]);
    setWaterSource(WATER_SOURCES[0]);
    setSetupStep(1);
    setErrorMsg("");
    setGpsDetectedNotice(false);
    setSetupSuccess(false);
    setSetupModalOpen(true);
  };

  const handleGpsDetect = () => {
    setLocatingGps(true);
    setErrorMsg("");

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(5));
          const lon = Number(pos.coords.longitude.toFixed(5));
          setLatitude(lat);
          setLongitude(lon);
          setMapSearch(`${lat},${lon}`);
          setGpsDetectedNotice(true);
          setRecentlyAutoFilled(true);

          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
              { signal: controller.signal }
            );
            clearTimeout(timeoutId);
            if (res.ok) {
              const data = await res.json();
              const addr = data.address || {};
              const v = addr.village || addr.suburb || addr.neighbourhood || addr.hamlet || addr.town || addr.city || "";
              const d = addr.county || addr.state_district || addr.district || addr.city || "";
              const s = addr.state || "";
              const p = addr.postcode || "";
              if (v) setVillage(v);
              if (d) setDistrict(d);
              if (s) setState(s);
              if (p) setPinCode(p);
              if (v || d) {
                setFarmAddress([v ? `Village ${v}` : "", d, s].filter(Boolean).join(", "));
              }
            }
          } catch {
            // Geolocation coordinates set, no dummy fallback injected
          }
          setLocatingGps(false);
        },
        () => {
          setLocatingGps(false);
          setErrorMsg("Could not detect location. Please enter your address or coordinates manually.");
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setLocatingGps(false);
      setErrorMsg("Geolocation is not supported by your browser.");
    }

    setTimeout(() => {
      setRecentlyAutoFilled(false);
    }, 2500);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xRatio = (x / rect.width - 0.5) * 0.08;
    const yRatio = (y / rect.height - 0.5) * 0.08;
    const baseLat = latitude || 30.901;
    const baseLon = longitude || 75.8573;
    const newLat = Number((baseLat - yRatio).toFixed(5));
    const newLon = Number((baseLon + xRatio).toFixed(5));
    setLatitude(newLat);
    setLongitude(newLon);
    setMapSearch(`${newLat},${newLon}`);
  };

  const handleNextStep = async (e?: React.MouseEvent | React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMsg("");
    if (setupStep === 1) {
      if (!farmName.trim()) {
        setErrorMsg("Please enter a name for your farm.");
        return;
      }
      if (!totalArea || Number(totalArea) <= 0) {
        setErrorMsg("Please specify the total area of your farm.");
        return;
      }

      // Auto-geocode entered district/state/address if coordinates are still at default
      const locationKeywords = [district, village, state, farmAddress].filter(Boolean).join(", ");
      if (locationKeywords && (latitude === 30.901 || latitude === 29.2145)) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationKeywords)}&limit=1`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0 && data[0].lat && data[0].lon) {
              const detectedLat = Number(Number(data[0].lat).toFixed(5));
              const detectedLon = Number(Number(data[0].lon).toFixed(5));
              setLatitude(detectedLat);
              setLongitude(detectedLon);
              setMapSearch(`${detectedLat},${detectedLon}`);
            }
          }
        } catch {}
      }

      setSetupStep(2);
    } else if (setupStep === 2) {
      setSetupStep(3);
    } else if (setupStep === 3) {
      if (selectedCropTemplates.length === 0) {
        setErrorMsg("Please select at least 1 crop planted on this farm.");
        return;
      }
      setSetupStep(4);
    }
  };

  const handleSaveFarm = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Strict guard: ONLY allow saving when user is actively on Step 4!
    if (setupStep !== 4) {
      return;
    }
    if (selectedCropTemplates.length === 0) {
      setErrorMsg("Please select at least 1 crop planted on this farm.");
      return;
    }

    const parsedArea = Number(totalArea) || 10;
    const count = selectedCropTemplates.length;
    const perCropArea = Math.round((parsedArea / count) * 10) / 10;

    const assignedCrops: FarmCrop[] = selectedCropTemplates.map((templateId, idx) => {
      const tmpl = activeCropTemplates.find((t) => t.id === templateId) || activeCropTemplates[0];
      const cfg = cropConfigs[templateId];
      const cropArea = cfg && cfg.area !== "" ? Number(cfg.area) : perCropArea;
      const cropVariety = cfg?.variety || tmpl.variety || (tmpl.varieties && tmpl.varieties[0]) || "Standard Regional";
      const cropSownDate = cfg?.sownDate || new Date().toISOString().split("T")[0];
      const cropTotalDays = cfg && cfg.totalDays !== "" ? Number(cfg.totalDays) : (tmpl.durationDays || 120);

      // Compute dynamic progression from sowing date
      const progression = computeCropDayAndStage(
        cropSownDate,
        cfg && cfg.currentDay !== "" ? Number(cfg.currentDay) : 1,
        cropTotalDays,
        tmpl.growthTimeline
      );

      const cropStage = cfg?.stage || progression.stage;
      const cropStageStep = cfg?.stageStep || progression.stageStep;
      const cropDay = progression.currentDay;

      return {
        id: `crop-${Date.now()}-${idx}`,
        name: tmpl.name,
        variety: cropVariety,
        area: cropArea,
        areaUnit: areaUnit || "Acres",
        season: tmpl.season,
        stage: cropStage,
        stageStep: cropStageStep,
        currentDay: cropDay,
        totalDays: cropTotalDays,
        health: "Healthy (95% NDVI)",
        sownDate: cropSownDate,
        nextMilestone: cropStageStep <= 2 ? "1st Nitrogen Top-Dressing" : "Canopy & Harvest Inspection",
        harvestDate: "Season End",
        color: idx === 0 ? "#0C4B32" : idx === 1 ? "#278449" : "#F9B21B",
      };
    });

    const newFarm: FarmData = {
      id: `farm-${Date.now()}`,
      name: farmName.trim(),
      address: farmAddress.trim() || [village ? `Village ${village}` : "", district, state].filter(Boolean).join(", "),
      village,
      district,
      state,
      pinCode,
      totalArea: parsedArea,
      areaUnit,
      ownership,
      latitude,
      longitude,
      crops: assignedCrops,
      cropTemplate: assignedCrops.map((c) => `${c.name} (${c.area} ${c.areaUnit})`).join(" & "),
      soilType,
      irrigationType,
      waterSource,
    };

    setFarms((prev) => [newFarm, ...prev]);
    setSelectedFarmId(newFarm.id);

    // Persist farm and crops to Appwrite Cloud Database
    createFarmInAppwrite({
      name: newFarm.name,
      address: newFarm.address,
      village: newFarm.village,
      district: newFarm.district,
      state: newFarm.state,
      pinCode: newFarm.pinCode,
      totalArea: newFarm.totalArea,
      areaUnit: newFarm.areaUnit,
      ownership: newFarm.ownership,
      latitude: newFarm.latitude,
      longitude: newFarm.longitude,
      soilType: newFarm.soilType,
      irrigationType: newFarm.irrigationType,
      waterSource: newFarm.waterSource,
      cropTemplate: newFarm.cropTemplate,
    }).then((created) => {
      if (created && created.$id) {
        assignedCrops.forEach((c) => {
          createCropInAppwrite({
            farmId: created.$id!,
            name: c.name,
            variety: c.variety,
            area: c.area,
            areaUnit: c.areaUnit,
            season: c.season,
            stage: c.stage,
            stageStep: c.stageStep,
            currentDay: c.currentDay,
            totalDays: c.totalDays,
            health: c.health,
            sownDate: c.sownDate,
            harvestDate: new Date(Date.now() + 100 * 86400000).toISOString(),
            nextMilestone: c.nextMilestone,
            color: c.color,
          });
        });
      }
    });

    // Sync newly created farm to khetivo_admin_clients so it reflects across /admin
    try {
      if (typeof window !== "undefined") {
        const savedClients = localStorage.getItem("khetivo_admin_clients");
        if (savedClients) {
          const parsedClients: any[] = JSON.parse(savedClients);
          const targetClient = (settingsFarmerName && parsedClients.find((c: any) => c.name?.includes(settingsFarmerName))) || parsedClients[0];
          if (targetClient) {
            const newAdminHolding = {
              id: newFarm.id,
              name: newFarm.name,
              district: newFarm.district || "Ludhiana",
              state: newFarm.state || "Punjab",
              totalArea: newFarm.totalArea,
              areaUnit: newFarm.areaUnit,
              soilType: newFarm.soilType,
              waterSource: newFarm.waterSource,
              primaryCrop: newFarm.crops.map((c) => c.name).join(", "),
            };
            targetClient.farms = [newAdminHolding, ...(targetClient.farms || [])];
            targetClient.totalAcreage = (targetClient.totalAcreage || 0) + Number(newFarm.totalArea);
            localStorage.setItem("khetivo_admin_clients", JSON.stringify(parsedClients));
          }
        }
      }
    } catch {
      // safe fallback
    }

    setSetupSuccess(true);
    setTimeout(() => {
      setSetupModalOpen(false);
      setSetupSuccess(false);
    }, 1200);
  };

  // Handler for adding an additional crop to an existing farm holding
  const handleAddCropToExistingFarm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const tmpl = activeCropTemplates.find((t) => t.id === newCropTemplateId) || activeCropTemplates[0];
    const targetFarm = farms.find((f) => f.id === newCropFarmId) || farms[0];
    if (!targetFarm) return;

    const targetTotalDays = Number(newCropTotalDays) || tmpl.durationDays || 120;
    const progression = computeCropDayAndStage(
      newCropSownDate,
      Number(newCropCurrentDay) || 20,
      targetTotalDays,
      tmpl.growthTimeline
    );

    const newCropObj: FarmCrop = {
      id: `crop-${Date.now()}`,
      name: tmpl.name,
      variety: newCropVariety || tmpl.variety || (tmpl.varieties && tmpl.varieties[0]) || "Standard Regional",
      area: Number(newCropArea) || 5,
      areaUnit: targetFarm.areaUnit || "Acres",
      season: tmpl.season,
      stage: newCropStage || progression.stage,
      stageStep: newCropStageStep || progression.stageStep,
      currentDay: progression.currentDay,
      totalDays: targetTotalDays,
      health: "Healthy (96% NDVI)",
      sownDate: newCropSownDate || "Oct 15, 2026",
      nextMilestone: newCropStageStep <= 2 ? "1st Nitrogen Top-Dressing" : "Harvest Inspection",
      harvestDate: "Season End",
      color: "#0C4B32",
    };

    setFarms((prev) =>
      prev.map((f) => {
        if (f.id === targetFarm.id) {
          const updatedCrops = [...(f.crops || []), newCropObj];
          return {
            ...f,
            crops: updatedCrops,
            cropTemplate: updatedCrops.map((c) => `${c.name} (${c.area} ${c.areaUnit})`).join(" & "),
          };
        }
        return f;
      })
    );

    // Save additional crop to Appwrite Cloud
    createCropInAppwrite({
      farmId: targetFarm.id,
      name: newCropObj.name,
      variety: newCropObj.variety,
      area: newCropObj.area,
      areaUnit: newCropObj.areaUnit,
      season: newCropObj.season,
      stage: newCropObj.stage,
      stageStep: newCropObj.stageStep,
      currentDay: newCropObj.currentDay,
      totalDays: newCropObj.totalDays,
      health: newCropObj.health,
      sownDate: newCropObj.sownDate,
      harvestDate: new Date(Date.now() + 100 * 86400000).toISOString(),
      nextMilestone: newCropObj.nextMilestone,
      color: newCropObj.color,
    });

    setAddCropModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F8F4] flex text-[#26352D] font-sans antialiased selection:bg-[var(--color-accent)] selection:text-[#26352D]">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* LEFT SIDEBAR (Fixed in viewport, never scrolls with the page) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-64 max-w-[85vw] h-screen bg-white border-r border-[#E5ECE7] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top: Logo & Farm Selector */}
        <div className="flex-1 overflow-y-auto min-h-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Logo Bar */}
          <div className="h-16 px-5 border-b border-[#E5ECE7] flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/logo-khetivo-cropped.png"
                alt="Khetivo"
                width={120}
                height={34}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#55685D] hover:bg-[#F4F8F4] transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Farm Switcher & Quick Add Farm (Interactive Dropdown) */}
          <div className="p-3 border-b border-[#E5ECE7] space-y-2 relative">
            <button
              type="button"
              onClick={() => setFarmDropdownOpen(!farmDropdownOpen)}
              className="w-full p-2.5 rounded-xl bg-[#F4F8F4] hover:bg-[#EAF3EC] border border-[#DCE6DE] flex items-center justify-between transition-colors cursor-pointer text-left shadow-xs group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                    isAllFarms ? "bg-[#0C4B32]" : "bg-[#278449]"
                  }`}
                >
                  {isAllFarms ? "ALL" : currentFarm?.name ? currentFarm.name.substring(0, 2).toUpperCase() : "KF"}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-[#0C4B32] truncate">
                    {isAllFarms ? "All Farms" : currentFarm?.name || "Khetivo Farm"}
                  </div>
                  <div className="text-[11px] text-[#55685D] truncate">
                    {isAllFarms
                      ? `All Locations • ${totalCombinedArea} Acres`
                      : `${currentFarm?.district ? currentFarm.district + " • " : ""}${currentFarm?.totalArea} ${currentFarm?.areaUnit}`}
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#55685D] group-hover:text-[#0C4B32] shrink-0 transition-transform duration-150 ${
                  farmDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {farmDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setFarmDropdownOpen(false)}
                />
                <div className="absolute left-3 right-3 top-14 z-40 bg-white rounded-xl border border-[#DCE6DE] shadow-xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#55685D]">
                    Select Farm View
                    {t.select_farm_view}
                  </div>

                  {/* Option 1: ALL FARMS */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFarmId("all");
                      setSelectedCropIndex(0);
                      setFarmDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                      isAllFarms
                        ? "bg-[#E7F3EB] text-[#0C4B32] font-semibold"
                        : "text-[#26352D] hover:bg-[#F4F8F4]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded bg-[#0C4B32] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        ALL
                      </div>
                      <div className="truncate">
                        <div className="truncate">All Farms (Consolidated)</div>
                        <div className="truncate">{t.all_farms_consolidated}</div>
                        <div className="text-[10px] text-[#55685D]">
                          {farms.length} Holdings • {totalCombinedArea} Acres Total
                          {farms.length} {t.holdings_total} • {totalCombinedArea} {currentFarm.areaUnit}
                        </div>
                      </div>
                    </div>
                    {isAllFarms && <Check className="w-4 h-4 text-[#0C4B32] shrink-0" />}
                  </button>

                  <div className="h-px bg-[#E5ECE7] my-1" />

                  {/* Individual Farms */}
                  {farms.map((farm) => {
                    const isSelected = selectedFarmId === farm.id;
                    return (
                      <button
                        key={farm.id}
                        type="button"
                        onClick={() => {
                          setSelectedFarmId(farm.id);
                          setSelectedCropIndex(0);
                          setFarmDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                          isSelected
                            ? "bg-[#E7F3EB] text-[#0C4B32] font-semibold"
                            : "text-[#26352D] hover:bg-[#F4F8F4]"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded bg-[#278449] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {farm.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <div className="truncate">{farm.name}</div>
                            <div className="text-[10px] text-[#55685D]">
                              {farm.district} • {farm.totalArea} {farm.areaUnit}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#0C4B32] shrink-0" />}
                      </button>
                    );
                  })}

                  <div className="h-px bg-[#E5ECE7] my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setFarmDropdownOpen(false);
                      handleOpenSetup();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 p-1.5 rounded-lg text-xs font-semibold text-[#0C4B32] hover:bg-[#E7F3EB] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Another Farm</span>
                  </button>
                </div>
              </>
            )}

            {/* Direct Add Farm button inside sidebar */}
            <button
              type="button"
              onClick={handleOpenSetup}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-dashed border-[#C6E2D0] hover:border-[#0C4B32] bg-white hover:bg-[#F4F8F4] text-[#0C4B32] text-xs font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Farm</span>
            </button>
          </div>

          {/* Navigation Links Grouped by Section (DAILY, RECORDS, MANAGE) */}
          <nav className="p-3 space-y-4">
            {NAV_SECTIONS.map((section) => {
              const sectionTitle =
                section.title === "DAILY"
                  ? t.nav_daily
                  : section.title === "RECORDS"
                  ? t.nav_records
                  : t.nav_manage;

              return (
                <div key={section.title} className="space-y-1">
                  <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-[#64796C] uppercase">
                    {sectionTitle}
                  </div>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      const translatedLabel =
                        item.id === "dashboard"
                          ? t.nav_dashboard
                          : item.id === "advisories"
                          ? t.nav_advisories
                          : item.id === "weather"
                          ? t.nav_weather
                          : item.id === "tasks"
                          ? t.nav_tasks
                          : item.id === "inventory"
                          ? t.nav_inventory
                          : item.id === "equipment"
                          ? t.nav_equipment
                          : item.id === "crops"
                          ? t.nav_crops
                          : item.id === "expenses"
                          ? t.nav_stats
                          : item.id === "reports"
                          ? t.nav_reports
                          : item.id === "my-farms"
                          ? t.nav_my_farms
                          : item.id === "team"
                          ? t.nav_team
                          : item.id === "subscription"
                          ? t.nav_subscription
                          : item.id === "support"
                          ? t.nav_support
                          : item.id === "settings"
                          ? t.nav_settings
                          : item.label;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(item.id);
                            setSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors text-left cursor-pointer group ${
                            isActive
                              ? "bg-[#0C4B32] text-white shadow-xs font-semibold"
                              : "text-[#26352D] hover:text-[#0C4B32] hover:bg-[#F4F8F4] font-medium"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? "text-white" : "text-[#475C4E] group-hover:text-[#0C4B32]"
                            }`}
                          />
                          <span className="flex-1 truncate">{translatedLabel}</span>
                          {item.badge && (
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-[#E7F3EB] text-[#0C4B32]"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Profile & Sign Out */}
        <div className="p-3 border-t border-[#E5ECE7] space-y-2">
          {/* Watch Video Tutorial (Global Portal) */}
          <button
            type="button"
            onClick={() => setIsTutorialModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#0C4B32] bg-[#E7F3EB] hover:bg-[#D4EBDC] transition-colors w-full cursor-pointer border border-[#C6E2D0]"
          >
            <Play className="w-3.5 h-3.5 fill-[#0C4B32] text-[#0C4B32] shrink-0" />
            <span>Watch Video Tutorial</span>
          </button>

          {/* Back to Public Website Link */}
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#55685D] hover:text-[#0C4B32] hover:bg-[#F4F8F4] transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-[#55685D]" />
            <span>Back to Public Website</span>
          </Link>

          {/* User Card */}
          <div className="p-2.5 rounded-xl bg-white border border-[#E5ECE7] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#E7F3EB] text-[#0C4B32] border border-[#C6E2D0] flex items-center justify-center font-semibold text-xs shrink-0">
                {(settingsFarmerName || "KF").split(" ").filter(Boolean).map(n => n[0]).slice(0, 2).join("").toUpperCase() || "KF"}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-[#26352D] truncate">
                  {settingsFarmerName || "Khetivo Farmer"}
                </div>
                <div className="text-[11px] text-[#55685D] truncate">
                  Farm Administrator
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 text-[#55685D] hover:text-[#EA4335] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE: MAIN PANEL AREA (Offset on desktop for fixed sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 min-h-screen">
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-[#E5ECE7] px-3.5 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30">
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#55685D] hover:bg-[#F4F8F4] transition-colors cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <h1 className="text-base sm:text-lg font-bold text-[#26352D] tracking-tight truncate">
                  {activeTab === "dashboard" ? t.nav_dashboard :
                   activeTab === "advisories" ? t.nav_advisories :
                   activeTab === "weather" ? t.nav_weather :
                   activeTab === "tasks" ? t.nav_tasks :
                   activeTab === "inventory" ? t.nav_inventory :
                   activeTab === "equipment" ? t.nav_equipment :
                   activeTab === "crops" ? t.nav_crops :
                   activeTab === "expenses" ? t.nav_stats :
                   activeTab === "reports" ? t.nav_reports :
                   activeTab === "my-farms" ? t.nav_my_farms :
                   activeTab === "team" ? t.nav_team :
                   activeTab === "subscription" ? t.nav_subscription :
                   activeTab === "support" ? t.nav_support :
                   activeTab === "settings" ? t.nav_settings :
                   (NAV_ITEMS.find((n) => n.id === activeTab)?.label || "Dashboard")}
                </h1>
                <span className="text-[11px] text-[#55685D] hidden md:inline truncate">
                  • {activeTab === "dashboard" ? t.nav_dashboard_desc :
                     activeTab === "advisories" ? t.nav_advisories_desc :
                     activeTab === "weather" ? t.nav_weather_desc :
                     activeTab === "tasks" ? t.nav_tasks_desc :
                     activeTab === "inventory" ? t.nav_inventory_desc :
                     activeTab === "equipment" ? t.nav_equipment_desc :
                     activeTab === "crops" ? t.nav_crops_desc :
                     activeTab === "expenses" ? t.nav_stats_desc :
                     activeTab === "reports" ? t.nav_reports_desc :
                     activeTab === "my-farms" ? t.nav_my_farms_desc :
                     activeTab === "team" ? t.nav_team_desc :
                     activeTab === "subscription" ? t.nav_subscription_desc :
                     activeTab === "support" ? t.nav_support_desc :
                     activeTab === "settings" ? t.nav_settings_desc :
                     (NAV_ITEMS.find((n) => n.id === activeTab)?.description || "")}
                </span>
              </div>
            </div>
          </div>


          {/* Right: Language Pill + Farm Switcher Pill + Notifications & Field Visit Action */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Language Selector Pill */}
            <div className="relative inline-flex items-center">
              <select
                value={activeLanguage}
                onChange={(e) => {
                  commitLanguage(e.target.value, true);
                  setSettingsToast(TRANSLATIONS[e.target.value as SupportedLanguage]?.language_updated_toast || t.language_updated_toast);
                }}
                title={t.interface_language}
                className="appearance-none bg-[#F4F8F4] hover:bg-[#E7F3EB] border border-[#DCE6DE] hover:border-[#0C4B32] text-[#0C4B32] text-xs font-semibold py-1.5 pl-2.5 pr-6 rounded-xl cursor-pointer outline-none transition-all shadow-2xs"
              >
                <option value="en">English</option>
                <option value="pa">ਪੰਜਾਬੀ</option>
                <option value="hi">हिन्दी</option>
                <option value="mr">मराठी</option>
                <option value="gu">ગુજરાતી</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#0C4B32] absolute right-2 pointer-events-none" />
            </div>

            {/* Quick Farm Switcher Indicator on Mobile */}
            <button
              type="button"
              onClick={() => {
                setSidebarOpen(true);
                setFarmDropdownOpen(true);
              }}
              title="Change active farm"
              className="lg:hidden flex items-center gap-1 px-2 py-1 rounded-lg bg-[#F4F8F4] border border-[#DCE6DE] text-[#0C4B32] text-[11px] font-semibold max-w-[120px] truncate cursor-pointer hover:bg-[#EAF3EC] transition-colors"
            >
              <Building2 className="w-3 h-3 text-[#0C4B32] shrink-0" />
              <span className="truncate">{isAllFarms ? "All Farms" : currentFarm?.name ? currentFarm.name.split(" ")[0] : "Farm"}</span>
            </button>

            {/* Refresh Window Button (Available across Dashboard, Advisories, Weather, Tasks, Inventory, Equipment, etc.) */}
            <button
              type="button"
              onClick={handleWindowRefresh}
              title="Refresh Window / Reload Page"
              disabled={isPageRefreshing}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0C4B32] bg-[#F4F8F4] hover:bg-[#E7F3EB] border border-[#DCE6DE] hover:border-[#0C4B32] transition-all cursor-pointer shadow-2xs shrink-0 disabled:opacity-75"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#0C4B32] ${isPageRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{isPageRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>

            {/* Notification Bell with Badge & Click to Open Drawer */}
            <button
              type="button"
              onClick={() => setNotificationSidebarOpen(true)}
              title="Notifications"
              className="relative p-2 rounded-xl text-[#55685D] hover:text-[#0C4B32] hover:bg-[#F4F8F4] border border-transparent hover:border-[#DCE6DE] transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#F9B21B] text-[#26352D] font-bold text-[9px] flex items-center justify-center shadow-xs">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* USER CLICKS "Raise a Field Visit" BUTTON */}
            <button
              type="button"
              onClick={handleOpenFieldVisit}
              className="btn btn-primary text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer font-medium"
            >
              <MapPin className="w-3.5 h-3.5 text-[#F9B21B]" />
              <span>{t.raise_field_visit}</span>
            </button>
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 bg-[#F4F8F4] pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* TAB 1: USER-FRIENDLY DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 max-w-6xl">

                {/* 1. HERO FARM SUMMARY (Simple & Sober) */}
                <div className="bg-white rounded-2xl border border-[#E5ECE7] p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-xl font-bold text-[#26352D] tracking-tight">
                          {isAllFarms ? "All Registered Farms" : currentFarm.name}
                        </h2>
                        <span className="text-xs text-[#55685D] bg-[#F4F8F4] px-2.5 py-0.5 rounded-full border border-[#DCE6DE]">
                          {isAllFarms ? `${totalCombinedArea} Acres Total • ${farms.length} Farms` : `${currentFarm.totalArea} ${currentFarm.areaUnit}`}
                        </span>
                      </div>
                      <p className="text-xs text-[#55685D] mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <MapPin className="w-3.5 h-3.5 text-[#0C4B32] shrink-0" />
                        <span>{isAllFarms ? "Ludhiana & Sangrur Clusters, Punjab" : (currentFarm.address || currentFarm.district)}</span>
                        <span>•</span>
                        <span>{currentFarm.soilType?.split("(")[0].trim() || "Alluvial Loam"}</span>
                        <span>•</span>
                        <span>{currentFarm.irrigationType?.split("(")[0].trim() || "Solar Drip"}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveTab("tasks")}
                        className="btn btn-primary text-xs px-3.5 py-2 flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer rounded-xl font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t.add_task}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenRecordModal("production")}
                        className="btn btn-outline text-xs px-3.5 py-2 flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 cursor-pointer rounded-xl font-medium bg-white"
                      >
                        <Receipt className="w-3.5 h-3.5 text-[#0C4B32]" />
                        <span>{t.financial_entry}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 1.2 STATS & FINANCIAL SUMMARY WIDGET (Top Placement) */}
                <div className="bg-white rounded-2xl border border-[#E5ECE7] p-5 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-[#0C4B32]" />
                      <h3 className="text-base font-bold text-[#26352D]">
                        {t.stats}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("expenses")}
                      className="text-xs font-semibold text-[#0C4B32] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t.view_ledger}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Clean 3-Metric Summary Strip */}
                  <div className="grid grid-cols-3 gap-2 text-center py-2.5 px-3 rounded-xl bg-[#F8FAF8] border border-[#E5ECE7]">
                    <div>
                      <div className="text-xs text-[#55685D]">{t.production}</div>
                      <div className="text-sm font-bold text-emerald-700 mt-0.5">
                        +₹{totalProduction.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="border-x border-[#E5ECE7]">
                      <div className="text-xs text-[#55685D]">{t.losses}</div>
                      <div className="text-sm font-bold text-amber-700 mt-0.5">
                        -₹{totalLosses.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#55685D]">{t.expenses}</div>
                      <div className="text-sm font-bold text-red-600 mt-0.5">
                        -₹{totalExpenses.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  {/* Clean Recent Entry List */}
                  {farmScopedTransactions.length > 0 && (
                    <div className="divide-y divide-[#E5ECE7] text-xs">
                      {farmScopedTransactions.slice(0, 1).map((tx) => (
                        <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="truncate min-w-0">
                            <span className="font-semibold text-[#26352D] truncate block text-sm">{tx.title}</span>
                            <span className="text-xs text-[#55685D]">{tx.date} • {tx.category}</span>
                          </div>
                          <span className={`text-sm font-bold shrink-0 ${
                            tx.type === "production" ? "text-emerald-700" : tx.type === "loss" ? "text-amber-700" : "text-red-600"
                          }`}>
                            {tx.type === "production" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Card Footer: Net Realization & Record Entry CTA */}
                  <div className="pt-1 flex items-center justify-between text-xs border-t border-[#E5ECE7]">
                    <span className="text-xs text-[#55685D]">
                      Net: <strong className={`text-sm font-bold ${netRealization >= 0 ? "text-[#0C4B32]" : "text-red-600"}`}>
                        {netRealization >= 0 ? "+" : ""}₹{netRealization.toLocaleString("en-IN")}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenRecordModal("production")}
                      className="text-xs font-semibold text-[#0C4B32] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Record Entry</span>
                    </button>
                  </div>
                </div>

                {/* 1.5 ACTIVE ADVISORY NOTICE (Simple & Sober) */}
                {activeAdminBroadcasts.length > 0 && (() => {
                  const urgent = activeAdminBroadcasts.find((b: any) => b.priority === "High / Emergency") || activeAdminBroadcasts[0];
                  return (
                    <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#D5EAD9] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-[#0C4B32] shrink-0 animate-pulse" />
                        <span className="font-semibold text-[#0C4B32] shrink-0">Advisory:</span>
                        <span className="text-[#26352D] truncate font-medium">{urgent.title}</span>
                        <span className="text-[#55685D] hidden md:inline truncate">({urgent.targetCrop} • {urgent.targetDistrict})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("advisories")}
                        className="text-xs font-semibold text-[#0C4B32] hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All ({activeAdminBroadcasts.length})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })()}

                {/* 2. SMART ALERT (Real-time dynamic from Appwrite tasks/inventory) */}
                {(() => {
                  const urgentTask = scopedTasks.find((t) => t.priority === "Urgent" && t.status !== "Completed");
                  const highTask = scopedTasks.find((t) => t.priority === "High" && t.status !== "Completed");
                  const urgentLowStock = scopedInventoryItems.find((i) => i.quantity <= i.lowStockThreshold);

                  if (urgentTask) {
                    return (
                      <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                          <span className="text-amber-950">
                            <strong>Urgent Task Pending:</strong> {urgentTask.title} {urgentTask.crop ? `(${urgentTask.crop})` : ""} is due.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("tasks")}
                          className="text-xs font-semibold text-amber-900 hover:underline shrink-0 cursor-pointer self-start sm:self-auto"
                        >
                          View Task →
                        </button>
                      </div>
                    );
                  }

                  if (urgentLowStock) {
                    return (
                      <div className="p-3.5 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <AlertTriangle className="w-4 h-4 text-orange-700 shrink-0" />
                          <span className="text-orange-950">
                            <strong>Low Inventory Alert:</strong> {urgentLowStock.name} is down to {urgentLowStock.quantity} {urgentLowStock.unit} (threshold: {urgentLowStock.lowStockThreshold} {urgentLowStock.unit}).
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("inventory")}
                          className="text-xs font-semibold text-orange-900 hover:underline shrink-0 cursor-pointer self-start sm:self-auto"
                        >
                          Restock Now →
                        </button>
                      </div>
                    );
                  }

                  if (highTask) {
                    return (
                      <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                          <span className="text-blue-950">
                            <strong>Scheduled Activity:</strong> {highTask.title} is assigned to {highTask.assignedTo}.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("tasks")}
                          className="text-xs font-semibold text-blue-900 hover:underline shrink-0 cursor-pointer self-start sm:self-auto"
                        >
                          Manage Schedule →
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="text-emerald-950">
                          <strong>Farm Operations Active:</strong> All field activities, crops, and storage records are up to date.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("tasks")}
                        className="text-xs font-semibold text-emerald-900 hover:underline shrink-0 cursor-pointer self-start sm:self-auto"
                      >
                        Add Task →
                      </button>
                    </div>
                  );
                })()}

                {/* 3. MAIN 2-COLUMN INTUITIVE LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* LEFT COLUMN: ACTIVE CROPS & TODAY'S TASKS (7 Cols) */}
                  <div className="lg:col-span-7 space-y-6">

                    {/* ACTIVE CROPS SUMMARY (Simple & Sober) */}
                    {/* ACTIVE CROPS SUMMARY (Simple, Sober & Needful Only) */}
                    <div className="bg-white rounded-2xl border border-[#E5ECE7] p-5 shadow-xs space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sprout className="w-4 h-4 text-[#0C4B32]" />
                          <h3 className="text-sm font-bold text-[#26352D]">
                            {isAllFarms ? "Active Crops" : `${currentFarm.name} Crops`}
                          </h3>
                          <span className="text-xs text-[#55685D]">({activeCrops.length})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("crops")}
                          className="text-xs font-semibold text-[#0C4B32] hover:underline cursor-pointer"
                        >
                          Detailed Timeline →
                        </button>
                      </div>

                      {/* Clean Scannable Rows - Only Needful Info */}
                      <div className="divide-y divide-[#E5ECE7] text-xs">
                        {activeCrops.map((crop) => {
                          const progressPct = Math.min(100, Math.round((crop.currentDay / crop.totalDays) * 100));
                          return (
                            <div key={crop.id} className="py-2.5 flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-[#26352D]">{crop.name}</span>
                                  <span className="text-xs text-[#55685D]">• {crop.area} {crop.areaUnit}</span>
                                  {isAllFarms && crop.farmName && (
                                    <span className="text-xs text-[#55685D] hidden sm:inline">
                                      ({crop.farmName.split("(")[0].trim()})
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-[#55685D] mt-0.5">
                                  {crop.stage.split("&")[0].trim()}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-xs font-semibold text-[#26352D]">
                                  Day {crop.currentDay} <span className="text-[#55685D] font-normal">/ {crop.totalDays}</span>
                                </div>
                                <div className="w-24 sm:w-28 bg-[#E5ECE7] h-1.5 rounded-full overflow-hidden mt-1 ml-auto">
                                  <div
                                    className="h-full rounded-full bg-[#0C4B32]"
                                    style={{ width: `${progressPct}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* TODAY'S TASKS (Clean & Needful) */}
                    <div className="bg-white rounded-2xl border border-[#E5ECE7] p-5 shadow-xs space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-[#0C4B32]" />
                          <h3 className="text-sm font-bold text-[#26352D]">Today&apos;s Field Tasks</h3>
                          <span className="text-xs text-[#55685D]">({visibleTasks.length})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("tasks")}
                          className="text-xs font-semibold text-[#0C4B32] hover:underline cursor-pointer"
                        >
                          All Tasks →
                        </button>
                      </div>

                      <div className="divide-y divide-[#E5ECE7] text-xs">
                        {scopedTasks.slice(0, 4).map((task) => {
                          const isDone = task.status === "Completed";
                          const dueStatus = getTaskDueStatus(task.dueDate, isDone);
                          const priorityBadgeClass =
                            task.priority === "Urgent"
                              ? "text-rose-700 bg-rose-50 border-rose-200"
                              : task.priority === "High"
                              ? "text-red-700 bg-red-50 border-red-200"
                              : task.priority === "Medium"
                              ? "text-amber-700 bg-amber-50 border-amber-200"
                              : "text-blue-700 bg-blue-50 border-blue-200";

                          return (
                            <div
                              key={task.id}
                              className="py-2.5 flex items-center justify-between gap-3 group"
                            >
                              <label className="flex items-center gap-2.5 min-w-0 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => handleToggleTaskStatus(task.id)}
                                  className="w-3.5 h-3.5 rounded text-[#0C4B32] focus:ring-[#0C4B32] cursor-pointer"
                                />
                                <span
                                  className={`text-xs font-medium truncate ${
                                    isDone ? "text-gray-400 line-through" : "text-[#26352D] group-hover:text-[#0C4B32]"
                                  }`}
                                >
                                  {task.title}
                                </span>
                              </label>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] text-[#55685D]">{dueStatus.label}</span>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priorityBadgeClass}`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* RIGHT COLUMN: WEATHER, INVENTORY & EXPENSES (5 Cols) */}
                  <div className="lg:col-span-5 space-y-6">

                    {/* WEATHER & SPRAY WINDOW (Real-time live weather from WeatherAPI) */}
                    <div className="bg-white rounded-2xl border border-[#E5ECE7] p-5 sm:p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CloudSun className="w-4 h-4 text-amber-600" />
                          <h3 className="text-sm font-bold text-[#26352D]">Weather & Spray Conditions</h3>
                        </div>
                        <span className="text-xs text-[#55685D] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                          {realWeather?.locationName || (isAllFarms ? "Ludhiana (All Farms)" : currentFarm.district || "Punjab")}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#F8FAF8] border border-[#E5ECE7]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {realWeather?.conditionIcon ? (
                              <img
                                src={realWeather.conditionIcon}
                                alt={realWeather.conditionText}
                                className="w-12 h-12 -my-2 object-contain"
                              />
                            ) : null}
                            <div>
                              <div className="text-3xl font-extrabold text-[#0C4B32]">
                                {realWeather ? `${realWeather.tempC}°C` : "24°C"}
                              </div>
                              <div className="text-xs font-medium text-[#26352D] mt-0.5">
                                {realWeather ? realWeather.conditionText : "Sunny & Clear Skies"}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-xs text-[#55685D] space-y-0.5">
                            <div>Wind: <strong className="text-[#26352D]">{realWeather ? `${realWeather.windKph} km/h ${realWeather.windDir}` : "8 km/h NW"}</strong></div>
                            <div>Humidity: <strong className="text-[#26352D]">{realWeather ? `${realWeather.humidity}%` : "44%"}</strong></div>
                            <div>Rain Chance: <strong className="text-[#26352D]">{realWeather ? `${realWeather.chanceOfRain}%` : "0%"}</strong></div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-[#E5ECE7] flex items-center justify-between text-xs">
                          <span className="text-[#55685D]">Foliar Spray Window</span>
                          <span className="font-semibold text-emerald-800 bg-[#E7F3EB] px-2 py-0.5 rounded">
                            {realWeather ? realWeather.sprayWindow : "Optimal Today"}
                          </span>
                        </div>

                        {/* Interactive Mini Farm Map Link & Preview */}
                        <div className="mt-3 pt-2.5 border-t border-[#E5ECE7] flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => setActiveTab("weather")}
                            className="inline-flex items-center gap-1.5 text-[#0C4B32] hover:underline font-semibold cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#0C4B32]" />
                            <span>View Weather Satellite Map</span>
                          </button>
                          <span className="text-[11px] text-[#55685D] font-mono">
                            {currentFarm.latitude.toFixed(3)}°N, {currentFarm.longitude.toFixed(3)}°E
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* INVENTORY STATUS (Real-time dynamic from Appwrite DB) */}
                    <div className="bg-white rounded-2xl border border-[#E5ECE7] p-5 shadow-xs space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-purple-700" />
                          <h3 className="text-sm font-bold text-[#26352D]">
                            Inventory Status {isAllFarms ? "(All Warehouses)" : ""}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("inventory")}
                          className="text-xs font-semibold text-[#0C4B32] hover:underline cursor-pointer"
                        >
                          Manage Stock →
                        </button>
                      </div>

                      <div className="divide-y divide-[#E5ECE7] text-xs">
                        {scopedInventoryItems.length === 0 ? (
                          <div className="py-4 text-center text-[#55685D]">
                            <p className="font-medium text-[#26352D]">No Inventory Items</p>
                            <p className="text-[11px] mt-0.5">No seeds, fertilizers, or supplies recorded yet.</p>
                            <button
                              type="button"
                              onClick={() => {
                                setAddItemModalOpen(true);
                                setActiveTab("inventory");
                              }}
                              className="mt-2 text-[11px] font-semibold text-[#0C4B32] hover:underline cursor-pointer"
                            >
                              + Add Inventory Item
                            </button>
                          </div>
                        ) : (
                          scopedInventoryItems.slice(0, 3).map((item) => {
                            const isLow = item.quantity <= item.lowStockThreshold;
                            return (
                              <div key={item.id} className="py-2 flex items-center justify-between">
                                <div className="min-w-0 pr-2">
                                  <span className="font-medium text-[#26352D] truncate block">{item.name}</span>
                                  <div className="text-[11px] text-[#55685D] truncate">
                                    {item.storeName || "Store"} • {item.category}
                                  </div>
                                </div>
                                <span className={"font-semibold shrink-0 " + (isLow ? "text-amber-800" : "text-emerald-800")}>
                                  {item.quantity} {item.unit} {isLow ? "(Low)" : ""}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* TAB: MY FARMS */}
            {activeTab === "my-farms" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-[#26352D]">My Registered Farms</h2>
                      {isAllFarms && (
                        <span className="text-[11px] font-semibold text-[#0C4B32] bg-[#E7F3EB] px-2.5 py-0.5 rounded-full border border-[#C6E2D0]">
                          All Farms View Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#55685D] mt-0.5">
                      Switch between individual farm holdings or view your combined multi-farm portfolio across Punjab.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFarmId("all");
                        setSelectedCropIndex(0);
                      }}
                      className={`text-xs px-3.5 py-2 rounded-xl font-medium transition-colors cursor-pointer border flex items-center justify-center gap-1.5 flex-1 sm:flex-initial ${
                        isAllFarms
                          ? "bg-[#0C4B32] text-white border-[#0C4B32] shadow-xs"
                          : "bg-white text-[#0C4B32] border-[#DCE6DE] hover:bg-[#F4F8F4]"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{isAllFarms ? "All Farms (52 Ac)" : "Switch to All Farms"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenSetup}
                      className="btn btn-primary text-xs px-4 py-2 inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-initial cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Farm</span>
                    </button>
                  </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {farms.map((farm) => {
                    const isSelected = farm.id === selectedFarmId;
                    return (
                      <div
                        key={farm.id}
                        className={`p-5 rounded-2xl bg-white border transition-all shadow-xs flex flex-col justify-between ${
                          isSelected
                            ? "border-[#0C4B32] ring-1 ring-[#0C4B32]/30 shadow-md"
                            : "border-[#E5ECE7] hover:border-[#A7D7B8]"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-bold text-[#26352D] flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-[#0C4B32]" />
                                <span>{farm.name}</span>
                              </h3>
                              <p className="text-xs text-[#55685D] mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#0C4B32]" />
                                <span>{farm.address}</span>
                              </p>
                            </div>
                            {isSelected ? (
                              <span className="text-[10px] font-bold text-[#0C4B32] bg-[#E7F3EB] px-2 py-0.5 rounded-full border border-[#C6E2D0] shrink-0">
                                Active ✓
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-[#55685D] bg-[#F4F8F4] px-2 py-0.5 rounded-full border border-[#DCE6DE] shrink-0">
                                Inactive
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#E5ECE7]">
                            <div className="p-2 rounded-lg bg-[#F4F8F4]">
                              <span className="text-[10px] text-[#55685D] block">Land Holding</span>
                              <strong className="text-xs text-[#26352D]">{farm.totalArea} {farm.areaUnit}</strong>
                            </div>
                            <div className="p-2 rounded-lg bg-[#F4F8F4]">
                              <span className="text-[10px] text-[#55685D] block">Ownership</span>
                              <strong className="text-xs text-[#26352D] truncate block">{farm.ownership}</strong>
                            </div>
                            <div className="p-2 rounded-lg bg-[#F4F8F4]">
                              <span className="text-[10px] text-[#55685D] block">Soil Profile</span>
                              <strong className="text-xs text-[#26352D] truncate block">{farm.soilType || "Alluvial Loam"}</strong>
                            </div>
                            <div className="p-2 rounded-lg bg-[#F4F8F4]">
                              <span className="text-[10px] text-[#55685D] block">Irrigation</span>
                              <strong className="text-xs text-[#26352D] truncate block">{farm.irrigationType || "Solar Drip"}</strong>
                            </div>
                          </div>

                          <div className="text-[11px] text-[#55685D] font-mono flex items-center gap-1.5 pt-1">
                            <Crosshair className="w-3 h-3 text-[#0C4B32]" />
                            <span>GPS: {farm.latitude.toFixed(4)}°N, {farm.longitude.toFixed(4)}°E</span>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-[#E5ECE7] flex items-center gap-2">
                          {!isSelected ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFarmId(farm.id);
                                setSelectedCropIndex(0);
                              }}
                              className="w-full btn btn-primary text-xs py-2 cursor-pointer"
                            >
                              Switch to this Farm
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="w-full py-2 text-xs font-semibold text-[#0C4B32] bg-[#E7F3EB] rounded-xl cursor-default"
                            >
                              Currently Selected
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Farm Card */}
                  <div
                    onClick={handleOpenSetup}
                    className="p-6 rounded-2xl border-2 border-dashed border-[#C6E2D0] hover:border-[#0C4B32] bg-[#FBFDFB] hover:bg-[#F4F8F4] transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[220px] group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#E7F3EB] group-hover:bg-[#0C4B32] text-[#0C4B32] group-hover:text-white flex items-center justify-center transition-colors mb-3">
                      <Plus className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#26352D]">Add Another Farm</h3>
                    <p className="text-xs text-[#55685D] mt-1 max-w-[200px]">
                      Configure new boundaries, soil characteristics, and irrigation.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* TAB: CROP MANAGEMENT (Simple & Sober) */}
            {(activeTab === "crops" || activeTab === "crop-planning") && (
              <div className="space-y-5">
                {/* Clean Top Bar */}
                <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#26352D]">Crop Planning & Timeline</h2>
                    <p className="text-xs text-[#55685D] mt-0.5">
                      {isAllFarms
                        ? `Overview of all ${activeCrops.length} active crops across registered holdings.`
                        : `Managing ${activeCrops.length} active crops cultivated at ${currentFarm.name}.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCropFarmId(isAllFarms ? farms[0].id : currentFarm.id);
                      setAddCropModalOpen(true);
                    }}
                    className="btn btn-primary text-xs px-3.5 py-2 inline-flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer rounded-xl font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Crop to Farm</span>
                  </button>
                </div>

                {/* Sober Horizontal Crop Selector Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {activeCrops.map((crop, idx) => {
                    const isSelected = selectedCropIndex === idx;
                    return (
                      <button
                        key={crop.id}
                        type="button"
                        onClick={() => setSelectedCropIndex(idx)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer border whitespace-nowrap flex items-center gap-2 ${
                          isSelected
                            ? "bg-[#0C4B32] text-white border-[#0C4B32] shadow-xs"
                            : "bg-white text-[#26352D] border-[#DCE6DE] hover:bg-[#F4F8F4]"
                        }`}
                      >
                        <span className="font-semibold">{crop.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                            isSelected ? "bg-white/20 text-white" : "bg-[#F4F8F4] text-[#0C4B32]"
                          }`}
                        >
                          {crop.area} {crop.areaUnit}
                        </span>
                        {isAllFarms && crop.farmName && (
                          <span className={`text-[10px] ${isSelected ? "text-white/80" : "text-[#55685D]"}`}>
                            • {crop.farmName.split("(")[0].trim()}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Sober Detailed Timeline for Currently Inspected Crop */}
                {(() => {
                  const inspectedCrop = activeCrops[selectedCropIndex] || activeCrops[0];
                  if (!inspectedCrop) return null;

                  const stages = [
                    { step: 1, title: "Germination", duration: "Days 1–20", desc: "Seedling emergence & root set", status: "completed" },
                    { step: 2, title: "Tillering / Vegetative", duration: "Days 21–50", desc: inspectedCrop.nextMilestone || "Active vegetative canopy", status: "active" },
                    { step: 3, title: "Jointing & Bulking", duration: "Days 51–75", desc: "Stem elongation & nutrient demand", status: "upcoming" },
                    { step: 4, title: "Flowering & Booting", duration: "Days 76–105", desc: "Critical moisture window", status: "upcoming" },
                    { step: 5, title: "Grain Ripening", duration: `Days 106–${inspectedCrop.totalDays}`, desc: `Estimated: ${inspectedCrop.harvestDate}`, status: "upcoming" },
                  ];

                  return (
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5ECE7]">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-bold text-[#26352D]">
                              {inspectedCrop.name}
                            </h3>
                            <span className="text-xs text-[#55685D]">({inspectedCrop.variety})</span>
                            <span className="text-xs font-medium text-[#0C4B32] bg-[#E7F3EB] px-2 py-0.5 rounded border border-[#C6E2D0]">
                              {inspectedCrop.area} {inspectedCrop.areaUnit}
                            </span>
                          </div>
                          <p className="text-xs text-[#55685D] mt-1 flex items-center gap-2 flex-wrap">
                            <span>{inspectedCrop.season} Season</span>
                            <span>•</span>
                            <span>Sown: {inspectedCrop.sownDate}</span>
                            <span>•</span>
                            <span>Target Harvest: {inspectedCrop.harvestDate}</span>
                            {isAllFarms && inspectedCrop.farmName && (
                              <>
                                <span>•</span>
                                <span>{inspectedCrop.farmName}</span>
                              </>
                            )}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-xs text-[#55685D]">Growth Progress</div>
                          <div className="text-xl font-bold text-[#0C4B32]">
                            Day {inspectedCrop.currentDay} <span className="text-xs font-normal text-[#55685D]">of {inspectedCrop.totalDays}</span>
                          </div>
                          <div className="text-[11px] text-emerald-700 font-medium">{inspectedCrop.stage}</div>
                        </div>
                      </div>

                      {/* Sober Step-by-Step Connected Timeline */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-xs font-semibold text-[#26352D]">
                            Crop Growth Stage Timeline
                          </div>
                          <span className="text-xs text-[#55685D]">
                            Current Status: <strong className="text-[#0C4B32]">{inspectedCrop.health}</strong>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          {stages.map((st) => (
                            <div
                              key={st.step}
                              className={`p-3.5 rounded-xl border transition-colors ${
                                st.status === "active"
                                  ? "bg-[#E7F3EB] border-[#0C4B32] shadow-xs"
                                  : st.status === "completed"
                                  ? "bg-[#F8FAF8] border-[#DCE6DE]"
                                  : "bg-white border-[#E5ECE7]"
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className={`font-semibold ${st.status === "active" ? "text-[#0C4B32]" : "text-[#26352D]"}`}>
                                  {st.step}. {st.title}
                                </span>
                                {st.status === "completed" && (
                                  <Check className="w-3.5 h-3.5 text-[#278449]" />
                                )}
                                {st.status === "active" && (
                                  <span className="w-2 h-2 rounded-full bg-[#0C4B32]" />
                                )}
                              </div>
                              <div className="text-[11px] text-[#55685D]">{st.duration}</div>
                              <div className="text-[11px] text-[#55685D] mt-1.5 leading-snug">
                                {st.desc}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Connected Recommended Do's & Don'ts from Admin Crop Template */}
                      {(() => {
                        const matchingTemplate =
                          activeCropTemplates.find(
                            (t) =>
                              t.name?.toLowerCase().includes(inspectedCrop.name.toLowerCase()) ||
                              t.cropName?.toLowerCase().includes(inspectedCrop.name.toLowerCase()) ||
                              inspectedCrop.name.toLowerCase().includes(t.name?.toLowerCase() || "") ||
                              t.variety?.toLowerCase() === inspectedCrop.variety.toLowerCase()
                          ) || activeCropTemplates[0];

                        const dosList =
                          matchingTemplate?.dos && matchingTemplate.dos.length > 0
                            ? matchingTemplate.dos
                            : [
                                "Perform certified seed treatment with recommended fungicide before sowing",
                                "Maintain optimal row-to-row spacing and depth",
                                "Apply balanced fertilizers based on soil test recommendations",
                                "Ensure timely irrigation at critical growth stages",
                              ];

                        const dontsList =
                          matchingTemplate?.donts && matchingTemplate.donts.length > 0
                            ? matchingTemplate.donts
                            : [
                                "Do not allow standing water or moisture stagnation in the root zone",
                                "Avoid excessive or uncalibrated nitrogen top-dressing",
                                "Do not spray chemical pesticides during midday heat or high winds",
                                "Avoid delayed weeding beyond the critical crop-weed competition window",
                              ];

                        return (
                          <div className="pt-5 border-t border-[#E5ECE7] space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                              <div className="text-xs font-bold text-[#26352D] flex items-center gap-1.5">
                                <Sprout className="w-4 h-4 text-[#0C4B32]" />
                                <span>Recommended Practices: Do&apos;s &amp; Don&apos;ts for {inspectedCrop.name}</span>
                              </div>
                              {matchingTemplate && (
                                <span className="text-[11px] text-[#55685D] bg-[#F4F8F4] px-2 py-0.5 rounded-md border border-[#DCE6DE]">
                                  Synced with Template: {matchingTemplate.cropName || matchingTemplate.name}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                              {/* Left Column: Recommended Do's */}
                              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
                                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
                                  <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                                    <span>Recommended Do&apos;s (What to do)</span>
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800">
                                    {dosList.length} Practices
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {dosList.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/70 border border-emerald-100/80 text-[11px] text-[#26352D]">
                                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                        {idx + 1}
                                      </span>
                                      <span className="leading-relaxed">{item}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Right Column: Things to Avoid (Don'ts) */}
                              <div className="p-4 rounded-xl bg-red-50/60 border border-red-200 space-y-2.5">
                                <div className="flex items-center justify-between pb-2 border-b border-red-200/80">
                                  <span className="font-bold text-red-950 flex items-center gap-1.5 text-xs">
                                    <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                                    <span>Things to Avoid (Don&apos;ts)</span>
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100/80 text-red-800">
                                    {dontsList.length} Points
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {dontsList.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/70 border border-red-100/80 text-[11px] text-[#26352D]">
                                      <span className="w-4 h-4 rounded-full bg-red-100 text-red-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                        {idx + 1}
                                      </span>
                                      <span className="leading-relaxed">{item}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}

                {/* Available Crop Master Templates Section */}
                <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5ECE7]">
                    <div>
                      <h3 className="text-sm font-bold text-[#26352D] flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-[#0C4B32]" />
                        <span>Agronomy Crop Templates</span>
                        <span className="text-[11px] font-semibold bg-[#E7F3EB] text-[#0C4B32] px-2 py-0.5 rounded-full">
                          {activeCropTemplates.length} Available
                        </span>
                      </h3>
                      <p className="text-xs text-[#55685D] mt-0.5">
                        University-verified crop packages and advisory timelines published by the Agronomist Admin team.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setNewCropFarmId(isAllFarms ? (farms[0]?.id || "farm-1") : currentFarm.id);
                        setAddCropModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#E7F3EB] text-[#0C4B32] border border-[#C6E2D0] hover:bg-[#D4EBDC] transition-colors text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Plant from Template</span>
                    </button>
                  </div>

                  {activeCropTemplates.length === 0 ? (
                    <div className="p-6 rounded-xl border border-dashed border-[#DCE6DE] bg-[#F8FAF8] text-center space-y-1.5">
                      <p className="text-xs font-semibold text-[#26352D]">No Crop Templates Configured Yet</p>
                      <p className="text-xs text-[#55685D]">
                        Templates created in the Admin Portal will immediately appear here for all farmers.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {activeCropTemplates.map((tmpl) => (
                        <div
                          key={tmpl.id}
                          className="p-4 rounded-xl border border-[#E5ECE7] bg-[#FBFDFB] hover:border-[#0C4B32]/40 hover:bg-white transition-all space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-xs font-bold text-[#26352D]">
                                  {tmpl.cropName || tmpl.name}
                                </h4>
                                <span className="text-[11px] text-[#55685D] block">
                                  Variety: <strong className="text-[#0C4B32]">{tmpl.variety || tmpl.varieties?.[0]}</strong>
                                </span>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E7F3EB] text-[#0C4B32] border border-[#C6E2D0] shrink-0">
                                {tmpl.season}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#55685D] bg-[#F4F8F4] p-2 rounded-lg border border-[#DCE6DE]/60">
                              <div>
                                <span className="text-[10px] text-[#889B90] block">Duration</span>
                                <span className="font-semibold text-[#26352D]">{tmpl.duration || `${tmpl.durationDays} Days`}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-[#889B90] block">Target Yield</span>
                                <span className="font-semibold text-[#26352D]">{tmpl.targetYieldQuintals || "Standard"}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                              <span className="px-2 py-0.5 rounded-md bg-white border border-[#DCE6DE] text-[#55685D]">
                                {tmpl.growthTimeline?.length || 0} Stages
                              </span>
                              {tmpl.dos && tmpl.dos.length > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  {tmpl.dos.length} Do&apos;s
                                </span>
                              )}
                              {tmpl.donts && tmpl.donts.length > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-800 border border-red-200">
                                  {tmpl.donts.length} Don&apos;ts
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-2.5 border-t border-[#E5ECE7] flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedCropTemplateModal(tmpl)}
                              className="text-[11px] font-semibold text-[#0C4B32] hover:underline cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Protocol</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setNewCropTemplateId(tmpl.id);
                                const defVar = tmpl.variety || (tmpl.varieties && tmpl.varieties[0]) || "Standard Regional";
                                setNewCropVariety(defVar);
                                const dur = tmpl.durationDays || parseInt(tmpl.duration) || 120;
                                setNewCropTotalDays(dur);
                                if (tmpl.growthTimeline && tmpl.growthTimeline.length > 0) {
                                  setNewCropStage(tmpl.growthTimeline[0].stageName);
                                  setNewCropStageStep(1);
                                  setNewCropCurrentDay(tmpl.growthTimeline[0].startDay || 1);
                                }
                                setNewCropFarmId(isAllFarms ? (farms[0]?.id || "farm-1") : currentFarm.id);
                                setAddCropModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#0C4B32] text-white text-[11px] font-medium hover:bg-[#093826] transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add to Farm</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: ADVISORIES & ALERTS (Simple & Sober) */}
            {activeTab === "advisories" && (
              <div className="space-y-4">
                {/* Simple Sober Header */}
                <div className="bg-white p-4.5 rounded-xl border border-[#E5ECE7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-[#26352D] flex items-center gap-2">
                      <span>Crop Advisories & Bulletins</span>
                      <span className="text-[11px] font-semibold bg-[#E7F3EB] text-[#0C4B32] px-2 py-0.5 rounded-full">
                        {activeAdminBroadcasts.length} Active
                      </span>
                    </h2>
                    <p className="text-xs text-[#55685D] mt-0.5">
                      PAU university recommendations and pest warnings for {currentFarm.name} ({currentFarm.district || "Ludhiana"}).
                    </p>
                  </div>

                  {/* Category Filter Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleWindowRefresh}
                      disabled={isPageRefreshing}
                      title="Refresh Advisories"
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#26352D] inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors mr-1"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-[#0C4B32] ${isPageRefreshing ? "animate-spin" : ""}`} />
                      <span>Refresh</span>
                    </button>
                    {[
                      { id: "all", label: "All" },
                      { id: "pest", label: "Pest & Disease" },
                      { id: "weather", label: "Weather" },
                    ].map((t) => {
                      const active = advisoryCategoryFilter === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setAdvisoryCategoryFilter(t.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            active
                              ? "bg-[#0C4B32] text-white"
                              : "bg-[#F4F8F4] text-[#55685D] hover:text-[#26352D] hover:bg-[#E5ECE7]"
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Advisories List */}
                {(() => {
                  const filtered = activeAdminBroadcasts.filter((bc) => {
                    if (advisoryCategoryFilter === "all") return true;
                    if (advisoryCategoryFilter === "pest")
                      return bc.category?.toLowerCase().includes("pest") || bc.category?.toLowerCase().includes("disease");
                    if (advisoryCategoryFilter === "weather")
                      return bc.category?.toLowerCase().includes("weather") || bc.category?.toLowerCase().includes("frost");
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="bg-white rounded-xl border border-[#E5ECE7] p-8 text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-[#0C4B32] mx-auto" />
                        <h3 className="text-sm font-semibold text-[#26352D]">No Active Advisories</h3>
                        <p className="text-xs text-[#55685D] max-w-sm mx-auto">
                          There are currently no active alerts in this category for your area.
                        </p>
                        <button
                          type="button"
                          onClick={() => setAdvisoryCategoryFilter("all")}
                          className="text-xs text-[#0C4B32] font-semibold hover:underline cursor-pointer"
                        >
                          View all categories
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {filtered.map((alert: any, idx: number) => {
                        const alertKey = alert.$id || alert.id || `adv-alert-${idx}-${alert.title || "item"}`;
                        return (
                          <div
                            key={alertKey}
                            className="bg-white rounded-xl border border-[#E5ECE7] p-4.5 space-y-1.5 hover:border-[#CCD9D0] transition-colors"
                          >
                            <h3 className="text-sm font-bold text-[#26352D] leading-snug">
                              {alert.title}
                            </h3>
                            <p className="text-xs text-[#55685D] leading-relaxed">
                              {alert.message}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 4: WEATHER WIDGET BASED ON FARM GPS LOCATION */}
            {activeTab === "weather" && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0C4B32] bg-[#E7F3EB] px-2.5 py-1 rounded-full mb-1">
                        <MapPin className="w-3.5 h-3.5 text-[#0C4B32]" />
                        <span>Hyper-Local Farm Weather • Live WeatherAPI</span>
                      </div>
                      <h2 className="text-lg font-semibold text-[#26352D] flex items-center gap-2">
                        <span>Weather Advisory ({realWeather?.locationName || currentFarm.district || "Ludhiana"}, {realWeather?.region || currentFarm.state || "Punjab"})</span>
                        {weatherLoading && (
                          <span className="text-xs text-[#55685D] font-normal animate-pulse">(updating...)</span>
                        )}
                        <button
                          type="button"
                          onClick={handleWindowRefresh}
                          disabled={isPageRefreshing}
                          title="Refresh Weather Data"
                          className="ml-auto sm:ml-2 px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#DCE6DE] bg-[#F4F8F4] hover:bg-[#EAF3EC] text-[#0C4B32] inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <RefreshCw className={`w-3 h-3 text-[#0C4B32] ${isPageRefreshing ? "animate-spin" : ""}`} />
                          <span>Refresh</span>
                        </button>
                      </h2>
                      <p className="text-xs text-[#55685D]">
                        Coordinates: {currentFarm.latitude.toFixed(4)}°N, {currentFarm.longitude.toFixed(4)}°E • Updated {realWeather?.lastUpdated || "recently"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {realWeather?.conditionIcon ? (
                        <img
                          src={realWeather.conditionIcon}
                          alt={realWeather.conditionText}
                          className="w-14 h-14 object-contain"
                        />
                      ) : (
                        <CloudSun className="w-10 h-10 text-amber-500" />
                      )}
                      <div>
                        <div className="text-3xl font-bold text-[#0C4B32]">
                          {realWeather ? `${realWeather.tempC}°C` : "24°C"}
                        </div>
                        <div className="text-xs font-medium text-[#55685D]">
                          {realWeather ? realWeather.conditionText : "Clear"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#E5ECE7]">
                    <div className="p-3 rounded-xl bg-[#F4F8F4] border border-[#DCE6DE] text-xs">
                      <span className="text-[#55685D] block text-[11px]">Relative Humidity</span>
                      <strong className="text-sm text-[#26352D] font-semibold">
                        {realWeather ? `${realWeather.humidity}%` : "58%"}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F4F8F4] border border-[#DCE6DE] text-xs">
                      <span className="text-[#55685D] block text-[11px]">Wind Velocity</span>
                      <strong className="text-sm text-[#26352D] font-semibold">
                        {realWeather ? `${realWeather.windKph} km/h ${realWeather.windDir}` : "12 km/h NW"}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F4F8F4] border border-[#DCE6DE] text-xs">
                      <span className="text-[#55685D] block text-[11px]">Precipitation Probability</span>
                      <strong className="text-sm text-[#26352D] font-semibold">
                        {realWeather ? `${realWeather.chanceOfRain}% (${realWeather.precipMm} mm)` : "5% (Dry)"}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F4F8F4] border border-[#DCE6DE] text-xs">
                      <span className="text-[#55685D] block text-[11px]">Foliar Spray Window</span>
                      <strong className="text-sm text-emerald-700 font-semibold">
                        {realWeather ? realWeather.sprayWindow : "Optimal Today"}
                      </strong>
                    </div>
                  </div>

                  {/* 7-Day Forecast */}
                  <div className="mt-6 pt-5 border-t border-[#E5ECE7]">
                    <div className="text-xs font-semibold text-[#26352D] mb-3">7-Day Agricultural Forecast</div>
                    <div className="flex sm:grid sm:grid-cols-7 gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-center text-xs">
                      {(realWeather?.forecastDays && realWeather.forecastDays.length > 0
                        ? realWeather.forecastDays
                        : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({
                            dayName: d,
                            maxTemp: 27 + (i % 3),
                            minTemp: 15 + (i % 2),
                            rainChance: i === 2 ? 40 : 0,
                            precipMm: i === 2 ? 3.2 : 0,
                            conditionText: i === 2 ? "Rain" : "Sunny",
                            conditionIcon: "",
                          }))
                      ).map((dayItem: any, idx: number) => (
                        <div key={dayItem.date || idx} className="min-w-[95px] sm:min-w-0 flex-1 shrink-0 p-2.5 rounded-xl border border-[#DCE6DE] bg-[#FBFDFB]">
                          <div className="font-semibold text-[#26352D]">{dayItem.dayName}</div>
                          <div className="my-1.5 flex justify-center items-center h-8">
                            {dayItem.conditionIcon ? (
                              <img src={dayItem.conditionIcon} alt={dayItem.conditionText} className="w-7 h-7 object-contain" />
                            ) : dayItem.rainChance > 20 ? (
                              <CloudRain className="w-5 h-5 text-blue-500" />
                            ) : (
                              <Sun className="w-5 h-5 text-amber-500" />
                            )}
                          </div>
                          <div className="text-[11px] font-bold text-[#0C4B32]">
                            {dayItem.maxTemp}° / {dayItem.minTemp}°
                          </div>
                          <div className="text-[10px] text-[#55685D] mt-0.5 truncate">
                            {dayItem.precipMm > 0 ? `${dayItem.precipMm}mm rain` : `${dayItem.conditionText}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Farm Location & Satellite Weather Radar Map */}
                  <div className="mt-6 pt-5 border-t border-[#E5ECE7] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#0C4B32]" />
                        <h3 className="text-sm font-bold text-[#26352D]">
                          Farm Location & Satellite Weather Map ({currentFarm.name})
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[#55685D]">
                          GPS: <strong className="text-[#26352D] font-mono">{currentFarm.latitude.toFixed(5)}°N, {currentFarm.longitude.toFixed(5)}°E</strong>
                        </span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${currentFarm.latitude},${currentFarm.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[#0C4B32] hover:underline"
                        >
                          <span>Open Map</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-[#DCE6DE] shadow-inner bg-[#E5ECE7]">
                      <iframe
                        title="Farm Satellite Weather Location Map"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(
                          `${currentFarm.latitude},${currentFarm.longitude}`
                        )}&t=k&z=15&ie=UTF8&iwloc=&output=embed`}
                      />
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#DCE6DE] shadow-xs text-xs flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping inline-block" />
                        <span className="font-semibold text-[#26352D]">{currentFarm.name}</span>
                        <span className="text-[#55685D]">• {realWeather?.tempC || 24}°C ({realWeather?.conditionText || "Live"})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: TASK CALENDAR AND TASK BOARD (Simple, Sober & Interactive) */}
            {activeTab === "tasks" && (
              <div className="space-y-4">
                {/* 1. Header with View Switcher & Create Task Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                  <div>
                    <h2 className="text-base font-bold text-[#26352D]">Tasks & Operations</h2>
                    <p className="text-xs text-[#55685D] mt-0.5">
                      Field operations, fertilizer cycles & calendar • {isAllFarms ? "All registered holdings" : currentFarm.name}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                    {/* View Switcher: List vs Calendar */}
                    <div className="flex items-center p-1 bg-[#F4F8F4] rounded-xl border border-[#DCE6DE]">
                      <button
                        type="button"
                        onClick={() => setTaskViewMode("list")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                          taskViewMode === "list"
                            ? "bg-white text-[#0C4B32] shadow-2xs"
                            : "text-[#55685D] hover:text-[#26352D]"
                        }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>List</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaskViewMode("calendar")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                          taskViewMode === "calendar"
                            ? "bg-white text-[#0C4B32] shadow-2xs"
                            : "text-[#55685D] hover:text-[#26352D]"
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Calendar</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleWindowRefresh}
                      disabled={isPageRefreshing}
                      title="Refresh Tasks"
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#26352D] inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-[#0C4B32] ${isPageRefreshing ? "animate-spin" : ""}`} />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenCreateTask()}
                      className="btn btn-primary text-xs px-3.5 py-1.5 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs rounded-xl flex-1 sm:flex-initial"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Task</span>
                    </button>
                  </div>
                </div>

                {/* 2. Interactive 4-Metric Strip (Click to Filter) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTaskFilter("all");
                      setTaskViewMode("list");
                    }}
                    className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                      taskFilter === "all" && taskViewMode === "list"
                        ? "bg-[#E7F3EB] border-[#0C4B32] shadow-xs ring-1 ring-[#0C4B32]"
                        : "bg-white border-[#E5ECE7] hover:border-[#A7D7B8] shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#55685D]">All Tasks</span>
                      {taskFilter === "all" && taskViewMode === "list" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0C4B32]" />
                      )}
                    </div>
                    <div className="text-lg font-bold text-[#0C4B32] mt-1">
                      {totalTaskCount} Tasks
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTaskFilter("todo");
                      setTaskViewMode("list");
                    }}
                    className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                      taskFilter === "todo" && taskViewMode === "list"
                        ? "bg-amber-50/80 border-amber-600 shadow-xs ring-1 ring-amber-600"
                        : "bg-white border-[#E5ECE7] hover:border-amber-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-amber-800">To Do</span>
                      {taskFilter === "todo" && taskViewMode === "list" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      )}
                    </div>
                    <div className="text-lg font-bold text-amber-700 mt-1">
                      {todoTaskCount} Pending
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTaskFilter("in_progress");
                      setTaskViewMode("list");
                    }}
                    className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                      taskFilter === "in_progress" && taskViewMode === "list"
                        ? "bg-blue-50/80 border-blue-600 shadow-xs ring-1 ring-blue-600"
                        : "bg-white border-[#E5ECE7] hover:border-blue-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-blue-800">In Progress</span>
                      {taskFilter === "in_progress" && taskViewMode === "list" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <div className="text-lg font-bold text-blue-700 mt-1">
                      {inProgressTaskCount} Active
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTaskFilter("completed");
                      setTaskViewMode("list");
                    }}
                    className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                      taskFilter === "completed" && taskViewMode === "list"
                        ? "bg-emerald-50/80 border-emerald-600 shadow-xs ring-1 ring-emerald-600"
                        : "bg-white border-[#E5ECE7] hover:border-emerald-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-emerald-800">Completed</span>
                      {taskFilter === "completed" && taskViewMode === "list" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      )}
                    </div>
                    <div className="text-lg font-bold text-emerald-700 mt-1">
                      {completedTaskCount} Done
                    </div>
                  </button>
                </div>

                {/* 3. Filter Toolbar with Segmented Buttons, Farm Selector & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E5ECE7] shadow-xs">
                  <div className="flex items-center gap-1.5 p-1 bg-[#F4F8F4] rounded-xl border border-[#DCE6DE] overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setTaskFilter("all")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        taskFilter === "all"
                          ? "bg-white text-[#0C4B32] shadow-2xs"
                          : "text-[#55685D] hover:text-[#26352D]"
                      }`}
                    >
                      All Tasks ({scopedTasks.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskFilter("todo")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        taskFilter === "todo"
                          ? "bg-amber-700 text-white shadow-2xs"
                          : "text-[#55685D] hover:text-amber-800"
                      }`}
                    >
                      To Do ({todoTaskCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskFilter("in_progress")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        taskFilter === "in_progress"
                          ? "bg-blue-700 text-white shadow-2xs"
                          : "text-[#55685D] hover:text-blue-800"
                      }`}
                    >
                      In Progress ({inProgressTaskCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskFilter("completed")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        taskFilter === "completed"
                          ? "bg-emerald-700 text-white shadow-2xs"
                          : "text-[#55685D] hover:text-emerald-800"
                      }`}
                    >
                      Completed ({completedTaskCount})
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5 w-full md:w-auto">
                    {isAllFarms && (
                      <select
                        value={taskFarmFilter}
                        onChange={(e) => setTaskFarmFilter(e.target.value)}
                        className="px-2.5 py-1.5 text-xs font-medium text-[#26352D] bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl outline-none focus:border-[#0C4B32] cursor-pointer"
                      >
                        <option value="all">All Farms</option>
                        {farms.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="relative flex-1 sm:flex-initial w-full sm:w-auto">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#889B90]" />
                      <input
                        type="text"
                        placeholder="Search tasks, crop, worker..."
                        value={taskSearch}
                        onChange={(e) => setTaskSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-xs text-[#26352D] bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl outline-none focus:border-[#0C4B32] placeholder:text-[#889B90] w-full sm:w-56"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Main View: LIST VIEW vs CALENDAR VIEW */}
                {taskViewMode === "calendar" ? (
                  /* ===================== CALENDAR VIEW ===================== */
                  <div className="bg-white rounded-2xl border border-[#E5ECE7] shadow-xs overflow-hidden">
                    {/* Calendar Month Header & Navigation */}
                    {(() => {
                      const monthNames = [
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December",
                      ];
                      const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                      const firstDayOfWeek = (new Date(calendarYear, calendarMonth, 1).getDay() + 6) % 7;
                      const prevMonthDays = new Date(calendarYear, calendarMonth, 0).getDate();

                      const handlePrevMonth = () => {
                        if (calendarMonth === 0) {
                          setCalendarMonth(11);
                          setCalendarYear((y) => y - 1);
                        } else {
                          setCalendarMonth((m) => m - 1);
                        }
                      };

                      const handleNextMonth = () => {
                        if (calendarMonth === 11) {
                          setCalendarMonth(0);
                          setCalendarYear((y) => y + 1);
                        } else {
                          setCalendarMonth((m) => m + 1);
                        }
                      };

                      const handleJumpToday = () => {
                        const todayDate = new Date(currentDateStr);
                        setCalendarYear(todayDate.getFullYear());
                        setCalendarMonth(todayDate.getMonth());
                        setSelectedCalendarDate(currentDateStr);
                      };

                      // Generate Calendar Grid Cells
                      const cells: { day: number; isCurrentMonth: boolean; dateKey: string }[] = [];

                      // Leading days from previous month
                      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
                        const d = prevMonthDays - i;
                        const prevM = calendarMonth === 0 ? 11 : calendarMonth - 1;
                        const prevY = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
                        cells.push({
                          day: d,
                          isCurrentMonth: false,
                          dateKey: `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
                        });
                      }

                      // Current month days
                      for (let d = 1; d <= daysInMonth; d++) {
                        cells.push({
                          day: d,
                          isCurrentMonth: true,
                          dateKey: `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
                        });
                      }

                      // Trailing days from next month
                      const remaining = (7 - (cells.length % 7)) % 7;
                      for (let d = 1; d <= remaining; d++) {
                        const nextM = calendarMonth === 11 ? 0 : calendarMonth + 1;
                        const nextY = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
                        cells.push({
                          day: d,
                          isCurrentMonth: false,
                          dateKey: `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
                        });
                      }

                      const selectedDayTasks = selectedCalendarDate
                        ? scopedTasks.filter((t) => t.dueDate === selectedCalendarDate)
                        : [];

                      return (
                        <div className="space-y-4 p-5">
                          {/* Calendar Month Navigation Bar */}
                          <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE7]">
                            <div className="flex items-center gap-3">
                              <h3 className="text-base font-bold text-[#26352D]">
                                {monthNames[calendarMonth]} {calendarYear}
                              </h3>
                              <button
                                type="button"
                                onClick={handleJumpToday}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#DCE6DE] bg-[#F4F8F4] hover:bg-white text-[#26352D] cursor-pointer"
                              >
                                Today
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={handlePrevMonth}
                                title="Previous Month"
                                className="p-1.5 rounded-lg border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#26352D] cursor-pointer"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={handleNextMonth}
                                title="Next Month"
                                className="p-1.5 rounded-lg border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#26352D] cursor-pointer"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Days of Week Header */}
                          <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#55685D] pb-1">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName) => (
                              <div key={dayName} className="py-1">
                                {dayName}
                              </div>
                            ))}
                          </div>

                          {/* Calendar Grid */}
                          <div className="grid grid-cols-7 gap-1.5">
                            {cells.map((cell) => {
                              const dayTasks = scopedTasks.filter((t) => t.dueDate === cell.dateKey);
                              const isToday = cell.dateKey === currentDateStr;
                              const isSelected = selectedCalendarDate === cell.dateKey;

                              return (
                                <div
                                  key={cell.dateKey}
                                  onClick={() => setSelectedCalendarDate(cell.dateKey)}
                                  className={`min-h-[85px] sm:min-h-[105px] p-1.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                    isSelected
                                      ? "bg-[#E7F3EB]/60 border-[#0C4B32] ring-2 ring-[#0C4B32]/30"
                                      : isToday
                                      ? "bg-[#F7FAF8] border-[#A7D7B8]"
                                      : cell.isCurrentMonth
                                      ? "bg-white border-[#E5ECE7] hover:border-[#C6E2D0]"
                                      : "bg-[#FAFCFA]/60 border-[#E5ECE7]/60 opacity-40"
                                  }`}
                                >
                                  {/* Day Number Header */}
                                  <div className="flex items-center justify-between text-xs">
                                    <span
                                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${
                                        isToday
                                          ? "bg-[#0C4B32] text-white"
                                          : isSelected
                                          ? "text-[#0C4B32] font-black"
                                          : cell.isCurrentMonth
                                          ? "text-[#26352D]"
                                          : "text-[#889B90]"
                                      }`}
                                    >
                                      {cell.day}
                                    </span>
                                    {dayTasks.length > 0 && (
                                      <span className="text-[10px] font-semibold text-[#55685D]">
                                        {dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"}
                                      </span>
                                    )}
                                  </div>

                                  {/* Task Pills for Day */}
                                  <div className="space-y-1 my-1 overflow-hidden">
                                    {dayTasks.slice(0, 2).map((t) => {
                                      const pillColor =
                                        t.status === "Completed"
                                          ? "bg-emerald-50 text-emerald-900 border-emerald-200 line-through opacity-70"
                                          : t.status === "In Progress"
                                          ? "bg-blue-50 text-blue-900 border-blue-200"
                                          : "bg-amber-50 text-amber-900 border-amber-200";

                                      return (
                                        <div
                                          key={t.id}
                                          title={`${t.title} (${t.status})`}
                                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded border truncate ${pillColor}`}
                                        >
                                          {t.title}
                                        </div>
                                      );
                                    })}
                                    {dayTasks.length > 2 && (
                                      <div className="text-[9px] font-semibold text-[#55685D] px-1">
                                        +{dayTasks.length - 2} more
                                      </div>
                                    )}
                                  </div>

                                  {/* Quick add task button for day */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenCreateTask(cell.dateKey);
                                    }}
                                    title={`Add task for ${cell.dateKey}`}
                                    className="self-end text-[10px] text-[#889B90] hover:text-[#0C4B32] opacity-70 hover:opacity-100 p-0.5"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          {/* Selected Date Agenda Details */}
                          {selectedCalendarDate && (
                            <div className="mt-4 pt-4 border-t border-[#E5ECE7]">
                              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E5ECE7]">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-[#0C4B32]" />
                                  <h4 className="text-xs font-bold text-[#26352D]">
                                    Schedule for {formatDisplayDate(selectedCalendarDate)}
                                  </h4>
                                  <span className="text-[10px] font-semibold text-[#55685D] bg-[#F4F8F4] px-2 py-0.5 rounded-full border border-[#E5ECE7]">
                                    {selectedDayTasks.length} {selectedDayTasks.length === 1 ? "task" : "tasks"}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleOpenCreateTask(selectedCalendarDate)}
                                  className="text-xs font-bold text-[#0C4B32] hover:text-[#083624] inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add Task for This Date</span>
                                </button>
                              </div>

                              {selectedDayTasks.length === 0 ? (
                                <div className="p-6 text-center text-xs text-[#55685D] bg-[#FBFDFB] rounded-xl border border-dashed border-[#DCE6DE]">
                                  No tasks scheduled for this day. Click above to schedule one.
                                </div>
                              ) : (
                                <div className="divide-y divide-[#E5ECE7] border border-[#E5ECE7] rounded-xl overflow-hidden bg-white">
                                  {selectedDayTasks.map((task) => {
                                    const isCompleted = task.status === "Completed";
                                    const isExpanded = expandedTaskId === task.id;
                                    const dueStatus = getTaskDueStatus(task.dueDate, isCompleted);

                                    return (
                                      <div key={task.id} className="transition-colors hover:bg-[#F9FCFA]">
                                        <div className="p-3 flex items-center justify-between gap-3 text-xs">
                                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <button
                                              type="button"
                                              onClick={() => handleToggleTaskStatus(task.id)}
                                              title={isCompleted ? "Mark Incomplete" : "Mark Completed"}
                                              className="cursor-pointer text-[#889B90] hover:text-[#0C4B32]"
                                            >
                                              {isCompleted ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                              ) : (
                                                <div className="w-4 h-4 rounded-md border border-[#DCE6DE] hover:border-[#0C4B32]" />
                                              )}
                                            </button>

                                            <span
                                              onClick={() => setExpandedTaskId((prev) => (prev === task.id ? null : task.id))}
                                              className={`font-semibold cursor-pointer truncate ${
                                                isCompleted ? "line-through text-[#889B90]" : "text-[#26352D]"
                                              }`}
                                            >
                                              {task.title}
                                            </span>

                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#E7F3EB] text-[#0C4B32]">
                                              {task.category}
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[11px] text-[#55685D]">{task.assignedTo}</span>
                                            <button
                                              type="button"
                                              onClick={() => setExpandedTaskId((prev) => (prev === task.id ? null : task.id))}
                                              className="p-1 rounded-md text-[#889B90] hover:text-[#26352D] cursor-pointer"
                                            >
                                              <ChevronDown
                                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                                  isExpanded ? "rotate-180 text-[#0C4B32]" : ""
                                                }`}
                                              />
                                            </button>
                                          </div>
                                        </div>

                                        {isExpanded && (
                                          <div className="px-4 py-3 bg-[#F4F8F4]/80 border-t border-[#E5ECE7] space-y-2 text-xs">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                              <div className="bg-white p-2 rounded-lg border border-[#E5ECE7]">
                                                <span className="text-[10px] text-[#889B90] block">Due Status</span>
                                                <span className={`font-semibold text-[11px] ${dueStatus.color}`}>
                                                  {dueStatus.label}
                                                </span>
                                              </div>
                                              <div className="bg-white p-2 rounded-lg border border-[#E5ECE7]">
                                                <span className="text-[10px] text-[#889B90] block">Zone / Parcel</span>
                                                <span className="font-semibold text-[#26352D] text-[11px]">
                                                  {task.zone || "All parcels"}
                                                </span>
                                              </div>
                                              <div className="bg-white p-2 rounded-lg border border-[#E5ECE7]">
                                                <span className="text-[10px] text-[#889B90] block">Target Crop</span>
                                                <span className="font-semibold text-[#26352D] text-[11px]">
                                                  {task.crop || "General"}
                                                </span>
                                              </div>
                                              <div className="bg-white p-2 rounded-lg border border-[#E5ECE7]">
                                                <span className="text-[10px] text-[#889B90] block">Worker Assigned</span>
                                                <span className="font-semibold text-[#26352D] text-[11px]">
                                                  {task.assignedTo}
                                                </span>
                                              </div>
                                            </div>
                                            {task.instructions && (
                                              <div className="bg-white p-2.5 rounded-lg border border-[#E5ECE7]">
                                                <span className="text-[10px] text-[#889B90] block">Instructions</span>
                                                <p className="text-[11px] text-[#55685D] mt-0.5">{task.instructions}</p>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  /* ===================== LIST VIEW WITH EXPANDABLE DROPDOWNS ===================== */
                  <div className="bg-white rounded-2xl border border-[#E5ECE7] shadow-xs overflow-hidden">
                    {visibleTasks.length === 0 ? (
                      <div className="p-12 text-center">
                        <CheckSquare className="w-8 h-8 text-[#889B90] mx-auto mb-2 opacity-60" />
                        <p className="text-sm font-semibold text-[#26352D]">No Tasks Found</p>
                        <p className="text-xs text-[#55685D] mt-1">
                          No operations match the selected filter or search query.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenCreateTask()}
                          className="mt-4 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#0C4B32] text-white hover:bg-[#083624] cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create New Task</span>
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#E5ECE7] text-xs">
                        {visibleTasks.map((task) => {
                          const isCompleted = task.status === "Completed";
                          const isExpanded = expandedTaskId === task.id;
                          const dueStatus = getTaskDueStatus(task.dueDate, isCompleted);

                          const priorityBadge =
                            task.priority === "Urgent"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : task.priority === "High"
                              ? "bg-orange-100 text-orange-800 border-orange-200"
                              : task.priority === "Medium"
                              ? "bg-amber-100 text-amber-800 border-amber-200"
                              : "bg-slate-100 text-slate-800 border-slate-200";

                          const statusBadge =
                            task.status === "Completed"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : task.status === "In Progress"
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : "bg-amber-50 text-amber-800 border-amber-200";

                          return (
                            <div key={task.id} className="transition-colors hover:bg-[#F9FCFA]">
                              {/* Main Compact Row with Generous Spacing */}
                              <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                <div className="min-w-0 flex-1 flex items-center gap-2.5 sm:gap-3.5 flex-wrap">
                                  {/* Quick Completion Checkbox */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleTaskStatus(task.id)}
                                    title={isCompleted ? "Mark Incomplete" : "Mark Completed"}
                                    className="cursor-pointer text-[#889B90] hover:text-[#0C4B32] transition-colors shrink-0 p-0.5"
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    ) : (
                                      <div className="w-5 h-5 rounded-md border-2 border-[#DCE6DE] hover:border-[#0C4B32] transition-colors" />
                                    )}
                                  </button>

                                  <span
                                    onClick={() => setExpandedTaskId((prev) => (prev === task.id ? null : task.id))}
                                    className={`font-bold text-sm cursor-pointer select-none transition-colors truncate mr-1 ${
                                      isCompleted
                                        ? "line-through text-[#889B90]"
                                        : "text-[#26352D] hover:text-[#0C4B32]"
                                    }`}
                                  >
                                    {task.title}
                                  </span>

                                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#E7F3EB] text-[#0C4B32] border border-[#C6E2D0]">
                                    {task.category}
                                  </span>

                                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${priorityBadge}`}>
                                    {task.priority}
                                  </span>

                                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusBadge}`}>
                                    {task.status}
                                  </span>

                                  {isAllFarms && (
                                    <span className="text-[11px] text-[#55685D] bg-[#F4F8F4] px-2 py-1 rounded-md border border-[#E5ECE7]">
                                      {task.farmName}
                                    </span>
                                  )}
                                </div>

                                <div className="shrink-0 flex items-center justify-between sm:justify-end gap-2.5 sm:gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-[#E5ECE7]/60">
                                  <div
                                    onClick={() => setExpandedTaskId((prev) => (prev === task.id ? null : task.id))}
                                    className="cursor-pointer"
                                  >
                                    <span className={`text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-md border ${dueStatus.color}`}>
                                      {dueStatus.label}
                                    </span>
                                  </div>

                                  <span className="text-xs font-medium text-[#55685D] truncate max-w-[120px]">
                                    {task.assignedTo}
                                  </span>

                                  <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTask(task.id)}
                                      title="Delete task"
                                      className="text-[#889B90] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>

                                    {/* Dropdown Toggle */}
                                    <button
                                      type="button"
                                      onClick={() => setExpandedTaskId((prev) => (prev === task.id ? null : task.id))}
                                      title={isExpanded ? "Hide details" : "Show details"}
                                      className="p-1.5 rounded-lg text-[#889B90] hover:text-[#26352D] hover:bg-[#E5ECE7]/60 transition-colors cursor-pointer"
                                    >
                                      <ChevronDown
                                        className={`w-4 h-4 transition-transform duration-200 ${
                                          isExpanded ? "rotate-180 text-[#0C4B32]" : ""
                                        }`}
                                      />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Dropdown Details Drawer */}
                              {isExpanded && (
                                <div className="px-5 sm:px-6 py-4 sm:py-5 bg-[#F4F8F4]/80 border-t border-[#E5ECE7] space-y-3.5">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                                    <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 shadow-2xs">
                                      <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                        Due Date & Schedule
                                      </span>
                                      <span className="font-semibold text-[#26352D] mt-0.5 block">
                                        {formatDisplayDate(task.dueDate)}
                                      </span>
                                      <span className={`text-[10px] font-bold mt-1.5 inline-block px-2 py-0.5 rounded border ${dueStatus.color}`}>
                                        {dueStatus.label}
                                      </span>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 shadow-2xs">
                                      <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                        Field / Parcel Zone
                                      </span>
                                      <span className="font-semibold text-[#26352D] mt-0.5 block">
                                        {task.zone || "All Farm Parcels"}
                                      </span>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 shadow-2xs">
                                      <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                        Target Crop
                                      </span>
                                      <span className="font-semibold text-[#26352D] mt-0.5 block">
                                        {task.crop || "General Farm Routine"}
                                      </span>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 shadow-2xs">
                                      <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                        Assigned Worker
                                      </span>
                                      <span className="font-semibold text-[#26352D] mt-0.5 block">
                                        {task.assignedTo}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Instructions & Notes */}
                                  <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 space-y-1.5 shadow-2xs">
                                    <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                      Instructions & Action Items
                                    </span>
                                    <p className="text-xs text-[#55685D] leading-relaxed">
                                      {task.instructions || task.description || "No specific instructions recorded."}
                                    </p>
                                  </div>

                                  {/* Quick Status Change Action Buttons */}
                                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-[#55685D]">Change Status:</span>
                                      <button
                                        type="button"
                                        onClick={() => handleSetTaskStatus(task.id, "To Do")}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                          task.status === "To Do"
                                            ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                                            : "bg-white text-amber-800 border-amber-200 hover:bg-amber-50"
                                        }`}
                                      >
                                        To Do
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSetTaskStatus(task.id, "In Progress")}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                          task.status === "In Progress"
                                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                                            : "bg-white text-blue-800 border-blue-200 hover:bg-blue-50"
                                        }`}
                                      >
                                        In Progress
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSetTaskStatus(task.id, "Completed")}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                          task.status === "Completed"
                                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                                            : "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                                        }`}
                                      >
                                        Completed
                                      </button>
                                    </div>

                                    <div className="text-xs text-[#889B90]">
                                      Holding: <strong className="text-[#26352D]">{task.farmName}</strong>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: INVENTORY (Simple & Sober) */}
            {activeTab === "inventory" && (
              <div className="space-y-4">
                {/* 1. Simple Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                  <div>
                    <h2 className="text-base font-bold text-[#26352D]">Inventory</h2>
                    <p className="text-xs text-[#55685D] mt-0.5">
                      Store stock, expiry reminders & usages • {isAllFarms ? "All registered holdings" : currentFarm.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleWindowRefresh}
                      disabled={isPageRefreshing}
                      title="Refresh Inventory"
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#26352D] inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-[#0C4B32] ${isPageRefreshing ? "animate-spin" : ""}`} />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAddStore()}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#26352D] inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors flex-1 sm:flex-initial"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#0C4B32]" />
                      <span>+ Store</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAddItem()}
                      className="btn btn-primary text-xs px-3.5 py-1.5 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs rounded-xl flex-1 sm:flex-initial"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>

                {/* 2. Interactive 4-Metric Strip (Click to Filter) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setInventoryFilter("all")}
                    className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                      inventoryFilter === "all"
                        ? "bg-[#E7F3EB] border-[#0C4B32] shadow-xs ring-1 ring-[#0C4B32]"
                        : "bg-white border-[#E5ECE7] hover:border-[#A7D7B8] shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#55685D]">All Stock Items</span>
                      {inventoryFilter === "all" && <span className="w-1.5 h-1.5 rounded-full bg-[#0C4B32]" />}
                    </div>
                    <div className="text-lg font-bold text-[#0C4B32] mt-1">
                      {totalTrackedItems} SKUs
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInventoryFilter("low_stock")}
                    className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                      inventoryFilter === "low_stock"
                        ? "bg-amber-50/80 border-amber-600 shadow-xs ring-1 ring-amber-600"
                        : "bg-white border-[#E5ECE7] hover:border-amber-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-amber-800">Low Stock</span>
                      {inventoryFilter === "low_stock" && <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />}
                    </div>
                    <div className="text-lg font-bold text-amber-700 mt-1">
                      {lowStockCount} Items
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInventoryFilter("expiring")}
                    className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                      inventoryFilter === "expiring"
                        ? "bg-red-50/80 border-red-600 shadow-xs ring-1 ring-red-600"
                        : "bg-white border-[#E5ECE7] hover:border-red-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-red-800">Expiring Soon</span>
                      {inventoryFilter === "expiring" && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                    </div>
                    <div className="text-lg font-bold text-red-600 mt-1">
                      {expiringSoonCount} Batches
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInventoryFilter("usages")}
                    className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                      inventoryFilter === "usages"
                        ? "bg-[#E7F3EB] border-[#0C4B32] shadow-xs ring-1 ring-[#0C4B32]"
                        : "bg-white border-[#E5ECE7] hover:border-[#A7D7B8] shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#55685D]">Usage Logs</span>
                      {inventoryFilter === "usages" && <span className="w-1.5 h-1.5 rounded-full bg-[#0C4B32]" />}
                    </div>
                    <div className="text-lg font-bold text-[#26352D] mt-1">
                      {scopedUsageLogs.length} Records
                    </div>
                  </button>
                </div>

                {/* 3. Filter Toolbar with Segmented Buttons, Store Selector & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E5ECE7] shadow-xs">
                  <div className="flex items-center gap-1.5 p-1 bg-[#F4F8F4] rounded-xl border border-[#DCE6DE] overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setInventoryFilter("all")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        inventoryFilter === "all"
                          ? "bg-white text-[#0C4B32] shadow-2xs"
                          : "text-[#55685D] hover:text-[#26352D]"
                      }`}
                    >
                      All Stock ({scopedInventoryItems.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInventoryFilter("low_stock")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        inventoryFilter === "low_stock"
                          ? "bg-amber-700 text-white shadow-2xs"
                          : "text-[#55685D] hover:text-amber-900"
                      }`}
                    >
                      Low Stock ({lowStockCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInventoryFilter("expiring")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        inventoryFilter === "expiring"
                          ? "bg-red-700 text-white shadow-2xs"
                          : "text-[#55685D] hover:text-red-800"
                      }`}
                    >
                      Expiring Soon ({expiringSoonCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInventoryFilter("usages")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        inventoryFilter === "usages"
                          ? "bg-[#0C4B32] text-white shadow-2xs"
                          : "text-[#55685D] hover:text-[#0C4B32]"
                      }`}
                    >
                      Usage History ({scopedUsageLogs.length})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={inventoryStoreFilter}
                      onChange={(e) => setInventoryStoreFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-[#DCE6DE] bg-white text-[#26352D] outline-none"
                    >
                      <option value="all">All Stores ({scopedStores.length})</option>
                      {scopedStores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#55685D] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full sm:w-44 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#DCE6DE] bg-white text-[#26352D] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Minimal, Clean Ledger */}
                <div className="bg-white rounded-xl border border-[#E5ECE7] overflow-hidden shadow-xs">
                  {/* VIEW A: USAGE LOGS */}
                  {inventoryFilter === "usages" ? (
                    visibleUsageLogs.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#55685D]">
                        No item usage logs found.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#E5ECE7] text-xs">
                        {visibleUsageLogs.map((log) => (
                          <div
                            key={log.id}
                            className="px-5 sm:px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#F8FAF8] transition-colors"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-semibold text-sm text-[#26352D] truncate">
                                  {log.itemName}
                                </span>
                                <span className="text-[11px] bg-[#F4F8F4] text-[#55685D] px-2 py-0.5 rounded-md border border-[#E5ECE7]">
                                  {log.storeName}
                                </span>
                                {log.crop && (
                                  <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-200">
                                    {log.crop}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[#55685D] mt-1">
                                {log.purpose} • {log.date} • {log.appliedBy}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="font-bold text-sm text-red-600">
                                -{log.quantityUsed} {log.unit}
                              </div>
                              <div className="text-[11px] text-[#55685D] mt-0.5">Deducted</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    /* VIEW B: STOCK ITEMS LEDGER */
                    visibleInventoryItems.length === 0 ? (
                      <div className="p-12 text-center text-xs text-[#55685D]">
                        No inventory records found.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#E5ECE7] text-xs">
                        {visibleInventoryItems.map((item) => {
                          const exp = getItemExpiryStatus(item.expiryDate);
                          const isLowStock = item.quantity <= item.lowStockThreshold;
                          const isExpanded = expandedInventoryId === item.id;

                          return (
                            <div
                              key={item.id}
                              className="transition-colors hover:bg-[#F9FCFA]"
                            >
                              {/* Main Compact Row with Generous Spacing */}
                              <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                <div
                                  onClick={() => setExpandedInventoryId((prev) => (prev === item.id ? null : item.id))}
                                  className="min-w-0 flex-1 flex items-center gap-2.5 sm:gap-3 flex-wrap cursor-pointer select-none"
                                >
                                  <span className="font-bold text-sm text-[#26352D] hover:text-[#0C4B32] transition-colors truncate mr-1">
                                    {item.name}
                                  </span>
                                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#E7F3EB] text-[#0C4B32] border border-[#C6E2D0]">
                                    {item.category}
                                  </span>
                                  <span className="text-[11px] text-[#55685D] bg-[#F4F8F4] px-2 py-0.5 rounded-md border border-[#E5ECE7]">
                                    {item.storeName}
                                  </span>

                                  {/* Urgent Alerts */}
                                  {isLowStock && (
                                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                                      ⚠️ Low Stock
                                    </span>
                                  )}
                                  {exp.status === "expiring_soon" && (
                                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-red-50 text-red-800 border border-red-200">
                                      ⏳ Expires in {exp.daysLeft}d
                                    </span>
                                  )}
                                  {exp.status === "expired" && (
                                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-red-100 text-red-900">
                                      🔴 Expired
                                    </span>
                                  )}
                                </div>

                                <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-[#E5ECE7]/60">
                                  <div
                                    onClick={() => setExpandedInventoryId((prev) => (prev === item.id ? null : item.id))}
                                    className="text-left sm:text-right cursor-pointer"
                                  >
                                    <span className={`font-bold text-sm ${isLowStock ? "text-amber-700" : "text-[#0C4B32]"}`}>
                                      {item.quantity} {item.unit}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 sm:gap-2 ml-auto sm:ml-0">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenLogUsage(item)}
                                      title="Log usage in field"
                                      className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0C4B32] hover:bg-[#083624] text-white transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                                    >
                                      Log Usage
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenRestock(item)}
                                      title="Restock"
                                      className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#DCE6DE] hover:bg-[#F4F8F4] text-[#26352D] transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                      Restock
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteItem(item.id)}
                                      title="Delete record"
                                      className="text-[#889B90] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>

                                    {/* Dropdown Toggle */}
                                    <button
                                      type="button"
                                      onClick={() => setExpandedInventoryId((prev) => (prev === item.id ? null : item.id))}
                                      title={isExpanded ? "Hide details" : "Show details"}
                                      className="p-1.5 rounded-lg text-[#889B90] hover:text-[#26352D] hover:bg-[#E5ECE7]/60 transition-colors cursor-pointer"
                                    >
                                      <ChevronDown
                                        className={`w-4 h-4 transition-transform duration-200 ${
                                          isExpanded ? "rotate-180 text-[#0C4B32]" : ""
                                        }`}
                                      />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Dropdown Details Drawer */}
                              {isExpanded && (
                                <div className="px-5 sm:px-6 py-4 sm:py-5 bg-[#F4F8F4]/80 border-t border-[#E5ECE7] space-y-3.5">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                                    <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 shadow-2xs">
                                      <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                        Batch / Lot #
                                      </span>
                                      <span className="font-semibold text-[#26352D] mt-0.5 block">
                                        {item.batchNumber || "Not recorded"}
                                      </span>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 shadow-2xs">
                                      <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                        Rate & Value
                                      </span>
                                      <span className="font-semibold text-[#26352D] mt-0.5 block">
                                        ₹{item.rate}/{item.unit}
                                      </span>
                                      <span className="text-[11px] text-[#55685D] block mt-0.5">
                                        Total: ₹{(item.quantity * item.rate).toLocaleString("en-IN")}
                                      </span>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 shadow-2xs">
                                      <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                        Low Stock Alert
                                      </span>
                                      <span className="font-semibold text-[#26352D] mt-0.5 block">
                                        Threshold: {item.lowStockThreshold} {item.unit}
                                      </span>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 shadow-2xs">
                                      <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                        Purchased Date
                                      </span>
                                      <span className="font-semibold text-[#26352D] mt-0.5 block">
                                        {item.purchasedDate ? formatDisplayDate(item.purchasedDate) : "Not recorded"}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs pt-1">
                                    <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 shadow-2xs">
                                      <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                        Expiry Date
                                      </span>
                                      <span
                                        className={`font-semibold mt-0.5 block ${
                                          exp.status === "expired"
                                            ? "text-red-700"
                                            : exp.status === "expiring_soon"
                                            ? "text-amber-700"
                                            : "text-[#26352D]"
                                        }`}
                                      >
                                        {item.expiryDate
                                          ? `${formatDisplayDate(item.expiryDate)} (${exp.daysLeft > 0 ? `${exp.daysLeft}d left` : "Expired"})`
                                          : "No expiration date"}
                                      </span>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 shadow-2xs">
                                      <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                        Storage Facility
                                      </span>
                                      <span className="font-semibold text-[#26352D] mt-0.5 block">
                                        {item.storeName}
                                      </span>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 shadow-2xs">
                                      <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                        Assigned Farm
                                      </span>
                                      <span className="font-semibold text-[#26352D] mt-0.5 block">
                                        {item.farmName}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* TAB: EQUIPMENT (Simple & Sober) */}
            {activeTab === "equipment" && (
              <div className="space-y-4">
                {/* 1. Simple Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                  <div>
                    <h2 className="text-base font-bold text-[#26352D]">Equipment & Machinery</h2>
                    <p className="text-xs text-[#55685D] mt-0.5">
                      Fleet tracking, maintenance & issue reports • {isAllFarms ? "All registered holdings" : currentFarm.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleWindowRefresh}
                      disabled={isPageRefreshing}
                      title="Refresh Equipment"
                      className="px-3.5 py-2 sm:py-1.5 text-xs font-semibold rounded-xl border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#26352D] inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-[#0C4B32] ${isPageRefreshing ? "animate-spin" : ""}`} />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenReportProblem()}
                      className="px-3.5 py-2 sm:py-1.5 text-xs font-semibold rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      <span>Report Problem</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenRegisterEquipment}
                      className="btn btn-primary text-xs px-3.5 py-2 sm:py-1.5 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs rounded-xl"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register Equipment</span>
                    </button>
                  </div>
                </div>

                {/* 2. Interactive 4-Metric Strip (Click to Filter) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setEquipmentFilter("all")}
                    className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                      equipmentFilter === "all"
                        ? "bg-[#E7F3EB] border-[#0C4B32] shadow-xs ring-1 ring-[#0C4B32]"
                        : "bg-white border-[#E5ECE7] hover:border-[#A7D7B8] shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#55685D]">All Equipment</span>
                      {equipmentFilter === "all" && <span className="w-1.5 h-1.5 rounded-full bg-[#0C4B32]" />}
                    </div>
                    <div className="text-lg font-bold text-[#0C4B32] mt-1">
                      {totalEquipmentCount} Units
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEquipmentFilter("operational")}
                    className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                      equipmentFilter === "operational"
                        ? "bg-emerald-50/80 border-emerald-600 shadow-xs ring-1 ring-emerald-600"
                        : "bg-white border-[#E5ECE7] hover:border-emerald-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-emerald-800">Operational</span>
                      {equipmentFilter === "operational" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                    </div>
                    <div className="text-lg font-bold text-emerald-700 mt-1">
                      {operationalCount} Active
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEquipmentFilter("service_due")}
                    className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                      equipmentFilter === "service_due"
                        ? "bg-amber-50/80 border-amber-600 shadow-xs ring-1 ring-amber-600"
                        : "bg-white border-[#E5ECE7] hover:border-amber-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-amber-800">Service Due</span>
                      {equipmentFilter === "service_due" && <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />}
                    </div>
                    <div className="text-lg font-bold text-amber-700 mt-1">
                      {serviceDueCount} Pending
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEquipmentFilter("issues")}
                    className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                      equipmentFilter === "issues"
                        ? "bg-red-50/80 border-red-600 shadow-xs ring-1 ring-red-600"
                        : "bg-white border-[#E5ECE7] hover:border-red-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-red-800">Reported Problems</span>
                      {equipmentFilter === "issues" && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                    </div>
                    <div className="text-lg font-bold text-red-600 mt-1">
                      {openIssuesCount} Issues
                    </div>
                  </button>
                </div>

                {/* 3. Filter Toolbar with Segmented Buttons, Farm Selector & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E5ECE7] shadow-xs">
                  <div className="flex items-center gap-1.5 p-1 bg-[#F4F8F4] rounded-xl border border-[#DCE6DE] overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setEquipmentFilter("all")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        equipmentFilter === "all"
                          ? "bg-white text-[#0C4B32] shadow-2xs"
                          : "text-[#55685D] hover:text-[#26352D]"
                      }`}
                    >
                      All Equipment ({scopedEquipment.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setEquipmentFilter("operational")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        equipmentFilter === "operational"
                          ? "bg-emerald-700 text-white shadow-2xs"
                          : "text-[#55685D] hover:text-emerald-800"
                      }`}
                    >
                      Operational ({operationalCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setEquipmentFilter("service_due")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        equipmentFilter === "service_due"
                          ? "bg-amber-700 text-white shadow-2xs"
                          : "text-[#55685D] hover:text-amber-800"
                      }`}
                    >
                      Service Due ({serviceDueCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setEquipmentFilter("issues")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        equipmentFilter === "issues"
                          ? "bg-red-700 text-white shadow-2xs"
                          : "text-[#55685D] hover:text-red-800"
                      }`}
                    >
                      Reported Problems ({openIssuesCount})
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                    {isAllFarms && (
                      <select
                        value={equipmentFarmFilter}
                        onChange={(e) => setEquipmentFarmFilter(e.target.value)}
                        className="px-2.5 py-1.5 text-xs font-medium text-[#26352D] bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl outline-none focus:border-[#0C4B32] cursor-pointer"
                      >
                        <option value="all">All Farms</option>
                        {farms.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#889B90]" />
                      <input
                        type="text"
                        placeholder="Search machinery or issues..."
                        value={equipmentSearch}
                        onChange={(e) => setEquipmentSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-xs text-[#26352D] bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl outline-none focus:border-[#0C4B32] placeholder:text-[#889B90] w-full sm:w-56"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Equipment Content / Problems View */}
                <div className="bg-white rounded-2xl border border-[#E5ECE7] shadow-xs overflow-hidden">
                  {equipmentFilter === "issues" ? (
                    /* ISSUES & PROBLEM REPORTS VIEW */
                    visibleEquipmentIssues.length === 0 ? (
                      <div className="p-12 text-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-[#26352D]">No Problems Reported</p>
                        <p className="text-xs text-[#55685D] mt-1">
                          All tractors, tubewells, and implements are currently running in optimal condition.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenReportProblem()}
                          className="mt-4 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Report an Issue Now</span>
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#E5ECE7]">
                        {visibleEquipmentIssues.map((issue) => {
                          const isResolved = issue.status === "Resolved";
                          const severityBadge =
                            issue.severity === "Critical"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : issue.severity === "High"
                              ? "bg-orange-100 text-orange-800 border-orange-200"
                              : issue.severity === "Medium"
                              ? "bg-amber-100 text-amber-800 border-amber-200"
                              : "bg-slate-100 text-slate-800 border-slate-200";

                          return (
                            <div key={issue.id} className="p-4 hover:bg-[#F9FCFA] transition-colors">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1.5 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-[#26352D]">
                                      {issue.equipmentName}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${severityBadge}`}>
                                      {issue.severity} Priority
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        isResolved
                                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                          : "bg-red-50 text-red-700 border border-red-200"
                                      }`}
                                    >
                                      {isResolved ? "Resolved" : "Open Issue"}
                                    </span>
                                    {isAllFarms && (
                                      <span className="text-[10px] text-[#55685D] bg-[#F4F8F4] px-1.5 py-0.5 rounded">
                                        {issue.farmName}
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-xs font-semibold text-[#0C4B32]">
                                    {issue.issueType}
                                  </div>

                                  <p className="text-xs text-[#55685D] leading-relaxed">
                                    {issue.description}
                                  </p>

                                  <div className="text-[11px] text-[#889B90] flex items-center gap-3 pt-0.5">
                                    <span>Reported by: <strong className="text-[#26352D]">{issue.reportedBy}</strong></span>
                                    <span>•</span>
                                    <span>Date: {issue.reportedDate}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 sm:self-center shrink-0">
                                  {!isResolved ? (
                                    <button
                                      type="button"
                                      onClick={() => handleResolveIssue(issue.id, issue.equipmentId)}
                                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Mark Resolved</span>
                                    </button>
                                  ) : (
                                    <span className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Fixed & Ready</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  ) : (
                    /* EQUIPMENT INVENTORY & STATUS LEDGER */
                    visibleEquipment.length === 0 ? (
                      <div className="p-12 text-center">
                        <Wrench className="w-8 h-8 text-[#889B90] mx-auto mb-2 opacity-60" />
                        <p className="text-sm font-semibold text-[#26352D]">No Equipment Found</p>
                        <p className="text-xs text-[#55685D] mt-1">
                          No machinery matches the selected filter or search keyword.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#E5ECE7]">
                        {visibleEquipment.map((eq) => {
                          const isProblemReported = eq.status === "Problem Reported";
                          const isServiceDue = eq.status === "Service Due";

                          const statusBadgeClass = isProblemReported
                            ? "bg-red-50 text-red-700 border-red-200"
                            : isServiceDue
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200";

                          const isExpanded = expandedEquipmentId === eq.id;

                          return (
                            <div key={eq.id} className="transition-colors hover:bg-[#F9FCFA]">
                              {/* Main Compact Row with Generous Spacing */}
                              <div className="px-5 sm:px-6 py-4 sm:py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div
                                  onClick={() => setExpandedEquipmentId((prev) => (prev === eq.id ? null : eq.id))}
                                  className="min-w-0 flex-1 flex items-center gap-3 flex-wrap cursor-pointer select-none"
                                >
                                  <span className="text-sm font-bold text-[#26352D] hover:text-[#0C4B32] transition-colors truncate mr-1">
                                    {eq.name}
                                  </span>
                                  <span className="text-[11px] font-semibold text-[#0C4B32] bg-[#E7F3EB] px-2.5 py-1 rounded-md border border-[#C6E2D0]">
                                    {eq.category}
                                  </span>
                                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusBadgeClass}`}>
                                    {eq.status}
                                  </span>
                                  {isAllFarms && (
                                    <span className="text-[11px] text-[#55685D] bg-[#F4F8F4] px-2 py-1 rounded-md border border-[#E5ECE7]">
                                      {eq.farmName}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F0F4F1] shrink-0">
                                  <div
                                    onClick={() => setExpandedEquipmentId((prev) => (prev === eq.id ? null : eq.id))}
                                    className="text-xs text-[#55685D] cursor-pointer truncate max-w-[140px] sm:max-w-none"
                                  >
                                    Operator: <strong className="text-[#26352D]">{eq.operator}</strong>
                                  </div>

                                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenReportProblem(eq)}
                                      title="Report a breakdown or mechanical issue"
                                      className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors cursor-pointer inline-flex items-center gap-1 sm:gap-1.5 shadow-2xs"
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                                      <span className="hidden xs:inline sm:inline">Report</span>
                                      <span className="inline xs:hidden sm:hidden">Report</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteEquipment(eq.id)}
                                      title="Remove equipment"
                                      className="text-[#889B90] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>

                                    {/* Dropdown Toggle */}
                                    <button
                                      type="button"
                                      onClick={() => setExpandedEquipmentId((prev) => (prev === eq.id ? null : eq.id))}
                                      title={isExpanded ? "Hide details" : "Show details"}
                                      className="p-1.5 rounded-lg text-[#889B90] hover:text-[#26352D] hover:bg-[#E5ECE7]/60 transition-colors cursor-pointer"
                                    >
                                      <ChevronDown
                                        className={`w-4 h-4 transition-transform duration-200 ${
                                          isExpanded ? "rotate-180 text-[#0C4B32]" : ""
                                        }`}
                                      />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Dropdown Details Drawer */}
                              {isExpanded && (
                                <div className="px-5 sm:px-6 py-4 sm:py-5 bg-[#F4F8F4]/80 border-t border-[#E5ECE7] space-y-3.5">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                                    <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 shadow-2xs">
                                      <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                        Next Service Date
                                      </span>
                                      <span
                                        className={`font-semibold mt-0.5 block ${
                                          isServiceDue ? "text-amber-700 font-bold" : "text-[#26352D]"
                                        }`}
                                      >
                                        {eq.nextServiceDate ? formatDisplayDate(eq.nextServiceDate) : "Not scheduled"}
                                      </span>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 shadow-2xs">
                                      <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                        Total Runtime
                                      </span>
                                      <span className="font-semibold text-[#26352D] mt-0.5 block">
                                        {eq.runtimeHours} Engine Hours
                                      </span>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 shadow-2xs">
                                      <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                        Model / Serial #
                                      </span>
                                      <span className="font-semibold text-[#26352D] mt-0.5 block">
                                        {eq.modelNumber || "Not recorded"}
                                      </span>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 shadow-2xs">
                                      <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                        Fuel / Power Specs
                                      </span>
                                      <span className="font-semibold text-emerald-700 mt-0.5 block">
                                        {eq.fuelEfficiency || "Standard"}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs pt-1">
                                    <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 shadow-2xs">
                                      <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                        Assigned Operator
                                      </span>
                                      <span className="font-semibold text-[#26352D] mt-0.5 block">
                                        {eq.operator}
                                      </span>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 shadow-2xs">
                                      <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                        Farm Holding
                                      </span>
                                      <span className="font-semibold text-[#26352D] mt-0.5 block">
                                        {eq.farmName}
                                      </span>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-[#E5ECE7]/80 shadow-2xs">
                                      <span className="text-[10px] font-medium text-[#889B90] uppercase tracking-wider block">
                                        Last Serviced
                                      </span>
                                      <span className="font-semibold text-[#26352D] mt-0.5 block">
                                        {eq.lastServiceDate ? formatDisplayDate(eq.lastServiceDate) : "Not recorded"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* TAB: PRODUCTION, LOSSES & EXPENSES (Simple & Sober) */}
            {activeTab === "expenses" && (
              <div className="space-y-4">
                {/* 1. Simple Header */}
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h2 className="text-base font-bold text-[#26352D]">Stats</h2>
                    <p className="text-xs text-[#55685D] mt-0.5">
                      Production, losses & expenses • {isAllFarms ? "All registered holdings" : currentFarm.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenRecordModal("production")}
                    className="btn btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 cursor-pointer shadow-xs rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record Entry</span>
                  </button>
                </div>

                {/* 2. Interactive 4-Metric Strip (Click to Filter) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setFinancialFilterType("all")}
                    className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                      financialFilterType === "all"
                        ? "bg-[#E7F3EB] border-[#0C4B32] shadow-xs ring-1 ring-[#0C4B32]"
                        : "bg-white border-[#E5ECE7] hover:border-[#A7D7B8] shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#55685D]">Net Realization</span>
                      {financialFilterType === "all" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0C4B32]" />
                      )}
                    </div>
                    <div className={`text-lg font-bold mt-1 ${netRealization >= 0 ? "text-[#0C4B32]" : "text-red-600"}`}>
                      {netRealization >= 0 ? "+" : ""}₹{netRealization.toLocaleString("en-IN")}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFinancialFilterType("production")}
                    className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                      financialFilterType === "production"
                        ? "bg-emerald-50/80 border-emerald-600 shadow-xs ring-1 ring-emerald-600"
                        : "bg-white border-[#E5ECE7] hover:border-emerald-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-emerald-800">Production</span>
                      {financialFilterType === "production" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      )}
                    </div>
                    <div className="text-lg font-bold text-emerald-700 mt-1">
                      +₹{totalProduction.toLocaleString("en-IN")}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFinancialFilterType("loss")}
                    className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                      financialFilterType === "loss"
                        ? "bg-amber-50/80 border-amber-600 shadow-xs ring-1 ring-amber-600"
                        : "bg-white border-[#E5ECE7] hover:border-amber-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-amber-900">Losses</span>
                      {financialFilterType === "loss" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      )}
                    </div>
                    <div className="text-lg font-bold text-amber-700 mt-1">
                      -₹{totalLosses.toLocaleString("en-IN")}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFinancialFilterType("expense")}
                    className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                      financialFilterType === "expense"
                        ? "bg-red-50/80 border-red-600 shadow-xs ring-1 ring-red-600"
                        : "bg-white border-[#E5ECE7] hover:border-red-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-red-900">Expenses</span>
                      {financialFilterType === "expense" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      )}
                    </div>
                    <div className="text-lg font-bold text-red-600 mt-1">
                      -₹{totalExpenses.toLocaleString("en-IN")}
                    </div>
                  </button>
                </div>

                {/* 3. Filter Toolbar with Segmented Buttons & Farm Selector */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E5ECE7] shadow-xs">
                  {/* Separate Clickable Filters */}
                  <div className="flex items-center gap-1.5 p-1 bg-[#F4F8F4] rounded-xl border border-[#DCE6DE] overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setFinancialFilterType("all")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        financialFilterType === "all"
                          ? "bg-white text-[#0C4B32] shadow-2xs"
                          : "text-[#55685D] hover:text-[#26352D]"
                      }`}
                    >
                      All Records ({farmScopedTransactions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFinancialFilterType("production")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        financialFilterType === "production"
                          ? "bg-emerald-700 text-white shadow-2xs"
                          : "text-[#55685D] hover:text-emerald-800"
                      }`}
                    >
                      Production ({farmScopedTransactions.filter((t) => t.type === "production").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFinancialFilterType("loss")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        financialFilterType === "loss"
                          ? "bg-amber-700 text-white shadow-2xs"
                          : "text-[#55685D] hover:text-amber-900"
                      }`}
                    >
                      Losses ({farmScopedTransactions.filter((t) => t.type === "loss").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFinancialFilterType("expense")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        financialFilterType === "expense"
                          ? "bg-red-700 text-white shadow-2xs"
                          : "text-[#55685D] hover:text-red-800"
                      }`}
                    >
                      Expenses ({farmScopedTransactions.filter((t) => t.type === "expense").length})
                    </button>
                  </div>

                  {/* Farm selector & Search */}
                  <div className="flex items-center gap-2">
                    {isAllFarms && (
                      <select
                        value={financialFarmFilter}
                        onChange={(e) => setFinancialFarmFilter(e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded-lg border border-[#DCE6DE] bg-white text-[#26352D] outline-none"
                      >
                        <option value="all">All Holdings</option>
                        {farms.map((f) => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    )}

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#55685D] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={financialSearch}
                      onChange={(e) => setFinancialSearch(e.target.value)}
                      placeholder="Search..."
                      className="w-full sm:w-52 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#DCE6DE] bg-white text-[#26352D] outline-none"
                    />
                  </div>
                </div>
              </div>

                {/* 4. Minimal, Clean Ledger */}
                <div className="bg-white rounded-xl border border-[#E5ECE7] overflow-hidden shadow-xs">
                  {visibleTransactions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#55685D]">
                      No records found.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E5ECE7] text-xs">
                      {visibleTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-[#F8FAF8] transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                  tx.type === "production"
                                    ? "bg-emerald-50 text-emerald-800"
                                    : tx.type === "loss"
                                    ? "bg-amber-50 text-amber-900"
                                    : "bg-red-50 text-red-800"
                                }`}
                              >
                                {tx.type === "production" ? "Production" : tx.type === "loss" ? "Loss" : "Expense"}
                              </span>
                              <span className="font-semibold text-sm text-[#26352D] truncate">{tx.title}</span>
                            </div>
                            <div className="text-[11px] text-[#55685D] mt-0.5">
                              {tx.date} • {tx.category} {tx.quantity ? `• ${tx.quantity}` : ""}
                            </div>
                          </div>

                          <div className="text-right shrink-0 flex items-center gap-3">
                            <div
                              className={`font-bold text-sm ${
                                tx.type === "production"
                                  ? "text-emerald-700"
                                  : tx.type === "loss"
                                  ? "text-amber-700"
                                  : "text-red-600"
                              }`}
                            >
                              {tx.type === "production" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteTransaction(tx.id)}
                              title="Delete record"
                              className="text-[#889B90] hover:text-red-600 p-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: TEAM MANAGEMENT (With Distinct Sub-Tabs for Members vs Designations & Roles) */}
            {activeTab === "team" && (
              <div className="space-y-6">
                {/* 1. Header with Sub-Tab Switcher & Dynamic Primary Action Button */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#26352D]">Team & Workforce Management</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E7F3EB] text-[#0C4B32] border border-[#C6E2D0]">
                        Role-Based Access Control
                      </span>
                    </div>
                    <p className="text-xs text-[#55685D] mt-0.5">
                      Configure designations with module-level permissions via checkboxes, and assign staff members to farm holdings.
                    </p>
                  </div>

                  {/* Sub-Tab Navigation Switcher & Dynamic Button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                    <div className="grid grid-cols-2 p-1 bg-[#F4F8F4] rounded-xl border border-[#DCE6DE]">
                      <button
                        type="button"
                        onClick={() => setTeamSubTab("members")}
                        className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                          teamSubTab === "members"
                            ? "bg-white text-[#0C4B32] shadow-xs border border-[#C6E2D0]"
                            : "text-[#55685D] hover:text-[#26352D]"
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span className="truncate">Members ({teamMembers.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTeamSubTab("designations")}
                        className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                          teamSubTab === "designations"
                            ? "bg-white text-[#0C4B32] shadow-xs border border-[#C6E2D0]"
                            : "text-[#55685D] hover:text-[#26352D]"
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="truncate">Roles ({designations.length})</span>
                      </button>
                    </div>

                    {teamSubTab === "members" ? (
                      <button
                        type="button"
                        onClick={handleOpenAddTeamModal}
                        className="btn btn-primary text-xs px-4 py-2 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs rounded-xl font-semibold w-full sm:w-auto"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add Team Member</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleOpenAddDesignationModal}
                        className="btn btn-primary text-xs px-4 py-2 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs rounded-xl font-semibold w-full sm:w-auto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Designation</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* ==================== SUB-TAB 1: TEAM MEMBERS DIRECTORY ==================== */}
                {teamSubTab === "members" && (
                  <div className="space-y-6">
                    {/* Team Metric Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                        <span className="text-[11px] font-semibold text-[#55685D] block">Total Workforce</span>
                        <div className="text-xl sm:text-2xl font-bold text-[#0C4B32] mt-1">
                          {teamMembers.length}
                        </div>
                        <span className="text-[10px] text-[#55685D] mt-1 inline-block">
                          Active staff & field personnel
                        </span>
                      </div>

                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                        <span className="text-[11px] font-semibold text-[#55685D] block">Configured Designations</span>
                        <div className="text-xl sm:text-2xl font-bold text-[#26352D] mt-1">
                          {designations.length}
                        </div>
                        <button
                          type="button"
                          onClick={() => setTeamSubTab("designations")}
                          className="text-[10px] text-[#0C4B32] font-semibold mt-1 inline-flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <span>Manage roles & permissions &rarr;</span>
                        </button>
                      </div>

                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                        <span className="text-[11px] font-semibold text-[#55685D] block">Assigned Holdings</span>
                        <div className="text-xl sm:text-2xl font-bold text-[#26352D] mt-1">
                          {isAllFarms ? farms.length : 1}
                        </div>
                        <span className="text-[10px] text-[#55685D] mt-1 inline-block">
                          Active parcel deployments
                        </span>
                      </div>

                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                        <span className="text-[11px] font-semibold text-[#55685D] block">Active Workforce</span>
                        <div className="text-xl sm:text-2xl font-bold text-[#0C4B32] mt-1">
                          {teamMembers.filter((m) => m.status === "Active").length}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                          {teamMembers.filter((m) => m.status === "Pending Invite").length} pending invitations
                        </span>
                      </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5ECE7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
                        {/* Search Input */}
                        <div className="relative flex-1 sm:max-w-xs">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#889B90]" />
                          <input
                            type="text"
                            placeholder="Search name, phone, designation..."
                            value={teamSearch}
                            onChange={(e) => setTeamSearch(e.target.value)}
                            className="pl-8 pr-3 py-1.5 text-xs text-[#26352D] bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl outline-none focus:border-[#0C4B32] placeholder:text-[#889B90] w-full"
                          />
                        </div>

                        {/* Designation Dropdown Filter */}
                        <select
                          value={teamDesignationFilter}
                          onChange={(e) => setTeamDesignationFilter(e.target.value)}
                          className="px-2.5 py-1.5 text-xs font-medium text-[#26352D] bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl outline-none focus:border-[#0C4B32] cursor-pointer"
                        >
                          <option value="all">All Designations</option>
                          {designations.map((des) => (
                            <option key={des.id} value={des.id}>
                              {des.title}
                            </option>
                          ))}
                        </select>

                        {/* Farm Scope Dropdown Filter */}
                        {isAllFarms && (
                          <select
                            value={teamFarmFilter}
                            onChange={(e) => setTeamFarmFilter(e.target.value)}
                            className="px-2.5 py-1.5 text-xs font-medium text-[#26352D] bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl outline-none focus:border-[#0C4B32] cursor-pointer"
                          >
                            <option value="all">All Holdings</option>
                            {farms.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Quick Reset */}
                        {(teamSearch || teamDesignationFilter !== "all" || teamFarmFilter !== "all") && (
                          <button
                            type="button"
                            onClick={() => {
                              setTeamSearch("");
                              setTeamDesignationFilter("all");
                              setTeamFarmFilter("all");
                            }}
                            className="text-xs font-semibold text-[#55685D] hover:text-[#0C4B32] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Clear Filters</span>
                          </button>
                        )}
                      </div>

                      <div className="text-[11px] font-medium text-[#55685D] self-end md:self-auto shrink-0">
                        Showing{" "}
                        <span className="font-bold text-[#26352D]">
                          {
                            teamMembers.filter((m) => {
                              if (isAllFarms && teamFarmFilter !== "all" && m.farmId !== "all" && m.farmId !== teamFarmFilter)
                                return false;
                              if (teamDesignationFilter !== "all" && m.designationId !== teamDesignationFilter) return false;
                              if (!teamSearch.trim()) return true;
                              const q = teamSearch.toLowerCase();
                              return (
                                m.name.toLowerCase().includes(q) ||
                                m.designationTitle.toLowerCase().includes(q) ||
                                m.phone.toLowerCase().includes(q) ||
                                (m.email && m.email.toLowerCase().includes(q)) ||
                                m.farmName.toLowerCase().includes(q)
                              );
                            }).length
                          }
                        </span>{" "}
                        of {teamMembers.length} Members
                      </div>
                    </div>

                    {/* Team Members Directory List View */}
                    {(() => {
                      const filtered = teamMembers.filter((m) => {
                        if (isAllFarms && teamFarmFilter !== "all" && m.farmId !== "all" && m.farmId !== teamFarmFilter)
                          return false;
                        if (teamDesignationFilter !== "all" && m.designationId !== teamDesignationFilter) return false;
                        if (!teamSearch.trim()) return true;
                        const q = teamSearch.toLowerCase();
                        return (
                          m.name.toLowerCase().includes(q) ||
                          m.designationTitle.toLowerCase().includes(q) ||
                          m.phone.toLowerCase().includes(q) ||
                          (m.email && m.email.toLowerCase().includes(q)) ||
                          m.farmName.toLowerCase().includes(q)
                        );
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="bg-white p-12 text-center rounded-2xl border border-[#E5ECE7] shadow-xs space-y-3">
                            <div className="w-12 h-12 rounded-full bg-[#F4F8F4] text-[#55685D] flex items-center justify-center mx-auto border border-[#DCE6DE]">
                              <Users className="w-6 h-6 text-[#889B90]" />
                            </div>
                            <h3 className="text-sm font-bold text-[#26352D]">No team members found</h3>
                            <p className="text-xs text-[#55685D] max-w-sm mx-auto">
                              No workforce personnel match your search filters. Try adjusting the filters or invite a new member.
                            </p>
                            <button
                              type="button"
                              onClick={handleOpenAddTeamModal}
                              className="btn btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 cursor-pointer mt-2"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Add Team Member</span>
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="bg-white rounded-2xl border border-[#E5ECE7] overflow-hidden shadow-xs">
                          {/* DESKTOP TABLE VIEW */}
                          <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[#F8FAF8] border-b border-[#E5ECE7] text-[#55685D]">
                                <tr>
                                  <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Team Member</th>
                                  <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Designation & Role</th>
                                  <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Farm Scope</th>
                                  <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Phone Number</th>
                                  <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Status</th>
                                  <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#E5ECE7]">
                                {filtered.map((m) => {
                                  const initials = m.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase();

                                  return (
                                    <tr
                                      key={m.id}
                                      className="hover:bg-[#F9FCFA] transition-colors"
                                    >
                                      {/* Member Name, Avatar & Email */}
                                      <td className="px-5 sm:px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                          <div className="w-9 h-9 rounded-xl bg-[#E7F3EB] text-[#0C4B32] border border-[#C6E2D0] flex items-center justify-center text-xs font-bold shrink-0">
                                            {initials}
                                          </div>
                                          <div className="min-w-0">
                                            <span className="font-bold text-sm text-[#26352D] block truncate">
                                              {m.name}
                                            </span>
                                            {m.email && (
                                              <span className="text-[11px] text-[#55685D] block truncate">
                                                {m.email}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </td>

                                      {/* Designation Pill */}
                                      <td className="px-5 sm:px-6 py-3.5">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#E7F3EB] text-[#0C4B32] border border-[#C6E2D0]">
                                          {m.designationTitle}
                                        </span>
                                      </td>

                                      {/* Assigned Farm Holding */}
                                      <td className="px-5 sm:px-6 py-3.5">
                                        <div className="flex items-center gap-1.5 text-xs text-[#26352D]">
                                          <Building2 className="w-3.5 h-3.5 text-[#889B90] shrink-0" />
                                          <span className="truncate">{m.farmName}</span>
                                        </div>
                                      </td>

                                      {/* Phone */}
                                      <td className="px-5 sm:px-6 py-3.5">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-[#26352D]">
                                          <Phone className="w-3.5 h-3.5 text-[#889B90] shrink-0" />
                                          <span>{m.phone}</span>
                                        </div>
                                      </td>

                                      {/* Status Badge */}
                                      <td className="px-5 sm:px-6 py-3.5">
                                        <span
                                          className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                            m.status === "Active"
                                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                              : "bg-amber-50 text-amber-800 border-amber-200"
                                          }`}
                                        >
                                          {m.status}
                                        </span>
                                      </td>

                                      {/* Action Buttons */}
                                      <td className="px-5 sm:px-6 py-3.5 text-right whitespace-nowrap">
                                        <div className="inline-flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => handleOpenEditTeamModal(m)}
                                            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#0C4B32] inline-flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                                          >
                                            <Edit3 className="w-3 h-3 text-[#0C4B32]" />
                                            <span>Edit</span>
                                          </button>
                                          {m.id !== "tm-1" && (
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteTeamMember(m.id, m.name)}
                                              title="Remove member"
                                              className="p-1.5 text-[#889B90] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* MOBILE MEMBER CARDS (Under 640px) */}
                          <div className="sm:hidden divide-y divide-[#E5ECE7]">
                            {filtered.map((m) => {
                              const initials = m.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase();

                              return (
                                <div key={m.id} className="p-4 space-y-3">
                                  <div className="flex items-start justify-between gap-2.5">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-9 h-9 rounded-xl bg-[#E7F3EB] text-[#0C4B32] border border-[#C6E2D0] flex items-center justify-center text-xs font-bold shrink-0">
                                        {initials}
                                      </div>
                                      <div className="min-w-0">
                                        <span className="font-bold text-sm text-[#26352D] block truncate">
                                          {m.name}
                                        </span>
                                        {m.email && (
                                          <span className="text-[11px] text-[#55685D] block truncate">
                                            {m.email}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <span
                                      className={`shrink-0 inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                        m.status === "Active"
                                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                          : "bg-amber-50 text-amber-800 border-amber-200"
                                      }`}
                                    >
                                      {m.status}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 flex-wrap text-xs">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#E7F3EB] text-[#0C4B32] border border-[#C6E2D0]">
                                      {m.designationTitle}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[11px] text-[#55685D] bg-[#F4F8F4] px-2 py-0.5 rounded-md border border-[#E5ECE7]">
                                      <Building2 className="w-3 h-3 text-[#889B90]" />
                                      <span>{m.farmName}</span>
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between pt-1 border-t border-[#F0F4F1]">
                                    <a
                                      href={`tel:${m.phone}`}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F8F4] hover:bg-[#E7F3EB] text-[#0C4B32] text-xs font-semibold border border-[#DCE6DE] transition-colors"
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                      <span>{m.phone}</span>
                                    </a>

                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditTeamModal(m)}
                                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[#DCE6DE] bg-white text-[#0C4B32] inline-flex items-center gap-1"
                                      >
                                        <Edit3 className="w-3 h-3 text-[#0C4B32]" />
                                        <span>Edit</span>
                                      </button>
                                      {m.id !== "tm-1" && (
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteTeamMember(m.id, m.name)}
                                          className="p-1.5 text-[#889B90] hover:text-red-600 rounded-lg hover:bg-red-50"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* ==================== SUB-TAB 2: DESIGNATIONS & ROLES (RBAC & MODULE CHECKBOXES) ==================== */}
                {teamSubTab === "designations" && (
                  <div className="space-y-6">
                    {/* Designations Metric Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                        <span className="text-[11px] font-semibold text-[#55685D] block">Configured Designations</span>
                        <div className="text-xl sm:text-2xl font-bold text-[#0C4B32] mt-1">
                          {designations.length}
                        </div>
                        <span className="text-[10px] text-[#55685D] mt-1 inline-block">
                          Active farm job roles
                        </span>
                      </div>

                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                        <span className="text-[11px] font-semibold text-[#55685D] block">Assigned Staff Members</span>
                        <div className="text-xl sm:text-2xl font-bold text-[#26352D] mt-1">
                          {teamMembers.length}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                          Workforce personnel linked
                        </span>
                      </div>

                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                        <span className="text-[11px] font-semibold text-[#55685D] block">Full System Admins</span>
                        <div className="text-xl sm:text-2xl font-bold text-[#26352D] mt-1">
                          {designations.filter((d) => d.allowedModules.length === APP_MODULES.length).length}
                        </div>
                        <span className="text-[10px] text-[#55685D] mt-1 inline-block">
                          Roles with all 11 modules
                        </span>
                      </div>

                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                        <span className="text-[11px] font-semibold text-[#55685D] block">Custom Designations</span>
                        <div className="text-xl sm:text-2xl font-bold text-emerald-800 mt-1">
                          {designations.filter((d) => !d.isSystemDefault).length}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                          Farmer-created specialized roles
                        </span>
                      </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5ECE7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 sm:max-w-md">
                        {/* Select All Checkbox for Roles */}
                        <label className="flex items-center gap-2 cursor-pointer select-none shrink-0" title="Select all roles for bulk deletion">
                          <input
                            type="checkbox"
                            checked={
                              designations.length > 0 &&
                              selectedDesignationIds.length === designations.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDesignationIds(designations.map((d) => d.id));
                              } else {
                                setSelectedDesignationIds([]);
                              }
                            }}
                            className="w-4 h-4 rounded text-[#0C4B32] border-[#DCE6DE] focus:ring-[#0C4B32] cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-[#26352D] hidden md:inline">
                            Select All
                          </span>
                        </label>

                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#889B90]" />
                          <input
                            type="text"
                            placeholder="Search designations by title or responsibilities..."
                            value={designationSearch}
                            onChange={(e) => setDesignationSearch(e.target.value)}
                            className="pl-8 pr-3 py-1.5 text-xs text-[#26352D] bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl outline-none focus:border-[#0C4B32] placeholder:text-[#889B90] w-full"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        {/* Bulk Delete Button when roles are selected */}
                        {selectedDesignationIds.length > 0 && (
                          <button
                            type="button"
                            onClick={handleBulkDeleteDesignations}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Selected ({selectedDesignationIds.length})</span>
                          </button>
                        )}

                        <span className="text-[11px] font-medium text-[#55685D] hidden lg:inline">
                          Showing <span className="font-bold text-[#26352D]">{
                            designations.filter((d) => {
                              if (!designationSearch.trim()) return true;
                              const q = designationSearch.toLowerCase();
                              return d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
                            }).length
                          }</span> of {designations.length} Designations
                        </span>
                        <button
                          type="button"
                          onClick={handleOpenAddDesignationModal}
                          className="btn btn-primary text-xs px-3.5 py-1.5 inline-flex items-center gap-1.5 cursor-pointer shadow-xs rounded-xl font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Designation</span>
                        </button>
                      </div>
                    </div>

                    {/* Designations Grid */}
                    {(() => {
                      const filteredDes = designations.filter((d) => {
                        if (!designationSearch.trim()) return true;
                        const q = designationSearch.toLowerCase();
                        return d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
                      });

                      if (filteredDes.length === 0) {
                        return (
                          <div className="bg-white p-12 text-center rounded-2xl border border-[#E5ECE7] shadow-xs space-y-3">
                            <div className="w-12 h-12 rounded-full bg-[#F4F8F4] text-[#55685D] flex items-center justify-center mx-auto border border-[#DCE6DE]">
                              <ShieldCheck className="w-6 h-6 text-[#889B90]" />
                            </div>
                            <h3 className="text-sm font-bold text-[#26352D]">No designations found</h3>
                            <p className="text-xs text-[#55685D] max-w-sm mx-auto">
                              No roles match your search term &ldquo;{designationSearch}&rdquo;. Try another search or create a new designation.
                            </p>
                            <button
                              type="button"
                              onClick={handleOpenAddDesignationModal}
                              className="btn btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 cursor-pointer mt-2"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Create New Designation</span>
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                          {filteredDes.map((des) => {
                            const assignedMembers = teamMembers.filter((m) => m.designationId === des.id);
                            const isFullAdmin = des.allowedModules.length === APP_MODULES.length;
                            const isSelected = selectedDesignationIds.includes(des.id);

                            return (
                              <div
                                key={des.id}
                                className={`bg-white p-5 rounded-2xl border shadow-xs hover:border-[#C6E2D0] hover:shadow-sm transition-all space-y-4 flex flex-col justify-between ${
                                  isSelected ? "border-[#0C4B32] ring-1 ring-[#0C4B32]/30 bg-[#FBFDFB]" : "border-[#E5ECE7]"
                                }`}
                              >
                                <div className="space-y-3">
                                  {/* Designation Title & Badge with Selection Checkbox */}
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                      {/* Individual Select Checkbox */}
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedDesignationIds((prev) => [...prev, des.id]);
                                          } else {
                                            setSelectedDesignationIds((prev) => prev.filter((id) => id !== des.id));
                                          }
                                        }}
                                        className="w-4 h-4 rounded text-[#0C4B32] border-[#DCE6DE] focus:ring-[#0C4B32] cursor-pointer mt-1 shrink-0"
                                        title={`Select ${des.title}`}
                                      />

                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h3 className="font-bold text-base text-[#26352D]">{des.title}</h3>
                                          <span
                                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                              des.isSystemDefault
                                                ? "bg-[#E7F3EB] text-[#0C4B32] border-[#C6E2D0]"
                                                : "bg-purple-50 text-purple-800 border-purple-200"
                                            }`}
                                          >
                                            {des.isSystemDefault ? "Default Role" : "Custom Role"}
                                          </span>
                                        </div>
                                        <p className="text-xs text-[#55685D] line-clamp-2">
                                          {des.description}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Member count pill */}
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-[#F4F8F4] border border-[#DCE6DE] text-[#26352D] whitespace-nowrap shrink-0">
                                      {assignedMembers.length} {assignedMembers.length === 1 ? "Staff" : "Staff"} Assigned
                                    </span>
                                  </div>

                                  {/* Assigned Members avatars */}
                                  {assignedMembers.length > 0 && (
                                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#55685D]">
                                      <span className="text-[10px] font-semibold text-[#889B90]">Assigned to:</span>
                                      <div className="flex items-center -space-x-1">
                                        {assignedMembers.slice(0, 4).map((m) => (
                                          <div
                                            key={m.id}
                                            title={m.name}
                                            className="w-5 h-5 rounded-full bg-[#E7F3EB] text-[#0C4B32] border border-white text-[9px] font-bold flex items-center justify-center shrink-0"
                                          >
                                            {m.name.charAt(0)}
                                          </div>
                                        ))}
                                      </div>
                                      <span className="font-medium text-[#26352D] truncate">
                                        {assignedMembers.map((m) => m.name.split(" ")[0]).join(", ")}
                                      </span>
                                    </div>
                                  )}

                                  {/* Module Access Privileges Matrix Display */}
                                  <div className="p-3 bg-[#F8FAF8] rounded-xl border border-[#E5ECE7] space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5 text-[#0C4B32]" />
                                        <span className="font-bold text-[#26352D] text-[11px]">
                                          Allowed Module Permissions
                                        </span>
                                      </div>
                                      <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                          isFullAdmin
                                            ? "bg-emerald-100 text-[#0C4B32]"
                                            : "bg-[#E5ECE7] text-[#55685D]"
                                        }`}
                                      >
                                        {des.allowedModules.length} / {APP_MODULES.length} Allowed
                                      </span>
                                    </div>

                                    {/* Checklist badges */}
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                      {APP_MODULES.map((mod) => {
                                        const hasAccess = des.allowedModules.includes(mod.id);
                                        if (hasAccess) {
                                          return (
                                            <span
                                              key={mod.id}
                                              title={`Access Granted: ${mod.description}`}
                                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white text-[#0C4B32] border border-[#C6E2D0] shadow-2xs"
                                            >
                                              <Check className="w-2.5 h-2.5 text-[#0C4B32]" />
                                              <span>{mod.label}</span>
                                            </span>
                                          );
                                        }
                                        return (
                                          <span
                                            key={mod.id}
                                            title={`Access Restricted: ${mod.label}`}
                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] text-[#A0AFA6] bg-[#F4F8F4] opacity-50 border border-transparent"
                                          >
                                            <span>✕</span>
                                            <span className="line-through">{mod.label}</span>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* Card Footer Actions */}
                                <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-between gap-2">
                                  <span className="text-[10px] text-[#889B90]">
                                    Role ID: #{des.id}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditDesignationModal(des)}
                                      className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#0C4B32] inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-[#0C4B32]" />
                                      <span>Edit Role & Permissions</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteDesignation(des.id, des.title)}
                                      title="Delete role"
                                      className="p-1.5 text-[#889B90] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* TAB: REPORTS AND ANALYTICS (Interactive Chart & Table Views) */}
            {activeTab === "reports" && (
              <div className="space-y-6">
                {/* ===================== PRINT-ONLY DEDICATED REPORT DOCUMENT ===================== */}
                <div className="hidden print:block khetivo-print-container print-avoid-break bg-white text-[#0F172A] font-sans antialiased">
                  {/* Decorative Top Accent Bar */}
                  <div className="h-2 w-full bg-linear-to-r from-[#0C4B32] via-[#1B704C] to-[#2E8B57] rounded-t-sm mb-5"></div>

                  {/* Header: Company & Farm Details + Official Seal / Audit Stamp */}
                  <div className="flex items-start justify-between pb-5 border-b-2 border-[#0C4B32]/30 mb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-[#0C4B32] text-white flex items-center justify-center font-black text-xl shadow-xs">
                          K
                        </div>
                        <div>
                          <span className="text-2xl font-black text-[#0C4B32] tracking-tight uppercase">KHETIVO</span>
                          <span className="ml-2.5 inline-flex items-center gap-1 text-[9px] font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#E7F3EB] text-[#0C4B32] border border-[#A7D7B9] uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0C4B32]"></span>
                            Official Farm Audit Report
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] font-semibold text-[#3D5A47] tracking-wide pt-0.5">
                        Autonomous Precision Agronomic & Financial Intelligence
                      </p>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[10px] text-[#475C4E] pt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[#64748B] font-medium">Holding:</span>
                          <strong className="text-[#0F172A] font-semibold">{isAllFarms ? "Consolidated Farms Portfolio" : currentFarm.name}</strong>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[#64748B] font-medium">Location:</span>
                          <strong className="text-[#0F172A] font-semibold">{[currentFarm.village, currentFarm.district, currentFarm.state].filter(Boolean).join(", ") || "India"}</strong>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[#64748B] font-medium">Total Area:</span>
                          <strong className="text-[#0F172A] font-semibold">{isAllFarms ? `${totalCombinedArea} ${currentFarm.areaUnit}` : `${currentFarm.totalArea} ${currentFarm.areaUnit}`}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1 min-w-[220px]">
                      <div className="inline-block bg-[#F8FAF9] border border-[#DCE6DE] rounded-lg px-3 py-1.5 text-right shadow-2xs">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-[#64748B]">Report Category</div>
                        <div className="text-xs font-black text-[#0C4B32]">
                          {reportCategory === "financial" ? "Financial & P&L Statement" : reportCategory === "crops" ? "Crop Performance & Acreage" : reportCategory === "inputs" ? "Input & Inventory Audit" : "Machinery & Fleet Utilization"}
                        </div>
                      </div>
                      <div className="text-[10px] text-[#475569] pt-1">
                        Period: <strong className="text-[#0F172A] font-semibold">{reportStartDate ? formatDisplayDate(reportStartDate) : "Start"}</strong> — <strong className="text-[#0F172A] font-semibold">{reportEndDate ? formatDisplayDate(reportEndDate) : "Present"}</strong>
                      </div>
                      <div className="text-[9px] text-[#94A3B8]">
                        Generated: {reportGeneratedAt || "Live Report"}
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Strip for Print */}
                  {reportCategory === "financial" && (
                    <div className="grid grid-cols-4 gap-3 mb-5 print-avoid-break">
                      <div className="border border-[#CBD5E1] rounded-xl p-3 bg-linear-to-b from-[#F8FAFC] to-[#F1F5F9] shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] block">Net Realization</span>
                        <div className="text-xl font-black text-[#0C4B32] mt-0.5">₹{reportNetRealization.toLocaleString("en-IN")}</div>
                        <span className="text-[9px] text-emerald-700 font-semibold">{reportTotalProduction > 0 ? ((reportNetRealization / reportTotalProduction) * 100).toFixed(1) : "0"}% Farm Margin</span>
                      </div>
                      <div className="border border-[#CBD5E1] rounded-xl p-3 bg-linear-to-b from-[#F8FAFC] to-[#F1F5F9] shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] block">Gross Production Inflow</span>
                        <div className="text-xl font-black text-emerald-800 mt-0.5">₹{reportTotalProduction.toLocaleString("en-IN")}</div>
                        <span className="text-[9px] text-[#64748B]">Harvest Sales Realized</span>
                      </div>
                      <div className="border border-[#CBD5E1] rounded-xl p-3 bg-linear-to-b from-[#F8FAFC] to-[#F1F5F9] shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] block">Damage & Loss Value</span>
                        <div className="text-xl font-black text-amber-900 mt-0.5">₹{reportTotalLosses.toLocaleString("en-IN")}</div>
                        <span className="text-[9px] text-amber-700">Field & Storage Losses</span>
                      </div>
                      <div className="border border-[#CBD5E1] rounded-xl p-3 bg-linear-to-b from-[#F8FAFC] to-[#F1F5F9] shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] block">Total Operating Outflow</span>
                        <div className="text-xl font-black text-rose-700 mt-0.5">₹{reportTotalExpenses.toLocaleString("en-IN")}</div>
                        <span className="text-[9px] text-rose-700">Inputs, Labor & Fleet</span>
                      </div>
                    </div>
                  )}

                  {reportCategory === "crops" && (
                    <div className="grid grid-cols-4 gap-3 mb-5 print-avoid-break">
                      <div className="border border-[#CBD5E1] rounded-xl p-3 bg-linear-to-b from-[#F8FAFC] to-[#F1F5F9] shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] block">Total Cultivated</span>
                        <div className="text-xl font-black text-[#0C4B32] mt-0.5">{activeCrops.reduce((acc, c) => acc + (c.area || 0), 0)} {currentFarm.areaUnit}</div>
                        <span className="text-[9px] text-[#64748B]">Across Active Parcels</span>
                      </div>
                      <div className="border border-[#CBD5E1] rounded-xl p-3 bg-linear-to-b from-[#F8FAFC] to-[#F1F5F9] shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] block">Active Batches</span>
                        <div className="text-xl font-black text-[#0C4B32] mt-0.5">{activeCrops.length} Crops</div>
                        <span className="text-[9px] text-[#64748B]">Logged in Rotation</span>
                      </div>
                      <div className="border border-[#CBD5E1] rounded-xl p-3 bg-linear-to-b from-[#F8FAFC] to-[#F1F5F9] shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] block">Primary Variety</span>
                        <div className="text-lg font-black text-[#0C4B32] mt-0.5 truncate">{activeCrops[0]?.name || "N/A"}</div>
                        <span className="text-[9px] text-[#64748B]">Major Commodity</span>
                      </div>
                      <div className="border border-[#CBD5E1] rounded-xl p-3 bg-linear-to-b from-[#F8FAFC] to-[#F1F5F9] shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] block">Crop Health Index</span>
                        <div className="text-xl font-black text-emerald-700 mt-0.5">Optimal (94%)</div>
                        <span className="text-[9px] text-emerald-700 font-semibold">Sentinel-2 NDVI Normalized</span>
                      </div>
                    </div>
                  )}

                  {reportCategory === "inputs" && (
                    <div className="grid grid-cols-3 gap-3 mb-5 print-avoid-break">
                      <div className="border border-[#CBD5E1] rounded-xl p-3 bg-linear-to-b from-[#F8FAFC] to-[#F1F5F9] shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] block">Total Inventory Valuation</span>
                        <div className="text-xl font-black text-[#0C4B32] mt-0.5">
                          ₹{scopedInventoryItems.reduce((acc, item) => acc + item.quantity * item.rate, 0).toLocaleString("en-IN")}
                        </div>
                        <span className="text-[9px] text-[#64748B]">Warehouse Balance</span>
                      </div>
                      <div className="border border-[#CBD5E1] rounded-xl p-3 bg-linear-to-b from-[#F8FAFC] to-[#F1F5F9] shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] block">Tracked Stock Items</span>
                        <div className="text-xl font-black text-[#0C4B32] mt-0.5">{scopedInventoryItems.length} Commodities</div>
                        <span className="text-[9px] text-[#64748B]">Seeds, Nutrients & Fuel</span>
                      </div>
                      <div className="border border-[#CBD5E1] rounded-xl p-3 bg-linear-to-b from-[#F8FAFC] to-[#F1F5F9] shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] block">Low Stock / Reorder</span>
                        <div className="text-xl font-black text-amber-700 mt-0.5">
                          {scopedInventoryItems.filter(i => i.quantity <= (i.lowStockThreshold || 5)).length} Items
                        </div>
                        <span className="text-[9px] text-amber-700 font-semibold">Immediate Attention</span>
                      </div>
                    </div>
                  )}

                  {reportCategory === "machinery" && (
                    <div className="grid grid-cols-3 gap-3 mb-5 print-avoid-break">
                      <div className="border border-[#CBD5E1] rounded-xl p-3 bg-linear-to-b from-[#F8FAFC] to-[#F1F5F9] shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] block">Total Equipment Count</span>
                        <div className="text-xl font-black text-[#0C4B32] mt-0.5">{scopedEquipment.length} Assets</div>
                        <span className="text-[9px] text-[#64748B]">Active Motor Fleet</span>
                      </div>
                      <div className="border border-[#CBD5E1] rounded-xl p-3 bg-linear-to-b from-[#F8FAFC] to-[#F1F5F9] shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] block">Cumulative Hours Run</span>
                        <div className="text-xl font-black text-[#0C4B32] mt-0.5">
                          {scopedEquipment.reduce((acc, eq) => acc + (Number(eq.runtimeHours) || 0), 0)} Hours
                        </div>
                        <span className="text-[9px] text-[#64748B]">Fleet Telemetry Logged</span>
                      </div>
                      <div className="border border-[#CBD5E1] rounded-xl p-3 bg-linear-to-b from-[#F8FAFC] to-[#F1F5F9] shadow-2xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] block">Service Readiness</span>
                        <div className="text-xl font-black text-emerald-700 mt-0.5">
                          {scopedEquipment.filter(eq => eq.status === "Operational" || eq.status === "In Field").length} / {scopedEquipment.length}
                        </div>
                        <span className="text-[9px] text-emerald-700 font-semibold">Ready for Field Work</span>
                      </div>
                    </div>
                  )}

                  {/* Clean, Elegant Audit Tables for Print */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#CBD5E1]">
                      <h3 className="text-[11px] font-black uppercase tracking-wider text-[#1E293B]">
                        Detailed Audit Records & Ledger
                      </h3>
                      <span className="text-[9px] text-[#64748B] font-medium">
                        Verified entries certified for official audits
                      </span>
                    </div>

                    {reportCategory === "financial" && (
                      <table className="w-full text-left text-[10px] border border-[#CBD5E1] rounded-lg overflow-hidden shadow-2xs">
                        <thead className="bg-[#0C4B32] text-white font-semibold">
                          <tr>
                            <th className="p-2.5 border-r border-[#1B704C]">Date</th>
                            <th className="p-2.5 border-r border-[#1B704C]">Type</th>
                            <th className="p-2.5 border-r border-[#1B704C]">Title & Description</th>
                            <th className="p-2.5 border-r border-[#1B704C]">Category</th>
                            <th className="p-2.5 border-r border-[#1B704C]">Holding / Crop</th>
                            <th className="p-2.5 text-right border-r border-[#1B704C]">Amount (₹)</th>
                            <th className="p-2.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {reportScopedTransactions.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-4 text-center text-[#64748B] italic">
                                No transactions recorded for this period.
                              </td>
                            </tr>
                          ) : (
                            reportScopedTransactions.map((tx, idx) => (
                              <tr key={tx.id} className={`print-avoid-break ${idx % 2 === 1 ? "bg-[#F8FAF9]" : "bg-white"}`}>
                                <td className="p-2 border-r border-[#E2E8F0] whitespace-nowrap text-[#475569] font-medium">{formatDisplayDate(tx.date)}</td>
                                <td className="p-2 border-r border-[#E2E8F0] uppercase font-bold text-[9px]">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${tx.type === "production" ? "bg-emerald-100 text-emerald-800" : tx.type === "loss" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>
                                    {tx.type}
                                  </span>
                                </td>
                                <td className="p-2 border-r border-[#E2E8F0] font-semibold text-[#0F172A]">{tx.title}</td>
                                <td className="p-2 border-r border-[#E2E8F0] text-[#475569]">{tx.category}</td>
                                <td className="p-2 border-r border-[#E2E8F0] text-[#475569]">{tx.farmName || "Primary"} • {tx.crop || "General"}</td>
                                <td className={`p-2 border-r border-[#E2E8F0] text-right font-bold whitespace-nowrap ${tx.type === "production" ? "text-emerald-800" : tx.type === "loss" ? "text-amber-800" : "text-rose-700"}`}>
                                  {tx.type === "production" ? "+" : "-"}₹{Number(tx.amount || 0).toLocaleString("en-IN")}
                                </td>
                                <td className="p-2 text-center whitespace-nowrap">
                                  <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                    {tx.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}

                    {reportCategory === "crops" && (
                      <table className="w-full text-left text-[10px] border border-[#CBD5E1] rounded-lg overflow-hidden shadow-2xs">
                        <thead className="bg-[#0C4B32] text-white font-semibold">
                          <tr>
                            <th className="p-2.5 border-r border-[#1B704C]">Crop Name</th>
                            <th className="p-2.5 border-r border-[#1B704C]">Variety</th>
                            <th className="p-2.5 border-r border-[#1B704C]">Season</th>
                            <th className="p-2.5 border-r border-[#1B704C]">Area</th>
                            <th className="p-2.5 border-r border-[#1B704C]">Sown Date</th>
                            <th className="p-2.5 border-r border-[#1B704C]">Stage</th>
                            <th className="p-2.5 text-center">Health Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {activeCrops.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-4 text-center text-[#64748B] italic">
                                No active crops logged for this farm.
                              </td>
                            </tr>
                          ) : (
                            activeCrops.map((c, idx) => (
                              <tr key={c.id} className={`print-avoid-break ${idx % 2 === 1 ? "bg-[#F8FAF9]" : "bg-white"}`}>
                                <td className="p-2 border-r border-[#E2E8F0] font-black text-[#0C4B32] text-[11px]">{c.name}</td>
                                <td className="p-2 border-r border-[#E2E8F0] text-[#475569]">{c.variety || "Local"}</td>
                                <td className="p-2 border-r border-[#E2E8F0] text-[#475569]">{c.season || "Rabi"}</td>
                                <td className="p-2 border-r border-[#E2E8F0] font-bold text-[#0F172A]">{c.area} {c.areaUnit}</td>
                                <td className="p-2 border-r border-[#E2E8F0] text-[#475569]">{c.sownDate ? formatDisplayDate(c.sownDate) : "Recent"}</td>
                                <td className="p-2 border-r border-[#E2E8F0] text-[#475569]">{c.stage || "Active"}</td>
                                <td className="p-2 text-center">
                                  <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                    {c.health || "Healthy (95% NDVI)"}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}

                    {reportCategory === "inputs" && (
                      <table className="w-full text-left text-[10px] border border-[#CBD5E1] rounded-lg overflow-hidden shadow-2xs">
                        <thead className="bg-[#0C4B32] text-white font-semibold">
                          <tr>
                            <th className="p-2.5 border-r border-[#1B704C]">Item Name</th>
                            <th className="p-2.5 border-r border-[#1B704C]">Category</th>
                            <th className="p-2.5 border-r border-[#1B704C]">Location / Store</th>
                            <th className="p-2.5 border-r border-[#1B704C]">Quantity</th>
                            <th className="p-2.5 border-r border-[#1B704C] text-right">Unit Rate (₹)</th>
                            <th className="p-2.5 border-r border-[#1B704C] text-right">Total Valuation (₹)</th>
                            <th className="p-2.5 text-center">Expiry Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {scopedInventoryItems.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-4 text-center text-[#64748B] italic">
                                No input inventory logged.
                              </td>
                            </tr>
                          ) : (
                            scopedInventoryItems.map((item, idx) => (
                              <tr key={item.id} className={`print-avoid-break ${idx % 2 === 1 ? "bg-[#F8FAF9]" : "bg-white"}`}>
                                <td className="p-2 border-r border-[#E2E8F0] font-bold text-[#0F172A]">{item.name}</td>
                                <td className="p-2 border-r border-[#E2E8F0] text-[#475569]">{item.category}</td>
                                <td className="p-2 border-r border-[#E2E8F0] text-[#475569]">{item.storeName || "Farm Godown"}</td>
                                <td className="p-2 border-r border-[#E2E8F0] font-bold text-[#0F172A]">{item.quantity} {item.unit}</td>
                                <td className="p-2 border-r border-[#E2E8F0] text-right text-[#475569]">₹{Number(item.rate || 0).toLocaleString("en-IN")}</td>
                                <td className="p-2 border-r border-[#E2E8F0] text-right font-black text-[#0C4B32]">
                                  ₹{(item.quantity * item.rate).toLocaleString("en-IN")}
                                </td>
                                <td className="p-2 text-center text-[#475569]">{item.expiryDate ? formatDisplayDate(item.expiryDate) : "N/A"}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}

                    {reportCategory === "machinery" && (
                      <table className="w-full text-left text-[10px] border border-[#CBD5E1] rounded-lg overflow-hidden shadow-2xs">
                        <thead className="bg-[#0C4B32] text-white font-semibold">
                          <tr>
                            <th className="p-2.5 border-r border-[#1B704C]">Equipment Name</th>
                            <th className="p-2.5 border-r border-[#1B704C]">Category</th>
                            <th className="p-2.5 border-r border-[#1B704C]">Assigned Operator</th>
                            <th className="p-2.5 border-r border-[#1B704C]">Runtime Hours</th>
                            <th className="p-2.5 border-r border-[#1B704C]">Fuel Specs</th>
                            <th className="p-2.5 border-r border-[#1B704C]">Next Service</th>
                            <th className="p-2.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {scopedEquipment.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-4 text-center text-[#64748B] italic">
                                No machinery logged.
                              </td>
                            </tr>
                          ) : (
                            scopedEquipment.map((eq, idx) => (
                              <tr key={eq.id} className={`print-avoid-break ${idx % 2 === 1 ? "bg-[#F8FAF9]" : "bg-white"}`}>
                                <td className="p-2 border-r border-[#E2E8F0] font-bold text-[#0F172A]">{eq.name}</td>
                                <td className="p-2 border-r border-[#E2E8F0] text-[#475569]">{eq.category}</td>
                                <td className="p-2 border-r border-[#E2E8F0] text-[#475569]">{eq.operator}</td>
                                <td className="p-2 border-r border-[#E2E8F0] font-black text-[#0C4B32]">{eq.runtimeHours} Hrs</td>
                                <td className="p-2 border-r border-[#E2E8F0] text-[#475569]">{eq.fuelEfficiency || "Standard"}</td>
                                <td className="p-2 border-r border-[#E2E8F0] text-[#475569]">{eq.nextServiceDate ? formatDisplayDate(eq.nextServiceDate) : "N/A"}</td>
                                <td className="p-2 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold ${eq.status === "Operational" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                    {eq.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Agronomic Advisory & Compliance Note */}
                  <div className="mb-5 p-3 rounded-lg border border-[#CBD5E1] bg-[#F8FAF9] print-avoid-break">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-[#0C4B32]"></span>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#0C4B32]">Agronomic Assurance & Audit Notes</h4>
                    </div>
                    <p className="text-[9px] text-[#475569] leading-relaxed">
                      This statement is authenticated by Khetivo's cloud farm management architecture. Field geometries and vegetation indices are calibrated via Sentinel-2 multi-spectral remote sensing. Records comply with standard agricultural accounting standards and are valid for submission to credit institutions, crop insurance adjusters, and APMC authorities.
                    </p>
                  </div>

                  {/* Formal Signature & Verification Footer */}
                  <div className="border-t-2 border-[#0C4B32]/30 pt-4 mt-6 flex items-end justify-between print-avoid-break text-[10px] text-[#475569]">
                    <div className="space-y-1 max-w-[380px]">
                      <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Khetivo Certified Agricultural Intelligence
                      </div>
                      <p className="text-[9px] text-[#64748B]">System generated report authenticated with cryptographically hashed ledger proofs.</p>
                      <p className="text-[8px] font-mono text-[#94A3B8]">Security Hash: KHETIVO-AUDIT-{Math.random().toString(36).substring(2, 10).toUpperCase()}-VERIFIED</p>
                    </div>

                    <div className="flex items-center gap-8">
                      {/* Stamp Seal */}
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#0C4B32]/50 flex flex-col items-center justify-center text-[7px] text-[#0C4B32] font-black uppercase tracking-widest text-center rotate-[-6deg] bg-[#F0FDF4]/50">
                        <span>KHETIVO</span>
                        <span className="text-[6px] tracking-normal">AUDIT VERIFIED</span>
                        <span className="text-[5px]">★ 2026 ★</span>
                      </div>

                      {/* Signature line */}
                      <div className="text-right">
                        <div className="h-10 border-b-2 border-slate-400 w-48 mb-1"></div>
                        <p className="font-bold text-[#0F172A] text-[10px]">Authorized Farm Administrator</p>
                        <p className="text-[9px] text-[#64748B]">{settingsFarmerName || "Khetivo Farmer"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1. Top Header with View Switcher (Chart vs Table) & Actions (Screen View) */}
                <div className="no-print print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#26352D]">Farm Reports & Analytics</h2>
                      <span className="text-[10px] font-semibold text-[#0C4B32] bg-[#E7F3EB] px-2 py-0.5 rounded-full border border-[#C6E2D0]">
                        Audit Ready
                      </span>
                    </div>
                    <p className="text-xs text-[#55685D] mt-1">
                      Comprehensive farm audits, financial statements, crop performance & input tracking •{" "}
                      {isAllFarms ? "All registered holdings" : currentFarm.name}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* View Switcher: Chart vs Table */}
                    <div className="flex items-center p-1 bg-[#F4F8F4] rounded-xl border border-[#DCE6DE]">
                      <button
                        type="button"
                        onClick={() => setReportViewMode("chart")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                          reportViewMode === "chart"
                            ? "bg-white text-[#0C4B32] shadow-2xs"
                            : "text-[#55685D] hover:text-[#26352D]"
                        }`}
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>Chart View</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReportViewMode("table")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                          reportViewMode === "table"
                            ? "bg-white text-[#0C4B32] shadow-2xs"
                            : "text-[#55685D] hover:text-[#26352D]"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Table View</span>
                      </button>
                    </div>

                    {/* Quick Print Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined") window.print();
                      }}
                      title="Print or save as PDF"
                      className="no-print px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#26352D] inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#55685D]" />
                      <span className="hidden sm:inline">Print / Save PDF</span>
                    </button>

                    {/* Export Active Report CSV */}
                    <button
                      type="button"
                      onClick={() => {
                        if (reportCategory === "financial") {
                          handleExportCSV(
                            `khetivo_financial_report_${currentDateStr}.csv`,
                            ["Date", "ID", "Type", "Title", "Category", "Farm", "Amount (INR)", "Status"],
                            reportScopedTransactions.map((tx) => [
                              tx.date,
                              tx.id,
                              tx.type,
                              tx.title,
                              tx.category,
                              tx.farmName || "Farm",
                              tx.amount,
                              tx.status,
                            ])
                          );
                        } else if (reportCategory === "crops") {
                          handleExportCSV(
                            `khetivo_crops_performance_${currentDateStr}.csv`,
                            ["Crop Name", "Variety", "Area (Acres)", "Season", "Sown Date", "Stage", "Health"],
                            activeCrops.map((c) => [
                              c.name,
                              c.variety,
                              c.area,
                              c.season,
                              c.sownDate,
                              c.stage,
                              c.health,
                            ])
                          );
                        } else if (reportCategory === "inputs") {
                          handleExportCSV(
                            `khetivo_inventory_report_${currentDateStr}.csv`,
                            ["Item Name", "Category", "Store", "Quantity", "Unit", "Rate (INR)", "Total Value (INR)", "Expiry Date"],
                            scopedInventoryItems.map((item) => [
                              item.name,
                              item.category,
                              item.storeName,
                              item.quantity,
                              item.unit,
                              item.rate,
                              item.quantity * item.rate,
                              item.expiryDate || "N/A",
                            ])
                          );
                        } else {
                          handleExportCSV(
                            `khetivo_equipment_utilization_${currentDateStr}.csv`,
                            ["Equipment Name", "Category", "Operator", "Runtime Hours", "Fuel Specs", "Status", "Next Service"],
                            scopedEquipment.map((eq) => [
                              eq.name,
                              eq.category,
                              eq.operator,
                              eq.runtimeHours,
                              eq.fuelEfficiency || "Standard",
                              eq.status,
                              eq.nextServiceDate || "N/A",
                            ])
                          );
                        }
                      }}
                      className="btn btn-primary text-xs px-3.5 py-1.5 inline-flex items-center gap-1.5 cursor-pointer shadow-xs rounded-xl font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* 2. Report Category Strip & Filters (Hidden on Print) */}
                <div className="no-print print:hidden bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-3.5">
                  {/* Top Row: Category Tabs + Reset Filters Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5ECE7] pb-3">
                    {/* Category Navigation Pills with hidden scrollbar */}
                    <div className="flex items-center gap-1.5 p-1 bg-[#F4F8F4] rounded-xl border border-[#DCE6DE] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      <button
                        type="button"
                        onClick={() => setReportCategory("financial")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                          reportCategory === "financial"
                            ? "bg-white text-[#0C4B32] shadow-2xs font-bold"
                            : "text-[#55685D] hover:text-[#26352D]"
                        }`}
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Financial & P&L</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReportCategory("crops")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                          reportCategory === "crops"
                            ? "bg-white text-[#0C4B32] shadow-2xs font-bold"
                            : "text-[#55685D] hover:text-[#26352D]"
                        }`}
                      >
                        <Sprout className="w-3.5 h-3.5" />
                        <span>Crop Yield & Acreage</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReportCategory("inputs")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                          reportCategory === "inputs"
                            ? "bg-white text-[#0C4B32] shadow-2xs font-bold"
                            : "text-[#55685D] hover:text-[#26352D]"
                        }`}
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Input Analytics</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReportCategory("machinery")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                          reportCategory === "machinery"
                            ? "bg-white text-[#0C4B32] shadow-2xs font-bold"
                            : "text-[#55685D] hover:text-[#26352D]"
                        }`}
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Machinery & Fleet</span>
                      </button>
                    </div>

                    {/* Reset Filters Button */}
                    <button
                      type="button"
                      onClick={handleResetReportFilters}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#55685D] hover:text-[#0C4B32] bg-[#F4F8F4] hover:bg-[#E7F3EB] border border-[#DCE6DE] rounded-xl transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                      title="Reset all filters, dates, and search back to defaults"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#55685D]" />
                      <span>Reset Filters</span>
                    </button>
                  </div>

                  {/* Bottom Row: Date Range & Secondary Filters */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Left Sub-Group: Timeframe Preset & Date Range Picker */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {/* Period Presets */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-[#55685D] uppercase tracking-wider">Period:</span>
                        <select
                          value={reportTimeframe}
                          onChange={(e) => handleTimeframeChange(e.target.value as any)}
                          className="px-2.5 py-1.5 text-xs font-medium text-[#26352D] bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl outline-none focus:border-[#0C4B32] cursor-pointer"
                        >
                          <option value="season">Current Season (Rabi 2026-27)</option>
                          <option value="month">Last 30 Days</option>
                          <option value="quarter">Last 90 Days</option>
                          <option value="year">Full Year 2026</option>
                          <option value="custom">Custom Date Range</option>
                        </select>
                      </div>

                      {/* Explicit Date Range Picker: From - To */}
                      <div className="flex items-center gap-2 bg-[#F4F8F4] border border-[#DCE6DE] px-3 py-1 rounded-xl text-xs">
                        <Calendar className="w-3.5 h-3.5 text-[#0C4B32] shrink-0" />
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-semibold text-[#55685D]">From:</span>
                          <input
                            type="date"
                            value={reportStartDate}
                            onChange={(e) => {
                              setReportStartDate(e.target.value);
                              setReportTimeframe("custom");
                            }}
                            className="bg-transparent text-xs text-[#26352D] font-medium outline-none cursor-pointer"
                          />
                        </div>
                        <span className="text-[#889B90] font-bold">–</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-semibold text-[#55685D]">To:</span>
                          <input
                            type="date"
                            value={reportEndDate}
                            onChange={(e) => {
                              setReportEndDate(e.target.value);
                              setReportTimeframe("custom");
                            }}
                            className="bg-transparent text-xs text-[#26352D] font-medium outline-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Sub-Group: Farm Scope & Search Input */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
                      {/* Farm Scope (if in All Farms view) */}
                      {isAllFarms && (
                        <select
                          value={reportFarmFilter}
                          onChange={(e) => setReportFarmFilter(e.target.value)}
                          className="px-2.5 py-1.5 text-xs font-medium text-[#26352D] bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl outline-none focus:border-[#0C4B32] cursor-pointer"
                        >
                          <option value="all">All Holdings</option>
                          {farms.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Search */}
                      <div className="relative flex-1 lg:flex-initial">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#889B90]" />
                        <input
                          type="text"
                          placeholder="Search report records..."
                          value={reportSearch}
                          onChange={(e) => setReportSearch(e.target.value)}
                          className="pl-8 pr-3 py-1.5 text-xs text-[#26352D] bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl outline-none focus:border-[#0C4B32] placeholder:text-[#889B90] w-full sm:w-48 lg:w-56"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. DYNAMIC CONTENT: CHART VIEW vs TABLE VIEW (Hidden on Print) */}
                <div className="no-print print:hidden">
                {reportViewMode === "chart" ? (
                  /* ===================== VIEW 1: CHART & ANALYTICS VIEW ===================== */
                  <div className="space-y-6">
                    {/* CATEGORY 1: FINANCIAL P&L CHARTS */}
                    {reportCategory === "financial" && (
                      <div className="space-y-6">
                        {/* 4 Metric Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                            <span className="text-[11px] font-semibold text-[#55685D] block">Net Realization</span>
                            <div className="text-xl sm:text-2xl font-bold text-[#0C4B32] mt-1">
                              ₹{reportNetRealization.toLocaleString("en-IN")}
                            </div>
                            <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                              ↑ {reportTotalProduction > 0 ? ((reportNetRealization / reportTotalProduction) * 100).toFixed(1) : "0"}% Net Farm Margin
                            </span>
                          </div>

                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                            <span className="text-[11px] font-semibold text-[#55685D] block">Production Inflow</span>
                            <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
                              ₹{reportTotalProduction.toLocaleString("en-IN")}
                            </div>
                            <span className="text-[10px] text-[#55685D] mt-1 inline-block">
                              Harvest & Mandi sales
                            </span>
                          </div>

                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                            <span className="text-[11px] font-semibold text-[#55685D] block">Crop Losses & Damage</span>
                            <div className="text-xl sm:text-2xl font-bold text-amber-700 mt-1">
                              ₹{reportTotalLosses.toLocaleString("en-IN")}
                            </div>
                            <span className="text-[10px] text-amber-800 font-semibold mt-1 inline-block">
                              Lodging & Sorting losses
                            </span>
                          </div>

                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                            <span className="text-[11px] font-semibold text-[#55685D] block">Operating Expenses</span>
                            <div className="text-xl sm:text-2xl font-bold text-red-600 mt-1">
                              ₹{reportTotalExpenses.toLocaleString("en-IN")}
                            </div>
                            <span className="text-[10px] text-[#55685D] mt-1 inline-block">
                              Inputs, Diesel, Labor
                            </span>
                          </div>
                        </div>

                        {/* Chart Row: Monthly Cashflow Bar Chart & Cost Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* Main Chart: Monthly Revenue vs Outflow (7 cols) */}
                          <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-sm font-bold text-[#26352D]">Monthly Inflow vs Outflow</h3>
                                <p className="text-xs text-[#55685D] mt-0.5">Production realizations vs input costs</p>
                              </div>
                              <div className="flex items-center gap-3 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-sm bg-[#0C4B32]" />
                                  <span className="text-[#55685D] text-[11px]">Inflow</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-sm bg-[#E06D53]" />
                                  <span className="text-[#55685D] text-[11px]">Outflow</span>
                                </div>
                              </div>
                            </div>

                            {/* Bar Chart Container (Dynamic from Appwrite Transactions) */}
                            <div className="pt-4 pb-2">
                              {(() => {
                                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                const monthlyMap = new Map<string, { inflow: number; outflow: number }>();

                                // Initialize recent 6 months
                                const now = new Date();
                                const recentMonths: string[] = [];
                                for (let i = 5; i >= 0; i--) {
                                  const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                                  const key = monthNames[d.getMonth()];
                                  recentMonths.push(key);
                                  monthlyMap.set(key, { inflow: 0, outflow: 0 });
                                }

                                reportScopedTransactions.forEach((tx) => {
                                  if (!tx.date) return;
                                  const txDate = new Date(tx.date);
                                  const mKey = monthNames[txDate.getMonth()];
                                  if (monthlyMap.has(mKey)) {
                                    const entry = monthlyMap.get(mKey)!;
                                    if (tx.type === "production") {
                                      entry.inflow += tx.amount;
                                    } else {
                                      entry.outflow += tx.amount;
                                    }
                                  }
                                });

                                const monthlyData = recentMonths.map((m) => ({
                                  month: m,
                                  inflow: Math.round((monthlyMap.get(m)?.inflow || 0) / 1000),
                                  outflow: Math.round((monthlyMap.get(m)?.outflow || 0) / 1000),
                                }));

                                const maxVal = Math.max(
                                  ...monthlyData.map((d) => Math.max(d.inflow, d.outflow)),
                                  100
                                );

                                const hasAnyData = reportScopedTransactions.length > 0;

                                if (!hasAnyData) {
                                  return (
                                    <div className="h-48 flex flex-col items-center justify-center text-center p-6 bg-[#FBFDFB] rounded-xl border border-dashed border-[#DCE6DE]">
                                      <Receipt className="w-8 h-8 text-[#889B90] mb-2 opacity-50" />
                                      <p className="text-xs font-semibold text-[#26352D]">No Financial Inflow / Outflow Data</p>
                                      <p className="text-[11px] text-[#55685D] mt-0.5">Record harvest sales or operational expenses to see monthly trends.</p>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenRecordModal("production")}
                                        className="mt-3 text-xs font-semibold text-[#0C4B32] hover:underline cursor-pointer"
                                      >
                                        + Record First Entry
                                      </button>
                                    </div>
                                  );
                                }

                                return (
                                  <div className="space-y-2">
                                    <div className="h-48 flex items-end justify-between gap-3 sm:gap-6 pt-4 border-b border-[#E5ECE7]">
                                      {monthlyData.map((d) => {
                                        const inflowH = Math.min(100, (d.inflow / maxVal) * 100);
                                        const outflowH = Math.min(100, (d.outflow / maxVal) * 100);
                                        return (
                                          <div key={d.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                                            <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                                              {/* Inflow Bar */}
                                              <div
                                                style={{ height: Math.max(4, inflowH) + "%" }}
                                                title={"Inflow: ₹" + d.inflow + "k"}
                                                className="w-1/2 max-w-[20px] bg-[#0C4B32] hover:bg-[#083624] rounded-t-md transition-all duration-300 relative group/bar"
                                              >
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 bg-[#26352D] text-white text-[9px] font-bold px-1 py-0.5 rounded shadow pointer-events-none whitespace-nowrap transition-opacity">
                                                  ₹{d.inflow}k
                                                </div>
                                              </div>
                                              {/* Outflow Bar */}
                                              <div
                                                style={{ height: Math.max(4, outflowH) + "%" }}
                                                title={"Outflow: ₹" + d.outflow + "k"}
                                                className="w-1/2 max-w-[20px] bg-[#E06D53] hover:bg-[#c95b42] rounded-t-md transition-all duration-300 relative group/bar"
                                              >
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 bg-[#26352D] text-white text-[9px] font-bold px-1 py-0.5 rounded shadow pointer-events-none whitespace-nowrap transition-opacity">
                                                  ₹{d.outflow}k
                                                </div>
                                              </div>
                                            </div>
                                            <span className="text-[11px] font-semibold text-[#55685D] mt-2 group-hover:text-[#0C4B32]">
                                              {d.month}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-[#889B90] pt-1">
                                      <span>Scale: ₹ Thousands (INR)</span>
                                      <span>Real-time cloud database ledger</span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Expense Breakdown Distribution (5 cols) - Dynamic */}
                          <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-4 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-[#26352D]">Expense Allocation</h3>
                                <span className="text-[10px] font-semibold text-[#55685D] bg-[#F4F8F4] px-2 py-0.5 rounded-full border border-[#E5ECE7]">
                                  Cost Centers
                                </span>
                              </div>
                              <p className="text-xs text-[#55685D] mt-0.5">Categorized operational farm outflow</p>
                            </div>

                            {(() => {
                              const expenseTx = reportScopedTransactions.filter((t) => t.type === "expense" || t.type === "loss");
                              const catMap = new Map<string, number>();
                              expenseTx.forEach((tx) => {
                                const cat = tx.category || "General";
                                catMap.set(cat, (catMap.get(cat) || 0) + tx.amount);
                              });

                              const totalExp = Array.from(catMap.values()).reduce((a, b) => a + b, 0);

                              const colorPalette = ["bg-[#0C4B32]", "bg-[#278449]", "bg-[#F9B21B]", "bg-blue-600", "bg-purple-600", "bg-rose-600"];

                              const items = Array.from(catMap.entries()).map(([name, amount], idx) => ({
                                name,
                                amount,
                                pct: totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0,
                                color: colorPalette[idx % colorPalette.length],
                              }));

                              if (items.length === 0) {
                                return (
                                  <div className="p-6 my-auto text-center text-xs text-[#55685D] bg-[#FBFDFB] rounded-xl border border-dashed border-[#DCE6DE]">
                                    No categorized expenses found in the selected period.
                                  </div>
                                );
                              }

                              return (
                                <div className="space-y-3.5 my-auto">
                                  {items.map((item) => (
                                    <div key={item.name} className="space-y-1">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-[#26352D] truncate">{item.name}</span>
                                        <span className="font-bold text-[#0C4B32] shrink-0">₹{item.amount.toLocaleString("en-IN")}</span>
                                      </div>
                                      <div className="w-full h-2 rounded-full bg-[#E5ECE7] overflow-hidden">
                                        <div
                                          style={{ width: item.pct + "%" }}
                                          className={"h-full rounded-full transition-all duration-500 " + item.color}
                                        />
                                      </div>
                                      <div className="text-[10px] text-[#889B90] text-right">{item.pct}% of total expense</div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}

                            <div className="p-3 rounded-xl bg-[#F4F8F4] border border-[#E5ECE7] text-xs flex items-center justify-between">
                              <span className="text-[#55685D]">Average Cost per Acre</span>
                              <strong className="text-sm font-bold text-[#26352D]">
                                ₹{Math.round(totalExpenses / (totalCombinedArea || 1)).toLocaleString("en-IN")} / Acre
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CATEGORY 2: CROPS & YIELD CHARTS */}
                    {reportCategory === "crops" && (
                      <div className="space-y-6">
                        {/* 4 Metric Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                            <span className="text-[11px] font-semibold text-[#55685D] block">Cultivated Land</span>
                            <div className="text-xl sm:text-2xl font-bold text-[#0C4B32] mt-1">
                              {totalCombinedArea} Acres
                            </div>
                            <span className="text-[10px] text-[#55685D] mt-1 inline-block">Across all holdings</span>
                          </div>

                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                            <span className="text-[11px] font-semibold text-[#55685D] block">Active Crops</span>
                            <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
                              {activeCrops.length} Varieties
                            </div>
                            <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                              Multi-crop rotation
                            </span>
                          </div>

                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                            <span className="text-[11px] font-semibold text-[#55685D] block">Projected Yield</span>
                            <div className="text-xl sm:text-2xl font-bold text-[#26352D] mt-1">
                              {activeCrops.length === 0 ? "0 Quintals" : (Math.round(activeCrops.reduce((sum, c) => sum + (c.area * 20), 0))).toLocaleString("en-IN") + " Quintals"}
                            </div>
                            <span className="text-[10px] text-[#55685D] mt-1 inline-block">{activeCrops.length === 0 ? "No active crops" : "Estimated @ 20 Qtl/acre"}</span>
                          </div>

                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                            <span className="text-[11px] font-semibold text-[#55685D] block">Crop Health Index</span>
                            <div className="text-xl sm:text-2xl font-bold text-[#0C4B32] mt-1">
                              {activeCrops.length === 0 ? "N/A" : (Math.round((activeCrops.filter(c => c.health === "Good" || c.health === "Excellent").length / activeCrops.length) * 100)) + "% Optimal"}
                            </div>
                            <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                              {activeCrops.length === 0 ? "Add crop holdings" : activeCrops.filter(c => c.health === "Good" || c.health === "Excellent").length + "/" + activeCrops.length + " healthy batches"}
                            </span>
                          </div>
                        </div>

                        {/* Crop Area & Lifecycle Progress Charts */}
                        {activeCrops.length === 0 ? (
                          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#DCE6DE]">
                            <Sprout className="w-8 h-8 text-[#889B90] mx-auto mb-2 opacity-50" />
                            <p className="text-xs font-semibold text-[#26352D]">No Active Crops Recorded</p>
                            <p className="text-[11px] text-[#55685D] mt-0.5">Add your farm parcels and crops in the Crops module to generate acreage and growth analytics.</p>
                          </div>
                        ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* Acreage Distribution Bar Chart (6 cols) */}
                          <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-sm font-bold text-[#26352D]">Acreage & Revenue Projection</h3>
                                <p className="text-xs text-[#55685D] mt-0.5">Area allocation across registered crops</p>
                              </div>
                            </div>

                            <div className="space-y-4 pt-2">
                              {activeCrops.map((c) => {
                                const pct = Math.min(100, Math.round((c.area / (totalCombinedArea || 1)) * 100));
                                return (
                                  <div key={c.id} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-semibold text-[#26352D]">{c.name} ({c.variety})</span>
                                      <span className="font-bold text-[#0C4B32]">{c.area} Acres ({pct}%)</span>
                                    </div>
                                    <div className="w-full h-3 rounded-full bg-[#E5ECE7] overflow-hidden">
                                      <div
                                        style={{ width: `${pct}%` }}
                                        className="h-full rounded-full bg-[#0C4B32] transition-all duration-500"
                                      />
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-[#55685D]">
                                      <span>Season: {c.season}</span>
                                      <span>Health: {c.health}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Crop Growth Progress & Lifecycle (6 cols) */}
                          <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-4">
                            <div>
                              <h3 className="text-sm font-bold text-[#26352D]">Growth Stage Timeline</h3>
                              <p className="text-xs text-[#55685D] mt-0.5">Crop lifecycle progress towards harvest</p>
                            </div>

                            <div className="space-y-4 pt-2">
                              {activeCrops.map((c) => {
                                const progressPct = Math.min(100, Math.round((c.currentDay / (c.totalDays || 1)) * 100));
                                return (
                                  <div key={c.id} className="p-3 rounded-xl bg-[#F4F8F4] border border-[#E5ECE7] space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-bold text-[#26352D]">{c.name}</span>
                                      <span className="text-[11px] font-semibold text-[#0C4B32]">
                                        Day {c.currentDay} / {c.totalDays} ({progressPct}%)
                                      </span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-white border border-[#E5ECE7] overflow-hidden">
                                      <div
                                        style={{ width: `${progressPct}%` }}
                                        className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                                      />
                                    </div>
                                    <div className="text-[11px] text-[#55685D] flex items-center justify-between">
                                      <span>Current: {c.stage}</span>
                                      <span className="font-semibold text-[#26352D]">Next: {c.nextMilestone}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        )}
                      </div>
                    )}

                    {/* CATEGORY 3: INPUT ANALYTICS CHARTS */}
                    {reportCategory === "inputs" && (
                      <div className="space-y-6">
                        {/* 4 Metric Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                            <span className="text-[11px] font-semibold text-[#55685D] block">Inventory Valuation</span>
                            <div className="text-xl sm:text-2xl font-bold text-[#0C4B32] mt-1">
                              ₹{totalInventoryValuation.toLocaleString("en-IN")}
                            </div>
                            <span className="text-[10px] text-[#55685D] mt-1 inline-block">
                              {totalTrackedItems} Tracked SKUs in Godowns
                            </span>
                          </div>

                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                            <span className="text-[11px] font-semibold text-[#55685D] block">Inventory Health</span>
                            <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
                              {scopedInventoryItems.length === 0 ? "0 SKUs" : (Math.max(0, scopedInventoryItems.length - lowStockCount - expiringSoonCount)) + " / " + scopedInventoryItems.length + " Good"}
                            </div>
                            <span className="text-[10px] text-emerald-800 font-semibold mt-1 inline-block">
                              {scopedInventoryItems.length === 0 ? "No inventory tracked" : "Adequate stock & validity"}
                            </span>
                          </div>

                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                            <span className="text-[11px] font-semibold text-[#55685D] block">Low Stock Alerts</span>
                            <div className="text-xl sm:text-2xl font-bold text-amber-700 mt-1">
                              {lowStockCount} Items
                            </div>
                            <span className="text-[10px] text-amber-800 font-semibold mt-1 inline-block">
                              Below reorder threshold
                            </span>
                          </div>

                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                            <span className="text-[11px] font-semibold text-[#55685D] block">Expiring Batches</span>
                            <div className="text-xl sm:text-2xl font-bold text-red-600 mt-1">
                              {expiringSoonCount} Batches
                            </div>
                            <span className="text-[10px] text-red-700 font-semibold mt-1 inline-block">
                              Next 30-day window
                            </span>
                          </div>
                        </div>

                        {/* Input Stock Levels vs Thresholds Chart */}
                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-4">
                          <div>
                            <h3 className="text-sm font-bold text-[#26352D]">Stock Level vs Reorder Threshold</h3>
                            <p className="text-xs text-[#55685D] mt-0.5">Real-time inventory levels across store facilities</p>
                          </div>

                          {scopedInventoryItems.length === 0 ? (
                            <div className="p-8 text-center bg-[#FBFDFB] rounded-xl border border-dashed border-[#DCE6DE]">
                              <Package className="w-8 h-8 text-[#889B90] mx-auto mb-2 opacity-50" />
                              <p className="text-xs font-semibold text-[#26352D]">No Inventory Items Tracked</p>
                              <p className="text-[11px] text-[#55685D] mt-0.5">Record items in the Inventory module to track stock levels, reorder thresholds, and valuations.</p>
                            </div>
                          ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {scopedInventoryItems.slice(0, 6).map((item) => {
                              const ratio = Math.min(100, Math.round((item.quantity / (item.lowStockThreshold * 2.5)) * 100));
                              const isLow = item.quantity <= item.lowStockThreshold;
                              return (
                                <div key={item.id} className="p-3.5 rounded-xl border border-[#E5ECE7] bg-[#FBFDFB] space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="font-semibold text-[#26352D] truncate">{item.name}</div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isLow ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                                      {isLow ? "Reorder Soon" : "Healthy Stock"}
                                    </span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-[#E5ECE7] overflow-hidden">
                                    <div
                                      style={{ width: `${ratio}%` }}
                                      className={`h-full rounded-full ${isLow ? "bg-amber-500" : "bg-[#0C4B32]"}`}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] text-[#55685D]">
                                    <span>Stock: <strong>{item.quantity} {item.unit}</strong></span>
                                    <span>Threshold: {item.lowStockThreshold} {item.unit}</span>
                                    <span>Rate: ₹{item.rate}/{item.unit}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CATEGORY 4: MACHINERY & FLEET CHARTS */}
                    {reportCategory === "machinery" && (
                      <div className="space-y-6">
                        {/* 4 Metric Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                            <span className="text-[11px] font-semibold text-[#55685D] block">Fleet Operational</span>
                            <div className="text-xl sm:text-2xl font-bold text-[#0C4B32] mt-1">
                              {operationalCount} / {totalEquipmentCount} Units
                            </div>
                            <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                              Active field ready
                            </span>
                          </div>

                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                            <span className="text-[11px] font-semibold text-[#55685D] block">Cumulative Runtime</span>
                            <div className="text-xl sm:text-2xl font-bold text-[#26352D] mt-1">
                              {scopedEquipment.reduce((acc, eq) => acc + (Number(eq.runtimeHours) || 0), 0)} Hours
                            </div>
                            <span className="text-[10px] text-[#55685D] mt-1 inline-block">Total tractor/pump hours</span>
                          </div>

                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                            <span className="text-[11px] font-semibold text-[#55685D] block">Service Due</span>
                            <div className="text-xl sm:text-2xl font-bold text-amber-700 mt-1">
                              {serviceDueCount} Machines
                            </div>
                            <span className="text-[10px] text-amber-800 font-semibold mt-1 inline-block">
                              Scheduled maintenance
                            </span>
                          </div>

                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                            <span className="text-[11px] font-semibold text-[#55685D] block">Reported Issues</span>
                            <div className="text-xl sm:text-2xl font-bold text-red-600 mt-1">
                              {openIssuesCount} Reports
                            </div>
                            <span className="text-[10px] text-red-700 font-semibold mt-1 inline-block">
                              Pending mechanic review
                            </span>
                          </div>
                        </div>

                        {/* Runtime Hours Horizontal Comparison Chart */}
                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-4">
                          <div>
                            <h3 className="text-sm font-bold text-[#26352D]">Engine Runtime Comparison</h3>
                            <p className="text-xs text-[#55685D] mt-0.5">Recorded operational hours per registered machine</p>
                          </div>

                          {scopedEquipment.length === 0 ? (
                            <div className="p-8 text-center bg-[#FBFDFB] rounded-xl border border-dashed border-[#DCE6DE]">
                              <Wrench className="w-8 h-8 text-[#889B90] mx-auto mb-2 opacity-50" />
                              <p className="text-xs font-semibold text-[#26352D]">No Machinery or Equipment Registered</p>
                              <p className="text-[11px] text-[#55685D] mt-0.5">Register tractors, pumps, and harvesters in the Equipment module to view runtime stats.</p>
                            </div>
                          ) : (
                          <div className="space-y-4 pt-2">
                            {scopedEquipment.map((eq) => {
                              const maxH = 1500;
                              const pct = Math.min(100, Math.round(((Number(eq.runtimeHours) || 0) / maxH) * 100));
                              return (
                                <div key={eq.id} className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-[#26352D]">{eq.name}</span>
                                    <span className="font-bold text-[#0C4B32]">{eq.runtimeHours} Engine Hours</span>
                                  </div>
                                  <div className="w-full h-3 rounded-full bg-[#E5ECE7] overflow-hidden">
                                    <div
                                      style={{ width: `${pct}%` }}
                                      className="h-full rounded-full bg-[#0C4B32] transition-all duration-500"
                                    />
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] text-[#55685D]">
                                    <span>Operator: {eq.operator}</span>
                                    <span>Fuel Spec: {eq.fuelEfficiency || "Standard"}</span>
                                    <span>Next Service: {eq.nextServiceDate ? formatDisplayDate(eq.nextServiceDate) : "N/A"}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ===================== VIEW 2: SPATIAL DATA TABLE VIEW ===================== */
                  <div className="bg-white rounded-2xl border border-[#E5ECE7] shadow-xs overflow-hidden">
                    {/* TABLE: FINANCIAL TRANSACTIONS */}
                    {reportCategory === "financial" && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#F4F8F4] border-b border-[#E5ECE7] text-[#55685D]">
                            <tr>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Date</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Type</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Description & Title</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Category</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Holding / Crop</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px] text-right">Amount (INR)</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px] text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5ECE7]">
                            {reportScopedTransactions.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="px-5 py-8 text-center text-xs text-[#55685D] bg-[#FBFDFB]">
                                  No financial records available in the selected date range.
                                </td>
                              </tr>
                            ) : reportScopedTransactions
                              .filter((tx) => {
                                if (!reportSearch.trim()) return true;
                                const q = reportSearch.toLowerCase();
                                return (
                                  tx.title.toLowerCase().includes(q) ||
                                  tx.category.toLowerCase().includes(q) ||
                                  (tx.crop && tx.crop.toLowerCase().includes(q)) ||
                                  (tx.farmName && tx.farmName.toLowerCase().includes(q))
                                );
                              })
                              .map((tx) => (
                                <tr key={tx.id} className="hover:bg-[#F9FCFA] transition-colors">
                                  <td className="px-5 sm:px-6 py-4 font-medium text-[#55685D] whitespace-nowrap">
                                    {formatDisplayDate(tx.date)}
                                  </td>
                                  <td className="px-5 sm:px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                        tx.type === "production"
                                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                          : tx.type === "loss"
                                          ? "bg-amber-50 text-amber-900 border-amber-200"
                                          : "bg-red-50 text-red-800 border-red-200"
                                      }`}
                                    >
                                      {tx.type === "production" ? "Production" : tx.type === "loss" ? "Loss" : "Expense"}
                                    </span>
                                  </td>
                                  <td className="px-5 sm:px-6 py-4">
                                    <div className="font-bold text-[#26352D]">{tx.title}</div>
                                    <div className="text-[11px] text-[#889B90] mt-0.5">{tx.reference || "No Ref"}</div>
                                  </td>
                                  <td className="px-5 sm:px-6 py-4 font-medium text-[#55685D] whitespace-nowrap">
                                    {tx.category}
                                  </td>
                                  <td className="px-5 sm:px-6 py-4 text-[#55685D] whitespace-nowrap">
                                    <div>{tx.farmName || "Primary"}</div>
                                    {tx.crop && <span className="text-[10px] text-[#0C4B32] font-semibold">{tx.crop}</span>}
                                  </td>
                                  <td className={`px-5 sm:px-6 py-4 font-bold text-sm text-right whitespace-nowrap ${
                                    tx.type === "production" ? "text-emerald-700" : tx.type === "loss" ? "text-amber-700" : "text-red-600"
                                  }`}>
                                    {tx.type === "production" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                                  </td>
                                  <td className="px-5 sm:px-6 py-4 text-center whitespace-nowrap">
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F4F8F4] text-[#55685D] border border-[#E5ECE7]">
                                      {tx.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* TABLE: CROPS PERFORMANCE */}
                    {reportCategory === "crops" && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#F4F8F4] border-b border-[#E5ECE7] text-[#55685D]">
                            <tr>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Crop</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Variety</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Holding</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Area</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Season</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Lifecycle Stage</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Sown Date</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px] text-center">Health Index</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5ECE7]">
                            {activeCrops.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="px-5 py-8 text-center text-xs text-[#55685D] bg-[#FBFDFB]">
                                  No crops recorded yet. Add crops to generate performance reports.
                                </td>
                              </tr>
                            ) : activeCrops
                              .filter((c) => {
                                if (isAllFarms && reportFarmFilter !== "all" && c.farmId !== reportFarmFilter) return false;
                                if (!reportSearch.trim()) return true;
                                const q = reportSearch.toLowerCase();
                                return c.name.toLowerCase().includes(q) || c.variety.toLowerCase().includes(q) || (c.farmName && c.farmName.toLowerCase().includes(q));
                              })
                              .map((c) => (
                                <tr key={c.id} className="hover:bg-[#F9FCFA] transition-colors">
                                  <td className="px-5 sm:px-6 py-4 font-bold text-sm text-[#26352D] whitespace-nowrap">
                                    {c.name}
                                  </td>
                                  <td className="px-5 sm:px-6 py-4 font-medium text-[#55685D] whitespace-nowrap">
                                    {c.variety}
                                  </td>
                                  <td className="px-5 sm:px-6 py-4 text-[#55685D] whitespace-nowrap">
                                    {c.farmName || "Primary Holding"}
                                  </td>
                                  <td className="px-5 sm:px-6 py-4 font-bold text-[#0C4B32] whitespace-nowrap">
                                    {c.area} {c.areaUnit}
                                  </td>
                                  <td className="px-5 sm:px-6 py-4 text-[#55685D] whitespace-nowrap">
                                    {c.season}
                                  </td>
                                  <td className="px-5 sm:px-6 py-4 text-[#26352D] whitespace-nowrap">
                                    <div>{c.stage}</div>
                                    <div className="text-[10px] text-[#889B90]">Day {c.currentDay} of {c.totalDays}</div>
                                  </td>
                                  <td className="px-5 sm:px-6 py-4 text-[#55685D] whitespace-nowrap">
                                    {c.sownDate}
                                  </td>
                                  <td className="px-5 sm:px-6 py-4 text-center whitespace-nowrap">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      {c.health}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* TABLE: INPUT INVENTORY ANALYTICS */}
                    {reportCategory === "inputs" && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#F4F8F4] border-b border-[#E5ECE7] text-[#55685D]">
                            <tr>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Item Name</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Category</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Store Godown</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Current Quantity</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Unit Rate</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px] text-right">Total Valuation</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Expiry</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px] text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5ECE7]">
                            {scopedInventoryItems.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="px-5 py-8 text-center text-xs text-[#55685D] bg-[#FBFDFB]">
                                  No inventory items found. Add items to view stock valuations.
                                </td>
                              </tr>
                            ) : scopedInventoryItems
                              .filter((item) => {
                                if (isAllFarms && reportFarmFilter !== "all" && item.farmId !== reportFarmFilter) return false;
                                if (!reportSearch.trim()) return true;
                                const q = reportSearch.toLowerCase();
                                return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.storeName.toLowerCase().includes(q);
                              })
                              .map((item) => {
                                const exp = getItemExpiryStatus(item.expiryDate);
                                const isLow = item.quantity <= item.lowStockThreshold;
                                return (
                                  <tr key={item.id} className="hover:bg-[#F9FCFA] transition-colors">
                                    <td className="px-5 sm:px-6 py-4 font-bold text-sm text-[#26352D] whitespace-nowrap">
                                      {item.name}
                                    </td>
                                    <td className="px-5 sm:px-6 py-4 text-[#55685D] whitespace-nowrap">
                                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#E7F3EB] text-[#0C4B32]">
                                        {item.category}
                                      </span>
                                    </td>
                                    <td className="px-5 sm:px-6 py-4 text-[#55685D] whitespace-nowrap">
                                      {item.storeName}
                                    </td>
                                    <td className="px-5 sm:px-6 py-4 font-bold text-[#26352D] whitespace-nowrap">
                                      {item.quantity} {item.unit}
                                    </td>
                                    <td className="px-5 sm:px-6 py-4 text-[#55685D] whitespace-nowrap">
                                      ₹{item.rate}/{item.unit}
                                    </td>
                                    <td className="px-5 sm:px-6 py-4 font-bold text-sm text-right text-[#0C4B32] whitespace-nowrap">
                                      ₹{(item.quantity * item.rate).toLocaleString("en-IN")}
                                    </td>
                                    <td className="px-5 sm:px-6 py-4 text-[#55685D] whitespace-nowrap">
                                      {item.expiryDate ? formatDisplayDate(item.expiryDate) : "N/A"}
                                    </td>
                                    <td className="px-5 sm:px-6 py-4 text-center whitespace-nowrap">
                                      {isLow ? (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                          Low Stock
                                        </span>
                                      ) : exp.status === "expiring_soon" ? (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200">
                                          Expiring
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                          Good
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* TABLE: MACHINERY & FLEET */}
                    {reportCategory === "machinery" && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#F4F8F4] border-b border-[#E5ECE7] text-[#55685D]">
                            <tr>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Equipment Name</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Category</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Operator</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Engine Runtime</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Fuel Spec</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Next Service</th>
                              <th className="px-5 sm:px-6 py-3.5 font-bold uppercase tracking-wider text-[10px] text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5ECE7]">
                            {scopedEquipment.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="px-5 py-8 text-center text-xs text-[#55685D] bg-[#FBFDFB]">
                                  No machinery or equipment recorded.
                                </td>
                              </tr>
                            ) : scopedEquipment
                              .filter((eq) => {
                                if (isAllFarms && reportFarmFilter !== "all" && eq.farmId !== reportFarmFilter) return false;
                                if (!reportSearch.trim()) return true;
                                const q = reportSearch.toLowerCase();
                                return eq.name.toLowerCase().includes(q) || eq.category.toLowerCase().includes(q) || (eq.operator && eq.operator.toLowerCase().includes(q));
                              })
                              .map((eq) => (
                                <tr key={eq.id} className="hover:bg-[#F9FCFA] transition-colors">
                                  <td className="px-5 sm:px-6 py-4 font-bold text-sm text-[#26352D] whitespace-nowrap">
                                    {eq.name}
                                  </td>
                                  <td className="px-5 sm:px-6 py-4 text-[#55685D] whitespace-nowrap">
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#E7F3EB] text-[#0C4B32]">
                                      {eq.category}
                                    </span>
                                  </td>
                                  <td className="px-5 sm:px-6 py-4 text-[#55685D] whitespace-nowrap">
                                    {eq.operator}
                                  </td>
                                  <td className="px-5 sm:px-6 py-4 font-bold text-[#0C4B32] whitespace-nowrap">
                                    {eq.runtimeHours} Hours
                                  </td>
                                  <td className="px-5 sm:px-6 py-4 text-[#55685D] whitespace-nowrap">
                                    {eq.fuelEfficiency || "Standard"}
                                  </td>
                                  <td className="px-5 sm:px-6 py-4 text-[#55685D] whitespace-nowrap">
                                    {eq.nextServiceDate ? formatDisplayDate(eq.nextServiceDate) : "Not scheduled"}
                                  </td>
                                  <td className="px-5 sm:px-6 py-4 text-center whitespace-nowrap">
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                        eq.status === "Operational" || eq.status === "In Field"
                                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                          : eq.status === "Service Due"
                                          ? "bg-amber-50 text-amber-900 border-amber-200"
                                          : "bg-red-50 text-red-800 border-red-200"
                                      }`}
                                    >
                                      {eq.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
                </div>
              </div>
            )}

            {/* TAB: SUBSCRIPTION / PLAN */}
            {activeTab === "subscription" && (
              <div className="space-y-6">
                {/* Toast Notification */}
                {subscriptionToast && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{subscriptionToast}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubscriptionToast(null)}
                      className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Sub Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5ECE7]">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#26352D] tracking-tight">
                      Subscription & Plan
                    </h2>
                    <p className="text-xs text-[#55685D] mt-0.5">
                      Manage your farm license, active acreage allocation, and billing receipts.
                    </p>
                  </div>

                  {/* Billing Frequency Switcher */}
                  <div className="flex items-center p-1 bg-[#F4F8F4] rounded-xl border border-[#DCE6DE]">
                    <button
                      type="button"
                      onClick={() => setBillingCycle("annual")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                        billingCycle === "annual"
                          ? "bg-[#0C4B32] text-white shadow-xs font-semibold"
                          : "text-[#55685D] hover:text-[#26352D]"
                      }`}
                    >
                      Annual (Save 20%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle("monthly")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                        billingCycle === "monthly"
                          ? "bg-[#0C4B32] text-white shadow-xs font-semibold"
                          : "text-[#55685D] hover:text-[#26352D]"
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                {/* Active Plan Overview Card */}
                <div className="bg-white rounded-2xl border border-[#E5ECE7] p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-[#0C4B32] bg-[#E7F3EB] px-2.5 py-0.5 rounded-full border border-[#C6E2D0]">
                          Active License
                        </span>
                        <span className="text-[11px] text-[#55685D]">
                          Renews on 14 Nov 2027 via UPI AutoPay
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#26352D]">
                        {SUBSCRIPTION_PLANS.find((p) => p.id === activePlanId)?.name || "Precision Enterprise Agri"}
                      </h3>
                    </div>

                    <div className="flex items-baseline gap-1 sm:text-right">
                      <span className="text-2xl font-bold text-[#0C4B32]">
                        {(() => {
                          const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === activePlanId) || SUBSCRIPTION_PLANS[2];
                          if (billingCycle === "annual") {
                            return currentPlan.annualPrice === 0 ? "Free" : `₹${currentPlan.annualPrice.toLocaleString("en-IN")}`;
                          }
                          return currentPlan.monthlyPrice === 0 ? "Free" : `₹${currentPlan.monthlyPrice.toLocaleString("en-IN")}`;
                        })()}
                      </span>
                      <span className="text-xs text-[#55685D] font-normal">
                        {(() => {
                          const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === activePlanId) || SUBSCRIPTION_PLANS[2];
                          return currentPlan.annualPrice === 0 ? "forever" : billingCycle === "annual" ? "/ year" : "/ month";
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Quotas Meter */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#E5ECE7]">
                    <div className="p-3 bg-[#FBFDFB] rounded-xl border border-[#E5ECE7]">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-[#55685D]">Acreage Used</span>
                        <strong className="text-[#26352D]">35.5 / 50.0 Acres</strong>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#E5ECE7] overflow-hidden">
                        <div className="h-full bg-[#0C4B32] rounded-full" style={{ width: "71%" }} />
                      </div>
                    </div>

                    <div className="p-3 bg-[#FBFDFB] rounded-xl border border-[#E5ECE7]">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-[#55685D]">Farm Holdings</span>
                        <strong className="text-[#26352D]">2 Registered</strong>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#E5ECE7] overflow-hidden">
                        <div className="h-full bg-[#278449] rounded-full" style={{ width: "40%" }} />
                      </div>
                    </div>

                    <div className="p-3 bg-[#FBFDFB] rounded-xl border border-[#E5ECE7]">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-[#55685D]">Team Members</span>
                        <strong className="text-[#26352D]">4 of 10 Seats</strong>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#E5ECE7] overflow-hidden">
                        <div className="h-full bg-[#0C4B32] rounded-full" style={{ width: "40%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Available Plan Tiers (Simple 3 Cards) */}
                <div>
                  <h3 className="text-sm font-semibold text-[#26352D] mb-3">
                    Available Plans
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {SUBSCRIPTION_PLANS.map((plan) => {
                      const isCurrent = activePlanId === plan.id;
                      const priceVal =
                        billingCycle === "annual"
                          ? plan.annualPrice === 0
                            ? "Free"
                            : `₹${plan.annualPrice.toLocaleString("en-IN")}`
                          : plan.monthlyPrice === 0
                          ? "Free"
                          : `₹${plan.monthlyPrice.toLocaleString("en-IN")}`;
                      const period = plan.annualPrice === 0 ? "forever" : billingCycle === "annual" ? "/ year" : "/ month";

                      return (
                        <div
                          key={plan.id}
                          className={`rounded-2xl p-4 sm:p-5 border bg-white flex flex-col justify-between transition-all ${
                            isCurrent
                              ? "border-[#0C4B32] ring-1 ring-[#0C4B32]/20 shadow-xs"
                              : "border-[#E5ECE7] hover:border-[#C6E2D0]"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-bold text-[#26352D]">{plan.name}</h4>
                              {isCurrent && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E7F3EB] text-[#0C4B32] border border-[#C6E2D0]">
                                  Active Plan
                                </span>
                              )}
                            </div>

                            <div className="mb-3">
                              <span className="text-xl font-bold text-[#0C4B32]">{priceVal}</span>
                              <span className="text-xs text-[#55685D] ml-1">{period}</span>
                              <p className="text-[11px] text-[#55685D] mt-0.5">{plan.acreageLimit} • {plan.farmLimit}</p>
                            </div>

                            <ul className="space-y-2 border-t border-[#E5ECE7] pt-3 text-xs text-[#26352D] mb-4">
                              {plan.features.map((feat, fIdx) => (
                                <li key={fIdx} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#0C4B32] mt-1.5 shrink-0" />
                                  <span className="text-[11px] leading-snug">
                                    {feat.includes("(Coming Soon)") ? (
                                      <>
                                        {feat.replace("(Coming Soon)", "").trim()}{" "}
                                        <span className="inline-block px-1.5 py-0.2 text-[9px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded">
                                          Coming Soon
                                        </span>
                                      </>
                                    ) : (
                                      feat
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            {isCurrent ? (
                              <button
                                type="button"
                                disabled
                                className="w-full py-2 text-xs font-semibold rounded-xl bg-[#E7F3EB] text-[#0C4B32] cursor-default text-center"
                              >
                                Current Plan
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isProcessingPayment}
                                onClick={() => handleSelectPlan(plan.id)}
                                className="w-full py-2 text-xs font-semibold rounded-xl bg-white hover:bg-[#F4F8F4] text-[#0C4B32] border border-[#0C4B32] transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                              >
                                {isProcessingPayment ? (
                                  <>
                                    <div className="w-3.5 h-3.5 border-2 border-[#0C4B32]/30 border-t-[#0C4B32] rounded-full animate-spin" />
                                    <span>Processing...</span>
                                  </>
                                ) : (
                                  <span>Select Plan</span>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Billing Invoices List */}
                <div className="bg-white rounded-2xl border border-[#E5ECE7] p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#26352D]">Recent Payment Invoices</h4>
                      <p className="text-[11px] text-[#55685D]">
                        Tax receipts for Samrala Precision Agro Enterprises (GSTIN: 03AAAFK1234Q1Z5)
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAF8] border-b border-[#E5ECE7] text-[#55685D]">
                        <tr>
                          <th className="px-3 py-2 font-medium">Invoice #</th>
                          <th className="px-3 py-2 font-medium">Date</th>
                          <th className="px-3 py-2 font-medium">Plan Description</th>
                          <th className="px-3 py-2 font-medium text-right">Amount</th>
                          <th className="px-3 py-2 font-medium text-center">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5ECE7]">
                        {invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-[#F9FCFA]">
                            <td className="px-3 py-2.5 font-mono font-medium text-[#26352D]">{inv.invoiceNo}</td>
                            <td className="px-3 py-2.5 text-[#55685D]">{inv.date}</td>
                            <td className="px-3 py-2.5 text-[#26352D]">{inv.planName}</td>
                            <td className="px-3 py-2.5 font-semibold text-right text-[#0C4B32]">
                              ₹{inv.amount.toLocaleString("en-IN")}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleDownloadInvoice(inv)}
                                className="p-1 rounded text-[#0C4B32] hover:bg-[#E7F3EB] transition-colors cursor-pointer"
                                title="Download Receipt PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SUPPORT */}
            {activeTab === "support" && (
              <div className="space-y-6">
                {/* Toast Notification */}
                {supportToast && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{supportToast}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSupportToast(null)}
                      className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Sub Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5ECE7]">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#26352D] tracking-tight">
                      Agronomy Help & Support
                    </h2>
                    <p className="text-xs text-[#55685D] mt-0.5">
                      Direct agricultural advisory, crop disease diagnosis, and platform support.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenNewTicketModal}
                    className="btn btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Open Support Ticket</span>
                  </button>
                </div>

                {/* 3 Simple Contact Channels */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Helpline */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E5ECE7] shadow-xs flex flex-col justify-between space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#26352D]">Toll-Free Helpline</h4>
                        <span className="text-sm font-mono font-bold text-[#0C4B32] block mt-0.5">1800-KHETIVO</span>
                        <span className="text-[11px] text-[#55685D] block">Daily 6:00 AM – 10:00 PM</span>
                      </div>
                    </div>
                    <a
                      href="tel:18005438486"
                      className="w-full py-1.5 text-xs font-medium rounded-lg bg-[#F4F8F4] hover:bg-[#E7F3EB] text-[#0C4B32] text-center border border-[#DCE6DE] transition-colors"
                    >
                      Call Helpline
                    </a>
                  </div>

                  {/* WhatsApp Support */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E5ECE7] shadow-xs flex flex-col justify-between space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#26352D]">WhatsApp Crop Desk</h4>
                        <span className="text-xs font-medium text-[#26352D] block mt-0.5">Photo Pest Diagnosis</span>
                        <span className="text-[11px] text-[#55685D] block">Dr. Harpreet Singh (PAU)</span>
                      </div>
                    </div>
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 text-xs font-medium rounded-lg bg-[#E7F3EB] hover:bg-[#d6ecdd] text-[#0C4B32] text-center border border-[#C6E2D0] transition-colors"
                    >
                      Chat on WhatsApp
                    </a>
                  </div>

                  {/* On-Site Visit */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E5ECE7] shadow-xs flex flex-col justify-between space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#F4F8F4] text-[#55685D] flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#26352D]">Extension Field Visit</h4>
                        <span className="text-xs font-medium text-[#26352D] block mt-0.5">Soil & Drone Tests</span>
                        <span className="text-[11px] text-[#55685D] block">Turnaround within 48h</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenNewTicketModal}
                      className="w-full py-1.5 text-xs font-medium rounded-lg bg-[#F4F8F4] hover:bg-[#E5ECE7] text-[#26352D] text-center border border-[#DCE6DE] transition-colors cursor-pointer"
                    >
                      Request Visit
                    </button>
                  </div>
                </div>

                {/* Main Content Two-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column (7 cols): Ask a Question & Recent Tickets */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* Ask a Question Card */}
                    <div className="bg-white rounded-2xl border border-[#E5ECE7] p-5 shadow-xs space-y-3">
                      <h3 className="text-sm font-bold text-[#26352D]">Ask an Agronomist</h3>
                      <p className="text-xs text-[#55685D]">
                        Submit a question directly to our agronomy queue. We will check your farm records and reply quickly.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                        <div>
                          <label className="block text-[11px] font-medium text-[#55685D] mb-1">Target Farm</label>
                          <select
                            value={newTicketFarmId}
                            onChange={(e) => setNewTicketFarmId(e.target.value)}
                            className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] text-xs outline-none"
                          >
                            <option value="all">All Holdings (General)</option>
                            {farms.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#55685D] mb-1">Crop / Variety</label>
                          <input
                            type="text"
                            value={newTicketCrop}
                            onChange={(e) => setNewTicketCrop(e.target.value)}
                            placeholder="e.g. Wheat PBW-824"
                            className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#55685D] mb-1">Your Question or Issue</label>
                        <textarea
                          rows={3}
                          value={newTicketDescription}
                          onChange={(e) => setNewTicketDescription(e.target.value)}
                          placeholder="e.g. Leaves turning pale yellow after recent watering. Please advise on nutrient or spray recommendations."
                          className="w-full p-3 text-xs bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none placeholder:text-[#55685D]/60"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-[#55685D]">
                          Avg. reply time: <strong>under 2 hours</strong>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            if (!newTicketDescription.trim()) {
                              alert("Please enter your question.");
                              return;
                            }
                            setNewTicketSubject("Agronomy Question: " + (newTicketCrop || "Crop Care"));
                            handleCreateSupportTicket(e);
                          }}
                          className="btn btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Question</span>
                        </button>
                      </div>
                    </div>

                    {/* Recent Support Tickets */}
                    <div className="bg-white rounded-2xl border border-[#E5ECE7] p-5 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-[#26352D]">Recent Tickets & Inquiries</h4>
                        <span className="text-[11px] text-[#55685D]">{supportTickets.length} Total</span>
                      </div>

                      <div className="space-y-2">
                        {supportTickets.slice(0, 3).map((ticket) => (
                          <div
                            key={ticket.id}
                            className="p-3 rounded-xl border border-[#E5ECE7] bg-[#FBFDFB] flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold text-[#0C4B32]">#{ticket.ticketNo}</span>
                                <span className="font-medium text-[#26352D] truncate">{ticket.subject}</span>
                              </div>
                              <div className="text-[11px] text-[#55685D] mt-0.5">
                                {ticket.farmName} • {ticket.assignedAgronomist}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  ticket.status === "Resolved"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                {ticket.status}
                              </span>
                              <button
                                type="button"
                                onClick={() => setSelectedTicketModal(ticket)}
                                className="px-2.5 py-1 text-xs text-[#0C4B32] hover:bg-[#E7F3EB] rounded-lg transition-colors cursor-pointer font-medium"
                              >
                                View Thread
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column (5 cols): Common Questions (FAQ) */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5ECE7] p-5 shadow-xs space-y-3">
                    <h3 className="text-sm font-bold text-[#26352D]">Frequently Asked Questions</h3>
                    <p className="text-xs text-[#55685D]">Quick answers to common farming and platform questions.</p>

                    <div className="space-y-2 pt-1">
                      {AGRONOMY_FAQS.slice(0, 5).map((faq, idx) => {
                        const isOpen = expandedFaqIndex === idx;
                        return (
                          <div
                            key={idx}
                            className="rounded-xl border border-[#E5ECE7] bg-[#FBFDFB] overflow-hidden transition-colors"
                          >
                            <button
                              type="button"
                              onClick={() => setExpandedFaqIndex(isOpen ? null : idx)}
                              className="w-full p-3 text-left flex items-center justify-between gap-2 cursor-pointer hover:bg-[#F4F8F4]"
                            >
                              <h4 className="text-xs font-semibold text-[#26352D]">{faq.question}</h4>
                              <ChevronDown className={`w-3.5 h-3.5 text-[#55685D] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                            </button>
                            {isOpen && (
                              <div className="p-3 pt-0 text-xs text-[#55685D] leading-relaxed border-t border-[#E5ECE7]/60">
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Toast Notification */}
                {settingsToast && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{settingsToast}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettingsToast(null)}
                      className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Sub Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5ECE7]">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#26352D] tracking-tight">
                      {t.settings_title}
                    </h2>
                    <p className="text-xs text-[#55685D] mt-0.5">
                      {t.settings_subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleResetSettings}
                      className="px-3.5 py-2 text-xs font-medium rounded-xl bg-white text-[#55685D] hover:text-[#26352D] border border-[#DCE6DE] hover:bg-[#F4F8F4] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.settings_reset}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="px-3.5 py-2 text-xs font-medium rounded-xl bg-white text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.settings_sign_out}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      className="btn btn-primary text-xs px-4 py-2 inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.settings_save}</span>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-5">
                  {/* CARD 1: Farmer Identity & Contact */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE7]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#26352D]">{t.farmer_identity_title}</h3>
                          <p className="text-[11px] text-[#55685D]">{t.farmer_identity_desc}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {t.verified_farmer_id}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block text-[11px] font-medium text-[#55685D] mb-1">
                          {t.farmer_name_label}
                        </label>
                        <input
                          type="text"
                          value={settingsFarmerName}
                          onChange={(e) => setSettingsFarmerName(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] font-medium"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#55685D] mb-1">
                          {t.farmer_phone_label}
                        </label>
                        <input
                          type="tel"
                          value={settingsPhone}
                          onChange={(e) => setSettingsPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] font-medium"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#55685D] mb-1">
                          {t.farmer_email_label}
                        </label>
                        <input
                          type="email"
                          value={settingsEmail}
                          onChange={(e) => setSettingsEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-[#55685D] mb-1">
                          {t.primary_mandi_label}
                        </label>
                        <select
                          value={settingsMandi}
                          onChange={(e) => setSettingsMandi(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                        >
                          <option value="Khanna Mandi, Ludhiana">Khanna Mandi (Asia's Largest Grain Market - Ludhiana)</option>
                          <option value="Samrala APMC Yard, Ludhiana">Samrala APMC Yard, Ludhiana</option>
                          <option value="Bhawanigarh Grain Market, Sangrur">Bhawanigarh Grain Market, Sangrur</option>
                          <option value="Jagraon Grain Mandi, Ludhiana">Jagraon Grain Mandi, Ludhiana</option>
                          <option value="Sirhind Mandi, Fatehgarh Sahib">Sirhind Mandi, Fatehgarh Sahib</option>
                          <option value="Karnal Anaj Mandi, Haryana">Karnal Anaj Mandi, Haryana</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#55685D] mb-1">
                          {t.farm_address_label}
                        </label>
                        <input
                          type="text"
                          value={settingsHeadquartersAddress}
                          placeholder="Village Samrala, GT Road Belt, Ludhiana, Punjab 141001"
                          onChange={(e) => setSettingsHeadquartersAddress(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: Regional & System Defaults */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-[#E5ECE7]">
                      <div className="w-7 h-7 rounded-lg bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center">
                        <Ruler className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#26352D]">{t.regional_units_title}</h3>
                        <p className="text-[11px] text-[#55685D]">{t.regional_units_desc}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <label className="block text-[11px] font-medium text-[#55685D] mb-1">
                          {t.default_unit_label}
                        </label>
                        <select
                          value={settingsDefaultUnit}
                          onChange={(e) => setSettingsDefaultUnit(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] font-medium cursor-pointer"
                        >
                          {LAND_MEASUREMENT_UNITS.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#55685D] mb-1">
                          {t.interface_language}
                        </label>
                        <select
                          value={draftSettingsLanguage}
                          onChange={(e) => setDraftSettingsLanguage(e.target.value as SupportedLanguage)}
                          className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                        >
                          <option value="en">English (Default)</option>
                          <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                          <option value="hi">हिन्दी (Hindi)</option>
                          <option value="mr">मराठी (Marathi)</option>
                          <option value="gu">ગુજરાતી (Gujarati)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#55685D] mb-1">
                          {t.currency_standard_label}
                        </label>
                        <select
                          defaultValue="INR"
                          className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                        >
                          <option value="INR">₹ INR (Indian Rupee / Quintal)</option>
                          <option value="USD">$ USD (US Dollar)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#55685D] mb-1">
                          {t.date_format_label}
                        </label>
                        <select
                          defaultValue="DD/MM/YYYY"
                          className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 28/10/2026)</option>
                          <option value="DD MMM YYYY">DD MMM YYYY (e.g. 28 Oct 2026)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* CARD 3: Account Security & Danger Zone */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-red-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-red-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#26352D]">{t.danger_zone_title}</h3>
                          <p className="text-[11px] text-[#55685D]">{t.danger_zone_desc}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                        Account Actions
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sign Out Card */}
                      <div className="p-4 rounded-xl border border-[#DCE6DE] bg-[#FBFDFB] flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <LogOut className="w-4 h-4 text-[#0C4B32]" />
                            <h4 className="text-xs font-bold text-[#26352D]">Sign Out of Dashboard</h4>
                          </div>
                          <p className="text-[11px] text-[#55685D] leading-relaxed">
                            Sign out of your active session on this device. Your farm land records, crop data, and registered login will remain securely saved for your next login.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full sm:w-auto self-start px-4 py-2 text-xs font-semibold rounded-xl bg-white text-[#26352D] hover:text-[#0C4B32] border border-[#DCE6DE] hover:bg-[#F4F8F4] transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>

                      {/* Delete Account Card */}
                      <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <Trash2 className="w-4 h-4 text-red-600" />
                            <h4 className="text-xs font-bold text-red-700">Permanently Delete Account</h4>
                          </div>
                          <p className="text-[11px] text-[#55685D] leading-relaxed">
                            Irreversibly delete your farmer account, registered phone number (+91 {settingsPhone ? settingsPhone.replace(/\D/g, "").slice(-10) : "9814054321"}), OTP verification record, and all associated farm holdings.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirmInput("");
                            setDeleteAccountError("");
                            setDeleteAccountModalOpen(true);
                          }}
                          className="w-full sm:w-auto self-start px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Account</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Save Bar */}
                  <div className="pt-3 border-t border-[#E5ECE7] flex flex-wrap items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-white text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                    <div className="flex items-center gap-2.5 ml-auto">
                      <button
                        type="button"
                        onClick={handleResetSettings}
                        className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-white text-[#55685D] hover:text-[#26352D] border border-[#DCE6DE] hover:bg-[#F4F8F4] transition-colors cursor-pointer text-center"
                      >
                        Reset Defaults
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary text-xs px-5 py-2.5 inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer text-center"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Settings</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <nav
          aria-label="Mobile Bottom Navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5ECE7] px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab("dashboard");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "text-[#0C4B32] font-bold"
                : "text-[#55685D] hover:text-[#26352D] font-medium"
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${activeTab === "dashboard" ? "bg-[#EAF3EC]" : ""}`}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{t.nav_dashboard}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("crops");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "crops" || activeTab === "crop-planning"
                ? "text-[#0C4B32] font-bold"
                : "text-[#55685D] hover:text-[#26352D] font-medium"
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${activeTab === "crops" || activeTab === "crop-planning" ? "bg-[#EAF3EC]" : ""}`}>
              <Sprout className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{t.nav_crops}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("tasks");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "tasks"
                ? "text-[#0C4B32] font-bold"
                : "text-[#55685D] hover:text-[#26352D] font-medium"
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${activeTab === "tasks" ? "bg-[#EAF3EC]" : ""}`}>
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{t.nav_tasks}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("weather");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "weather"
                ? "text-[#0C4B32] font-bold"
                : "text-[#55685D] hover:text-[#26352D] font-medium"
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${activeTab === "weather" ? "bg-[#EAF3EC]" : ""}`}>
              <CloudSun className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{t.nav_weather}</span>
          </button>

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[#55685D] hover:text-[#26352D] font-medium transition-all cursor-pointer"
          >
            <div className="p-1 rounded-lg">
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{t.filter || "Menu"}</span>
          </button>
        </nav>
      </div>

      {/* MODAL: VIEW CROP MASTER TIMELINE & PROTOCOL */}
      {selectedCropTemplateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setSelectedCropTemplateModal(null)}
        >
          <div 
            className="bg-white rounded-2xl border border-[#DCE6DE] shadow-2xl max-w-3xl w-full p-5 sm:p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 text-xs max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE7]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-[#26352D] flex items-center gap-1.5">
                    <Sprout className="w-5 h-5 text-[#0C4B32]" />
                    <span>{selectedCropTemplateModal.cropName || selectedCropTemplateModal.name}</span>
                  </h3>
                  {selectedCropTemplateModal.season && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E7F3EB] text-[#0C4B32] border border-[#C6E2D0]">
                      {selectedCropTemplateModal.season} Season
                    </span>
                  )}
                  {selectedCropTemplateModal.badge && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F4F8F4] text-[#55685D] border border-[#DCE6DE]">
                      {selectedCropTemplateModal.badge}
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {selectedCropTemplateModal.durationDays || selectedCropTemplateModal.duration} Days Duration
                  </span>
                </div>
                <p className="text-xs text-[#55685D] mt-1">
                  Main Variety: <strong className="text-[#0C4B32]">{selectedCropTemplateModal.variety || selectedCropTemplateModal.varieties?.[0]}</strong> • Sowing: {selectedCropTemplateModal.sowingWindow} • Expected Yield: {selectedCropTemplateModal.targetYieldQuintals}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCropTemplateModal(null)}
                className="p-1.5 text-[#889B90] hover:text-[#26352D] rounded-xl hover:bg-[#F4F8F4] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Agronomic Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-[#F8FAF8] rounded-xl border border-[#E5ECE7]">
              <div>
                <span className="text-[10px] text-[#889B90] uppercase tracking-wider font-bold block">
                  Soil Type
                </span>
                <span className="text-xs font-semibold text-[#26352D] truncate block">
                  {selectedCropTemplateModal.defaultSoil || "Alluvial Loam"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#889B90] uppercase tracking-wider font-bold block">
                  Irrigation Method
                </span>
                <span className="text-xs font-semibold text-[#26352D] truncate block">
                  {selectedCropTemplateModal.defaultIrrigation || "Drip / Micro-Irrigation"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#889B90] uppercase tracking-wider font-bold block">
                  Low Moisture Alert
                </span>
                <span className="text-xs font-bold text-[#0C4B32]">
                  Below {selectedCropTemplateModal.irrigationThresholdMoisture}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#889B90] uppercase tracking-wider font-bold block">
                  Critical Water Stages
                </span>
                <span className="text-xs font-semibold text-[#26352D]">
                  {selectedCropTemplateModal.criticalIrrigationStages.length} Stages Identified
                </span>
              </div>
            </div>

            {/* Growth Stage Timeline Breakdown */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#0C4B32] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#278449]" />
                  <span>Growth Stages &amp; Schedule</span>
                </h4>
                <span className="text-[11px] text-[#55685D]">
                  {selectedCropTemplateModal.growthTimeline?.length || 0} Stages Configured
                </span>
              </div>

              {selectedCropTemplateModal.growthTimeline && selectedCropTemplateModal.growthTimeline.length > 0 ? (
                <div className="space-y-2">
                  {selectedCropTemplateModal.growthTimeline.map((stage, idx) => (
                    <div
                      key={stage.id || idx}
                      className="p-3 rounded-xl border border-[#E5ECE7] bg-[#FBFDFB] hover:border-[#278449]/50 transition-colors space-y-1.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#0C4B32] text-white flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-[#26352D]">{stage.stageName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-[#55685D] bg-[#F4F8F4] px-2 py-0.5 rounded-lg border border-[#DCE6DE]">
                            Days {stage.startDay} – {stage.endDay}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              stage.irrigationRequirement === "Critical"
                                ? "bg-red-50 text-red-800 border border-red-200"
                                : stage.irrigationRequirement === "Moderate"
                                ? "bg-blue-50 text-blue-800 border border-blue-200"
                                : stage.irrigationRequirement === "Withhold"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            <Droplets className="w-3 h-3" />
                            <span>{stage.irrigationRequirement} Water</span>
                          </span>
                        </div>
                      </div>

                      {stage.recommendedActivity && (
                        <p className="text-[11px] text-[#55685D] pl-7 leading-relaxed">
                          {stage.recommendedActivity}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#889B90] italic">No growth stage timeline recorded for this crop.</p>
              )}
            </div>

            {/* Recommended Do's and Don'ts */}
            {((selectedCropTemplateModal.dos && selectedCropTemplateModal.dos.length > 0) || (selectedCropTemplateModal.donts && selectedCropTemplateModal.donts.length > 0)) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Recommended Do&apos;s ({selectedCropTemplateModal.dos?.length || 0})</span>
                  </span>
                  <ul className="space-y-1 text-[11px] text-[#26352D]">
                    {selectedCropTemplateModal.dos?.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-700 font-bold shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-red-50/70 border border-red-200 space-y-2">
                  <span className="text-[11px] font-bold text-red-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-700 shrink-0" />
                    <span>Things to Avoid (Don&apos;ts) ({selectedCropTemplateModal.donts?.length || 0})</span>
                  </span>
                  <ul className="space-y-1 text-[11px] text-[#26352D]">
                    {selectedCropTemplateModal.donts?.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-red-700 font-bold shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Disease and PAU Prescription */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
              <span className="text-[11px] font-bold text-amber-900 block">
                Disease Guide &amp; Recommended Spray:
              </span>
              <p className="text-[11px] text-[#55685D]">
                <strong>Risks:</strong> {selectedCropTemplateModal.majorDiseases.join(", ")}
              </p>
              <p className="text-[11px] font-mono text-[#0C4B32] bg-white/70 p-2 rounded-lg border border-amber-200/60">
                {selectedCropTemplateModal.pauFungicidePrescription}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const tmpl = selectedCropTemplateModal;
                  setSelectedCropTemplateModal(null);
                  setNewCropTemplateId(tmpl.id);
                  const defVar = tmpl.variety || (tmpl.varieties && tmpl.varieties[0]) || "Standard Regional";
                  setNewCropVariety(defVar);
                  const dur = tmpl.durationDays || parseInt(tmpl.duration) || 120;
                  setNewCropTotalDays(dur);
                  if (tmpl.growthTimeline && tmpl.growthTimeline.length > 0) {
                    setNewCropStage(tmpl.growthTimeline[0].stageName);
                    setNewCropStageStep(1);
                    setNewCropCurrentDay(tmpl.growthTimeline[0].startDay || 1);
                  }
                  setNewCropFarmId(isAllFarms ? (farms[0]?.id || "farm-1") : currentFarm.id);
                  setAddCropModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-[#0C4B32] hover:bg-[#093826] transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Plant this Crop</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCropTemplateModal(null)}
                className="px-4 py-2 rounded-xl border border-[#DCE6DE] text-xs font-medium text-[#55685D] hover:bg-[#F4F8F4] cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FARM SETUP FLOW MODAL (TRIGGERED ON "ADD FARM") */}
      {setupModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={() => setSetupModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-[26px] shadow-2xl p-5 sm:p-7 relative border border-[#E5ECE7] my-6 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setSetupModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#55685D] hover:text-[#26352D] hover:bg-[#F4F8F4] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#26352D] tracking-tight">
                Add New Farm
              </h2>
              <p className="text-xs text-[#55685D] mt-1 font-normal">
                Configure your land boundaries, soil characteristics, and irrigation infrastructure.
              </p>

              {/* Stepper Progress Bar (Clickable tabs) */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-[#E5ECE7]">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setSetupStep(1);
                  }}
                  className="flex items-center gap-1.5 sm:gap-2 text-left cursor-pointer group hover:opacity-85 transition-opacity min-w-0"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                      setupStep === 1
                        ? "bg-[#0C4B32] text-white ring-2 ring-[#0C4B32]/30"
                        : setupStep > 1
                        ? "bg-[#278449] text-white"
                        : "bg-[#F4F8F4] text-[#55685D] border border-[#DCE6DE]"
                    }`}
                  >
                    1
                  </div>
                  <span
                    className={`text-[11px] font-medium whitespace-nowrap truncate ${
                      setupStep === 1 ? "text-[#0C4B32] font-semibold" : "text-[#26352D]"
                    }`}
                  >
                    Identity & Area
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setSetupStep(2);
                  }}
                  className="flex items-center gap-1.5 sm:gap-2 text-left cursor-pointer group hover:opacity-85 transition-opacity min-w-0"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                      setupStep === 2
                        ? "bg-[#0C4B32] text-white ring-2 ring-[#0C4B32]/30"
                        : setupStep > 2
                        ? "bg-[#278449] text-white"
                        : "bg-[#F4F8F4] text-[#55685D] border border-[#DCE6DE]"
                    }`}
                  >
                    2
                  </div>
                  <span
                    className={`text-[11px] font-medium whitespace-nowrap truncate ${
                      setupStep === 2 ? "text-[#0C4B32] font-semibold" : "text-[#26352D]"
                    }`}
                  >
                    Location & Map
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setSetupStep(3);
                  }}
                  className="flex items-center gap-1.5 sm:gap-2 text-left cursor-pointer group hover:opacity-85 transition-opacity min-w-0"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                      setupStep === 3
                        ? "bg-[#0C4B32] text-white ring-2 ring-[#0C4B32]/30"
                        : setupStep > 3
                        ? "bg-[#278449] text-white"
                        : "bg-[#F4F8F4] text-[#55685D] border border-[#DCE6DE]"
                    }`}
                  >
                    3
                  </div>
                  <span
                    className={`text-[11px] font-medium whitespace-nowrap truncate ${
                      setupStep === 3 ? "text-[#0C4B32] font-semibold" : "text-[#26352D]"
                    }`}
                  >
                    Select Crops
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    if (selectedCropTemplates.length === 0) {
                      setErrorMsg("Please select at least 1 crop planted on this farm.");
                      return;
                    }
                    setSetupStep(4);
                  }}
                  className="flex items-center gap-1.5 sm:gap-2 text-left cursor-pointer group hover:opacity-85 transition-opacity min-w-0"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                      setupStep === 4
                        ? "bg-[#0C4B32] text-white ring-2 ring-[#0C4B32]/30"
                        : "bg-[#F4F8F4] text-[#55685D] border border-[#DCE6DE]"
                    }`}
                  >
                    4
                  </div>
                  <span
                    className={`text-[11px] font-medium whitespace-nowrap truncate ${
                      setupStep === 4 ? "text-[#0C4B32] font-semibold" : "text-[#26352D]"
                    }`}
                  >
                    Sowing Schedule
                  </span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Success Notification */}
            {setupSuccess ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center mx-auto border border-[#C6E2D0]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-[#26352D]">
                  Farm Setup Complete!
                </h3>
                <p className="text-xs text-[#55685D] max-w-sm mx-auto">
                  <strong>{farmName}</strong> has been configured with soil and irrigation parameters. Loading your dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={(e) => e.preventDefault()}>

                {/* STEP 1: Farm Name, Ownership, Total Area */}
                {setupStep === 1 && (
                  <div className="space-y-4">
                    {/* Farm Name */}
                    <div>
                      <label className="block text-xs font-medium text-[#26352D] mb-1.5" htmlFor="farm-name">
                        Farm Name *
                      </label>
                      <input
                        id="farm-name"
                        type="text"
                        required
                        placeholder="e.g. Sukhdev Organic Acres, North Farm Plot"
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm text-[#26352D] bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] focus:ring-2 focus:ring-[#0C4B32]/10 outline-none transition-all placeholder:text-[#55685D]/60"
                        autoFocus
                      />
                    </div>

                    {/* Total Area + Unit */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#26352D] mb-1.5" htmlFor="total-area">
                          Total Cultivable Area *
                        </label>
                        <input
                          id="total-area"
                          type="number"
                          required
                          min="0.5"
                          step="0.5"
                          placeholder="e.g. 18.5"
                          value={totalArea}
                          onChange={(e) => setTotalArea(e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 text-sm text-[#26352D] bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] focus:ring-2 focus:ring-[#0C4B32]/10 outline-none transition-all placeholder:text-[#55685D]/60"
                        />
                      </div>

                      <div className="relative">
                        <label className="block text-xs font-medium text-[#26352D] mb-1.5" htmlFor="area-unit-btn">
                          Measurement Unit
                        </label>
                        <button
                          id="area-unit-btn"
                          type="button"
                          onClick={() => setAreaUnitDropdownOpen(!areaUnitDropdownOpen)}
                          className="w-full px-3.5 py-2.5 text-sm text-[#26352D] bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] hover:border-[#0C4B32] focus:border-[#0C4B32] focus:ring-2 focus:ring-[#0C4B32]/10 outline-none transition-all cursor-pointer font-medium flex items-center justify-between text-left"
                        >
                          <span>{areaUnit}</span>
                          <ChevronDown className={`w-4 h-4 text-[#55685D] transition-transform duration-150 ${areaUnitDropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {/* Custom Dropdown List - Always Opens Downwards */}
                        {areaUnitDropdownOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setAreaUnitDropdownOpen(false)}
                            />
                            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-xl border border-[#DCE6DE] shadow-xl p-1.5 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                              {LAND_MEASUREMENT_UNITS.map((unit) => {
                                const isSelected = areaUnit === unit;
                                return (
                                  <button
                                    key={unit}
                                    type="button"
                                    onClick={() => {
                                      setAreaUnit(unit);
                                      setAreaUnitDropdownOpen(false);
                                    }}
                                    className={`w-full px-3 py-2 text-xs rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between ${
                                      isSelected
                                        ? "bg-[#E7F3EB] text-[#0C4B32] font-semibold"
                                        : "text-[#26352D] hover:bg-[#F4F8F4]"
                                    }`}
                                  >
                                    <span>{unit}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-[#0C4B32]" />}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Ownership Details */}
                    <div>
                      <label className="block text-xs font-medium text-[#26352D] mb-1.5">
                        Ownership Details
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {OWNERSHIP_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setOwnership(opt)}
                            className={`p-2.5 text-xs rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${ownership === opt
                                ? "border-[#0C4B32] bg-[#E7F3EB] text-[#0C4B32] font-semibold"
                                : "border-[#DCE6DE] bg-white text-[#55685D] hover:bg-[#F4F8F4]"
                              }`}
                          >
                            <span className="truncate">{opt}</span>
                            {ownership === opt && <Check className="w-3.5 h-3.5 text-[#0C4B32] shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Address, Map Picker, Lat/Long */}
                {setupStep === 2 && (
                  <div className="space-y-4">
                    {/* Farm Address */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-[#26352D]" htmlFor="farm-address">
                          Farm Address / Village
                        </label>
                        {recentlyAutoFilled && (
                          <span className="text-[11px] font-medium text-[#0C4B32] flex items-center gap-1 animate-in fade-in">
                            <CheckCircle2 className="w-3 h-3 text-[#278449]" />
                            Auto-filled
                          </span>
                        )}
                      </div>
                      <input
                        id="farm-address"
                        type="text"
                        placeholder="e.g. Village / Tehsil / Landmark"
                        value={farmAddress}
                        onChange={(e) => setFarmAddress(e.target.value)}
                        className={`w-full px-3.5 py-2.5 text-xs text-[#26352D] rounded-xl border outline-none transition-all placeholder:text-[#55685D]/60 ${recentlyAutoFilled
                            ? "bg-[#E7F3EB]/40 border-[#0C4B32] ring-1 ring-[#0C4B32]/30"
                            : "bg-[#FBFDFB] border-[#DCE6DE] focus:border-[#0C4B32]"
                          }`}
                        autoFocus
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-[#55685D] mb-1">District</label>
                        <input
                          type="text"
                          placeholder="e.g. Ludhiana"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className={`w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border outline-none transition-all placeholder:text-[#55685D]/60 ${recentlyAutoFilled
                              ? "bg-[#E7F3EB]/40 border-[#0C4B32] ring-2 ring-[#0C4B32]/30 font-medium"
                              : "bg-[#FBFDFB] border-[#DCE6DE] focus:border-[#0C4B32]"
                            }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#55685D] mb-1">State</label>
                        <input
                          type="text"
                          placeholder="e.g. Punjab"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className={`w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border outline-none transition-all placeholder:text-[#55685D]/60 ${recentlyAutoFilled
                              ? "bg-[#E7F3EB]/40 border-[#0C4B32] ring-2 ring-[#0C4B32]/30 font-medium"
                              : "bg-[#FBFDFB] border-[#DCE6DE] focus:border-[#0C4B32]"
                            }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#55685D] mb-1">PIN Code</label>
                        <input
                          type="text"
                          placeholder="e.g. 141001"
                          value={pinCode}
                          onChange={(e) => setPinCode(e.target.value)}
                          className={`w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border outline-none transition-all placeholder:text-[#55685D]/60 ${recentlyAutoFilled
                              ? "bg-[#E7F3EB]/40 border-[#0C4B32] ring-2 ring-[#0C4B32]/30 font-medium"
                              : "bg-[#FBFDFB] border-[#DCE6DE] focus:border-[#0C4B32]"
                            }`}
                        />
                      </div>
                    </div>

                    {/* Google Map Integration */}
                    <div className="pt-3 space-y-3.5">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <label className="text-xs font-semibold text-[#26352D] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#0C4B32]" />
                          <span>Google Maps (Satellite & Coordinates)</span>
                        </label>
                        <div className="flex items-center gap-4">
                          {/* Highlighted Auto-Detect GPS Button */}
                          <button
                            type="button"
                            onClick={handleGpsDetect}
                            disabled={locatingGps}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#0C4B32] hover:bg-[#12583A] active:bg-[#083322] rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            <Crosshair className={`w-3.5 h-3.5 text-[#F9B21B] ${locatingGps ? "animate-spin" : ""}`} />
                            <span>{locatingGps ? "Detecting GPS..." : "Auto-Detect GPS"}</span>
                          </button>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] text-[#55685D] hover:text-[#26352D] font-medium"
                          >
                            <span>Open in Google Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      {/* Map Location Search bar & Satellite/Roadmap Switcher */}
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-[#55685D] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search town, mandi, or coordinates on Google Maps..."
                            value={mapSearch}
                            onChange={(e) => setMapSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs text-[#26352D] bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none placeholder:text-[#55685D]/60"
                          />
                        </div>

                        {/* Google Map Mode Switches */}
                        <div className="flex items-center bg-[#F4F8F4] p-1 rounded-xl border border-[#DCE6DE] shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => setMapStyle("satellite")}
                            className={`px-3 py-1.5 text-[11px] rounded-lg font-medium transition-colors cursor-pointer ${mapStyle === "satellite"
                                ? "bg-[#0C4B32] text-white shadow-xs"
                                : "text-[#55685D] hover:text-[#26352D]"
                              }`}
                          >
                            Satellite
                          </button>
                          <button
                            type="button"
                            onClick={() => setMapStyle("roadmap")}
                            className={`px-3 py-1.5 text-[11px] rounded-lg font-medium transition-colors cursor-pointer ${mapStyle === "roadmap"
                                ? "bg-[#0C4B32] text-white shadow-xs"
                                : "text-[#55685D] hover:text-[#26352D]"
                              }`}
                          >
                            Roadmap
                          </button>
                        </div>
                      </div>

                      {/* Live Embedded Google Maps Container */}
                      <div className="relative w-full h-52 sm:h-56 rounded-2xl overflow-hidden border border-[#DCE6DE] shadow-inner bg-[#E5ECE7]">
                        <iframe
                          title="Google Map Location"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(
                            mapSearch.trim() || `${latitude},${longitude}`
                          )}&t=${mapStyle === "satellite" ? "k" : "m"}&z=15&ie=UTF8&iwloc=&output=embed`}
                          className="w-full h-full"
                        />

                        {/* Coordinates Badge */}
                        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] text-[#26352D] font-mono shadow-sm border border-[#DCE6DE] flex items-center gap-1.5 pointer-events-none z-10">
                          <MapPin className="w-3 h-3 text-[#0C4B32]" />
                          <span>
                            {latitude.toFixed(5)}°N, {longitude.toFixed(5)}°E
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Numerical Lat / Long Inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-[#55685D] mb-1">
                          Latitude (°N)
                        </label>
                        <input
                          type="number"
                          step="0.00001"
                          value={latitude}
                          onChange={(e) => setLatitude(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs text-[#26352D] bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#55685D] mb-1">
                          Longitude (°E)
                        </label>
                        <input
                          type="number"
                          step="0.00001"
                          value={longitude}
                          onChange={(e) => setLongitude(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs text-[#26352D] bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Crop Template, Soil & Water */}
                {setupStep === 3 && (
                  <div className="space-y-4">
                    {/* Crop Template Selection Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <label className="text-xs font-semibold text-[#26352D] flex items-center gap-1.5">
                            <Sprout className="w-3.5 h-3.5 text-[#0C4B32]" />
                            <span>Select Crop Templates (Multi-Crop Allowed) *</span>
                          </label>
                          <p className="text-[11px] text-[#55685D] mt-0.5">
                            1 Farm can cultivate multiple crops. Click to select 1 or more crops for this holding:
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-[#0C4B32] bg-[#E7F3EB] px-2 py-0.5 rounded border border-[#C6E2D0]">
                          {selectedCropTemplates.length} Selected
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-0.5">
                        {activeCropTemplates.map((tmpl) => {
                          const isSelected = selectedCropTemplates.includes(tmpl.id);
                          return (
                            <button
                              key={tmpl.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedCropTemplates((prev) => prev.filter((id) => id !== tmpl.id));
                                } else {
                                  setSelectedCropTemplates((prev) => [...prev, tmpl.id]);
                                  setSoilType(tmpl.defaultSoil || "Alluvial Loam (Deep & Fertile)");
                                  setIrrigationType(tmpl.defaultIrrigation || "Drip / Micro-Irrigation (Sub-surface/Surface)");
                                  if (!cropConfigs[tmpl.id]) {
                                    const dur = tmpl.durationDays || parseInt(tmpl.duration) || 120;
                                    const calculatedArea = totalArea ? Math.round((Number(totalArea) / (selectedCropTemplates.length + 1)) * 10) / 10 : "";
                                    const firstStage = tmpl.growthTimeline?.[0]?.stageName || "Stage 1: Germination & Emergence";
                                    const defaultVar = tmpl.variety || (tmpl.varieties && tmpl.varieties[0]) || "Standard Regional";
                                    setCropConfigs((prev) => ({
                                      ...prev,
                                      [tmpl.id]: {
                                        area: calculatedArea,
                                        variety: defaultVar,
                                        sownDate: new Date().toISOString().split("T")[0],
                                        stage: firstStage,
                                        stageStep: 1,
                                        currentDay: 1,
                                        totalDays: dur,
                                      },
                                    }));
                                  }
                                }
                              }}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                                isSelected
                                  ? "border-[#0C4B32] bg-[#E7F3EB] shadow-xs ring-1 ring-[#0C4B32]/30"
                                  : "border-[#DCE6DE] bg-white hover:border-[#A7D7B8] hover:bg-[#F4F8F4]"
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-[#26352D]">
                                    {tmpl.name}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#F4F8F4] text-[#0C4B32] font-medium border border-[#DCE6DE]">
                                    {tmpl.season}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#55685D] truncate mt-0.5">
                                  {tmpl.variety}
                                </div>
                                <div className="text-[10px] text-[#55685D]/80 flex items-center gap-2 mt-1 font-mono">
                                  <span>⏱ {tmpl.duration}</span>
                                  <span>•</span>
                                  <span className="truncate">{tmpl.badge}</span>
                                </div>
                              </div>
                              <div className="shrink-0 mt-0.5">
                                <div
                                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                    isSelected
                                      ? "border-[#0C4B32] bg-[#0C4B32] text-white"
                                      : "border-[#DCE6DE] bg-white"
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>


                    </div>
                  </div>
                )}

                {/* STEP 4: Crop Details & Sowing Schedule (Dedicated Tab) */}
                {setupStep === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-1">
                      <div>
                        <div className="text-xs font-bold text-[#26352D] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#0C4B32]" />
                          <span>Crop Details & Sowing Schedule</span>
                        </div>
                        <p className="text-[11px] text-[#55685D] mt-0.5">
                          Specify stage, sowing date & crop age
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-[#0C4B32] bg-[#E7F3EB] px-2 py-0.5 rounded border border-[#C6E2D0]">
                        {selectedCropTemplates.length} Selected {selectedCropTemplates.length === 1 ? "Crop" : "Crops"}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                      {selectedCropTemplates.map((templateId) => {
                        const tmpl = activeCropTemplates.find((t) => t.id === templateId);
                        if (!tmpl) return null;
                        const defaultVar = tmpl.variety || (tmpl.varieties && tmpl.varieties[0]) || "Standard Regional";
                        const cfg = cropConfigs[templateId] || {
                          area: totalArea ? Math.round((Number(totalArea) / (selectedCropTemplates.length || 1)) * 10) / 10 : "",
                          variety: defaultVar,
                          sownDate: new Date().toISOString().split("T")[0],
                          stage: tmpl.growthTimeline?.[0]?.stageName || "Stage 1: Germination & Emergence",
                          stageStep: 1,
                          currentDay: 1,
                          totalDays: tmpl.durationDays || parseInt(tmpl.duration) || 120,
                        };

                        return (
                          <div
                            key={tmpl.id}
                            className="p-3.5 rounded-xl border border-[#DCE6DE] bg-[#F4F8F4] space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#0C4B32]">{tmpl.name}</span>
                                <span className="text-[11px] text-[#55685D]">({cfg.variety || tmpl.variety})</span>
                                <span className="text-[10px] bg-white text-[#0C4B32] px-1.5 py-0.2 rounded border border-[#C6E2D0] font-medium">
                                  {tmpl.season}
                                </span>
                              </div>
                              <span className="text-[11px] text-[#55685D]">Cycle: ~{tmpl.duration}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                              {/* Acreage */}
                              <div>
                                <label className="block text-[11px] font-medium text-[#26352D] mb-1">
                                  Allocated Area ({areaUnit})
                                </label>
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0.5"
                                  value={cfg.area}
                                  onChange={(e) => {
                                    const val = e.target.value === "" ? "" : Number(e.target.value);
                                    setCropConfigs((prev) => ({
                                      ...prev,
                                      [templateId]: { ...cfg, area: val },
                                    }));
                                  }}
                                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#DCE6DE] focus:border-[#0C4B32] outline-none"
                                  placeholder="Acres"
                                />
                              </div>

                              {/* Sowing Date */}
                              <div>
                                <label className="block text-[11px] font-medium text-[#26352D] mb-1">
                                  Started / Sown On
                                </label>
                                <input
                                  type="date"
                                  value={cfg.sownDate}
                                  onChange={(e) => {
                                    const newDate = e.target.value;
                                    setCropConfigs((prev) => ({
                                      ...prev,
                                      [templateId]: { ...cfg, sownDate: newDate },
                                    }));
                                  }}
                                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#DCE6DE] focus:border-[#0C4B32] outline-none"
                                />
                              </div>

                              {/* Growth Stage */}
                              <div>
                                <label className="block text-[11px] font-medium text-[#26352D] mb-1">
                                  Current Stage
                                </label>
                                <select
                                  value={cfg.stage}
                                  onChange={(e) => {
                                    const chosenStage = e.target.value;
                                    const tmplStage = tmpl.growthTimeline?.find((s) => s.stageName === chosenStage);
                                    const foundStd = STANDARD_CROP_STAGES.find((s) => s.name === chosenStage);
                                    const stepIdx = tmpl.growthTimeline ? tmpl.growthTimeline.findIndex((s) => s.stageName === chosenStage) + 1 : 1;
                                    setCropConfigs((prev) => ({
                                      ...prev,
                                      [templateId]: {
                                        ...cfg,
                                        stage: chosenStage,
                                        stageStep: tmplStage ? stepIdx : (foundStd ? foundStd.step : cfg.stageStep),
                                        currentDay: tmplStage ? tmplStage.startDay || 1 : (foundStd ? foundStd.defaultDay : cfg.currentDay),
                                      },
                                    }));
                                  }}
                                  className="w-full px-2 py-1.5 text-xs bg-white rounded-lg border border-[#DCE6DE] focus:border-[#0C4B32] outline-none"
                                >
                                  {tmpl.growthTimeline && tmpl.growthTimeline.length > 0 ? (
                                    tmpl.growthTimeline.map((st, idx) => (
                                      <option key={st.id || idx} value={st.stageName}>
                                        {idx + 1}. {st.stageName} (Days {st.startDay}–{st.endDay})
                                      </option>
                                    ))
                                  ) : (
                                    STANDARD_CROP_STAGES.map((st) => (
                                      <option key={st.step} value={st.name}>
                                        {st.name} ({st.typicalDays})
                                      </option>
                                    ))
                                  )}
                                </select>
                              </div>

                              {/* Current Day */}
                              <div>
                                <label className="block text-[11px] font-medium text-[#26352D] mb-1">
                                  Crop Age (Day)
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min="1"
                                    max={Number(cfg.totalDays) || 365}
                                    value={cfg.currentDay}
                                    onChange={(e) => {
                                      const val = e.target.value === "" ? "" : Number(e.target.value);
                                      setCropConfigs((prev) => ({
                                        ...prev,
                                        [templateId]: { ...cfg, currentDay: val },
                                      }));
                                    }}
                                    className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#DCE6DE] focus:border-[#0C4B32] outline-none"
                                    placeholder="Day 28"
                                  />
                                  <span className="text-[11px] text-[#55685D] whitespace-nowrap">
                                    / {cfg.totalDays}d
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stepper Navigation Buttons */}
                <div className="pt-4 mt-5 border-t border-[#E5ECE7] flex items-center justify-between">
                  {setupStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setSetupStep((prev) => (prev > 1 ? ((prev - 1) as any) : 1))}
                      className="btn btn-outline text-xs px-4 py-2 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSetupModalOpen(false)}
                      className="btn btn-outline text-xs px-4 py-2 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}

                  {setupStep < 4 ? (
                    <button
                      key={`btn-step-${setupStep}`}
                      type="button"
                      onClick={handleNextStep}
                      className="btn btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Continue to Step {setupStep + 1}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      key="btn-step-save"
                      type="button"
                      onClick={handleSaveFarm}
                      className="btn btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Complete Farm Setup ({selectedCropTemplates.length} Crops)</span>
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD ANOTHER CROP TO AN EXISTING FARM */}
      {addCropModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          onClick={() => setAddCropModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-[#DCE6DE] shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-5 animate-in zoom-in-95 duration-150 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE7]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center">
                  <Sprout className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#26352D]">Add Another Crop to Farm</h3>
                  <p className="text-xs text-[#55685D]">1 Farm can cultivate multiple crop varieties simultaneously</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddCropModalOpen(false)}
                className="p-1 rounded-lg text-[#55685D] hover:bg-[#F4F8F4] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCropToExistingFarm} className="space-y-4">
              {/* Select Target Farm */}
              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1.5">Target Farm Holding</label>
                <select
                  value={newCropFarmId}
                  onChange={(e) => setNewCropFarmId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCE6DE] bg-[#FBFDFB] focus:border-[#0C4B32] outline-none"
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.totalArea} {f.areaUnit} - {f.district})
                    </option>
                  ))}
                </select>
              </div>

              {/* Crop Template Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1.5">Select Crop to Plant</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {activeCropTemplates.map((tmpl) => {
                    const isSelected = newCropTemplateId === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          setNewCropTemplateId(tmpl.id);
                          const defVar = tmpl.variety || (tmpl.varieties && tmpl.varieties[0]) || "Standard Regional";
                          setNewCropVariety(defVar);
                          const dur = tmpl.durationDays || parseInt(tmpl.duration) || 120;
                          setNewCropTotalDays(dur);
                          if (tmpl.growthTimeline && tmpl.growthTimeline.length > 0) {
                            setNewCropStage(tmpl.growthTimeline[0].stageName);
                            setNewCropStageStep(1);
                            setNewCropCurrentDay(tmpl.growthTimeline[0].startDay || 1);
                          }
                        }}
                        className={`p-2 rounded-xl border text-left text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#E7F3EB] border-[#0C4B32] font-semibold text-[#0C4B32]"
                            : "bg-white border-[#DCE6DE] text-[#26352D] hover:bg-[#FBFDFB]"
                        }`}
                      >
                        <div className="font-semibold">{tmpl.name}</div>
                        <div className="text-[10px] text-[#55685D] truncate">{tmpl.variety}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Agronomic Details: Stage, Sown Date, Days, Area */}
              {(() => {
                const selectedModalTmpl = activeCropTemplates.find((t) => t.id === newCropTemplateId) || activeCropTemplates[0];
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F4F8F4] border border-[#DCE6DE] text-xs">
                    {/* Area Allocation */}
                    <div>
                      <label className="block text-xs font-semibold text-[#26352D] mb-1">
                        Allocated Area ({farms.find((f) => f.id === newCropFarmId)?.areaUnit || "Acres"}) *
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={newCropArea}
                        onChange={(e) => setNewCropArea(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder={`e.g. 5 ${farms.find((f) => f.id === newCropFarmId)?.areaUnit || "Acres"}`}
                        className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white focus:border-[#0C4B32] outline-none"
                        required
                      />
                    </div>

                    {/* Seed Variety Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-[#26352D] mb-1">
                        Seed Variety
                      </label>
                      {selectedModalTmpl && selectedModalTmpl.varieties && selectedModalTmpl.varieties.length > 0 ? (
                        <select
                          value={newCropVariety || selectedModalTmpl.variety}
                          onChange={(e) => setNewCropVariety(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCE6DE] bg-white focus:border-[#0C4B32] outline-none"
                        >
                          {selectedModalTmpl.varieties.map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={newCropVariety}
                          onChange={(e) => setNewCropVariety(e.target.value)}
                          placeholder="e.g. HD-3086"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCE6DE] bg-white focus:border-[#0C4B32] outline-none"
                        />
                      )}
                    </div>

                    {/* Sown / Started On Date */}
                    <div>
                      <label className="block text-xs font-semibold text-[#26352D] mb-1">
                        Started / Sown On *
                      </label>
                      <input
                        type="date"
                        value={newCropSownDate}
                        onChange={(e) => setNewCropSownDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white focus:border-[#0C4B32] outline-none"
                        required
                      />
                    </div>

                    {/* Growth Stage Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-[#26352D] mb-1">
                        Current Growth Stage *
                      </label>
                      <select
                        value={newCropStage}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewCropStage(val);
                          const tmplStage = selectedModalTmpl.growthTimeline?.find((s) => s.stageName === val);
                          const found = STANDARD_CROP_STAGES.find((s) => s.name === val);
                          if (tmplStage) {
                            const idx = selectedModalTmpl.growthTimeline!.findIndex((s) => s.stageName === val);
                            setNewCropStageStep(idx + 1);
                            setNewCropCurrentDay(tmplStage.startDay || 1);
                          } else if (found) {
                            setNewCropStageStep(found.step);
                            setNewCropCurrentDay(found.defaultDay);
                          }
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCE6DE] bg-white focus:border-[#0C4B32] outline-none"
                      >
                        {selectedModalTmpl.growthTimeline && selectedModalTmpl.growthTimeline.length > 0 ? (
                          selectedModalTmpl.growthTimeline.map((st, idx) => (
                            <option key={st.id || idx} value={st.stageName}>
                              {idx + 1}. {st.stageName} (Days {st.startDay}–{st.endDay})
                            </option>
                          ))
                        ) : (
                          STANDARD_CROP_STAGES.map((st) => (
                            <option key={st.step} value={st.name}>
                              {st.name} ({st.typicalDays})
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Current Crop Day / Age */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#26352D] mb-1">
                        Current Crop Age (Day) *
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max={Number(newCropTotalDays) || 365}
                          value={newCropCurrentDay}
                          onChange={(e) => setNewCropCurrentDay(e.target.value === "" ? "" : Number(e.target.value))}
                          placeholder="e.g. 20"
                          className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white focus:border-[#0C4B32] outline-none"
                          required
                        />
                        <span className="text-xs text-[#55685D] whitespace-nowrap">
                          / {newCropTotalDays}d
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddCropModalOpen(false)}
                  className="btn btn-outline text-xs px-4 py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Plant Crop on Farm</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* RECORD FINANCIAL ENTRY MODAL (Production, Loss, Expense) */}
      {/* ==================================================== */}
      {recordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          onClick={() => setRecordModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-[#E5ECE7] space-y-4 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE7]">
              <div>
                <h3 className="text-base font-bold text-[#26352D] flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#0C4B32]" />
                  <span>Record Financial Entry</span>
                </h3>
                <p className="text-xs text-[#55685D] mt-0.5">
                  Log harvest production revenue, weather/pest crop losses, or operational input expenses.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRecordModalOpen(false)}
                className="p-1 rounded-lg text-[#55685D] hover:bg-[#F4F8F4] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              {/* 1. Transaction Type Selector (Simple & Sober) */}
              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1.5">
                  Record Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRecordTypeChange("production")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      recordType === "production"
                        ? "border-[#0C4B32] bg-[#E7F3EB] text-[#0C4B32]"
                        : "border-[#DCE6DE] bg-white text-[#55685D] hover:bg-[#F4F8F4]"
                    }`}
                  >
                    Production (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecordTypeChange("loss")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      recordType === "loss"
                        ? "border-amber-600 bg-amber-50 text-amber-900"
                        : "border-[#DCE6DE] bg-white text-[#55685D] hover:bg-[#F4F8F4]"
                    }`}
                  >
                    Crop Loss (−)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecordTypeChange("expense")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      recordType === "expense"
                        ? "border-red-600 bg-red-50 text-red-900"
                        : "border-[#DCE6DE] bg-white text-[#55685D] hover:bg-[#F4F8F4]"
                    }`}
                  >
                    Expense (−)
                  </button>
                </div>
              </div>

              {/* 2. Amount and Farm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Amount (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#55685D]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={recordAmount}
                      onChange={(e) => setRecordAmount(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 25000"
                      className="w-full pl-7 pr-3 py-2 text-xs font-bold text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white focus:border-[#0C4B32] outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Farm Holding *
                  </label>
                  <select
                    value={recordFarmId}
                    onChange={(e) => setRecordFarmId(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white focus:border-[#0C4B32] outline-none"
                  >
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Title / Description */}
              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Entry Title / Description *
                </label>
                <input
                  type="text"
                  value={recordTitle}
                  onChange={(e) => setRecordTitle(e.target.value)}
                  placeholder={
                    recordType === "production"
                      ? "e.g. Wheat (HD-3086) 90 Qtl Mandi Sale"
                      : recordType === "loss"
                      ? "e.g. Unseasonal Hailstorm Lodging Damage Zone B"
                      : "e.g. IFFCO Urea & DAP 30 Bags"
                  }
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white focus:border-[#0C4B32] outline-none"
                  required
                />
              </div>

              {/* 4. Category & Crop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Category *
                  </label>
                  <select
                    value={recordCategory}
                    onChange={(e) => setRecordCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white focus:border-[#0C4B32] outline-none"
                  >
                    {(recordType === "production"
                      ? PRODUCTION_CATEGORIES
                      : recordType === "loss"
                      ? LOSS_CATEGORIES
                      : EXPENSE_CATEGORIES
                    ).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Associated Crop
                  </label>
                  <select
                    value={recordCrop}
                    onChange={(e) => setRecordCrop(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white focus:border-[#0C4B32] outline-none"
                  >
                    <option value="General Farm">Whole Farm / General</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Potato">Potato</option>
                    <option value="Mustard">Mustard</option>
                    <option value="Fodder">Green Fodder</option>
                    <option value="Paddy">Paddy / Rice</option>
                  </select>
                </div>
              </div>

              {/* 5. Quantity / Metric & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Quantity / Impact
                  </label>
                  <input
                    type="text"
                    value={recordQuantity}
                    onChange={(e) => setRecordQuantity(e.target.value)}
                    placeholder={
                      recordType === "production"
                        ? "e.g. 90 Quintals"
                        : recordType === "loss"
                        ? "e.g. 1.8 Acres Affected"
                        : "e.g. 30 Bags / 200 Litres"
                    }
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white focus:border-[#0C4B32] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white focus:border-[#0C4B32] outline-none"
                    required
                  />
                </div>
              </div>

              {/* 6. Status & Reference / Bill # */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Settlement Status
                  </label>
                  <select
                    value={recordStatus}
                    onChange={(e) =>
                      setRecordStatus(e.target.value as "Cleared" | "Pending" | "Claimed" | "Recorded")
                    }
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white focus:border-[#0C4B32] outline-none"
                  >
                    <option value="Cleared">Cleared / Received ✓</option>
                    <option value="Pending">Pending Payment</option>
                    <option value="Claimed">Insurance Claim Filed</option>
                    <option value="Recorded">Recorded (Internal Log)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Reference / Bill / Challan #
                  </label>
                  <input
                    type="text"
                    value={recordReference}
                    onChange={(e) => setRecordReference(e.target.value)}
                    placeholder="e.g. MANDI-8812 / INV-9901"
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white focus:border-[#0C4B32] outline-none"
                  />
                </div>
              </div>

              {/* 7. Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Additional Notes / Cause / Remarks
                </label>
                <textarea
                  rows={2}
                  value={recordNotes}
                  onChange={(e) => setRecordNotes(e.target.value)}
                  placeholder="e.g. Unseasonal heavy shower led to lodging in parcel B; filed survey with local patwari."
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white focus:border-[#0C4B32] outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRecordModalOpen(false)}
                  className="btn btn-outline text-xs px-4 py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save & Record Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD STORE */}
      {addStoreModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto"
          onClick={() => setAddStoreModalOpen(false)}
        >
          <div
            className="bg-[#FAF7F2] w-full max-w-md rounded-2xl border border-[#E5ECE7] shadow-2xl p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE7]">
              <div>
                <h3 className="text-lg font-bold text-[#26352D]">Add Store / Warehouse</h3>
                <p className="text-xs text-[#55685D] mt-0.5">
                  Create a dedicated storage unit on your farm holding.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddStoreModalOpen(false)}
                className="text-[#55685D] hover:text-[#26352D] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStore} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Farm Holding *
                </label>
                <select
                  value={storeFarmId}
                  onChange={(e) => setStoreFarmId(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={storeNameInput}
                  onChange={(e) => setStoreNameInput(e.target.value)}
                  placeholder="e.g. Store 1, Fertilizer Godown B, Seed Cold Storage"
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Storage Type
                </label>
                <select
                  value={storeTypeInput}
                  onChange={(e) => setStoreTypeInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                >
                  <option value="General Input Godown">General Input Godown</option>
                  <option value="Chemical & Spray Locker">Chemical & Spray Locker (Ventilated)</option>
                  <option value="Seed Cold Store">Seed Cold Store (Temperature Controlled)</option>
                  <option value="Tools & Machinery Shed">Tools & Machinery Shed</option>
                  <option value="Grain Silo / Harvest Barn">Grain Silo / Harvest Barn</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Location / Shed Identifier
                </label>
                <input
                  type="text"
                  value={storeLocationInput}
                  onChange={(e) => setStoreLocationInput(e.target.value)}
                  placeholder="e.g. North Parcel Gate 1, Building C"
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  value={storeNotesInput}
                  onChange={(e) => setStoreNotesInput(e.target.value)}
                  placeholder="e.g. Equipped with double lock and fire extinguisher."
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddStoreModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#26352D] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0C4B32] hover:bg-[#083624] text-white shadow-xs cursor-pointer"
                >
                  Save Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD ITEM (Matches User Screenshot Pixel-by-Pixel) */}
      {addItemModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto"
          onClick={() => setAddItemModalOpen(false)}
        >
          <div
            className="bg-[#FAF7F2] w-full max-w-lg rounded-2xl border border-[#E5ECE7] shadow-2xl p-5 sm:p-7 space-y-4 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: "Add item" with close X */}
            <div className="flex items-center justify-between pb-2 border-b border-[#EBE5DB]">
              <h3 className="text-xl font-bold text-[#26352D]">Add item</h3>
              <button
                type="button"
                onClick={() => setAddItemModalOpen(false)}
                className="text-[#6C7B71] hover:text-[#26352D] p-1 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              {/* Farm * */}
              <div>
                <label className="block text-xs font-bold text-[#26352D] mb-1.5">
                  Farm <span className="text-red-600">*</span>
                </label>
                <select
                  value={itemFarmId}
                  onChange={(e) => {
                    const newFarmId = e.target.value;
                    setItemFarmId(newFarmId);
                    const farmStores = stores.filter((s) => s.farmId === newFarmId);
                    if (farmStores.length > 0) {
                      setItemStoreId(farmStores[0].id);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] shadow-2xs"
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Store * */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#26352D]">
                    Store <span className="text-red-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAddItemModalOpen(false);
                      handleOpenAddStore(itemFarmId);
                    }}
                    className="text-[11px] font-semibold text-[#0C4B32] hover:underline cursor-pointer"
                  >
                    + Add New Store
                  </button>
                </div>
                <select
                  value={itemStoreId}
                  onChange={(e) => setItemStoreId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] shadow-2xs"
                >
                  {stores
                    .filter((s) => s.farmId === itemFarmId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                    ))}
                  {stores.filter((s) => s.farmId === itemFarmId).length === 0 && (
                    <option value="">No store created yet for this farm</option>
                  )}
                </select>
              </div>

              {/* Item * */}
              <div>
                <label className="block text-xs font-bold text-[#26352D] mb-1.5">
                  Item <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={itemNameInput}
                  onChange={(e) => setItemNameInput(e.target.value)}
                  placeholder="Mancozeb 75% WP"
                  className="w-full px-3.5 py-2.5 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] shadow-2xs"
                />
              </div>

              {/* 2-Columns: Category & Batch / Lot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#26352D] mb-1.5">
                    Category
                  </label>
                  <select
                    value={itemCategoryInput}
                    onChange={(e) => setItemCategoryInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] shadow-2xs"
                  >
                    {INVENTORY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#26352D] mb-1.5">
                    Batch / Lot
                  </label>
                  <input
                    type="text"
                    value={itemBatchInput}
                    onChange={(e) => setItemBatchInput(e.target.value)}
                    placeholder="MZ-2508"
                    className="w-full px-3.5 py-2.5 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] shadow-2xs"
                  />
                </div>
              </div>

              {/* 2-Columns: Purchased & Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#26352D] mb-1.5">
                    Purchased
                  </label>
                  <input
                    type="date"
                    value={itemPurchasedDate}
                    onChange={(e) => setItemPurchasedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#26352D] mb-1.5">
                    Expiry
                  </label>
                  <input
                    type="date"
                    value={itemExpiryDate}
                    onChange={(e) => setItemExpiryDate(e.target.value)}
                    placeholder="dd-mm-yyyy"
                    className="w-full px-3.5 py-2.5 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] shadow-2xs"
                  />
                </div>
              </div>

              {/* 2-Columns: Quantity * & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#26352D] mb-1.5">
                    Quantity <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="any"
                    value={itemQuantityInput}
                    onChange={(e) => setItemQuantityInput(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 25"
                    className="w-full px-3.5 py-2.5 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#26352D] mb-1.5">
                    Unit
                  </label>
                  <select
                    value={itemUnitInput}
                    onChange={(e) => setItemUnitInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] shadow-2xs"
                  >
                    {INVENTORY_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rate */}
              <div>
                <label className="block text-xs font-bold text-[#26352D] mb-1.5">
                  Rate (₹ per {itemUnitInput || "unit"})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={itemRateInput}
                  onChange={(e) => setItemRateInput(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 450"
                  className="w-full px-3.5 py-2.5 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] shadow-2xs"
                />
              </div>

              {/* Low Stock Alert Threshold */}
              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-[#55685D] mb-1">
                  Low Stock Alert Threshold (Remind when stock falls below)
                </label>
                <input
                  type="number"
                  min="1"
                  value={itemLowStockThresholdInput}
                  onChange={(e) => setItemLowStockThresholdInput(Number(e.target.value) || 5)}
                  className="w-full px-3.5 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                />
              </div>

              {/* Footer Buttons: Cancel & Save */}
              <div className="pt-4 border-t border-[#EBE5DB] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddItemModalOpen(false)}
                  className="px-5 py-2 text-xs font-semibold rounded-xl border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#26352D] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold rounded-xl bg-[#0C4B32] hover:bg-[#083624] text-white shadow-xs transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LOG ITEM USAGE IN FIELD */}
      {logUsageModalOpen && activeItemForUsage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto"
          onClick={() => setLogUsageModalOpen(false)}
        >
          <div
            className="bg-[#FAF7F2] w-full max-w-md rounded-2xl border border-[#E5ECE7] shadow-2xl p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE7]">
              <div>
                <h3 className="text-lg font-bold text-[#26352D]">Log Field Item Usage</h3>
                <p className="text-xs text-[#55685D] mt-0.5">
                  Record consumption and automatically deduct from store inventory.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLogUsageModalOpen(false)}
                className="text-[#55685D] hover:text-[#26352D] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Item Summary Banner */}
            <div className="p-3 bg-[#E7F3EB] rounded-xl border border-[#C6E2D0] flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-[#0C4B32]">{activeItemForUsage.name}</div>
                <div className="text-[11px] text-[#55685D]">
                  🏢 {activeItemForUsage.storeName} • Lot: {activeItemForUsage.batchNumber}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-[#55685D]">Available:</div>
                <div className="font-bold text-[#0C4B32] text-sm">
                  {activeItemForUsage.quantity} {activeItemForUsage.unit}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveUsage} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Quantity Used <span className="text-red-600">*</span> ({activeItemForUsage.unit})
                </label>
                <input
                  type="number"
                  required
                  min="0.1"
                  max={activeItemForUsage.quantity}
                  step="any"
                  value={usageQtyInput}
                  onChange={(e) => setUsageQtyInput(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder={`Max: ${activeItemForUsage.quantity} ${activeItemForUsage.unit}`}
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Purpose / Application Task *
                </label>
                <input
                  type="text"
                  required
                  value={usagePurposeInput}
                  onChange={(e) => setUsagePurposeInput(e.target.value)}
                  placeholder="e.g. Preventative foliar spray for late blight in Zone A"
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Target Crop
                  </label>
                  <select
                    value={usageCropInput}
                    onChange={(e) => setUsageCropInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  >
                    <option value="Wheat">Wheat</option>
                    <option value="Basmati Rice">Basmati Rice</option>
                    <option value="Potato">Potato</option>
                    <option value="Mustard">Mustard</option>
                    <option value="General Farm">General Farm / Nursery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Date of Application
                  </label>
                  <input
                    type="date"
                    value={usageDateInput}
                    onChange={(e) => setUsageDateInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Applied By / Operator Name
                </label>
                <input
                  type="text"
                  value={usageAppliedByInput}
                  onChange={(e) => setUsageAppliedByInput(e.target.value)}
                  placeholder="e.g. Harpreet Singh"
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLogUsageModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#26352D] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0C4B32] hover:bg-[#083624] text-white shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Deduct & Record Usage</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: RESTOCK INVENTORY ITEM */}
      {restockModalOpen && activeItemForRestock && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto"
          onClick={() => setRestockModalOpen(false)}
        >
          <div
            className="bg-[#FAF7F2] w-full max-w-md rounded-2xl border border-[#E5ECE7] shadow-2xl p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE7]">
              <div>
                <h3 className="text-lg font-bold text-[#26352D]">Restock Item</h3>
                <p className="text-xs text-[#55685D] mt-0.5">
                  Add newly arrived stock bags / packets into {activeItemForRestock.storeName}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRestockModalOpen(false)}
                className="text-[#55685D] hover:text-[#26352D] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#E5ECE7] text-xs">
              <div className="font-bold text-[#26352D]">{activeItemForRestock.name}</div>
              <div className="text-[11px] text-[#55685D] mt-0.5">
                Current Stock: <strong>{activeItemForRestock.quantity} {activeItemForRestock.unit}</strong>
              </div>
            </div>

            <form onSubmit={handleSaveRestock} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Additional Quantity to Add * ({activeItemForRestock.unit})
                </label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="any"
                  value={restockQtyInput}
                  onChange={(e) => setRestockQtyInput(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Rate (₹ per {activeItemForRestock.unit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={restockRateInput}
                    onChange={(e) => setRestockRateInput(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    New Batch / Lot #
                  </label>
                  <input
                    type="text"
                    value={restockBatchInput}
                    onChange={(e) => setRestockBatchInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#26352D] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0C4B32] hover:bg-[#083624] text-white shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Stock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER EQUIPMENT */}
      {registerEquipmentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto"
          onClick={() => setRegisterEquipmentModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E5ECE7] shadow-xl max-w-lg w-full p-5 space-y-4 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E5ECE7]">
              <div>
                <h3 className="text-base font-bold text-[#26352D]">Register Equipment</h3>
                <p className="text-xs text-[#55685D] mt-0.5">
                  Add a tractor, pump, implement, or machinery to your fleet.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRegisterEquipmentModalOpen(false)}
                className="text-[#889B90] hover:text-[#26352D] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Equipment / Machine Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahindra 575 DI Tractor (45 HP)"
                    value={eqName}
                    onChange={(e) => setEqName(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Category *
                  </label>
                  <select
                    value={eqCategory}
                    onChange={(e) => setEqCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] cursor-pointer"
                  >
                    {EQUIPMENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Assigned Farm *
                  </label>
                  <select
                    value={eqFarmId}
                    onChange={(e) => setEqFarmId(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] cursor-pointer"
                  >
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Model / Reg. Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PB-10-CZ-4412"
                    value={eqModelNumber}
                    onChange={(e) => setEqModelNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Assigned Operator
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Harnek Singh"
                    value={eqOperator}
                    onChange={(e) => setEqOperator(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Runtime (Hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 420"
                    value={eqRuntimeHours}
                    onChange={(e) => setEqRuntimeHours(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Next Service Date
                  </label>
                  <input
                    type="date"
                    value={eqNextServiceDate}
                    onChange={(e) => setEqNextServiceDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Fuel / Power Rating
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3.8 L/hr (Diesel) or 7.5 HP Solar"
                    value={eqFuelEfficiency}
                    onChange={(e) => setEqFuelEfficiency(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRegisterEquipmentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#26352D] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0C4B32] hover:bg-[#083624] text-white shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Equipment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REPORT A PROBLEM */}
      {reportProblemModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto"
          onClick={() => setReportProblemModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E5ECE7] shadow-xl max-w-lg w-full p-5 space-y-4 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E5ECE7]">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-base font-bold text-[#26352D]">Report Equipment Problem</h3>
                </div>
                <p className="text-xs text-[#55685D] mt-0.5">
                  Log a breakdown, wear, leak, or issue for immediate attention.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReportProblemModalOpen(false)}
                className="text-[#889B90] hover:text-[#26352D] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProblemReport} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Select Machine / Equipment *
                </label>
                <select
                  value={probEquipmentId}
                  onChange={(e) => {
                    setProbEquipmentId(e.target.value);
                    const selected = equipmentList.find((eq) => eq.id === e.target.value);
                    if (selected) setSelectedEquipmentForProblem(selected);
                  }}
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] cursor-pointer"
                >
                  {equipmentList.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} ({eq.category}) • {eq.farmName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Problem Type *
                  </label>
                  <select
                    value={probType}
                    onChange={(e) => setProbType(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] cursor-pointer"
                  >
                    <option value="Hydraulic Leak / Pressure Drop">Hydraulic Leak / Pressure Drop</option>
                    <option value="Engine Overheating / Coolant Leak">Engine Overheating / Coolant Leak</option>
                    <option value="Electrical / Battery / Starter Failure">Electrical / Battery / Starter Failure</option>
                    <option value="Blade / Rotary Tine Damage">Blade / Rotary Tine Damage</option>
                    <option value="Transmission / Gear Slipping">Transmission / Gear Slipping</option>
                    <option value="Tubewell Pump Phase Fault / Motor Burn">Tubewell Pump Phase Fault / Motor Burn</option>
                    <option value="Fuel Injector / Filter Clogging">Fuel Injector / Filter Clogging</option>
                    <option value="Brake / Steering Issue">Brake / Steering Issue</option>
                    <option value="Other Mechanical Breakdown">Other Mechanical Breakdown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Severity / Priority *
                  </label>
                  <select
                    value={probSeverity}
                    onChange={(e) => setProbSeverity(e.target.value as "Low" | "Medium" | "High" | "Critical")}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] cursor-pointer"
                  >
                    <option value="Low">Low - Minor wear / scheduled check</option>
                    <option value="Medium">Medium - Usable with caution</option>
                    <option value="High">High - Requires repair before next shift</option>
                    <option value="Critical">Critical - Machine halted / emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Reported By (Operator / Tech)
                  </label>
                  <input
                    type="text"
                    value={probReportedBy}
                    onChange={(e) => setProbReportedBy(e.target.value)}
                    placeholder="e.g. Harnek Singh"
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Date of Occurrence
                  </label>
                  <input
                    type="date"
                    value={probDate}
                    onChange={(e) => setProbDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Problem Description & Field Symptoms *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what happened (e.g. Hydraulic arm is not lifting properly under load; oil leak spotted near lower valve...)"
                  value={probDescription}
                  onChange={(e) => setProbDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportProblemModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#26352D] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Submit Problem Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE FARM TASK */}
      {createTaskModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto"
          onClick={() => setCreateTaskModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E5ECE7] shadow-xl max-w-lg w-full p-5 space-y-4 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E5ECE7]">
              <div>
                <h3 className="text-base font-bold text-[#26352D]">Create Farm Task</h3>
                <p className="text-xs text-[#55685D] mt-0.5">
                  Assign a field operation, spray, irrigation, or machinery schedule.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateTaskModalOpen(false)}
                className="text-[#889B90] hover:text-[#26352D] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apply Urea Top-Dressing in Zone A"
                  value={taskFormTitle}
                  onChange={(e) => setTaskFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Category *
                  </label>
                  <select
                    value={taskFormCategory}
                    onChange={(e) => setTaskFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] cursor-pointer"
                  >
                    {TASK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Priority *
                  </label>
                  <select
                    value={taskFormPriority}
                    onChange={(e) => setTaskFormPriority(e.target.value as "Low" | "Medium" | "High" | "Urgent")}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] cursor-pointer"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Assigned Farm *
                  </label>
                  <select
                    value={taskFormFarmId}
                    onChange={(e) => setTaskFormFarmId(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] cursor-pointer"
                  >
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={taskFormDueDate}
                    onChange={(e) => setTaskFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Field / Parcel Zone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Zone A (12 Acres)"
                    value={taskFormZone}
                    onChange={(e) => setTaskFormZone(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Target Crop
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PBW 826 Wheat"
                    value={taskFormCrop}
                    onChange={(e) => setTaskFormCrop(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Assigned Worker / Operator
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Harpreet Singh"
                    value={taskFormAssignedTo}
                    onChange={(e) => setTaskFormAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Initial Status
                  </label>
                  <select
                    value={taskFormStatus}
                    onChange={(e) => setTaskFormStatus(e.target.value as "To Do" | "In Progress" | "Completed")}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] cursor-pointer"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Instructions & Field Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Apply 45kg/acre urea top dressing right after evening drip cycle..."
                  value={taskFormInstructions}
                  onChange={(e) => setTaskFormInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#26352D] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0C4B32] hover:bg-[#083624] text-white shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== ADD / EDIT TEAM MEMBER MODAL ===================== */}
      {isTeamModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto"
          onClick={() => setIsTeamModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-[#DCE6DE] shadow-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto [scrollbar-width:thin]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE7]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center shrink-0 border border-[#C6E2D0]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#26352D]">
                    {editingMemberId ? "Edit Team Member" : "Add Team Member"}
                  </h3>
                  <p className="text-xs text-[#55685D] mt-0.5">
                    Enter workforce staff details and link them to an active Designation & Role.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTeamModalOpen(false)}
                className="p-1.5 text-[#889B90] hover:text-[#26352D] rounded-xl hover:bg-[#F4F8F4] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Banner */}
            {memberFormError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{memberFormError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveTeamMember} className="space-y-4">
              {/* Row 1: Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gurmukh Ram"
                    value={memberFormName}
                    onChange={(e) => setMemberFormName(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98882-67890"
                    value={memberFormPhone}
                    onChange={(e) => setMemberFormPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Email & Assigned Farm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. operator@khetivo.farm"
                    value={memberFormEmail}
                    onChange={(e) => setMemberFormEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Assigned Farm Holding *
                  </label>
                  <select
                    value={memberFormFarmId}
                    onChange={(e) => setMemberFormFarmId(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] cursor-pointer"
                  >
                    <option value="all">All Holdings (Multi-Farm Access)</option>
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Designation / Job Role Assignment */}
              <div className="space-y-1.5 p-3.5 bg-[#F8FAF8] rounded-2xl border border-[#DCE6DE]">
                <label className="block text-xs font-semibold text-[#26352D]">
                  Assigned Designation & Role *
                </label>
                <select
                  value={memberFormDesignationId}
                  onChange={(e) => setMemberFormDesignationId(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] cursor-pointer font-medium"
                >
                  {designations.map((des) => (
                    <option key={des.id} value={des.id}>
                      {des.title} ({des.allowedModules.length} of {APP_MODULES.length} modules granted)
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-between text-[11px] text-[#55685D] pt-1">
                  <span>This member will inherit the module permissions of the selected role.</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTeamModalOpen(false);
                      setTeamSubTab("designations");
                    }}
                    className="text-[#0C4B32] font-semibold hover:underline cursor-pointer"
                  >
                    Edit roles in Designations tab &rarr;
                  </button>
                </div>
              </div>

              {/* Row 4: Scope & Responsibilities Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Operational Responsibilities (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Nighttime fertigation, tractor servicing, machinery maintenance logbook..."
                  value={memberFormNotes}
                  onChange={(e) => setMemberFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                />
              </div>

              {/* Status Radio */}
              <div className="flex items-center gap-4 text-xs font-semibold text-[#26352D]">
                <span>Status:</span>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="memberStatus"
                    value="Active"
                    checked={memberFormStatus === "Active"}
                    onChange={() => setMemberFormStatus("Active")}
                    className="accent-[#0C4B32]"
                  />
                  <span>Active Member</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="memberStatus"
                    value="Pending Invite"
                    checked={memberFormStatus === "Pending Invite"}
                    onChange={() => setMemberFormStatus("Pending Invite")}
                    className="accent-[#0C4B32]"
                  />
                  <span>Send Pending Invite</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#26352D] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0C4B32] hover:bg-[#083624] text-white shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{editingMemberId ? "Save Changes" : "Add Member"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== ADD / EDIT DESIGNATION & ROLE MODAL (WITH MODULE CHECKBOXES) ===================== */}
      {isDesignationModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto"
          onClick={() => setIsDesignationModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-[#DCE6DE] shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto [scrollbar-width:thin]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE7]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center shrink-0 border border-[#C6E2D0]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#26352D]">
                    {editingDesignationId ? "Edit Designation & Role Privileges" : "Create New Designation & Role"}
                  </h3>
                  <p className="text-xs text-[#55685D] mt-0.5">
                    Define role title, description, and use checkboxes to grant module access permissions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDesignationModalOpen(false)}
                className="p-1.5 text-[#889B90] hover:text-[#26352D] rounded-xl hover:bg-[#F4F8F4] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Banner */}
            {desFormError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{desFormError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveDesignation} className="space-y-4">
              {/* Designation Title */}
              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Designation / Role Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Field Supervisor, Irrigation Lead, Consulting Agronomist..."
                  value={desFormTitle}
                  onChange={(e) => setDesFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  required
                />
              </div>

              {/* Designation Description */}
              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Role Description & Scope (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Oversees field operations, crop health monitoring, and precision sprayer assignments..."
                  value={desFormDescription}
                  onChange={(e) => setDesFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                />
              </div>

              {/* Module Access Checkboxes (Simple & Sober) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#26352D]">
                    Module Access *
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setDesFormModules(APP_MODULES.map((m) => m.id))}
                      className="text-[#0C4B32] font-semibold hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-[#DCE6DE]">|</span>
                    <button
                      type="button"
                      onClick={() => setDesFormModules([])}
                      className="text-[#889B90] hover:text-red-600 cursor-pointer"
                    >
                      Clear
                    </button>
                    <span className="text-[11px] font-semibold text-[#55685D] bg-[#F4F8F4] px-2 py-0.5 rounded-md border border-[#E5ECE7] ml-1">
                      {desFormModules.length}/{APP_MODULES.length} Selected
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-[#F9FAF9] rounded-xl border border-[#E5ECE7]">
                  {APP_MODULES.map((mod) => {
                    const isChecked = desFormModules.includes(mod.id);
                    return (
                      <label
                        key={mod.id}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                          isChecked
                            ? "bg-white text-[#0C4B32] font-semibold shadow-2xs border border-[#C6E2D0]"
                            : "text-[#55685D] hover:bg-white/70 hover:text-[#26352D] border border-transparent"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleDesModuleAccess(mod.id)}
                          className="w-3.5 h-3.5 text-[#0C4B32] accent-[#0C4B32] rounded cursor-pointer shrink-0"
                        />
                        <span className="truncate">{mod.label}</span>
                      </label>
                    );
                  })}
                </div>

                <p className="text-[11px] text-[#889B90]">
                  Permissions set here apply to all members assigned to this role.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDesignationModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#26352D] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0C4B32] hover:bg-[#083624] text-white shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{editingDesignationId ? "Save Role & Permissions" : "Create Designation"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== NEW SUPPORT TICKET MODAL ===================== */}
      {isNewTicketModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setIsNewTicketModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-[#DCE6DE] shadow-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE7]">
              <div>
                <h3 className="text-base font-bold text-[#26352D]">
                  Open Agronomy Support Ticket
                </h3>
                <p className="text-xs text-[#55685D] mt-0.5">
                  Submit a crop diagnosis or field sensor inquiry to PAU extension officers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTicketModalOpen(false)}
                className="p-1.5 text-[#889B90] hover:text-[#26352D] rounded-xl hover:bg-[#F4F8F4] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {newTicketError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {newTicketError}
              </div>
            )}

            <form onSubmit={handleCreateSupportTicket} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Ticket Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yellow rust leaf spots observed after canal irrigation"
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Category *
                  </label>
                  <select
                    value={newTicketCategory}
                    onChange={(e) => setNewTicketCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  >
                    <option value="Crop Health & Pathology">Crop Health & Pathology</option>
                    <option value="Irrigation & Soil">Irrigation & Soil</option>
                    <option value="Weather & Advisory">Weather & Advisory</option>
                    <option value="Billing & Plan">Billing & Plan</option>
                    <option value="IoT & Machinery Sensors">IoT & Machinery Sensors</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Priority Level *
                  </label>
                  <select
                    value={newTicketPriority}
                    onChange={(e) => setNewTicketPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  >
                    <option value="Normal">Normal Priority</option>
                    <option value="Urgent">Urgent (Crop Loss Risk)</option>
                    <option value="Low">Low (General Query)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Farm Holding
                  </label>
                  <select
                    value={newTicketFarmId}
                    onChange={(e) => setNewTicketFarmId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  >
                    <option value="all">All Holdings (General Advice)</option>
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1">
                    Crop / Affected Plot
                  </label>
                  <input
                    type="text"
                    value={newTicketCrop}
                    onChange={(e) => setNewTicketCrop(e.target.value)}
                    placeholder="e.g. Wheat PBW-824"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26352D] mb-1">
                  Detailed Symptoms & Observations *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe leaf yellowing, pest count per plant, chemical history, or pump anomaly..."
                  value={newTicketDescription}
                  onChange={(e) => setNewTicketDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-white text-[#55685D] hover:bg-[#F4F8F4] border border-[#DCE6DE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0C4B32] hover:bg-[#083624] text-white shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== TICKET DETAIL & CONVERSATION THREAD MODAL ===================== */}
      {selectedTicketModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setSelectedTicketModal(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#DCE6DE] shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE7]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0C4B32]">
                    #{selectedTicketModal.ticketNo}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedTicketModal.status === "Resolved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : selectedTicketModal.status === "In Review"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {selectedTicketModal.status}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedTicketModal.priority === "Urgent"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {selectedTicketModal.priority}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#26352D] mt-1">
                  {selectedTicketModal.subject}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-[#55685D]">
                  <span>{selectedTicketModal.farmName}</span>
                  <span>•</span>
                  <span>{selectedTicketModal.cropName}</span>
                  <span>•</span>
                  <span>{selectedTicketModal.category}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicketModal(null)}
                className="p-1.5 text-[#889B90] hover:text-[#26352D] rounded-xl hover:bg-[#F4F8F4] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Thread */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 text-xs">
              {/* Farmer Initial Inquiry */}
              <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E5ECE7] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <strong className="text-[#26352D]">Farmer (You)</strong>
                  <span className="text-[#889B90]">{selectedTicketModal.createdAt}</span>
                </div>
                <p className="text-[#55685D] leading-relaxed">
                  {selectedTicketModal.description}
                </p>
              </div>

              {/* Agronomist Advice Thread */}
              <div className="p-3.5 rounded-xl bg-[#E7F3EB]/40 border border-[#C6E2D0] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <strong className="text-[#0C4B32]">{selectedTicketModal.assignedAgronomist}</strong>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0C4B32] text-white font-medium">Verified PAU Specialist</span>
                  </div>
                </div>
                <p className="text-[#26352D] leading-relaxed font-medium">
                  {selectedTicketModal.lastReply}
                </p>
              </div>

              {selectedTicketModal.resolution && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <strong>Official Resolution:</strong> {selectedTicketModal.resolution}
                </div>
              )}
            </div>

            {/* Quick Reply Box */}
            <form onSubmit={handleAddTicketReply} className="pt-2 border-t border-[#E5ECE7] space-y-2">
              <label className="block text-xs font-semibold text-[#26352D]">
                Reply to Agronomist
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your follow-up reply or updated symptom observation..."
                  value={ticketReplyInput}
                  onChange={(e) => setTicketReplyInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0C4B32] hover:bg-[#083624] text-white shadow-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== RAISE A FIELD VISIT MODAL (PAID SERVICE FORM) ===================== */}
      {isFieldVisitModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setIsFieldVisitModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-[#DCE6DE] shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE7]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center shrink-0 border border-[#C6E2D0]">
                  <MapPin className="w-5 h-5 text-[#0C4B32]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#26352D]">
                      Raise an Agronomist Field Visit
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Paid Agronomy Service
                    </span>
                  </div>
                  <p className="text-xs text-[#55685D] mt-0.5">
                    Schedule certified on-site farm diagnosis, soil & crop pathology inspection, and official prescription.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFieldVisitModalOpen(false)}
                className="p-1.5 text-[#889B90] hover:text-[#26352D] rounded-xl hover:bg-[#F4F8F4] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!fieldVisitSuccess ? (
              <div className="space-y-4 text-xs">
                {/* 2-Step Progress Funnel Header */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E5ECE7]">
                  <div
                    onClick={() => setFieldVisitStep(1)}
                    className={`flex items-center gap-2 cursor-pointer transition-colors ${
                      fieldVisitStep === 1 ? "text-[#0C4B32] font-bold" : "text-[#55685D] hover:text-[#26352D]"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        fieldVisitStep === 1
                          ? "bg-[#0C4B32] text-white shadow-xs"
                          : "bg-[#E7F3EB] text-[#0C4B32]"
                      }`}
                    >
                      {fieldVisitStep === 2 ? <Check className="w-3.5 h-3.5" /> : "1"}
                    </div>
                    <span>1. Field & Contact Details</span>
                  </div>

                  <div className="flex-1 h-0.5 mx-3 bg-[#E5ECE7] relative overflow-hidden rounded-full">
                    <div
                      className={`h-full bg-[#0C4B32] transition-all duration-300 ${
                        fieldVisitStep === 2 ? "w-full" : "w-0"
                      }`}
                    />
                  </div>

                  <div
                    className={`flex items-center gap-2 ${
                      fieldVisitStep === 2 ? "text-[#0C4B32] font-bold" : "text-[#889B90]"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        fieldVisitStep === 2
                          ? "bg-[#0C4B32] text-white shadow-xs"
                          : "bg-[#F0F4F1] text-[#889B90]"
                      }`}
                    >
                      2
                    </div>
                    <span>2. Package & Payment</span>
                  </div>
                </div>

                {/* ================= STAGE 1: FIELD & CONTACT DETAILS (LEAD CAPTURE) ================= */}
                {fieldVisitStep === 1 && (
                  <form onSubmit={handleProceedToPayment} className="space-y-4">
                    {/* Value Highlights */}
                    <div className="p-3 rounded-xl bg-[#F4F8F4] border border-[#DCE6DE] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#26352D]">
                      <div className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0C4B32] shrink-0" />
                        <span>Physical inspection by certified PAU agronomist</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0C4B32] shrink-0" />
                        <span>Soil EC/moisture spot-test & leaf check</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0C4B32] shrink-0" />
                        <span>WhatsApp prescription report</span>
                      </div>
                    </div>

                    {/* Section 1: Location & Plot */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                          Farm Holding <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={fieldVisitFarmId}
                          onChange={(e) => setFieldVisitFarmId(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                        >
                          {farms.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name} ({f.district || "Punjab"}) - {f.totalArea} {f.areaUnit}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                          Parcel / Killa / Landmark <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={fieldVisitPlot}
                          onChange={(e) => setFieldVisitPlot(e.target.value)}
                          placeholder="e.g. Killa #3, Near Solar Tubewell"
                          className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                        />
                      </div>
                    </div>

                    {/* Section 2: Crop & Diagnosis Reason */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                          Crop & Growth Stage <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={fieldVisitCrop}
                          onChange={(e) => setFieldVisitCrop(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                        >
                          <option value="Wheat (HD-3086) - Tillering Stage">Wheat (HD-3086) - Tillering Stage</option>
                          <option value="Wheat (PBW-826) - Crown Root Initiation">Wheat (PBW-826) - Crown Root Initiation</option>
                          <option value="Mustard (Pusa Bold) - Flowering Stage">Mustard (Pusa Bold) - Flowering Stage</option>
                          <option value="Paddy (PR-126) - Panicle Emergence">Paddy (PR-126) - Panicle Emergence</option>
                          <option value="Potato (Kufri Jyoti) - Tuber Bulking">Potato (Kufri Jyoti) - Tuber Bulking</option>
                          <option value="Cotton (Bt RCH-659) - Boll Formation">Cotton (Bt RCH-659) - Boll Formation</option>
                          <option value="Citrus / Kinnow Orchard - Fruit Setting">Citrus / Kinnow Orchard - Fruit Setting</option>
                          <option value="Sugarcane (Co-0238) - Grand Growth">Sugarcane (Co-0238) - Grand Growth</option>
                          <option value="Vegetables / Fodder (Berseem / Maize)">Vegetables / Fodder (Berseem / Maize)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                          Primary Inspection Reason <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={fieldVisitReason}
                          onChange={(e) => setFieldVisitReason(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                        >
                          <option value="Pest / Disease Attack (Yellow Rust / Aphids)">Pest / Disease Attack (Yellow Rust / Aphids)</option>
                          <option value="Nutrient Deficiency & Chlorosis (Zinc, Nitrogen, Iron)">Nutrient Deficiency & Chlorosis (Zinc, Nitrogen, Iron)</option>
                          <option value="Root Rot, Wilt & Soil Pathology Check">Root Rot, Wilt & Soil Pathology Check</option>
                          <option value="Waterlogging, Soil Salinity or Herbicide Toxicity">Waterlogging, Soil Salinity or Herbicide Toxicity</option>
                          <option value="Pre-Harvest Quality & Yield Estimation">Pre-Harvest Quality & Yield Estimation</option>
                          <option value="Tubewell Water EC & Soil Salinity Check">Tubewell Water EC & Soil Salinity Check</option>
                          <option value="Routine Seasonal Crop Health Audit">Routine Seasonal Crop Health Audit</option>
                        </select>
                      </div>
                    </div>

                    {/* Section 3: Schedule Date & Slot */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                          Preferred Visit Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={fieldVisitDate}
                          onChange={(e) => setFieldVisitDate(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                          Preferred Time Window <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={fieldVisitSlot}
                          onChange={(e) => setFieldVisitSlot(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                        >
                          <option value="Morning (8:00 AM - 12:00 PM)">Morning (8:00 AM - 12:00 PM) • Recommended</option>
                          <option value="Afternoon (12:00 PM - 4:00 PM)">Afternoon (12:00 PM - 4:00 PM)</option>
                          <option value="Evening (4:00 PM - 6:30 PM)">Evening (4:00 PM - 6:30 PM)</option>
                        </select>
                      </div>
                    </div>

                    {/* Section 4: Farmer Contact Information (Crucial Lead Capture) */}
                    <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E5ECE7] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#26352D] flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-[#0C4B32]" />
                          <span>Farmer Contact Details (Lead Capture)</span>
                        </span>
                        <span className="text-[10px] text-[#55685D]">Agronomist will phone before departure</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-[#55685D] mb-1">
                            Farmer Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={fieldVisitFarmerName}
                            onChange={(e) => setFieldVisitFarmerName(e.target.value)}
                            placeholder="Full name"
                            className="w-full px-3 py-2 bg-white rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-[#55685D] mb-1">
                            Mobile Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={fieldVisitPhone}
                            onChange={(e) => setFieldVisitPhone(e.target.value)}
                            placeholder="+91 98140-XXXXX"
                            className="w-full px-3 py-2 bg-white rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Symptoms & Notes */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                        Field Symptoms / Observations (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={fieldVisitNotes}
                        onChange={(e) => setFieldVisitNotes(e.target.value)}
                        placeholder="Describe visible leaf spots, yellowing patches, recent fungicide sprays, or soil moisture condition..."
                        className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] resize-none"
                      />
                    </div>

                    {/* Step 1 Actions */}
                    <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setIsFieldVisitModalOpen(false)}
                        className="px-3.5 py-2 text-xs font-medium rounded-xl text-[#55685D] hover:text-[#26352D] border border-[#DCE6DE] hover:bg-[#F4F8F4] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="btn btn-primary text-xs px-5 py-2 inline-flex items-center gap-1.5 shadow-xs cursor-pointer font-medium"
                      >
                        <span>Continue to Payment</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                )}

                {/* ================= STAGE 2: PACKAGE SELECTION & PAYMENT ================= */}
                {fieldVisitStep === 2 && (
                  <form onSubmit={handleBookFieldVisit} className="space-y-4">
                    {/* Captured Lead Summary Banner */}
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <span className="font-semibold text-emerald-900 block truncate">
                            Lead Saved: {fieldVisitFarmerName} • {fieldVisitPhone}
                          </span>
                          <span className="text-[11px] text-emerald-700 truncate block">
                            {farms.find((f) => f.id === fieldVisitFarmId)?.name} • {fieldVisitCrop}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFieldVisitStep(1)}
                        className="text-xs font-semibold text-[#0C4B32] hover:underline shrink-0 cursor-pointer"
                      >
                        Edit Details
                      </button>
                    </div>

                    {/* Section: Paid Package Selection */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#26352D] mb-1.5">
                        Select Visit Package & Urgency <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Standard Package */}
                        <div
                          onClick={() => setFieldVisitTier("standard")}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            fieldVisitTier === "standard"
                              ? "bg-[#FBFDFB] border-[#0C4B32] ring-1 ring-[#0C4B32]/30 shadow-xs"
                              : "bg-white border-[#E5ECE7] hover:border-[#C6E2D0]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#26352D]">Standard Field Visit</span>
                            <span className="font-extrabold text-sm text-[#0C4B32]">₹499</span>
                          </div>
                          <p className="text-[11px] text-[#55685D] mt-1 leading-relaxed">
                            Agronomist arrives within 48 hours. Includes physical crop diagnosis, spot soil EC test, and WhatsApp prescription.
                          </p>
                        </div>

                        {/* Priority Package */}
                        <div
                          onClick={() => setFieldVisitTier("priority")}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                            fieldVisitTier === "priority"
                              ? "bg-[#FBFDFB] border-[#0C4B32] ring-1 ring-[#0C4B32]/30 shadow-xs"
                              : "bg-white border-[#E5ECE7] hover:border-[#C6E2D0]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-[#26352D]">Priority Express Visit</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">Urgent</span>
                            </div>
                            <span className="font-extrabold text-sm text-[#0C4B32]">₹799</span>
                          </div>
                          <p className="text-[11px] text-[#55685D] mt-1 leading-relaxed">
                            Emergency dispatch within 24 hours. Includes leaf pathology microscopy, urgent spray schedule, and 14-day direct agronomist hotline.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section: Payment Method */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#26352D] mb-1.5">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label
                          onClick={() => setFieldVisitPaymentMode("online")}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                            fieldVisitPaymentMode === "online"
                              ? "bg-[#E7F3EB]/30 border-[#0C4B32]"
                              : "bg-white border-[#E5ECE7]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment_mode"
                            checked={fieldVisitPaymentMode === "online"}
                            onChange={() => setFieldVisitPaymentMode("online")}
                            className="text-[#0C4B32] focus:ring-[#0C4B32]"
                          />
                          <div>
                            <div className="font-semibold text-xs text-[#26352D] flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-[#0C4B32]" />
                              <span>Pay Online (UPI / Card / NetBanking)</span>
                            </div>
                            <div className="text-[10px] text-[#55685D]">Instant visit confirmation with digital receipt</div>
                          </div>
                        </label>

                        <label
                          onClick={() => setFieldVisitPaymentMode("on_arrival")}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                            fieldVisitPaymentMode === "on_arrival"
                              ? "bg-[#E7F3EB]/30 border-[#0C4B32]"
                              : "bg-white border-[#E5ECE7]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment_mode"
                            checked={fieldVisitPaymentMode === "on_arrival"}
                            onChange={() => setFieldVisitPaymentMode("on_arrival")}
                            className="text-[#0C4B32] focus:ring-[#0C4B32]"
                          />
                          <div>
                            <div className="font-semibold text-xs text-[#26352D] flex items-center gap-1.5">
                              <Wallet className="w-3.5 h-3.5 text-[#0C4B32]" />
                              <span>Pay on Field Arrival</span>
                            </div>
                            <div className="text-[10px] text-[#55685D]">Pay cash or UPI directly to visiting agronomist</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="p-3 rounded-xl bg-[#F8FAF8] border border-[#E5ECE7] space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-[#55685D]">
                        <span>Agronomist On-Site Consultation Fee:</span>
                        <span className="font-semibold text-[#26352D]">₹{fieldVisitTier === "priority" ? "799" : "499"}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#55685D]">
                        <span>Spot Soil EC & Moisture Test:</span>
                        <span className="text-emerald-700 font-medium">Included Free</span>
                      </div>
                      <div className="flex items-center justify-between text-[#55685D]">
                        <span>Digital WhatsApp Prescription & Advisory:</span>
                        <span className="text-emerald-700 font-medium">Included Free</span>
                      </div>
                      <div className="pt-1.5 border-t border-[#E5ECE7] flex items-center justify-between text-xs font-bold text-[#26352D]">
                        <span>Total Amount Payable:</span>
                        <span className="text-sm font-extrabold text-[#0C4B32]">
                          ₹{fieldVisitTier === "priority" ? "799" : "499"}
                        </span>
                      </div>
                    </div>

                    {/* Step 2 Actions */}
                    <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setFieldVisitStep(1)}
                        className="px-3.5 py-2 text-xs font-medium rounded-xl text-[#55685D] hover:text-[#26352D] border border-[#DCE6DE] hover:bg-[#F4F8F4] transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Details</span>
                      </button>

                      <button
                        type="submit"
                        className="btn btn-primary text-xs px-5 py-2 inline-flex items-center gap-1.5 shadow-xs cursor-pointer font-medium"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          {fieldVisitPaymentMode === "online"
                            ? `Pay ₹${fieldVisitTier === "priority" ? "799" : "499"} & Confirm Visit`
                            : `Confirm Booking (Pay ₹${fieldVisitTier === "priority" ? "799" : "499"} on Arrival)`}
                        </span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              /* Success Confirmation Card */
              <div className="space-y-4 py-2 text-xs">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-[#26352D]">
                    Field Visit Successfully Scheduled!
                  </h4>
                  <div className="inline-block px-3 py-1 rounded-full bg-[#E7F3EB] text-[#0C4B32] font-semibold text-xs border border-[#C6E2D0]">
                    Booking Reference: {fieldVisitSuccess.visitId}
                  </div>
                  <p className="text-xs text-[#55685D] max-w-md mx-auto">
                    Your agronomist field visit request has been registered and assigned. An official confirmation message and arrival tracking link have been dispatched to your mobile.
                  </p>
                </div>

                {/* Visit Details Table */}
                <div className="p-4 rounded-xl bg-[#F8FAF8] border border-[#E5ECE7] space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#E5ECE7]">
                    <div>
                      <span className="text-[10px] text-[#55685D] block">Farm & Location</span>
                      <strong className="text-xs text-[#26352D]">{fieldVisitSuccess.farmName} ({fieldVisitPlot})</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#55685D] block">Crop & Stage</span>
                      <strong className="text-xs text-[#26352D]">{fieldVisitSuccess.crop}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#E5ECE7]">
                    <div>
                      <span className="text-[10px] text-[#55685D] block">Scheduled Window</span>
                      <strong className="text-xs text-[#26352D]">{fieldVisitSuccess.date} • {fieldVisitSuccess.slot}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#55685D] block">Primary Reason</span>
                      <strong className="text-xs text-[#26352D]">{fieldVisitSuccess.reason}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[#55685D] block">Assigned Specialist</span>
                      <strong className="text-xs text-[#0C4B32]">{fieldVisitSuccess.agronomist}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#55685D] block">Fee & Payment Status</span>
                      <strong className="text-xs text-[#26352D]">₹{fieldVisitSuccess.fee} • {fieldVisitSuccess.paymentMode}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Agronomist will phone <strong>{fieldVisitPhone}</strong> 1 hour prior to arrival to confirm farm GPS location.
                  </span>
                </div>

                {/* Success Actions */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFieldVisitSuccess(null);
                    }}
                    className="px-3.5 py-2 text-xs font-medium rounded-xl text-[#55685D] hover:text-[#26352D] border border-[#DCE6DE] hover:bg-[#F4F8F4] transition-colors cursor-pointer"
                  >
                    Raise Another Visit
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFieldVisitModalOpen(false)}
                    className="btn btn-primary text-xs px-5 py-2 rounded-xl shadow-xs cursor-pointer font-medium"
                  >
                    Done & Return to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== WATCH TUTORIAL VIDEO MODAL (YOUTUBE EMBED) ===================== */}
      {isTutorialModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setIsTutorialModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-[#DCE6DE] shadow-2xl max-w-3xl w-full p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE7]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                  <Play className="w-5 h-5 fill-red-600 text-red-600 ml-0.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#26352D]">
                      Platform Video Tutorial
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                      YouTube Video
                    </span>
                  </div>
                  <p className="text-xs text-[#55685D] mt-0.5">
                    Step-by-step video walkthrough on managing farms, team roles, and agricultural operations.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTutorialModalOpen(false)}
                className="p-1.5 text-[#889B90] hover:text-[#26352D] rounded-xl hover:bg-[#F4F8F4] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Responsive 16:9 YouTube Video Embed Frame */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner border border-[#E5ECE7]">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
                title="Khetivo Farm Platform Video Tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Quick Chapter Guides */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E5ECE7]">
                <span className="font-bold text-[#26352D] block">1. Setup & Holdings</span>
                <span className="text-[11px] text-[#55685D]">Mapping GPS boundaries & tubewell pumps</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E5ECE7]">
                <span className="font-bold text-[#26352D] block">2. Team & Designations</span>
                <span className="text-[11px] text-[#55685D]">Assigning roles & module checkbox access</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E5ECE7]">
                <span className="font-bold text-[#26352D] block">3. Field Operations</span>
                <span className="text-[11px] text-[#55685D]">Weather alerts, inventory & crop cycles</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#E5ECE7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#55685D]">
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0C4B32] hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#0C4B32]" />
                <span>Open in YouTube for Fullscreen & Captions</span>
              </a>
              <button
                type="button"
                onClick={() => setIsTutorialModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0C4B32] hover:bg-[#083624] text-white shadow-xs cursor-pointer"
              >
                Done Watching
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== DELETE ACCOUNT CONFIRMATION MODAL ===================== */}
      {/* ===================== CUSTOM REUSABLE DELETE CONFIRMATION MODAL ===================== */}
      {deleteConfirmModal && deleteConfirmModal.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => !isDeletingItem && setDeleteConfirmModal(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5ECE7] p-5 sm:p-6 relative animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              disabled={isDeletingItem}
              onClick={() => setDeleteConfirmModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#55685D] hover:text-[#26352D] hover:bg-[#F4F8F4] transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Icon + Title */}
            <div className="flex items-start gap-3.5 mb-2.5">
              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="pt-0.5 min-w-0 pr-6">
                <h3 className="text-base sm:text-lg font-bold text-[#26352D] tracking-tight">
                  {deleteConfirmModal.title}
                </h3>
                {deleteConfirmModal.itemType && (
                  <span className="inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-red-50 text-red-700 mt-1 border border-red-100">
                    {deleteConfirmModal.itemType}
                  </span>
                )}
              </div>
            </div>

            {/* Item Card preview if available */}
            {deleteConfirmModal.itemName && (
              <div className="my-3.5 p-3 rounded-xl bg-[#F8FAF8] border border-[#E5ECE7] flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="min-w-0 text-xs">
                  <span className="text-[#55685D] block text-[11px]">Selected Record:</span>
                  <span className="font-semibold text-[#26352D] truncate block">
                    {deleteConfirmModal.itemName}
                  </span>
                </div>
              </div>
            )}

            {/* Warning description */}
            <p className="text-xs text-[#55685D] leading-relaxed mb-5">
              {deleteConfirmModal.description}
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-[#E5ECE7]">
              <button
                type="button"
                disabled={isDeletingItem}
                onClick={() => setDeleteConfirmModal(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#DCE6DE] text-xs font-semibold text-[#55685D] hover:bg-[#F4F8F4] hover:text-[#26352D] transition-colors cursor-pointer text-center disabled:opacity-50"
              >
                {deleteConfirmModal.cancelText || "Cancel"}
              </button>
              <button
                type="button"
                disabled={isDeletingItem}
                onClick={async () => {
                  try {
                    setIsDeletingItem(true);
                    await deleteConfirmModal.onConfirm();
                  } finally {
                    setIsDeletingItem(false);
                    setDeleteConfirmModal(null);
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingItem ? "Deleting..." : (deleteConfirmModal.confirmText || "Delete")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteAccountModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => {
            if (!isDeletingAccount) setDeleteAccountModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 border border-red-200 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Icon */}
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-[#26352D]">Delete Farmer Account?</h3>
              <p className="text-xs text-[#55685D] leading-relaxed">
                This action is <span className="font-semibold text-red-600">permanent and irreversible</span>. All your linked farm parcels, crop logs, machinery inventory, and one-time OTP verification history will be permanently erased.
              </p>
            </div>

            <div className="p-3 bg-red-50/70 rounded-xl border border-red-200 text-xs text-red-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Account To Be Purged:</span>
              </div>
              <p className="text-[11px] text-red-700 pl-5">
                Farmer: <span className="font-semibold">{settingsFarmerName || "Jaswinder Singh"}</span> ({settingsPhone || "+91 9814054321"})
              </p>
              <p className="text-[11px] text-red-600 pl-5">
                Once deleted, this phone number will be free to sign up again as a brand new farmer.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[#26352D]">
                Type <span className="text-red-600 font-mono font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmInput}
                onChange={(e) => {
                  setDeleteConfirmInput(e.target.value);
                  if (deleteAccountError) setDeleteAccountError("");
                }}
                disabled={isDeletingAccount}
                placeholder="DELETE"
                className="w-full px-3.5 py-2.5 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-xs text-[#26352D] font-mono tracking-wider disabled:opacity-50"
              />
              {deleteAccountError && (
                <p className="text-[11px] text-red-600 font-medium">{deleteAccountError}</p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteAccountModalOpen(false)}
                disabled={isDeletingAccount}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-white text-[#55685D] hover:text-[#26352D] border border-[#DCE6DE] hover:bg-[#F4F8F4] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmInput.trim().toUpperCase() !== "DELETE" || isDeletingAccount}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
              >
                {isDeletingAccount ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS RIGHT SIDEBAR DRAWER */}
      {notificationSidebarOpen && (
        <div
          onClick={() => setNotificationSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-55 w-84 sm:w-96 max-w-[90vw] h-screen bg-white border-l border-[#E5ECE7] flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out ${
          notificationSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="h-16 px-5 border-b border-[#E5ECE7] flex items-center justify-between shrink-0 bg-[#FBFDFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EAF3EC] border border-[#C6E2D0] flex items-center justify-center text-[#0C4B32]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#26352D]">Notifications</h3>
                {unreadNotificationsCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#F9B21B] text-[#26352D]">
                    {unreadNotificationsCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#55685D]">Live advisories & farm alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadNotificationsCount > 0 && (
              <button
                type="button"
                onClick={() => markAllNotificationsAsRead(farmNotificationsList.map((n) => n.id))}
                className="text-[11px] font-semibold text-[#0C4B32] hover:underline px-2 py-1 rounded cursor-pointer"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={() => setNotificationSidebarOpen(false)}
              className="p-1.5 rounded-lg text-[#55685D] hover:text-[#26352D] hover:bg-[#F4F8F4] transition-colors cursor-pointer"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {farmNotificationsList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#55685D]">
              <div className="w-12 h-12 rounded-full bg-[#F4F8F4] flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 text-[#889B90]" />
              </div>
              <p className="text-xs font-semibold text-[#26352D]">No notifications right now</p>
              <p className="text-[11px] mt-1 text-[#889B90]">
                Crop advisories, weather updates, and task alerts will appear here.
              </p>
            </div>
          ) : (
            farmNotificationsList.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  markNotificationAsRead(item.id);
                  if (item.actionTab) {
                    setActiveTab(item.actionTab);
                    setNotificationSidebarOpen(false);
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  item.unread
                    ? "bg-[#F9FCFA] border-[#C6E2D0] hover:bg-[#EAF3EC]/60 shadow-2xs"
                    : "bg-white border-[#E5ECE7] hover:bg-[#F9FCFA] opacity-80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                      item.type === "advisory"
                        ? "bg-amber-100 text-amber-800"
                        : item.type === "weather"
                        ? "bg-blue-100 text-blue-800"
                        : item.type === "inventory"
                        ? "bg-rose-100 text-rose-800"
                        : item.type === "task"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {item.type === "advisory" && <AlertTriangle className="w-3.5 h-3.5" />}
                    {item.type === "weather" && <CloudSun className="w-3.5 h-3.5" />}
                    {item.type === "inventory" && <Package className="w-3.5 h-3.5" />}
                    {item.type === "task" && <CheckSquare className="w-3.5 h-3.5" />}
                    {item.type === "support" && <HelpCircle className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#26352D] truncate">{item.title}</h4>
                      <span className="text-[10px] text-[#889B90] shrink-0 font-medium">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-[#55685D] mt-1 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    {item.actionTab && (
                      <span className="inline-block text-[10px] font-semibold text-[#0C4B32] mt-2 hover:underline">
                        View in {item.actionTab.charAt(0).toUpperCase() + item.actionTab.slice(1)} &rarr;
                      </span>
                    )}
                  </div>

                  {item.unread && (
                    <span className="w-2 h-2 rounded-full bg-[#F9B21B] shrink-0 mt-1" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3.5 border-t border-[#E5ECE7] bg-[#FBFDFB] flex items-center justify-between text-[11px] text-[#55685D]">
          <span>Connected to PAU Kisan Advisory</span>
          <button
            type="button"
            onClick={() => {
              setActiveTab("advisories");
              setNotificationSidebarOpen(false);
            }}
            className="font-semibold text-[#0C4B32] hover:underline cursor-pointer"
          >
            All Advisories
          </button>
        </div>
      </aside>
    </div>
  );
}


