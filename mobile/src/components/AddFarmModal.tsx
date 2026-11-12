import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Linking,
  Image,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Farm, Crop } from '../data/mockData';
import { DatePickerModal } from './DatePickerModal';

export const LAND_MEASUREMENT_UNITS = [
  'Acres',
  'Hectares',
  'Nali',
  'Bigha',
  'Killa',
  'Guntha',
  'Cent',
  'Biswa',
];

export const OWNERSHIP_OPTIONS = [
  'Self-Owned (Individual Farmer)',
  'Ancestral / Joint Family Land',
  'Leased / Cash Rent Agreement',
  'Contract Farming Producer',
  'Farmer Producer Org (FPO) / Co-operative',
];

export const SOIL_PROFILES = [
  'Alluvial Loam (Deep & Fertile)',
  'Clay Loam (Water Retentive)',
  'Sandy Loam (Well Drained)',
  'Black Cotton Soil (Heavy Clay)',
  'Red Sandy Loam',
  'Silt Loam (Riverbed Basin)',
];

export const IRRIGATION_SYSTEMS = [
  'Drip / Micro-Irrigation (Sub-surface/Surface)',
  'Canal Water Irrigation (Warabandi Rotational)',
  'Deep Tube-well / Borewell (Submersible)',
  'Sprinkler System (Overhead)',
  'Rainfed / Rain Harvesting (Barani)',
];

export const WATER_SOURCES = [
  'Deep Borewell (Submersible Pump)',
  'Canal & Borewell Dual System',
  'Rainwater Harvesting Reservoir',
  'River Lift Irrigation',
];

export interface CropTemplateItem {
  id: string;
  name: string;
  variety: string;
  season: string;
  duration: string;
  durationDays: number;
  badge: string;
  defaultSoil: string;
  defaultIrrigation: string;
}

export const CROP_TEMPLATES: CropTemplateItem[] = [
  {
    id: 'wheat',
    name: 'Wheat (Kanak)',
    variety: 'HD-3086 / PBW-826',
    season: 'Rabi',
    duration: '135 Days',
    durationDays: 135,
    badge: 'High Yielding',
    defaultSoil: 'Alluvial Loam (Deep & Fertile)',
    defaultIrrigation: 'Drip / Micro-Irrigation (Sub-surface/Surface)',
  },
  {
    id: 'paddy',
    name: 'Paddy / Rice (Dhan)',
    variety: 'Pusa Basmati 1121 / PR-126',
    season: 'Kharif',
    duration: '140 Days',
    durationDays: 140,
    badge: 'Aromatic Export',
    defaultSoil: 'Clay Loam (Water Retentive)',
    defaultIrrigation: 'Canal Water Irrigation (Warabandi Rotational)',
  },
  {
    id: 'mustard',
    name: 'Mustard / Sarson',
    variety: 'Pusa Jai Kisan / Giriraj',
    season: 'Rabi',
    duration: '115 Days',
    durationDays: 115,
    badge: 'Oilseed Cash Crop',
    defaultSoil: 'Sandy Loam (Well Drained)',
    defaultIrrigation: 'Sprinkler System (Overhead)',
  },
  {
    id: 'potato',
    name: 'Potato (Aloo)',
    variety: 'Kufri Pukhraj / Jyoti',
    season: 'Rabi',
    duration: '90 Days',
    durationDays: 90,
    badge: 'Early Harvest',
    defaultSoil: 'Sandy Loam (Well Drained)',
    defaultIrrigation: 'Drip / Micro-Irrigation (Sub-surface/Surface)',
  },
  {
    id: 'cotton',
    name: 'Bt Cotton (Narma)',
    variety: 'Bollgard II Hybrid',
    season: 'Kharif',
    duration: '165 Days',
    durationDays: 165,
    badge: 'Commercial Fiber',
    defaultSoil: 'Black Cotton Soil (Heavy Clay)',
    defaultIrrigation: 'Canal Water Irrigation (Warabandi Rotational)',
  },
  {
    id: 'maize',
    name: 'Maize / Corn (Makki)',
    variety: 'Pioneer 3396 Hybrid',
    season: 'Kharif',
    duration: '100 Days',
    durationDays: 100,
    badge: 'High Starch',
    defaultSoil: 'Alluvial Loam (Deep & Fertile)',
    defaultIrrigation: 'Sprinkler System (Overhead)',
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane (Kamad)',
    variety: 'Co-0238 Heavy Tiller',
    season: 'Annual',
    duration: '360 Days',
    durationDays: 360,
    badge: 'High Sucrose',
    defaultSoil: 'Clay Loam (Water Retentive)',
    defaultIrrigation: 'Canal Water Irrigation (Warabandi Rotational)',
  },
  {
    id: 'barseem',
    name: 'Green Fodder (Barseem)',
    variety: 'BL-42 Multi-Cut',
    season: 'Rabi',
    duration: '120 Days',
    durationDays: 120,
    badge: 'Dairy Livestock',
    defaultSoil: 'Alluvial Loam (Deep & Fertile)',
    defaultIrrigation: 'Canal Water Irrigation (Warabandi Rotational)',
  },
];

export const STANDARD_CROP_STAGES = [
  { step: 1, name: '1. Sowing & Germination', defaultDay: 14 },
  { step: 2, name: '2. Vegetative Growth', defaultDay: 35 },
  { step: 3, name: '3. Flowering / Heading', defaultDay: 70 },
  { step: 4, name: '4. Grain Filling & Ripening', defaultDay: 105 },
  { step: 5, name: '5. Maturity & Harvesting', defaultDay: 130 },
];

export interface AddFarmModalProps {
  visible: boolean;
  onClose: () => void;
  onAddFarm: (newFarm: Farm) => void;
}

export const AddFarmModal: React.FC<AddFarmModalProps> = ({
  visible,
  onClose,
  onAddFarm,
}) => {
  // Step state (1: Identity & Area, 2: Location & Map, 3: Select Crops, 4: Sowing Schedule)
  const [setupStep, setSetupStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Identity & Area
  const [farmName, setFarmName] = useState('');
  const [totalArea, setTotalArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('Acres');
  const [ownership, setOwnership] = useState('Self-Owned (Individual Farmer)');

  // Step 2: Location & Map
  const [farmAddress, setFarmAddress] = useState('');
  const [district, setDistrict] = useState('Ludhiana');
  const [stateName, setStateName] = useState('Punjab');
  const [pinCode, setPinCode] = useState('141001');
  const [latitude, setLatitude] = useState(30.901);
  const [longitude, setLongitude] = useState(75.8573);
  const [gpsAutoDetected, setGpsAutoDetected] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [mapSearch, setMapSearch] = useState('');
  const [mapStyle, setMapStyle] = useState<'satellite' | 'roadmap'>('satellite');
  const [soilType, setSoilType] = useState('Alluvial Loam (Deep & Fertile)');
  const [irrigationType, setIrrigationType] = useState('Drip / Micro-Irrigation (Sub-surface/Surface)');
  const [waterSource, setWaterSource] = useState('Deep Borewell (Submersible Pump)');

  // Step 3: Select Crops (Multi-Crop selection)
  const [selectedCropTemplates, setSelectedCropTemplates] = useState<string[]>(['wheat']);

  // Step 4: Crop Sowing Schedule Configs
  const [cropConfigs, setCropConfigs] = useState<
    Record<
      string,
      {
        area: string;
        variety: string;
        sownDate: string;
        stage: string;
        currentDay: number;
        totalDays: number;
      }
    >
  >({
    wheat: {
      area: '18.5',
      variety: 'HD-3086 / PBW-826',
      sownDate: '12-11-2026',
      stage: '1. Sowing & Germination',
      currentDay: 14,
      totalDays: 135,
    },
  });

  // UI helpers
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [datePickerCropId, setDatePickerCropId] = useState<string | null>(null);

  // Sync crop configs when selected templates change
  useEffect(() => {
    setCropConfigs((prev) => {
      const updated = { ...prev };
      const parsedArea = parseFloat(totalArea) || 10;
      const shareArea =
        selectedCropTemplates.length > 0
          ? (parsedArea / selectedCropTemplates.length).toFixed(1)
          : '5.0';

      selectedCropTemplates.forEach((cid) => {
        if (!updated[cid]) {
          const tmpl = CROP_TEMPLATES.find((t) => t.id === cid);
          updated[cid] = {
            area: shareArea,
            variety: tmpl?.variety || 'High Yielding',
            sownDate: '12-11-2026',
            stage: '1. Sowing & Germination',
            currentDay: 14,
            totalDays: tmpl?.durationDays || 120,
          };
        }
      });
      return updated;
    });
  }, [selectedCropTemplates, totalArea]);

  const handleGpsDetect = () => {
    setLocatingGps(true);
    setTimeout(() => {
      setLatitude(30.901);
      setLongitude(75.8573);
      setLocatingGps(false);
      setGpsAutoDetected(true);
      Alert.alert(
        'GPS Auto-Detected',
        'Coordinates synced: 30.90100°N, 75.85730°E (Gill Rd, Ludhiana, Punjab)'
      );
    }, 400);
  };

  const handleOpenInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Cannot Open Maps', 'Please check internet connection or installed apps.');
    });
  };

  const handleSearchSubmit = () => {
    if (!mapSearch.trim()) return;
    const parts = mapSearch.split(',').map((p) => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      setLatitude(parts[0]);
      setLongitude(parts[1]);
    }
  };

  const handleNextStep = () => {
    setErrorMsg('');
    if (setupStep === 1) {
      if (!farmName.trim()) {
        setErrorMsg('Please enter Farm Name.');
        return;
      }
      if (!totalArea.trim() || isNaN(parseFloat(totalArea)) || parseFloat(totalArea) <= 0) {
        setErrorMsg('Please enter a valid cultivable land area.');
        return;
      }
      setSetupStep(2);
    } else if (setupStep === 2) {
      setSetupStep(3);
    } else if (setupStep === 3) {
      if (selectedCropTemplates.length === 0) {
        setErrorMsg('Please select at least 1 crop template planted on this farm.');
        return;
      }
      setSetupStep(4);
    }
  };

  const handleSaveFarm = () => {
    if (!farmName.trim()) {
      setErrorMsg('Please enter Farm Name.');
      setSetupStep(1);
      return;
    }
    const parsedTotalArea = parseFloat(totalArea) || 10;

    // Generate Crops array from configured crop templates
    const builtCrops: Crop[] = selectedCropTemplates.map((templateId, idx) => {
      const tmpl = CROP_TEMPLATES.find((t) => t.id === templateId);
      const cfg = cropConfigs[templateId] || {
        area: (parsedTotalArea / selectedCropTemplates.length).toFixed(1),
        variety: tmpl?.variety || 'Regional Variety',
        sownDate: '12-11-2026',
        stage: '1. Sowing & Germination',
        currentDay: 14,
        totalDays: tmpl?.durationDays || 135,
      };

      return {
        id: `crop-${Date.now()}-${idx}`,
        name: tmpl?.name.split(' (')[0] || 'Crop',
        variety: cfg.variety,
        area: parseFloat(cfg.area) || parsedTotalArea,
        areaUnit: areaUnit,
        season: tmpl?.season || 'Rabi',
        stage: cfg.stage,
        stageStep: 1,
        currentDay: cfg.currentDay,
        totalDays: cfg.totalDays,
        health: 'Healthy (94% NDVI)',
        sownDate: cfg.sownDate,
        nextMilestone: '1st Irrigation (CRI Stage)',
        harvestDate: 'Late March 2027',
        color: colors.primary,
        lowMoistureAlert: 30,
        currentMoisture: 38,
        dos: ['Monitor soil moisture & apply scheduled micronutrients.'],
        donts: ['Avoid heavy flooding in early vegetative growth.'],
        diseases: 'Yellow Rust / Aphids',
        sprayGuide: 'Tilt 25% EC @ 200ml/acre.',
      };
    });

    const newFarm: Farm = {
      id: `farm-${Date.now()}`,
      name: farmName.trim(),
      address: farmAddress.trim() || `Village ${farmName.trim()}, GT Road, ${district}`,
      district: district.trim() || 'Ludhiana',
      state: stateName.trim() || 'Punjab',
      pinCode: pinCode.trim() || '141001',
      totalArea: parsedTotalArea,
      areaUnit: areaUnit,
      soilType: soilType,
      irrigationType: irrigationType,
      waterSource: waterSource,
      cropTemplate: selectedCropTemplates
        .map((cid) => CROP_TEMPLATES.find((t) => t.id === cid)?.name.split(' (')[0])
        .join(' & '),
      crops: builtCrops,
    };

    onAddFarm(newFarm);
    onClose();
    // Reset Form
    setSetupStep(1);
    setFarmName('');
    setTotalArea('');
    setAreaUnit('Acres');
    setOwnership('Self-Owned (Individual Farmer)');
    setErrorMsg('');
    Alert.alert(
      'Farm Setup Complete!',
      `"${newFarm.name}" (${newFarm.totalArea} ${newFarm.areaUnit}) registered with ${builtCrops.length} crop(s).`
    );
  };

  const stepTabs: { id: 1 | 2 | 3 | 4; label: string }[] = [
    { id: 1, label: 'Identity & Area' },
    { id: 2, label: 'Location & Map' },
    { id: 3, label: 'Select Crops' },
    { id: 4, label: 'Sowing Schedule' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => {
          setOpenDropdown(null);
          onClose();
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
            {/* Sheet Handle */}
            <View style={styles.sheetHandle} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.modalTitle}>Add New Farm</Text>
                <Text style={styles.modalSubtitle}>
                  Configure your land boundaries, soil characteristics, and irrigation infrastructure.
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color="#55685D" />
              </TouchableOpacity>
            </View>

            {/* Stepper Tabs Bar (Clickable tabs) */}
            <View style={styles.stepperContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.stepperScroll}
              >
                {stepTabs.map((tab) => {
                  const isActive = setupStep === tab.id;
                  const isCompleted = setupStep > tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      style={[
                        styles.stepTab,
                        isActive && styles.stepTabActive,
                      ]}
                      onPress={() => {
                        setErrorMsg('');
                        if (tab.id > 1 && (!farmName.trim() || !totalArea.trim())) {
                          setErrorMsg('Please enter Farm Name and Total Cultivable Area first.');
                          return;
                        }
                        if (tab.id === 4 && selectedCropTemplates.length === 0) {
                          setErrorMsg('Please select at least 1 crop template first.');
                          return;
                        }
                        setSetupStep(tab.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.stepBadge,
                          isActive && styles.stepBadgeActive,
                          isCompleted && styles.stepBadgeCompleted,
                        ]}
                      >
                        <Text
                          style={[
                            styles.stepBadgeText,
                            (isActive || isCompleted) && styles.stepBadgeTextActive,
                          ]}
                        >
                          {isCompleted ? '✓' : tab.id}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.stepLabel,
                          isActive && styles.stepLabelActive,
                          isCompleted && styles.stepLabelCompleted,
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Error Banner */}
            {errorMsg ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Modal Body / Scrollable Content */}
            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* ========================================================================= */}
              {/* STEP 1: IDENTITY & AREA (Matches attached image media_1794477742628)       */}
              {/* ========================================================================= */}
              {setupStep === 1 && (
                <View style={styles.stepContent}>
                  {/* Farm Name * */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>
                      Farm Name <Text style={styles.reqStar}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Sukhdev Organic Acres, North Farm Plot"
                      placeholderTextColor="#88988E"
                      value={farmName}
                      onChangeText={(t) => {
                        setFarmName(t);
                        if (errorMsg) setErrorMsg('');
                      }}
                    />
                  </View>

                  {/* Row: Total Cultivable Area * & Measurement Unit */}
                  <View style={styles.rowTwoCols}>
                    {/* Total Cultivable Area * */}
                    <View style={styles.col}>
                      <Text style={styles.fieldLabel}>
                        Total Cultivable Area <Text style={styles.reqStar}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g. 18.5"
                        placeholderTextColor="#88988E"
                        keyboardType="numeric"
                        value={totalArea}
                        onChangeText={(t) => {
                          setTotalArea(t);
                          if (errorMsg) setErrorMsg('');
                        }}
                      />
                    </View>

                    {/* Measurement Unit */}
                    <View style={styles.col}>
                      <Text style={styles.fieldLabel}>Measurement Unit</Text>
                      <TouchableOpacity
                        style={styles.selectBtn}
                        onPress={() =>
                          setOpenDropdown(openDropdown === 'areaUnit' ? null : 'areaUnit')
                        }
                        activeOpacity={0.8}
                      >
                        <Text style={styles.selectBtnText}>{areaUnit}</Text>
                        <Ionicons
                          name={openDropdown === 'areaUnit' ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color="#55685D"
                        />
                      </TouchableOpacity>

                      {openDropdown === 'areaUnit' && (
                        <View style={styles.dropdownList}>
                          {LAND_MEASUREMENT_UNITS.map((unit) => {
                            const isSelected = areaUnit === unit;
                            return (
                              <TouchableOpacity
                                key={unit}
                                style={[
                                  styles.dropdownItem,
                                  isSelected && styles.dropdownItemActive,
                                ]}
                                onPress={() => {
                                  setAreaUnit(unit);
                                  setOpenDropdown(null);
                                }}
                              >
                                <Text
                                  style={[
                                    styles.dropdownItemText,
                                    isSelected && styles.dropdownItemTextActive,
                                  ]}
                                >
                                  {unit}
                                </Text>
                                {isSelected && (
                                  <Ionicons name="checkmark" size={15} color="#0C4B32" />
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Ownership Details */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Ownership Details</Text>
                    <View style={styles.ownershipGrid}>
                      {OWNERSHIP_OPTIONS.map((opt) => {
                        const isSelected = ownership === opt;
                        return (
                          <TouchableOpacity
                            key={opt}
                            style={[
                              styles.ownershipTile,
                              isSelected && styles.ownershipTileActive,
                            ]}
                            onPress={() => setOwnership(opt)}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.ownershipTileText,
                                isSelected && styles.ownershipTileTextActive,
                              ]}
                              numberOfLines={2}
                            >
                              {opt}
                            </Text>
                            {isSelected && (
                              <Ionicons
                                name="checkmark"
                                size={15}
                                color="#0C4B32"
                                style={styles.checkIcon}
                              />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )}

              {/* ========================================================================= */}
              {/* STEP 2: LOCATION & MAP                                                    */}
              {/* ========================================================================= */}
              {setupStep === 2 && (
                <View style={styles.stepContent}>
                  {/* Farm Address / Village */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Farm Address / Village</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Village Haveli, GT Road, Near Gurdwara"
                      placeholderTextColor="#88988E"
                      value={farmAddress}
                      onChangeText={setFarmAddress}
                    />
                  </View>

                  {/* 3 Columns: District, State, PIN Code */}
                  <View style={styles.rowThreeCols}>
                    <View style={styles.colThree}>
                      <Text style={styles.fieldLabel}>District</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Ludhiana"
                        placeholderTextColor="#88988E"
                        value={district}
                        onChangeText={setDistrict}
                      />
                    </View>
                    <View style={styles.colThree}>
                      <Text style={styles.fieldLabel}>State</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Punjab"
                        placeholderTextColor="#88988E"
                        value={stateName}
                        onChangeText={setStateName}
                      />
                    </View>
                    <View style={styles.colThree}>
                      <Text style={styles.fieldLabel}>PIN Code</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="141001"
                        placeholderTextColor="#88988E"
                        keyboardType="numeric"
                        value={pinCode}
                        onChangeText={setPinCode}
                      />
                    </View>
                  </View>

                  {/* Google Maps (Satellite & Coordinates) Module matching web dashboard */}
                  <View style={styles.googleMapsSection}>
                    {/* Header Row */}
                    <View style={styles.mapHeaderRow}>
                      <View style={styles.mapHeaderLeft}>
                        <Ionicons name="location-outline" size={16} color="#0C4B32" />
                        <Text style={styles.mapHeaderTitle}>
                          Google Maps (Satellite & Coordinates)
                        </Text>
                      </View>

                      <View style={styles.mapHeaderRight}>
                        <TouchableOpacity
                          style={styles.gpsDetectBtn}
                          onPress={handleGpsDetect}
                          activeOpacity={0.8}
                          disabled={locatingGps}
                        >
                          <MaterialCommunityIcons
                            name="crosshairs-gps"
                            size={14}
                            color="#F9B21B"
                          />
                          <Text style={styles.gpsDetectBtnText}>
                            {locatingGps ? 'Detecting...' : 'Auto-Detect GPS'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.openMapsBtn}
                          onPress={handleOpenInGoogleMaps}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.openMapsText}>Open in Google Maps</Text>
                          <Feather name="external-link" size={11} color="#55685D" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Controls Row: Search Input + Satellite/Roadmap Switcher */}
                    <View style={styles.mapControlsRow}>
                      <View style={styles.mapSearchWrap}>
                        <Feather
                          name="search"
                          size={14}
                          color="#55685D"
                          style={styles.mapSearchIcon}
                        />
                        <TextInput
                          style={styles.mapSearchInput}
                          placeholder="Search town, mandi, or coordinates on Google Maps..."
                          placeholderTextColor="#88988E"
                          value={mapSearch}
                          onChangeText={setMapSearch}
                          onSubmitEditing={handleSearchSubmit}
                          returnKeyType="search"
                        />
                        {mapSearch.length > 0 && (
                          <TouchableOpacity
                            onPress={() => setMapSearch('')}
                            style={styles.mapSearchClear}
                          >
                            <Ionicons name="close-circle" size={14} color="#88988E" />
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Mode Switcher */}
                      <View style={styles.mapModeSwitcher}>
                        <TouchableOpacity
                          style={[
                            styles.mapModeBtn,
                            mapStyle === 'satellite' && styles.mapModeBtnActive,
                          ]}
                          onPress={() => setMapStyle('satellite')}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.mapModeBtnText,
                              mapStyle === 'satellite' && styles.mapModeBtnTextActive,
                            ]}
                          >
                            Satellite
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.mapModeBtn,
                            mapStyle === 'roadmap' && styles.mapModeBtnActive,
                          ]}
                          onPress={() => setMapStyle('roadmap')}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.mapModeBtnText,
                              mapStyle === 'roadmap' && styles.mapModeBtnTextActive,
                            ]}
                          >
                            Roadmap
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Map Display Box */}
                    <View style={styles.mapDisplayContainer}>
                      {Platform.OS === 'web' ? (
                        React.createElement('iframe', {
                          title: 'Google Map Location',
                          width: '100%',
                          height: '100%',
                          style: { border: 0, width: '100%', height: '100%' },
                          loading: 'lazy',
                          allowFullScreen: true,
                          referrerPolicy: 'no-referrer-when-downgrade',
                          src: `https://maps.google.com/maps?q=${encodeURIComponent(
                            mapSearch.trim() || `${latitude},${longitude}`
                          )}&t=${mapStyle === 'satellite' ? 'k' : 'm'}&z=15&ie=UTF8&iwloc=&output=embed`,
                        })
                      ) : (
                        <View style={styles.nativeMapWrap}>
                          {/* Map Visual Layer (Satellite or Roadmap background) */}
                          <View
                            style={[
                              styles.mapCanvasBackground,
                              mapStyle === 'satellite'
                                ? styles.mapCanvasSatellite
                                : styles.mapCanvasRoadmap,
                            ]}
                          >
                            {/* Road Network & Land Parcels */}
                            <View style={styles.mapRoadMajor} />
                            <View style={styles.mapRoadBranch} />

                            {/* Landmark: Parkash Dhaba */}
                            <View style={styles.landmarkDhaba}>
                              <View style={styles.landmarkPinIcon}>
                                <Ionicons name="restaurant" size={9} color="#FFFFFF" />
                              </View>
                              <View>
                                <Text style={styles.landmarkLabel}>Parkash Dhaba</Text>
                                <Text style={styles.landmarkLabelSub}>ਪ੍ਰਕਾਸ਼ ਢਾਬਾ</Text>
                              </View>
                            </View>

                            {/* Landmark: Domino's Pizza | Ludhiana */}
                            <View style={styles.landmarkDominos}>
                              <View style={styles.landmarkPinIcon}>
                                <Ionicons name="pizza" size={9} color="#FFFFFF" />
                              </View>
                              <View>
                                <Text style={styles.landmarkLabel}>Domino's Pizza |</Text>
                                <Text style={styles.landmarkLabel}>Ludhiana, Punjab</Text>
                              </View>
                            </View>

                            {/* Neighborhood Text Identifiers */}
                            <Text style={styles.neighborhoodShamNagar}>
                              SHAM NAGAR{'\n'}ਸ਼ਾਮ ਨਗਰ
                            </Text>
                            <Text style={styles.neighborhoodKidwaiNagar}>
                              KIDWAI NAGAR
                            </Text>
                            <Text style={styles.roadLabelGill}>Gill Rd</Text>
                          </View>

                          {/* Center Red Google Maps Pin */}
                          <View style={styles.centerPinContainer}>
                            <MaterialCommunityIcons name="map-marker" size={38} color="#EA4335" />
                            <View style={styles.centerPinShadow} />
                          </View>
                        </View>
                      )}

                      {/* Floating Coordinates Pill in Bottom-Left */}
                      <View style={styles.floatingCoordsPill}>
                        <Ionicons name="location-outline" size={12} color="#0C4B32" />
                        <Text style={styles.floatingCoordsText}>
                          {latitude.toFixed(5)}°N, {longitude.toFixed(5)}°E
                        </Text>
                      </View>

                      {/* Bottom-Right Recenter / Fullscreen Button */}
                      <TouchableOpacity
                        style={styles.mapFullscreenBtn}
                        onPress={() => {
                          setLatitude(30.901);
                          setLongitude(75.8573);
                          setMapSearch('');
                        }}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons name="fullscreen" size={16} color="#26352D" />
                      </TouchableOpacity>

                      {/* Google Watermark */}
                      <View style={styles.googleWatermarkWrap}>
                        <Text style={styles.googleWatermark}>Google</Text>
                      </View>

                      {/* Map Disclaimer Footer Strip */}
                      <View style={styles.mapDisclaimerStrip}>
                        <Text style={styles.mapDisclaimerText} numberOfLines={1}>
                          Map data ©2026 Google Imagery • Terms • Report a map error
                        </Text>
                      </View>
                    </View>

                    {/* Numerical Latitude & Longitude Inputs */}
                    <View style={styles.rowTwoCols}>
                      <View style={styles.col}>
                        <Text style={styles.subFieldLabel}>Latitude (°N)</Text>
                        <TextInput
                          style={styles.monoInput}
                          keyboardType="numeric"
                          value={latitude.toString()}
                          onChangeText={(v) => setLatitude(parseFloat(v) || 0)}
                        />
                      </View>
                      <View style={styles.col}>
                        <Text style={styles.subFieldLabel}>Longitude (°E)</Text>
                        <TextInput
                          style={styles.monoInput}
                          keyboardType="numeric"
                          value={longitude.toString()}
                          onChangeText={(v) => setLongitude(parseFloat(v) || 0)}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Soil Profile Dropdown */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Soil Profile</Text>
                    <TouchableOpacity
                      style={styles.selectBtn}
                      onPress={() =>
                        setOpenDropdown(openDropdown === 'soil' ? null : 'soil')
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.selectBtnText}>{soilType}</Text>
                      <Ionicons
                        name={openDropdown === 'soil' ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#55685D"
                      />
                    </TouchableOpacity>

                    {openDropdown === 'soil' && (
                      <View style={styles.dropdownList}>
                        {SOIL_PROFILES.map((st) => (
                          <TouchableOpacity
                            key={st}
                            style={[
                              styles.dropdownItem,
                              soilType === st && styles.dropdownItemActive,
                            ]}
                            onPress={() => {
                              setSoilType(st);
                              setOpenDropdown(null);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                soilType === st && styles.dropdownItemTextActive,
                              ]}
                            >
                              {st}
                            </Text>
                            {soilType === st && (
                              <Ionicons name="checkmark" size={15} color="#0C4B32" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Irrigation System Dropdown */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Irrigation System</Text>
                    <TouchableOpacity
                      style={styles.selectBtn}
                      onPress={() =>
                        setOpenDropdown(openDropdown === 'irrigation' ? null : 'irrigation')
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.selectBtnText}>{irrigationType}</Text>
                      <Ionicons
                        name={openDropdown === 'irrigation' ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#55685D"
                      />
                    </TouchableOpacity>

                    {openDropdown === 'irrigation' && (
                      <View style={styles.dropdownList}>
                        {IRRIGATION_SYSTEMS.map((ir) => (
                          <TouchableOpacity
                            key={ir}
                            style={[
                              styles.dropdownItem,
                              irrigationType === ir && styles.dropdownItemActive,
                            ]}
                            onPress={() => {
                              setIrrigationType(ir);
                              setOpenDropdown(null);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                irrigationType === ir && styles.dropdownItemTextActive,
                              ]}
                            >
                              {ir}
                            </Text>
                            {irrigationType === ir && (
                              <Ionicons name="checkmark" size={15} color="#0C4B32" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Water Source Dropdown */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Water Source</Text>
                    <TouchableOpacity
                      style={styles.selectBtn}
                      onPress={() =>
                        setOpenDropdown(openDropdown === 'water' ? null : 'water')
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.selectBtnText}>{waterSource}</Text>
                      <Ionicons
                        name={openDropdown === 'water' ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#55685D"
                      />
                    </TouchableOpacity>

                    {openDropdown === 'water' && (
                      <View style={styles.dropdownList}>
                        {WATER_SOURCES.map((ws) => (
                          <TouchableOpacity
                            key={ws}
                            style={[
                              styles.dropdownItem,
                              waterSource === ws && styles.dropdownItemActive,
                            ]}
                            onPress={() => {
                              setWaterSource(ws);
                              setOpenDropdown(null);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                waterSource === ws && styles.dropdownItemTextActive,
                              ]}
                            >
                              {ws}
                            </Text>
                            {waterSource === ws && (
                              <Ionicons name="checkmark" size={15} color="#0C4B32" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* ========================================================================= */}
              {/* STEP 3: SELECT CROPS (Multi-Crop Allowed)                                 */}
              {/* ========================================================================= */}
              {setupStep === 3 && (
                <View style={styles.stepContent}>
                  <View style={styles.cropStepHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabel}>
                        Select Crop Templates (Multi-Crop Allowed) <Text style={styles.reqStar}>*</Text>
                      </Text>
                      <Text style={styles.fieldSub}>
                        1 Farm can cultivate multiple crop varieties simultaneously.
                      </Text>
                    </View>
                    <View style={styles.cropCountBadge}>
                      <Text style={styles.cropCountBadgeText}>
                        {selectedCropTemplates.length} Selected
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cropsGrid}>
                    {CROP_TEMPLATES.map((tmpl) => {
                      const isSelected = selectedCropTemplates.includes(tmpl.id);
                      return (
                        <TouchableOpacity
                          key={tmpl.id}
                          style={[
                            styles.cropCard,
                            isSelected && styles.cropCardActive,
                          ]}
                          onPress={() => {
                            if (isSelected) {
                              if (selectedCropTemplates.length > 1) {
                                setSelectedCropTemplates((prev) =>
                                  prev.filter((id) => id !== tmpl.id)
                                );
                              } else {
                                Alert.alert('Notice', 'At least 1 crop template must remain selected.');
                              }
                            } else {
                              setSelectedCropTemplates((prev) => [...prev, tmpl.id]);
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <View style={styles.cropCardTop}>
                            <Text
                              style={[
                                styles.cropCardName,
                                isSelected && styles.cropCardNameActive,
                              ]}
                              numberOfLines={1}
                            >
                              {tmpl.name}
                            </Text>
                            <View
                              style={[
                                styles.cropCardCheckbox,
                                isSelected && styles.cropCardCheckboxActive,
                              ]}
                            >
                              {isSelected && (
                                <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                              )}
                            </View>
                          </View>
                          <Text style={styles.cropCardVariety} numberOfLines={1}>
                            {tmpl.variety}
                          </Text>
                          <View style={styles.cropCardMeta}>
                            <View style={styles.cropSeasonPill}>
                              <Text style={styles.cropSeasonPillText}>{tmpl.season}</Text>
                            </View>
                            <Text style={styles.cropDurationText}>⏱ {tmpl.duration}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* ========================================================================= */}
              {/* STEP 4: SOWING SCHEDULE & FIELD PARAMETERS                                */}
              {/* ========================================================================= */}
              {setupStep === 4 && (
                <View style={styles.stepContent}>
                  <View style={styles.cropStepHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabel}>
                        Crop Sowing Schedule & Field Parameters
                      </Text>
                      <Text style={styles.fieldSub}>
                        Configure sowing dates, varieties, and growth stages for each crop.
                      </Text>
                    </View>
                  </View>

                  <View style={{ gap: 14 }}>
                    {selectedCropTemplates.map((templateId) => {
                      const tmpl = CROP_TEMPLATES.find((t) => t.id === templateId);
                      const cfg = cropConfigs[templateId] || {
                        area: '10',
                        variety: tmpl?.variety || '',
                        sownDate: '12-11-2026',
                        stage: '1. Sowing & Germination',
                        currentDay: 14,
                        totalDays: tmpl?.durationDays || 135,
                      };

                      return (
                        <View key={templateId} style={styles.cropScheduleCard}>
                          <View style={styles.cropScheduleCardHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <MaterialCommunityIcons name="sprout" size={16} color="#0C4B32" />
                              <Text style={styles.cropScheduleTitle}>{tmpl?.name}</Text>
                            </View>
                            <View style={styles.cropSeasonPill}>
                              <Text style={styles.cropSeasonPillText}>{tmpl?.season}</Text>
                            </View>
                          </View>

                          {/* Row: Allocated Area & Seed Variety */}
                          <View style={styles.rowTwoCols}>
                            <View style={styles.col}>
                              <Text style={styles.subFieldLabel}>
                                Allocated Area ({areaUnit}) <Text style={styles.reqStar}>*</Text>
                              </Text>
                              <TextInput
                                style={styles.textInput}
                                keyboardType="numeric"
                                placeholder="e.g. 10"
                                placeholderTextColor="#88988E"
                                value={cfg.area}
                                onChangeText={(val) => {
                                  setCropConfigs((prev) => ({
                                    ...prev,
                                    [templateId]: { ...cfg, area: val },
                                  }));
                                }}
                              />
                            </View>

                            <View style={styles.col}>
                              <Text style={styles.subFieldLabel}>Seed Variety</Text>
                              <TextInput
                                style={styles.textInput}
                                placeholder="Variety code"
                                placeholderTextColor="#88988E"
                                value={cfg.variety}
                                onChangeText={(val) => {
                                  setCropConfigs((prev) => ({
                                    ...prev,
                                    [templateId]: { ...cfg, variety: val },
                                  }));
                                }}
                              />
                            </View>
                          </View>

                          {/* Row: Started / Sown On & Growth Stage */}
                          <View style={styles.rowTwoCols}>
                            {/* Started / Sown On with DatePickerModal */}
                            <View style={styles.col}>
                              <Text style={styles.subFieldLabel}>
                                Started / Sown On <Text style={styles.reqStar}>*</Text>
                              </Text>
                              <TouchableOpacity
                                style={styles.datePickerBtn}
                                onPress={() => setDatePickerCropId(templateId)}
                                activeOpacity={0.8}
                              >
                                <Text style={styles.datePickerBtnText}>{cfg.sownDate}</Text>
                                <Ionicons name="calendar-outline" size={16} color="#0C4B32" />
                              </TouchableOpacity>
                            </View>

                            {/* Growth Stage */}
                            <View style={styles.col}>
                              <Text style={styles.subFieldLabel}>Current Stage</Text>
                              <TouchableOpacity
                                style={styles.selectBtn}
                                onPress={() =>
                                  setOpenDropdown(
                                    openDropdown === `stage-${templateId}`
                                      ? null
                                      : `stage-${templateId}`
                                  )
                                }
                                activeOpacity={0.8}
                              >
                                <Text style={styles.selectBtnText} numberOfLines={1}>
                                  {cfg.stage}
                                </Text>
                                <Ionicons
                                  name={
                                    openDropdown === `stage-${templateId}`
                                      ? 'chevron-up'
                                      : 'chevron-down'
                                  }
                                  size={16}
                                  color="#55685D"
                                />
                              </TouchableOpacity>

                              {openDropdown === `stage-${templateId}` && (
                                <View style={styles.dropdownList}>
                                  {STANDARD_CROP_STAGES.map((st) => (
                                    <TouchableOpacity
                                      key={st.step}
                                      style={[
                                        styles.dropdownItem,
                                        cfg.stage === st.name && styles.dropdownItemActive,
                                      ]}
                                      onPress={() => {
                                        setCropConfigs((prev) => ({
                                          ...prev,
                                          [templateId]: {
                                            ...cfg,
                                            stage: st.name,
                                            currentDay: st.defaultDay,
                                          },
                                        }));
                                        setOpenDropdown(null);
                                      }}
                                    >
                                      <Text
                                        style={[
                                          styles.dropdownItemText,
                                          cfg.stage === st.name &&
                                            styles.dropdownItemTextActive,
                                        ]}
                                      >
                                        {st.name}
                                      </Text>
                                      {cfg.stage === st.name && (
                                        <Ionicons
                                          name="checkmark"
                                          size={15}
                                          color="#0C4B32"
                                        />
                                      )}
                                    </TouchableOpacity>
                                  ))}
                                </View>
                              )}
                            </View>
                          </View>

                          {/* Crop Age (Day) Input */}
                          <View style={styles.fieldBlock}>
                            <Text style={styles.subFieldLabel}>
                              Current Crop Age (Day) <Text style={styles.reqStar}>*</Text>
                            </Text>
                            <View style={styles.cropAgeWrap}>
                              <TextInput
                                style={[styles.textInput, { flex: 1 }]}
                                keyboardType="numeric"
                                value={cfg.currentDay.toString()}
                                onChangeText={(val) => {
                                  const parsed = parseInt(val) || 0;
                                  setCropConfigs((prev) => ({
                                    ...prev,
                                    [templateId]: { ...cfg, currentDay: parsed },
                                  }));
                                }}
                              />
                              <Text style={styles.cropAgeSuffix}>/ {cfg.totalDays}d</Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Stepper Footer Action Buttons */}
            <View style={styles.modalFooter}>
              {setupStep === 1 ? (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() =>
                    setSetupStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4) : 1))
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={16} color="#55685D" />
                  <Text style={styles.cancelBtnText}>Back</Text>
                </TouchableOpacity>
              )}

              {setupStep < 4 ? (
                <TouchableOpacity
                  style={styles.continueBtn}
                  onPress={handleNextStep}
                  activeOpacity={0.8}
                >
                  <Text style={styles.continueBtnText}>
                    Continue to Step {setupStep + 1}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSaveFarm}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>
                    Complete Farm Setup ({selectedCropTemplates.length} Crops)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>

      {/* Reusable Calendar Date Picker */}
      <DatePickerModal
        visible={datePickerCropId !== null}
        onClose={() => setDatePickerCropId(null)}
        initialDate={
          datePickerCropId ? cropConfigs[datePickerCropId]?.sownDate : undefined
        }
        onSelectDate={(formattedDate) => {
          if (datePickerCropId) {
            setCropConfigs((prev) => ({
              ...prev,
              [datePickerCropId]: {
                ...prev[datePickerCropId],
                sownDate: formattedDate,
              },
            }));
          }
          setDatePickerCropId(null);
        }}
        title="Select Crop Sowing Date"
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    maxHeight: '94%',
    paddingTop: 12,
    paddingHorizontal: 18,
    paddingBottom: Platform.OS === 'ios' ? 32 : 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
    elevation: 20,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#26352D',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#55685D',
    lineHeight: 15,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },

  // Stepper Tabs
  stepperContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
  },
  stepperScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 2,
  },
  stepTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  stepTabActive: {},
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeActive: {
    backgroundColor: '#0C4B32',
    borderColor: '#0C4B32',
  },
  stepBadgeCompleted: {
    backgroundColor: '#278449',
    borderColor: '#278449',
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#55685D',
  },
  stepBadgeTextActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#55685D',
  },
  stepLabelActive: {
    fontWeight: '700',
    color: '#0C4B32',
  },
  stepLabelCompleted: {
    fontWeight: '600',
    color: '#26352D',
  },

  // Error Banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    flex: 1,
    fontWeight: '500',
  },

  modalBody: {
    maxHeight: 460,
  },
  modalBodyContent: {
    paddingVertical: 12,
  },
  stepContent: {
    gap: 14,
  },

  // Form Fields
  fieldBlock: {
    gap: 5,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#26352D',
  },
  subFieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#55685D',
    marginBottom: 4,
  },
  fieldSub: {
    fontSize: 11,
    color: '#55685D',
    marginTop: 1,
  },
  reqStar: {
    color: '#DC2626',
  },
  textInput: {
    backgroundColor: '#FBFDFB',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#26352D',
  },
  monoInput: {
    backgroundColor: '#FBFDFB',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: '#26352D',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Rows & Columns
  rowTwoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
  rowThreeCols: {
    flexDirection: 'row',
    gap: 8,
  },
  colThree: {
    flex: 1,
  },

  // Dropdown / Select Button
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FBFDFB',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  selectBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#26352D',
    flex: 1,
  },
  dropdownList: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    padding: 4,
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
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: '#E7F3EB',
  },
  dropdownItemText: {
    fontSize: 12,
    color: '#26352D',
  },
  dropdownItemTextActive: {
    color: '#0C4B32',
    fontWeight: '700',
  },

  // Ownership Details (2-Column selectable cards matching image)
  ownershipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  ownershipTile: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 46,
  },
  ownershipTileActive: {
    backgroundColor: '#E7F3EB',
    borderColor: '#0C4B32',
    borderWidth: 1.5,
  },
  ownershipTileText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#55685D',
    flex: 1,
    lineHeight: 14,
  },
  ownershipTileTextActive: {
    color: '#0C4B32',
    fontWeight: '700',
  },
  checkIcon: {
    marginLeft: 4,
  },

  // Google Maps (Satellite & Coordinates) Section (Step 2)
  googleMapsSection: {
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  mapHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  mapHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#26352D',
  },
  mapHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gpsDetectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0C4B32',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  gpsDetectBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  openMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 3,
  },
  openMapsText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#55685D',
  },

  // Search & Mode Switcher
  mapControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapSearchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFDFB',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 36,
  },
  mapSearchIcon: {
    marginRight: 4,
  },
  mapSearchInput: {
    flex: 1,
    fontSize: 11,
    color: '#26352D',
    paddingVertical: 4,
  },
  mapSearchClear: {
    padding: 2,
  },
  mapModeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  mapModeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mapModeBtnActive: {
    backgroundColor: '#0C4B32',
  },
  mapModeBtnText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#55685D',
  },
  mapModeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Map Display Box
  mapDisplayContainer: {
    height: 190,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE6DE',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#3E4637',
  },
  nativeMapWrap: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mapCanvasBackground: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mapCanvasSatellite: {
    backgroundColor: '#4B5242',
  },
  mapCanvasRoadmap: {
    backgroundColor: '#F3EFE7',
  },
  mapRoadMajor: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 22,
    backgroundColor: '#A8A29E',
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: '#D6D3D1',
    transform: [{ rotate: '-18deg' }],
  },
  mapRoadBranch: {
    position: 'absolute',
    top: '38%',
    left: -20,
    right: -20,
    height: 16,
    backgroundColor: '#C8C4BE',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E7E5E4',
    transform: [{ rotate: '-32deg' }],
  },
  roadLabelGill: {
    position: 'absolute',
    top: '58%',
    left: '52%',
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  landmarkDhaba: {
    position: 'absolute',
    top: 22,
    left: 45,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  landmarkDominos: {
    position: 'absolute',
    top: 60,
    right: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  landmarkPinIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  landmarkLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  landmarkLabelSub: {
    fontSize: 8,
    color: '#E5E7EB',
  },
  neighborhoodShamNagar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  neighborhoodKidwaiNagar: {
    position: 'absolute',
    top: 25,
    right: 15,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },

  centerPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -26,
    marginLeft: -19,
    alignItems: 'center',
    zIndex: 5,
  },
  centerPinShadow: {
    width: 8,
    height: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    marginTop: -4,
  },
  floatingCoordsPill: {
    position: 'absolute',
    bottom: 16,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    zIndex: 6,
  },
  floatingCoordsText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#26352D',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  mapFullscreenBtn: {
    position: 'absolute',
    bottom: 16,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 6,
  },
  googleWatermarkWrap: {
    position: 'absolute',
    bottom: 15,
    left: '42%',
    zIndex: 6,
  },
  googleWatermark: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    opacity: 0.85,
    letterSpacing: -0.5,
  },
  mapDisclaimerStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    zIndex: 6,
  },
  mapDisclaimerText: {
    fontSize: 8,
    color: '#55685D',
  },

  // Crop Selection (Step 3)
  cropStepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },
  cropCountBadge: {
    backgroundColor: '#E7F3EB',
    borderWidth: 1,
    borderColor: '#C6E2D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  cropCountBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0C4B32',
  },
  cropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  cropCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  cropCardActive: {
    backgroundColor: '#E7F3EB',
    borderColor: '#0C4B32',
    borderWidth: 1.5,
  },
  cropCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cropCardName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#26352D',
    flex: 1,
  },
  cropCardNameActive: {
    color: '#0C4B32',
  },
  cropCardCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DCE6DE',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  cropCardCheckboxActive: {
    backgroundColor: '#0C4B32',
    borderColor: '#0C4B32',
  },
  cropCardVariety: {
    fontSize: 10,
    color: '#55685D',
  },
  cropCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  cropSeasonPill: {
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  cropSeasonPillText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#0C4B32',
  },
  cropDurationText: {
    fontSize: 10,
    color: '#55685D',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Step 4: Crop Schedule
  cropScheduleCard: {
    backgroundColor: '#FBFDFB',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  cropScheduleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
  },
  cropScheduleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#26352D',
  },
  datePickerBtn: {
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
  datePickerBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#26352D',
  },
  cropAgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cropAgeSuffix: {
    fontSize: 12,
    color: '#55685D',
    fontWeight: '600',
  },

  // Footer Buttons
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5ECE7',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE6DE',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#55685D',
  },
  continueBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0C4B32',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  continueBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0C4B32',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

