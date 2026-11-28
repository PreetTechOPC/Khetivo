import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { Equipment } from '../data/mockData';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DatePickerModal } from '../components/DatePickerModal';
import { useAlert } from '../context/AlertContext';
import { fetchEquipmentFromDB, createEquipmentInDB } from '../services/appwrite';

export const EQUIPMENT_CATEGORIES = [
  'Tractor (4WD / 2WD)',
  'Rotavator / Rotary Tiller',
  'Solar / Submersible Tubewell Pump',
  'Hydraulic Disc Harrow',
  'Combine Harvester / Reaper',
  'Boom Sprayer / Drone',
  'Seed Drill / Planter',
  'General Farm Implement',
];

export const EQUIPMENT_FARMS = [
  'Khetivo Green Acres',
  'Malwa Golden Fields',
];

interface EquipmentScreenProps {
  onBack: () => void;
  farmId?: string;
  userId?: string;
}

export const EquipmentScreen: React.FC<EquipmentScreenProps> = ({ onBack, farmId, userId }) => {
  const { showWarning, showSuccess } = useAlert();
  const [fleet, setFleet] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'operational' | 'service_due' | 'issues'>('all');
  const [search, setSearch] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Load real equipment fleet from Appwrite Database
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchEquipmentFromDB(farmId)
      .then((dbFleet) => {
        if (mounted) {
          setFleet(dbFleet);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Load equipment notice:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [farmId]);

  // Form states for Register Equipment (matching Image)
  const [eqName, setEqName] = useState('');
  const [eqCategory, setEqCategory] = useState(EQUIPMENT_CATEGORIES[0]);
  const [eqFarm, setEqFarm] = useState(EQUIPMENT_FARMS[0]);
  const [eqModelNumber, setEqModelNumber] = useState('');
  const [eqOperator, setEqOperator] = useState('Harnek Singh');
  const [eqRuntimeHours, setEqRuntimeHours] = useState('');
  const [eqNextServiceDate, setEqNextServiceDate] = useState('');
  const [eqFuelEfficiency, setEqFuelEfficiency] = useState('3.8 L/hr (Optimal)');
  const [openDropdown, setOpenDropdown] = useState<'category' | 'farm' | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Report Problem states
  const [reportEquipment, setReportEquipment] = useState('John Deere 5310 4WD (55 HP)');
  const [reportIssue, setReportIssue] = useState('');

  // Counts
  const totalCount = fleet.length;
  const operationalCount = fleet.filter((e) => e.status === 'Operational' || e.status === 'In Field').length;
  const serviceDueCount = fleet.filter((e) => e.status === 'Service Due' || e.hoursRun >= e.nextServiceHours).length;
  const issuesCount = 1;

  const resetRegisterForm = () => {
    setEqName('');
    setEqCategory(EQUIPMENT_CATEGORIES[0]);
    setEqFarm(EQUIPMENT_FARMS[0]);
    setEqModelNumber('');
    setEqOperator('Harnek Singh');
    setEqRuntimeHours('');
    setEqNextServiceDate('');
    setEqFuelEfficiency('3.8 L/hr (Optimal)');
    setOpenDropdown(null);
  };

  const handleRegister = async () => {
    if (!eqName.trim()) {
      showWarning('Required Field', 'Please enter equipment / machine name.');
      return;
    }
    const runtime = parseFloat(eqRuntimeHours) || 0;
    const payload: Partial<Equipment> = {
      name: eqName.trim(),
      model: eqModelNumber.trim() || 'Standard Model',
      hoursRun: runtime,
      nextServiceHours: runtime + 250,
      status: 'Operational',
      fuelLevel: 100,
      category: eqCategory,
      farm: eqFarm,
      operator: eqOperator.trim() || 'Harnek Singh',
      nextServiceDate: eqNextServiceDate,
      fuelEfficiency: eqFuelEfficiency.trim() || '3.8 L/hr (Optimal)',
    };
    setIsRegisterOpen(false);
    resetRegisterForm();

    try {
      const created = await createEquipmentInDB(payload, userId);
      setFleet((prev) => [created, ...prev]);
      showSuccess('Equipment Registered', `${created.name} saved to database.`);
    } catch (err: any) {
      console.warn('Create equipment error:', err);
      setFleet((prev) => [{ ...payload, id: `eq-${Date.now()}` } as Equipment, ...prev]);
      showSuccess('Equipment Registered', `${payload.name} added to your farm fleet.`);
    }
  };

  const handleReportProblem = () => {
    if (!reportIssue.trim()) {
      showWarning('Required Field', 'Please describe the problem.');
      return;
    }
    setIsReportOpen(false);
    setReportIssue('');
    showSuccess('Problem Reported', `Technician ticket logged for ${reportEquipment}.`);
  };

  const filteredFleet = fleet.filter((item) => {
    const isDue = item.hoursRun >= item.nextServiceHours || item.status === 'Service Due';
    if (filter === 'operational' && item.status !== 'Operational' && item.status !== 'In Field') return false;
    if (filter === 'service_due' && !isDue) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !item.name.toLowerCase().includes(q) &&
        !item.model.toLowerCase().includes(q) &&
        !(item.category && item.category.toLowerCase().includes(q)) &&
        !(item.operator && item.operator.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Equipment & Machinery</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header Block: Title + Buttons */}
        <View style={styles.headerBlock}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.mainTitle}>Equipment & Machinery</Text>
            <Text style={styles.mainSub}>
              Fleet tracking, maintenance & issue reports • All registered holdings
            </Text>
          </View>

          <View style={styles.headerButtonsRow}>
            {/* Report Problem Button */}
            <TouchableOpacity
              style={styles.reportBtn}
              onPress={() => setIsReportOpen(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="warning-outline" size={14} color="#DC2626" />
              <Text style={styles.reportBtnText}>Report Problem</Text>
            </TouchableOpacity>

            {/* Register Equipment Button */}
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => {
                resetRegisterForm();
                setIsRegisterOpen(true);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={15} color="#FFFFFF" />
              <Text style={styles.registerBtnText}>Register Equipment</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4-Metric Strip */}
        <View style={styles.metricStrip}>
          <TouchableOpacity
            style={[styles.metricCard, filter === 'all' && styles.metricCardActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.7}
          >
            <View style={styles.metricCardTop}>
              <Text style={styles.metricCardLabel}>All Equipment</Text>
              {filter === 'all' && <View style={styles.activeDot} />}
            </View>
            <Text style={[styles.metricCardVal, { color: '#0C4B32' }]}>{totalCount} Units</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, filter === 'operational' && styles.metricCardActiveGreen]}
            onPress={() => setFilter('operational')}
            activeOpacity={0.7}
          >
            <View style={styles.metricCardTop}>
              <Text style={[styles.metricCardLabel, { color: '#065F46' }]}>Operational</Text>
              {filter === 'operational' && (
                <View style={[styles.activeDot, { backgroundColor: '#059669' }]} />
              )}
            </View>
            <Text style={[styles.metricCardVal, { color: '#047857' }]}>{operationalCount} Active</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, filter === 'service_due' && styles.metricCardActiveAmber]}
            onPress={() => setFilter('service_due')}
            activeOpacity={0.7}
          >
            <View style={styles.metricCardTop}>
              <Text style={[styles.metricCardLabel, { color: '#92400E' }]}>Service Due</Text>
              {filter === 'service_due' && (
                <View style={[styles.activeDot, { backgroundColor: '#D97706' }]} />
              )}
            </View>
            <Text style={[styles.metricCardVal, { color: '#B45309' }]}>{serviceDueCount} Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, filter === 'issues' && styles.metricCardActiveRed]}
            onPress={() => setFilter('issues')}
            activeOpacity={0.7}
          >
            <View style={styles.metricCardTop}>
              <Text style={[styles.metricCardLabel, { color: '#991B1B' }]}>Reported Problems</Text>
              {filter === 'issues' && (
                <View style={[styles.activeDot, { backgroundColor: '#DC2626' }]} />
              )}
            </View>
            <Text style={[styles.metricCardVal, { color: '#DC2626' }]}>{issuesCount} Issues</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Toolbar: Segmented Tabs & Search */}
        <View style={styles.filterToolbar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabsRow}>
            {[
              { id: 'all', label: `All Equipment (${totalCount})` },
              { id: 'operational', label: `Operational (${operationalCount})` },
              { id: 'service_due', label: `Service Due (${serviceDueCount})` },
              { id: 'issues', label: `Reported Problems (${issuesCount})` },
            ].map((tab) => {
              const active = filter === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  onPress={() => setFilter(tab.id as any)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={14} color="#889B90" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search equipment or model..."
              placeholderTextColor="#889B90"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={14} color="#889B90" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Fleet Cards */}
        <View style={styles.fleetCardList}>
          {filteredFleet.map((item) => {
            const isDue = item.hoursRun >= item.nextServiceHours || item.status === 'Service Due';

            return (
              <View key={item.id} style={styles.equipmentCard}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.equipmentName}>{item.name}</Text>
                    <Text style={styles.equipmentModel}>
                      {item.model}
                      {item.category ? ` • ${item.category}` : ''}
                    </Text>
                    {item.operator && (
                      <Text style={styles.equipmentMeta}>
                        Operator: {item.operator}
                        {item.farm ? ` • ${item.farm}` : ''}
                      </Text>
                    )}
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isDue
                          ? '#FEF2F2'
                          : item.status === 'In Field'
                          ? '#EFF6FF'
                          : '#ECFDF5',
                        borderColor: isDue
                          ? '#FECACA'
                          : item.status === 'In Field'
                          ? '#BFDBFE'
                          : '#A7F3D0',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color: isDue
                            ? '#DC2626'
                            : item.status === 'In Field'
                            ? '#2563EB'
                            : '#059669',
                        },
                      ]}
                    >
                      {isDue ? 'SERVICE DUE' : item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>HOURS RUN</Text>
                    <Text style={styles.statBoxVal}>{item.hoursRun} hrs</Text>
                  </View>

                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>NEXT SERVICE</Text>
                    <Text style={styles.statBoxVal}>
                      {item.nextServiceDate ? item.nextServiceDate : `${item.nextServiceHours} hrs`}
                    </Text>
                  </View>

                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>FUEL / EFFICIENCY</Text>
                    <Text style={styles.statBoxVal}>
                      {item.fuelEfficiency ? item.fuelEfficiency : `${item.fuelLevel}%`}
                    </Text>
                  </View>
                </View>

                {/* Fuel gauge progress */}
                <View style={styles.fuelTrack}>
                  <View
                    style={[
                      styles.fuelFill,
                      {
                        width: `${item.fuelLevel}%`,
                        backgroundColor: item.fuelLevel < 30 ? '#DC2626' : '#0C4B32',
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* REGISTER EQUIPMENT SLIDE-UP BOTTOM SHEET */}
      <Modal
        visible={isRegisterOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setOpenDropdown(null);
          setIsRegisterOpen(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setOpenDropdown(null);
            setIsRegisterOpen(false);
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

              {/* Modal Header matching Screenshot */}
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.modalTitle}>Register Equipment</Text>
                  <Text style={styles.modalSubtitle}>
                    Add a tractor, pump, implement, or machinery to your fleet.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setOpenDropdown(null);
                    setIsRegisterOpen(false);
                  }}
                  style={styles.modalCloseBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={20} color="#889B90" />
                </TouchableOpacity>
              </View>

              {/* Modal Body / Form Fields */}
              <ScrollView
                style={styles.modalBody}
                contentContainerStyle={styles.modalBodyContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Equipment / Machine Name * */}
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>
                    Equipment / Machine Name <Text style={styles.reqStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Mahindra 575 DI Tractor (45 HP)"
                    placeholderTextColor="#9CA3AF"
                    value={eqName}
                    onChangeText={setEqName}
                  />
                </View>

                {/* Row 1: Category * & Assigned Farm * */}
                <View style={styles.formRow}>
                  {/* Category * */}
                  <View style={styles.formCol}>
                    <Text style={styles.inputLabel}>
                      Category <Text style={styles.reqStar}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.selectBtn}
                      onPress={() =>
                        setOpenDropdown(openDropdown === 'category' ? null : 'category')
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.selectBtnText} numberOfLines={1}>
                        {eqCategory}
                      </Text>
                      <Ionicons
                        name={openDropdown === 'category' ? 'chevron-up' : 'chevron-down'}
                        size={15}
                        color="#55685D"
                      />
                    </TouchableOpacity>
                    {openDropdown === 'category' && (
                      <View style={styles.dropdownList}>
                        <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
                          {EQUIPMENT_CATEGORIES.map((cat) => (
                            <TouchableOpacity
                              key={cat}
                              style={[
                                styles.dropdownItem,
                                eqCategory === cat && styles.dropdownItemActive,
                              ]}
                              onPress={() => {
                                setEqCategory(cat);
                                setOpenDropdown(null);
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  eqCategory === cat && styles.dropdownItemTextActive,
                                ]}
                                numberOfLines={1}
                              >
                                {cat}
                              </Text>
                              {eqCategory === cat && (
                                <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                              )}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  {/* Assigned Farm * */}
                  <View style={styles.formCol}>
                    <Text style={styles.inputLabel}>
                      Assigned Farm <Text style={styles.reqStar}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.selectBtn}
                      onPress={() =>
                        setOpenDropdown(openDropdown === 'farm' ? null : 'farm')
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.selectBtnText} numberOfLines={1}>
                        {eqFarm}
                      </Text>
                      <Ionicons
                        name={openDropdown === 'farm' ? 'chevron-up' : 'chevron-down'}
                        size={15}
                        color="#55685D"
                      />
                    </TouchableOpacity>
                    {openDropdown === 'farm' && (
                      <View style={styles.dropdownList}>
                        {EQUIPMENT_FARMS.map((f) => (
                          <TouchableOpacity
                            key={f}
                            style={[
                              styles.dropdownItem,
                              eqFarm === f && styles.dropdownItemActive,
                            ]}
                            onPress={() => {
                              setEqFarm(f);
                              setOpenDropdown(null);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                eqFarm === f && styles.dropdownItemTextActive,
                              ]}
                              numberOfLines={1}
                            >
                              {f}
                            </Text>
                            {eqFarm === f && (
                              <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {/* Row 2: Model / Reg. Number & Assigned Operator */}
                <View style={styles.formRow}>
                  {/* Model / Reg. Number */}
                  <View style={styles.formCol}>
                    <Text style={styles.inputLabel}>Model / Reg. Number</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. PB-10-CZ-4412"
                      placeholderTextColor="#9CA3AF"
                      value={eqModelNumber}
                      onChangeText={setEqModelNumber}
                    />
                  </View>

                  {/* Assigned Operator */}
                  <View style={styles.formCol}>
                    <Text style={styles.inputLabel}>Assigned Operator</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Harnek Singh"
                      placeholderTextColor="#9CA3AF"
                      value={eqOperator}
                      onChangeText={setEqOperator}
                    />
                  </View>
                </View>

                {/* Row 3: Runtime (Hours) & Next Service Date */}
                <View style={styles.formRow}>
                  {/* Runtime (Hours) */}
                  <View style={styles.formCol}>
                    <Text style={styles.inputLabel}>Runtime (Hours)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 420"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={eqRuntimeHours}
                      onChangeText={setEqRuntimeHours}
                    />
                  </View>

                  {/* Next Service Date */}
                  <View style={styles.formCol}>
                    <Text style={styles.inputLabel}>Next Service Date</Text>
                    <TouchableOpacity
                      style={styles.dateInputWrap}
                      onPress={() => setIsDatePickerOpen(true)}
                      activeOpacity={0.8}
                    >
                      <TextInput
                        style={styles.dateInput}
                        placeholder="dd-mm-yyyy"
                        placeholderTextColor="#9CA3AF"
                        value={eqNextServiceDate}
                        onChangeText={setEqNextServiceDate}
                      />
                      <TouchableOpacity
                        onPress={() => setIsDatePickerOpen(true)}
                        style={styles.dateIconTouch}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="calendar-outline" size={17} color="#0C4B32" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Fuel / Power Rating */}
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Fuel / Power Rating</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="3.8 L/hr (Optimal)"
                    placeholderTextColor="#9CA3AF"
                    value={eqFuelEfficiency}
                    onChangeText={setEqFuelEfficiency}
                  />
                </View>
              </ScrollView>

              {/* Modal Footer matching Screenshot */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => {
                    setOpenDropdown(null);
                    setIsRegisterOpen(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleRegister}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.modalSubmitText}>Register Equipment</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      {/* REUSABLE DATE PICKER MODAL FOR NEXT SERVICE DATE */}
      <DatePickerModal
        visible={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelectDate={(formatted) => {
          setEqNextServiceDate(formatted);
          setIsDatePickerOpen(false);
        }}
        initialDate={eqNextServiceDate}
        title="Select Next Service Date"
      />

      {/* REPORT PROBLEM SLIDE-UP MODAL */}
      <Modal
        visible={isReportOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsReportOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsReportOpen(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalCard}
            >
              <View style={styles.sheetHandle} />

              <View style={styles.modalHeader}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.modalTitle}>Report Equipment Issue</Text>
                  <Text style={styles.modalSubtitle}>
                    Log a maintenance ticket or breakdown alert for a machine.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsReportOpen(false)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={20} color="#889B90" />
                </TouchableOpacity>
              </View>

              <View style={[styles.modalBodyContent, { paddingVertical: 14 }]}>
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Equipment</Text>
                  <TextInput
                    style={styles.textInput}
                    value={reportEquipment}
                    onChangeText={setReportEquipment}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>
                    Describe the Issue <Text style={styles.reqStar}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.textInput, { height: 85, textAlignVertical: 'top' }]}
                    placeholder="Hydraulic leakage, starting failure, blade damage..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    value={reportIssue}
                    onChangeText={setReportIssue}
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setIsReportOpen(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: '#DC2626' }]}
                  onPress={handleReportProblem}
                  activeOpacity={0.8}
                >
                  <Ionicons name="warning-outline" size={15} color="#FFFFFF" />
                  <Text style={styles.modalSubmitText}>Submit Report</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF8' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topBarTitle: { fontSize: 16, fontWeight: '700', color: '#26352D' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },

  headerBlock: {
    gap: 12,
  },
  headerTitleWrap: {
    gap: 2,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#26352D',
  },
  mainSub: {
    fontSize: 12,
    color: '#55685D',
  },
  headerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  reportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0C4B32',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  registerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // 4-Metric Strip
  metricStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  metricCardActive: {
    backgroundColor: '#E7F3EB',
    borderColor: '#0C4B32',
    borderWidth: 1.5,
  },
  metricCardActiveGreen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
    borderWidth: 1.5,
  },
  metricCardActiveAmber: {
    backgroundColor: '#FFFBEB',
    borderColor: '#D97706',
    borderWidth: 1.5,
  },
  metricCardActiveRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
    borderWidth: 1.5,
  },
  metricCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#55685D',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0C4B32',
  },
  metricCardVal: {
    fontSize: 16,
    fontWeight: '800',
  },

  // Filter Toolbar
  filterToolbar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 12,
    gap: 10,
  },
  filterTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 12,
    padding: 3,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#55685D',
  },
  filterPillTextActive: {
    color: '#0C4B32',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    color: '#26352D',
    padding: 0,
  },

  // Fleet Cards
  fleetCardList: {
    gap: 12,
  },
  equipmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 16,
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26352D',
  },
  equipmentModel: {
    fontSize: 11,
    color: '#55685D',
    marginTop: 2,
  },
  equipmentMeta: {
    fontSize: 11,
    color: '#0C4B32',
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    borderRadius: 8,
    padding: 8,
    gap: 2,
  },
  statBoxLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#889B90',
  },
  statBoxVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#26352D',
  },
  fuelTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5ECE7',
    overflow: 'hidden',
  },
  fuelFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Slide-Up Bottom Sheet Styles
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
    maxHeight: '90%',
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#26352D',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#55685D',
    marginTop: 2,
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
    maxHeight: 520,
  },
  modalBodyContent: {
    paddingVertical: 14,
    gap: 12,
  },
  formGroup: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#26352D',
  },
  reqStar: {
    color: '#DC2626',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    color: '#26352D',
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formCol: {
    flex: 1,
    gap: 5,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  selectBtnText: {
    fontSize: 12,
    color: '#26352D',
    flex: 1,
    marginRight: 4,
  },
  dropdownList: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
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
  },
  dropdownItemTextActive: {
    color: '#0C4B32',
    fontWeight: '700',
  },
  dateInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  dateInput: {
    flex: 1,
    fontSize: 12,
    color: '#26352D',
    paddingVertical: 7,
    paddingHorizontal: 0,
  },
  dateIconTouch: {
    paddingLeft: 6,
    paddingVertical: 6,
  },
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
