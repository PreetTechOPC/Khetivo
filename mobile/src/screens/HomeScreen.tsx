import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors } from '../theme/colors';
import { Farm, Crop, InventoryItem } from '../data/mockData';
import { FinancialTransaction } from './LedgerScreen';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface HomeScreenProps {
  currentFarm: Farm;
  farms: Farm[];
  onSelectFarm: () => void;
  onNavigate: (screen: string) => void;
  onOpenTutorial?: () => void;
  farmerName?: string;
  transactions?: FinancialTransaction[];
  inventory?: InventoryItem[];
  advisoriesCount?: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentFarm,
  farms,
  onSelectFarm,
  onNavigate,
  farmerName = 'Mohan Lal',
  transactions = [],
  inventory = [],
  advisoriesCount = 0,
}) => {
  const totalAcres = farms.reduce((acc, f) => acc + f.totalArea, 0);

  // Compute live financial totals from database transactions
  const totalProduction = transactions
    .filter((tx) => tx.type === 'production')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalLosses = transactions
    .filter((tx) => tx.type === 'loss')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netRealization = totalProduction - totalLosses - totalExpenses;
  const recentTx = transactions.length > 0 ? transactions[0] : null;

  // Active crops across holdings or selected farm
  type DisplayCrop = Crop & { farmName?: string };
  const allCrops: DisplayCrop[] = farms.flatMap((f) =>
    (f.crops || []).map((c) => ({ ...c, farmName: f.name }))
  );
  const displayCrops: DisplayCrop[] = allCrops.length > 0 ? allCrops : ((currentFarm.crops || []) as DisplayCrop[]);

  // Live Inventory preview
  const displayInventory: InventoryItem[] = inventory.slice(0, 3);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================================= */}
        {/* 1. TOP APP BAR (Logo + Actions)                                           */}
        {/* ========================================================================= */}
        <View style={styles.topAppBar}>
          <Image
            source={require('../../assets/logo-khetivo-cropped.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />

          <View style={styles.topRightActions}>
            {/* Account / Profile Settings Button */}
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => onNavigate('settings')}
              activeOpacity={0.7}
            >
              <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
            </TouchableOpacity>

            {/* Notification Bell */}
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => onNavigate('advisories')}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={19} color={colors.text} />
              {advisoriesCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{advisoriesCount}</Text>
                </View>
              )}
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
              <Text style={styles.farmerName}>{farmerName}</Text>
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
        {/* 3. WEATHER QUICK BANNER                                                   */}
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
        {/* 4. STATS / LEDGER SUMMARY CARD                                            */}
        {/* ========================================================================= */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MaterialCommunityIcons name="receipt-outline" size={19} color={colors.primary} />
              <Text style={styles.cardTitle}>Stats</Text>
            </View>
            <TouchableOpacity
              onPress={() => onNavigate('ledger')}
              activeOpacity={0.7}
              style={styles.headerLinkTouch}
            >
              <Text style={styles.headerLinkText}>View Ledger →</Text>
            </TouchableOpacity>
          </View>

          {/* 3-Metric Summary Strip */}
          <View style={styles.statsStrip}>
            <View style={styles.statsCol}>
              <Text style={styles.statsLabel}>Production</Text>
              <Text style={styles.statsValProduction}>+₹{totalProduction.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsCol}>
              <Text style={styles.statsLabel}>Losses</Text>
              <Text style={styles.statsValLosses}>-₹{totalLosses.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsCol}>
              <Text style={styles.statsLabel}>Expenses</Text>
              <Text style={styles.statsValExpenses}>-₹{totalExpenses.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* Recent Entry Row */}
          {recentTx ? (
            <View style={styles.recentEntryRow}>
              <View style={styles.entryLeft}>
                <Text style={styles.entryTitle}>{recentTx.title}</Text>
                <Text style={styles.entryMeta}>{recentTx.date} • {recentTx.category}</Text>
              </View>
              <Text
                style={[
                  styles.entryAmount,
                  recentTx.type === 'production'
                    ? { color: colors.secondary }
                    : recentTx.type === 'loss'
                    ? { color: '#D97706' }
                    : { color: colors.danger },
                ]}
              >
                {recentTx.type === 'production' ? '+' : '-'}₹{recentTx.amount.toLocaleString('en-IN')}
              </Text>
            </View>
          ) : (
            <View style={styles.recentEntryRow}>
              <View style={styles.entryLeft}>
                <Text style={styles.entryTitle}>No Recent Entries</Text>
                <Text style={styles.entryMeta}>Tap below to record production or expenses</Text>
              </View>
              <Text style={[styles.entryAmount, { color: colors.textMuted }]}>₹0</Text>
            </View>
          )}

          {/* Card Footer: Net Realization & Record Entry CTA */}
          <View style={styles.cardFooter}>
            <Text style={styles.netText}>
              Net:{' '}
              <Text
                style={[
                  styles.netAmount,
                  { color: netRealization >= 0 ? colors.primary : colors.danger },
                ]}
              >
                {netRealization >= 0 ? '+' : ''}₹{netRealization.toLocaleString('en-IN')}
              </Text>
            </Text>
            <TouchableOpacity
              style={styles.recordEntryBtn}
              onPress={() => onNavigate('ledger')}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={15} color={colors.primary} />
              <Text style={styles.recordEntryBtnText}>Record Entry</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 5. ACTIVE CROPS CARD                                                      */}
        {/* ========================================================================= */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MaterialCommunityIcons name="sprout-outline" size={19} color={colors.primary} />
              <Text style={styles.cardTitle}>Active Crops</Text>
              <Text style={styles.cardCount}>({displayCrops.length})</Text>
            </View>
            <TouchableOpacity
              onPress={() => onNavigate('crops')}
              activeOpacity={0.7}
              style={styles.headerLinkTouch}
            >
              <Text style={styles.headerLinkText}>Detailed Timeline →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rowsContainer}>
            {displayCrops.slice(0, 3).map((crop, idx) => {
              const currentDay = crop.currentDay || 1;
              const totalDays = crop.totalDays || 95;
              const progressPct = Math.min(100, Math.max(4, Math.round((currentDay / totalDays) * 100)));

              return (
                <TouchableOpacity
                  key={crop.id || idx}
                  style={[styles.cropRow, idx > 0 && styles.rowBorderTop]}
                  onPress={() => onNavigate('crops')}
                  activeOpacity={0.7}
                >
                  <View style={styles.cropLeft}>
                    <View style={styles.cropNameRow}>
                      <Text style={styles.cropName}>{crop.name}</Text>
                      {crop.variety ? (
                        <Text style={styles.cropVariety}>({crop.variety})</Text>
                      ) : null}
                      <Text style={styles.cropMetaDot}>•</Text>
                      <Text style={styles.cropMetaText}>{crop.area || 10} Acres</Text>
                      {crop.farmName ? (
                        <Text style={styles.cropMetaFarm}>({crop.farmName.split(' ')[0]})</Text>
                      ) : null}
                    </View>
                    <Text style={styles.cropStageText}>
                      {crop.stage ? crop.stage.split('&')[0].trim() : 'Sprouting'}
                    </Text>
                  </View>

                  <View style={styles.cropRight}>
                    <Text style={styles.cropDayText}>
                      Day <Text style={styles.cropDayCurrent}>{currentDay}</Text>
                      <Text style={styles.cropDayTotal}> / {totalDays}</Text>
                    </Text>
                    <View style={styles.progressBarTrack}>
                      <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 6. INVENTORY STATUS CARD                                                  */}
        {/* ========================================================================= */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MaterialCommunityIcons name="cube-outline" size={19} color="#7C3AED" />
              <Text style={styles.cardTitle}>Inventory Status (All Warehouses)</Text>
            </View>
            <TouchableOpacity
              onPress={() => onNavigate('inventory')}
              activeOpacity={0.7}
              style={styles.headerLinkTouch}
            >
              <Text style={styles.headerLinkText}>Manage Stock →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rowsContainer}>
            {displayInventory.length === 0 ? (
              <View style={[styles.inventoryRow, { justifyContent: 'center', paddingVertical: 14 }]}>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>No inventory items recorded yet</Text>
              </View>
            ) : (
              displayInventory.map((item, idx) => (
                <TouchableOpacity
                  key={item.id || idx}
                  style={[styles.inventoryRow, idx > 0 && styles.rowBorderTop]}
                  onPress={() => onNavigate('inventory')}
                  activeOpacity={0.7}
                >
                  <View style={styles.inventoryLeft}>
                    <Text style={styles.inventoryPercentage}>
                      {item.name}
                    </Text>
                    <Text style={styles.inventorySub}>
                      {item.storeName || 'Main Store'} • {item.category || 'General'}
                    </Text>
                  </View>
                  <View style={styles.inventoryRight}>
                    <Text style={styles.inventoryQty}>
                      {item.quantity} {item.unit || 'kg'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    gap: 14,
  },

  // 1. Top App Bar
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
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E7F3EB',
    borderWidth: 1,
    borderColor: '#C6E2D0',
    justifyContent: 'center',
    alignItems: 'center',
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

  // 2. Farm Selector Card
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

  // 3. Weather Banner
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

  // Common Card Styles
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  cardCount: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
  headerLinkTouch: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  headerLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  rowsContainer: {
    // container for rows
  },
  rowBorderTop: {
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
  },

  // 4. Active Crops Styles
  cropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  cropLeft: {
    flex: 1,
    paddingRight: 8,
  },
  cropNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  cropName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  cropVariety: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  cropMetaDot: {
    fontSize: 11,
    color: colors.textMuted,
  },
  cropMetaText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  cropMetaFarm: {
    fontSize: 11,
    color: colors.textMuted,
  },
  cropStageText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  cropRight: {
    alignItems: 'flex-end',
    width: 100,
  },
  cropDayText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: 4,
  },
  cropDayCurrent: {
    fontWeight: '700',
    color: colors.text,
  },
  cropDayTotal: {
    color: colors.textMuted,
  },
  progressBarTrack: {
    width: 90,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5ECE7',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.primary,
  },

  // 5. Inventory Status Styles
  inventoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  inventoryLeft: {
    flex: 1,
  },
  inventoryPercentage: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  inventorySub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  inventoryRight: {
    alignItems: 'flex-end',
  },
  inventoryQty: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },

  // 6. Stats Styles
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#F8FAF8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  statsCol: {
    flex: 1,
    alignItems: 'center',
  },
  statsDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  statsLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  statsValProduction: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondary,
  },
  statsValLosses: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  statsValExpenses: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },

  recentEntryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
    marginBottom: 8,
  },
  entryLeft: {
    flex: 1,
    paddingRight: 8,
  },
  entryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  entryMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  entryAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  netText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  netAmount: {
    fontWeight: '700',
    color: colors.primary,
  },
  recordEntryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  recordEntryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
