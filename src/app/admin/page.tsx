"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Cpu,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Download,
  Settings,
  Bell,
  Check,
  X,
  Phone,
  MessageSquare,
  Edit3,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Server,
  Radio,
  Database,
  Lock,
  Eye,
  LogOut,
  Calendar,
  CreditCard,
  Building2,
  Sparkles,
  Layers,
  Sprout,
  Receipt,
  HelpCircle,
  Menu,
  Shield,
  BarChart2,
  PieChart,
  UserCheck,
  UserPlus,
  Compass,
  DollarSign,
  Briefcase,
  Share2,
  Droplets,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Globe,
  Printer,
  Send,
  Megaphone,
} from "lucide-react";

// =========================================================================
// 8 CORE ADMIN FEATURE TABS
// =========================================================================

export type AdminTab =
  | "overview"
  | "clients"       // 1. Client & Farm Onboarding, 2. User & Subscription Management
  | "crops"         // 4. Crop Master Templates
  | "broadcasts"    // Targeted Advisory & Weather/Pest Broadcasts
  | "field-visits"  // Field Visits & Lead Pipeline
  | "support"       // 5. Support Ticket Management
  | "plans"         // 3. Plan Management (Free, Basic, Pro, Enterprise)
  | "analytics"     // 6. Platform Analytics
  | "roles"         // 7. Role-Based Admin Access
  | "audit";        // 8. Data Backup & Audit Logs

export type SubscriptionTier = "Free" | "Basic" | "Pro" | "Enterprise";
export type AccountStatus = "Active" | "Trial" | "Renewal Due" | "Suspended";

// -------------------------------------------------------------
// DATA INTERFACES
// -------------------------------------------------------------

export interface FarmHolding {
  id: string;
  name: string;
  district: string;
  state: string;
  totalArea: number;
  areaUnit: string;
  soilType: string;
  irrigationType?: string;
  waterSource: string;
  primaryCrop: string;
  ownership?: string;
}

export interface ClientAccount {
  id: string;
  name: string;
  phone: string;
  email: string;
  district: string;
  state: string;
  plan: SubscriptionTier;
  status: AccountStatus;
  farms: FarmHolding[];
  totalAcreage: number;
  areaUnit: string;
  joinedDate: string;
  renewalDate: string;
  primaryCrop: string;
  mandi: string;
}

export interface PlanConfig {
  id: SubscriptionTier;
  name: string;
  pricePerYear: number;
  billingPeriod: string;
  tagline: string;
  maxFarms: string;
  maxAcreage: string;
  satelliteRefresh: string;
  teamSeats: string;
  features: string[];
  activeSubscribers: number;
  badgeColor: string;
}

export interface GrowthStageMilestone {
  id: string;
  stageName: string;
  startDay: number;
  endDay: number;
  irrigationRequirement: "Critical" | "Moderate" | "Low" | "Withhold";
  recommendedActivity: string;
}

export const SOIL_TYPES = [
  "Alluvial Loam (Deep & Fertile)",
  "Black Cotton Soil (Regur - High Clay)",
  "Red & Yellow Sandy Loam",
  "Clay Loam (Water-retentive)",
  "Laterite Soil (Acidic/High Rainfall)",
  "Desert / Sandy Soil",
];

export const IRRIGATION_TYPES = [
  "Drip / Micro-Irrigation (Sub-surface/Surface)",
  "Sprinkler System (Overhead/Center Pivot)",
  "Canal Flood / Furrow Irrigation",
  "Rainfed / Natural Moisture",
  "Solar Powered Micro-Drip",
];

export interface CropMasterTemplate {
  id: string;
  cropName: string;
  name: string;
  varieties: string[];
  variety: string;
  season: "Rabi" | "Kharif" | "Zaid" | "Annual";
  durationDays: number;
  duration: string;
  sowingWindow: string;
  defaultSoil: string;
  defaultIrrigation: string;
  badge: string;
  targetYieldQuintals: string;
  irrigationThresholdMoisture: number;
  criticalIrrigationStages: string[];
  majorDiseases: string[];
  pauFungicidePrescription: string;
  growthTimeline: GrowthStageMilestone[];
  dos: string[];
  donts: string[];
}

export interface SupportTicketAdmin {
  id: string;
  ticketCode: string;
  clientName: string;
  phone: string;
  farmName: string;
  subject: string;
  category: "Agronomy Advice" | "Pest Outbreak" | "Satellite NDVI" | "Billing" | "IoT Hardware";
  crop: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved";
  assignedAgronomist: string;
  createdAt: string;
  messages: { sender: string; text: string; time: string }[];
}

export interface FieldVisitLead {
  id: string;
  farmerName: string;
  phone: string;
  farmName: string;
  plotLandmark: string;
  crop: string;
  reason: string;
  scheduledDate: string;
  timeSlot: string;
  tier: "Standard (₹499)" | "Priority Express (₹799)";
  fee: number;
  paymentStatus: "Paid Online" | "Pay on Arrival" | "Pending Payment";
  workflowStage: "Lead Captured" | "Payment Verified" | "Agronomist Assigned" | "On-Field Diagnosis" | "Completed";
  assignedSpecialist: string;
  capturedAt: string;
  notes?: string;
}

export interface AdminRoleMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Superadmin" | "Agronomist Lead" | "Support Agent" | "Billing Manager";
  status: "Active" | "Inactive";
  lastLogin: string;
  permissions: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entity: string;
  status: "Success" | "Warning" | "Error";
  ipAddress: string;
}

export type BroadcastCategory =
  | "Pest & Disease Alert"
  | "Weather & Frost Warning"
  | "PAU Agronomy Advisory"
  | "General Announcement";

export type BroadcastPriority = "High / Emergency" | "Medium / Advisory" | "Standard";

export interface BroadcastDispatch {
  id: string;
  title: string;
  category: BroadcastCategory;
  priority: BroadcastPriority;
  targetCrop: string;          // "All Crops" or specific crop name
  targetDistrict: string;      // "All Districts" or specific district
  targetPlan: string;          // "All Plans", "Free Starter", "Basic Grower", "Farm Pro", "Estate Enterprise"
  targetGrowthStage: string;   // "All Stages", "Germination", "Crown Root / Tillering", "Flowering", "Harvest"
  message: string;
  actionPrescription?: string; // e.g. "Tilt / Propiconazole 25% EC @ 200ml/acre"
  channels: ("In-App Banner" | "SMS Alert" | "WhatsApp")[];
  dispatchedAt: string;
  dispatchedBy: string;
  matchedFarmersCount: number;
  matchedAcreage: number;
  status: "Active" | "Expired";
}

// =========================================================================
// INITIAL MOCK DATA (SOBER & AUTHENTIC AGRI CONTEXT)
// =========================================================================

const INITIAL_CLIENTS: ClientAccount[] = [];

const INITIAL_PLANS: PlanConfig[] = [
  {
    id: "Free",
    name: "Free Starter",
    pricePerYear: 0,
    billingPeriod: "Forever Free",
    tagline: "Essential farm diary and weather tracking for smallholder growers.",
    maxFarms: "1 Farm Holding",
    maxAcreage: "Up to 5 Acres",
    satelliteRefresh: "Not Included",
    teamSeats: "1 User Login",
    features: [
      "1 Farm Holding registration",
      "Hyper-local GPS 5-day weather forecast",
      "Manual task checklist & farm diary",
      "Standard APMC Mandi daily closing rate",
      "Community agronomy FAQ library",
    ],
    activeSubscribers: 0,
    badgeColor: "bg-gray-100 text-gray-800",
  },
  {
    id: "Basic",
    name: "Basic Grower",
    pricePerYear: 699,
    billingPeriod: "₹699 / Year",
    tagline: "Affordable precision tracking for progressive family farms.",
    maxFarms: "Up to 2 Farms",
    maxAcreage: "Up to 25 Acres",
    satelliteRefresh: "Every 15 Days",
    teamSeats: "2 User Logins",
    features: [
      "Up to 2 Farm Holdings",
      "Hyper-local anti-drift spray advisory",
      "Tractor & equipment service log book",
      "Seeds & fertilizer stock ledger",
      "Automated WhatsApp frost alerts",
      "Mandi closing price SMS alert",
    ],
    activeSubscribers: 0,
    badgeColor: "bg-blue-50 text-blue-800 border border-blue-200",
  },
  {
    id: "Pro",
    name: "Farm Pro",
    pricePerYear: 1499,
    billingPeriod: "₹1,499 / Year",
    tagline: "Satellite NDVI crop monitoring & PAU disease protocols for commercial growers.",
    maxFarms: "Up to 5 Farms",
    maxAcreage: "Up to 100 Acres",
    satelliteRefresh: "Every 5 Days (Sentinel-2)",
    teamSeats: "5 User Logins",
    features: [
      "Up to 5 Farm Holdings (100 Acres)",
      "Sentinel-2 cloud-filtered NDVI biomass layer",
      "PAU-verified chemical spray calculator",
      "Full team workforce role management",
      "Production, expense & P&L stats",
      "Priority 24/7 agronomist phone helpline",
      "10% discount on on-site field visits",
    ],
    activeSubscribers: 0,
    badgeColor: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  },
  {
    id: "Enterprise",
    name: "Estate Enterprise",
    pricePerYear: 4999,
    billingPeriod: "₹4,999 / Year",
    tagline: "Comprehensive sensor monitoring & dedicated agronomist partnership for large estates and FPOs.",
    maxFarms: "Unlimited Farms",
    maxAcreage: "Unlimited Acreage",
    satelliteRefresh: "Sentinel-2 + Planet High-Res",
    teamSeats: "Unlimited Team Members",
    features: [
      "Unlimited Farm Holdings & Acreage",
      "Solar tubewell IoT sensors & cutoff relay",
      "Dedicated senior PAU agronomist assigned",
      "Custom GST mandi billing & audit exports",
      "Free 2 physical field visits per harvest cycle",
      "Direct API integrations & custom reporting",
    ],
    activeSubscribers: 0,
    badgeColor: "bg-purple-50 text-purple-800 border border-purple-200",
  },
];

export const DEFAULT_PAU_GROWTH_TIMELINE: GrowthStageMilestone[] = [
  {
    id: "stage-1",
    stageName: "Germination & Seedling Emergence",
    startDay: 0,
    endDay: 15,
    irrigationRequirement: "Moderate",
    recommendedActivity: "Seed treatment with fungicide/bio-fertilizer. Ensure adequate seedbed moisture.",
  },
  {
    id: "stage-2",
    stageName: "Crown Root / Vegetative Branching",
    startDay: 20,
    endDay: 35,
    irrigationRequirement: "Critical",
    recommendedActivity: "First critical irrigation. 1st split Nitrogen top-dressing + weed suppression.",
  },
  {
    id: "stage-3",
    stageName: "Active Tillering & Stem Elongation",
    startDay: 40,
    endDay: 60,
    irrigationRequirement: "Moderate",
    recommendedActivity: "2nd Nitrogen split + micronutrient spray (Zinc / Iron). Monitor for early pest activity.",
  },
  {
    id: "stage-4",
    stageName: "Booting & Panicle / Flowering",
    startDay: 65,
    endDay: 85,
    irrigationRequirement: "Critical",
    recommendedActivity: "Critical reproductive irrigation window. PAU preventive fungicide for rust/blight.",
  },
  {
    id: "stage-5",
    stageName: "Grain Filling & Physiological Maturity",
    startDay: 90,
    endDay: 125,
    irrigationRequirement: "Low",
    recommendedActivity: "Final moisture for test weight. Withhold water 12-14 days prior to combine harvest.",
  },
];

const INITIAL_CROPS: CropMasterTemplate[] = [];

const INITIAL_SUPPORT_TICKETS: SupportTicketAdmin[] = [];

const INITIAL_FIELD_VISITS: FieldVisitLead[] = [];

const INITIAL_ROLES: AdminRoleMember[] = [];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

const INITIAL_BROADCASTS: BroadcastDispatch[] = [];

// =========================================================================
// MAIN COMPONENT
// =========================================================================

export default function AdminPage() {
  // --- Admin Authentication State ---
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [adminEmailInput, setAdminEmailInput] = useState<string>("");
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>("");
  const [adminAuthError, setAdminAuthError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [adminAuthLoading, setAdminAuthLoading] = useState<boolean>(false);

  // Check persisted admin session on mount
  useEffect(() => {
    try {
      const session = localStorage.getItem("khetivo_admin_session");
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed && parsed.authenticated && parsed.email) {
          setIsAdminAuthenticated(true);
        }
      }
    } catch {}
    setAuthChecking(false);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError("");
    setAdminAuthLoading(true);

    const email = adminEmailInput.trim().toLowerCase();
    const pass = adminPasswordInput.trim();

    // Default admin credentials: admin@gmail.com / admin123 (also accepts admin@khetivo.com / khetivo@2026)
    const validCredentials = [
      { email: "admin@gmail.com", pass: "admin123" },
      { email: "admin@khetivo.com", pass: "khetivo@2026" },
      { email: "amanpreet@khetivo.com", pass: "admin123" },
    ];

    const match = validCredentials.find(
      (c) => c.email.toLowerCase() === email && c.pass === pass
    );

    if (match) {
      const sessionData = {
        authenticated: true,
        email: match.email,
        name: "Dr. Amanpreet Singh",
        role: "Superadmin",
        loginTime: new Date().toISOString(),
      };
      localStorage.setItem("khetivo_admin_session", JSON.stringify(sessionData));
      setIsAdminAuthenticated(true);
      setAdminAuthLoading(false);
    } else {
      setTimeout(() => {
        setAdminAuthError("Invalid Gmail/Email or Password. Please verify your credentials.");
        setAdminAuthLoading(false);
      }, 400);
    }
  };

  const handleAdminLogout = () => {
    try {
      localStorage.removeItem("khetivo_admin_session");
    } catch {}
    setIsAdminAuthenticated(false);
    setAdminEmailInput("");
    setAdminPasswordInput("");
  };

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 1 & 2: Clients & Farm Onboarding State
  const [clients, setClients] = useState<ClientAccount[]>(INITIAL_CLIENTS);
  const [clientSearch, setClientSearch] = useState("");
  const [clientPlanFilter, setClientPlanFilter] = useState("all");
  const [clientStatusFilter, setClientStatusFilter] = useState("all");
  const [selectedClientModal, setSelectedClientModal] = useState<ClientAccount | null>(null);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  // New Client Form Inputs
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("+91 ");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientDistrict, setNewClientDistrict] = useState("Ludhiana");
  const [newClientState, setNewClientState] = useState("Punjab");
  const [newClientPlan, setNewClientPlan] = useState<SubscriptionTier>("Pro");
  const [newClientFarmName, setNewClientFarmName] = useState("");
  const [newClientArea, setNewClientArea] = useState(20);
  const [newClientAreaUnit, setNewClientAreaUnit] = useState("Acres");
  const [newClientSoil, setNewClientSoil] = useState("Alluvial Loam");
  const [newClientWater, setNewClientWater] = useState("Solar Tubewell (15 HP)");
  const [newClientCrop, setNewClientCrop] = useState("Wheat & Paddy");
  const [newClientMandi, setNewClientMandi] = useState("Khanna Mandi, Ludhiana");

  // Add Additional Farm Modal
  const [isAddFarmModalOpen, setIsAddFarmModalOpen] = useState(false);
  const [targetClientIdForFarm, setTargetClientIdForFarm] = useState<string | null>(null);
  const [extraFarmName, setExtraFarmName] = useState("");
  const [extraFarmArea, setExtraFarmArea] = useState(15);
  const [extraFarmDistrict, setExtraFarmDistrict] = useState("Ludhiana");
  const [extraFarmSoil, setExtraFarmSoil] = useState("Sandy Loam");
  const [extraFarmWater, setExtraFarmWater] = useState("Canal Feeder");
  const [extraFarmCrop, setExtraFarmCrop] = useState("Mustard");

  // 3: Plan Management State
  const [plans, setPlans] = useState<PlanConfig[]>(INITIAL_PLANS);

  // Recalculate plan subscribers dynamically based on realtime clients
  useEffect(() => {
    setPlans((prev) =>
      prev.map((p) => ({
        ...p,
        activeSubscribers: clients.filter((c) => c.plan.toLowerCase() === p.id.toLowerCase()).length,
      }))
    );
  }, [clients]);
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);

  // 4: Crop Master Templates State
  const [crops, setCrops] = useState<CropMasterTemplate[]>(INITIAL_CROPS);
  const [cropSearch, setCropSearch] = useState("");
  const [selectedCropModal, setSelectedCropModal] = useState<CropMasterTemplate | null>(null);
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState(false);
  const [cropToDelete, setCropToDelete] = useState<CropMasterTemplate | null>(null);
  const [editingCropId, setEditingCropId] = useState<string | null>(null);
  const [newCropName, setNewCropName] = useState("");
  const [newCropVariety, setNewCropVariety] = useState("");
  const [newCropVarieties, setNewCropVarieties] = useState("");
  const [newCropSeason, setNewCropSeason] = useState<"Rabi" | "Kharif" | "Zaid" | "Annual">("Rabi");
  const [newCropDuration, setNewCropDuration] = useState(120);
  const [newCropDefaultSoil, setNewCropDefaultSoil] = useState(SOIL_TYPES[0]);
  const [newCropDefaultIrrigation, setNewCropDefaultIrrigation] = useState(IRRIGATION_TYPES[0]);
  const [newCropBadge, setNewCropBadge] = useState("");
  const [newCropSowing, setNewCropSowing] = useState("");
  const [newCropYield, setNewCropYield] = useState("");
  const [newCropMoistureThreshold, setNewCropMoistureThreshold] = useState(30);
  const [newCropStages, setNewCropStages] = useState("");
  const [newCropDiseases, setNewCropDiseases] = useState("");
  const [newCropPrescription, setNewCropPrescription] = useState("");
  const [newCropTimeline, setNewCropTimeline] = useState<GrowthStageMilestone[]>(DEFAULT_PAU_GROWTH_TIMELINE);
  const [newCropDos, setNewCropDos] = useState<string[]>([
    "Perform certified seed treatment with recommended fungicide before sowing",
    "Ensure timely irrigation at critical growth stages",
    "Follow soil-test based balanced fertilizer application",
    "Scout fields weekly for early symptoms of pests or rusts",
  ]);
  const [newCropDonts, setNewCropDonts] = useState<string[]>([
    "Do not allow standing water or stagnation in the field",
    "Avoid excessive or uncalibrated nitrogen top-dressing",
    "Do not spray chemicals during strong winds or extreme noon heat",
    "Avoid delayed weeding beyond the critical crop-weed competition window",
  ]);

  const handleAddDoPoint = () => setNewCropDos((prev) => [...prev, ""]);
  const handleUpdateDoPoint = (index: number, val: string) =>
    setNewCropDos((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  const handleRemoveDoPoint = (index: number) =>
    setNewCropDos((prev) => prev.filter((_, i) => i !== index));

  const handleAddDontPoint = () => setNewCropDonts((prev) => [...prev, ""]);
  const handleUpdateDontPoint = (index: number, val: string) =>
    setNewCropDonts((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  const handleRemoveDontPoint = (index: number) =>
    setNewCropDonts((prev) => prev.filter((_, i) => i !== index));
  const [cropModalStep, setCropModalStep] = useState<1 | 2 | 3>(1);

  // 5: Support Ticket Management State
  const [tickets, setTickets] = useState<SupportTicketAdmin[]>(INITIAL_SUPPORT_TICKETS);
  const [ticketSearch, setTicketSearch] = useState("");
  const [selectedTicketModal, setSelectedTicketModal] = useState<SupportTicketAdmin | null>(null);
  const [ticketReplyInput, setTicketReplyInput] = useState("");

  // Field Visits & Leads Pipeline State
  const [fieldVisits, setFieldVisits] = useState<FieldVisitLead[]>(INITIAL_FIELD_VISITS);
  const [visitSearch, setVisitSearch] = useState("");
  const [visitStatusFilter, setVisitStatusFilter] = useState("all");
  const [selectedVisitModal, setSelectedVisitModal] = useState<FieldVisitLead | null>(null);

  // Field Visits Location Eligibility Access Control
  const [fieldVisitLocationMode, setFieldVisitLocationMode] = useState<"all" | "selected">("selected");
  const [fieldVisitAllowedLocations, setFieldVisitAllowedLocations] = useState<string[]>([
    "Ludhiana",
    "Khanna",
    "Sangrur",
    "Samrala",
  ]);
  const [newLocationInput, setNewLocationInput] = useState("");

  // 7: Role-Based Admin Access State
  const [roles, setRoles] = useState<AdminRoleMember[]>(INITIAL_ROLES);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPhone, setNewAdminPhone] = useState("+91 ");
  const [newAdminRole, setNewAdminRole] = useState<AdminRoleMember["role"]>("Agronomist Lead");
  const [newAdminPermissions, setNewAdminPermissions] = useState<string[]>([
    "Crop Master Templates",
    "Field Visits & Dispatches",
    "Support Ticket Resolution",
    "View Client Holdings",
  ]);

  // Persona preview simulation
  const [activePersonaRole, setActivePersonaRole] = useState<string>("Superadmin");

  // 8: Data Backup and Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // 6: Platform Analytics State
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<"season" | "month" | "year">("season");

  // Advisory & Weather/Pest Broadcasts State
  const [broadcasts, setBroadcasts] = useState<BroadcastDispatch[]>(INITIAL_BROADCASTS);
  const [broadcastSearch, setBroadcastSearch] = useState("");
  const [broadcastCategoryFilter, setBroadcastCategoryFilter] = useState("all");
  const [broadcastPriorityFilter, setBroadcastPriorityFilter] = useState("all");
  const [isCreateBroadcastModalOpen, setIsCreateBroadcastModalOpen] = useState(false);
  const [selectedBroadcastPreview, setSelectedBroadcastPreview] = useState<BroadcastDispatch | null>(null);

  // New Broadcast Form State
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastCategory, setBroadcastCategory] = useState<BroadcastCategory>("Pest & Disease Alert");
  const [broadcastPriority, setBroadcastPriority] = useState<BroadcastPriority>("High / Emergency");
  const [broadcastCrop, setBroadcastCrop] = useState("All Crops");
  const [broadcastDistrict, setBroadcastDistrict] = useState("All Districts");
  const [broadcastPlan, setBroadcastPlan] = useState("All Plans");
  const [broadcastGrowthStage, setBroadcastGrowthStage] = useState("All Stages");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastPrescription, setBroadcastPrescription] = useState("");
  const [broadcastChannels, setBroadcastChannels] = useState<("In-App Banner" | "SMS Alert" | "WhatsApp")[]>([
    "In-App Banner",
    "WhatsApp",
  ]);

  // Live Audience Calculation for Broadcast Composer
  const broadcastMatchingClients = clients.filter((c) => {
    const matchesDistrict =
      broadcastDistrict === "All Districts" ||
      c.district.toLowerCase().includes(broadcastDistrict.toLowerCase()) ||
      c.farms.some((f) => f.district.toLowerCase().includes(broadcastDistrict.toLowerCase()));

    const matchesCrop =
      broadcastCrop === "All Crops" ||
      c.primaryCrop.toLowerCase().includes(broadcastCrop.toLowerCase().split(" ")[0]) ||
      c.farms.some((f) => f.primaryCrop.toLowerCase().includes(broadcastCrop.toLowerCase().split(" ")[0]));

    const matchesPlan =
      broadcastPlan === "All Plans" || c.plan.toLowerCase() === broadcastPlan.toLowerCase();

    return matchesDistrict && matchesCrop && matchesPlan;
  });

  const broadcastMatchedAcreage = broadcastMatchingClients.reduce((sum, c) => sum + c.totalAcreage, 0);

  // Realtime Cloud & Local Data Loader
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load from local cache first
    try {
      const savedPlans = localStorage.getItem("khetivo_admin_plans");
      if (savedPlans) setPlans(JSON.parse(savedPlans));
      const savedClients = localStorage.getItem("khetivo_admin_clients");
      if (savedClients) setClients(JSON.parse(savedClients));
      const savedCrops = localStorage.getItem("khetivo_admin_crops");
      if (savedCrops) setCrops(JSON.parse(savedCrops));
      const savedVisits = localStorage.getItem("khetivo_admin_visits");
      if (savedVisits) setFieldVisits(JSON.parse(savedVisits));
      const savedLocConfig = localStorage.getItem("khetivo_field_visit_locations");
      if (savedLocConfig) {
        try {
          const parsed = JSON.parse(savedLocConfig);
          if (parsed.mode) setFieldVisitLocationMode(parsed.mode);
          if (Array.isArray(parsed.locations)) setFieldVisitAllowedLocations(parsed.locations);
        } catch {}
      }
      const savedTickets = localStorage.getItem("khetivo_admin_tickets");
      if (savedTickets) setTickets(JSON.parse(savedTickets));
      const savedRoles = localStorage.getItem("khetivo_admin_roles");
      if (savedRoles) setRoles(JSON.parse(savedRoles));
      const savedBroadcasts = localStorage.getItem("khetivo_admin_broadcasts");
      if (savedBroadcasts) setBroadcasts(JSON.parse(savedBroadcasts));
    } catch (e) {
      console.warn("Could not load from localStorage", e);
    }

    // Fetch live data directly from Appwrite Cloud & API routes
    const fetchLiveRealtimeAdminData = async () => {
      try {
        const [farmsRes, supportRes, invoicesRes, cropTemplatesRes, advisoriesRes] = await Promise.all([
          fetch("/api/appwrite/farms").catch(() => null),
          fetch("/api/appwrite/support").catch(() => null),
          fetch("/api/appwrite/invoices").catch(() => null),
          fetch("/api/appwrite/crop-templates").catch(() => null),
          fetch("/api/appwrite/advisories?all=true").catch(() => null),
        ]);

        // Process live advisories / broadcasts from Appwrite Cloud
        if (advisoriesRes && advisoriesRes.ok) {
          const advData = await advisoriesRes.json();
          if (advData && Array.isArray(advData.advisories)) {
            const mappedBroadcasts: BroadcastDispatch[] = advData.advisories.map((a: any) => ({
              id: a.$id || a.id,
              title: a.title,
              category: a.category || "Pest Warning",
              priority: a.priority || "High",
              targetCrop: a.targetCrop || "All Crops",
              targetDistrict: a.targetDistrict || "All Districts",
              targetPlan: "All Plans",
              targetGrowthStage: "All Growth Stages",
              message: a.message,
              actionPrescription: a.actionPrescription,
              channels: ["In-App Banner", "SMS / WhatsApp"],
              dispatchedAt: a.dispatchedAt ? new Date(a.dispatchedAt).toLocaleDateString("en-IN") : "Recent",
              dispatchedBy: a.dispatchedBy || "Dr. Amanpreet Singh",
              matchedFarmersCount: 1,
              matchedAcreage: 20,
              status: a.isActive !== false ? "Active" : "Expired",
            }));
            setBroadcasts(mappedBroadcasts);
            try {
              localStorage.setItem("khetivo_admin_broadcasts", JSON.stringify(mappedBroadcasts));
            } catch {}
          }
        }

        // Process live crop master templates from Appwrite Cloud
        if (cropTemplatesRes && cropTemplatesRes.ok) {
          const tmplData = await cropTemplatesRes.json();
          if (tmplData && Array.isArray(tmplData.templates)) {
            const liveCropTemplates: CropMasterTemplate[] = tmplData.templates.map((t: any) => {
              let parsedTimeline: GrowthStageMilestone[] = [];
              try {
                if (typeof t.growthTimeline === "string" && t.growthTimeline.trim()) {
                  parsedTimeline = JSON.parse(t.growthTimeline);
                } else if (Array.isArray(t.growthTimeline)) {
                  parsedTimeline = t.growthTimeline;
                }
              } catch {}

              const varList = Array.isArray(t.varieties)
                ? t.varieties
                : typeof t.varieties === "string"
                ? t.varieties.split(",").map((v: string) => v.trim()).filter(Boolean)
                : ["Standard Variety"];

              return {
                id: t.$id || t.id,
                cropName: t.cropName || t.name,
                name: t.cropName || t.name,
                varieties: varList,
                variety: varList[0] || "Standard Variety",
                season: t.season || "Rabi",
                sowingWindow: t.sowingWindow || "",
                durationDays: Number(t.durationDays) || 120,
                duration: `${Number(t.durationDays) || 120} Days`,
                defaultSoil: t.defaultSoil || "Alluvial Loam",
                defaultIrrigation: t.defaultIrrigation || "Tubewell",
                badge: `${t.season || "Seasonal"} Crop`,
                targetYieldQuintals: t.targetYield || "20-25 Qtl/Acre",
                irrigationThresholdMoisture: Number(t.irrigationThresholdMoisture) || 30,
                criticalIrrigationStages: Array.isArray(t.criticalIrrigationStages) ? t.criticalIrrigationStages : [],
                growthTimeline: parsedTimeline,
                majorDiseases: Array.isArray(t.majorDiseases) ? t.majorDiseases : [],
                pauFungicidePrescription: t.pauPrescription || "",
                dos: Array.isArray(t.dos) ? t.dos : [],
                donts: Array.isArray(t.donts) ? t.donts : [],
              };
            });

            setCrops((prev) => {
              const combined = [...liveCropTemplates];
              prev.forEach((p) => {
                if (!combined.some((c) => c.id === p.id || c.name.toLowerCase() === p.name.toLowerCase())) {
                  combined.push(p);
                }
              });
              try {
                localStorage.setItem("khetivo_admin_crops", JSON.stringify(combined));
              } catch {}
              return combined;
            });
          }
        }

        // Process live registered farms into client accounts
        if (farmsRes && farmsRes.ok) {
          const farmsData = await farmsRes.json();
          if (farmsData && Array.isArray(farmsData.farms) && farmsData.farms.length > 0) {
            // Group farms by userId
            const userFarmsMap = new Map<string, any[]>();
            farmsData.farms.forEach((f: any) => {
              const uid = f.userId || "default_farmer";
              if (!userFarmsMap.has(uid)) userFarmsMap.set(uid, []);
              userFarmsMap.get(uid)!.push(f);
            });

            const liveClients: ClientAccount[] = Array.from(userFarmsMap.entries()).map(
              ([uid, uFarms], idx) => {
                const primaryFarm = uFarms[0];
                const totalAcres = uFarms.reduce((sum, farm) => sum + (Number(farm.totalArea) || 0), 0);

                const mappedHoldingList: FarmHolding[] = uFarms.map((farm) => ({
                  id: farm.$id || farm.id,
                  name: farm.name || "Main Holding",
                  district: farm.district || "Ludhiana",
                  state: farm.state || "Punjab",
                  totalArea: Number(farm.totalArea) || 0,
                  areaUnit: farm.areaUnit || "Acres",
                  soilType: farm.soilType || "Alluvial Loam",
                  irrigationType: farm.irrigationType || "Canal / Tubewell",
                  waterSource: farm.waterSource || "Groundwater",
                  primaryCrop: farm.cropTemplate || "Wheat / Paddy",
                }));

                const clientName =
                  primaryFarm.name.includes("Farm") || primaryFarm.name.includes("Holding")
                    ? primaryFarm.name.replace(/ Farm| Holding/i, "") + " (Farmer)"
                    : primaryFarm.name;

                return {
                  id: `client-${uid}`,
                  name: clientName || `Farmer ${idx + 1}`,
                  phone: "+91 98140" + Math.floor(10000 + Math.random() * 90000),
                  email: `${uid.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}@farmer.khetivo.com`,
                  district: primaryFarm.district || "Ludhiana",
                  state: primaryFarm.state || "Punjab",
                  plan: "Pro" as SubscriptionTier,
                  status: "Active" as AccountStatus,
                  farms: mappedHoldingList,
                  totalAcreage: totalAcres,
                  areaUnit: primaryFarm.areaUnit || "Acres",
                  joinedDate: primaryFarm.$createdAt ? primaryFarm.$createdAt.split("T")[0] : "2026-01-15",
                  renewalDate: "2027-01-15",
                  primaryCrop: primaryFarm.cropTemplate || "Multi-Crop",
                  mandi: primaryFarm.district ? `${primaryFarm.district} Mandi` : "APMC Mandi",
                };
              }
            );

            setClients((prev) => {
              // Merge live clients with any manually added clients in state
              const combined = [...liveClients];
              prev.forEach((p) => {
                if (!combined.some((c) => c.id === p.id || c.name === p.name)) {
                  combined.push(p);
                }
              });
              try {
                localStorage.setItem("khetivo_admin_clients", JSON.stringify(combined));
              } catch {}
              return combined;
            });
          }
        }

        // Process live support queries and field visits
        if (supportRes && supportRes.ok) {
          const supportData = await supportRes.json();
          if (supportData && Array.isArray(supportData.tickets) && supportData.tickets.length > 0) {
            const mappedTickets: SupportTicketAdmin[] = supportData.tickets.map((t: any) => ({
              id: t.$id || t.id,
              ticketCode: t.ticketNo || `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
              clientName: t.farmName || "Farmer",
              phone: "+91 9814054321",
              farmName: t.farmName || "Main Farm",
              subject: t.subject || "Agronomy inquiry",
              category: "Agronomy Advice" as const,
              crop: t.cropName || "Field Crop",
              priority: "Medium" as const,
              status: t.status === "Resolved" ? "Resolved" : t.status === "In Progress" ? "In Progress" : "Open",
              assignedAgronomist: t.assignedAgronomist || "PAU Agronomist",
              createdAt: t.$createdAt ? t.$createdAt.split("T")[0] : "2026-11-20",
              messages: [{ sender: t.farmName || "Farmer", text: t.description || t.subject, time: "Just now" }],
            }));
            setTickets((prev) => {
              const combined = [...mappedTickets];
              prev.forEach((p) => {
                if (!combined.some((t) => t.id === p.id || t.ticketCode === p.ticketCode)) {
                  combined.push(p);
                }
              });
              try {
                localStorage.setItem("khetivo_admin_tickets", JSON.stringify(combined));
              } catch {}
              return combined;
            });
          }

          if (supportData && Array.isArray(supportData.fieldVisits) && supportData.fieldVisits.length > 0) {
            const mappedVisits: FieldVisitLead[] = supportData.fieldVisits.map((v: any) => ({
              id: v.$id || v.id,
              leadSource: "Farmer App",
              farmerName: v.farmerName || "Farmer",
              phone: v.phone || "+91 9814054321",
              farmName: v.farmName || "Main Farm",
              plotLandmark: v.plotLandmark || "",
              crop: v.crop || "Wheat",
              reason: v.reason || "Field Diagnostic",
              scheduledDate: v.scheduledDate ? v.scheduledDate.split("T")[0] : "2026-11-22",
              timeSlot: v.timeSlot || "Morning",
              tier: v.tier || "Standard Diagnostic",
              fee: Number(v.fee) || 499,
              paymentStatus: v.paymentStatus || "Pending",
              workflowStage: v.workflowStage || "Requested",
              assignedSpecialist: v.assignedSpecialist || "PAU Specialist",
              notes: v.notes || "",
            }));
            setFieldVisits((prev) => {
              const combined = [...mappedVisits];
              prev.forEach((p) => {
                if (!combined.some((v) => v.id === p.id)) {
                  combined.push(p);
                }
              });
              try {
                localStorage.setItem("khetivo_admin_visits", JSON.stringify(combined));
              } catch {}
              return combined;
            });
          }
        }
      } catch (err) {
        console.warn("[Admin Realtime Load Error]:", err);
      }
    };

    fetchLiveRealtimeAdminData();

    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      try {
        if (e.key === "khetivo_admin_visits") {
          setFieldVisits(JSON.parse(e.newValue));
        } else if (e.key === "khetivo_admin_clients") {
          setClients(JSON.parse(e.newValue));
        } else if (e.key === "khetivo_admin_crops") {
          setCrops(JSON.parse(e.newValue));
        } else if (e.key === "khetivo_admin_broadcasts") {
          setBroadcasts(JSON.parse(e.newValue));
        } else if (e.key === "khetivo_admin_tickets") {
          setTickets(JSON.parse(e.newValue));
        }
      } catch (err) {
        console.warn("Error syncing storage in admin", err);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("khetivo_admin_broadcasts", JSON.stringify(broadcasts));
    } catch (e) { }
  }, [broadcasts]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("khetivo_admin_clients", JSON.stringify(clients));
    } catch (e) { }
  }, [clients]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("khetivo_admin_crops", JSON.stringify(crops));
    } catch (e) { }
  }, [crops]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("khetivo_admin_visits", JSON.stringify(fieldVisits));
    } catch (e) { }
  }, [fieldVisits]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("khetivo_admin_tickets", JSON.stringify(tickets));
    } catch (e) { }
  }, [tickets]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("khetivo_admin_roles", JSON.stringify(roles));
    } catch (e) { }
  }, [roles]);

  // Save Field Visit Location Config
  const handleSaveFieldVisitLocations = (
    mode = fieldVisitLocationMode,
    locations = fieldVisitAllowedLocations
  ) => {
    try {
      const config = { mode, locations };
      localStorage.setItem("khetivo_field_visit_locations", JSON.stringify(config));
      window.dispatchEvent(new Event("khetivo_field_visit_locations_updated"));
      showToast(
        mode === "all"
          ? "Raise a Field Visit button is enabled in ALL locations."
          : `Raise a Field Visit button enabled only in ${locations.length} selected locations.`
      );
    } catch (e) {
      console.warn("Failed to save field visit locations:", e);
    }
  };

  const handleAddAllowedLocation = (locName: string) => {
    const trimmed = locName.trim();
    if (!trimmed) return;
    if (fieldVisitAllowedLocations.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`"${trimmed}" is already in the allowed list.`);
      return;
    }
    const updated = [...fieldVisitAllowedLocations, trimmed];
    setFieldVisitAllowedLocations(updated);
    handleSaveFieldVisitLocations(fieldVisitLocationMode, updated);
    setNewLocationInput("");
  };

  const handleRemoveAllowedLocation = (locName: string) => {
    const updated = fieldVisitAllowedLocations.filter((l) => l !== locName);
    setFieldVisitAllowedLocations(updated);
    handleSaveFieldVisitLocations(fieldVisitLocationMode, updated);
    showToast(`Removed "${locName}" from allowed locations.`);
  };

  // Feedback Toast
  const [adminToast, setAdminToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3500);
  };

  // -------------------------------------------------------------
  // CLIENT & FARM ONBOARDING HANDLERS
  // -------------------------------------------------------------
  const handleOnboardClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientPhone.trim()) {
      alert("Please provide the client name and mobile number.");
      return;
    }

    const farmId = `f-${Date.now()}`;
    const initialFarm: FarmHolding = {
      id: farmId,
      name: newClientFarmName.trim() || `${newClientName.trim()}'s Farm 1`,
      district: newClientDistrict,
      state: newClientState,
      totalArea: Number(newClientArea) || 10,
      areaUnit: newClientAreaUnit,
      soilType: newClientSoil,
      waterSource: newClientWater,
      primaryCrop: newClientCrop,
    };

    const newClient: ClientAccount = {
      id: `cl-${Date.now()}`,
      name: newClientName.trim(),
      phone: newClientPhone.trim(),
      email: newClientEmail.trim() || `${newClientName.toLowerCase().replace(/\s+/g, ".")}@khetivo.com`,
      district: newClientDistrict,
      state: newClientState,
      plan: newClientPlan,
      status: "Active",
      farms: [initialFarm],
      totalAcreage: initialFarm.totalArea,
      areaUnit: newClientAreaUnit,
      joinedDate: "Today",
      renewalDate: "28 Oct 2027",
      primaryCrop: newClientCrop,
      mandi: newClientMandi,
    };

    setClients([newClient, ...clients]);

    // Save Farm and User to Appwrite Cloud
    try {
      const generatedUserId = `usr_${Date.now().toString(36)}`;
      fetch("/api/appwrite/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: generatedUserId,
          name: initialFarm.name,
          district: initialFarm.district,
          state: initialFarm.state,
          totalArea: initialFarm.totalArea,
          areaUnit: initialFarm.areaUnit,
          soilType: initialFarm.soilType,
          waterSource: initialFarm.waterSource,
          cropTemplate: initialFarm.primaryCrop,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data && data.success && data.farm) {
            setClients((prev) =>
              prev.map((c) =>
                c.id === newClient.id
                  ? {
                      ...c,
                      id: `client-${generatedUserId}`,
                      farms: [{ ...initialFarm, id: data.farm.$id }],
                    }
                  : c
              )
            );
          }
        })
        .catch((e) => console.warn("Appwrite onboard farm error:", e));
    } catch {}

    // Record audit log
    const auditEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      actor: "Master Admin",
      action: "CLIENT_AND_FARM_ONBOARDED",
      entity: `${newClient.name} (${initialFarm.name} - ${initialFarm.totalArea} ${initialFarm.areaUnit})`,
      status: "Success",
      ipAddress: "106.195.42.18",
    };
    setAuditLogs([auditEntry, ...auditLogs]);

    setIsAddClientModalOpen(false);
    // Reset inputs
    setNewClientName("");
    setNewClientPhone("+91 ");
    setNewClientEmail("");
    setNewClientFarmName("");
    showToast(`Client ${newClient.name} & initial farm onboarded successfully!`);
  };

  const handleAddFarmToClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClientIdForFarm) return;

    const farm: FarmHolding = {
      id: `f-${Date.now()}`,
      name: extraFarmName.trim() || "Additional Parcel",
      district: extraFarmDistrict,
      state: "Punjab",
      totalArea: Number(extraFarmArea) || 10,
      areaUnit: "Acres",
      soilType: extraFarmSoil,
      waterSource: extraFarmWater,
      primaryCrop: extraFarmCrop,
    };

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === targetClientIdForFarm) {
          const updatedFarms = [...c.farms, farm];
          const totalArea = updatedFarms.reduce((sum, f) => sum + f.totalArea, 0);
          return { ...c, farms: updatedFarms, totalAcreage: totalArea };
        }
        return c;
      })
    );

    // Save additional farm to Appwrite Cloud
    try {
      const targetClient = clients.find((c) => c.id === targetClientIdForFarm);
      const parsedUserId = targetClient?.id?.replace("client-", "") || "usr_default_farmer";
      fetch("/api/appwrite/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parsedUserId,
          name: farm.name,
          district: farm.district,
          state: farm.state,
          totalArea: farm.totalArea,
          areaUnit: farm.areaUnit,
          soilType: farm.soilType,
          waterSource: farm.waterSource,
          cropTemplate: farm.primaryCrop,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data && data.success && data.farm) {
            setClients((prev) =>
              prev.map((c) => {
                if (c.id === targetClientIdForFarm) {
                  const updatedFarms = c.farms.map((f) => (f.id === farm.id ? { ...f, id: data.farm.$id } : f));
                  return { ...c, farms: updatedFarms };
                }
                return c;
              })
            );
          }
        })
        .catch((e) => console.warn("Appwrite add farm error:", e));
    } catch {}

    setIsAddFarmModalOpen(false);
    setExtraFarmName("");
    showToast(`Added farm ${farm.name} to client.`);
  };

  // Subscription management
  const handleUpdateSubscription = (
    clientId: string,
    plan: SubscriptionTier,
    status: AccountStatus,
    extendedRenewal?: string
  ) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          return {
            ...c,
            plan,
            status,
            renewalDate: extendedRenewal || c.renewalDate,
          };
        }
        return c;
      })
    );
    if (selectedClientModal && selectedClientModal.id === clientId) {
      setSelectedClientModal({
        ...selectedClientModal,
        plan,
        status,
        renewalDate: extendedRenewal || selectedClientModal.renewalDate,
      });
    }

    const targetClient = clients.find((c) => c.id === clientId);
    const parsedUserId = targetClient?.id?.replace("client-", "");
    if (parsedUserId) {
      const planTierLower = plan.toLowerCase();
      const annualPrice = planTierLower === "enterprise" ? 5999 : planTierLower === "pro" ? 2999 : 0;
      fetch("/api/appwrite/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parsedUserId,
          planTier: planTierLower,
          maxAcres: planTierLower === "enterprise" ? 50 : 25,
          annualFee: annualPrice,
          paymentMethod: "Admin Override",
        }),
      }).catch((e) => console.warn("Appwrite update user subscription error:", e));
    }

    showToast("Subscription & status updated.");
  };

  // Delete Farm from Client
  const handleDeleteFarmFromClient = (clientId: string, farmId: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const updatedFarms = c.farms.filter((f) => f.id !== farmId);
          const totalArea = updatedFarms.reduce((sum, f) => sum + f.totalArea, 0);
          return { ...c, farms: updatedFarms, totalAcreage: totalArea };
        }
        return c;
      })
    );
    if (selectedClientModal && selectedClientModal.id === clientId) {
      const updatedFarms = selectedClientModal.farms.filter((f) => f.id !== farmId);
      const totalArea = updatedFarms.reduce((sum, f) => sum + f.totalArea, 0);
      setSelectedClientModal({
        ...selectedClientModal,
        farms: updatedFarms,
        totalAcreage: totalArea,
      });
    }

    if (farmId && !farmId.startsWith("f-")) {
      fetch(`/api/appwrite/farms?farmId=${encodeURIComponent(farmId)}`, {
        method: "DELETE",
      }).catch((e) => console.warn("Appwrite delete farm error:", e));
    }

    showToast("Farm parcel removed.");
  };

  // Crop Growth Stage Timeline Builder Handlers
  const handleAddTimelineStage = () => {
    const lastStage = newCropTimeline[newCropTimeline.length - 1];
    const nextStart = lastStage ? lastStage.endDay + 5 : 0;
    const nextEnd = nextStart + 20;
    const newStage: GrowthStageMilestone = {
      id: `stage-${Date.now()}`,
      stageName: `Stage ${newCropTimeline.length + 1}`,
      startDay: nextStart,
      endDay: nextEnd,
      irrigationRequirement: "Moderate",
      recommendedActivity: "",
    };
    setNewCropTimeline([...newCropTimeline, newStage]);
  };

  const handleRemoveTimelineStage = (id: string) => {
    if (newCropTimeline.length <= 1) {
      alert("At least one growth stage milestone is required in the timeline.");
      return;
    }
    setNewCropTimeline(newCropTimeline.filter((s) => s.id !== id));
  };

  const handleUpdateTimelineStage = (
    id: string,
    field: keyof GrowthStageMilestone,
    value: string | number
  ) => {
    setNewCropTimeline((prev) =>
      prev.map((stage) => (stage.id === id ? { ...stage, [field]: value } : stage))
    );
  };

  const handleResetTimeline = () => {
    setNewCropTimeline(DEFAULT_PAU_GROWTH_TIMELINE);
  };

  const handleOpenNewCropModal = () => {
    setEditingCropId(null);
    setNewCropName("");
    setNewCropVariety("");
    setNewCropVarieties("");
    setNewCropSeason("Rabi");
    setNewCropDuration(120);
    setNewCropDefaultSoil(SOIL_TYPES[0]);
    setNewCropDefaultIrrigation(IRRIGATION_TYPES[0]);
    setNewCropBadge("Punjab & Haryana Standard");
    setNewCropSowing("25 Oct – 15 Nov (Rabi)");
    setNewCropYield("22 – 25 Qtl/Acre");
    setNewCropMoistureThreshold(35);
    setNewCropStages("");
    setNewCropDiseases("Yellow Rust, Foliar Blight");
    setNewCropPrescription("Follow PAU package of practices. Apply recommended fungicide on early symptoms.");
    setNewCropTimeline(DEFAULT_PAU_GROWTH_TIMELINE);
    setNewCropDos([
      "Perform certified seed treatment with recommended fungicide before sowing",
      "Ensure timely irrigation at critical growth stages",
      "Follow soil-test based balanced fertilizer application",
      "Scout fields weekly for early symptoms of pests or rusts",
    ]);
    setNewCropDonts([
      "Do not allow standing water or stagnation in the field",
      "Avoid excessive or uncalibrated nitrogen top-dressing",
      "Do not spray chemicals during strong winds or extreme noon heat",
      "Avoid delayed weeding beyond the critical crop-weed competition window",
    ]);
    setCropModalStep(1);
    setIsAddCropModalOpen(true);
  };

  const handleEditCropTemplate = (crop: CropMasterTemplate) => {
    setEditingCropId(crop.id);
    setNewCropName(crop.name || crop.cropName);
    setNewCropVariety(crop.variety || crop.varieties[0] || "");
    setNewCropVarieties(crop.varieties.join(", "));
    setNewCropSeason(crop.season || "Rabi");
    setNewCropDuration(crop.durationDays || parseInt(crop.duration) || 120);
    setNewCropDefaultSoil(crop.defaultSoil || SOIL_TYPES[0]);
    setNewCropDefaultIrrigation(crop.defaultIrrigation || IRRIGATION_TYPES[0]);
    setNewCropBadge(crop.badge || `${crop.season || "Rabi"} Crop`);
    setNewCropSowing(crop.sowingWindow || "");
    setNewCropYield(crop.targetYieldQuintals || "");
    setNewCropMoistureThreshold(crop.irrigationThresholdMoisture || 35);
    setNewCropDiseases(crop.majorDiseases ? crop.majorDiseases.join(", ") : "");
    setNewCropPrescription(crop.pauFungicidePrescription || "");
    setNewCropTimeline(crop.growthTimeline && crop.growthTimeline.length > 0 ? crop.growthTimeline : DEFAULT_PAU_GROWTH_TIMELINE);
    setNewCropDos(crop.dos && crop.dos.length > 0 ? [...crop.dos] : [
      "Perform certified seed treatment before sowing",
      "Monitor soil moisture and irrigate at critical stages",
    ]);
    setNewCropDonts(crop.donts && crop.donts.length > 0 ? [...crop.donts] : [
      "Do not allow standing water or stagnation in the field",
      "Avoid excessive nitrogen top-dressing",
    ]);
    setCropModalStep(1);
    setIsAddCropModalOpen(true);
  };

  const handleDeleteCropTemplate = (cropId: string) => {
    const target = crops.find((c) => c.id === cropId);
    if (!target) return;
    setCropToDelete(target);
  };

  const confirmDeleteCropTemplate = () => {
    if (!cropToDelete) return;
    const cropId = cropToDelete.id;
    const cropTitle = cropToDelete.cropName || cropToDelete.name;
    const updated = crops.filter((c) => c.id !== cropId);
    setCrops(updated);
    try {
      localStorage.setItem("khetivo_admin_crops", JSON.stringify(updated));
    } catch {}
    fetch(`/api/appwrite/crop-templates?templateId=${encodeURIComponent(cropId)}`, {
      method: "DELETE",
    }).catch((err) => console.warn("Error deleting crop template from Appwrite:", err));
    setCropToDelete(null);
    showToast(`Crop template "${cropTitle}" deleted successfully.`);
  };

  // Add / Update Crop Template Handler
  const handleCreateCropTemplate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCropName.trim()) {
      alert("Please provide the crop name.");
      setCropModalStep(1);
      return;
    }

    const derivedCriticalStages = newCropTimeline
      .filter((s) => s.irrigationRequirement === "Critical")
      .map((s) => `${s.stageName} (Days ${s.startDay}–${s.endDay})`);

    const varList = newCropVarieties
      ? newCropVarieties.split(",").map((v) => v.trim()).filter(Boolean)
      : [newCropVariety.trim() || "Standard Regional Variety"];

    const primaryVar = newCropVariety.trim() || varList[0] || "Standard Regional Variety";

    const cropTemplate: CropMasterTemplate = {
      id: editingCropId || `cr-${Date.now()}`,
      cropName: newCropName.trim(),
      name: newCropName.trim(),
      varieties: varList,
      variety: primaryVar,
      durationDays: Number(newCropDuration) || 120,
      duration: `${Number(newCropDuration) || 120} Days`,
      sowingWindow: newCropSowing.trim() || "Seasonal Window",
      season: newCropSeason,
      targetYieldQuintals: newCropYield.trim() || "20 - 25 Qtl/Acre",
      irrigationThresholdMoisture: Number(newCropMoistureThreshold) || 35,
      criticalIrrigationStages:
        derivedCriticalStages.length > 0
          ? derivedCriticalStages
          : ["Crown Root Initiation", "Tillering Stage", "Flowering & Heading"],
      growthTimeline: newCropTimeline,
      majorDiseases: newCropDiseases
        ? newCropDiseases.split(",").map((d) => d.trim()).filter(Boolean)
        : ["Foliar Blight", "Rust"],
      pauFungicidePrescription:
        newCropPrescription.trim() || "Follow PAU package of practices. Apply recommended fungicide on early symptoms.",
      defaultSoil: newCropDefaultSoil,
      defaultIrrigation: newCropDefaultIrrigation,
      badge: newCropBadge.trim() || `${newCropSeason} Master`,
      dos: newCropDos.map((d) => d.trim()).filter(Boolean).length > 0
        ? newCropDos.map((d) => d.trim()).filter(Boolean)
        : [
            "Perform certified seed treatment before sowing",
            "Monitor soil moisture and irrigate at critical stages",
            "Maintain optimal plant spacing and weed control",
          ],
      donts: newCropDonts.map((d) => d.trim()).filter(Boolean).length > 0
        ? newCropDonts.map((d) => d.trim()).filter(Boolean)
        : [
            "Do not allow waterlogging in the field",
            "Avoid excessive nitrogen application",
            "Do not spray chemicals during windy conditions",
          ],
    };

    let updatedCrops: CropMasterTemplate[];
    if (editingCropId) {
      updatedCrops = crops.map((c) => (c.id === editingCropId ? cropTemplate : c));
      showToast(`Crop template "${cropTemplate.cropName}" updated successfully!`);
    } else {
      updatedCrops = [cropTemplate, ...crops];
      showToast(`Crop template for ${cropTemplate.cropName} created and published!`);
    }

    setCrops(updatedCrops);
    try {
      localStorage.setItem("khetivo_admin_crops", JSON.stringify(updatedCrops));
    } catch {}

    // Save/Update in Appwrite Cloud Database
    fetch("/api/appwrite/crop-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cropTemplate),
    }).then(async (res) => {
      if (res && res.ok) {
        const data = await res.json();
        if (data.template && data.template.$id) {
          setCrops((prev) =>
            prev.map((c) => (c.id === cropTemplate.id ? { ...c, id: data.template.$id } : c))
          );
        }
      }
    }).catch((err) => console.warn("Error creating crop template in Appwrite:", err));

    const auditEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      actor: "Dr. Amanpreet Singh",
      action: editingCropId ? "CROP_TEMPLATE_UPDATED" : "CROP_TEMPLATE_CREATED",
      entity: `${cropTemplate.cropName} (${cropTemplate.variety}) [${cropTemplate.growthTimeline.length} Stages]`,
      status: "Success",
      ipAddress: "106.195.42.18",
    };
    setAuditLogs([auditEntry, ...auditLogs]);

    setIsAddCropModalOpen(false);
    setCropModalStep(1);
    setEditingCropId(null);
  };

  // Update Field Visit Handler
  const handleUpdateFieldVisit = (updatedVisit: FieldVisitLead) => {
    setFieldVisits((prev) => prev.map((v) => (v.id === updatedVisit.id ? updatedVisit : v)));
    setSelectedVisitModal(null);

    if (updatedVisit.id && !updatedVisit.id.startsWith("visit-")) {
      fetch("/api/appwrite/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "field_visit",
          id: updatedVisit.id,
          workflowStage: updatedVisit.workflowStage,
          assignedSpecialist: updatedVisit.assignedSpecialist,
          notes: updatedVisit.notes,
        }),
      }).catch((e) => console.warn("Appwrite update field visit error:", e));
    }

    const auditEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      actor: "Dispatch Desk",
      action: "FIELD_VISIT_DISPATCH_UPDATED",
      entity: `${updatedVisit.farmerName} -> ${updatedVisit.workflowStage} (${updatedVisit.assignedSpecialist})`,
      status: "Success",
      ipAddress: "106.195.42.18",
    };
    setAuditLogs([auditEntry, ...auditLogs]);
    showToast(`Visit ${updatedVisit.id} updated successfully.`);
  };

  // Add Staff Member Handler
  const handleAddStaffMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim()) {
      alert("Please provide the staff member name and email.");
      return;
    }
    const newMember: AdminRoleMember = {
      id: `adm-${Date.now()}`,
      name: newAdminName.trim(),
      email: newAdminEmail.trim(),
      phone: newAdminPhone.trim() || "+91 98000-00000",
      role: newAdminRole,
      status: "Active",
      lastLogin: "Never (Invited)",
      permissions: newAdminPermissions.length > 0
        ? newAdminPermissions
        : ["Crop Master Templates", "Support Ticket Resolution"],
    };

    setRoles([...roles, newMember]);
    const auditEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      actor: "Superadmin",
      action: "ADMIN_STAFF_INVITED",
      entity: `${newMember.name} (${newMember.role})`,
      status: "Success",
      ipAddress: "106.195.42.18",
    };
    setAuditLogs([auditEntry, ...auditLogs]);

    setIsAddRoleModalOpen(false);
    setNewAdminName("");
    setNewAdminEmail("");
    setNewAdminPhone("+91 ");
    showToast(`Invited ${newMember.name} as ${newMember.role}`);
  };

  // Broadcast Handlers
  const handleDispatchBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      alert("Please provide both a broadcast title and advisory message.");
      return;
    }

    const newBroadcast: BroadcastDispatch = {
      id: `bc-${Date.now()}`,
      title: broadcastTitle.trim(),
      category: broadcastCategory,
      priority: broadcastPriority,
      targetCrop: broadcastCrop,
      targetDistrict: broadcastDistrict,
      targetPlan: broadcastPlan,
      targetGrowthStage: broadcastGrowthStage,
      message: broadcastMessage.trim(),
      actionPrescription: broadcastPrescription.trim() || undefined,
      channels: broadcastChannels.length > 0 ? broadcastChannels : ["In-App Banner"],
      dispatchedAt: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      dispatchedBy: "Dr. Amanpreet Singh (Superadmin)",
      matchedFarmersCount: broadcastMatchingClients.length,
      matchedAcreage: broadcastMatchedAcreage,
      status: "Active",
    };

    setBroadcasts([newBroadcast, ...broadcasts]);

    // Save to Appwrite Cloud in background
    try {
      fetch("/api/appwrite/advisories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newBroadcast.title,
          category: newBroadcast.category,
          priority: newBroadcast.priority,
          targetCrop: newBroadcast.targetCrop,
          targetDistrict: newBroadcast.targetDistrict,
          targetState: "Punjab",
          message: newBroadcast.message,
          actionPrescription: newBroadcast.actionPrescription || "",
          dispatchedBy: newBroadcast.dispatchedBy,
          isActive: true,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data && data.success && data.advisory) {
            setBroadcasts((prev) =>
              prev.map((b) => (b.id === newBroadcast.id ? { ...b, id: data.advisory.$id } : b))
            );
          }
        })
        .catch((e) => console.warn("Appwrite advisory dispatch error:", e));
    } catch {}

    const auditEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      actor: "Superadmin",
      action: "ADVISORY_BROADCAST_DISPATCHED",
      entity: `${newBroadcast.title} -> ${newBroadcast.targetCrop} (${newBroadcast.targetDistrict})`,
      status: "Success",
      ipAddress: "106.195.42.18",
    };
    setAuditLogs([auditEntry, ...auditLogs]);

    setIsCreateBroadcastModalOpen(false);
    setBroadcastTitle("");
    setBroadcastMessage("");
    setBroadcastPrescription("");
    showToast(`Dispatched alert to ${newBroadcast.matchedFarmersCount} farmers across ${newBroadcast.matchedAcreage} acres!`);
  };

  const handleToggleBroadcastStatus = (id: string) => {
    const target = broadcasts.find((b) => b.id === id);
    const newStatus = target?.status === "Active" ? "Expired" : "Active";
    setBroadcasts(
      broadcasts.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    if (id && !id.startsWith("bc-") && target) {
      fetch("/api/appwrite/advisories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: target.title,
          category: target.category,
          priority: target.priority,
          targetCrop: target.targetCrop,
          targetDistrict: target.targetDistrict,
          message: target.message,
          isActive: newStatus === "Active",
        }),
      }).catch((e) => console.warn("Appwrite update advisory error:", e));
    }
    showToast("Updated broadcast status");
  };

  const handleDeleteBroadcast = (id: string) => {
    if (!confirm("Are you sure you want to delete this broadcast?")) return;
    setBroadcasts(broadcasts.filter((b) => b.id !== id));
    if (id && !id.startsWith("bc-")) {
      fetch(`/api/appwrite/advisories?advisoryId=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch((e) => console.warn("Appwrite delete advisory error:", e));
    }
    showToast("Broadcast removed");
  };

  // CSV Export
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
    showToast(`Exported ${filename}`);
  };

  // Analytics Calculations
  const totalClients = clients.length;
  const totalAcreage = clients.reduce((sum, c) => sum + c.totalAcreage, 0);
  const totalFarms = clients.reduce((sum, c) => sum + c.farms.length, 0);
  const freeClients = clients.filter((c) => c.plan === "Free").length;
  const basicClients = clients.filter((c) => c.plan === "Basic").length;
  const proClients = clients.filter((c) => c.plan === "Pro").length;
  const enterpriseClients = clients.filter((c) => c.plan === "Enterprise").length;
  const monthlyRevenue = Math.round(
    basicClients * (699 / 12) + proClients * (1499 / 12) + enterpriseClients * (4999 / 12)
  );
  const annualRunRate = monthlyRevenue * 12;

  // Platform Analytics Export Handler
  const handleExportAnalyticsSummary = () => {
    const headers = ["Category", "Dimension", "Metric Value", "Unit / Metric Context", "Quarterly Benchmark"];
    const rows: (string | number)[][] = [
      ["Executive Performance", "Annual Recurring Revenue (ARR)", `INR ${annualRunRate.toLocaleString("en-IN")}`, "Annualized run-rate", "+22.5% vs Kharif season"],
      ["Executive Performance", "Monthly Recurring Revenue (MRR)", `INR ${monthlyRevenue.toLocaleString("en-IN")}`, "Monthly cash inflow", "+18.4% QoQ"],
      ["Executive Performance", "Total Monitored Land", totalAcreage, "Acres", "+42 Acres onboarded"],
      ["Executive Performance", "Total Active Farmers", totalClients, "Farmers", "94.2% renewal retention"],
      ["Executive Performance", "Registered Farm Holdings", totalFarms, "Holdings / Parcels", "Average 67.5 Acres / Farm"],
      ["Plan Breakdown", "Free Starter", freeClients, "Accounts", "42% 45-day upgrade rate"],
      ["Plan Breakdown", "Basic Grower", basicClients, "Accounts (INR 699/yr)", "Family farms"],
      ["Plan Breakdown", "Farm Pro", proClients, "Accounts (INR 1,499/yr)", "Sentinel-2 NDVI monitoring"],
      ["Plan Breakdown", "Estate Enterprise", enterpriseClients, "Accounts (INR 4,999/yr)", "IoT Cutoff & PAU Lead"],
      ["Regional Coverage", "Ludhiana & Khanna Belt", "155 Acres", "Punjab (Alluvial Loam)", "38% acreage share"],
      ["Regional Coverage", "Karnal & GT Road Belt", "140 Acres", "Haryana (Rich Basmati Loam)", "35% acreage share"],
      ["Regional Coverage", "Fazilka Citrus Belt", "95 Acres", "Punjab (Sandy Loam / Drip)", "24% acreage share"],
      ["Regional Coverage", "Bathinda Cotton Belt", "48 Acres", "Punjab (Sandy Loam)", "12% acreage share"],
      ["Regional Coverage", "Sangrur Agro Estate", "85 Acres", "Punjab (Clay Loam)", "21% acreage share"],
      ["Field Ops & Agronomy", "Field Visits Completed", fieldVisits.filter((v) => v.workflowStage === "Completed").length, "Dispatches", "4.9/5.0 farmer rating"],
      ["Field Ops & Agronomy", "Field Visits In Progress", fieldVisits.filter((v) => v.workflowStage !== "Completed").length, "Dispatches", "Within 24h SLA"],
      ["Field Ops & Agronomy", "Support Queries Total", tickets.length, "Farmer tickets", "98.2% Resolution Rate"],
      ["Field Ops & Agronomy", "PAU Agronomist Specialists", roles.filter((r) => r.role === "Agronomist Lead").length, "Active Specialists", "Punjab Agricultural University"],
    ];
    handleExportCSV(`khetivo_platform_analytics_${new Date().toISOString().split("T")[0]}.csv`, headers, rows);
  };

// Authentication Guard Screen
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#F4F8F4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0C4B32] text-white flex items-center justify-center font-bold text-sm shadow-md animate-pulse">
            K
          </div>
          <p className="text-xs font-semibold text-[#55685D]">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4F8F4] flex flex-col justify-center py-12 sm:px-6 lg:px-8 antialiased">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0C4B32] text-white font-extrabold text-2xl shadow-lg shadow-[#0C4B32]/15 mb-3 border border-[#166244]">
            K
          </div>
          <h2 className="text-xl font-extrabold text-[#26352D] tracking-tight">
            KHETIVO <span className="text-[#0C4B32]">ADMIN PORTAL</span>
          </h2>
          <p className="mt-1 text-xs text-[#55685D]">
            Sign in with authorized credentials to access central command & live monitoring
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="bg-white py-7 px-6 sm:px-8 shadow-md rounded-2xl border border-[#E5ECE7] space-y-5">
            {/* Security Badge */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E7F3EB] border border-[#C6E2D0] text-[#0C4B32]">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="font-bold">Restricted Platform Access:</span> Authorized agronomists and operations managers only.
              </div>
            </div>

            {/* Default Credentials Helper Card */}
            <div className="p-3.5 rounded-xl bg-[#FAFCFA] border border-[#DCE6DE] text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#26352D]">
                <span>Default Admin Credentials:</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">Demo / Ready</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2.5 rounded-lg border border-[#E5ECE7]">
                <div>
                  <div className="text-[10px] text-[#7A8D80] font-sans font-medium">Email / Gmail:</div>
                  <div className="text-[#0C4B32] font-semibold truncate select-all">admin@gmail.com</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#7A8D80] font-sans font-medium">Password:</div>
                  <div className="text-[#0C4B32] font-semibold truncate select-all">admin123</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAdminEmailInput("admin@gmail.com");
                  setAdminPasswordInput("admin123");
                  setAdminAuthError("");
                }}
                className="w-full text-center text-[11px] font-semibold text-[#0C4B32] hover:text-[#093826] hover:underline cursor-pointer pt-0.5"
              >
                Auto-fill Default Credentials
              </button>
            </div>

            {/* Error Notice */}
            {adminAuthError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{adminAuthError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#26352D] mb-1.5">
                  Admin Gmail / Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    placeholder="e.g. admin@gmail.com"
                    className="w-full px-3.5 py-2.5 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#26352D]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-semibold text-[#55685D] hover:text-[#0C4B32] cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full px-3.5 py-2.5 text-xs text-[#26352D] rounded-xl border border-[#DCE6DE] bg-white outline-none focus:border-[#0C4B32] shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={adminAuthLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0C4B32] hover:bg-[#093826] text-white text-xs font-bold transition-all shadow-md shadow-[#0C4B32]/15 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {adminAuthLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sign In to Admin Portal</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-[#F0F4F1] text-center">
              <Link
                href="/dashboard"
                className="text-xs font-semibold text-[#55685D] hover:text-[#0C4B32] transition-colors"
              >
                ← Return to Farmer Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8F4] flex flex-col antialiased text-[#26352D]">
      {/* Toast Feedback */}
      {adminToast && (
        <div className="fixed top-5 right-5 z-50 p-3.5 rounded-xl bg-[#0C4B32] text-white shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 border border-[#C6E2D0]">
          <CheckCircle2 className="w-4 h-4 text-[#F9B21B] shrink-0" />
          <span>{adminToast}</span>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* ========================================================= */}
        {/* SIDEBAR: SOBER, ORGANIZED NAVIGATION                      */}
        {/* ========================================================= */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#E5ECE7] flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
            }`}
        >
          <div className="overflow-y-auto">
            {/* Header / Brand */}
            <div className="p-4 border-b border-[#E5ECE7] flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0C4B32] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  K
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-[#0C4B32] tracking-tight">KHETIVO</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                      ADMIN
                    </span>
                  </div>
                  <span className="text-[10px] text-[#55685D] block">Platform Control Suite</span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-[#55685D] hover:bg-[#F4F8F4]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Clean Sidebar Navigation */}
            <nav className="p-3 space-y-4">
              {/* PRIMARY */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("overview");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${activeTab === "overview"
                      ? "bg-[#0C4B32] text-white shadow-xs"
                      : "text-[#55685D] hover:text-[#0C4B32] hover:bg-[#F4F8F4]"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    <span>Overview</span>
                  </div>
                </button>
              </div>

              {/* OPERATIONS */}
              <div className="space-y-1 pt-2 border-t border-[#E5ECE7]">
                <span className="text-[10px] font-bold tracking-wider text-[#889B90] uppercase px-3 block mb-1">
                  Operations
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("clients");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${activeTab === "clients"
                      ? "bg-[#0C4B32] text-white shadow-xs"
                      : "text-[#55685D] hover:text-[#0C4B32] hover:bg-[#F4F8F4]"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 shrink-0" />
                    <span>Farmers & Farms</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === "clients" ? "bg-white/20 text-white" : "bg-[#E7F3EB] text-[#0C4B32]"
                      }`}
                  >
                    {clients.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("crops");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${activeTab === "crops"
                      ? "bg-[#0C4B32] text-white shadow-xs"
                      : "text-[#55685D] hover:text-[#0C4B32] hover:bg-[#F4F8F4]"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sprout className="w-4 h-4 shrink-0" />
                    <span>Crop Templates</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === "crops" ? "bg-white/20 text-white" : "bg-[#E7F3EB] text-[#0C4B32]"
                      }`}
                  >
                    {crops.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("broadcasts");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${activeTab === "broadcasts"
                      ? "bg-[#0C4B32] text-white shadow-xs"
                      : "text-[#55685D] hover:text-[#0C4B32] hover:bg-[#F4F8F4]"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-4 h-4 shrink-0" />
                    <span>Advisories & Alerts</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === "broadcasts"
                        ? "bg-white/20 text-white"
                        : "bg-red-100 text-red-800"
                      }`}
                  >
                    {broadcasts.filter((b) => b.status === "Active").length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("field-visits");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${activeTab === "field-visits"
                      ? "bg-[#0C4B32] text-white shadow-xs"
                      : "text-[#55685D] hover:text-[#0C4B32] hover:bg-[#F4F8F4]"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>Field Visits</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === "field-visits" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900"
                      }`}
                  >
                    {fieldVisits.filter((v) => v.workflowStage !== "Completed").length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("support");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${activeTab === "support"
                      ? "bg-[#0C4B32] text-white shadow-xs"
                      : "text-[#55685D] hover:text-[#0C4B32] hover:bg-[#F4F8F4]"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span>Farmer Support</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === "support" ? "bg-white/20 text-white" : "bg-[#E7F3EB] text-[#0C4B32]"
                      }`}
                  >
                    {tickets.filter((t) => t.status !== "Resolved").length}
                  </span>
                </button>
              </div>

              {/* MANAGEMENT */}
              <div className="space-y-1 pt-2 border-t border-[#E5ECE7]">
                <span className="text-[10px] font-bold tracking-wider text-[#889B90] uppercase px-3 block mb-1">
                  Management
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("plans");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${activeTab === "plans"
                      ? "bg-[#0C4B32] text-white shadow-xs"
                      : "text-[#55685D] hover:text-[#0C4B32] hover:bg-[#F4F8F4]"
                    }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>Plans & Pricing</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("analytics");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${activeTab === "analytics"
                      ? "bg-[#0C4B32] text-white shadow-xs"
                      : "text-[#55685D] hover:text-[#0C4B32] hover:bg-[#F4F8F4]"
                    }`}
                >
                  <BarChart2 className="w-4 h-4 shrink-0" />
                  <span>Analytics</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("roles");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${activeTab === "roles"
                      ? "bg-[#0C4B32] text-white shadow-xs"
                      : "text-[#55685D] hover:text-[#0C4B32] hover:bg-[#F4F8F4]"
                    }`}
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>Team & Staff</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("audit");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${activeTab === "audit"
                      ? "bg-[#0C4B32] text-white shadow-xs"
                      : "text-[#55685D] hover:text-[#0C4B32] hover:bg-[#F4F8F4]"
                    }`}
                >
                  <Database className="w-4 h-4 shrink-0" />
                  <span>Activity Logs</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Bottom Sidebar */}
          <div className="p-3 border-t border-[#E5ECE7] space-y-2 bg-[#FBFDFB]">
            <Link
              href="/dashboard"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#E7F3EB] hover:bg-[#D4EBDC] text-[#0C4B32] transition-colors text-xs font-semibold border border-[#C6E2D0] group"
            >
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4" />
                <span>Farmer Portal</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#0C4B32] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <div className="p-2.5 rounded-xl bg-white border border-[#E5ECE7] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#0C4B32] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  AD
                </div>
                <div className="truncate text-xs">
                  <div className="font-bold text-[#26352D] truncate">Dr. Amanpreet Singh</div>
                  <div className="text-[10px] text-[#55685D] truncate">Superadmin</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAdminLogout}
                title="Sign Out of Admin Portal"
                className="p-1 text-[#889B90] hover:text-red-600 rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ========================================================= */}
        {/* MAIN ADMIN WORKSPACE                                      */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          {/* Top Header: Simple, Sober & Uncluttered */}
          <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-[#E5ECE7] px-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-[#55685D] hover:bg-[#F4F8F4] border border-[#DCE6DE]"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div>
                <h1 className="text-base sm:text-lg font-bold text-[#26352D] tracking-tight">
                  {activeTab === "overview" && "Overview"}
                  {activeTab === "clients" && "Farmers & Farms"}
                  {activeTab === "plans" && "Subscription Plans"}
                  {activeTab === "crops" && "Crop Templates"}
                  {activeTab === "broadcasts" && "Advisories & Alerts"}
                  {activeTab === "field-visits" && "Field Visits"}
                  {activeTab === "support" && "Farmer Support"}
                  {activeTab === "analytics" && "Analytics"}
                  {activeTab === "roles" && "Team & Staff"}
                  {activeTab === "audit" && "Activity Logs"}
                </h1>
                <span className="text-[11px] text-[#55685D] hidden sm:inline">
                  {activeTab === "overview" && "Platform summary, key indicators, and immediate actions"}
                  {activeTab === "clients" && "View and manage registered farmers and farm details"}
                  {activeTab === "plans" && "Plan pricing, farm limits, and included features"}
                  {activeTab === "crops" && "Manage crop details, growth stages, and farming advice"}
                  {activeTab === "broadcasts" && "Send farm advisories and weather warnings to farmers"}
                  {activeTab === "field-visits" && "Manage field visit requests and assign field officers"}
                  {activeTab === "support" && "Help farmers with queries and support requests"}
                  {activeTab === "analytics" && "Platform metrics, revenue, and active subscriptions"}
                  {activeTab === "roles" && "Manage staff members and their permissions"}
                  {activeTab === "audit" && "Recent admin activity and security events"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F4F8F4] border border-[#DCE6DE] text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-[#0C4B32]">Dr. Amanpreet</span>
                <span className="text-[10px] text-[#55685D] bg-white px-1.5 py-0.5 rounded border border-[#DCE6DE] font-medium">Superadmin</span>
              </div>

              <button
                type="button"
                onClick={() => setIsAddClientModalOpen(true)}
                className="btn btn-primary text-xs px-3.5 py-2 shadow-xs cursor-pointer inline-flex items-center gap-1.5 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Onboard Farmer</span>
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
            {/* ========================================================================= */}
            {/* 1. EXECUTIVE OVERVIEW                                                    */}
            {/* ========================================================================= */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Greeting & Operational Summary */}
                <div className="bg-gradient-to-r from-[#F4F8F4] via-[#F8FAF8] to-white p-5 rounded-2xl border border-[#DCE6DE] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-base sm:text-lg font-bold text-[#26352D]">
                      Welcome back, Dr. Amanpreet Singh
                    </h2>
                    <p className="text-xs text-[#55685D]">
                      Platform is running smoothly across Punjab & Haryana APMC mandis. You have{" "}
                      <strong className="text-[#0C4B32]">
                        {fieldVisits.filter((v) => v.workflowStage !== "Completed").length} field visits
                      </strong>{" "}
                      and{" "}
                      <strong className="text-amber-800">
                        {tickets.filter((t) => t.status !== "Resolved").length} open queries
                      </strong>{" "}
                      awaiting response.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsAddClientModalOpen(true)}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-[#0C4B32] text-white hover:bg-[#083624] shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Onboard Farmer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddCropModalOpen(true)}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-white text-[#0C4B32] hover:bg-[#F4F8F4] border border-[#DCE6DE] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sprout className="w-3.5 h-3.5" />
                      <span>New Crop</span>
                    </button>
                  </div>
                </div>

                {/* 4 Clean Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#55685D]">
                      <span className="text-xs font-medium">Total Farmers</span>
                      <div className="w-7 h-7 rounded-lg bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#26352D]">{totalClients}</div>
                    <p className="text-[11px] text-[#55685D]">
                      {clients.filter((c) => c.status === "Active").length} Active Accounts
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#55685D]">
                      <span className="text-xs font-medium">Monitored Acreage</span>
                      <div className="w-7 h-7 rounded-lg bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#26352D]">{totalAcreage.toLocaleString()} Acres</div>
                    <p className="text-[11px] text-[#55685D]">{totalFarms} Registered Farm Holdings</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#55685D]">
                      <span className="text-xs font-medium">Estimated MRR</span>
                      <div className="w-7 h-7 rounded-lg bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center">
                        <Receipt className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#26352D]">₹{monthlyRevenue.toLocaleString()}</div>
                    <p className="text-[11px] text-[#55685D]">
                      {basicClients + proClients + enterpriseClients} Paid Subscriptions
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#55685D]">
                      <span className="text-xs font-medium">Action Items</span>
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#26352D]">
                      {tickets.filter((t) => t.status !== "Resolved").length +
                        fieldVisits.filter((v) => v.workflowStage !== "Completed").length}
                    </div>
                    <p className="text-[11px] text-[#55685D]">
                      {fieldVisits.filter((v) => v.workflowStage !== "Completed").length} Visits •{" "}
                      {tickets.filter((t) => t.status !== "Resolved").length} Queries
                    </p>
                  </div>
                </div>

                {/* Two-Column Action Hub */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Recent Farmers */}
                  <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE7]">
                      <div>
                        <h3 className="text-sm font-bold text-[#26352D]">Recently Onboarded Farmers</h3>
                        <p className="text-[11px] text-[#55685D]">Active client roster and land parcels</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("clients")}
                        className="text-xs font-semibold text-[#0C4B32] hover:underline cursor-pointer"
                      >
                        View All ({clients.length}) →
                      </button>
                    </div>

                    <div className="divide-y divide-[#E5ECE7]">
                      {clients.slice(0, 5).map((client) => (
                        <div
                          key={client.id}
                          className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-[#FBFDFB] px-1 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#E7F3EB] text-[#0C4B32] font-bold flex items-center justify-center text-xs shrink-0">
                              {client.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <div className="min-w-0 truncate">
                              <div className="font-bold text-[#26352D] truncate">{client.name}</div>
                              <div className="text-[11px] text-[#55685D] truncate">
                                {client.district} • {client.totalAcreage} Acres ({client.primaryCrop})
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${client.plan === "Enterprise"
                                  ? "bg-purple-50 text-purple-800"
                                  : client.plan === "Pro"
                                    ? "bg-emerald-50 text-emerald-800"
                                    : client.plan === "Basic"
                                      ? "bg-blue-50 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                            >
                              {client.plan}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedClientModal(client)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-[#0C4B32] bg-[#F4F8F4] hover:bg-[#E7F3EB] rounded-lg border border-[#DCE6DE] transition-colors cursor-pointer"
                            >
                              Manage
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Pending Dispatches & Tickets */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Pending Field Visits */}
                    <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E5ECE7]">
                        <h3 className="text-xs font-bold text-[#26352D] uppercase tracking-wider text-[#889B90]">
                          Field Visits Requiring Action
                        </h3>
                        <button
                          type="button"
                          onClick={() => setActiveTab("field-visits")}
                          className="text-[11px] font-semibold text-[#0C4B32] hover:underline cursor-pointer"
                        >
                          All Visits →
                        </button>
                      </div>

                      <div className="space-y-2">
                        {fieldVisits
                          .filter((v) => v.workflowStage !== "Completed")
                          .slice(0, 2)
                          .map((visit) => (
                            <div
                              key={visit.id}
                              className="p-3 rounded-xl bg-[#F8FAF8] border border-[#E5ECE7] space-y-1.5 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#26352D]">{visit.farmerName}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800">
                                  {visit.workflowStage}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#55685D]">
                                {visit.crop} • {visit.plotLandmark} ({visit.scheduledDate})
                              </p>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-[#889B90] font-mono">Specialist: {visit.assignedSpecialist}</span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedVisitModal(visit)}
                                  className="text-[10px] font-semibold text-[#0C4B32] hover:underline cursor-pointer"
                                >
                                  Update Dispatch
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Pending Support Tickets */}
                    <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E5ECE7]">
                        <h3 className="text-xs font-bold text-[#26352D] uppercase tracking-wider text-[#889B90]">
                          Agronomy Support Tickets
                        </h3>
                        <button
                          type="button"
                          onClick={() => setActiveTab("support")}
                          className="text-[11px] font-semibold text-[#0C4B32] hover:underline cursor-pointer"
                        >
                          All Tickets →
                        </button>
                      </div>

                      <div className="space-y-2">
                        {tickets
                          .filter((t) => t.status !== "Resolved")
                          .slice(0, 2)
                          .map((ticket) => (
                            <div
                              key={ticket.id}
                              className="p-3 rounded-xl bg-[#F8FAF8] border border-[#E5ECE7] space-y-1.5 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#26352D] truncate pr-2">{ticket.subject}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-800 shrink-0">
                                  {ticket.priority}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#55685D] truncate">
                                Farmer: {ticket.clientName} ({ticket.crop})
                              </p>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-[#889B90]">{ticket.ticketCode}</span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedTicketModal(ticket)}
                                  className="text-[10px] font-semibold text-[#0C4B32] hover:underline cursor-pointer"
                                >
                                  Reply to Farmer
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. CLIENT & FARM ONBOARDING + USER & SUBSCRIPTION MANAGEMENT              */}
            {/* ========================================================================= */}
            {activeTab === "clients" && (
              <div className="space-y-5 animate-in fade-in">
                {/* Search, Filter & Actions Bar */}
                <div className="bg-white p-4 rounded-2xl border border-[#E5ECE7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-3.5 h-3.5 text-[#889B90] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search by client name, mobile, district, or mandi..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                      />
                    </div>

                    <select
                      value={clientPlanFilter}
                      onChange={(e) => setClientPlanFilter(e.target.value)}
                      className="px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                    >
                      <option value="all">All Plans (Free, Basic, Pro, Enterprise)</option>
                      <option value="Free">Free</option>
                      <option value="Basic">Basic</option>
                      <option value="Pro">Pro</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>

                    <select
                      value={clientStatusFilter}
                      onChange={(e) => setClientStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                    >
                      <option value="all">All Account Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Trial">Trial</option>
                      <option value="Renewal Due">Renewal Due</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const headers = ["Name", "Phone", "Plan", "Status", "Total Farms", "Total Acreage", "District", "Mandi", "Renewal"];
                        const rows = clients.map((c) => [
                          c.name,
                          c.phone,
                          c.plan,
                          c.status,
                          c.farms.length,
                          `${c.totalAcreage} ${c.areaUnit}`,
                          c.district,
                          c.mandi,
                          c.renewalDate,
                        ]);
                        handleExportCSV("khetivo_clients_roster.csv", headers, rows);
                      }}
                      className="px-3 py-2 text-xs font-medium rounded-xl text-[#0C4B32] hover:bg-[#E7F3EB] border border-[#DCE6DE] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAddClientModalOpen(true)}
                      className="btn btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 shadow-xs cursor-pointer font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Onboard New Client</span>
                    </button>
                  </div>
                </div>

                {/* Client Table with Farm Accordion */}
                <div className="bg-white rounded-2xl border border-[#E5ECE7] shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAF8] border-b border-[#E5ECE7] text-[#55685D] font-semibold">
                        <tr>
                          <th className="py-3 px-4">Client & Contact</th>
                          <th className="py-3 px-4">Subscription Plan</th>
                          <th className="py-3 px-4">Holdings & Acreage</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Renewal Expiry</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5ECE7]">
                        {(() => {
                          const filteredClients = clients.filter((c) => {
                            const matchSearch =
                              c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                              c.phone.includes(clientSearch) ||
                              c.district.toLowerCase().includes(clientSearch.toLowerCase());
                            const matchPlan = clientPlanFilter === "all" || c.plan === clientPlanFilter;
                            const matchStatus = clientStatusFilter === "all" || c.status === clientStatusFilter;
                            return matchSearch && matchPlan && matchStatus;
                          });

                          if (filteredClients.length === 0) {
                            return (
                              <tr>
                                <td colSpan={6} className="py-12 text-center text-xs text-[#55685D]">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <Users className="w-8 h-8 text-[#889B90]/60 stroke-1" />
                                    <p className="font-semibold text-[#26352D]">No client accounts found</p>
                                    <p className="text-[11px] text-[#889B90]">Try clearing search terms or changing the plan/status filters.</p>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setClientSearch("");
                                        setClientPlanFilter("all");
                                        setClientStatusFilter("all");
                                      }}
                                      className="mt-2 text-[11px] font-semibold text-[#0C4B32] bg-[#E7F3EB] px-3 py-1 rounded-lg border border-[#C6E2D0] hover:bg-[#D4EBDC] transition-colors cursor-pointer"
                                    >
                                      Reset All Filters
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          }

                          return filteredClients.map((client) => (
                            <tr key={client.id} className="hover:bg-[#FBFDFB] transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-bold text-xs text-[#26352D]">{client.name}</div>
                                <div className="text-[11px] text-[#55685D]">
                                  {client.phone} • {client.district}, {client.state}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span
                                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${client.plan === "Enterprise"
                                      ? "bg-purple-50 text-purple-800 border border-purple-200"
                                      : client.plan === "Pro"
                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                        : client.plan === "Basic"
                                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                                          : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                  {client.plan} Tier
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                <span className="font-bold text-[#26352D] text-xs">
                                  {client.totalAcreage} {client.areaUnit}
                                </span>
                                <div className="text-[10px] text-[#889B90]">
                                  {client.farms.length} Farm {client.farms.length === 1 ? "Holding" : "Holdings"}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${client.status === "Active"
                                      ? "bg-emerald-50 text-emerald-800"
                                      : client.status === "Trial"
                                        ? "bg-blue-50 text-blue-800"
                                        : client.status === "Renewal Due"
                                          ? "bg-amber-50 text-amber-800"
                                          : "bg-red-50 text-red-800"
                                    }`}
                                >
                                  {client.status}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-[#55685D] text-xs">
                                {client.renewalDate}
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTargetClientIdForFarm(client.id);
                                      setIsAddFarmModalOpen(true);
                                    }}
                                    title="Add Another Farm to Client"
                                    className="p-1.5 rounded-lg text-[#0C4B32] hover:bg-[#E7F3EB] transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedClientModal(client)}
                                    title="Manage Subscription & Farms"
                                    className="p-1.5 rounded-lg text-[#55685D] hover:text-[#0C4B32] hover:bg-[#F4F8F4] transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <Link
                                    href={`/dashboard?impersonate=${encodeURIComponent(client.name)}`}
                                    title="Open Farm Dashboard (Impersonate)"
                                    className="p-1.5 rounded-lg text-[#0C4B32] hover:bg-[#E7F3EB] transition-colors inline-flex items-center"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. PLAN MANAGEMENT: FREE, BASIC, PRO, ENTERPRISE                          */}
            {/* ========================================================================= */}
            {activeTab === "plans" && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5ECE7]">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#26352D]">
                      Khetivo SaaS Plan Tiers & Entitlements
                    </h2>
                    <p className="text-xs text-[#55685D]">
                      Configure limits, pricing, and feature access for all 4 customer tiers.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {plans.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-[#E5ECE7] p-5 shadow-xs flex flex-col justify-between space-y-4 relative"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.badgeColor}`}>
                            {p.id}
                          </span>
                          <span className="text-[11px] text-[#55685D] font-medium">
                            {p.activeSubscribers} Active Users
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-[#26352D]">{p.name}</h3>
                          <div className="text-lg font-extrabold text-[#0C4B32] mt-0.5">
                            {p.pricePerYear === 0 ? "₹0 (Free)" : `₹${p.pricePerYear.toLocaleString()} / Year`}
                          </div>
                          <p className="text-[11px] text-[#55685D] mt-1 leading-relaxed">{p.tagline}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E5ECE7] space-y-1 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-[#889B90]">Max Holdings:</span>
                            <strong className="text-[#26352D]">{p.maxFarms}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#889B90]">Max Area:</span>
                            <strong className="text-[#26352D]">{p.maxAcreage}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#889B90]">NDVI Satellite:</span>
                            <strong className="text-[#0C4B32]">{p.satelliteRefresh}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#889B90]">Team Seats:</span>
                            <strong className="text-[#26352D]">{p.teamSeats}</strong>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1 text-[11px]">
                          <span className="font-semibold text-[#26352D] block">Included Entitlements:</span>
                          {p.features.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-[#55685D]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#0C4B32] shrink-0 mt-0.5" />
                              <span className="leading-tight">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#E5ECE7]">
                        <button
                          type="button"
                          onClick={() => setEditingPlan(p)}
                          className="w-full py-2 rounded-xl text-xs font-semibold text-[#0C4B32] bg-[#E7F3EB] hover:bg-[#D4EBDC] transition-colors border border-[#C6E2D0] cursor-pointer"
                        >
                          Configure {p.id} Tier
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 4. CROP MASTER TEMPLATES                                                  */}
            {/* ========================================================================= */}
            {activeTab === "crops" && (
              <div className="space-y-5 animate-in fade-in">
                <div className="bg-white p-4 rounded-2xl border border-[#E5ECE7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 text-[#889B90] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search crop master templates by name or variety..."
                      value={cropSearch}
                      onChange={(e) => setCropSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenNewCropModal}
                      className="btn btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 shadow-xs cursor-pointer font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Crop Template</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {crops
                    .filter(
                      (c) =>
                        (c.name || c.cropName).toLowerCase().includes(cropSearch.toLowerCase()) ||
                        c.variety.toLowerCase().includes(cropSearch.toLowerCase()) ||
                        c.varieties.some((v) => v.toLowerCase().includes(cropSearch.toLowerCase()))
                    )
                    .map((crop) => (
                      <div
                        key={crop.id}
                        className="bg-white rounded-2xl border border-[#E5ECE7] hover:border-[#0C4B32]/40 transition-all p-5 shadow-xs flex flex-col justify-between space-y-4 group hover:shadow-sm"
                      >
                        <div className="space-y-3">
                          {/* Card Header: Crop Name, Season, Yield */}
                          <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E5ECE7]">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center shrink-0 border border-[#C6E2D0]">
                                <Sprout className="w-5 h-5 text-[#0C4B32]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-sm font-bold text-[#26352D]">
                                    {crop.name || crop.cropName}
                                  </h3>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E7F3EB] text-[#0C4B32] border border-[#C6E2D0]">
                                    {crop.season}
                                  </span>
                                  {crop.badge && (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F4F8F4] text-[#55685D] border border-[#DCE6DE]">
                                      {crop.badge}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-[#55685D] mt-0.5 block">
                                  Main Variety: <strong className="text-[#0C4B32]">{crop.variety}</strong>
                                </span>
                              </div>
                            </div>

                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                              Yield: {crop.targetYieldQuintals}
                            </span>
                          </div>

                          {/* Key Farming Details Grid (Clean 2-Column) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E5ECE7]">
                              <span className="text-[10px] text-[#889B90] block">Duration & Sowing</span>
                              <span className="font-semibold text-[#26352D] text-[11px] block mt-0.5 truncate">
                                {crop.duration || `${crop.durationDays} Days`} • {crop.sowingWindow}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E5ECE7]">
                              <span className="text-[10px] text-[#889B90] block">Soil & Irrigation</span>
                              <span className="font-semibold text-[#26352D] text-[11px] block mt-0.5 truncate">
                                {crop.defaultSoil ? crop.defaultSoil.split("(")[0].trim() : "Alluvial Loam"} • {crop.defaultIrrigation ? crop.defaultIrrigation.split("(")[0].trim() : "Drip"}
                              </span>
                            </div>
                          </div>

                          {/* Quick Feature Badges */}
                          <div className="flex items-center gap-2 flex-wrap text-[11px] pt-0.5">
                            <span className="px-2.5 py-1 rounded-lg bg-[#F4F8F4] text-[#0C4B32] border border-[#DCE6DE] font-medium flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#278449]" />
                              <span>{crop.growthTimeline?.length || 0} Growth Stages</span>
                            </span>

                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{crop.dos?.length || 4} Recommended Do&apos;s</span>
                            </span>

                            <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-200 font-medium flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                              <span>{crop.donts?.length || 4} Things to Avoid</span>
                            </span>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setSelectedCropModal(crop)}
                            className="text-xs font-semibold text-[#0C4B32] hover:text-[#083624] bg-[#E7F3EB] hover:bg-[#D4EBDC] border border-[#C6E2D0] px-3.5 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Growth Guide</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditCropTemplate(crop)}
                              className="px-3 py-1.5 text-xs font-medium text-[#55685D] hover:text-[#0C4B32] hover:bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                              title="Edit Crop Template"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCropTemplate(crop.id)}
                              className="p-1.5 text-[#889B90] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Delete Crop Template"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* ADVISORY BROADCASTS (SIMPLE & SOBER)                                      */}
            {/* ========================================================================= */}
            {activeTab === "broadcasts" && (
              <div className="space-y-5 animate-in fade-in">
                {/* Clean Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#26352D]">
                      Advisory Broadcasts
                    </h2>
                    <p className="text-xs text-[#55685D] mt-0.5">
                      Send simple pest alerts and weather warnings targeted by crop and district.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCreateBroadcastModalOpen(true)}
                    className="btn btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 shadow-xs cursor-pointer rounded-xl font-semibold shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Broadcast</span>
                  </button>
                </div>

                {/* Simple List of Broadcasts */}
                <div className="bg-white rounded-2xl border border-[#E5ECE7] shadow-xs divide-y divide-[#E5ECE7] overflow-hidden">
                  <div className="p-4 bg-[#F8FAF8] border-b border-[#E5ECE7] flex items-center justify-between text-xs text-[#55685D] font-medium">
                    <span>Active & Past Dispatches ({broadcasts.length})</span>
                    <span>Live reach across farms</span>
                  </div>

                  {broadcasts.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-[#FBFDFB] transition-colors text-xs"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${b.status === "Active" ? "bg-emerald-500" : "bg-gray-400"
                              }`}
                          />
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.priority === "High / Emergency"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-[#F4F8F4] text-[#55685D] border border-[#DCE6DE]"
                              }`}
                          >
                            {b.category}
                          </span>
                          <strong className="text-sm text-[#26352D] font-bold truncate">
                            {b.title}
                          </strong>
                        </div>

                        <p className="text-xs text-[#55685D] leading-relaxed line-clamp-2">
                          {b.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#889B90] pt-1">
                          <span>
                            Target: <strong className="text-[#26352D]">{b.targetCrop}</strong> •{" "}
                            <strong className="text-[#26352D]">{b.targetDistrict}</strong>
                          </span>
                          <span>•</span>
                          <span className="text-[#0C4B32] font-semibold">
                            {b.matchedFarmersCount} Farmers ({b.matchedAcreage} Acres)
                          </span>
                          <span>•</span>
                          <span>{b.dispatchedAt}</span>
                        </div>
                      </div>

                      {/* Simple Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleToggleBroadcastStatus(b.id)}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[#DCE6DE] bg-white hover:bg-[#F4F8F4] text-[#26352D] cursor-pointer"
                        >
                          {b.status === "Active" ? "Expire" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBroadcast(b.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {broadcasts.length === 0 && (
                    <div className="p-8 text-center text-xs text-[#55685D]">
                      No broadcasts sent yet. Click &quot;New Broadcast&quot; to send an alert.
                    </div>
                  )}
                </div>

                {/* Simple Sober New Broadcast Modal */}
                {isCreateBroadcastModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white rounded-2xl border border-[#DCE6DE] shadow-xl max-w-lg w-full p-5 sm:p-6 space-y-4 my-8 text-xs animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE7]">
                        <h3 className="font-bold text-base text-[#26352D]">
                          New Advisory Broadcast
                        </h3>
                        <button
                          type="button"
                          onClick={() => setIsCreateBroadcastModalOpen(false)}
                          className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleDispatchBroadcast} className="space-y-4">
                        {/* 1. Targeting Dropdowns (Crop & District) */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-[#26352D] block">
                              Target District:
                            </label>
                            <select
                              value={broadcastDistrict}
                              onChange={(e) => setBroadcastDistrict(e.target.value)}
                              className="w-full px-2.5 py-2 text-xs bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl outline-none focus:border-[#0C4B32]"
                            >
                              <option value="All Districts">All Districts</option>
                              <option value="Ludhiana">Ludhiana & Khanna</option>
                              <option value="Karnal">Karnal Basin</option>
                              <option value="Fazilka">Fazilka & Abohar</option>
                              <option value="Bathinda">Bathinda</option>
                              <option value="Sangrur">Sangrur</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-[#26352D] block">
                              Related Crop:
                            </label>
                            <select
                              value={broadcastCrop}
                              onChange={(e) => setBroadcastCrop(e.target.value)}
                              className="w-full px-2.5 py-2 text-xs bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl outline-none focus:border-[#0C4B32]"
                            >
                              <option value="All Crops">All Crops</option>
                              <option value="Wheat (Kanak)">Wheat</option>
                              <option value="Paddy / Rice (Dhan)">Paddy / Basmati</option>
                              <option value="Mustard / Sarson">Mustard</option>
                              <option value="Bt Cotton (Narma)">Cotton</option>
                              <option value="Potato (Aloo)">Potato</option>
                            </select>
                          </div>
                        </div>

                        {/* Audience Hint */}
                        <div className="px-3 py-2 rounded-xl bg-[#E7F3EB] text-[#0C4B32] text-[11px] font-semibold flex items-center justify-between">
                          <span>Audience Reach:</span>
                          <span>{broadcastMatchingClients.length} Farmers • {broadcastMatchedAcreage} Acres</span>
                        </div>

                        {/* 2. Broadcast Type */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-[#26352D] block">
                            Alert Type:
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: "Pest & Disease Alert", label: "Pest Alert", priority: "High / Emergency" },
                              { id: "Weather & Frost Warning", label: "Weather Alert", priority: "Medium / Advisory" },
                              { id: "General Announcement", label: "General Notice", priority: "Standard" },
                            ].map((type) => (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => {
                                  setBroadcastCategory(type.id as any);
                                  setBroadcastPriority(type.priority as any);
                                }}
                                className={`py-2 px-2 text-[11px] font-semibold rounded-xl border text-center transition-all cursor-pointer ${broadcastCategory === type.id
                                    ? "bg-[#0C4B32] text-white border-[#0C4B32] shadow-2xs"
                                    : "bg-[#F4F8F4] text-[#55685D] border-[#DCE6DE]"
                                  }`}
                              >
                                {type.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 3. Title */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-[#26352D] block">
                            Headline / Subject:
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Yellow Rust Alert in Ludhiana"
                            value={broadcastTitle}
                            onChange={(e) => setBroadcastTitle(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl outline-none focus:border-[#0C4B32]"
                          />
                        </div>

                        {/* 4. Message */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-[#26352D] block">
                            Advisory Message:
                          </label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Write message for the farmer dashboard..."
                            value={broadcastMessage}
                            onChange={(e) => setBroadcastMessage(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl outline-none focus:border-[#0C4B32] resize-none"
                          />
                        </div>

                        {/* Modal Footer */}
                        <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-end gap-2.5">
                          <button
                            type="button"
                            onClick={() => setIsCreateBroadcastModalOpen(false)}
                            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#DCE6DE] bg-white text-[#55685D]"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={broadcastMatchingClients.length === 0}
                            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0C4B32] text-white hover:bg-[#083624] disabled:bg-gray-300"
                          >
                            Send Broadcast
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === "field-visits" && (
              <div className="space-y-5 animate-in fade-in">

                {/* ========================================================= */}
                {/* ADMIN LOCATION ACCESS CONTROL FOR "RAISE A FIELD VISIT"   */}
                {/* ========================================================= */}
                <div className="bg-white rounded-2xl border border-[#DCE6DE] p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5ECE7]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-[#0C4B32]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#26352D]">
                            "Raise a Field Visit" Location Access Control
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            fieldVisitLocationMode === "selected"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-blue-50 text-blue-800 border-blue-200"
                          }`}>
                            {fieldVisitLocationMode === "selected" ? "Selective Locations Active" : "Universal (All Locations)"}
                          </span>
                        </div>
                        <p className="text-xs text-[#55685D] mt-0.5">
                          Control which farm locations and districts display the <strong className="text-[#0C4B32]">"Raise a Field Visit"</strong> button on the farmer dashboard.
                        </p>
                      </div>
                    </div>

                    {/* Mode Toggle Switcher */}
                    <div className="flex items-center p-1 bg-[#F4F8F4] rounded-xl border border-[#DCE6DE] self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setFieldVisitLocationMode("selected");
                          handleSaveFieldVisitLocations("selected", fieldVisitAllowedLocations);
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          fieldVisitLocationMode === "selected"
                            ? "bg-[#0C4B32] text-white shadow-2xs"
                            : "text-[#55685D] hover:text-[#26352D]"
                        }`}
                      >
                        Selected Locations Only
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFieldVisitLocationMode("all");
                          handleSaveFieldVisitLocations("all", fieldVisitAllowedLocations);
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          fieldVisitLocationMode === "all"
                            ? "bg-[#0C4B32] text-white shadow-2xs"
                            : "text-[#55685D] hover:text-[#26352D]"
                        }`}
                      >
                        All Locations
                      </button>
                    </div>
                  </div>

                  {fieldVisitLocationMode === "selected" ? (
                    <div className="space-y-3 pt-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#26352D]">
                          Active Eligible Locations ({fieldVisitAllowedLocations.length}):
                        </span>
                        <span className="text-[11px] text-[#55685D]">
                          Farmers with farms registered in these districts/cities will see the button.
                        </span>
                      </div>

                      {/* Chips list of currently active locations */}
                      <div className="flex flex-wrap items-center gap-2">
                        {fieldVisitAllowedLocations.map((loc) => (
                          <span
                            key={loc}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4F8F4] border border-[#DCE6DE] text-xs font-medium text-[#26352D]"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#0C4B32]" />
                            <span>{loc}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAllowedLocation(loc)}
                              title={`Remove ${loc}`}
                              className="text-[#889B90] hover:text-red-600 transition-colors ml-0.5 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Add new location input + Quick Presets */}
                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        <div className="relative flex-1 max-w-md">
                          <input
                            type="text"
                            placeholder="Add district or city name (e.g. Ludhiana, Khanna, Karnal, Patiala)..."
                            value={newLocationInput}
                            onChange={(e) => setNewLocationInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddAllowedLocation(newLocationInput);
                              }
                            }}
                            className="w-full px-3.5 py-2 text-xs bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddAllowedLocation(newLocationInput)}
                          className="btn btn-primary text-xs px-4 py-2 inline-flex items-center justify-center gap-1.5 rounded-xl shadow-xs cursor-pointer font-medium"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Location</span>
                        </button>

                        {/* Quick Presets */}
                        <div className="hidden lg:flex items-center gap-1.5 ml-auto text-[11px] text-[#55685D]">
                          <span>Quick add:</span>
                          {["Ludhiana", "Khanna", "Sangrur", "Bathinda", "Karnal", "Haldwani", "Jalandhar", "Patiala", "Amritsar"]
                            .filter((item) => !fieldVisitAllowedLocations.some((l) => l.toLowerCase() === item.toLowerCase()))
                            .slice(0, 4)
                            .map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => handleAddAllowedLocation(preset)}
                                className="px-2 py-0.5 rounded-lg bg-[#F4F8F4] hover:bg-[#E7F3EB] text-[#0C4B32] border border-[#DCE6DE] cursor-pointer font-medium transition-colors"
                              >
                                + {preset}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        <strong>Universal Mode Active:</strong> The <strong>"Raise a Field Visit"</strong> button is currently visible to all registered farmers across all geographic regions and districts.
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E5ECE7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-3.5 h-3.5 text-[#889B90] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search leads by farmer name, mobile number, or crop..."
                        value={visitSearch}
                        onChange={(e) => setVisitSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                      />
                    </div>

                    <select
                      value={visitStatusFilter}
                      onChange={(e) => setVisitStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                    >
                      <option value="all">All Pipeline Stages</option>
                      <option value="Lead Captured">Lead Captured (Pending Payment)</option>
                      <option value="Payment Verified">Payment Verified</option>
                      <option value="Agronomist Assigned">Agronomist Assigned</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fieldVisits
                    .filter((v) => {
                      const matchSearch =
                        v.farmerName.toLowerCase().includes(visitSearch.toLowerCase()) ||
                        v.phone.includes(visitSearch);
                      const matchStatus = visitStatusFilter === "all" || v.workflowStage === visitStatusFilter;
                      return matchSearch && matchStatus;
                    })
                    .map((visit) => (
                      <div
                        key={visit.id}
                        className="bg-white rounded-2xl border border-[#E5ECE7] p-5 shadow-xs space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between pb-2 border-b border-[#E5ECE7]">
                            <div>
                              <strong className="text-sm text-[#26352D]">{visit.farmerName}</strong>
                              <div className="text-[11px] text-[#55685D]">{visit.phone} • {visit.farmName}</div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E7F3EB] text-[#0C4B32]">
                              {visit.workflowStage}
                            </span>
                          </div>

                          <div className="text-xs space-y-1">
                            <div><span className="text-[#889B90]">Crop & Issue:</span> <strong className="text-[#26352D]">{visit.crop} ({visit.reason})</strong></div>
                            <div><span className="text-[#889B90]">Scheduled:</span> <strong className="text-[#0C4B32]">{visit.scheduledDate} • {visit.timeSlot}</strong></div>
                            <div><span className="text-[#889B90]">Assigned Specialist:</span> <strong className="text-[#26352D]">{visit.assignedSpecialist}</strong></div>
                            <div><span className="text-[#889B90]">Fee:</span> <strong>₹{visit.fee} ({visit.paymentStatus})</strong></div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#E5ECE7] flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedVisitModal(visit)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0C4B32] text-white hover:bg-[#083C28] cursor-pointer"
                          >
                            Assign / Update
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. SUPPORT TICKET MANAGEMENT                                              */}
            {/* ========================================================================= */}
            {activeTab === "support" && (
              <div className="space-y-5 animate-in fade-in">
                <div className="bg-white p-4 rounded-2xl border border-[#E5ECE7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 text-[#889B90] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search support queries by farmer name or problem..."
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {tickets.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white rounded-2xl border border-[#E5ECE7] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#0C4B32] bg-[#E7F3EB] px-2 py-0.2 rounded">
                            {t.ticketCode}
                          </span>
                          <strong className="text-xs text-[#26352D]">{t.subject}</strong>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-50 text-amber-800">
                            {t.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#55685D]">
                          Farmer: <strong>{t.clientName}</strong> ({t.phone}) • Farm: {t.farmName} • Crop: {t.crop}
                        </p>
                        <div className="text-[10px] text-[#889B90]">
                          Assigned: <span className="text-[#0C4B32] font-semibold">{t.assignedAgronomist}</span> • Received: {t.createdAt}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedTicketModal(t)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#E7F3EB] text-[#0C4B32] hover:bg-[#D4EBDC] transition-colors cursor-pointer"
                        >
                          View Thread & Reply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 6. PLATFORM ANALYTICS                                                    */}
            {/* ========================================================================= */}
            {activeTab === "analytics" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Clean, Simple Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#26352D]">
                      Platform Analytics
                    </h2>
                    <p className="text-xs text-[#55685D] mt-0.5">
                      Overview of revenue, active farmers, land coverage, and regional adoption.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5 bg-[#F4F8F4] px-2.5 py-1.5 rounded-xl border border-[#DCE6DE] text-xs">
                      <Calendar className="w-3.5 h-3.5 text-[#0C4B32]" />
                      <select
                        value={analyticsTimeframe}
                        onChange={(e) => setAnalyticsTimeframe(e.target.value as any)}
                        className="bg-transparent text-xs font-semibold text-[#26352D] outline-none cursor-pointer"
                      >
                        <option value="season">Current Season (Rabi 2026-27)</option>
                        <option value="month">Last 30 Days</option>
                        <option value="year">Full Year (FY 2026)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportAnalyticsSummary}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#0C4B32] text-white hover:bg-[#083624] shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* 4 Clean Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Revenue Card */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#55685D]">
                      <span className="text-xs font-medium">Monthly Revenue</span>
                      <div className="w-8 h-8 rounded-xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center">
                        <Receipt className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#0C4B32]">
                      ₹{monthlyRevenue.toLocaleString("en-IN")}
                    </div>
                    <p className="text-[11px] text-[#55685D] flex items-center justify-between pt-1 border-t border-[#F0F4F1]">
                      <span>ARR: ₹{(monthlyRevenue * 12).toLocaleString("en-IN")}</span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        +22.5%
                      </span>
                    </p>
                  </div>

                  {/* Monitored Land */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#55685D]">
                      <span className="text-xs font-medium">Monitored Land</span>
                      <div className="w-8 h-8 rounded-xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#26352D]">
                      {totalAcreage.toLocaleString()} Acres
                    </div>
                    <p className="text-[11px] text-[#55685D] flex items-center justify-between pt-1 border-t border-[#F0F4F1]">
                      <span>{totalFarms} Registered Holdings</span>
                      <span className="font-semibold text-[#0C4B32] bg-[#E7F3EB] px-1.5 py-0.5 rounded">
                        GPS Active
                      </span>
                    </p>
                  </div>

                  {/* Total Farmers */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#55685D]">
                      <span className="text-xs font-medium">Total Farmers</span>
                      <div className="w-8 h-8 rounded-xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#26352D]">
                      {totalClients}
                    </div>
                    <p className="text-[11px] text-[#55685D] flex items-center justify-between pt-1 border-t border-[#F0F4F1]">
                      <span>{basicClients + proClients + enterpriseClients} Paid Subscriptions</span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        94% Retained
                      </span>
                    </p>
                  </div>

                  {/* Advisory SLA */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#55685D]">
                      <span className="text-xs font-medium">Support & Field SLA</span>
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#26352D]">
                      98.2%
                    </div>
                    <p className="text-[11px] text-[#55685D] flex items-center justify-between pt-1 border-t border-[#F0F4F1]">
                      <span>{tickets.length} Queries • {fieldVisits.length} Visits</span>
                      <span className="font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                        2.4h Avg
                      </span>
                    </p>
                  </div>
                </div>

                {/* Primary 2-Column Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Left: Monthly Revenue Trajectory (Simple, Clean Bar Chart) */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#26352D]">
                          Monthly Revenue Growth
                        </h3>
                        <p className="text-xs text-[#55685D] mt-0.5">
                          Inflow over the last 6 months (May – Oct 2026)
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#0C4B32] bg-[#E7F3EB] px-2.5 py-1 rounded-full border border-[#C6E2D0]">
                        +22.5% Growth
                      </span>
                    </div>

                    {/* Clean Minimal Bar Chart */}
                    <div className="pt-4 pb-2">
                      <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 pt-4 border-b border-[#E5ECE7]">
                        {[
                          { month: "May", amount: 14.2, label: "₹14k" },
                          { month: "Jun", amount: 18.9, label: "₹19k" },
                          { month: "Jul", amount: 24.5, label: "₹25k" },
                          { month: "Aug", amount: 29.8, label: "₹30k" },
                          { month: "Sep", amount: 36.2, label: "₹36k" },
                          { month: "Oct", amount: 45.5, label: "₹45k" },
                        ].map((item, idx) => (
                          <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                            <span className="text-[10px] font-bold text-[#55685D] group-hover:text-[#0C4B32] mb-1.5">
                              {item.label}
                            </span>
                            <div className="w-full flex items-end justify-center h-full">
                              <div
                                style={{ height: `${(item.amount / 50) * 100}%` }}
                                className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${idx === 5
                                    ? "bg-[#0C4B32] shadow-xs"
                                    : "bg-[#278449]/70 hover:bg-[#0C4B32]"
                                  }`}
                              />
                            </div>
                            <span className="text-xs font-medium text-[#55685D] mt-2">
                              {item.month}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-[#55685D] text-center pt-1">
                      Steady expansion driven by Farm Pro & Enterprise onboarding across Khanna and Karnal mandis.
                    </p>
                  </div>

                  {/* Right: Active Subscriptions by Tier */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#26352D]">
                          Active Subscriptions by Tier
                        </h3>
                        <p className="text-xs text-[#55685D] mt-0.5">
                          Breakdown of registered farmers across plan tiers
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#26352D] bg-[#F4F8F4] px-2.5 py-1 rounded-lg border border-[#DCE6DE]">
                        {totalClients} Farmers
                      </span>
                    </div>

                    <div className="space-y-3.5 text-xs pt-1">
                      {/* Free Starter */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-semibold">
                          <span className="text-gray-700">Free Starter</span>
                          <span className="text-[#55685D] font-bold">
                            {freeClients} farmers ({totalClients > 0 ? Math.round((freeClients / totalClients) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full bg-gray-400 rounded-full"
                            style={{ width: `${totalClients > 0 ? (freeClients / totalClients) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Basic */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-semibold">
                          <span className="text-blue-800">Basic Grower (₹699/yr)</span>
                          <span className="text-[#55685D] font-bold">
                            {basicClients} farmers ({totalClients > 0 ? Math.round((basicClients / totalClients) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-blue-100 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${totalClients > 0 ? (basicClients / totalClients) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Pro */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-semibold">
                          <span className="text-[#0C4B32]">Farm Pro (₹1,499/yr)</span>
                          <span className="text-[#55685D] font-bold">
                            {proClients} farmers ({totalClients > 0 ? Math.round((proClients / totalClients) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
                          <div
                            className="h-full bg-[#0C4B32] rounded-full"
                            style={{ width: `${totalClients > 0 ? (proClients / totalClients) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Enterprise */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-semibold">
                          <span className="text-purple-800">Estate Enterprise (₹4,999/yr)</span>
                          <span className="text-[#55685D] font-bold">
                            {enterpriseClients} estates ({totalClients > 0 ? Math.round((enterpriseClients / totalClients) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-purple-100 overflow-hidden">
                          <div
                            className="h-full bg-purple-700 rounded-full"
                            style={{ width: `${totalClients > 0 ? (enterpriseClients / totalClients) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#E7F3EB]/60 border border-[#C6E2D0] flex items-center justify-between text-xs text-[#0C4B32]">
                      <span className="font-semibold">Paid Conversion Rate:</span>
                      <strong className="font-bold">
                        {totalClients > 0 ? Math.round(((basicClients + proClients + enterpriseClients) / totalClients) * 100) : 0}% Paid Accounts
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Secondary 2-Column Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Left: Regional Acreage Coverage */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#26352D]">
                          Regional Acreage Coverage
                        </h3>
                        <p className="text-xs text-[#55685D] mt-0.5">
                          Farmland distribution across key agricultural districts
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#0C4B32]">
                        {totalAcreage} Total Acres
                      </span>
                    </div>

                    <div className="space-y-3 text-xs pt-1">
                      <div>
                        <div className="flex justify-between font-semibold pb-1">
                          <span className="text-[#26352D]">Ludhiana & Khanna Belt (Punjab)</span>
                          <span className="text-[#55685D]">155 Acres (38%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full bg-[#0C4B32] rounded-full" style={{ width: "38%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-semibold pb-1">
                          <span className="text-[#26352D]">Karnal & GT Road Belt (Haryana)</span>
                          <span className="text-[#55685D]">140 Acres (35%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full bg-[#278449] rounded-full" style={{ width: "35%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-semibold pb-1">
                          <span className="text-[#26352D]">Fazilka & Abohar Orchards (Punjab)</span>
                          <span className="text-[#55685D]">95 Acres (24%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: "24%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-semibold pb-1">
                          <span className="text-[#26352D]">Sangrur Agro Basin (Punjab)</span>
                          <span className="text-[#55685D]">85 Acres (21%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full bg-purple-600 rounded-full" style={{ width: "21%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Platform Health Highlights */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#26352D]">
                          Platform Health & Agronomy Summary
                        </h3>
                        <p className="text-xs text-[#55685D] mt-0.5">
                          Core operational metrics and crop coverage
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#0C4B32]">
                        All Systems Normal
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-3 rounded-xl bg-[#F4F8F4] border border-[#DCE6DE] space-y-1">
                        <span className="text-[11px] text-[#55685D] block">Top Crops</span>
                        <strong className="text-sm text-[#0C4B32] block">Wheat & Paddy</strong>
                        <span className="text-[10px] text-[#55685D]">76% of total farmland</span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F4F8F4] border border-[#DCE6DE] space-y-1">
                        <span className="text-[11px] text-[#55685D] block">Satellite Health</span>
                        <strong className="text-sm text-[#0C4B32] block">0.76 Avg NDVI</strong>
                        <span className="text-[10px] text-emerald-700">Healthy vegetative canopy</span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F4F8F4] border border-[#DCE6DE] space-y-1">
                        <span className="text-[11px] text-[#55685D] block">Irrigation Setup</span>
                        <strong className="text-sm text-[#26352D] block">55% Solar Pump</strong>
                        <span className="text-[10px] text-[#55685D]">Sensor cutoff active</span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F4F8F4] border border-[#DCE6DE] space-y-1">
                        <span className="text-[11px] text-[#55685D] block">Field Visit Rating</span>
                        <strong className="text-sm text-[#26352D] block">4.9 / 5.0 ⭐</strong>
                        <span className="text-[10px] text-[#55685D]">{fieldVisits.length} visits logged</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 7. ROLE-BASED ADMIN ACCESS                                               */}
            {/* ========================================================================= */}
            {activeTab === "roles" && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5ECE7]">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#26352D]">
                      Admin Staff & Role Permissions Matrix
                    </h2>
                    <p className="text-xs text-[#55685D]">
                      Assign specific access rights across Agronomists, Support Agents, and Billing Operators.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddRoleModalOpen(true)}
                    className="btn btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Staff Member</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white rounded-2xl border border-[#E5ECE7] p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between pb-2 border-b border-[#E5ECE7]">
                        <div>
                          <strong className="text-sm text-[#26352D]">{member.name}</strong>
                          <span className="text-[11px] text-[#55685D] block">{member.email} • {member.phone}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E7F3EB] text-[#0C4B32]">
                          {member.role}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <span className="font-semibold text-[#26352D] block">Assigned Permissions:</span>
                        <div className="flex flex-wrap gap-1">
                          {member.permissions.map((perm) => (
                            <span
                              key={perm}
                              className="text-[10px] bg-[#F8FAF8] border border-[#E5ECE7] px-2 py-0.5 rounded-lg text-[#55685D]"
                            >
                              ✓ {perm}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-[10px] text-[#889B90] pt-1">
                        Status: <strong className="text-emerald-700">{member.status}</strong> • Last Activity: {member.lastLogin}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 8. DATA BACKUP AND AUDIT LOGS                                            */}
            {/* ========================================================================= */}
            {activeTab === "audit" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Backup Card */}
                <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <h3 className="text-sm font-bold text-[#26352D] flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-[#0C4B32]" />
                      <span>Data Backup Vault (Encrypted Master CSV)</span>
                    </h3>
                    <p className="text-[11px] text-[#55685D] mt-0.5">
                      Daily automated cloud snapshot to secure S3 storage. Ready for instant offline export.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const headers = ["Timestamp", "Actor", "Action", "Entity", "Status", "IP Address"];
                        const rows = auditLogs.map((l) => [l.timestamp, l.actor, l.action, l.entity, l.status, l.ipAddress]);
                        handleExportCSV("khetivo_audit_logs.csv", headers, rows);
                      }}
                      className="btn btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 shadow-xs cursor-pointer font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Audit Ledger</span>
                    </button>
                  </div>
                </div>

                {/* Audit Stream Table */}
                <div className="bg-white rounded-2xl border border-[#E5ECE7] shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-[#E5ECE7]">
                    <h3 className="text-xs font-bold text-[#26352D] uppercase tracking-wider text-[#889B90]">
                      Immutable Platform Audit Trail
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#F8FAF8] border-b border-[#E5ECE7] text-[#55685D] font-sans font-semibold">
                        <tr>
                          <th className="py-2.5 px-4">Timestamp</th>
                          <th className="py-2.5 px-4">Actor</th>
                          <th className="py-2.5 px-4">Action</th>
                          <th className="py-2.5 px-4">Entity / Target</th>
                          <th className="py-2.5 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5ECE7] text-[11px]">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-[#FBFDFB]">
                            <td className="py-2.5 px-4 text-[#55685D]">{log.timestamp}</td>
                            <td className="py-2.5 px-4 font-semibold text-[#26352D]">{log.actor}</td>
                            <td className="py-2.5 px-4 text-[#0C4B32]">{log.action}</td>
                            <td className="py-2.5 px-4 text-[#55685D]">{log.entity}</td>
                            <td className="py-2.5 px-4">
                              <span className="text-emerald-700 font-bold font-sans text-[10px] bg-emerald-50 px-2 py-0.2 rounded-full">
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ONBOARD CLIENT & FARM                                            */}
      {/* ========================================================================= */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#DCE6DE] shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE7]">
              <div>
                <h3 className="text-base font-bold text-[#26352D]">Onboard Client & Initial Farm Holding</h3>
                <p className="text-xs text-[#55685D] mt-0.5">Register a farmer, progressive estate, and map their starting acreage.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddClientModalOpen(false)}
                className="p-1.5 text-[#889B90] hover:text-[#26352D] rounded-xl hover:bg-[#F4F8F4] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOnboardClient} className="space-y-4 text-xs">
              {/* Part 1: Client Personal Details */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#0C4B32] uppercase tracking-wider block">
                  1. Farmer Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                      Farmer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="e.g. Jaswinder Singh Brar"
                      className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      placeholder="+91 98140-XXXXX"
                      className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      value={newClientDistrict}
                      onChange={(e) => setNewClientDistrict(e.target.value)}
                      placeholder="e.g. Ludhiana"
                      className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                      Plan
                    </label>
                    <select
                      value={newClientPlan}
                      onChange={(e) => setNewClientPlan(e.target.value as SubscriptionTier)}
                      className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                    >
                      <option value="Free">Free (Up to 5 Acres)</option>
                      <option value="Basic">Basic (₹699/yr)</option>
                      <option value="Pro">Pro (₹1,499/yr)</option>
                      <option value="Enterprise">Enterprise (₹4,999/yr)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Part 2: Initial Farm Registration */}
              <div className="space-y-2 pt-2 border-t border-[#E5ECE7]">
                <span className="text-[11px] font-bold text-[#0C4B32] uppercase tracking-wider block">
                  2. Farm Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                      Farm Name
                    </label>
                    <input
                      type="text"
                      value={newClientFarmName}
                      onChange={(e) => setNewClientFarmName(e.target.value)}
                      placeholder="e.g. Main Holding (Ludhiana)"
                      className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                        Land Area
                      </label>
                      <input
                        type="number"
                        value={newClientArea}
                        onChange={(e) => setNewClientArea(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                        Unit
                      </label>
                      <select
                        value={newClientAreaUnit}
                        onChange={(e) => setNewClientAreaUnit(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                      >
                        <option value="Acres">Acres</option>
                        <option value="Bigha">Bigha</option>
                        <option value="Kanal">Kanal</option>
                        <option value="Hectares">Hectares</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                      Soil Type
                    </label>
                    <select
                      value={newClientSoil}
                      onChange={(e) => setNewClientSoil(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                    >
                      {SOIL_TYPES.map((soil) => (
                        <option key={soil} value={soil}>
                          {soil}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                      Irrigation Method
                    </label>
                    <select
                      value={newClientWater}
                      onChange={(e) => setNewClientWater(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                    >
                      {IRRIGATION_TYPES.map((irri) => (
                        <option key={irri} value={irri}>
                          {irri}
                        </option>
                      ))}
                      <option value="Solar Tubewell (15 HP) + Canal">Solar Tubewell (15 HP) + Canal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                      Main Crop
                    </label>
                    <select
                      value={newClientCrop}
                      onChange={(e) => setNewClientCrop(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                    >
                      {crops.map((c) => (
                        <option key={c.id} value={c.cropName || c.name}>
                          {c.cropName || c.name} ({c.season || "Rabi"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-[#55685D] hover:text-[#26352D] border border-[#DCE6DE] hover:bg-[#F4F8F4] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs px-5 py-2 inline-flex items-center gap-1.5 shadow-xs cursor-pointer font-medium"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Register Farmer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD ADDITIONAL FARM TO EXISTING CLIENT                           */}
      {/* ========================================================================= */}
      {isAddFarmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#DCE6DE] shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE7]">
              <div>
                <h3 className="text-base font-bold text-[#26352D]">Add Farm to Farmer</h3>
                <p className="text-xs text-[#55685D] mt-0.5">Add another farm plot for this farmer.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFarmModalOpen(false)}
                className="p-1.5 text-[#889B90] hover:text-[#26352D] rounded-xl hover:bg-[#F4F8F4] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFarmToClient} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                  Farm Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={extraFarmName}
                  onChange={(e) => setExtraFarmName(e.target.value)}
                  placeholder="e.g. Noorpur Bet Block"
                  className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                    Land Area (Acres)
                  </label>
                  <input
                    type="number"
                    value={extraFarmArea}
                    onChange={(e) => setExtraFarmArea(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={extraFarmDistrict}
                    onChange={(e) => setExtraFarmDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                    Soil Type
                  </label>
                  <select
                    value={extraFarmSoil}
                    onChange={(e) => setExtraFarmSoil(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                  >
                    {SOIL_TYPES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                    Main Crop
                  </label>
                  <select
                    value={extraFarmCrop}
                    onChange={(e) => setExtraFarmCrop(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                  >
                    {crops.map((c) => (
                      <option key={c.id} value={c.cropName || c.name}>
                        {c.cropName || c.name} ({c.season || "Rabi"})
                      </option>
                    ))}
                    <option value="Mustard">Mustard</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Maize">Maize</option>
                    <option value="Sugarcane">Sugarcane</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                  Irrigation Method
                </label>
                <select
                  value={extraFarmWater}
                  onChange={(e) => setExtraFarmWater(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                >
                  {IRRIGATION_TYPES.map((it) => (
                    <option key={it} value={it}>
                      {it}
                    </option>
                  ))}
                  <option value="Canal Feeder">Canal Feeder</option>
                  <option value="Solar Tubewell (15 HP)">Solar Tubewell (15 HP)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddFarmModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-[#55685D] hover:text-[#26352D] border border-[#DCE6DE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs px-4 py-2 font-medium cursor-pointer"
                >
                  Save Farm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIGURE PLAN                                                   */}
      {/* ========================================================================= */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#DCE6DE] shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 text-xs max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE7] shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#26352D]">Configure {editingPlan.id} Tier</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${editingPlan.badgeColor}`}>
                    {editingPlan.id}
                  </span>
                </div>
                <p className="text-xs text-[#55685D] mt-0.5">Modify pricing, limits, hardware specs, and entitlements.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="p-1.5 text-[#889B90] hover:text-[#26352D] rounded-xl hover:bg-[#F4F8F4] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 overflow-y-auto pr-1 flex-1">
              {/* Plan Name & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                    Plan Display Name
                  </label>
                  <input
                    type="text"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                    Price Per Year (₹)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.pricePerYear}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, pricePerYear: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                  Tagline / Description
                </label>
                <input
                  type="text"
                  value={editingPlan.tagline}
                  onChange={(e) => setEditingPlan({ ...editingPlan, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                />
              </div>

              {/* Limits and Specifications */}
              <div className="p-3 bg-[#F8FAF8] rounded-xl border border-[#E5ECE7] space-y-3">
                <span className="text-[10px] font-bold text-[#64796C] uppercase tracking-wider block">
                  Capacity & Hardware Limits
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                      Max Holdings (Farms)
                    </label>
                    <input
                      type="text"
                      value={editingPlan.maxFarms}
                      onChange={(e) => setEditingPlan({ ...editingPlan, maxFarms: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                      Max Cultivated Area
                    </label>
                    <input
                      type="text"
                      value={editingPlan.maxAcreage}
                      onChange={(e) => setEditingPlan({ ...editingPlan, maxAcreage: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                      NDVI Satellite Refresh
                    </label>
                    <input
                      type="text"
                      value={editingPlan.satelliteRefresh}
                      onChange={(e) => setEditingPlan({ ...editingPlan, satelliteRefresh: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                      Team Seats / Logins
                    </label>
                    <input
                      type="text"
                      value={editingPlan.teamSeats}
                      onChange={(e) => setEditingPlan({ ...editingPlan, teamSeats: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                    />
                  </div>
                </div>
              </div>

              {/* Entitlements / Feature Bullets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold text-[#26352D]">
                    Included Entitlements & Features
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlan({
                        ...editingPlan,
                        features: [...editingPlan.features, "New Entitlement / Benefit"],
                      });
                    }}
                    className="text-[11px] font-bold text-[#0C4B32] hover:underline cursor-pointer"
                  >
                    + Add Entitlement
                  </button>
                </div>
                <div className="space-y-1.5">
                  {editingPlan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const updated = [...editingPlan.features];
                          updated[idx] = e.target.value;
                          setEditingPlan({ ...editingPlan, features: updated });
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-[#FBFDFB] rounded-lg border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editingPlan.features.filter((_, i) => i !== idx);
                          setEditingPlan({ ...editingPlan, features: updated });
                        }}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Remove Entitlement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5ECE7] flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-3.5 py-2 text-xs font-semibold text-[#55685D] hover:bg-[#F4F8F4] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = plans.map((p) => (p.id === editingPlan.id ? editingPlan : p));
                  setPlans(updated);
                  if (typeof window !== "undefined") {
                    try {
                      localStorage.setItem("khetivo_admin_plans", JSON.stringify(updated));
                    } catch {}
                  }
                  setEditingPlan(null);
                  showToast(`${editingPlan.name} plan & entitlements updated successfully.`);
                }}
                className="btn btn-primary text-xs px-4 py-2 font-medium cursor-pointer"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SUPPORT TICKET THREAD & REPLY                                    */}
      {/* ========================================================================= */}
      {selectedTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#DCE6DE] shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE7]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0C4B32] bg-[#E7F3EB] px-2 py-0.2 rounded">
                    {selectedTicketModal.ticketCode}
                  </span>
                  <h3 className="text-sm font-bold text-[#26352D]">{selectedTicketModal.subject}</h3>
                </div>
                <p className="text-[11px] text-[#55685D] mt-0.5">
                  Farmer: {selectedTicketModal.clientName} ({selectedTicketModal.phone}) • {selectedTicketModal.farmName}
                </p>
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
            <div className="space-y-2.5 max-h-64 overflow-y-auto p-1">
              {selectedTicketModal.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-xs ${msg.sender === "Farmer"
                      ? "bg-[#F8FAF8] border-[#E5ECE7]"
                      : "bg-[#E7F3EB]/40 border-[#C6E2D0]"
                    }`}
                >
                  <div className="flex justify-between text-[10px] text-[#889B90] mb-1">
                    <strong className="text-[#0C4B32]">{msg.sender}</strong>
                    <span>{msg.time}</span>
                  </div>
                  <p className="text-[#26352D] leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Send Reply */}
            <div className="space-y-2 pt-2 border-t border-[#E5ECE7]">
              {/* Quick PAU Canned Prescriptions */}
              <div className="space-y-1">
                <span className="text-[10px] text-[#889B90] font-semibold block uppercase tracking-wider">
                  Quick PAU Canned Prescriptions:
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: "Yellow Rust", text: "Stripe/Yellow Rust: Apply Propiconazole 25% EC (Tilt/Folicur) @ 200 ml in 200L water with hollow cone nozzle immediately." },
                    { label: "Zinc Deficiency", text: "Zinc Chlorosis: Spray 0.5% Zinc Sulphate heptahydrate (1 kg) + 1% Urea (2 kg) in 200L water per acre during active vegetative flush." },
                    { label: "Pink Bollworm", text: "Pink Bollworm (Cotton): Install 8 pheromone traps/acre + spray Emamectin Benzoate 5% SG @ 100g/acre." },
                    { label: "Aphid Chepa", text: "Aphid / Chepa attack: Apply Rogor (Dimethoate 30% EC) @ 250ml/acre in 100L water when crossing ETL." },
                  ].map((canned, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTicketReplyInput(canned.text)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-[#E7F3EB] text-[#0C4B32] hover:bg-[#D4EBDC] transition-colors border border-[#C6E2D0] cursor-pointer"
                    >
                      + {canned.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type official PAU agronomy prescription or reply..."
                  value={ticketReplyInput}
                  onChange={(e) => setTicketReplyInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!ticketReplyInput.trim()) return;
                    const replyText = ticketReplyInput.trim();
                    const newMsg = {
                      sender: "Dr. Amanpreet Singh (PAU)",
                      text: replyText,
                      time: "Just now",
                    };
                    const updated = {
                      ...selectedTicketModal,
                      status: "In Progress" as const,
                      messages: [...selectedTicketModal.messages, newMsg],
                    };
                    setSelectedTicketModal(updated);
                    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
                    setTicketReplyInput("");

                    if (selectedTicketModal.id && !selectedTicketModal.id.startsWith("tkt-")) {
                      fetch("/api/appwrite/support", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          type: "ticket",
                          id: selectedTicketModal.id,
                          status: "In Progress",
                          resolution: replyText,
                          assignedAgronomist: "Dr. Amanpreet Singh (PAU)",
                        }),
                      }).catch((e) => console.warn("Appwrite update ticket error:", e));
                    }

                    showToast("Reply dispatched to farmer's WhatsApp.");
                  }}
                  className="btn btn-primary text-xs px-4 py-2 font-medium"
                >
                  Send
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <select
                  value={selectedTicketModal.status}
                  onChange={(e) => {
                    const status = e.target.value as any;
                    const updated = { ...selectedTicketModal, status };
                    setSelectedTicketModal(updated);
                    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

                    if (selectedTicketModal.id && !selectedTicketModal.id.startsWith("tkt-")) {
                      fetch("/api/appwrite/support", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          type: "ticket",
                          id: selectedTicketModal.id,
                          status,
                        }),
                      }).catch((err) => console.warn("Appwrite update ticket status error:", err));
                    }

                    showToast(`Status updated to ${status}`);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-[#DCE6DE] text-xs cursor-pointer"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <button
                  type="button"
                  onClick={() => setSelectedTicketModal(null)}
                  className="text-xs text-[#55685D] hover:underline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: MANAGE CLIENT & SUBSCRIPTION                                     */}
      {/* ========================================================================= */}
      {selectedClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#DCE6DE] shadow-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE7]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#26352D]">{selectedClientModal.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E7F3EB] text-[#0C4B32]">
                    {selectedClientModal.plan} Tier
                  </span>
                </div>
                <p className="text-xs text-[#55685D] mt-0.5">
                  {selectedClientModal.phone} • {selectedClientModal.district}, {selectedClientModal.state}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClientModal(null)}
                className="p-1.5 text-[#889B90] hover:text-[#26352D] rounded-xl hover:bg-[#F4F8F4] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Plan & Status Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#F8FAF8] rounded-xl border border-[#E5ECE7]">
              <div>
                <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                  Plan
                </label>
                <select
                  value={selectedClientModal.plan}
                  onChange={(e) => {
                    const plan = e.target.value as SubscriptionTier;
                    setSelectedClientModal({ ...selectedClientModal, plan });
                  }}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                >
                  <option value="Free">Free Starter (Up to 5 Acres)</option>
                  <option value="Basic">Basic Grower (₹699/yr)</option>
                  <option value="Pro">Farm Pro (₹1,499/yr)</option>
                  <option value="Enterprise">Estate Enterprise (₹4,999/yr)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                  Status
                </label>
                <select
                  value={selectedClientModal.status}
                  onChange={(e) => {
                    const status = e.target.value as AccountStatus;
                    setSelectedClientModal({ ...selectedClientModal, status });
                  }}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Trial">Trial Period</option>
                  <option value="Renewal Due">Renewal Due</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                  Renewal Date
                </label>
                <input
                  type="text"
                  value={selectedClientModal.renewalDate}
                  onChange={(e) =>
                    setSelectedClientModal({ ...selectedClientModal, renewalDate: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                  Nearby Mandi / Market
                </label>
                <input
                  type="text"
                  value={selectedClientModal.mandi}
                  onChange={(e) =>
                    setSelectedClientModal({ ...selectedClientModal, mandi: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                />
              </div>
            </div>

            {/* Farm Holdings Section */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0C4B32] uppercase tracking-wider">
                  Registered Farms ({selectedClientModal.farms.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTargetClientIdForFarm(selectedClientModal.id);
                    setIsAddFarmModalOpen(true);
                  }}
                  className="text-[11px] font-semibold text-[#0C4B32] bg-[#E7F3EB] hover:bg-[#D4EBDC] px-2.5 py-1 rounded-lg border border-[#C6E2D0] inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Farm</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedClientModal.farms.map((farm) => (
                  <div
                    key={farm.id}
                    className="p-3 bg-[#FBFDFB] rounded-xl border border-[#E5ECE7] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <strong className="text-[#26352D] block">{farm.name}</strong>
                      <span className="text-[11px] text-[#55685D]">
                        {farm.totalArea} {farm.areaUnit} • {farm.soilType} • {farm.waterSource}
                      </span>
                      <div className="text-[10px] text-[#0C4B32] font-medium mt-0.5">
                        Crop: {farm.primaryCrop}
                      </div>
                    </div>
                    {selectedClientModal.farms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFarmFromClient(selectedClientModal.id, farm.id)}
                        className="p-1.5 text-[#889B90] hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Remove Farm Parcel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Impersonate Link & Save */}
            <div className="pt-3 border-t border-[#E5ECE7] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <Link
                href={`/dashboard?impersonate=${encodeURIComponent(selectedClientModal.name)}`}
                className="text-xs font-semibold text-[#0C4B32] hover:underline inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Farmer Dashboard</span>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedClientModal(null)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-[#55685D] hover:text-[#26352D] border border-[#DCE6DE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateSubscription(
                      selectedClientModal.id,
                      selectedClientModal.plan,
                      selectedClientModal.status,
                      selectedClientModal.renewalDate
                    );
                    setSelectedClientModal(null);
                  }}
                  className="btn btn-primary text-xs px-4 py-2 font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: ADD CROP MASTER TEMPLATE (3-STEP GUIDED WIZARD)                  */}
      {/* ========================================================================= */}
      {isAddCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#DCE6DE] shadow-2xl max-w-3xl w-full p-5 sm:p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 text-xs max-h-[92vh] flex flex-col">
            {/* Modal Header & Step Indicator */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE7] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center font-bold text-sm shrink-0 border border-[#C6E2D0]">
                  <Sprout className="w-5 h-5 text-[#0C4B32]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#26352D] flex items-center gap-2">
                    <span>{editingCropId ? "Edit Crop Template" : "Add Crop Template"}</span>
                  </h3>
                  <p className="text-[11px] text-[#55685D] mt-0.5">
                    {cropModalStep === 1 && "Step 1 of 3: Basic Details & Varieties"}
                    {cropModalStep === 2 && "Step 2 of 3: Growth Stages & Water Schedule"}
                    {cropModalStep === 3 && "Step 3 of 3: Recommended Do's and Don'ts"}
                  </p>
                </div>
              </div>

              {/* Step Badges */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setCropModalStep(1)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${cropModalStep === 1
                      ? "bg-[#0C4B32] text-white shadow-2xs"
                      : "bg-[#F4F8F4] text-[#55685D] hover:bg-[#E7F3EB]"
                    }`}
                >
                  1. Basic Info
                </button>
                <ChevronRight className="w-3 h-3 text-[#889B90]" />
                <button
                  type="button"
                  onClick={() => {
                    if (!newCropName.trim()) {
                      alert("Please provide the crop name first.");
                      return;
                    }
                    setCropModalStep(2);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${cropModalStep === 2
                      ? "bg-[#0C4B32] text-white shadow-2xs"
                      : "bg-[#F4F8F4] text-[#55685D] hover:bg-[#E7F3EB]"
                    }`}
                >
                  2. Growth Stages
                </button>
                <ChevronRight className="w-3 h-3 text-[#889B90]" />
                <button
                  type="button"
                  onClick={() => {
                    if (!newCropName.trim()) {
                      alert("Please provide the crop name first.");
                      return;
                    }
                    setCropModalStep(3);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${cropModalStep === 3
                      ? "bg-[#0C4B32] text-white shadow-2xs"
                      : "bg-[#F4F8F4] text-[#55685D] hover:bg-[#E7F3EB]"
                    }`}
                >
                  3. Do's & Don'ts
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAddCropModalOpen(false);
                    setCropModalStep(1);
                  }}
                  className="p-1.5 text-[#889B90] hover:text-[#26352D] rounded-xl hover:bg-[#F4F8F4] transition-colors cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Step Body */}
            <div className="flex-1 overflow-y-auto pr-1">
              {/* STEP 1: CROP PROFILE */}
              {cropModalStep === 1 && (
                <div className="space-y-4 animate-in fade-in py-1">
                  <div className="p-3 bg-[#F8FAF8] rounded-xl border border-[#E5ECE7] text-xs text-[#55685D]">
                    Enter basic crop profile details. All fields are pre-filled with sensible defaults.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                        Crop Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newCropName}
                        onChange={(e) => setNewCropName(e.target.value)}
                        placeholder="e.g. Wheat (Kanak)"
                        className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                        Season <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newCropSeason}
                        onChange={(e) => setNewCropSeason(e.target.value as "Rabi" | "Kharif" | "Zaid" | "Annual")}
                        className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] font-medium cursor-pointer"
                      >
                        <option value="Rabi">Rabi (Winter)</option>
                        <option value="Kharif">Kharif (Monsoon)</option>
                        <option value="Zaid">Zaid (Summer)</option>
                        <option value="Annual">Annual / Perennial</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                        Main Variety
                      </label>
                      <input
                        type="text"
                        value={newCropVariety}
                        onChange={(e) => setNewCropVariety(e.target.value)}
                        placeholder="e.g. PBW-826 / HD-3086"
                        className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                        Duration (Days)
                      </label>
                      <input
                        type="number"
                        min={30}
                        max={365}
                        value={newCropDuration}
                        onChange={(e) => setNewCropDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                        Sowing Window
                      </label>
                      <input
                        type="text"
                        value={newCropSowing}
                        onChange={(e) => setNewCropSowing(e.target.value)}
                        placeholder="e.g. 25 Oct – 15 Nov"
                        className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                        Expected Yield
                      </label>
                      <input
                        type="text"
                        value={newCropYield}
                        onChange={(e) => setNewCropYield(e.target.value)}
                        placeholder="e.g. 22 – 25 Qtl/Acre"
                        className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                        Best Soil Type
                      </label>
                      <select
                        value={newCropDefaultSoil}
                        onChange={(e) => setNewCropDefaultSoil(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                      >
                        {SOIL_TYPES.map((soil) => (
                          <option key={soil} value={soil}>
                            {soil}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                        Recommended Irrigation Method
                      </label>
                      <select
                        value={newCropDefaultIrrigation}
                        onChange={(e) => setNewCropDefaultIrrigation(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                      >
                        {IRRIGATION_TYPES.map((irri) => (
                          <option key={irri} value={irri}>
                            {irri}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: GROWTH STAGE TIMELINE */}
              {cropModalStep === 2 && (
                <div className="space-y-3.5 animate-in fade-in py-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#F8FAF8] border border-[#E5ECE7]">
                    <div>
                      <h4 className="text-xs font-bold text-[#0C4B32] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#278449]" />
                        <span>Crop Growth Stages ({newCropTimeline.length} Stages)</span>
                      </h4>
                      <p className="text-[11px] text-[#55685D] mt-0.5">
                        Total duration: {Math.max(...newCropTimeline.map((s) => s.endDay), newCropDuration)} days from sowing.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={handleResetTimeline}
                        className="px-2.5 py-1 text-[11px] font-medium text-[#0C4B32] bg-white border border-[#DCE6DE] rounded-lg hover:bg-[#F4F8F4] transition-colors cursor-pointer"
                        title="Reload Standard Stages"
                      >
                        Reset to Standard Stages
                      </button>
                      <button
                        type="button"
                        onClick={handleAddTimelineStage}
                        className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#0C4B32] hover:bg-[#083624] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Stage</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {newCropTimeline.map((stage, idx) => (
                      <div
                        key={stage.id}
                        className="p-3 rounded-xl border border-[#E5ECE7] bg-white hover:border-[#278449]/50 shadow-2xs transition-all space-y-2 text-xs"
                      >
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-12 sm:col-span-1 flex items-center gap-2 sm:justify-center">
                            <span className="w-5 h-5 rounded-full bg-[#0C4B32] text-white flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-[11px] font-bold text-[#26352D] sm:hidden">
                              Stage {idx + 1}
                            </span>
                          </div>

                          <div className="col-span-12 sm:col-span-5">
                            <label className="block text-[9px] uppercase tracking-wider text-[#55685D] font-bold mb-0.5">
                              Stage Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={stage.stageName}
                              onChange={(e) => handleUpdateTimelineStage(stage.id, "stageName", e.target.value)}
                              placeholder="e.g. Sowing / Germination"
                              className="w-full px-2.5 py-1.5 bg-[#FBFDFB] rounded-lg border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] text-xs font-medium"
                            />
                          </div>

                          <div className="col-span-6 sm:col-span-3 flex items-center gap-1.5">
                            <div className="flex-1">
                              <label className="block text-[9px] uppercase tracking-wider text-[#55685D] font-bold mb-0.5">
                                Start Day
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={stage.startDay}
                                onChange={(e) => handleUpdateTimelineStage(stage.id, "startDay", Number(e.target.value))}
                                className="w-full px-2 py-1.5 bg-[#FBFDFB] rounded-lg border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] text-xs"
                              />
                            </div>
                            <span className="text-[#889B90] text-xs pt-4 font-bold">–</span>
                            <div className="flex-1">
                              <label className="block text-[9px] uppercase tracking-wider text-[#55685D] font-bold mb-0.5">
                                End Day
                              </label>
                              <input
                                type="number"
                                min={stage.startDay}
                                value={stage.endDay}
                                onChange={(e) => handleUpdateTimelineStage(stage.id, "endDay", Number(e.target.value))}
                                className="w-full px-2 py-1.5 bg-[#FBFDFB] rounded-lg border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] text-xs"
                              />
                            </div>
                          </div>

                          <div className="col-span-5 sm:col-span-2">
                            <label className="block text-[9px] uppercase tracking-wider text-[#55685D] font-bold mb-0.5">
                              Water Need
                            </label>
                            <select
                              value={stage.irrigationRequirement}
                              onChange={(e) =>
                                handleUpdateTimelineStage(
                                  stage.id,
                                  "irrigationRequirement",
                                  e.target.value as GrowthStageMilestone["irrigationRequirement"]
                                )
                              }
                              className={`w-full px-2 py-1.5 rounded-lg border text-xs font-semibold outline-none cursor-pointer ${stage.irrigationRequirement === "Critical"
                                  ? "bg-red-50 text-red-800 border-red-200"
                                  : stage.irrigationRequirement === "Moderate"
                                    ? "bg-blue-50 text-blue-800 border-blue-200"
                                    : stage.irrigationRequirement === "Withhold"
                                      ? "bg-amber-50 text-amber-800 border-amber-200"
                                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                }`}
                            >
                              <option value="Critical">🔴 Critical (Must Water)</option>
                              <option value="Moderate">🔵 Medium</option>
                              <option value="Low">🟢 Low</option>
                              <option value="Withhold">🟠 No Water (Dry)</option>
                            </select>
                          </div>

                          <div className="col-span-1 sm:col-span-1 flex items-center justify-end pt-3">
                            <button
                              type="button"
                              onClick={() => handleRemoveTimelineStage(stage.id)}
                              disabled={newCropTimeline.length <= 1}
                              className="p-1.5 text-[#889B90] hover:text-red-600 disabled:opacity-20 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="Remove Stage"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-[#55685D] font-bold mb-0.5">
                            Farming Task / Fertilizer / Spray
                          </label>
                          <input
                            type="text"
                            value={stage.recommendedActivity}
                            onChange={(e) => handleUpdateTimelineStage(stage.id, "recommendedActivity", e.target.value)}
                            placeholder="e.g. Apply 1st Urea dose (45 kg/acre) & weed spray."
                            className="w-full px-2.5 py-1.5 bg-[#FBFDFB] rounded-lg border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#E5ECE7] flex items-center justify-between text-[11px] text-[#55685D]">
                    <span>
                      Critical Watering Stages:{" "}
                      <strong className="text-red-700 font-bold">
                        {newCropTimeline.filter((s) => s.irrigationRequirement === "Critical").length} stages
                      </strong>
                    </span>
                    <span className="font-mono">
                      Total Stages: {newCropTimeline.length}
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 3: RECOMMENDED DO'S & DON'TS POINTS (UP AND DOWN STACKED) */}
              {cropModalStep === 3 && (
                <div className="space-y-4 animate-in fade-in py-1">
                  {/* TOP: RECOMMENDED DO'S (FULL WIDTH) */}
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/90 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200/70">
                      <label className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>Recommended Do&apos;s ({newCropDos.length} Points)</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddDoPoint}
                        className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-3 py-1 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Do Point</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {newCropDos.map((point, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-200/80 text-emerald-900 text-[11px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={point}
                            onChange={(e) => handleUpdateDoPoint(idx, e.target.value)}
                            placeholder={`Do Point #${idx + 1}: e.g. Perform certified seed treatment with recommended fungicide before sowing`}
                            className="flex-1 px-3 py-2 bg-white rounded-xl border border-emerald-200 focus:border-emerald-600 outline-none text-[#26352D] text-xs shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveDoPoint(idx)}
                            disabled={newCropDos.length <= 1}
                            className="p-2 text-[#889B90] hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
                            title="Remove point"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <span className="text-[10px] text-[#55685D] block">
                      Best agronomic practices to follow for healthy growth and maximum yield.
                    </span>
                  </div>

                  {/* BOTTOM: THINGS TO AVOID (DON'TS) (FULL WIDTH) */}
                  <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200/90 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-red-200/70">
                      <label className="text-xs font-bold text-red-950 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                        <span>Things to Avoid (Don&apos;ts) ({newCropDonts.length} Points)</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddDontPoint}
                        className="text-[11px] font-semibold text-red-800 hover:text-red-950 bg-red-100 hover:bg-red-200 border border-red-300 px-3 py-1 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Don&apos;t Point</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {newCropDonts.map((point, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-red-200/80 text-red-900 text-[11px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={point}
                            onChange={(e) => handleUpdateDontPoint(idx, e.target.value)}
                            placeholder={`Don't Point #${idx + 1}: e.g. Do not allow standing water or moisture stagnation in the root zone`}
                            className="flex-1 px-3 py-2 bg-white rounded-xl border border-red-200 focus:border-red-600 outline-none text-[#26352D] text-xs shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveDontPoint(idx)}
                            disabled={newCropDonts.length <= 1}
                            className="p-2 text-[#889B90] hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
                            title="Remove point"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <span className="text-[10px] text-[#55685D] block">
                      Common errors, chemical overdoses, and harmful practices to avoid.
                    </span>
                  </div>

                  {/* Summary Review Card */}
                  <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#DCE6DE] space-y-2 text-xs">
                    <span className="text-[11px] font-bold text-[#0C4B32] uppercase tracking-wider block">
                      Summary Preview
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <span className="text-[#889B90] block">Crop Name:</span>
                        <strong className="text-[#26352D]">{newCropName || "Untitled"}</strong>
                      </div>
                      <div>
                        <span className="text-[#889B90] block">Season:</span>
                        <strong className="text-[#0C4B32]">{newCropSeason}</strong>
                      </div>
                      <div>
                        <span className="text-[#889B90] block">Main Variety:</span>
                        <strong className="text-[#26352D]">{newCropVariety || "Standard"}</strong>
                      </div>
                      <div>
                        <span className="text-[#889B90] block">Duration:</span>
                        <strong className="text-[#26352D]">{newCropDuration} Days</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[#889B90] block">Soil Type:</span>
                        <span className="text-[#26352D] font-medium truncate block">{newCropDefaultSoil}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[#889B90] block">Irrigation Method:</span>
                        <span className="text-[#26352D] font-medium truncate block">{newCropDefaultIrrigation}</span>
                      </div>
                      <div>
                        <span className="text-[#889B90] block">Growth Stages:</span>
                        <strong className="text-[#26352D]">{newCropTimeline.length} Stages</strong>
                      </div>
                      <div>
                        <span className="text-[#889B90] block">Do&apos;s &amp; Don&apos;ts:</span>
                        <strong className="text-[#0C4B32]">
                          {newCropDos.filter(Boolean).length} Do&apos;s • {newCropDonts.filter(Boolean).length} Don&apos;ts
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsAddCropModalOpen(false);
                  setCropModalStep(1);
                }}
                className="px-4 py-2 text-xs font-medium rounded-xl text-[#55685D] hover:text-[#26352D] border border-[#DCE6DE] cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {cropModalStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCropModalStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : 1))}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-[#0C4B32] bg-[#F4F8F4] hover:bg-[#E7F3EB] border border-[#DCE6DE] transition-colors cursor-pointer"
                  >
                    ← Previous Step
                  </button>
                )}

                {cropModalStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (cropModalStep === 1 && !newCropName.trim()) {
                        alert("Please enter the crop name.");
                        return;
                      }
                      setCropModalStep((prev) => ((prev + 1) as 1 | 2 | 3));
                    }}
                    className="btn btn-primary text-xs px-5 py-2 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Continue to Step {cropModalStep + 1}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCreateCropTemplate()}
                    className="btn btn-primary text-xs px-5 py-2 font-medium cursor-pointer"
                  >
                    {editingCropId ? "Update & Save Template" : "Save & Publish Crop Template"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW CROP MASTER TIMELINE & PROTOCOL                               */}
      {/* ========================================================================= */}
      {selectedCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#DCE6DE] shadow-2xl max-w-3xl w-full p-5 sm:p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE7]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-[#26352D] flex items-center gap-1.5">
                    <Sprout className="w-5 h-5 text-[#0C4B32]" />
                    <span>{selectedCropModal.cropName || selectedCropModal.name}</span>
                  </h3>
                  {selectedCropModal.season && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E7F3EB] text-[#0C4B32] border border-[#C6E2D0]">
                      {selectedCropModal.season} Season
                    </span>
                  )}
                  {selectedCropModal.badge && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F4F8F4] text-[#55685D] border border-[#DCE6DE]">
                      {selectedCropModal.badge}
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {selectedCropModal.durationDays || selectedCropModal.duration} Days Duration
                  </span>
                </div>
                <p className="text-xs text-[#55685D] mt-1">
                  Main Variety: <strong className="text-[#0C4B32]">{selectedCropModal.variety || selectedCropModal.varieties?.[0]}</strong> • Sowing: {selectedCropModal.sowingWindow} • Expected Yield: {selectedCropModal.targetYieldQuintals}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCropModal(null)}
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
                  {selectedCropModal.defaultSoil || "Alluvial Loam"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#889B90] uppercase tracking-wider font-bold block">
                  Irrigation Method
                </span>
                <span className="text-xs font-semibold text-[#26352D] truncate block">
                  {selectedCropModal.defaultIrrigation || "Drip / Micro-Irrigation"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#889B90] uppercase tracking-wider font-bold block">
                  Low Moisture Alert
                </span>
                <span className="text-xs font-bold text-[#0C4B32]">
                  Below {selectedCropModal.irrigationThresholdMoisture}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#889B90] uppercase tracking-wider font-bold block">
                  Critical Water Stages
                </span>
                <span className="text-xs font-semibold text-[#26352D]">
                  {selectedCropModal.criticalIrrigationStages.length} Stages Identified
                </span>
              </div>
            </div>

            {/* Growth Stage Timeline Breakdown */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#0C4B32] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#278449]" />
                  <span>Growth Stages & Schedule</span>
                </h4>
                <span className="text-[11px] text-[#55685D]">
                  {selectedCropModal.growthTimeline?.length || 0} Stages Configured
                </span>
              </div>

              {selectedCropModal.growthTimeline && selectedCropModal.growthTimeline.length > 0 ? (
                <div className="space-y-2">
                  {selectedCropModal.growthTimeline.map((stage, idx) => (
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
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${stage.irrigationRequirement === "Critical"
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
            {((selectedCropModal.dos && selectedCropModal.dos.length > 0) || (selectedCropModal.donts && selectedCropModal.donts.length > 0)) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Recommended Do&apos;s ({selectedCropModal.dos?.length || 0})</span>
                  </span>
                  <ul className="space-y-1 text-[11px] text-[#26352D]">
                    {selectedCropModal.dos?.map((item, i) => (
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
                    <span>Things to Avoid (Don&apos;ts) ({selectedCropModal.donts?.length || 0})</span>
                  </span>
                  <ul className="space-y-1 text-[11px] text-[#26352D]">
                    {selectedCropModal.donts?.map((item, i) => (
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
                Disease Guide & Recommended Spray:
              </span>
              <p className="text-[11px] text-[#55685D]">
                <strong>Risks:</strong> {selectedCropModal.majorDiseases.join(", ")}
              </p>
              <p className="text-[11px] font-mono text-[#0C4B32] bg-white/70 p-2 rounded-lg border border-amber-200/60">
                {selectedCropModal.pauFungicidePrescription}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const c = selectedCropModal;
                  setSelectedCropModal(null);
                  handleEditCropTemplate(c);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-[#0C4B32] bg-[#E7F3EB] hover:bg-[#D4EBDC] border border-[#C6E2D0] transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Template</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCropModal(null)}
                className="btn btn-primary text-xs px-5 py-2 font-medium cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: ASSIGN / UPDATE FIELD VISIT LEAD                                 */}
      {/* ========================================================================= */}
      {selectedVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#DCE6DE] shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE7]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0C4B32] bg-[#E7F3EB] px-2 py-0.2 rounded">
                    {selectedVisitModal.id}
                  </span>
                  <h3 className="text-sm font-bold text-[#26352D]">{selectedVisitModal.farmerName}</h3>
                </div>
                <p className="text-[11px] text-[#55685D] mt-0.5">
                  {selectedVisitModal.phone} • {selectedVisitModal.farmName} ({selectedVisitModal.plotLandmark})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVisitModal(null)}
                className="p-1.5 text-[#889B90] hover:text-[#26352D] rounded-xl hover:bg-[#F4F8F4] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#F8FAF8] rounded-xl border border-[#E5ECE7] space-y-1.5 text-xs">
              <div><span className="text-[#889B90]">Crop & Issue:</span> <strong className="text-[#26352D]">{selectedVisitModal.crop} ({selectedVisitModal.reason})</strong></div>
              <div><span className="text-[#889B90]">Scheduled Slot:</span> <strong className="text-[#0C4B32]">{selectedVisitModal.scheduledDate} • {selectedVisitModal.timeSlot}</strong></div>
              <div><span className="text-[#889B90]">Visit Tier & Fee:</span> <strong>{selectedVisitModal.tier} — ₹{selectedVisitModal.fee}</strong></div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                  Assign Field Officer / Specialist
                </label>
                <select
                  value={selectedVisitModal.assignedSpecialist}
                  onChange={(e) =>
                    setSelectedVisitModal({ ...selectedVisitModal, assignedSpecialist: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                >
                  <option value="Dr. Harpreet Singh (PAU)">Dr. Harpreet Singh (PAU Entomology Specialist)</option>
                  <option value="Dr. Gurmeet Kaur (PAU)">Dr. Gurmeet Kaur (PAU Pathology & Soil)</option>
                  <option value="Dr. Amanpreet Singh">Dr. Amanpreet Singh (Chief Agronomist)</option>
                  <option value="Er. Baldev Singh (IoT)">Er. Baldev Singh (Drip & IoT Engineer)</option>
                  <option value="Pending Assignment">Pending Assignment</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                    Visit Status
                  </label>
                  <select
                    value={selectedVisitModal.workflowStage}
                    onChange={(e) =>
                      setSelectedVisitModal({
                        ...selectedVisitModal,
                        workflowStage: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                  >
                    <option value="Lead Captured">Lead Captured</option>
                    <option value="Payment Verified">Payment Verified</option>
                    <option value="Agronomist Assigned">Agronomist Assigned</option>
                    <option value="On-Field Diagnosis">On-Field Diagnosis</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                    Payment Status
                  </label>
                  <select
                    value={selectedVisitModal.paymentStatus}
                    onChange={(e) =>
                      setSelectedVisitModal({
                        ...selectedVisitModal,
                        paymentStatus: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                  >
                    <option value="Paid Online">Paid Online</option>
                    <option value="Pay on Arrival">Pay on Arrival</option>
                    <option value="Pending Payment">Pending Payment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                  Field Visit Notes & Recommendations
                </label>
                <textarea
                  rows={2}
                  value={selectedVisitModal.notes || ""}
                  onChange={(e) =>
                    setSelectedVisitModal({ ...selectedVisitModal, notes: e.target.value })
                  }
                  placeholder="Record symptoms observed, weather conditions, or follow-up instructions..."
                  className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5ECE7] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedVisitModal(null)}
                className="px-4 py-2 text-xs font-medium rounded-xl text-[#55685D] hover:text-[#26352D] border border-[#DCE6DE] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateFieldVisit(selectedVisitModal)}
                className="btn btn-primary text-xs px-5 py-2 font-medium cursor-pointer"
              >
                Save Visit Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: ADD ADMIN STAFF MEMBER (RBAC)                                    */}
      {/* ========================================================================= */}
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#DCE6DE] shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE7]">
              <div>
                <h3 className="text-base font-bold text-[#26352D]">Add Team Member</h3>
                <p className="text-xs text-[#55685D] mt-0.5">Add a new staff member and choose their access.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddRoleModalOpen(false)}
                className="p-1.5 text-[#889B90] hover:text-[#26352D] rounded-xl hover:bg-[#F4F8F4] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaffMember} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="e.g. Balwinder Singh Sandhu"
                  className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="name@khetivo.com"
                  className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newAdminPhone}
                    onChange={(e) => setNewAdminPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                    User Role
                  </label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => {
                      const role = e.target.value as AdminRoleMember["role"];
                      setNewAdminRole(role);
                      if (role === "Agronomist Lead") {
                        setNewAdminPermissions(["Crop Templates", "Field Visits", "Farmer Support", "Manage Farmers & Farms"]);
                      } else if (role === "Support Agent") {
                        setNewAdminPermissions(["Farmer Support", "Manage Farmers & Farms", "Field Visits"]);
                      } else if (role === "Billing Manager") {
                        setNewAdminPermissions(["Manage Subscriptions", "Plans & Pricing", "Analytics", "Activity Logs & Backups"]);
                      } else {
                        setNewAdminPermissions(["Manage Farmers & Farms", "Manage Subscriptions", "Plans & Pricing", "Crop Templates", "Field Visits", "Farmer Support", "Analytics", "Team & Permissions", "Activity Logs & Backups"]);
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                  >
                    <option value="Agronomist Lead">Agronomist Lead</option>
                    <option value="Support Agent">Support Agent</option>
                    <option value="Billing Manager">Billing Manager</option>
                    <option value="Superadmin">Superadmin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#26352D] mb-1.5">
                  Permissions & Access
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 border border-[#E5ECE7] rounded-xl bg-[#F8FAF8]">
                  {[
                    "Manage Farmers & Farms",
                    "Manage Subscriptions",
                    "Plans & Pricing",
                    "Crop Templates",
                    "Field Visits",
                    "Farmer Support",
                    "Analytics",
                    "Team & Permissions",
                    "Activity Logs & Backups",
                  ].map((perm) => (
                    <label key={perm} className="flex items-center gap-1.5 text-[11px] text-[#55685D] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAdminPermissions.includes(perm)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewAdminPermissions([...newAdminPermissions, perm]);
                          } else {
                            setNewAdminPermissions(newAdminPermissions.filter((p) => p !== perm));
                          }
                        }}
                        className="rounded border-[#DCE6DE] text-[#0C4B32] focus:ring-0"
                      />
                      <span className="truncate">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5ECE7] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRoleModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-[#55685D] hover:text-[#26352D] border border-[#DCE6DE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs px-5 py-2 font-medium cursor-pointer"
                >
                  Add Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Crop Delete Confirmation Modal */}
      {cropToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-2xl border border-[#E5ECE7] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="text-sm font-bold text-[#26352D]">
                  Delete Crop Master Template?
                </h3>
                <p className="text-xs text-[#55685D] leading-relaxed">
                  Are you sure you want to delete template for{" "}
                  <strong className="text-[#26352D] font-bold">
                    &ldquo;{cropToDelete.cropName || cropToDelete.name}&rdquo;
                  </strong>
                  ?
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#FAFCFA] border border-[#E5ECE7] text-[11px] text-[#55685D] space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#26352D]">
                <Sprout className="w-3.5 h-3.5 text-[#0C4B32]" />
                <span>{cropToDelete.cropName || cropToDelete.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E7F3EB] text-[#0C4B32] font-medium">
                  {cropToDelete.season}
                </span>
              </div>
              <p className="text-[#889B90]">
                This will remove the default PAU growth timeline ({cropToDelete.growthTimeline?.length || 5} stages), advisory rules, and recommended agronomy protocols for this crop.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCropToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-[#55685D] hover:text-[#26352D] bg-white border border-[#DCE6DE] hover:bg-[#F4F8F4] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCropTemplate}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Template</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
