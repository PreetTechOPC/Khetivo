import React, { useState } from 'react';
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
} from 'react-native';
import { colors } from '../theme/colors';
import { initialFarms } from '../data/mockData';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { DatePickerModal } from '../components/DatePickerModal';
import { useAlert } from '../context/AlertContext';
import { createTransactionInDB, deleteTransactionInDB } from '../services/appwrite';

interface LedgerScreenProps {
  onBack: () => void;
  transactions?: FinancialTransaction[];
  onAddTransaction?: (tx: FinancialTransaction) => void;
  onDeleteTransaction?: (id: string) => void;
  userId?: string;
}

export interface FinancialTransaction {
  id: string;
  type: 'production' | 'loss' | 'expense';
  title: string;
  category: string;
  amount: number;
  date: string;
  farmId: string;
  farmName: string;
  crop?: string;
  quantity?: string;
  status: string;
  reference?: string;
  notes?: string;
}

export const PRODUCTION_CATEGORIES = [
  'Grain Mandi Sale (APMC)',
  'Wholesale Market Dispatch',
  'Direct Retail / Farm Gate Supply',
  'Contract Silage & Dairy Supply',
  'Green Fodder Realization',
  'Government MSP Procurement',
  'Certified Seed Multiplier Sale',
];

export const LOSS_CATEGORIES = [
  'Weather: Unseasonal Rain & Hail',
  'Weather: Wind Lodging & Flattening',
  'Weather: Frost Burn & Cold Wave',
  'Pest & Insect Infestation',
  'Disease: Leaf Blight & Rot',
  'Post-Harvest Storage Spoilage',
  'Transit Wastage & Handling Loss',
];

export const EXPENSE_CATEGORIES = [
  'Seeds & Nursery',
  'Fertilizers & Nutrients',
  'Diesel & Equipment Fuel',
  'Seasonal Labor Wages',
  'Crop Protection & Pesticides',
  'Irrigation & Electricity Bills',
  'Machinery Spares & Repairs',
  'Packaging & Transport',
];

export const ASSOCIATED_CROPS = [
  'Wheat',
  'Paddy / Rice',
  'Mustard',
  'Potato',
  'Bt Cotton',
  'Maize / Corn',
  'Sugarcane',
  'Green Fodder',
  'Whole Farm / General',
];

export const SETTLEMENT_STATUSES = [
  'Cleared / Received ✓',
  'Pending Payment',
  'Insurance Claim Filed',
  'Recorded (Internal Log)',
];

const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'tx-1',
    type: 'production',
    title: 'Wheat (HD-3086) 90 Qtl Mandi Sale',
    category: 'Grain Mandi Sale (APMC)',
    amount: 225000,
    date: '2026-10-24',
    farmId: 'farm-1',
    farmName: 'Khetivo Green Acres',
    crop: 'Wheat',
    quantity: '90 Quintals @ ₹2,500/Qtl',
    status: 'Cleared / Received ✓',
    reference: 'MANDI-8812',
    notes: 'Direct APMC Mandi payment cleared via RTGS',
  },
  {
    id: 'tx-2',
    type: 'expense',
    title: 'Certified PBW-826 & DBW-187 Seed Bags (PAU)',
    category: 'Seeds & Nursery',
    amount: 48500,
    date: '2026-11-01',
    farmId: 'farm-1',
    farmName: 'Khetivo Green Acres',
    crop: 'Wheat',
    quantity: '18 Bags (40kg ea)',
    status: 'Cleared / Received ✓',
    reference: 'PAU-SEED-102',
  },
  {
    id: 'tx-3',
    type: 'expense',
    title: 'Basal DAP 50 bags + MOP 20 bags from Co-op Society',
    category: 'Fertilizers & Nutrients',
    amount: 89200,
    date: '2026-11-03',
    farmId: 'farm-1',
    farmName: 'Khetivo Green Acres',
    crop: 'Wheat',
    quantity: '70 Bags Total',
    status: 'Cleared / Received ✓',
    reference: 'COOP-INV-554',
  },
  {
    id: 'tx-4',
    type: 'expense',
    title: 'Diesel for Land Preparation & Laser Leveling (650L)',
    category: 'Diesel & Equipment Fuel',
    amount: 32400,
    date: '2026-11-05',
    farmId: 'farm-2',
    farmName: 'Malwa Golden Fields',
    crop: 'Mustard',
    quantity: '650 Litres',
    status: 'Cleared / Received ✓',
    reference: 'HPCL-PUMP-44',
  },
  {
    id: 'tx-5',
    type: 'loss',
    title: 'Unseasonal heavy shower led to lodging in parcel B',
    category: 'Weather: Unseasonal Rain & Hail',
    amount: 18500,
    date: '2026-11-07',
    farmId: 'farm-1',
    farmName: 'Khetivo Green Acres',
    crop: 'Wheat',
    quantity: '1.8 Acres Affected',
    status: 'Insurance Claim Filed',
    reference: 'CLAIM-PMFBY-99',
    notes: 'Filed survey with local patwari and crop insurance inspector.',
  },
];

export const LedgerScreen: React.FC<LedgerScreenProps> = ({
  onBack,
  transactions: propTransactions,
  onAddTransaction,
  onDeleteTransaction,
  userId = 'usr_default_farmer',
}) => {
  const { showDeleteConfirm, showWarning, showSuccess } = useAlert();
  const [internalTransactions, setInternalTransactions] = useState<FinancialTransaction[]>(INITIAL_TRANSACTIONS);
  const transactions = propTransactions !== undefined ? propTransactions : internalTransactions;
  const setTransactions = (updater: React.SetStateAction<FinancialTransaction[]>) => {
    setInternalTransactions(updater);
  };
  const [filterType, setFilterType] = useState<'all' | 'production' | 'loss' | 'expense'>('all');
  const [farmFilter, setFarmFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Record Entry Modal Form States (Exact Match with Image)
  const [modalOpen, setModalOpen] = useState(false);
  const [recordType, setRecordType] = useState<'production' | 'loss' | 'expense'>('production');
  const [recordAmount, setRecordAmount] = useState('');
  const [recordFarmId, setRecordFarmId] = useState('farm-1');
  const [recordTitle, setRecordTitle] = useState('');
  const [recordCategory, setRecordCategory] = useState(PRODUCTION_CATEGORIES[0]);
  const [recordCrop, setRecordCrop] = useState('Wheat');
  const [recordQuantity, setRecordQuantity] = useState('');
  const [recordDate, setRecordDate] = useState('12-11-2026');
  const [recordStatus, setRecordStatus] = useState(SETTLEMENT_STATUSES[0]);
  const [recordReference, setRecordReference] = useState('');
  const [recordNotes, setRecordNotes] = useState('');

  // Dropdown & DatePicker states
  const [openDropdown, setOpenDropdown] = useState<'farm' | 'category' | 'crop' | 'status' | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Compute Aggregates
  const farmScoped = transactions.filter((tx) => {
    if (farmFilter !== 'all' && tx.farmId !== farmFilter) return false;
    return true;
  });

  const totalProduction = farmScoped
    .filter((tx) => tx.type === 'production')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalLosses = farmScoped
    .filter((tx) => tx.type === 'loss')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = farmScoped
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netRealization = totalProduction - totalLosses - totalExpenses;

  // Filtered List
  const visibleTransactions = farmScoped.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.title.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        (tx.crop && tx.crop.toLowerCase().includes(q)) ||
        tx.farmName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const resetForm = () => {
    setRecordType('production');
    setRecordAmount('');
    setRecordFarmId('farm-1');
    setRecordTitle('');
    setRecordCategory(PRODUCTION_CATEGORIES[0]);
    setRecordCrop('Wheat');
    setRecordQuantity('');
    setRecordDate('12-11-2026');
    setRecordStatus(SETTLEMENT_STATUSES[0]);
    setRecordReference('');
    setRecordNotes('');
    setOpenDropdown(null);
  };

  const handleRecordTypeChange = (type: 'production' | 'loss' | 'expense') => {
    setRecordType(type);
    if (type === 'production') setRecordCategory(PRODUCTION_CATEGORIES[0]);
    else if (type === 'loss') setRecordCategory(LOSS_CATEGORIES[0]);
    else setRecordCategory(EXPENSE_CATEGORIES[0]);
    setOpenDropdown(null);
  };

  const handleDeleteTransaction = (id: string) => {
    showDeleteConfirm(
      'Delete Record',
      'Are you sure you want to remove this financial transaction from farm records?',
      async () => {
        if (onDeleteTransaction) {
          onDeleteTransaction(id);
        } else {
          setTransactions(transactions.filter((tx) => tx.id !== id));
          try {
            await deleteTransactionInDB(id);
          } catch (e) {
            console.warn('Appwrite delete transaction error:', e);
          }
        }
      }
    );
  };

  const handleSaveTransaction = async () => {
    if (!recordAmount.trim()) {
      showWarning('Required Field', 'Please enter transaction amount.');
      return;
    }

    const amt = parseFloat(recordAmount);
    if (isNaN(amt) || amt <= 0) {
      showWarning('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }

    const targetFarm = initialFarms.find((f) => f.id === recordFarmId) || initialFarms[0];

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      type: recordType,
      title: recordTitle.trim() || `${recordCategory} (${recordCrop})`,
      category: recordCategory,
      amount: amt,
      date: recordDate || '12-11-2026',
      farmId: targetFarm.id,
      farmName: targetFarm.name,
      crop: recordCrop,
      quantity: recordQuantity.trim() || undefined,
      status: recordStatus,
      reference: recordReference.trim() || `MANDI-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: recordNotes.trim() || undefined,
    };

    if (onAddTransaction) {
      onAddTransaction(newTx);
    } else {
      setTransactions([newTx, ...transactions]);
      try {
        const created = await createTransactionInDB(newTx, userId);
        if (created && created.id) {
          setTransactions((prev) => prev.map((t) => (t.id === newTx.id ? { ...t, id: created.id } : t)));
        }
      } catch (e) {
        console.warn('Appwrite create transaction error:', e);
      }
    }
    resetForm();
    setModalOpen(false);
    showSuccess('Saved', 'Financial entry recorded successfully in farm ledger.');
  };

  const selectedFarm = initialFarms.find((f) => f.id === recordFarmId) || initialFarms[0];

  const currentCategories =
    recordType === 'production'
      ? PRODUCTION_CATEGORIES
      : recordType === 'loss'
      ? LOSS_CATEGORIES
      : EXPENSE_CATEGORIES;

  return (
    <View style={styles.container}>
      {/* 1. Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Stats</Text>
          <Text style={styles.headerSub}>
            Production, losses & expenses • All registered holdings
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            resetForm();
            setModalOpen(true);
          }}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={15} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Record</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 2. Interactive 4-Metric Strip */}
        <View style={styles.metricsGrid}>
          {/* Card 1: Net Realization */}
          <TouchableOpacity
            style={[styles.metricCard, filterType === 'all' && styles.metricCardActiveAll]}
            onPress={() => setFilterType('all')}
            activeOpacity={0.7}
          >
            <View style={styles.metricCardHeader}>
              <Text style={styles.metricCardLabel}>Net Balance</Text>
              {filterType === 'all' && <View style={styles.metricDotGreen} />}
            </View>
            <Text style={[styles.metricCardValue, { color: netRealization >= 0 ? '#0C4B32' : '#DC2626' }]}>
              ₹{netRealization.toLocaleString()}
            </Text>
          </TouchableOpacity>

          {/* Card 2: Production (+) */}
          <TouchableOpacity
            style={[styles.metricCard, filterType === 'production' && styles.metricCardActiveProd]}
            onPress={() => setFilterType('production')}
            activeOpacity={0.7}
          >
            <View style={styles.metricCardHeader}>
              <Text style={[styles.metricCardLabel, { color: '#065F46' }]}>Production (+)</Text>
              {filterType === 'production' && <View style={styles.metricDotEmerald} />}
            </View>
            <Text style={[styles.metricCardValue, { color: '#047857' }]}>
              ₹{totalProduction.toLocaleString()}
            </Text>
          </TouchableOpacity>

          {/* Card 3: Crop Loss (-) */}
          <TouchableOpacity
            style={[styles.metricCard, filterType === 'loss' && styles.metricCardActiveLoss]}
            onPress={() => setFilterType('loss')}
            activeOpacity={0.7}
          >
            <View style={styles.metricCardHeader}>
              <Text style={[styles.metricCardLabel, { color: '#92400E' }]}>Crop Loss (−)</Text>
              {filterType === 'loss' && <View style={styles.metricDotAmber} />}
            </View>
            <Text style={[styles.metricCardValue, { color: '#B45309' }]}>
              ₹{totalLosses.toLocaleString()}
            </Text>
          </TouchableOpacity>

          {/* Card 4: Expense (-) */}
          <TouchableOpacity
            style={[styles.metricCard, filterType === 'expense' && styles.metricCardActiveExp]}
            onPress={() => setFilterType('expense')}
            activeOpacity={0.7}
          >
            <View style={styles.metricCardHeader}>
              <Text style={[styles.metricCardLabel, { color: '#991B1B' }]}>Expense (−)</Text>
              {filterType === 'expense' && <View style={styles.metricDotRed} />}
            </View>
            <Text style={[styles.metricCardValue, { color: '#DC2626' }]}>
              ₹{totalExpenses.toLocaleString()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Filter Toolbar */}
        <View style={styles.filterCard}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.segmentedScroll}
            contentContainerStyle={styles.segmentedContent}
          >
            {[
              { id: 'all', label: `All Transactions (${transactions.length})` },
              { id: 'production', label: `Production (${transactions.filter((t) => t.type === 'production').length})` },
              { id: 'loss', label: `Losses (${transactions.filter((t) => t.type === 'loss').length})` },
              { id: 'expense', label: `Expenses (${transactions.filter((t) => t.type === 'expense').length})` },
            ].map((tab) => {
              const active = filterType === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.segmentBtn, active && styles.segmentBtnActiveWhite]}
                  onPress={() => setFilterType(tab.id as any)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentBtnText, active && styles.segmentBtnTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.searchRow}>
            <View style={styles.farmFilterPills}>
              <TouchableOpacity
                style={[styles.farmPill, farmFilter === 'all' && styles.farmPillActive]}
                onPress={() => setFarmFilter('all')}
              >
                <Text style={[styles.farmPillText, farmFilter === 'all' && styles.farmPillTextActive]}>
                  All Holdings
                </Text>
              </TouchableOpacity>
              {initialFarms.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.farmPill, farmFilter === f.id && styles.farmPillActive]}
                  onPress={() => setFarmFilter(f.id)}
                >
                  <Text style={[styles.farmPillText, farmFilter === f.id && styles.farmPillTextActive]}>
                    {f.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={15} color="#889B90" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search ledger by crop, title, category..."
                placeholderTextColor="#889B90"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={15} color="#889B90" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* 4. Ledger List */}
        <View style={styles.ledgerCard}>
          {visibleTransactions.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="book-open-outline" size={32} color="#889B90" />
              <Text style={styles.emptyText}>No financial records found.</Text>
            </View>
          ) : (
            visibleTransactions.map((tx, idx) => {
              const isProd = tx.type === 'production';
              const isLoss = tx.type === 'loss';
              const sign = isProd ? '+' : '-';
              const amountColor = isProd ? '#047857' : isLoss ? '#B45309' : '#DC2626';

              return (
                <View
                  key={tx.id}
                  style={[
                    styles.txRow,
                    idx < visibleTransactions.length - 1 && styles.txRowDivider,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.txTopLine}>
                      <View
                        style={[
                          styles.typeBadge,
                          isProd
                            ? styles.typeBadgeProd
                            : isLoss
                            ? styles.typeBadgeLoss
                            : styles.typeBadgeExp,
                        ]}
                      >
                        <Text
                          style={[
                            styles.typeBadgeText,
                            {
                              color: isProd
                                ? '#047857'
                                : isLoss
                                ? '#B45309'
                                : '#DC2626',
                            },
                          ]}
                        >
                          {tx.type.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.txTitle}>{tx.title}</Text>
                    </View>

                    <Text style={styles.txMetaLine}>
                      {tx.category} • {tx.crop ? `${tx.crop} • ` : ''}{tx.date}
                      {tx.quantity ? ` • ${tx.quantity}` : ''}
                    </Text>
                    <Text style={styles.txFarmLine}>
                      {tx.farmName} {tx.reference ? `• Ref: ${tx.reference}` : ''}
                    </Text>
                    {tx.notes && (
                      <Text style={styles.txNotesLine} numberOfLines={1}>
                        Note: {tx.notes}
                      </Text>
                    )}
                  </View>

                  <View style={styles.txRightCol}>
                    <Text style={[styles.txAmount, { color: amountColor }]}>
                      {sign}₹{tx.amount.toLocaleString()}
                    </Text>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>{tx.status}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteTransaction(tx.id)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={14} color="#889B90" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ========================================================================= */}
      {/* RECORD FINANCIAL ENTRY SLIDE-UP BOTTOM SHEET (Exact Match with Image)     */}
      {/* ========================================================================= */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setOpenDropdown(null);
          setModalOpen(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setOpenDropdown(null);
            setModalOpen(false);
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
                <View style={styles.modalIconWrap}>
                  <MaterialCommunityIcons name="cash-multiple" size={20} color="#0C4B32" />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.modalTitle}>Record Financial Entry</Text>
                  <Text style={styles.modalSubtitle}>
                    Log harvest production revenue, weather/pest crop losses, or operational input expenses.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setOpenDropdown(null);
                    setModalOpen(false);
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
                {/* 1. Record Type * */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Record Type <Text style={styles.reqStar}>*</Text>
                  </Text>
                  <View style={styles.typeSelectorRow}>
                    <TouchableOpacity
                      style={[
                        styles.typePill,
                        recordType === 'production' && styles.typePillProdActive,
                      ]}
                      onPress={() => handleRecordTypeChange('production')}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.typePillText,
                          recordType === 'production' && styles.typePillTextProdActive,
                        ]}
                      >
                        Production (+)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.typePill,
                        recordType === 'loss' && styles.typePillLossActive,
                      ]}
                      onPress={() => handleRecordTypeChange('loss')}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.typePillText,
                          recordType === 'loss' && styles.typePillTextLossActive,
                        ]}
                      >
                        Crop Loss (−)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.typePill,
                        recordType === 'expense' && styles.typePillExpActive,
                      ]}
                      onPress={() => handleRecordTypeChange('expense')}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.typePillText,
                          recordType === 'expense' && styles.typePillTextExpActive,
                        ]}
                      >
                        Expense (−)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 2. Amount (₹) * & Farm Holding * */}
                <View style={styles.formRow}>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>
                      Amount (₹) <Text style={styles.reqStar}>*</Text>
                    </Text>
                    <View style={styles.amountInputWrap}>
                      <Text style={styles.currencyPrefix}>₹</Text>
                      <TextInput
                        style={styles.amountInput}
                        keyboardType="numeric"
                        value={recordAmount}
                        onChangeText={setRecordAmount}
                        placeholder="e.g. 25000"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>

                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>
                      Farm Holding <Text style={styles.reqStar}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.selectBtn}
                      onPress={() =>
                        setOpenDropdown(openDropdown === 'farm' ? null : 'farm')
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.selectBtnText} numberOfLines={1}>
                        {selectedFarm.name}
                      </Text>
                      <Ionicons
                        name={openDropdown === 'farm' ? 'chevron-up' : 'chevron-down'}
                        size={15}
                        color="#55685D"
                      />
                    </TouchableOpacity>
                    {openDropdown === 'farm' && (
                      <View style={styles.dropdownList}>
                        {initialFarms.map((f) => (
                          <TouchableOpacity
                            key={f.id}
                            style={[
                              styles.dropdownItem,
                              recordFarmId === f.id && styles.dropdownItemActive,
                            ]}
                            onPress={() => {
                              setRecordFarmId(f.id);
                              setOpenDropdown(null);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                recordFarmId === f.id && styles.dropdownItemTextActive,
                              ]}
                              numberOfLines={1}
                            >
                              {f.name}
                            </Text>
                            {recordFarmId === f.id && (
                              <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {/* 3. Entry Title / Description * */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Entry Title / Description <Text style={styles.reqStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={recordTitle}
                    onChangeText={setRecordTitle}
                    placeholder={
                      recordType === 'production'
                        ? 'e.g. Wheat (HD-3086) 90 Qtl Mandi Sale'
                        : recordType === 'loss'
                        ? 'e.g. Unseasonal Hailstorm Lodging Damage Zone B'
                        : 'e.g. IFFCO Urea & DAP 30 Bags'
                    }
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* 4. Category * & Associated Crop */}
                <View style={styles.formRow}>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>
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
                        {recordCategory}
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
                          {currentCategories.map((cat) => (
                            <TouchableOpacity
                              key={cat}
                              style={[
                                styles.dropdownItem,
                                recordCategory === cat && styles.dropdownItemActive,
                              ]}
                              onPress={() => {
                                setRecordCategory(cat);
                                setOpenDropdown(null);
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  recordCategory === cat && styles.dropdownItemTextActive,
                                ]}
                                numberOfLines={1}
                              >
                                {cat}
                              </Text>
                              {recordCategory === cat && (
                                <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                              )}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>Associated Crop</Text>
                    <TouchableOpacity
                      style={styles.selectBtn}
                      onPress={() =>
                        setOpenDropdown(openDropdown === 'crop' ? null : 'crop')
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.selectBtnText} numberOfLines={1}>
                        {recordCrop}
                      </Text>
                      <Ionicons
                        name={openDropdown === 'crop' ? 'chevron-up' : 'chevron-down'}
                        size={15}
                        color="#55685D"
                      />
                    </TouchableOpacity>
                    {openDropdown === 'crop' && (
                      <View style={styles.dropdownList}>
                        <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
                          {ASSOCIATED_CROPS.map((cr) => (
                            <TouchableOpacity
                              key={cr}
                              style={[
                                styles.dropdownItem,
                                recordCrop === cr && styles.dropdownItemActive,
                              ]}
                              onPress={() => {
                                setRecordCrop(cr);
                                setOpenDropdown(null);
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  recordCrop === cr && styles.dropdownItemTextActive,
                                ]}
                                numberOfLines={1}
                              >
                                {cr}
                              </Text>
                              {recordCrop === cr && (
                                <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                              )}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>

                {/* 5. Quantity / Impact & Date * */}
                <View style={styles.formRow}>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>Quantity / Impact</Text>
                    <TextInput
                      style={styles.textInput}
                      value={recordQuantity}
                      onChangeText={setRecordQuantity}
                      placeholder={
                        recordType === 'production'
                          ? 'e.g. 90 Quintals'
                          : recordType === 'loss'
                          ? 'e.g. 1.8 Acres Affected'
                          : 'e.g. 30 Bags / 200 Litres'
                      }
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>
                      Date <Text style={styles.reqStar}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.dateInputWrap}
                      onPress={() => setIsDatePickerOpen(true)}
                      activeOpacity={0.8}
                    >
                      <TextInput
                        style={styles.dateInput}
                        value={recordDate}
                        onChangeText={setRecordDate}
                        placeholder="12-11-2026"
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
                </View>

                {/* 6. Settlement Status & Reference / Bill / Challan # */}
                <View style={styles.formRow}>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>Settlement Status</Text>
                    <TouchableOpacity
                      style={styles.selectBtn}
                      onPress={() =>
                        setOpenDropdown(openDropdown === 'status' ? null : 'status')
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.selectBtnText} numberOfLines={1}>
                        {recordStatus}
                      </Text>
                      <Ionicons
                        name={openDropdown === 'status' ? 'chevron-up' : 'chevron-down'}
                        size={15}
                        color="#55685D"
                      />
                    </TouchableOpacity>
                    {openDropdown === 'status' && (
                      <View style={styles.dropdownList}>
                        {SETTLEMENT_STATUSES.map((st) => (
                          <TouchableOpacity
                            key={st}
                            style={[
                              styles.dropdownItem,
                              recordStatus === st && styles.dropdownItemActive,
                            ]}
                            onPress={() => {
                              setRecordStatus(st);
                              setOpenDropdown(null);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                recordStatus === st && styles.dropdownItemTextActive,
                              ]}
                              numberOfLines={1}
                            >
                              {st}
                            </Text>
                            {recordStatus === st && (
                              <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>Reference / Bill / Challan #</Text>
                    <TextInput
                      style={styles.textInput}
                      value={recordReference}
                      onChangeText={setRecordReference}
                      placeholder="e.g. MANDI-8812 / INV-9901"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* 7. Additional Notes / Cause / Remarks */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Additional Notes / Cause / Remarks</Text>
                  <TextInput
                    style={[styles.textInput, { height: 75, textAlignVertical: 'top' }]}
                    multiline
                    value={recordNotes}
                    onChangeText={setRecordNotes}
                    placeholder="e.g. Unseasonal heavy shower led to lodging in parcel B; filed survey with local patwari."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => {
                    setOpenDropdown(null);
                    setModalOpen(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleSaveTransaction}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark" size={17} color="#FFFFFF" />
                  <Text style={styles.modalSubmitText}>Save & Record Entry</Text>
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
          setRecordDate(formatted);
          setIsDatePickerOpen(false);
        }}
        initialDate={recordDate}
        title="Select Transaction Date"
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  addBtnText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },

  scroll: { flex: 1 },
  scrollContent: { padding: 14, gap: 12 },

  // Interactive 4-Metric Strip
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 12,
  },
  metricCardActiveAll: {
    backgroundColor: '#E7F3EB',
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  metricCardActiveProd: {
    backgroundColor: 'rgba(236, 253, 245, 0.8)',
    borderColor: '#059669',
    borderWidth: 1.5,
  },
  metricCardActiveLoss: {
    backgroundColor: 'rgba(255, 251, 235, 0.8)',
    borderColor: '#D97706',
    borderWidth: 1.5,
  },
  metricCardActiveExp: {
    backgroundColor: 'rgba(254, 242, 242, 0.8)',
    borderColor: '#DC2626',
    borderWidth: 1.5,
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricCardLabel: { fontSize: 11, fontWeight: '600', color: '#55685D' },
  metricDotGreen: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  metricDotEmerald: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#059669' },
  metricDotAmber: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D97706' },
  metricDotRed: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#DC2626' },
  metricCardValue: { fontSize: 16, fontWeight: '700', marginTop: 4 },

  // Filter Toolbar
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 12,
    gap: 10,
  },
  segmentedScroll: { marginHorizontal: -4 },
  segmentedContent: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 4,
    backgroundColor: '#F4F8F4',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE6DE',
  },
  segmentBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  segmentBtnActiveWhite: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  segmentBtnText: { fontSize: 11, fontWeight: '600', color: '#55685D' },
  segmentBtnTextActive: { color: colors.primary, fontWeight: '700' },

  searchRow: { gap: 8 },
  farmFilterPills: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  farmPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCE6DE',
    backgroundColor: '#F8FAF8',
  },
  farmPillActive: {
    backgroundColor: '#E7F3EB',
    borderColor: colors.primary,
  },
  farmPillText: { fontSize: 11, color: '#55685D', fontWeight: '500' },
  farmPillTextActive: { color: colors.primary, fontWeight: '700' },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchInput: { flex: 1, fontSize: 12, color: '#26352D', padding: 0 },

  // Ledger List
  ledgerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    overflow: 'hidden',
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: { fontSize: 12, color: '#55685D' },
  txRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  txRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
  },
  txTopLine: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeProd: { backgroundColor: '#ECFDF5' },
  typeBadgeLoss: { backgroundColor: '#FFFBEB' },
  typeBadgeExp: { backgroundColor: '#FEF2F2' },
  typeBadgeText: { fontSize: 9, fontWeight: '700' },
  txTitle: { fontSize: 12, fontWeight: '700', color: '#26352D' },
  txMetaLine: { fontSize: 10, color: '#55685D', marginTop: 3 },
  txFarmLine: { fontSize: 10, color: '#0C4B32', fontWeight: '600', marginTop: 2 },
  txNotesLine: { fontSize: 10, color: '#889B90', fontStyle: 'italic', marginTop: 2 },
  txRightCol: { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: 13, fontWeight: '700' },
  statusPill: {
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: { fontSize: 9, color: '#55685D', fontWeight: '600' },
  deleteBtn: { padding: 3, marginTop: 2 },

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
  modalIconWrap: {
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
    gap: 12,
  },
  formGroup: {
    gap: 6,
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
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formCol: {
    flex: 1,
    gap: 5,
  },

  // Record Type Selector
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typePill: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE6DE',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typePillProdActive: {
    borderColor: '#0C4B32',
    backgroundColor: '#E7F3EB',
    borderWidth: 1.5,
  },
  typePillLossActive: {
    borderColor: '#D97706',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
  },
  typePillExpActive: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#55685D',
  },
  typePillTextProdActive: {
    color: '#0C4B32',
    fontWeight: '700',
  },
  typePillTextLossActive: {
    color: '#B45309',
    fontWeight: '700',
  },
  typePillTextExpActive: {
    color: '#DC2626',
    fontWeight: '700',
  },

  // Inputs
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  currencyPrefix: {
    fontSize: 13,
    fontWeight: '700',
    color: '#55685D',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#26352D',
    paddingVertical: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#26352D',
  },

  // Dropdown Selectors
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
    flex: 1,
  },
  dropdownItemTextActive: {
    color: '#0C4B32',
    fontWeight: '700',
  },

  // Date input
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
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  dateIconTouch: {
    paddingLeft: 6,
    paddingVertical: 6,
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
