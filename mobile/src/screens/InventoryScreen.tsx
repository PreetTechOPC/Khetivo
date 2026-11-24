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
import { initialInventory, initialUsageLogs, InventoryItem, ItemUsageLog } from '../data/mockData';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DatePickerModal } from '../components/DatePickerModal';
import { useAlert } from '../context/AlertContext';

const INVENTORY_FARMS = [
  'Khetivo Green Acres',
  'Malwa Golden Fields',
];

const initialStoresByFarm: Record<string, string[]> = {
  'Khetivo Green Acres': ['Store 1 (Main Input Godown)', 'Chemical & Spray Locker'],
  'Malwa Golden Fields': ['Store 1 (Barn & Seed Store)'],
};

const STORAGE_TYPES = [
  'General Input Godown',
  'Chemical & Spray Locker',
  'Seed Cold Store',
  'Tools & Machinery Shed',
  'Grain Silo / Harvest Barn',
];

const INVENTORY_CATEGORIES = [
  'Fungicide',
  'Fertilizer',
  'Insecticide',
  'Herbicide',
  'Seed',
  'Bio-stimulant',
  'Micronutrient',
  'Irrigation Hardware',
  'Tools & Machinery',
  'Fuel & Lubricant',
  'Other',
];

const INVENTORY_UNITS = [
  'kg',
  'litres',
  'grams',
  'packets',
  'bags',
  'bottles',
  'units',
  'meters',
];

interface InventoryScreenProps {
  onBack: () => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ onBack }) => {
  const { showDeleteConfirm, showWarning, showError, showSuccess } = useAlert();
  const [items, setItems] = useState<InventoryItem[]>(initialInventory);
  const [usageLogs, setUsageLogs] = useState<ItemUsageLog[]>(initialUsageLogs);
  const [activeFilter, setActiveFilter] = useState<'all' | 'low_stock' | 'expiring' | 'usages'>('all');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('inv-1'); // Default expand first item like in screenshot

  // Modals
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
  const [isLogUsageModalOpen, setIsLogUsageModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Stores state
  const [storesByFarm, setStoresByFarm] = useState<Record<string, string[]>>(initialStoresByFarm);

  // Form states for Add Item (Exact match with Image)
  const [formFarm, setFormFarm] = useState('Khetivo Green Acres');
  const [formStore, setFormStore] = useState('Store 1 (Main Input Godown)');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Fungicide');
  const [formBatch, setFormBatch] = useState('MZ-2508');
  const [formPurchased, setFormPurchased] = useState('12-11-2026');
  const [formExpiry, setFormExpiry] = useState('');
  const [formQty, setFormQty] = useState('');
  const [formUnit, setFormUnit] = useState('kg');
  const [formRate, setFormRate] = useState('');
  const [formThreshold, setFormThreshold] = useState('5');
  const [openDropdown, setOpenDropdown] = useState<'farm' | 'store' | 'category' | 'unit' | null>(null);
  const [activeDatePicker, setActiveDatePicker] = useState<'purchased' | 'expiry' | null>(null);

  // Form states for Add Store / Warehouse (Exact match with Image 1)
  const [newStoreFarm, setNewStoreFarm] = useState('Khetivo Green Acres');
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreType, setNewStoreType] = useState('General Input Godown');
  const [newStoreLocation, setNewStoreLocation] = useState('');
  const [newStoreNotes, setNewStoreNotes] = useState('');
  const [openStoreDropdown, setOpenStoreDropdown] = useState<'farm' | 'type' | null>(null);

  // Usage modal form
  const [usageQty, setUsageQty] = useState('');
  const [usagePurpose, setUsagePurpose] = useState('');
  const [usageCrop, setUsageCrop] = useState('Wheat');
  const [usageWorker, setUsageWorker] = useState('Harpreet Singh');

  // Restock modal form
  const [restockQty, setRestockQty] = useState('');

  // Stores List
  const stores = ['Store 1', 'Chemical & Spray Locker', 'Haveli Central Silo'];

  // Counts
  const totalCount = items.length;
  const lowStockCount = items.filter((i) => i.quantity <= i.lowStockThreshold).length;
  // Expiring soon: within 15 days or batch MZ-2508
  const expiringCount = items.filter(
    (i) => i.expiryDate && (i.expiryDate.startsWith('2026-11') || i.id === 'inv-1')
  ).length;
  const usageCount = usageLogs.length;

  // Handlers
  const handleDeleteItem = (id: string) => {
    showDeleteConfirm(
      'Remove Inventory Item',
      'Are you sure you want to remove this stock item from inventory? All associated usage logs will be preserved.',
      () => {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    );
  };

  const handleOpenLogUsage = (item: InventoryItem) => {
    setSelectedItem(item);
    setUsageQty('');
    setUsagePurpose('Routine field application');
    setIsLogUsageModalOpen(true);
  };

  const handleSaveUsage = () => {
    if (!selectedItem) return;
    const qty = parseFloat(usageQty);
    if (isNaN(qty) || qty <= 0) {
      showWarning('Invalid Quantity', 'Please enter a valid deduction quantity.');
      return;
    }
    if (qty > selectedItem.quantity) {
      showError('Insufficient Stock', `Only ${selectedItem.quantity} ${selectedItem.unit} remaining in ${selectedItem.storeName}.`);
      return;
    }

    // Deduct stock
    setItems((prev) =>
      prev.map((i) => (i.id === selectedItem.id ? { ...i, quantity: i.quantity - qty } : i))
    );

    // Add log
    const newLog: ItemUsageLog = {
      id: `usage-${Date.now()}`,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      farmId: 'farm-1',
      farmName: selectedItem.farmName || 'Khetivo Green Acres (Samrala)',
      storeId: selectedItem.storeId || 'store-1',
      storeName: selectedItem.storeName,
      quantityUsed: qty,
      unit: selectedItem.unit,
      date: '2026-11-10',
      purpose: usagePurpose.trim() || 'Field application',
      crop: usageCrop,
      appliedBy: usageWorker,
    };
    setUsageLogs([newLog, ...usageLogs]);
    setIsLogUsageModalOpen(false);
    showSuccess('Usage Recorded', `${qty} ${selectedItem.unit} deducted from ${selectedItem.name}.`);
  };

  const handleOpenRestock = (item: InventoryItem) => {
    setSelectedItem(item);
    setRestockQty('');
    setIsRestockModalOpen(true);
  };

  const handleSaveRestock = () => {
    if (!selectedItem) return;
    const qty = parseFloat(restockQty);
    if (isNaN(qty) || qty <= 0) {
      showWarning('Invalid Quantity', 'Please enter a valid restock quantity.');
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === selectedItem.id ? { ...i, quantity: i.quantity + qty } : i))
    );
    setIsRestockModalOpen(false);
    showSuccess('Restocked Successfully', `Added ${qty} ${selectedItem.unit} to ${selectedItem.name}.`);
  };

  const handleSaveNewItem = () => {
    if (!formName.trim() && !formBatch.trim()) {
      showWarning('Required Field', 'Please enter Item Name.');
      return;
    }
    const finalName = formName.trim() || 'Mancozeb 75% WP';
    const finalQty = parseFloat(formQty) || 25;
    const finalRate = parseFloat(formRate) || 450;
    const finalThreshold = parseFloat(formThreshold) || 5;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      farmId: formFarm.includes('Malwa') ? 'farm-2' : 'farm-1',
      farmName: formFarm,
      storeId: formStore.includes('Chemical') ? 'store-2' : 'store-1',
      storeName: formStore,
      name: finalName,
      category: formCategory,
      batchNumber: formBatch.trim() || 'MZ-2508',
      purchasedDate: formPurchased || '12-11-2026',
      expiryDate: formExpiry.trim() || '2027-11-12',
      quantity: finalQty,
      unit: formUnit,
      rate: finalRate,
      lowStockThreshold: finalThreshold,
    };
    setItems([newItem, ...items]);
    setIsAddItemModalOpen(false);
    setOpenDropdown(null);
    setFormName('');
    setFormQty('');
    setFormRate('');
    showSuccess('Item Added', `${newItem.name} added to ${newItem.storeName}.`);
  };

  const handleSaveStore = () => {
    if (!newStoreName.trim()) {
      showWarning('Required Field', 'Please enter Store Name.');
      return;
    }
    const storeLabel = `${newStoreName.trim()} (${newStoreType})`;
    setStoresByFarm((prev) => {
      const currentList = prev[newStoreFarm] || [];
      return {
        ...prev,
        [newStoreFarm]: [...currentList, storeLabel],
      };
    });
    setFormFarm(newStoreFarm);
    setFormStore(storeLabel);
    setIsAddStoreModalOpen(false);
    setIsAddItemModalOpen(true);
    setOpenStoreDropdown(null);
    setNewStoreName('');
    setNewStoreLocation('');
    setNewStoreNotes('');
    showSuccess('Store Created', `${storeLabel} has been created and assigned to ${newStoreFarm}.`);
  };

  // Filtered Items
  const visibleItems = items.filter((i) => {
    if (activeFilter === 'low_stock' && i.quantity > i.lowStockThreshold) return false;
    if (
      activeFilter === 'expiring' &&
      !(i.expiryDate && (i.expiryDate.startsWith('2026-11') || i.id === 'inv-1'))
    ) {
      return false;
    }
    if (storeFilter !== 'all' && i.storeName !== storeFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.storeName.toLowerCase().includes(q);
      if (!match) return false;
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
        <Text style={styles.topBarTitle}>Inventory & Stores</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header Block: Title + Buttons */}
        <View style={styles.headerBlock}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.mainTitle}>Inventory</Text>
            <Text style={styles.mainSub}>
              Store stock, expiry reminders & usages • All registered holdings
            </Text>
          </View>

          <View style={styles.headerButtonsRow}>
            {/* + Store Button */}
            <TouchableOpacity
              style={styles.storeOutlineBtn}
              onPress={() => setIsAddStoreModalOpen(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="office-building" size={14} color="#0C4B32" />
              <Text style={styles.storeOutlineBtnText}>+ Store</Text>
            </TouchableOpacity>

            {/* + Add Item Button */}
            <TouchableOpacity
              style={styles.addItemBtn}
              onPress={() => setIsAddItemModalOpen(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={15} color="#FFFFFF" />
              <Text style={styles.addItemBtnText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4-Metric Strip (Click to Filter) */}
        <View style={styles.metricStrip}>
          <TouchableOpacity
            style={[styles.metricCard, activeFilter === 'all' && styles.metricCardActive]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.7}
          >
            <View style={styles.metricCardTop}>
              <Text style={styles.metricCardLabel}>All Stock Items</Text>
              {activeFilter === 'all' && <View style={styles.activeDot} />}
            </View>
            <Text style={[styles.metricCardVal, { color: '#0C4B32' }]}>{totalCount} SKUs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, activeFilter === 'low_stock' && styles.metricCardActiveAmber]}
            onPress={() => setActiveFilter('low_stock')}
            activeOpacity={0.7}
          >
            <View style={styles.metricCardTop}>
              <Text style={[styles.metricCardLabel, { color: '#92400E' }]}>Low Stock</Text>
              {activeFilter === 'low_stock' && (
                <View style={[styles.activeDot, { backgroundColor: '#D97706' }]} />
              )}
            </View>
            <Text style={[styles.metricCardVal, { color: '#B45309' }]}>{lowStockCount} Items</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, activeFilter === 'expiring' && styles.metricCardActiveRed]}
            onPress={() => setActiveFilter('expiring')}
            activeOpacity={0.7}
          >
            <View style={styles.metricCardTop}>
              <Text style={[styles.metricCardLabel, { color: '#991B1B' }]}>Expiring Soon</Text>
              {activeFilter === 'expiring' && (
                <View style={[styles.activeDot, { backgroundColor: '#DC2626' }]} />
              )}
            </View>
            <Text style={[styles.metricCardVal, { color: '#DC2626' }]}>{expiringCount} Batches</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, activeFilter === 'usages' && styles.metricCardActive]}
            onPress={() => setActiveFilter('usages')}
            activeOpacity={0.7}
          >
            <View style={styles.metricCardTop}>
              <Text style={styles.metricCardLabel}>Usage Logs</Text>
              {activeFilter === 'usages' && <View style={styles.activeDot} />}
            </View>
            <Text style={[styles.metricCardVal, { color: '#26352D' }]}>{usageCount} Records</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Toolbar: Segmented Tabs, Store Selector & Search */}
        <View style={styles.filterToolbar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabsRow}>
            {[
              { id: 'all', label: `All Stock (${totalCount})` },
              { id: 'low_stock', label: `Low Stock (${lowStockCount})` },
              { id: 'expiring', label: `Expiring Soon (${expiringCount})` },
              { id: 'usages', label: `Usage History (${usageCount})` },
            ].map((tab) => {
              const active = activeFilter === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  onPress={() => setActiveFilter(tab.id as any)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Store selector & Search input */}
          <View style={styles.toolbarBottom}>
            <View style={styles.storeSelectBox}>
              <Text style={styles.storeSelectText}>
                {storeFilter === 'all' ? `All Stores (${stores.length})` : storeFilter}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#55685D" />
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={14} color="#889B90" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor="#889B90"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={14} color="#889B90" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* VIEW A: USAGE LOGS */}
        {activeFilter === 'usages' ? (
          <View style={styles.ledgerCard}>
            {usageLogs.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No item usage logs found.</Text>
              </View>
            ) : (
              <View>
                {usageLogs.map((log, idx) => (
                  <View
                    key={log.id}
                    style={[styles.usageRow, idx !== usageLogs.length - 1 && styles.rowBorder]}
                  >
                    <View style={{ flex: 1, gap: 4 }}>
                      <View style={styles.usageTitleRow}>
                        <Text style={styles.usageItemName}>{log.itemName}</Text>
                        <View style={styles.storeTag}>
                          <Text style={styles.storeTagText}>{log.storeName}</Text>
                        </View>
                        {log.crop && (
                          <View style={styles.cropTag}>
                            <Text style={styles.cropTagText}>{log.crop}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.usageMeta}>
                        {log.purpose} • {log.date} • {log.appliedBy}
                      </Text>
                    </View>

                    <View style={styles.usageDeductWrap}>
                      <Text style={styles.usageDeductVal}>
                        -{log.quantityUsed} {log.unit}
                      </Text>
                      <Text style={styles.usageDeductLabel}>Deducted</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          /* VIEW B: STOCK ITEMS LEDGER (Matching Screenshot 4) */
          <View style={styles.ledgerCard}>
            {visibleItems.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No inventory records found.</Text>
              </View>
            ) : (
              <View>
                {visibleItems.map((item, idx) => {
                  const isExpanded = expandedId === item.id;
                  const isLow = item.quantity <= item.lowStockThreshold;
                  const isExpiring = item.expiryDate?.startsWith('2026-11') || item.id === 'inv-1';

                  return (
                    <View
                      key={item.id}
                      style={[styles.stockRow, idx !== visibleItems.length - 1 && styles.rowBorder]}
                    >
                      {/* Top Compact Row */}
                      <View style={styles.stockRowHeader}>
                        {/* Title & Badges */}
                        <TouchableOpacity
                          style={{ flex: 1, gap: 6 }}
                          onPress={() => setExpandedId(isExpanded ? null : item.id)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.stockItemTitle}>{item.name}</Text>
                          <View style={styles.badgesRow}>
                            <View style={styles.categoryBadge}>
                              <Text style={styles.categoryBadgeText}>{item.category}</Text>
                            </View>

                            <View style={styles.storeTag}>
                              <Text style={styles.storeTagText}>{item.storeName}</Text>
                            </View>

                            {isLow && (
                              <View style={styles.lowStockBadge}>
                                <Text style={styles.lowStockBadgeText}>⚠️ Low Stock</Text>
                              </View>
                            )}

                            {isExpiring && (
                              <View style={styles.expiryBadge}>
                                <Text style={styles.expiryBadgeText}>⏳ Expires in 2d</Text>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>

                        {/* Quantity */}
                        <View style={styles.qtyWrap}>
                          <Text style={[styles.qtyVal, isLow && { color: '#B45309' }]}>
                            {item.quantity} {item.unit}
                          </Text>
                        </View>
                      </View>

                      {/* Action Buttons Row: Log Usage, Restock, Trash, Chevron */}
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={styles.logUsageBtn}
                          onPress={() => handleOpenLogUsage(item)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.logUsageBtnText}>Log Usage</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.restockBtn}
                          onPress={() => handleOpenRestock(item)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.restockBtnText}>Restock</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.trashActionBtn}
                          onPress={() => handleDeleteItem(item.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.chevronActionBtn}
                          onPress={() => setExpandedId(isExpanded ? null : item.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color="#55685D"
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Expanded Details Panel (Matching Screenshot 4) */}
                      {isExpanded && (
                        <View style={styles.detailsPanel}>
                          {/* Row 1 of details */}
                          <View style={styles.detailsGrid}>
                            <View style={styles.detailBox}>
                              <Text style={styles.detailBoxLabel}>BATCH / LOT #</Text>
                              <Text style={styles.detailBoxVal}>
                                {item.batchNumber || 'MZ-2508'}
                              </Text>
                            </View>

                            <View style={styles.detailBox}>
                              <Text style={styles.detailBoxLabel}>RATE & VALUE</Text>
                              <Text style={styles.detailBoxVal}>
                                ₹{item.rate}/{item.unit} Total: ₹
                                {(item.rate * item.quantity).toLocaleString('en-IN')}
                              </Text>
                            </View>

                            <View style={styles.detailBox}>
                              <Text style={styles.detailBoxLabel}>LOW STOCK ALERT</Text>
                              <Text style={styles.detailBoxVal}>
                                Threshold: {item.lowStockThreshold} {item.unit}
                              </Text>
                            </View>

                            <View style={styles.detailBox}>
                              <Text style={styles.detailBoxLabel}>PURCHASED DATE</Text>
                              <Text style={styles.detailBoxVal}>
                                {item.purchasedDate || '15 Oct, 2026'}
                              </Text>
                            </View>
                          </View>

                          {/* Row 2 of details */}
                          <View style={styles.detailsGrid}>
                            <View style={styles.detailBox}>
                              <Text style={styles.detailBoxLabel}>EXPIRY DATE</Text>
                              <Text
                                style={[
                                  styles.detailBoxVal,
                                  isExpiring && { color: '#DC2626' },
                                ]}
                              >
                                {item.expiryDate || '12 Nov, 2026'} (2d left)
                              </Text>
                            </View>

                            <View style={styles.detailBox}>
                              <Text style={styles.detailBoxLabel}>STORAGE FACILITY</Text>
                              <Text style={styles.detailBoxVal}>{item.storeName}</Text>
                            </View>

                            <View style={[styles.detailBox, { width: '100%' }]}>
                              <Text style={styles.detailBoxLabel}>ASSIGNED FARM</Text>
                              <Text style={styles.detailBoxVal}>
                                {item.farmName || 'Khetivo Green Acres (Samrala)'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* LOG USAGE MODAL (Slide-up Bottom Sheet) */}
      <Modal
        visible={isLogUsageModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsLogUsageModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdropPressable}
            activeOpacity={1}
            onPress={() => setIsLogUsageModalOpen(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.sheetHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Field Usage</Text>
              <TouchableOpacity onPress={() => setIsLogUsageModalOpen(false)}>
                <Ionicons name="close" size={20} color="#889B90" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>
                Deduct Quantity ({selectedItem?.unit || 'Units'}) *
              </Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholder={`Current stock: ${selectedItem?.quantity} ${selectedItem?.unit}`}
                value={usageQty}
                onChangeText={setUsageQty}
              />

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Crop Applied</Text>
              <TextInput
                style={styles.textInput}
                value={usageCrop}
                onChangeText={setUsageCrop}
              />

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Application Purpose</Text>
              <TextInput
                style={styles.textInput}
                value={usagePurpose}
                onChangeText={setUsagePurpose}
              />

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Applied By</Text>
              <TextInput
                style={styles.textInput}
                value={usageWorker}
                onChangeText={setUsageWorker}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsLogUsageModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveUsage}>
                <Text style={styles.modalSubmitText}>Deduct Stock</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* RESTOCK MODAL (Slide-up Bottom Sheet) */}
      <Modal
        visible={isRestockModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsRestockModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdropPressable}
            activeOpacity={1}
            onPress={() => setIsRestockModalOpen(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.sheetHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Restock Inventory</Text>
              <TouchableOpacity onPress={() => setIsRestockModalOpen(false)}>
                <Ionicons name="close" size={20} color="#889B90" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>
                Add Quantity ({selectedItem?.unit || 'Units'}) *
              </Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholder="Enter restock quantity"
                value={restockQty}
                onChangeText={setRestockQty}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsRestockModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveRestock}>
                <Text style={styles.modalSubmitText}>Confirm Restock</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ADD ITEM MODAL (Slide-Up Bottom Sheet matching Image) */}
      <Modal
        visible={isAddItemModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setOpenDropdown(null);
          setIsAddItemModalOpen(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdropPressable}
            activeOpacity={1}
            onPress={() => {
              setOpenDropdown(null);
              setIsAddItemModalOpen(false);
            }}
          />
          <View style={styles.modalCard}>
            {/* Sheet Handle */}
            <View style={styles.sheetHandle} />

            {/* Modal Header: "Add item" with close X */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add item</Text>
              <TouchableOpacity
                onPress={() => {
                  setOpenDropdown(null);
                  setIsAddItemModalOpen(false);
                }}
                style={styles.modalCloseBtn}
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
              {/* Farm * */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>
                  Farm <Text style={styles.reqStar}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.selectBtn}
                  onPress={() =>
                    setOpenDropdown(openDropdown === 'farm' ? null : 'farm')
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectBtnText} numberOfLines={1}>
                    {formFarm}
                  </Text>
                  <Ionicons
                    name={openDropdown === 'farm' ? 'chevron-up' : 'chevron-down'}
                    size={15}
                    color="#55685D"
                  />
                </TouchableOpacity>
                {openDropdown === 'farm' && (
                  <View style={styles.dropdownList}>
                    {INVENTORY_FARMS.map((f) => (
                      <TouchableOpacity
                        key={f}
                        style={[
                          styles.dropdownItem,
                          formFarm === f && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setFormFarm(f);
                          const farmStores = storesByFarm[f] || ['Store 1'];
                          setFormStore(farmStores[0]);
                          setOpenDropdown(null);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            formFarm === f && styles.dropdownItemTextActive,
                          ]}
                        >
                          {f}
                        </Text>
                        {formFarm === f && (
                          <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Store * with + Add New Store */}
              <View style={styles.formGroup}>
                <View style={styles.labelWithActionRow}>
                  <Text style={styles.inputLabel}>
                    Store <Text style={styles.reqStar}>*</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setNewStoreFarm(formFarm);
                      setIsAddItemModalOpen(false);
                      setOpenDropdown(null);
                      setIsAddStoreModalOpen(true);
                    }}
                  >
                    <Text style={styles.addStoreLink}>+ Add New Store</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.selectBtn}
                  onPress={() =>
                    setOpenDropdown(openDropdown === 'store' ? null : 'store')
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectBtnText} numberOfLines={1}>
                    {formStore}
                  </Text>
                  <Ionicons
                    name={openDropdown === 'store' ? 'chevron-up' : 'chevron-down'}
                    size={15}
                    color="#55685D"
                  />
                </TouchableOpacity>
                {openDropdown === 'store' && (
                  <View style={styles.dropdownList}>
                    {(storesByFarm[formFarm] || ['Store 1 (Main Input Godown)']).map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.dropdownItem,
                          formStore === s && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setFormStore(s);
                          setOpenDropdown(null);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            formStore === s && styles.dropdownItemTextActive,
                          ]}
                        >
                          {s}
                        </Text>
                        {formStore === s && (
                          <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Item * */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>
                  Item <Text style={styles.reqStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Mancozeb 75% WP"
                  placeholderTextColor="#9CA3AF"
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              {/* Row 1: Category & Batch / Lot */}
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() =>
                      setOpenDropdown(openDropdown === 'category' ? null : 'category')
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.selectBtnText} numberOfLines={1}>
                      {formCategory}
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
                        {INVENTORY_CATEGORIES.map((cat) => (
                          <TouchableOpacity
                            key={cat}
                            style={[
                              styles.dropdownItem,
                              formCategory === cat && styles.dropdownItemActive,
                            ]}
                            onPress={() => {
                              setFormCategory(cat);
                              setOpenDropdown(null);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                formCategory === cat && styles.dropdownItemTextActive,
                              ]}
                            >
                              {cat}
                            </Text>
                            {formCategory === cat && (
                              <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>Batch / Lot</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="MZ-2508"
                    placeholderTextColor="#9CA3AF"
                    value={formBatch}
                    onChangeText={setFormBatch}
                  />
                </View>
              </View>

              {/* Row 2: Purchased & Expiry */}
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>Purchased</Text>
                  <TouchableOpacity
                    style={styles.dateInputWrap}
                    onPress={() => setActiveDatePicker('purchased')}
                    activeOpacity={0.8}
                  >
                    <TextInput
                      style={styles.dateInput}
                      placeholder="dd-mm-yyyy"
                      placeholderTextColor="#9CA3AF"
                      value={formPurchased}
                      onChangeText={setFormPurchased}
                    />
                    <TouchableOpacity
                      onPress={() => setActiveDatePicker('purchased')}
                      style={styles.dateIconTouch}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="calendar-outline" size={17} color="#0C4B32" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>Expiry</Text>
                  <TouchableOpacity
                    style={styles.dateInputWrap}
                    onPress={() => setActiveDatePicker('expiry')}
                    activeOpacity={0.8}
                  >
                    <TextInput
                      style={styles.dateInput}
                      placeholder="dd-mm-yyyy"
                      placeholderTextColor="#9CA3AF"
                      value={formExpiry}
                      onChangeText={setFormExpiry}
                    />
                    <TouchableOpacity
                      onPress={() => setActiveDatePicker('expiry')}
                      style={styles.dateIconTouch}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="calendar-outline" size={17} color="#0C4B32" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Row 3: Quantity * & Unit */}
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>
                    Quantity <Text style={styles.reqStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    placeholder="e.g. 25"
                    placeholderTextColor="#9CA3AF"
                    value={formQty}
                    onChangeText={setFormQty}
                  />
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>Unit</Text>
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() =>
                      setOpenDropdown(openDropdown === 'unit' ? null : 'unit')
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.selectBtnText} numberOfLines={1}>
                      {formUnit}
                    </Text>
                    <Ionicons
                      name={openDropdown === 'unit' ? 'chevron-up' : 'chevron-down'}
                      size={15}
                      color="#55685D"
                    />
                  </TouchableOpacity>
                  {openDropdown === 'unit' && (
                    <View style={styles.dropdownList}>
                      <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
                        {INVENTORY_UNITS.map((u) => (
                          <TouchableOpacity
                            key={u}
                            style={[
                              styles.dropdownItem,
                              formUnit === u && styles.dropdownItemActive,
                            ]}
                            onPress={() => {
                              setFormUnit(u);
                              setOpenDropdown(null);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                formUnit === u && styles.dropdownItemTextActive,
                              ]}
                            >
                              {u}
                            </Text>
                            {formUnit === u && (
                              <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              {/* Rate (₹ per unit) */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>
                  Rate (₹ per {formUnit || 'kg'})
                </Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="e.g. 450"
                  placeholderTextColor="#9CA3AF"
                  value={formRate}
                  onChangeText={setFormRate}
                />
              </View>

              {/* Low Stock Alert Threshold */}
              <View style={styles.formGroup}>
                <Text style={styles.subInputLabel}>
                  Low Stock Alert Threshold (Remind when stock falls below)
                </Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="5"
                  placeholderTextColor="#9CA3AF"
                  value={formThreshold}
                  onChangeText={setFormThreshold}
                />
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setOpenDropdown(null);
                  setIsAddItemModalOpen(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSaveNewItem}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSubmitText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ADD STORE / WAREHOUSE MODAL (Slide-up Bottom Sheet matching Image 1) */}
      <Modal
        visible={isAddStoreModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsAddStoreModalOpen(false);
          setIsAddItemModalOpen(true);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdropPressable}
            activeOpacity={1}
            onPress={() => {
              setIsAddStoreModalOpen(false);
              setIsAddItemModalOpen(true);
            }}
          />
          <View style={styles.modalCard}>
            <View style={styles.sheetHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Store / Warehouse</Text>
                <Text style={styles.modalSub}>
                  Create a dedicated storage unit on your farm holding.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setIsAddStoreModalOpen(false);
                  setIsAddItemModalOpen(true);
                }}
                style={styles.modalCloseBtn}
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
              {/* Farm Holding * */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>
                  Farm Holding <Text style={styles.reqStar}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.selectBtn}
                  onPress={() =>
                    setOpenStoreDropdown(openStoreDropdown === 'farm' ? null : 'farm')
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectBtnText} numberOfLines={1}>
                    {newStoreFarm}
                  </Text>
                  <Ionicons
                    name={openStoreDropdown === 'farm' ? 'chevron-up' : 'chevron-down'}
                    size={15}
                    color="#55685D"
                  />
                </TouchableOpacity>
                {openStoreDropdown === 'farm' && (
                  <View style={styles.dropdownList}>
                    {INVENTORY_FARMS.map((f) => (
                      <TouchableOpacity
                        key={f}
                        style={[
                          styles.dropdownItem,
                          newStoreFarm === f && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setNewStoreFarm(f);
                          setOpenStoreDropdown(null);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            newStoreFarm === f && styles.dropdownItemTextActive,
                          ]}
                        >
                          {f}
                        </Text>
                        {newStoreFarm === f && (
                          <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Store Name * */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>
                  Store Name <Text style={styles.reqStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Store 1, Fertilizer Godown B, Seed Cold Storage"
                  placeholderTextColor="#9CA3AF"
                  value={newStoreName}
                  onChangeText={setNewStoreName}
                />
              </View>

              {/* Storage Type */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Storage Type</Text>
                <TouchableOpacity
                  style={styles.selectBtn}
                  onPress={() =>
                    setOpenStoreDropdown(openStoreDropdown === 'type' ? null : 'type')
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectBtnText} numberOfLines={1}>
                    {newStoreType}
                  </Text>
                  <Ionicons
                    name={openStoreDropdown === 'type' ? 'chevron-up' : 'chevron-down'}
                    size={15}
                    color="#55685D"
                  />
                </TouchableOpacity>
                {openStoreDropdown === 'type' && (
                  <View style={styles.dropdownList}>
                    {STORAGE_TYPES.map((st) => (
                      <TouchableOpacity
                        key={st}
                        style={[
                          styles.dropdownItem,
                          newStoreType === st && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setNewStoreType(st);
                          setOpenStoreDropdown(null);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            newStoreType === st && styles.dropdownItemTextActive,
                          ]}
                        >
                          {st}
                        </Text>
                        {newStoreType === st && (
                          <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Location / Shed Identifier */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Location / Shed Identifier</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. North Parcel Gate 1, Building C"
                  placeholderTextColor="#9CA3AF"
                  value={newStoreLocation}
                  onChangeText={setNewStoreLocation}
                />
              </View>

              {/* Remarks / Notes */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Remarks / Notes</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={3}
                  placeholder="e.g. Equipped with double lock and fire extinguisher."
                  placeholderTextColor="#9CA3AF"
                  value={newStoreNotes}
                  onChangeText={setNewStoreNotes}
                />
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setIsAddStoreModalOpen(false);
                  setIsAddItemModalOpen(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSaveStore}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSubmitText}>Save Store</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={activeDatePicker !== null}
        onClose={() => setActiveDatePicker(null)}
        title={activeDatePicker === 'expiry' ? 'Select Expiry Date' : 'Select Purchased Date'}
        isExpiry={activeDatePicker === 'expiry'}
        initialDate={
          activeDatePicker === 'expiry'
            ? formExpiry || '12-11-2027'
            : formPurchased || '12-11-2026'
        }
        onSelectDate={(formattedDate) => {
          if (activeDatePicker === 'expiry') {
            setFormExpiry(formattedDate);
          } else {
            setFormPurchased(formattedDate);
          }
          setActiveDatePicker(null);
        }}
      />
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

  // Header Block
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
  storeOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  storeOutlineBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#26352D',
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0C4B32',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addItemBtnText: {
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
  toolbarBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storeSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  storeSelectText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#26352D',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    color: '#26352D',
    padding: 0,
  },

  // Ledger Card
  ledgerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    overflow: 'hidden',
  },
  stockRow: {
    padding: 14,
    gap: 10,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
  },
  stockRowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  stockItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26352D',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: '#E7F3EB',
    borderWidth: 1,
    borderColor: '#C6E2D0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0C4B32',
  },
  storeTag: {
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  storeTagText: {
    fontSize: 10,
    color: '#55685D',
  },
  cropTag: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cropTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  lowStockBadge: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lowStockBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  expiryBadge: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  expiryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#991B1B',
  },
  qtyWrap: {
    alignItems: 'flex-end',
  },
  qtyVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0C4B32',
  },

  // Actions Row (Log Usage, Restock, Trash, Chevron)
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  logUsageBtn: {
    backgroundColor: '#0C4B32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logUsageBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  restockBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  restockBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#26352D',
  },
  trashActionBtn: {
    padding: 6,
    marginLeft: 'auto',
  },
  chevronActionBtn: {
    padding: 6,
  },

  // Details Panel (Expanded)
  detailsPanel: {
    marginTop: 6,
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  detailBox: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    borderRadius: 8,
    padding: 8,
    gap: 2,
  },
  detailBoxLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#889B90',
  },
  detailBoxVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#26352D',
  },

  // Usage Row
  usageRow: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  usageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  usageItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#26352D',
  },
  usageMeta: {
    fontSize: 11,
    color: '#55685D',
  },
  usageDeductWrap: {
    alignItems: 'flex-end',
  },
  usageDeductVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  usageDeductLabel: {
    fontSize: 10,
    color: '#55685D',
  },

  // Empty State
  emptyWrap: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#55685D',
  },

  // Modals (Slide-up Bottom Sheet)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: '92%',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
    width: '100%',
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE5DB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#26352D',
  },
  modalSub: {
    fontSize: 11,
    color: '#55685D',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    maxHeight: 500,
  },
  modalBodyContent: {
    gap: 12,
    paddingVertical: 4,
  },
  formGroup: {
    gap: 4,
  },
  labelWithActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addStoreLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0C4B32',
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formCol: {
    flex: 1,
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#26352D',
  },
  subInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#55685D',
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
    paddingVertical: 8,
    fontSize: 13,
    color: '#26352D',
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
    paddingVertical: 8,
  },
  selectBtnText: {
    fontSize: 13,
    color: '#26352D',
    flex: 1,
  },
  dateInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  dateInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 12,
    color: '#26352D',
  },
  dateIconTouch: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#26352D',
    minHeight: 65,
    textAlignVertical: 'top',
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F8F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemActive: {
    backgroundColor: '#E7F3EB',
  },
  dropdownItemText: {
    fontSize: 12,
    color: '#26352D',
    flex: 1,
  },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: '#0C4B32',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EBE5DB',
  },
  modalCancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCE6DE',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#26352D',
  },
  modalSubmitBtn: {
    backgroundColor: '#0C4B32',
    paddingVertical: 9,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
