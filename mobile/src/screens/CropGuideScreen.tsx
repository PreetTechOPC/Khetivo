import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { initialFarms, Farm, Crop } from '../data/mockData';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { DatePickerModal } from '../components/DatePickerModal';

interface CropGuideScreenProps {
  onBack: () => void;
}

export interface CropTemplate {
  id: string;
  name: string;
  variety: string;
  varieties: string[];
  durationDays: number;
  season: string;
  typicalAge: number;
  defaultSownDate?: string;
  stages: { step: number; name: string; days: string; desc: string; defaultDay?: number }[];
  dos: string[];
  donts: string[];
}

export const CROP_TEMPLATES: CropTemplate[] = [
  {
    id: 'wheat',
    name: 'Wheat (Kanak)',
    variety: 'HD-3086 / PBW-826',
    varieties: ['HD-3086', 'PBW-826', 'DBW-187', 'PBW-725', 'Sharbati'],
    durationDays: 135,
    season: 'Rabi',
    typicalAge: 25,
    defaultSownDate: '15-10-2026',
    stages: [
      { step: 1, name: '1. Sowing & Germination', days: 'Days 1–15', desc: 'Seedling emergence & root set', defaultDay: 10 },
      { step: 2, name: '2. Crown Root Initiation (CRI)', days: 'Days 20–30', desc: 'Critical 1st irrigation & tiller initiation', defaultDay: 25 },
      { step: 3, name: '3. Tillering & Stem Elongation', days: 'Days 35–55', desc: 'Active vegetative growth & nitrogen absorption', defaultDay: 45 },
      { step: 4, name: '4. Booting & Heading', days: 'Days 60–80', desc: 'Ear emergence & flag leaf development', defaultDay: 70 },
      { step: 5, name: '5. Flowering & Anthesis', days: 'Days 85–100', desc: 'Pollination & grain setting', defaultDay: 90 },
      { step: 6, name: '6. Milking & Grain Hardening', days: 'Days 105–135', desc: 'Starch filling & terminal maturity', defaultDay: 120 },
    ],
    dos: [
      'Perform certified seed treatment with recommended fungicide before sowing',
      'Ensure 1st critical irrigation at Crown Root Initiation (CRI) stage (20-25 days)',
      'Apply balanced NPK with Zinc Sulphate (21%) for optimal tiller development',
      'Scout flag leaves weekly during Jan-Feb for yellow rust stripe pustules',
    ],
    donts: [
      'Do not allow standing water or moisture stagnation in the root zone',
      'Do not delay first irrigation past 25 days as it permanently stunts root development',
      'Avoid excessive nitrogen top-dressing after booting stage',
      'Do not irrigate within 15 days before combine harvesting',
    ],
  },
  {
    id: 'paddy',
    name: 'Paddy / Rice (Dhan)',
    variety: 'Pusa Basmati 1121 / PR-126',
    varieties: ['Pusa Basmati 1121', 'PR-126', 'PR-131', 'Pusa Basmati 1509'],
    durationDays: 125,
    season: 'Kharif',
    typicalAge: 20,
    defaultSownDate: '23-10-2026',
    stages: [
      { step: 1, name: '1. Nursery & Transplanting', days: 'Days 1–15', desc: 'Maintain 4-5 cm standing water for seedling anchorage', defaultDay: 10 },
      { step: 2, name: '2. Active Tillering', days: 'Days 20–45', desc: 'Top-dress Urea in splits; alternate wetting & drying', defaultDay: 30 },
      { step: 3, name: '3. Panicle Initiation & Booting', days: 'Days 50–75', desc: 'Critical moisture window & stem borer watch', defaultDay: 60 },
      { step: 4, name: '4. Flowering & Grain Filling', days: 'Days 80–105', desc: 'Milk stage shallow saturation', defaultDay: 90 },
      { step: 5, name: '5. Maturity & Harvest', days: 'Days 110–125', desc: 'Drain field 12 days prior to combine harvest', defaultDay: 115 },
    ],
    dos: [
      'Maintain 4-5 cm standing water for the first 15 days post-transplanting',
      'Practice Alternate Wetting and Drying (AWD) after tillering to conserve groundwater',
      'Top-dress Urea in split doses combined with Zinc Sulphate',
      'Drain fields 10-14 days prior to combine harvesting to allow soil firming',
    ],
    donts: [
      'Do not keep water continuously stagnated; it promotes sheath blight and root rot',
      'Avoid high nitrogen doses during flowering stage to prevent neck blast infection',
      'Do not transplant nursery seedlings older than 30 days',
      'Never burn crop stubble; incorporate residue into soil or use Happy Seeder',
    ],
  },
  {
    id: 'mustard',
    name: 'Mustard / Sarson',
    variety: 'Pusa Jai Kisan / Giriraj',
    varieties: ['Pusa Jai Kisan', 'Giriraj', 'Pusa Bold', 'RH-749', 'RLC-3'],
    durationDays: 120,
    season: 'Rabi',
    typicalAge: 18,
    defaultSownDate: '25-10-2026',
    stages: [
      { step: 1, name: '1. Sowing & Rosette Phase', days: 'Days 1–25', desc: 'Pre-sowing watering & thinning at 15-20 days', defaultDay: 15 },
      { step: 2, name: '2. Branching & Pre-Flowering', days: 'Days 30–55', desc: '1st post-sowing irrigation & remaining Nitrogen', defaultDay: 40 },
      { step: 3, name: '3. Flowering & Siliqua Formation', days: 'Days 60–90', desc: 'Critical 2nd irrigation & aphid surveillance', defaultDay: 75 },
      { step: 4, name: '4. Pod Filling & Maturity', days: 'Days 95–120', desc: 'Harvest when 75% of siliquae turn golden', defaultDay: 105 },
    ],
    dos: [
      'Apply 10 kg elemental Sulphur or 20 kg Gypsum per acre to boost seed oil content',
      'Provide light irrigation at flowering and siliqua (pod) development stages',
      'Use yellow sticky insect traps (8 per acre) to catch early winged aphids',
      'Perform timely thinning within 20 days of sowing to ensure 15cm plant spacing',
    ],
    donts: [
      'Do not over-irrigate mustard as stagnant water causes root rot and yellowing',
      'Never spray insecticides during active midday hours when bees are pollinating',
      'Avoid flood irrigation during peak flowering to prevent blossom drop',
      'Do not harvest during blazing afternoon heat to prevent pod shattering loss',
    ],
  },
  {
    id: 'potato',
    name: 'Potato (Aloo)',
    variety: 'Kufri Pukhraj / Jyoti',
    varieties: ['Kufri Pukhraj', 'Kufri Jyoti', 'Kufri Chipsona', 'Lady Rosetta'],
    durationDays: 95,
    season: 'Rabi',
    typicalAge: 15,
    defaultSownDate: '28-10-2026',
    stages: [
      { step: 1, name: '1. Sprouting & Stolon Formation', days: 'Days 1–25', desc: 'Earthing-up and furrow irrigation', defaultDay: 15 },
      { step: 2, name: '2. Tuber Initiation', days: 'Days 30–50', desc: 'Uniform ridge moisture to avoid misshapen tubers', defaultDay: 40 },
      { step: 3, name: '3. Tuber Bulking', days: 'Days 55–75', desc: 'Consistent moisture & intensive blight scouting', defaultDay: 65 },
      { step: 4, name: '4. Skin Setting & Haulm Cutting', days: 'Days 80–95', desc: 'Dehaulming 10-12 days before digging', defaultDay: 85 },
    ],
    dos: [
      'Perform earthing-up thoroughly at 25-30 days to protect tubers from turning green',
      'Maintain consistent, light soil moisture throughout tuber bulking to avoid cracking',
      'Cut potato haulms (stems) 10-12 days prior to digging so skins harden for storage',
      'Use certified disease-free seed tubers treated with fungicide',
    ],
    donts: [
      'Do not let furrow water overflow the top of ridges; it rots tubers',
      'Avoid high nitrogen top-dressing after tuber initiation',
      'Never plant freshly cut seed tubers without proper curing',
      'Do not expose harvested potato heaps to direct afternoon sunlight',
    ],
  },
  {
    id: 'cotton',
    name: 'Bt Cotton (Narma)',
    variety: 'Bollgard II Hybrid',
    varieties: ['Bollgard II Hybrid', 'Bt RCH-659', 'Ankur 3028', 'Bioseed 6588'],
    durationDays: 165,
    season: 'Kharif',
    typicalAge: 30,
    defaultSownDate: '13-10-2026',
    stages: [
      { step: 1, name: '1. Emergence & Square Initiation', days: 'Days 1–45', desc: 'First irrigation at 35-40 days; pheromone traps', defaultDay: 30 },
      { step: 2, name: '2. Peak Flowering', days: 'Days 50–80', desc: 'Foliar spray of Potassium Nitrate; scout whitefly', defaultDay: 65 },
      { step: 3, name: '3. Boll Development', days: 'Days 85–125', desc: 'Crucial irrigation to avoid boll shedding', defaultDay: 100 },
      { step: 4, name: '4. Boll Bursting & Picking', days: 'Days 130–165', desc: 'Clean picking in dry sunny weather', defaultDay: 145 },
    ],
    dos: [
      'Install 8 pheromone traps per acre at 45 days for Pink Bollworm surveillance',
      'Foliar spray 2% Potassium Nitrate during peak boll development',
      'Maintain clean field boundaries and remove weed hosts of whitefly',
      'Pick seed-cotton in dry sunny weather after morning dew has evaporated',
    ],
    donts: [
      'Do not spray synthetic pyrethroids early in the season',
      'Do not allow field water stagnation for more than 24 hours',
      'Avoid picking damp or dew-laden cotton',
      'Never mix pest-damaged or stained bolls with clean seed cotton',
    ],
  },
  {
    id: 'maize',
    name: 'Maize / Corn (Makki)',
    variety: 'Pioneer 3396 Hybrid',
    varieties: ['Pioneer 3396 Hybrid', 'DKC 9108', 'PMH-1', 'PMH-13'],
    durationDays: 105,
    season: 'Kharif',
    typicalAge: 22,
    defaultSownDate: '21-10-2026',
    stages: [
      { step: 1, name: '1. Germination & Seedling', days: 'Days 1–20', desc: 'Pre-emergence weed suppression', defaultDay: 12 },
      { step: 2, name: '2. Knee-High Stage', days: 'Days 25–45', desc: 'Top-dress Urea; scout for Fall Armyworm', defaultDay: 35 },
      { step: 3, name: '3. Tasseling & Silking', days: 'Days 50–75', desc: 'Critical moisture window during pollen shed', defaultDay: 60 },
      { step: 4, name: '4. Grain Filling & Dough Stage', days: 'Days 80–105', desc: 'Maintain moisture until black layer formation', defaultDay: 90 },
    ],
    dos: [
      'Apply pre-emergence herbicide within 48 hours of sowing',
      'Inspect central leaf whorls for Fall Armyworm pinholes at knee-high stage',
      'Ensure adequate soil moisture during critical tasseling and silking',
      'Apply balanced Muriate of Potash alongside nitrogen for stalk strength',
    ],
    donts: [
      'Do not allow drought stress during pollination',
      'Avoid broad overhead spray when larvae are inside leaf whorls',
      'Do not overpopulate without maintaining minimum 60 cm row spacing',
      'Never store grain at moisture levels exceeding 14%',
    ],
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane (Kamad)',
    variety: 'Co-0238 / Co-86032',
    varieties: ['Co 0238 (Early)', 'CoPb 95', 'CoPb 96', 'Co-86032'],
    durationDays: 330,
    season: 'Annual',
    typicalAge: 45,
    defaultSownDate: '28-09-2026',
    stages: [
      { step: 1, name: '1. Germination & Tillering', days: 'Days 1–60', desc: 'Sett treatment & blind hoeing at 3-4 weeks', defaultDay: 35 },
      { step: 2, name: '2. Formative & Shoot Elongation', days: 'Days 65–150', desc: 'Apply Urea in splits & shoot borer control', defaultDay: 100 },
      { step: 3, name: '3. Grand Growth (Cane Formation)', days: 'Days 155–260', desc: 'Earthing up to prevent lodging & trash mulch', defaultDay: 200 },
      { step: 4, name: '4. Ripening & Sugar Synthesis', days: 'Days 265–330', desc: 'Withhold irrigation 20 days prior to harvest', defaultDay: 290 },
    ],
    dos: [
      'Treat two-budded seed setts with fungicide prior to furrow planting',
      'Perform earthing-up twice before monsoon to anchor tall cane',
      'Spread sugarcane trash mulch between rows to suppress weeds',
      'Apply recommended granules against early shoot borer',
    ],
    donts: [
      'Do not use setts from fields with history of red rot',
      'Do not irrigate 20-25 days before mill harvest to maximize sugar',
      'Avoid harvesting immature or over-aged cane',
      'Never burn trash indiscriminately; decompose using inoculants',
    ],
  },
  {
    id: 'fodder',
    name: 'Green Fodder (Barseem)',
    variety: 'African Tall / Mescavi',
    varieties: ['Barseem (African Tall)', 'BL-42', 'BL-10', 'Mescavi'],
    durationDays: 150,
    season: 'Rabi',
    typicalAge: 20,
    defaultSownDate: '23-10-2026',
    stages: [
      { step: 1, name: '1. Sowing & Emergence', days: 'Days 1–20', desc: 'Inoculate seed with Rhizobium culture', defaultDay: 10 },
      { step: 2, name: '2. First Vegetative Growth', days: 'Days 21–45', desc: 'Vigorous multi-shoot development towards first cut', defaultDay: 30 },
      { step: 3, name: '3. Multi-Cut Regrowth Cycle', days: 'Days 46–120', desc: 'Irrigate & top-dress Urea right after each cut', defaultDay: 80 },
      { step: 4, name: '4. Final Harvest & Flower Setting', days: 'Days 121–150', desc: 'Terminal green cut or seed harvest', defaultDay: 135 },
    ],
    dos: [
      'Irrigate every 10-12 days to ensure rapid regeneration after each cutting',
      'Apply 10 kg Urea per acre immediately following each cutting',
      'Inoculate seed with Rhizobium culture before sowing to fix nitrogen',
      'Cut at 5-6 cm above ground level to protect crown regrowth buds',
    ],
    donts: [
      'Do not cut too close to ground surface; leave 5 cm stubble for regrowth',
      'Avoid heavy flood irrigation during early seedling emergence',
      'Do not feed wilted fodder that has heated up in bags or heaps',
      'Avoid spraying toxic insecticides on standing fodder close to harvest',
    ],
  },
];

// Helper functions to sync Sown Date & Crop Age
const calculateSownDateFromAge = (ageDays: number): string => {
  const d = new Date(2026, 10, 12); // Nov 12, 2026
  d.setDate(d.getDate() - ageDays);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const calculateAgeFromSownDate = (dateStr: string): number => {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    let sownDate: Date;
    if (parts[0].length === 4) {
      sownDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      sownDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
    const today = new Date(2026, 10, 12);
    const diffTime = today.getTime() - sownDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }
  return 20;
};

interface ActiveCropData {
  id: string;
  name: string;
  variety: string;
  area: number;
  areaUnit: string;
  season: string;
  stage: string;
  stageStep: number;
  currentDay: number;
  totalDays: number;
  health: string;
  sownDate: string;
  harvestDate: string;
  nextMilestone: string;
  farmId: string;
  farmName: string;
  templateId: string;
}

export const CropGuideScreen: React.FC<CropGuideScreenProps> = ({ onBack }) => {
  const [crops, setCrops] = useState<ActiveCropData[]>([
    {
      id: 'crop-1',
      name: 'Wheat (Kanak)',
      variety: 'HD-3086 / Sharbati',
      area: 18,
      areaUnit: 'Acres',
      season: 'Rabi',
      stage: 'Crown Root Initiation & Tillering',
      stageStep: 2,
      currentDay: 28,
      totalDays: 135,
      health: 'Vigorous Canopy (94% NDVI)',
      sownDate: 'Oct 24, 2026',
      harvestDate: 'Late March 2027',
      nextMilestone: '1st Split Urea Top-Dressing (Day 30)',
      farmId: 'farm-1',
      farmName: 'Khetivo Green Acres (Samrala)',
      templateId: 'wheat',
    },
    {
      id: 'crop-2',
      name: 'Potato (Aloo)',
      variety: 'Kufri Pukhraj (Certified)',
      area: 10,
      areaUnit: 'Acres',
      season: 'Rabi',
      stage: 'Tuber Bulking & Canopy Closure',
      stageStep: 3,
      currentDay: 42,
      totalDays: 95,
      health: 'Optimal (92% NDVI)',
      sownDate: 'Oct 10, 2026',
      harvestDate: 'Mid Jan 2027',
      nextMilestone: 'Late Blight Preventive Spray (Day 48)',
      farmId: 'farm-1',
      farmName: 'Khetivo Green Acres (Samrala)',
      templateId: 'potato',
    },
    {
      id: 'crop-3',
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
      harvestDate: 'Late Feb 2027',
      nextMilestone: 'Foliar Boron & Sulphur Spray (Day 42)',
      farmId: 'farm-2',
      farmName: 'Malwa Golden Fields (Sangrur)',
      templateId: 'mustard',
    },
    {
      id: 'crop-4',
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
      harvestDate: 'April 2027',
      nextMilestone: 'First Harvest Cut (Day 45)',
      farmId: 'farm-2',
      farmName: 'Malwa Golden Fields (Sangrur)',
      templateId: 'fodder',
    },
  ]);

  const [selectedCropIndex, setSelectedCropIndex] = useState(0);
  const [addCropModalOpen, setAddCropModalOpen] = useState(false);

  // Form states matching screenshot
  const [modalFarmId, setModalFarmId] = useState('farm-1');
  const [modalTemplateId, setModalTemplateId] = useState('wheat');
  const [modalVariety, setModalVariety] = useState('HD-3086');
  const [modalArea, setModalArea] = useState('5');
  const [modalSownDate, setModalSownDate] = useState('15-10-2026');
  const [modalStage, setModalStage] = useState('1. Sowing & Germination');
  const [modalStageStep, setModalStageStep] = useState(1);
  const [modalDay, setModalDay] = useState('25');
  const [openDropdown, setOpenDropdown] = useState<'farm' | 'variety' | 'stage' | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const inspectedCrop = crops[selectedCropIndex] || crops[0];
  const matchingTemplate =
    CROP_TEMPLATES.find((t) => t.id === inspectedCrop.templateId) ||
    CROP_TEMPLATES.find((t) => t.name.toLowerCase().includes(inspectedCrop.name.toLowerCase())) ||
    CROP_TEMPLATES[0];

  const stages = matchingTemplate.stages.map((st) => {
    let status: 'completed' | 'active' | 'upcoming' = 'upcoming';
    if (st.step < inspectedCrop.stageStep) {
      status = 'completed';
    } else if (st.step === inspectedCrop.stageStep) {
      status = 'active';
    }
    return { ...st, status };
  });

  const selectedTemplate =
    CROP_TEMPLATES.find((t) => t.id === modalTemplateId) || CROP_TEMPLATES[0];
  const selectedFarm =
    initialFarms.find((f) => f.id === modalFarmId) || initialFarms[0];

  // Dynamic handler: When user clicks a crop template in "Select Crop to Plant",
  // Current Crop Age (Day) immediately changes according to the selected crop!
  const handleSelectTemplate = (tmpl: CropTemplate) => {
    setModalTemplateId(tmpl.id);
    setModalVariety(tmpl.varieties[0] || 'Standard Variety');
    if (tmpl.stages && tmpl.stages.length > 0) {
      setModalStage(tmpl.stages[0].name);
      setModalStageStep(tmpl.stages[0].step);
    }
    // Update Current Crop Age (Day) according to the selected crop
    const newAge = tmpl.typicalAge || 20;
    setModalDay(String(newAge));
    setModalSownDate(tmpl.defaultSownDate || calculateSownDateFromAge(newAge));
    setOpenDropdown(null);
  };

  const handleSelectStage = (st: { step: number; name: string; defaultDay?: number }) => {
    setModalStage(st.name);
    setModalStageStep(st.step);
    if (st.defaultDay) {
      setModalDay(String(st.defaultDay));
      setModalSownDate(calculateSownDateFromAge(st.defaultDay));
    }
    setOpenDropdown(null);
  };

  const handleAddCropSubmit = () => {
    if (!modalArea.trim() || isNaN(Number(modalArea)) || Number(modalArea) <= 0) {
      Alert.alert('Required', 'Please enter a valid allocated area in acres.');
      return;
    }

    const tmpl = CROP_TEMPLATES.find((t) => t.id === modalTemplateId) || CROP_TEMPLATES[0];
    const targetFarm = initialFarms.find((f) => f.id === modalFarmId) || initialFarms[0];

    const newCrop: ActiveCropData = {
      id: `crop-${Date.now()}`,
      name: tmpl.name,
      variety: modalVariety || tmpl.variety,
      area: Number(modalArea),
      areaUnit: 'Acres',
      season: tmpl.season,
      stage: modalStage,
      stageStep: modalStageStep,
      currentDay: Number(modalDay) || tmpl.typicalAge || 25,
      totalDays: tmpl.durationDays,
      health: 'Optimal (96% NDVI)',
      sownDate: modalSownDate,
      harvestDate: `Estimated in ${Math.max(15, tmpl.durationDays - (Number(modalDay) || tmpl.typicalAge || 25))} days`,
      nextMilestone: 'Scheduled agronomic scouting & irrigation',
      farmId: targetFarm.id,
      farmName: targetFarm.name,
      templateId: tmpl.id,
    };

    setCrops([...crops, newCrop]);
    setSelectedCropIndex(crops.length);
    setAddCropModalOpen(false);
    setOpenDropdown(null);
    Alert.alert('Crop Added', `${newCrop.name} (${newCrop.variety}) successfully added to ${targetFarm.name}.`);
  };

  return (
    <View style={styles.container}>
      {/* 1. Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Crop Planning & Timeline</Text>
          <Text style={styles.headerSub}>
            Managing {crops.length} active crops across registered holdings
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addCropBtn}
          onPress={() => {
            setOpenDropdown(null);
            setAddCropModalOpen(true);
          }}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={15} color="#FFFFFF" />
          <Text style={styles.addCropBtnText}>Add Crop</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 2. Sober Horizontal Crop Selector Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cropTabRow}
          contentContainerStyle={styles.cropTabContent}
        >
          {crops.map((crop, idx) => {
            const isSelected = selectedCropIndex === idx;
            return (
              <TouchableOpacity
                key={crop.id}
                style={[styles.cropTab, isSelected ? styles.cropTabActive : styles.cropTabInactive]}
                onPress={() => setSelectedCropIndex(idx)}
                activeOpacity={0.7}
              >
                <Text style={[styles.cropTabName, isSelected && styles.cropTabNameActive]}>
                  {crop.name.split('(')[0].trim()}
                </Text>
                <View style={[styles.cropTabAreaBadge, isSelected ? styles.cropTabAreaBadgeActive : styles.cropTabAreaBadgeInactive]}>
                  <Text style={[styles.cropTabAreaText, isSelected && styles.cropTabAreaTextActive]}>
                    {crop.area} {crop.areaUnit}
                  </Text>
                </View>
                <Text style={[styles.cropTabFarmText, isSelected ? styles.cropTabFarmTextActive : styles.cropTabFarmTextInactive]}>
                  • {crop.farmName.split('(')[0].trim()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 3. Detailed Timeline Card for Currently Inspected Crop */}
        <View style={styles.cropDetailCard}>
          {/* Card Top: Crop Identity & Growth Progress */}
          <View style={styles.detailCardHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.cropTitleRow}>
                <Text style={styles.cropMainName}>{inspectedCrop.name}</Text>
                <Text style={styles.cropVariety}>({inspectedCrop.variety})</Text>
                <View style={styles.areaBadge}>
                  <Text style={styles.areaBadgeText}>
                    {inspectedCrop.area} {inspectedCrop.areaUnit}
                  </Text>
                </View>
              </View>
              <Text style={styles.cropMetaLine}>
                {inspectedCrop.season} Season • Sown: {inspectedCrop.sownDate} • Target Harvest: {inspectedCrop.harvestDate}
              </Text>
              <Text style={styles.cropFarmLine}>
                Holding: {inspectedCrop.farmName}
              </Text>
            </View>

            {/* Growth Progress Box */}
            <View style={styles.progressBox}>
              <Text style={styles.progressLabel}>Growth Progress</Text>
              <Text style={styles.progressDays}>
                Day {inspectedCrop.currentDay} <Text style={styles.progressTotal}>of {inspectedCrop.totalDays}</Text>
              </Text>
              <Text style={styles.progressStage}>{inspectedCrop.stage}</Text>
            </View>
          </View>

          {/* 4. Crop Growth Stage Timeline */}
          <View style={styles.timelineSection}>
            <View style={styles.timelineHeaderRow}>
              <Text style={styles.timelineTitle}>Crop Growth Stage Timeline</Text>
              <Text style={styles.timelineStatus}>
                Status: <Text style={{ color: colors.primary, fontWeight: '700' }}>{inspectedCrop.health}</Text>
              </Text>
            </View>

            <View style={styles.stagesList}>
              {stages.map((st) => (
                <View
                  key={st.step}
                  style={[
                    styles.stageCard,
                    st.status === 'active'
                      ? styles.stageCardActive
                      : st.status === 'completed'
                      ? styles.stageCardCompleted
                      : styles.stageCardUpcoming,
                  ]}
                >
                  <View style={styles.stageTopRow}>
                    <Text
                      style={[
                        styles.stageNumberTitle,
                        st.status === 'active' && { color: colors.primary, fontWeight: '700' },
                      ]}
                    >
                      {st.name.startsWith(`${st.step}.`) ? st.name : `${st.step}. ${st.name}`}
                    </Text>
                    {st.status === 'completed' && (
                      <Ionicons name="checkmark-circle" size={17} color={colors.secondary} />
                    )}
                    {st.status === 'active' && (
                      <View style={styles.activeDot} />
                    )}
                  </View>
                  <Text style={styles.stageDuration}>{st.days}</Text>
                  <Text style={styles.stageDesc}>{st.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 5. Recommended Practices: Do's & Don'ts */}
          <View style={styles.practicesSection}>
            <View style={styles.practicesHeaderRow}>
              <View style={styles.practicesHeaderTitle}>
                <MaterialCommunityIcons name="sprout" size={18} color={colors.primary} />
                <Text style={styles.practicesTitleText}>
                  Recommended Practices: Do's & Don'ts for {inspectedCrop.name}
                </Text>
              </View>
              <View style={styles.syncedPill}>
                <Text style={styles.syncedPillText}>
                  Synced with Template: {matchingTemplate.name}
                </Text>
              </View>
            </View>

            {/* Recommended Do's */}
            <View style={styles.dosCard}>
              <View style={styles.dosHeader}>
                <View style={styles.dosTitleWrap}>
                  <Ionicons name="checkmark-circle-outline" size={17} color="#047857" />
                  <Text style={styles.dosTitle}>Recommended Do's (What to do)</Text>
                </View>
                <View style={styles.countBadgeGreen}>
                  <Text style={styles.countBadgeGreenText}>{matchingTemplate.dos.length} Practices</Text>
                </View>
              </View>
              <View style={styles.practiceItemsWrap}>
                {matchingTemplate.dos.map((item, idx) => (
                  <View key={idx} style={styles.practiceItemRow}>
                    <View style={styles.practiceIndexBadgeGreen}>
                      <Text style={styles.practiceIndexTextGreen}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.practiceItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Things to Avoid (Don'ts) */}
            <View style={styles.dontsCard}>
              <View style={styles.dontsHeader}>
                <View style={styles.dontsTitleWrap}>
                  <Ionicons name="alert-circle-outline" size={17} color="#B91C1C" />
                  <Text style={styles.dontsTitle}>Things to Avoid (Don'ts)</Text>
                </View>
                <View style={styles.countBadgeRed}>
                  <Text style={styles.countBadgeRedText}>{matchingTemplate.donts.length} Points</Text>
                </View>
              </View>
              <View style={styles.practiceItemsWrap}>
                {matchingTemplate.donts.map((item, idx) => (
                  <View key={idx} style={styles.practiceItemRow}>
                    <View style={styles.practiceIndexBadgeRed}>
                      <Text style={styles.practiceIndexTextRed}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.practiceItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ========================================================================= */}
      {/* ADD CROP TO FARM SLIDE-UP BOTTOM SHEET (Exact Match with Screenshot)      */}
      {/* ========================================================================= */}
      <Modal
        visible={addCropModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setOpenDropdown(null);
          setAddCropModalOpen(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setOpenDropdown(null);
            setAddCropModalOpen(false);
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalCard}
              onPress={() => setOpenDropdown(null)}
            >
              {/* Sheet Pull Handle */}
              <View style={styles.sheetHandle} />

              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderIconWrap}>
                  <MaterialCommunityIcons name="sprout" size={20} color="#0C4B32" />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.modalTitle}>Add Another Crop to Farm</Text>
                  <Text style={styles.modalSubtitle}>
                    1 Farm can cultivate multiple crop varieties simultaneously
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setOpenDropdown(null);
                    setAddCropModalOpen(false);
                  }}
                  style={styles.modalCloseBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={20} color="#889B90" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalBody}
                contentContainerStyle={styles.modalBodyContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* 1. Target Farm Holding */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Target Farm Holding</Text>
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() =>
                      setOpenDropdown(openDropdown === 'farm' ? null : 'farm')
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.selectBtnText} numberOfLines={1}>
                      {selectedFarm
                        ? `${selectedFarm.name} (${selectedFarm.totalArea} Acres - ${selectedFarm.district})`
                        : 'Select Target Farm'}
                    </Text>
                    <Ionicons
                      name={openDropdown === 'farm' ? 'chevron-up' : 'chevron-down'}
                      size={15}
                      color="#55685D"
                    />
                  </TouchableOpacity>
                  {openDropdown === 'farm' && (
                    <View style={styles.dropdownList}>
                      {initialFarms.map((f) => {
                        const farmLabel = `${f.name} (${f.totalArea} Acres - ${f.district})`;
                        const isSelected = modalFarmId === f.id;
                        return (
                          <TouchableOpacity
                            key={f.id}
                            style={[
                              styles.dropdownItem,
                              isSelected && styles.dropdownItemActive,
                            ]}
                            onPress={() => {
                              setModalFarmId(f.id);
                              setOpenDropdown(null);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                isSelected && styles.dropdownItemTextActive,
                              ]}
                              numberOfLines={1}
                            >
                              {farmLabel}
                            </Text>
                            {isSelected && (
                              <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* 2. Select Crop to Plant */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Select Crop to Plant</Text>
                  <View style={styles.templateGridContainer}>
                    {CROP_TEMPLATES.map((tmpl) => {
                      const isSelected = modalTemplateId === tmpl.id;
                      return (
                        <TouchableOpacity
                          key={tmpl.id}
                          style={[
                            styles.templateBtn,
                            isSelected && styles.templateBtnActive,
                          ]}
                          onPress={() => handleSelectTemplate(tmpl)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[styles.templateName, isSelected && styles.templateNameActive]}
                            numberOfLines={1}
                          >
                            {tmpl.name}
                          </Text>
                          <Text
                            style={[styles.templateVariety, isSelected && styles.templateVarietyActive]}
                            numberOfLines={1}
                          >
                            {tmpl.variety}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 3. Agronomic Details Card */}
                <View style={styles.agronomicCard}>
                  {/* Row 1: Allocated Area & Seed Variety */}
                  <View style={styles.formRow}>
                    <View style={styles.formCol}>
                      <Text style={styles.formLabel}>
                        Allocated Area (Acres) <Text style={styles.reqStar}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.whiteInput}
                        keyboardType="numeric"
                        value={modalArea}
                        onChangeText={setModalArea}
                        placeholder="5"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>

                    <View style={styles.formCol}>
                      <Text style={styles.formLabel}>Seed Variety</Text>
                      <TouchableOpacity
                        style={styles.whiteSelectBtn}
                        onPress={() =>
                          setOpenDropdown(openDropdown === 'variety' ? null : 'variety')
                        }
                        activeOpacity={0.8}
                      >
                        <Text style={styles.selectBtnText} numberOfLines={1}>
                          {modalVariety}
                        </Text>
                        <Ionicons
                          name={openDropdown === 'variety' ? 'chevron-up' : 'chevron-down'}
                          size={14}
                          color="#55685D"
                        />
                      </TouchableOpacity>
                      {openDropdown === 'variety' && (
                        <View style={styles.dropdownList}>
                          {selectedTemplate.varieties.map((v) => (
                            <TouchableOpacity
                              key={v}
                              style={[
                                styles.dropdownItem,
                                modalVariety === v && styles.dropdownItemActive,
                              ]}
                              onPress={() => {
                                setModalVariety(v);
                                setOpenDropdown(null);
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  modalVariety === v && styles.dropdownItemTextActive,
                                ]}
                                numberOfLines={1}
                              >
                                {v}
                              </Text>
                              {modalVariety === v && (
                                <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Row 2: Started / Sown On & Current Growth Stage */}
                  <View style={styles.formRow}>
                    <View style={styles.formCol}>
                      <Text style={styles.formLabel}>
                        Started / Sown On <Text style={styles.reqStar}>*</Text>
                      </Text>
                      <TouchableOpacity
                        style={styles.whiteDateWrap}
                        onPress={() => setIsDatePickerOpen(true)}
                        activeOpacity={0.8}
                      >
                        <TextInput
                          style={styles.whiteDateInput}
                          value={modalSownDate}
                          onChangeText={setModalSownDate}
                          placeholder="15-10-2026"
                          placeholderTextColor="#9CA3AF"
                        />
                        <TouchableOpacity
                          onPress={() => setIsDatePickerOpen(true)}
                          style={styles.dateIconTouch}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="calendar-outline" size={16} color="#0C4B32" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.formCol}>
                      <Text style={styles.formLabel}>
                        Current Growth Stage <Text style={styles.reqStar}>*</Text>
                      </Text>
                      <TouchableOpacity
                        style={styles.whiteSelectBtn}
                        onPress={() =>
                          setOpenDropdown(openDropdown === 'stage' ? null : 'stage')
                        }
                        activeOpacity={0.8}
                      >
                        <Text style={styles.selectBtnText} numberOfLines={1}>
                          {modalStage}
                        </Text>
                        <Ionicons
                          name={openDropdown === 'stage' ? 'chevron-up' : 'chevron-down'}
                          size={14}
                          color="#55685D"
                        />
                      </TouchableOpacity>
                      {openDropdown === 'stage' && (
                        <View style={styles.dropdownList}>
                          <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
                            {selectedTemplate.stages.map((st) => (
                              <TouchableOpacity
                                key={st.step}
                                style={[
                                  styles.dropdownItem,
                                  modalStage === st.name && styles.dropdownItemActive,
                                ]}
                                onPress={() => handleSelectStage(st)}
                              >
                                <Text
                                  style={[
                                    styles.dropdownItemText,
                                    modalStage === st.name && styles.dropdownItemTextActive,
                                  ]}
                                  numberOfLines={1}
                                >
                                  {st.name}
                                </Text>
                                {modalStage === st.name && (
                                  <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                                )}
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Row 3: Current Crop Age (Day) * - Dynamically updates according to selected crop */}
                  <View style={styles.formGroupNoMargin}>
                    <Text style={styles.formLabel}>
                      Current Crop Age (Day) <Text style={styles.reqStar}>*</Text>
                    </Text>
                    <View style={styles.ageInputRow}>
                      <TextInput
                        style={styles.whiteAgeInput}
                        keyboardType="numeric"
                        value={modalDay}
                        onChangeText={(txt) => {
                          setModalDay(txt);
                          const num = parseInt(txt);
                          if (!isNaN(num) && num > 0) {
                            setModalSownDate(calculateSownDateFromAge(num));
                          }
                        }}
                        placeholder={String(selectedTemplate.typicalAge || 20)}
                        placeholderTextColor="#9CA3AF"
                      />
                      <Text style={styles.durationSuffixText}>
                        / {selectedTemplate.durationDays}d
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => {
                    setOpenDropdown(null);
                    setAddCropModalOpen(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleAddCropSubmit}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark" size={17} color="#FFFFFF" />
                  <Text style={styles.modalSubmitText}>Plant Crop on Farm</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      {/* REUSABLE INTERACTIVE DATE PICKER MODAL */}
      <DatePickerModal
        visible={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelectDate={(formatted) => {
          setModalSownDate(formatted);
          const calculatedAge = calculateAgeFromSownDate(formatted);
          setModalDay(String(Math.min(calculatedAge, selectedTemplate.durationDays)));
          setIsDatePickerOpen(false);
        }}
        initialDate={modalSownDate}
        title="Select Started / Sown Date"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F8F4' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F4F8F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#26352D' },
  headerSub: { fontSize: 11, color: '#55685D', marginTop: 1 },
  addCropBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  addCropBtnText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },

  scroll: { flex: 1 },
  scrollContent: { padding: 14, gap: 12 },

  // Horizontal Crop Tabs
  cropTabRow: { marginBottom: 2 },
  cropTabContent: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  cropTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  cropTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cropTabInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6DE',
  },
  cropTabName: { fontSize: 12, fontWeight: '700', color: '#26352D' },
  cropTabNameActive: { color: '#FFFFFF' },
  cropTabAreaBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cropTabAreaBadgeActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  cropTabAreaBadgeInactive: { backgroundColor: '#F4F8F4' },
  cropTabAreaText: { fontSize: 10, fontWeight: '600', color: colors.primary },
  cropTabAreaTextActive: { color: '#FFFFFF' },
  cropTabFarmText: { fontSize: 10 },
  cropTabFarmTextActive: { color: 'rgba(255,255,255,0.8)' },
  cropTabFarmTextInactive: { color: '#55685D' },

  // Detailed Card
  cropDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 16,
    gap: 16,
  },
  detailCardHeader: {
    flexDirection: 'column',
    gap: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
  },
  cropTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  cropMainName: { fontSize: 18, fontWeight: '700', color: '#26352D' },
  cropVariety: { fontSize: 12, color: '#55685D' },
  areaBadge: {
    backgroundColor: '#E7F3EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  areaBadgeText: { fontSize: 10, fontWeight: '700', color: colors.primary },
  cropMetaLine: { fontSize: 11, color: '#55685D', marginTop: 2 },
  cropFarmLine: { fontSize: 11, fontWeight: '600', color: colors.primary, marginTop: 1 },

  // Progress Box
  progressBox: {
    backgroundColor: '#F8FAF8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 10,
    gap: 3,
  },
  progressLabel: { fontSize: 10, fontWeight: '700', color: '#889B90', textTransform: 'uppercase' },
  progressDays: { fontSize: 15, fontWeight: '800', color: '#26352D' },
  progressTotal: { fontSize: 12, fontWeight: '500', color: '#55685D' },
  progressStage: { fontSize: 11, fontWeight: '600', color: colors.primary },

  // Timeline Section
  timelineSection: { gap: 10 },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineTitle: { fontSize: 13, fontWeight: '700', color: '#26352D' },
  timelineStatus: { fontSize: 11, color: '#55685D' },
  stagesList: { gap: 8 },
  stageCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  stageCardActive: {
    backgroundColor: '#E7F3EB',
    borderColor: colors.primary,
  },
  stageCardCompleted: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6DE',
  },
  stageCardUpcoming: {
    backgroundColor: '#FAFCFA',
    borderColor: '#E5ECE7',
    opacity: 0.7,
  },
  stageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageNumberTitle: { fontSize: 12, fontWeight: '600', color: '#26352D' },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  stageDuration: { fontSize: 10, fontWeight: '600', color: '#55685D' },
  stageDesc: { fontSize: 11, color: '#26352D', lineHeight: 15 },

  // Practices Section
  practicesSection: { gap: 12 },
  practicesHeaderRow: {
    flexDirection: 'column',
    gap: 6,
  },
  practicesHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  practicesTitleText: { fontSize: 13, fontWeight: '700', color: '#26352D' },
  syncedPill: {
    backgroundColor: '#E7F3EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  syncedPillText: { fontSize: 10, fontWeight: '600', color: colors.primary },

  dosCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 12,
    gap: 10,
  },
  dosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dosTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dosTitle: { fontSize: 12, fontWeight: '700', color: '#047857' },
  countBadgeGreen: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countBadgeGreenText: { fontSize: 10, fontWeight: '700', color: '#047857' },

  dontsCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 12,
    gap: 10,
  },
  dontsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dontsTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dontsTitle: { fontSize: 12, fontWeight: '700', color: '#B91C1C' },
  countBadgeRed: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countBadgeRedText: { fontSize: 10, fontWeight: '700', color: '#B91C1C' },

  practiceItemsWrap: { gap: 6 },
  practiceItemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  practiceIndexBadgeGreen: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  practiceIndexTextGreen: { fontSize: 10, fontWeight: '700', color: '#047857' },
  practiceIndexBadgeRed: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  practiceIndexTextRed: { fontSize: 10, fontWeight: '700', color: '#991B1B' },
  practiceItemText: { flex: 1, fontSize: 11, color: '#26352D', lineHeight: 16 },

  // =========================================================================
  // Slide-Up Bottom Sheet Styles
  // =========================================================================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
  },
  modalHeaderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E7F3EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#26352D',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#55685D',
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    maxHeight: 540,
  },
  modalBodyContent: {
    paddingVertical: 14,
    gap: 14,
  },
  formGroup: {
    gap: 6,
  },
  formGroupNoMargin: {
    gap: 5,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#26352D',
  },
  reqStar: {
    color: '#DC2626',
    fontWeight: '700',
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectBtnText: {
    fontSize: 12,
    color: '#26352D',
    flex: 1,
    marginRight: 6,
  },
  dropdownList: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE6DE',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
  },
  dropdownItemActive: {
    backgroundColor: '#F4F8F4',
  },
  dropdownItemText: {
    fontSize: 12,
    color: '#55685D',
    flex: 1,
  },
  dropdownItemTextActive: {
    color: '#0C4B32',
    fontWeight: '700',
  },

  // Crop Template Grid
  templateGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  templateBtn: {
    width: '48.5%',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE6DE',
    backgroundColor: '#FFFFFF',
    gap: 2,
  },
  templateBtnActive: {
    borderColor: '#0C4B32',
    backgroundColor: '#E7F3EB',
    borderWidth: 1.5,
  },
  templateName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#26352D',
  },
  templateNameActive: {
    color: '#0C4B32',
    fontWeight: '700',
  },
  templateVariety: {
    fontSize: 10,
    color: '#55685D',
  },
  templateVarietyActive: {
    color: '#0C4B32',
  },

  // Agronomic Details Card
  agronomicCard: {
    backgroundColor: '#F4F8F4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE6DE',
    padding: 14,
    gap: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formCol: {
    flex: 1,
    gap: 5,
  },
  whiteInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#26352D',
  },
  whiteSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  whiteDateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  whiteDateInput: {
    flex: 1,
    fontSize: 12,
    color: '#26352D',
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  dateIconTouch: {
    paddingLeft: 6,
    paddingVertical: 6,
  },
  ageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  whiteAgeInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#26352D',
  },
  durationSuffixText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#55685D',
  },

  // Footer Buttons
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5ECE7',
  },
  modalCancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCE6DE',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#26352D',
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0C4B32',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  modalSubmitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
