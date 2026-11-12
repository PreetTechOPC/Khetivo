export interface Farm {
  id: string;
  name: string;
  address: string;
  district: string;
  state: string;
  pinCode: string;
  totalArea: number;
  areaUnit: string;
  soilType: string;
  irrigationType: string;
  waterSource: string;
  cropTemplate: string;
  crops: Crop[];
}

export interface Crop {
  id: string;
  name: string;
  variety: string;
  area: number;
  areaUnit: string;
  season: string;
  stage: string;
  stageStep?: number;
  currentDay: number;
  totalDays: number;
  health: string;
  sownDate: string;
  nextMilestone: string;
  harvestDate: string;
  color?: string;
  lowMoistureAlert: number;
  currentMoisture: number;
  dos: string[];
  donts: string[];
  diseases: string;
  sprayGuide: string;
}

export interface Task {
  id: string;
  farmId: string;
  farmName: string;
  title: string;
  category: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Completed';
  dueDate: string;
  assignedTo: string;
  zone?: string;
  crop?: string;
  instructions?: string;
  description?: string;
  completedDate?: string;
}

export interface InventoryItem {
  id: string;
  farmId?: string;
  farmName?: string;
  storeId?: string;
  storeName: string;
  name: string;
  category: string;
  batchNumber?: string;
  purchasedDate?: string;
  expiryDate?: string;
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

export interface MandiRate {
  id: string;
  mandi: string;
  district: string;
  crop: string;
  variety: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  msp: number;
  trend: 'up' | 'down' | 'stable';
  date: string;
}

export interface Equipment {
  id: string;
  name: string;
  model: string;
  hoursRun: number;
  nextServiceHours: number;
  status: 'Operational' | 'Service Due' | 'In Field';
  fuelLevel: number;
  category?: string;
  farm?: string;
  operator?: string;
  nextServiceDate?: string;
  fuelEfficiency?: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  phone: string;
  assignedParcels: string;
  status: 'On Duty' | 'Off Duty';
}

export interface FinancialStats {
  production: number;
  expenses: number;
  losses: number;
  netProfit: number;
}

// EXACT MATCH WITH DASHBOARD `src/app/dashboard/page.tsx`
export const initialFarms: Farm[] = [
  {
    id: 'farm-1',
    name: 'Khetivo Green Acres',
    address: 'Village Samrala, GT Road',
    district: 'Ludhiana',
    state: 'Punjab',
    pinCode: '141114',
    totalArea: 28,
    areaUnit: 'Acres',
    soilType: 'Alluvial Loam (Deep & Fertile)',
    irrigationType: 'Drip / Micro-Irrigation (Sub-surface/Surface)',
    waterSource: 'Deep Tubewell / Borewell',
    cropTemplate: 'Wheat (18 Ac) & Potato (10 Ac)',
    crops: [
      {
        id: 'crop-1-1',
        name: 'Wheat',
        variety: 'HD-3086 / Sharbati',
        area: 18,
        areaUnit: 'Acres',
        season: 'Rabi',
        stage: 'Crown Root Initiation & Tillering',
        stageStep: 2,
        currentDay: 28,
        totalDays: 135,
        health: 'Healthy (95% NDVI)',
        sownDate: 'Oct 24, 2026',
        nextMilestone: '1st Nitrogen Top-Dressing (Day 35)',
        harvestDate: 'Late March 2027',
        color: '#278449',
        lowMoistureAlert: 30,
        currentMoisture: 36.8,
        dos: [
          'Provide first critical irrigation strictly at CRI stage (20–25 days after sowing).',
          'Split nitrogen application: 50% basal at sowing, 25% at 1st irrigation, 25% at tillering.',
          'Regularly scout field edges and leaf tips for early powdery yellow rust symptoms.',
          'Apply recommended herbicide strictly when weeds have 2-3 leaves.',
        ],
        donts: [
          'Do not apply flood irrigation during windy days after heading to prevent crop lodging.',
          'Avoid delayed weedicide application beyond 35 days when weeds develop resistance.',
          'Do not apply excess urea during flowering, which invites heavy aphid attacks.',
          'Never spray agrochemicals during peak midday heat; spray in calm morning or evening.',
        ],
        diseases: 'Yellow Rust (Stripe), Karnal Bunt, Aphids (Chepa), Loose Smut',
        sprayGuide: 'Tilt / Folicur (Propiconazole 25% EC) @ 200 ml in 200L water per acre on first spotting.',
      },
      {
        id: 'crop-1-2',
        name: 'Potato',
        variety: 'Kufri Pukhraj (Certified)',
        area: 10,
        areaUnit: 'Acres',
        season: 'Rabi',
        stage: 'Tuber Bulking & Canopy Closure',
        stageStep: 3,
        currentDay: 42,
        totalDays: 90,
        health: 'Optimal (92% NDVI)',
        sownDate: 'Oct 10, 2026',
        nextMilestone: 'Late Blight Preventive Spray (Day 48)',
        harvestDate: 'Mid Jan 2027',
        color: '#D97706',
        lowMoistureAlert: 40,
        currentMoisture: 44.5,
        dos: [
          'Perform earthing-up thoroughly at 25-30 days to protect tubers from turning green.',
          'Maintain consistent, light soil moisture throughout tuber bulking to avoid cracking.',
          'Cut potato haulms (stems) 10-12 days prior to digging so skins harden for cold storage.',
        ],
        donts: [
          'Do not let furrow water overflow the top of ridges; it rots tubers and creates Late Blight.',
          'Avoid high nitrogen top-dressing after tuber initiation as it causes oversized hollow tubers.',
          'Do not skip prophylactic copper oxychloride or Ridomil Gold spray before foggy weather.',
        ],
        diseases: 'Late Blight (Pichheti Jhulsa), Early Blight, Black Scurf',
        sprayGuide: 'Ridomil Gold (Metalaxyl + Mancozeb) @ 500g in 200L water per acre before fog onset.',
      },
    ],
  },
  {
    id: 'farm-2',
    name: 'Malwa Golden Fields',
    address: 'Village Bhawanigarh, Patiala Road',
    district: 'Sangrur',
    state: 'Punjab',
    pinCode: '148026',
    totalArea: 24,
    areaUnit: 'Acres',
    soilType: 'Red & Yellow Sandy Loam',
    irrigationType: 'Sprinkler System (Overhead/Center Pivot)',
    waterSource: 'Farm Pond / Rainwater Harvesting Tank',
    cropTemplate: 'Mustard (16 Ac) & Barseem Fodder (8 Ac)',
    crops: [
      {
        id: 'crop-2-1',
        name: 'Mustard / Sarson',
        variety: 'Pusa Jai Kisan',
        area: 16,
        areaUnit: 'Acres',
        season: 'Rabi',
        stage: 'Vegetative & Budding Stage',
        stageStep: 2,
        currentDay: 35,
        totalDays: 120,
        health: 'Vigorous (96% NDVI)',
        sownDate: 'Oct 18, 2026',
        nextMilestone: 'Foliar Boron & Sulphur Spray (Day 42)',
        harvestDate: 'Late Feb 2027',
        color: '#F9B21B',
        lowMoistureAlert: 25,
        currentMoisture: 38.0,
        dos: [
          'Apply 10 kg elemental Sulphur or 20 kg Gypsum per acre to substantially boost seed oil content.',
          'Provide light irrigation at flowering and siliqua (pod) development stages.',
          'Use yellow sticky insect traps (8 per acre) to catch early winged aphids without chemical spray.',
        ],
        donts: [
          'Do not over-irrigate mustard as stagnant water causes root rot and yellowing.',
          'Never spray insecticides during active midday hours when honeybees are pollinating flowers.',
          'Avoid sowing uncertified local seeds without fungicide treatment.',
        ],
        diseases: 'White Rust, Alternaria Blight, Mustard Aphid (Mahu/Chepa)',
        sprayGuide: 'Actara (Thiamethoxam 25% WG) @ 40g in 150L water per acre on aphid threshold.',
      },
      {
        id: 'crop-2-2',
        name: 'Green Fodder',
        variety: 'Barseem (African Tall)',
        area: 8,
        areaUnit: 'Acres',
        season: 'Rabi',
        stage: 'Vegetative / Multi-Cut',
        stageStep: 1,
        currentDay: 20,
        totalDays: 150,
        health: 'Good (91% NDVI)',
        sownDate: 'Nov 01, 2026',
        nextMilestone: 'First Harvest Cut (Day 45)',
        harvestDate: 'April 2027',
        color: '#15803D',
        lowMoistureAlert: 35,
        currentMoisture: 39.5,
        dos: [
          'Irrigate every 10-12 days to ensure rapid regeneration after each cutting.',
          'Apply 10 kg Urea per acre immediately following each cutting.',
        ],
        donts: [
          'Do not cut too close to ground surface; leave 4-5 cm stubble for regrowth.',
        ],
        diseases: 'Stem Rot (Sclerotinia)',
        sprayGuide: 'Bavistin (Carbendazim 50% WP) @ 250g/acre on early basal rot.',
      },
    ],
  },
];

export const initialCrops = initialFarms[0].crops;

// EXACT MATCH WITH `INITIAL_TASKS` IN DASHBOARD
export const initialTasks: Task[] = [
  {
    id: 'task-1',
    farmId: 'farm-1',
    farmName: 'Khetivo Green Acres (Samrala)',
    title: 'Apply Urea Top-Dressing',
    category: 'Fertilization & Nutrition',
    priority: 'High',
    status: 'To Do',
    dueDate: '2026-10-27',
    assignedTo: 'Harpreet Singh',
    zone: 'Zone A (12 Acres)',
    crop: 'PBW 826 Wheat',
    instructions: 'Apply 45 kg/acre urea top dressing right after evening drip cycle.',
    description: 'First critical nitrogen split to promote tillering and vegetative growth.',
  },
  {
    id: 'task-2',
    farmId: 'farm-1',
    farmName: 'Khetivo Green Acres (Samrala)',
    title: 'Inspect Canal Gate Valve & Filter Mesh',
    category: 'Irrigation & Water Management',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '2026-10-29',
    assignedTo: 'Jaswinder Singh',
    zone: 'Zone B North Canal',
    crop: 'General Irrigation',
    instructions: 'Clean sand filter screen and check hydraulic actuator pressure.',
    description: 'Routine bi-weekly flush of filtration manifold before next watering.',
  },
  {
    id: 'task-3',
    farmId: 'farm-1',
    farmName: 'Khetivo Green Acres (Samrala)',
    title: 'Moisture Probe & IoT Recalibration',
    category: 'Soil Testing & Field Scouting',
    priority: 'High',
    status: 'To Do',
    dueDate: '2026-10-28',
    assignedTo: 'Dr. Sharma',
    zone: 'Zone A North Parcel',
    crop: 'PBW 826 Wheat',
    instructions: 'Check LoRa telemetry sensor node #3 battery and calibrate dielectric permittivity.',
    description: 'Soil moisture readings have a 4% variance against manual tensiometer.',
  },
  {
    id: 'task-4',
    farmId: 'farm-1',
    farmName: 'Khetivo Green Acres (Samrala)',
    title: 'First Post-Sowing Irrigation Cycle',
    category: 'Irrigation & Water Management',
    priority: 'Urgent',
    status: 'To Do',
    dueDate: '2026-10-25',
    assignedTo: 'Harpreet Singh',
    zone: 'Zone A & B',
    crop: 'PBW 826 Wheat',
    instructions: 'Apply 35mm net depth across drip network via solar pump.',
    description: 'Crown root initiation stage moisture replenishment.',
    completedDate: '2026-10-25',
  },
  {
    id: 'task-5',
    farmId: 'farm-1',
    farmName: 'Khetivo Green Acres (Samrala)',
    title: 'Preventative Mancozeb Blight Spray',
    category: 'Pest & Disease Spraying',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '2026-10-24',
    assignedTo: 'Gurmukh Ram',
    zone: 'South Parcel (8 Acres)',
    crop: 'Kufri Pukhraj Potato',
    instructions: 'Mix 2.5g Mancozeb per liter of water. Spray using hollow cone nozzle.',
    description: 'Preventative early blight cover ahead of forecasted morning dew.',
    completedDate: '2026-10-24',
  },
  {
    id: 'task-6',
    farmId: 'farm-2',
    farmName: 'Malwa Golden Fields (Sangrur)',
    title: 'Mustard Aphid Field Scouting',
    category: 'Soil Testing & Field Scouting',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '2026-10-31',
    assignedTo: 'Navdeep Singh',
    zone: 'Block C Mustard Strip',
    crop: 'Giriraj Mustard',
    instructions: 'Sample 20 plants randomly along diagonal transect for aphid colonies.',
    description: 'Early detection threshold for foliar insecticide timing.',
  },
  {
    id: 'task-7',
    farmId: 'farm-2',
    farmName: 'Malwa Golden Fields (Sangrur)',
    title: 'Tractor 50-Hour Lubrication & Grease',
    category: 'Machinery & Equipment Service',
    priority: 'Low',
    status: 'In Progress',
    dueDate: '2026-11-02',
    assignedTo: 'Gurmukh Ram',
    zone: 'Equipment Yard',
    instructions: 'Grease 3-point linkage, PTO spline, and check hydraulic reservoir dipstick.',
    description: 'Scheduled preventive maintenance for Mahindra 475 DI.',
  },
  {
    id: 'task-8',
    farmId: 'farm-1',
    farmName: 'Khetivo Green Acres (Samrala)',
    title: 'Seedbed Preparation for Late Rabi Wheat',
    category: 'Sowing & Seedbed Prep',
    priority: 'High',
    status: 'To Do',
    dueDate: '2026-11-05',
    assignedTo: 'Harnek Singh',
    zone: 'Zone C Fallow Field',
    crop: 'HD 3086 Wheat',
    instructions: 'Run 2 passes with rotavator followed by laser levelling.',
    description: 'Prepare fine tilth for zero-till drill seeding.',
  },
];

// EXACT MATCH WITH `INITIAL_INVENTORY_ITEMS` IN DASHBOARD
export const initialInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    farmId: 'farm-1',
    farmName: 'Khetivo Green Acres (Samrala)',
    storeId: 'store-1',
    storeName: 'Store 1',
    name: 'Mancozeb 75% WP',
    category: 'Fungicide',
    batchNumber: 'MZ-2508',
    purchasedDate: '2026-10-15',
    expiryDate: '2026-11-12', // Expiring soon in 2d
    quantity: 25,
    unit: 'kg',
    rate: 450,
    lowStockThreshold: 10,
  },
  {
    id: 'inv-2',
    farmId: 'farm-1',
    farmName: 'Khetivo Green Acres (Samrala)',
    storeId: 'store-1',
    storeName: 'Store 1',
    name: 'Urea 46% N (IFFCO Neem Coated)',
    category: 'Fertilizer',
    batchNumber: 'UR-9921',
    purchasedDate: '2026-10-01',
    expiryDate: '2027-10-01',
    quantity: 38,
    unit: 'bags',
    rate: 266,
    lowStockThreshold: 15,
  },
  {
    id: 'inv-3',
    farmId: 'farm-1',
    farmName: 'Khetivo Green Acres (Samrala)',
    storeId: 'store-1',
    storeName: 'Store 1',
    name: 'DAP (Di-Ammonium Phosphate 18:46:0)',
    category: 'Fertilizer',
    batchNumber: 'DAP-4102',
    purchasedDate: '2026-09-20',
    expiryDate: '2027-09-20',
    quantity: 4, // Low stock alert
    unit: 'bags',
    rate: 1350,
    lowStockThreshold: 10,
  },
  {
    id: 'inv-4',
    farmId: 'farm-1',
    farmName: 'Khetivo Green Acres (Samrala)',
    storeId: 'store-2',
    storeName: 'Chemical & Spray Locker',
    name: 'Emamectin Benzoate 5% SG',
    category: 'Insecticide',
    batchNumber: 'EB-3310',
    purchasedDate: '2026-10-05',
    expiryDate: '2028-04-15',
    quantity: 12,
    unit: 'packets',
    rate: 320,
    lowStockThreshold: 5,
  },
  {
    id: 'inv-5',
    farmId: 'farm-1',
    farmName: 'Khetivo Green Acres (Samrala)',
    storeId: 'store-1',
    storeName: 'Store 1',
    name: 'Rivulis 16mm Drip Lateral Line',
    category: 'Irrigation Hardware',
    batchNumber: 'DL-8812',
    purchasedDate: '2026-08-10',
    expiryDate: '2029-08-10',
    quantity: 650,
    unit: 'meters',
    rate: 12,
    lowStockThreshold: 200,
  },
];

export const initialUsageLogs: ItemUsageLog[] = [
  {
    id: 'usage-1',
    itemId: 'inv-1',
    itemName: 'Mancozeb 75% WP',
    farmId: 'farm-1',
    farmName: 'Khetivo Green Acres (Samrala)',
    storeId: 'store-1',
    storeName: 'Store 1',
    quantityUsed: 5,
    unit: 'kg',
    date: '2026-10-25',
    purpose: 'Preventative foliar spray for early blight scouting in Potato Parcel',
    crop: 'Potato',
    appliedBy: 'Harpreet Singh',
  },
  {
    id: 'usage-2',
    itemId: 'inv-2',
    itemName: 'Urea 46% N (IFFCO Neem Coated)',
    farmId: 'farm-1',
    farmName: 'Khetivo Green Acres (Samrala)',
    storeId: 'store-1',
    storeName: 'Store 1',
    quantityUsed: 12,
    unit: 'bags',
    date: '2026-10-22',
    purpose: '1st Nitrogen Top-Dressing post first irrigation in Wheat Zone A',
    crop: 'Wheat',
    appliedBy: 'Gurmukh Ram',
  },
];

export const initialMandiRates: MandiRate[] = [
  {
    id: 'm1',
    mandi: 'Khanna (Asia’s Largest Grain Market)',
    district: 'Ludhiana, PB',
    crop: 'Wheat (Kanak)',
    variety: 'Sharbati / HD-3086',
    modalPrice: 2425,
    minPrice: 2360,
    maxPrice: 2480,
    msp: 2275,
    trend: 'up',
    date: 'Today, 11:30 AM',
  },
  {
    id: 'm2',
    mandi: 'Ludhiana City APMC',
    district: 'Ludhiana, PB',
    crop: 'Wheat (Kanak)',
    variety: 'PBW-826 FAQ',
    modalPrice: 2390,
    minPrice: 2320,
    maxPrice: 2440,
    msp: 2275,
    trend: 'up',
    date: 'Today, 10:45 AM',
  },
  {
    id: 'm3',
    mandi: 'Sangrur Grain Market',
    district: 'Sangrur, PB',
    crop: 'Mustard (Sarson)',
    variety: 'Pusa Jai Kisan',
    modalPrice: 5650,
    minPrice: 5400,
    maxPrice: 5850,
    msp: 5650,
    trend: 'up',
    date: 'Today, 10:30 AM',
  },
  {
    id: 'm4',
    mandi: 'Jalandhar Fresh Market',
    district: 'Jalandhar, PB',
    crop: 'Potato (Aloo)',
    variety: 'Kufri Pukhraj Fresh',
    modalPrice: 1150,
    minPrice: 950,
    maxPrice: 1300,
    msp: 800,
    trend: 'down',
    date: 'Today, 08:30 AM',
  },
];

export const initialEquipment: Equipment[] = [
  { id: 'eq1', name: 'John Deere 5310 4WD (55 HP)', model: 'JD-2023 Series', hoursRun: 412, nextServiceHours: 500, status: 'Operational', fuelLevel: 75 },
  { id: 'eq2', name: 'Fieldking Laser Land Leveler', model: 'FK-LL-2022', hoursRun: 180, nextServiceHours: 250, status: 'Operational', fuelLevel: 100 },
  { id: 'eq3', name: '10 HP Crompton Submersible Motor', model: 'Borewell #01 (Samrala)', hoursRun: 1840, nextServiceHours: 2000, status: 'In Field', fuelLevel: 100 },
  { id: 'eq4', name: 'Aspee Tractor-Mounted Boom Sprayer', model: 'Aspee 500L', hoursRun: 95, nextServiceHours: 100, status: 'Service Due', fuelLevel: 40 },
];

export const initialWorkers: Worker[] = [
  { id: 'w1', name: 'Harpreet Singh', role: 'Chief Tubewell & Drip Operator', phone: '+91 98765-43210', assignedParcels: 'Zone A & Zone B', status: 'On Duty' },
  { id: 'w2', name: 'Jaswinder Singh', role: 'Irrigation & Canal Specialist', phone: '+91 98140-12345', assignedParcels: 'Zone B North Canal', status: 'On Duty' },
  { id: 'w3', name: 'Dr. Sharma', role: 'IoT Hardware & Telemetry Lead', phone: '+91 94170-88990', assignedParcels: 'Zone A North Parcel', status: 'On Duty' },
  { id: 'w4', name: 'Gurmeet Singh', role: 'Scouting & Store Keeper', phone: '+91 97800-55667', assignedParcels: 'Samrala Store Hub', status: 'Off Duty' },
];

export const initialFinancials: FinancialStats = {
  production: 1078000,
  expenses: 170100,
  losses: 12500,
  netProfit: 895400,
};

export interface Advisory {
  id: string;
  title: string;
  category: string;
  priority: 'High / Emergency' | 'Medium / Advisory' | 'Info';
  targetCrop: string;
  targetDistrict: string;
  message: string;
  actionPrescription: string;
  dispatchedAt: string;
  dispatchedBy: string;
}

export const initialAdvisories: Advisory[] = [
  {
    id: 'bc-101',
    title: 'Urgent Yellow Rust (Stripe Rust) Alert in Ludhiana Bet',
    category: 'Pest & Disease Alert',
    priority: 'High / Emergency',
    targetCrop: 'Wheat (Kanak)',
    targetDistrict: 'Ludhiana',
    message:
      'High relative humidity (>85%) following unseasonal rain has created optimal spore conditions for Stripe Rust. Inspect early tillering leaf tips in low-lying parcels.',
    actionPrescription:
      'Tilt / Propiconazole 25% EC @ 200 ml in 200L water per acre with hollow-cone spray nozzle. Withhold urea top-dressing until treated.',
    dispatchedAt: '28 Oct 2026, 08:30 AM',
    dispatchedBy: 'Dr. Harpreet Singh (PAU)',
  },
  {
    id: 'bc-102',
    title: 'Sub-4°C Ground Frost Warning for Mustard Intercrops',
    category: 'Weather & Frost Warning',
    priority: 'Medium / Advisory',
    targetCrop: 'Mustard / Sarson',
    targetDistrict: 'Bathinda',
    message:
      'Night temperatures projected to dip to 3.8°C over next 48 hours with clear skies and calm winds in the Bathinda-Abohar belt. High frost risk for flowering siliquae.',
    actionPrescription:
      'Apply light evening irrigation to raise soil thermal capacity. Light smoke heaps along windward boundary if temperatures drop below 3°C.',
    dispatchedAt: '26 Oct 2026, 04:15 PM',
    dispatchedBy: 'Dr. Gurmeet Kaur (PAU)',
  },
];

export interface WeatherData {
  district: string;
  state: string;
  temp: number;
  highTemp: number;
  lowTemp: number;
  condition: string;
  humidity: number;
  windSpeed: string;
  sprayWindow: string;
  sprayStatus: 'Optimal' | 'Caution' | 'Unsafe';
  uvIndex: number;
  rainChance: number;
  forecast: {
    day: string;
    temp: string;
    condition: string;
    rain: string;
  }[];
}

export const initialWeather: WeatherData = {
  district: 'Ludhiana',
  state: 'Punjab',
  temp: 28,
  highTemp: 31,
  lowTemp: 17,
  condition: 'Clear Sky & Mild Sunlight',
  humidity: 58,
  windSpeed: '12 km/h NW',
  sprayWindow: '08:00 AM - 12:00 PM (Optimal)',
  sprayStatus: 'Optimal',
  uvIndex: 4,
  rainChance: 0,
  forecast: [
    { day: 'Wed (Today)', temp: '28° / 17°', condition: 'Sunny', rain: '0%' },
    { day: 'Thu', temp: '27° / 16°', condition: 'Sunny', rain: '0%' },
    { day: 'Fri', temp: '26° / 15°', condition: 'Clear', rain: '5%' },
    { day: 'Sat', temp: '25° / 14°', condition: 'Cool Breeze', rain: '0%' },
    { day: 'Sun', temp: '24° / 14°', condition: 'Sunny', rain: '0%' },
    { day: 'Mon', temp: '26° / 15°', condition: 'Clear', rain: '0%' },
    { day: 'Tue', temp: '27° / 16°', condition: 'Sunny', rain: '0%' },
  ],
};

export interface ReportItem {
  id: string;
  title: string;
  category: string;
  period: string;
  status: 'Audit Ready' | 'Generated';
  summary: string;
  metric1Label: string;
  metric1Val: string;
  metric2Label: string;
  metric2Val: string;
}

export const initialReports: ReportItem[] = [
  {
    id: 'rep-1',
    title: 'PAU Crop Precision & Yield Performance Audit',
    category: 'Agronomy & Yield Audit',
    period: 'Rabi Season 2026-27',
    status: 'Audit Ready',
    summary: 'Wheat (HD-3086) biomass tracking 22% above district average with zero lodging.',
    metric1Label: 'Projected Yield',
    metric1Val: '24.2 Qtl/Ac',
    metric2Label: 'Health Score',
    metric2Val: '95% NDVI',
  },
  {
    id: 'rep-2',
    title: 'IoT Root Moisture & Water Conservation Audit',
    category: 'Water Conservation',
    period: 'Last 30 Days (Oct 2026)',
    status: 'Audit Ready',
    summary: 'Automated 10HP tubewell motor saved 4 irrigation cycles (14.8 Lakh litres water).',
    metric1Label: 'Groundwater Saved',
    metric1Val: '14.8L Litres',
    metric2Label: 'Diesel Saved',
    metric2Val: '₹18,400',
  },
  {
    id: 'rep-3',
    title: 'Fertilizer & Agrochemical Input Consumption Report',
    category: 'Inputs & Chemical Audit',
    period: 'Current Crop Cycle',
    status: 'Generated',
    summary: 'Controlled nitrogen application avoided surplus leaching; full PAU compliance.',
    metric1Label: 'Urea Applied',
    metric1Val: '45 kg / Ac',
    metric2Label: 'Savings',
    metric2Val: '18% vs Blanket',
  },
];

export interface SubscriptionInfo {
  tier: string;
  status: string;
  acresAllocated: string;
  workersActive: string;
  renewalDate: string;
  annualFee: string;
  features: string[];
}

export const initialSubscription: SubscriptionInfo = {
  tier: 'Pro Farm OS Tier',
  status: 'Active (Renews Nov 2027)',
  acresAllocated: '52 / 100 Acres Registered',
  workersActive: '4 / 15 Workers Active',
  renewalDate: '24 Nov 2027',
  annualFee: '₹12,000 / Year (All Inclusive)',
  features: [
    'Unlimited Soil Moisture & IoT Telemetry Nodes',
    'Real-time PAU Disease & Yellow Rust Bulletins',
    'Full Farm Worker Delegation & Daily Tasks',
    'Store & Seed/Fertilizer Stock Reorder Alerts',
    '24/7 Dedicated Agronomist SLA & WhatsApp Desk',
  ],
};

export interface FarmSettings {
  farmerName: string;
  phone: string;
  district: string;
  measurementUnit: 'Acres' | 'Bigha' | 'Hectares';
  language: 'en' | 'pa' | 'hi';
  offlineSync: boolean;
  motorAutomation: boolean;
}

export const initialSettings: FarmSettings = {
  farmerName: 'Gurpreet Singh',
  phone: '+91 98721-00000',
  district: 'Ludhiana, Punjab',
  measurementUnit: 'Acres',
  language: 'en',
  offlineSync: true,
  motorAutomation: true,
};
