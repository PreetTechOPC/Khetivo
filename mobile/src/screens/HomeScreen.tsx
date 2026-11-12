import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { Farm, initialAdvisories } from '../data/mockData';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface HomeScreenProps {
  currentFarm: Farm;
  farms: Farm[];
  onSelectFarm: () => void;
  onNavigate: (screen: string) => void;
  onOpenTutorial: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentFarm,
  farms,
  onSelectFarm,
  onNavigate,
  onOpenTutorial,
}) => {
  const totalAcres = farms.reduce((acc, f) => acc + f.totalArea, 0);

  // Field Visit State
  const [fieldVisitModalOpen, setFieldVisitModalOpen] = useState(false);
  const [fieldVisitSuccess, setFieldVisitSuccess] = useState<any | null>(null);
  const [fieldVisitPlot, setFieldVisitPlot] = useState('Killa #3 - North Parcel');
  const [fieldVisitCrop, setFieldVisitCrop] = useState('Wheat (HD-3086) - Tillering');
  const [fieldVisitReason, setFieldVisitReason] = useState('Pest / Disease Attack (Yellow Rust / Aphids)');
  const [fieldVisitSlot, setFieldVisitSlot] = useState('Morning (8:00 AM - 12:00 PM)');
  const [fieldVisitTier, setFieldVisitTier] = useState<'standard' | 'priority'>('standard');
  const [fieldVisitNotes, setFieldVisitNotes] = useState('');
  const [fieldVisitPhone, setFieldVisitPhone] = useState('+91 98140-54321');

  const handleBookFieldVisit = () => {
    if (!fieldVisitPhone.trim() || fieldVisitPhone.length < 8) {
      Alert.alert('Phone Required', 'Please enter a valid contact phone number.');
      return;
    }

    const bookingId = `KV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setFieldVisitSuccess({
      visitId: bookingId,
      farmName: currentFarm.name,
      plot: fieldVisitPlot,
      crop: fieldVisitCrop,
      reason: fieldVisitReason,
      date: 'Tomorrow, Nov 12, 2026',
      slot: fieldVisitSlot,
      fee: fieldVisitTier === 'priority' ? 799 : 499,
      agronomist: 'Dr. Harpreet Singh (Senior Agronomist, PAU)',
    });
  };

  const visitReasons = [
    'Pest / Disease Attack (Yellow Rust / Aphids)',
    'Soil Health & Nutrient Deficiency (Yellowing)',
    'Irrigation / Salinity / Waterlogging Issue',
    'Pre-Harvest Quality & Moisture Inspection',
    'General Agronomic Field Audit',
  ];

  const dailyModules = [
    {
      id: 'field-visit',
      title: 'Raise a Field Visit',
      desc: 'Book on-site PAU scientist crop inspection',
      icon: 'map-marker',
      iconFamily: 'MaterialCommunityIcons',
      color: '#0C4B32',
      bgColor: '#E7F3EB',
      badge: 'On-Site Visit',
      action: () => setFieldVisitModalOpen(true),
    },
    {
      id: 'advisories',
      title: 'Advisories & Alerts',
      desc: 'Crop outbreak alerts & weather warnings',
      icon: 'radio-outline',
      iconFamily: 'Ionicons',
      color: '#DC2626',
      bgColor: '#FEE2E2',
      badge: `${initialAdvisories.length} Active`,
      action: () => onNavigate('advisories'),
    },
    {
      id: 'weather',
      title: 'Weather',
      desc: 'Hyper-local GPS weather & spray advisory',
      icon: 'weather-partly-cloudy',
      iconFamily: 'MaterialCommunityIcons',
      color: '#D97706',
      bgColor: '#FEF3C7',
      badge: '24°C Live',
      action: () => onNavigate('weather'),
    },
    {
      id: 'tasks',
      title: 'Tasks',
      desc: 'Task calendar & kanban board',
      icon: 'checkbox-marked-outline',
      iconFamily: 'MaterialCommunityIcons',
      color: colors.primary,
      bgColor: '#E7F3EB',
      action: () => onNavigate('tasks'),
    },
    {
      id: 'inventory',
      title: 'Inventory',
      desc: 'Seeds, fertilizers & hardware stock',
      icon: 'package-variant-closed',
      iconFamily: 'MaterialCommunityIcons',
      color: '#7C3AED',
      bgColor: '#F3E8FF',
      action: () => onNavigate('inventory'),
    },
    {
      id: 'equipment',
      title: 'Equipment',
      desc: 'Machinery, tractors & maintenance logs',
      icon: 'tractor',
      iconFamily: 'MaterialCommunityIcons',
      color: '#15803D',
      bgColor: '#DCFCE7',
      action: () => onNavigate('equipment'),
    },
  ];

  const recordsModules = [
    {
      id: 'crops',
      title: 'Crop Management',
      desc: 'Crop cycle, timeline & varieties',
      icon: 'sprout',
      iconFamily: 'MaterialCommunityIcons',
      color: '#15803D',
      bgColor: '#DCFCE7',
      badge: `${currentFarm.crops?.length || 2} Crops`,
      action: () => onNavigate('crops'),
    },
    {
      id: 'stats',
      title: 'Stats',
      desc: 'Production, losses & farm expenses',
      icon: 'receipt',
      iconFamily: 'MaterialCommunityIcons',
      color: colors.primary,
      bgColor: '#E7F3EB',
      badge: '₹8.95L Net',
      action: () => onNavigate('stats'),
    },
    {
      id: 'reports',
      title: 'Reports',
      desc: 'Farm audit reports & data downloads',
      icon: 'document-text-outline',
      iconFamily: 'Ionicons',
      color: '#0284C7',
      bgColor: '#E0F2FE',
      badge: 'Audit Ready',
      action: () => onNavigate('reports'),
    },
  ];

  const manageModules = [
    {
      id: 'parcels',
      title: 'My Farms',
      desc: 'All registered farms & locations',
      icon: 'business-outline',
      iconFamily: 'Ionicons',
      color: colors.primary,
      bgColor: '#E7F3EB',
      badge: `${farms.length} Farms`,
      action: () => onNavigate('parcels'),
    },
    {
      id: 'team',
      title: 'Team',
      desc: 'Farm workforce & operator management',
      icon: 'people-outline',
      iconFamily: 'Ionicons',
      color: '#2563EB',
      bgColor: '#EFF6FF',
      action: () => onNavigate('team'),
    },
    {
      id: 'subscription',
      title: 'Subscription / Plan',
      desc: 'Active plan, billing & enterprise tier',
      icon: 'shield-checkmark-outline',
      iconFamily: 'Ionicons',
      color: '#D97706',
      bgColor: '#FEF3C7',
      badge: 'Pro Active',
      action: () => onNavigate('subscription'),
    },
    {
      id: 'support',
      title: 'Support',
      desc: '24/7 Agronomist helpline & WhatsApp support',
      icon: 'help-buoy-outline',
      iconFamily: 'Ionicons',
      color: '#059669',
      bgColor: '#D1FAE5',
      action: () => onNavigate('support'),
    },
    {
      id: 'settings',
      title: 'Settings',
      desc: 'Farmer profile & farm preferences',
      icon: 'settings-outline',
      iconFamily: 'Ionicons',
      color: '#4B5563',
      bgColor: '#F3F4F6',
      action: () => onNavigate('settings'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================================= */}
        {/* 1. TOP APP BAR (Logo + Notification Bell + Raise a Field Visit Button)    */}
        {/* ========================================================================= */}
        <View style={styles.topAppBar}>
          <Image
            source={require('../../assets/logo-khetivo-cropped.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />

          <View style={styles.topRightActions}>
            {/* Raise a Field Visit Button (Exact from Web Dashboard Header) */}
            <TouchableOpacity
              style={styles.fieldVisitBtn}
              onPress={() => {
                setFieldVisitSuccess(null);
                setFieldVisitModalOpen(true);
              }}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="map-marker" size={15} color={colors.accent} />
              <Text style={styles.fieldVisitBtnText}>Field Visit</Text>
            </TouchableOpacity>

            {/* Notification Bell */}
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => onNavigate('advisories')}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={19} color={colors.text} />
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{initialAdvisories.length}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 2. REFINED FARM HOLDING & FARMER IDENTIFIER CARD                           */}
        {/* ========================================================================= */}
        <TouchableOpacity
          style={styles.farmSelectorCard}
          onPress={onSelectFarm}
          activeOpacity={0.85}
        >
          <View style={styles.farmBadge}>
            <Text style={styles.farmBadgeText}>ALL</Text>
          </View>
          <View style={styles.farmInfo}>
            <View style={styles.farmerRow}>
              <Text style={styles.farmerName}>Mohan Lal</Text>
              <View style={styles.verifiedPill}>
                <Ionicons name="checkmark-circle" size={11} color={colors.primary} />
                <Text style={styles.verifiedPillText}>Verified Farmer</Text>
              </View>
            </View>
            <Text style={styles.farmSub}>
              {currentFarm.name} • {currentFarm.district}, Punjab • {currentFarm.totalArea} Acres ({totalAcres} Total)
            </Text>
          </View>
          <Feather name="chevron-down" size={18} color={colors.text} />
        </TouchableOpacity>

        {/* ========================================================================= */}
        {/* 3. WEATHER QUICK BANNER (Clean & Sober)                                  */}
        {/* ========================================================================= */}
        <TouchableOpacity
          style={styles.weatherBanner}
          onPress={() => onNavigate('weather')}
          activeOpacity={0.85}
        >
          <View style={styles.weatherLeft}>
            <MaterialCommunityIcons name="weather-partly-cloudy" size={32} color={colors.accent} />
            <View>
              <Text style={styles.weatherTemp}>24°C</Text>
              <Text style={styles.weatherCond}>Partly Cloudy • Spray Window Open</Text>
            </View>
          </View>
          <View style={styles.weatherRight}>
            <Text style={styles.weatherMetric}>💧 42% Humidity</Text>
            <Text style={styles.weatherMetric}>💨 8 km/h Wind</Text>
          </View>
        </TouchableOpacity>

        {/* ========================================================================= */}
        {/* 4. DAILY MODULES SECTION (Includes Raise a Field Visit)                    */}
        {/* ========================================================================= */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeader}>DAILY</Text>
          <View style={styles.moduleList}>
            {dailyModules.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.moduleCard}
                onPress={m.action}
                activeOpacity={0.75}
              >
                <View style={[styles.moduleIconWrap, { backgroundColor: m.bgColor }]}>
                  {m.iconFamily === 'Ionicons' ? (
                    <Ionicons name={m.icon as any} size={20} color={m.color} />
                  ) : (
                    <MaterialCommunityIcons name={m.icon as any} size={20} color={m.color} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.moduleTitle}>{m.title}</Text>
                    {m.badge && (
                      <View style={styles.pillBadge}>
                        <Text style={styles.pillBadgeText}>{m.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.moduleDesc}>{m.desc}</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 5. RECORDS MODULES SECTION                                                */}
        {/* ========================================================================= */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeader}>RECORDS</Text>
          <View style={styles.moduleList}>
            {recordsModules.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.moduleCard}
                onPress={m.action}
                activeOpacity={0.75}
              >
                <View style={[styles.moduleIconWrap, { backgroundColor: m.bgColor }]}>
                  {m.iconFamily === 'Ionicons' ? (
                    <Ionicons name={m.icon as any} size={20} color={m.color} />
                  ) : (
                    <MaterialCommunityIcons name={m.icon as any} size={20} color={m.color} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.moduleTitle}>{m.title}</Text>
                    {m.badge && (
                      <View style={styles.pillBadge}>
                        <Text style={styles.pillBadgeText}>{m.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.moduleDesc}>{m.desc}</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 6. MANAGE MODULES SECTION                                                 */}
        {/* ========================================================================= */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeader}>MANAGE</Text>
          <View style={styles.moduleList}>
            {manageModules.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.moduleCard}
                onPress={m.action}
                activeOpacity={0.75}
              >
                <View style={[styles.moduleIconWrap, { backgroundColor: m.bgColor }]}>
                  {m.iconFamily === 'Ionicons' ? (
                    <Ionicons name={m.icon as any} size={20} color={m.color} />
                  ) : (
                    <MaterialCommunityIcons name={m.icon as any} size={20} color={m.color} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.moduleTitle}>{m.title}</Text>
                    {m.badge && (
                      <View style={styles.pillBadge}>
                        <Text style={styles.pillBadgeText}>{m.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.moduleDesc}>{m.desc}</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 7. WATCH VIDEO TUTORIAL BANNER                                            */}
        {/* ========================================================================= */}
        <TouchableOpacity
          style={styles.tutorialBanner}
          onPress={onOpenTutorial}
          activeOpacity={0.85}
        >
          <View style={styles.playIconWrap}>
            <Ionicons name="play" size={16} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tutorialTitle}>Watch Video Tutorial</Text>
            <Text style={styles.tutorialSub}>4-minute step-by-step smart agriculture walkthrough</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.primary} />
        </TouchableOpacity>

        {/* Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ========================================================================= */}
      {/* RAISE A FIELD VISIT MODAL (Exact Flow & Fields from Web Dashboard)         */}
      {/* ========================================================================= */}
      <Modal
        visible={fieldVisitModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFieldVisitModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalSheetHeader}>
              <View>
                <Text style={styles.modalSheetTitle}>Raise a Field Visit</Text>
                <Text style={styles.modalSheetSub}>Book an on-site PAU Agronomist diagnosis</Text>
              </View>
              <TouchableOpacity onPress={() => setFieldVisitModalOpen(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {fieldVisitSuccess ? (
              /* Success Confirmation Card */
              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                <View style={styles.successWrap}>
                  <View style={styles.successIconWrap}>
                    <Ionicons name="checkmark-circle" size={48} color={colors.primary} />
                  </View>
                  <Text style={styles.successTitle}>Field Visit Scheduled!</Text>
                  <View style={styles.refPill}>
                    <Text style={styles.refPillText}>Booking Ref: {fieldVisitSuccess.visitId}</Text>
                  </View>
                  <Text style={styles.successMsg}>
                    An official PAU agronomist will arrive at your farm parcel to conduct disease diagnosis and soil tests.
                  </Text>

                  {/* Summary Card */}
                  <View style={styles.visitSummaryCard}>
                    <View style={styles.visitRow}>
                      <Text style={styles.vLabel}>Holding & Parcel:</Text>
                      <Text style={styles.vVal}>{fieldVisitSuccess.farmName} ({fieldVisitSuccess.plot})</Text>
                    </View>
                    <View style={styles.visitRow}>
                      <Text style={styles.vLabel}>Target Crop:</Text>
                      <Text style={styles.vVal}>{fieldVisitSuccess.crop}</Text>
                    </View>
                    <View style={styles.visitRow}>
                      <Text style={styles.vLabel}>Reason:</Text>
                      <Text style={styles.vVal}>{fieldVisitSuccess.reason}</Text>
                    </View>
                    <View style={styles.visitRow}>
                      <Text style={styles.vLabel}>Scheduled Window:</Text>
                      <Text style={styles.vVal}>{fieldVisitSuccess.date} • {fieldVisitSuccess.slot}</Text>
                    </View>
                    <View style={styles.visitRow}>
                      <Text style={styles.vLabel}>Assigned Specialist:</Text>
                      <Text style={[styles.vVal, { color: colors.primary, fontWeight: '700' }]}>
                        {fieldVisitSuccess.agronomist}
                      </Text>
                    </View>
                    <View style={styles.visitRow}>
                      <Text style={styles.vLabel}>Consultation Fee:</Text>
                      <Text style={[styles.vVal, { fontWeight: '800' }]}>
                        ₹{fieldVisitSuccess.fee} (Pay on Arrival)
                      </Text>
                    </View>
                  </View>

                  <View style={styles.phoneNotice}>
                    <Ionicons name="call" size={14} color={colors.primary} />
                    <Text style={styles.phoneNoticeText}>
                      Specialist will call {fieldVisitPhone} 1 hour prior to arrival.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={() => setFieldVisitModalOpen(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.doneBtnText}>Done & Return to Dashboard</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            ) : (
              /* Booking Form */
              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                <View style={styles.modalForm}>
                  <Text style={styles.inputLabel}>Target Farm Holding</Text>
                  <View style={styles.staticField}>
                    <MaterialCommunityIcons name="office-building" size={16} color={colors.primary} />
                    <Text style={styles.staticFieldText}>{currentFarm.name} ({currentFarm.district})</Text>
                  </View>

                  <Text style={styles.inputLabel}>Specific Field Plot / Killa #</Text>
                  <TextInput
                    style={styles.textInput}
                    value={fieldVisitPlot}
                    onChangeText={setFieldVisitPlot}
                    placeholder="e.g., Killa #3 - North Parcel"
                  />

                  <Text style={styles.inputLabel}>Affected Crop & Growth Stage</Text>
                  <TextInput
                    style={styles.textInput}
                    value={fieldVisitCrop}
                    onChangeText={setFieldVisitCrop}
                    placeholder="e.g., Wheat (HD-3086) - Tillering Stage"
                  />

                  <Text style={styles.inputLabel}>Primary Reason for Field Inspection</Text>
                  <View style={styles.reasonsList}>
                    {visitReasons.map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.reasonOption, fieldVisitReason === r && styles.reasonOptionActive]}
                        onPress={() => setFieldVisitReason(r)}
                      >
                        <MaterialCommunityIcons
                          name={fieldVisitReason === r ? 'radiobox-marked' : 'radiobox-blank'}
                          size={16}
                          color={fieldVisitReason === r ? colors.primary : colors.textMuted}
                        />
                        <Text style={[styles.reasonText, fieldVisitReason === r && styles.reasonTextActive]}>
                          {r}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Preferred Consultation Tier</Text>
                  <View style={styles.tierRow}>
                    <TouchableOpacity
                      style={[styles.tierCard, fieldVisitTier === 'standard' && styles.tierCardActive]}
                      onPress={() => setFieldVisitTier('standard')}
                    >
                      <Text style={styles.tierName}>Standard Agronomist</Text>
                      <Text style={styles.tierPrice}>₹499</Text>
                      <Text style={styles.tierSub}>On-site pest & soil test</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.tierCard, fieldVisitTier === 'priority' && styles.tierCardActive]}
                      onPress={() => setFieldVisitTier('priority')}
                    >
                      <Text style={styles.tierName}>Priority Scientist</Text>
                      <Text style={styles.tierPrice}>₹799</Text>
                      <Text style={styles.tierSub}>PAU Professor & Drone Scan</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.inputLabel}>Farmer Contact Phone</Text>
                  <TextInput
                    style={styles.textInput}
                    value={fieldVisitPhone}
                    onChangeText={setFieldVisitPhone}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.inputLabel}>Additional Notes / Symptoms (Optional)</Text>
                  <TextInput
                    style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                    value={fieldVisitNotes}
                    onChangeText={setFieldVisitNotes}
                    placeholder="Describe yellowing spots, fungus or wilting..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                  />

                  <TouchableOpacity
                    style={styles.bookSubmitBtn}
                    onPress={handleBookFieldVisit}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.bookSubmitBtnText}>
                      Schedule Visit (Pay ₹{fieldVisitTier === 'priority' ? '799' : '499'} on Arrival)
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 6, gap: 14 },

  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  brandLogo: {
    height: 36,
    width: 135,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldVisitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  fieldVisitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#DC2626',
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  farmSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  farmBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  farmBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  farmInfo: {
    flex: 1,
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  farmerName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E7F3EB',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  verifiedPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  farmSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },

  weatherBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryTint,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.greenBorder,
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weatherTemp: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  weatherCond: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
    marginTop: 1,
  },
  weatherRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  weatherMetric: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
  },

  sectionWrap: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  moduleList: {
    gap: 8,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  moduleIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  pillBadge: {
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  moduleDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },

  tutorialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E7F3EB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C6E2D0',
    marginTop: 6,
  },
  playIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  tutorialSub: {
    fontSize: 11,
    color: '#278449',
    marginTop: 1,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalSheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  modalSheetSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  modalForm: {
    gap: 10,
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: -2,
  },
  staticField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAF8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  staticFieldText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  textInput: {
    backgroundColor: '#F8FAF8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: colors.text,
  },
  reasonsList: {
    gap: 6,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  reasonOptionActive: {
    backgroundColor: '#E7F3EB',
    borderColor: colors.primary,
  },
  reasonText: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  reasonTextActive: {
    fontWeight: '700',
    color: colors.primary,
  },
  tierRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tierCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  tierCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#E7F3EB',
  },
  tierName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  tierPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  tierSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  bookSubmitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  bookSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Success view
  successWrap: {
    alignItems: 'center',
    gap: 10,
    paddingBottom: 20,
  },
  successIconWrap: {
    marginTop: 8,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  refPill: {
    backgroundColor: '#E7F3EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.greenBorder,
  },
  refPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  successMsg: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  visitSummaryCard: {
    width: '100%',
    backgroundColor: '#F8FAF8',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    marginTop: 6,
  },
  visitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  vLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  vVal: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  phoneNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E7F3EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  phoneNoticeText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  doneBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
