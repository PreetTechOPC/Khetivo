import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
} from 'react-native';
import { colors } from '../theme/colors';
import { initialFarms, initialInventory, Farm } from '../data/mockData';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAlert } from '../context/AlertContext';

interface ReportsScreenProps {
  farm?: Farm;
  onBack: () => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ onBack }) => {
  const { showSuccess, showInfo } = useAlert();
  const [reportViewMode, setReportViewMode] = useState<'chart' | 'table'>('chart');
  const [reportCategory, setReportCategory] = useState<'financial' | 'crops' | 'inputs' | 'machinery'>('financial');
  const [reportTimeframe, setReportTimeframe] = useState<'season' | 'month' | 'quarter' | 'year'>('season');
  const [farmFilter, setFarmFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock scoped data
  const totalCombinedArea = initialFarms.reduce((sum, f) => sum + f.totalArea, 0);

  const activeCrops = [
    { id: 'c-1', name: 'Wheat', variety: 'HD-3086 / Sharbati', area: 18, areaUnit: 'Acres', season: 'Rabi', sownDate: '2026-10-24', stage: 'Tillering', currentDay: 28, totalDays: 135, health: 'Vigorous', farmName: 'Khetivo Green Acres (Samrala)' },
    { id: 'c-2', name: 'Potato', variety: 'Kufri Pukhraj', area: 10, areaUnit: 'Acres', season: 'Rabi', sownDate: '2026-10-10', stage: 'Tuber Bulking', currentDay: 42, totalDays: 90, health: 'Optimal', farmName: 'Khetivo Green Acres (Samrala)' },
    { id: 'c-3', name: 'Mustard / Sarson', variety: 'Pusa Jai Kisan', area: 16, areaUnit: 'Acres', season: 'Rabi', sownDate: '2026-10-18', stage: 'Vegetative', currentDay: 35, totalDays: 120, health: 'Vigorous', farmName: 'Malwa Golden Fields (Sangrur)' },
    { id: 'c-4', name: 'Green Fodder', variety: 'Barseem', area: 8, areaUnit: 'Acres', season: 'Rabi', sownDate: '2026-11-01', stage: 'Multi-Cut', currentDay: 20, totalDays: 150, health: 'Good', farmName: 'Malwa Golden Fields (Sangrur)' },
  ];

  const financialTransactions = [
    { id: 'tx-1', date: '2026-10-28', type: 'production', title: 'Basmati 1121 Mandi Sale', category: 'Mandi Harvest Sale', amount: 1078000, status: 'Settled', farmName: 'Khetivo Green Acres' },
    { id: 'tx-2', date: '2026-11-01', type: 'expense', title: 'PBW-826 Certified Seeds', category: 'Seeds & Nursery', amount: 48500, status: 'Settled', farmName: 'Khetivo Green Acres' },
    { id: 'tx-3', date: '2026-11-03', type: 'expense', title: 'Basal DAP & MOP Fertilizers', category: 'Fertilizers', amount: 89200, status: 'Settled', farmName: 'Khetivo Green Acres' },
    { id: 'tx-4', date: '2026-11-05', type: 'expense', title: 'Diesel for Laser Leveler', category: 'Diesel & Fuel', amount: 32400, status: 'Settled', farmName: 'Malwa Golden Fields' },
    { id: 'tx-5', date: '2026-11-07', type: 'loss', title: 'Post-Harvest Sorting Moisture Loss', category: 'Crop Loss', amount: 12500, status: 'Settled', farmName: 'Khetivo Green Acres' },
  ];

  const equipmentList = [
    { id: 'eq-1', name: 'John Deere 5310 4WD (55 HP)', category: 'Tractor', operator: 'Gurmukh Ram', runtimeHours: 840, fuelSpec: '4.8 L/hr Diesel', status: 'Operational', nextService: '2026-12-15' },
    { id: 'eq-2', name: 'Sonalika DI 60 Sikander (60 HP)', category: 'Tractor', operator: 'Jaswinder Singh', runtimeHours: 620, fuelSpec: '5.2 L/hr Diesel', status: 'Operational', nextService: '2026-11-30' },
    { id: 'eq-3', name: 'Kirloskar 10HP Submersible Solar Pump', category: 'Irrigation Pump', operator: 'Harpreet Singh', runtimeHours: 410, fuelSpec: 'Solar / Grid Hybrid', status: 'Operational', nextService: '2027-01-10' },
    { id: 'eq-4', name: 'Rotavator & Laser Land Leveler', category: 'Implements', operator: 'Harnek Singh', runtimeHours: 70, fuelSpec: 'PTO Driven', status: 'Service Due', nextService: '2026-11-18' },
  ];

  // Aggregates
  const totalProduction = 1078000;
  const totalExpenses = 170100;
  const totalLosses = 12500;
  const netRealization = totalProduction - totalExpenses - totalLosses;
  const totalInventoryValuation = initialInventory.reduce((sum, item) => sum + item.quantity * item.rate, 0);

  const handleExportCSV = () => {
    let filename = `khetivo_${reportCategory}_report.csv`;
    showSuccess('CSV Exported', `Official file "${filename}" generated and ready to share or save.`);
  };

  const handlePrint = async () => {
    try {
      await Share.share({
        message: `Khetivo Official Audit Report (${reportCategory.toUpperCase()} - Rabi 2026-27) for Mohan Lal. Certified by PAU Agronomy Standards. Net Realization: ₹${netRealization.toLocaleString('en-IN')}`,
        title: 'Khetivo Farm Audit Report',
      });
    } catch {
      showInfo('Print Report', 'Ready to print or save as certified PDF statement.');
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Header (Exact from Web Dashboard lines 7939-7980) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>Farm Reports & Telemetry</Text>
            <View style={styles.auditBadge}>
              <Text style={styles.auditBadgeText}>Audit Ready</Text>
            </View>
          </View>
          <Text style={styles.headerSub}>
            Comprehensive farm audits, statements & input telemetry
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Controls: View Switcher (Chart vs Table) & Actions */}
        <View style={styles.controlsCard}>
          <View style={styles.controlsTopRow}>
            {/* View Switcher: Chart vs Table */}
            <View style={styles.viewToggleGroup}>
              <TouchableOpacity
                style={[
                  styles.viewToggleBtn,
                  reportViewMode === 'chart' && styles.viewToggleBtnActive,
                ]}
                onPress={() => setReportViewMode('chart')}
                activeOpacity={0.7}
              >
                <Feather
                  name="bar-chart-2"
                  size={14}
                  color={reportViewMode === 'chart' ? colors.primary : '#55685D'}
                />
                <Text
                  style={[
                    styles.viewToggleText,
                    reportViewMode === 'chart' && styles.viewToggleTextActive,
                  ]}
                >
                  Chart View
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.viewToggleBtn,
                  reportViewMode === 'table' && styles.viewToggleBtnActive,
                ]}
                onPress={() => setReportViewMode('table')}
                activeOpacity={0.7}
              >
                <Feather
                  name="file-text"
                  size={14}
                  color={reportViewMode === 'table' ? colors.primary : '#55685D'}
                />
                <Text
                  style={[
                    styles.viewToggleText,
                    reportViewMode === 'table' && styles.viewToggleTextActive,
                  ]}
                >
                  Table View
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick Action Buttons: Print & Export CSV */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.printBtn}
                onPress={handlePrint}
                activeOpacity={0.8}
              >
                <Feather name="printer" size={13} color="#55685D" />
                <Text style={styles.printBtnText}>Print</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exportBtn}
                onPress={handleExportCSV}
                activeOpacity={0.8}
              >
                <Feather name="download" size={13} color="#FFFFFF" />
                <Text style={styles.exportBtnText}>Export CSV</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. Category Pills Strip */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.categoryPill,
                reportCategory === 'financial' && styles.categoryPillActive,
              ]}
              onPress={() => setReportCategory('financial')}
            >
              <MaterialCommunityIcons
                name="receipt"
                size={14}
                color={reportCategory === 'financial' ? colors.primary : '#55685D'}
              />
              <Text
                style={[
                  styles.categoryPillText,
                  reportCategory === 'financial' && styles.categoryPillTextActive,
                ]}
              >
                Financial & P&L
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryPill,
                reportCategory === 'crops' && styles.categoryPillActive,
              ]}
              onPress={() => setReportCategory('crops')}
            >
              <MaterialCommunityIcons
                name="sprout"
                size={14}
                color={reportCategory === 'crops' ? colors.primary : '#55685D'}
              />
              <Text
                style={[
                  styles.categoryPillText,
                  reportCategory === 'crops' && styles.categoryPillTextActive,
                ]}
              >
                Crop Yield & Acreage
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryPill,
                reportCategory === 'inputs' && styles.categoryPillActive,
              ]}
              onPress={() => setReportCategory('inputs')}
            >
              <MaterialCommunityIcons
                name="package-variant-closed"
                size={14}
                color={reportCategory === 'inputs' ? colors.primary : '#55685D'}
              />
              <Text
                style={[
                  styles.categoryPillText,
                  reportCategory === 'inputs' && styles.categoryPillTextActive,
                ]}
              >
                Input Telemetry
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryPill,
                reportCategory === 'machinery' && styles.categoryPillActive,
              ]}
              onPress={() => setReportCategory('machinery')}
            >
              <MaterialCommunityIcons
                name="wrench"
                size={14}
                color={reportCategory === 'machinery' ? colors.primary : '#55685D'}
              />
              <Text
                style={[
                  styles.categoryPillText,
                  reportCategory === 'machinery' && styles.categoryPillTextActive,
                ]}
              >
                Machinery & Fleet
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Timeframe & Date Range Line */}
          <View style={styles.timeframeLine}>
            <View style={styles.periodPills}>
              {(['season', 'month', 'quarter', 'year'] as const).map((tf) => (
                <TouchableOpacity
                  key={tf}
                  style={[
                    styles.periodPill,
                    reportTimeframe === tf && styles.periodPillActive,
                  ]}
                  onPress={() => setReportTimeframe(tf)}
                >
                  <Text
                    style={[
                      styles.periodPillText,
                      reportTimeframe === tf && styles.periodPillTextActive,
                    ]}
                  >
                    {tf === 'season'
                      ? 'Rabi 2026-27'
                      : tf === 'month'
                      ? '30 Days'
                      : tf === 'quarter'
                      ? '90 Days'
                      : 'Full Year'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.dateRangeBadge}>
              <Feather name="calendar" size={11} color={colors.primary} />
              <Text style={styles.dateRangeText}>From: 2026-10-01 – To: 2026-11-11</Text>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* VIEW 1: CHART & ANALYTICS VIEW                                           */}
        {/* ========================================================================= */}
        {reportViewMode === 'chart' ? (
          <View style={styles.chartsContainer}>
            {/* 1. FINANCIAL CHARTS */}
            {reportCategory === 'financial' && (
              <View style={styles.sectionGap}>
                {/* 4 Metric Summary Cards */}
                <View style={styles.metricGrid}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricBoxLabel}>Net Realization</Text>
                    <Text style={[styles.metricBoxVal, { color: colors.primary }]}>
                      ₹{netRealization.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.metricBoxSubGreen}>↑ 83.1% Net Farm Margin</Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={styles.metricBoxLabel}>Production Inflow</Text>
                    <Text style={[styles.metricBoxVal, { color: '#047857' }]}>
                      ₹{totalProduction.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.metricBoxSubMuted}>Harvest & Mandi sales</Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={styles.metricBoxLabel}>Crop Losses & Damage</Text>
                    <Text style={[styles.metricBoxVal, { color: '#B45309' }]}>
                      ₹{totalLosses.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.metricBoxSubAmber}>Lodging & Sorting losses</Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={styles.metricBoxLabel}>Operating Expenses</Text>
                    <Text style={[styles.metricBoxVal, { color: '#DC2626' }]}>
                      ₹{totalExpenses.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.metricBoxSubMuted}>Inputs, Diesel, Labor</Text>
                  </View>
                </View>

                {/* Monthly Inflow vs Outflow Bar Chart */}
                <View style={styles.chartCard}>
                  <View style={styles.chartHeader}>
                    <View>
                      <Text style={styles.chartTitle}>Monthly Inflow vs Outflow</Text>
                      <Text style={styles.chartSubtitle}>Production realizations vs input costs</Text>
                    </View>
                    <View style={styles.legendRow}>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendBox, { backgroundColor: colors.primary }]} />
                        <Text style={styles.legendText}>Inflow</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendBox, { backgroundColor: '#E06D53' }]} />
                        <Text style={styles.legendText}>Outflow</Text>
                      </View>
                    </View>
                  </View>

                  {/* Chart Bars */}
                  <View style={styles.barGraphArea}>
                    {[
                      { month: 'May', inVal: 180, outVal: 75 },
                      { month: 'Jun', inVal: 240, outVal: 110 },
                      { month: 'Jul', inVal: 310, outVal: 95 },
                      { month: 'Aug', inVal: 290, outVal: 120 },
                      { month: 'Sep', inVal: 420, outVal: 140 },
                      { month: 'Oct', inVal: 516, outVal: 121 },
                    ].map((d) => (
                      <View key={d.month} style={styles.barColumn}>
                        <View style={styles.barPair}>
                          <View
                            style={[
                              styles.singleBar,
                              { height: (d.inVal / 600) * 110, backgroundColor: colors.primary },
                            ]}
                          />
                          <View
                            style={[
                              styles.singleBar,
                              { height: (d.outVal / 600) * 110, backgroundColor: '#E06D53' },
                            ]}
                          />
                        </View>
                        <Text style={styles.barMonthText}>{d.month}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.chartFooterNote}>
                    Scale: ₹ Thousands (INR) • Peak realization: Oct (Harvest Settlement)
                  </Text>
                </View>

                {/* Expense Allocation Distribution */}
                <View style={styles.chartCard}>
                  <View style={styles.chartHeader}>
                    <View>
                      <Text style={styles.chartTitle}>Expense Allocation</Text>
                      <Text style={styles.chartSubtitle}>5 Categorized operational farm outflow centers</Text>
                    </View>
                  </View>

                  <View style={styles.breakdownList}>
                    {[
                      { name: 'Seeds & Certified Nursery', amount: 28800, pct: 30, color: colors.primary },
                      { name: 'Labor & Field Sowing Wages', amount: 24000, pct: 25, color: '#059669' },
                      { name: 'Fertilizers & Nutrients', amount: 19400, pct: 20, color: '#F9B21B' },
                      { name: 'Diesel & Machine Fuel', amount: 18450, pct: 19, color: '#2563EB' },
                      { name: 'Machinery Spares & Repairs', amount: 8600, pct: 6, color: '#7C3AED' },
                    ].map((item) => (
                      <View key={item.name} style={styles.progressRow}>
                        <View style={styles.progressRowHeader}>
                          <Text style={styles.progressItemName}>{item.name}</Text>
                          <Text style={styles.progressItemVal}>₹{item.amount.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.progressBarTrack}>
                          <View
                            style={[
                              styles.progressBarFill,
                              { width: `${item.pct}%`, backgroundColor: item.color },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressPctText}>{item.pct}% of total expense</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.summaryFooterStrip}>
                    <Text style={styles.summaryFooterLabel}>Average Cost per Acre</Text>
                    <Text style={styles.summaryFooterVal}>
                      ₹{Math.round(totalExpenses / (totalCombinedArea || 1)).toLocaleString('en-IN')} / Acre
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* 2. CROPS PERFORMANCE CHARTS */}
            {reportCategory === 'crops' && (
              <View style={styles.sectionGap}>
                <View style={styles.metricGrid}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricBoxLabel}>Cultivated Land</Text>
                    <Text style={[styles.metricBoxVal, { color: colors.primary }]}>{totalCombinedArea} Acres</Text>
                    <Text style={styles.metricBoxSubMuted}>Across all holdings</Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={styles.metricBoxLabel}>Active Crops</Text>
                    <Text style={[styles.metricBoxVal, { color: '#047857' }]}>{activeCrops.length} Varieties</Text>
                    <Text style={styles.metricBoxSubGreen}>Multi-crop rotation</Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={styles.metricBoxLabel}>Projected Yield</Text>
                    <Text style={styles.metricBoxVal}>1,420 Quintals</Text>
                    <Text style={styles.metricBoxSubMuted}>Expected total harvest</Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={styles.metricBoxLabel}>Canopy Health</Text>
                    <Text style={[styles.metricBoxVal, { color: colors.primary }]}>95.4%</Text>
                    <Text style={styles.metricBoxSubGreen}>Optimal NDVI biomass</Text>
                  </View>
                </View>

                {/* Acreage Distribution */}
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Acreage Distribution</Text>
                  <Text style={styles.chartSubtitle}>Area allocation across registered crops</Text>
                  <View style={styles.breakdownList}>
                    {activeCrops.map((c) => {
                      const pct = Math.round((c.area / (totalCombinedArea || 1)) * 100);
                      return (
                        <View key={c.id} style={styles.progressRow}>
                          <View style={styles.progressRowHeader}>
                            <Text style={styles.progressItemName}>{c.name} ({c.variety})</Text>
                            <Text style={styles.progressItemVal}>{c.area} Acres ({pct}%)</Text>
                          </View>
                          <View style={styles.progressBarTrack}>
                            <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
                          </View>
                          <View style={styles.progressSubMeta}>
                            <Text style={styles.progressMetaText}>Season: {c.season}</Text>
                            <Text style={styles.progressMetaText}>Health: {c.health}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Growth Stage Progress */}
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Growth Stage Timeline</Text>
                  <Text style={styles.chartSubtitle}>Crop lifecycle progress towards harvest</Text>
                  <View style={styles.breakdownList}>
                    {activeCrops.map((c) => {
                      const prog = Math.round((c.currentDay / c.totalDays) * 100);
                      return (
                        <View key={c.id} style={styles.cropStageProgressCard}>
                          <View style={styles.progressRowHeader}>
                            <Text style={styles.progressItemName}>{c.name}</Text>
                            <Text style={[styles.progressItemVal, { color: colors.primary }]}>
                              Day {c.currentDay} / {c.totalDays} ({prog}%)
                            </Text>
                          </View>
                          <View style={styles.progressBarTrack}>
                            <View style={[styles.progressBarFill, { width: `${prog}%`, backgroundColor: '#059669' }]} />
                          </View>
                          <Text style={styles.stageLabelText}>Stage: {c.stage}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* 3. INPUT INVENTORY CHARTS */}
            {reportCategory === 'inputs' && (
              <View style={styles.sectionGap}>
                <View style={styles.metricGrid}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricBoxLabel}>Inventory Valuation</Text>
                    <Text style={[styles.metricBoxVal, { color: colors.primary }]}>
                      ₹{totalInventoryValuation.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.metricBoxSubMuted}>{initialInventory.length} Tracked SKUs</Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={styles.metricBoxLabel}>Chemical Safety</Text>
                    <Text style={[styles.metricBoxVal, { color: '#047857' }]}>98%</Text>
                    <Text style={styles.metricBoxSubGreen}>Compliant standards</Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={styles.metricBoxLabel}>Low Stock Alerts</Text>
                    <Text style={[styles.metricBoxVal, { color: '#B45309' }]}>1 Items</Text>
                    <Text style={styles.metricBoxSubAmber}>Below threshold</Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={styles.metricBoxLabel}>Expiring Batches</Text>
                    <Text style={[styles.metricBoxVal, { color: '#DC2626' }]}>1 Batches</Text>
                    <Text style={styles.metricBoxSubMuted}>Next 30-day window</Text>
                  </View>
                </View>

                {/* Stock Level vs Thresholds */}
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Stock Level vs Reorder Threshold</Text>
                  <Text style={styles.chartSubtitle}>Real-time input levels across store godowns</Text>
                  <View style={styles.breakdownList}>
                    {initialInventory.map((item) => {
                      const isLow = item.quantity <= item.lowStockThreshold;
                      const ratio = Math.min(100, Math.round((item.quantity / (item.lowStockThreshold * 2.5)) * 100));
                      return (
                        <View key={item.id} style={styles.stockItemBox}>
                          <View style={styles.progressRowHeader}>
                            <Text style={styles.progressItemName}>{item.name}</Text>
                            <View style={[styles.stockPill, isLow ? styles.stockPillLow : styles.stockPillGood]}>
                              <Text style={[styles.stockPillText, isLow ? { color: '#B45309' } : { color: '#047857' }]}>
                                {isLow ? 'Low Stock' : 'Healthy Stock'}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.progressBarTrack}>
                            <View
                              style={[
                                styles.progressBarFill,
                                { width: `${ratio}%`, backgroundColor: isLow ? '#D97706' : colors.primary },
                              ]}
                            />
                          </View>
                          <View style={styles.progressSubMeta}>
                            <Text style={styles.progressMetaText}>
                              Stock: <Text style={{ fontWeight: '700', color: '#26352D' }}>{item.quantity} {item.unit}</Text>
                            </Text>
                            <Text style={styles.progressMetaText}>Reorder: {item.lowStockThreshold} {item.unit}</Text>
                            <Text style={styles.progressMetaText}>Rate: ₹{item.rate}/{item.unit}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* 4. MACHINERY & FLEET CHARTS */}
            {reportCategory === 'machinery' && (
              <View style={styles.sectionGap}>
                <View style={styles.metricGrid}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricBoxLabel}>Fleet Operational</Text>
                    <Text style={[styles.metricBoxVal, { color: colors.primary }]}>3 / 4 Units</Text>
                    <Text style={styles.metricBoxSubGreen}>Active field ready</Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={styles.metricBoxLabel}>Cumulative Runtime</Text>
                    <Text style={styles.metricBoxVal}>1,940 Hours</Text>
                    <Text style={styles.metricBoxSubMuted}>Total fleet hours</Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={styles.metricBoxLabel}>Service Due</Text>
                    <Text style={[styles.metricBoxVal, { color: '#B45309' }]}>1 Machines</Text>
                    <Text style={styles.metricBoxSubAmber}>Scheduled maintenance</Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={styles.metricBoxLabel}>Reported Issues</Text>
                    <Text style={[styles.metricBoxVal, { color: '#DC2626' }]}>1 Reports</Text>
                    <Text style={styles.metricBoxSubMuted}>Pending review</Text>
                  </View>
                </View>

                {/* Runtime Comparison */}
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Engine Runtime Comparison</Text>
                  <Text style={styles.chartSubtitle}>Recorded operational hours per registered machine</Text>
                  <View style={styles.breakdownList}>
                    {equipmentList.map((eq) => {
                      const pct = Math.min(100, Math.round((eq.runtimeHours / 1500) * 100));
                      return (
                        <View key={eq.id} style={styles.progressRow}>
                          <View style={styles.progressRowHeader}>
                            <Text style={styles.progressItemName}>{eq.name}</Text>
                            <Text style={[styles.progressItemVal, { color: colors.primary }]}>
                              {eq.runtimeHours} Engine Hours
                            </Text>
                          </View>
                          <View style={styles.progressBarTrack}>
                            <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
                          </View>
                          <View style={styles.progressSubMeta}>
                            <Text style={styles.progressMetaText}>Operator: {eq.operator}</Text>
                            <Text style={styles.progressMetaText}>Fuel: {eq.fuelSpec}</Text>
                            <Text style={styles.progressMetaText}>Next: {eq.nextService}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}
          </View>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: DATA TABLE VIEW (Exact from Web Dashboard lines 8680-8950)       */
          /* ========================================================================= */
          <View style={styles.tableCard}>
            {/* Table for Financial */}
            {reportCategory === 'financial' && (
              <View style={styles.tableContainer}>
                {financialTransactions.map((tx, idx) => (
                  <View key={tx.id} style={[styles.tableRow, idx > 0 && styles.tableRowBorder]}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.tableTopLine}>
                        <View
                          style={[
                            styles.tableTypeBadge,
                            tx.type === 'production'
                              ? styles.badgeProd
                              : tx.type === 'loss'
                              ? styles.badgeLoss
                              : styles.badgeExp,
                          ]}
                        >
                          <Text
                            style={[
                              styles.tableTypeBadgeText,
                              tx.type === 'production'
                                ? { color: '#065F46' }
                                : tx.type === 'loss'
                                ? { color: '#92400E' }
                                : { color: '#991B1B' },
                            ]}
                          >
                            {tx.type}
                          </Text>
                        </View>
                        <Text style={styles.tableRowTitle}>{tx.title}</Text>
                      </View>
                      <Text style={styles.tableRowSub}>
                        {tx.date} • {tx.category} • {tx.farmName}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        style={[
                          styles.tableRowAmount,
                          tx.type === 'production'
                            ? { color: '#047857' }
                            : tx.type === 'loss'
                            ? { color: '#B45309' }
                            : { color: '#DC2626' },
                        ]}
                      >
                        {tx.type === 'production' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </Text>
                      <View style={styles.settledBadge}>
                        <Text style={styles.settledBadgeText}>{tx.status}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Table for Crops */}
            {reportCategory === 'crops' && (
              <View style={styles.tableContainer}>
                {activeCrops.map((c, idx) => (
                  <View key={c.id} style={[styles.tableRow, idx > 0 && styles.tableRowBorder]}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.tableTopLine}>
                        <Text style={styles.tableRowTitle}>{c.name}</Text>
                        <Text style={styles.tableRowVariety}>({c.variety})</Text>
                      </View>
                      <Text style={styles.tableRowSub}>
                        {c.farmName} • {c.season} • Sown: {c.sownDate}
                      </Text>
                      <Text style={styles.tableRowStage}>
                        Stage: {c.stage} (Day {c.currentDay} of {c.totalDays})
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={styles.tableRowArea}>{c.area} {c.areaUnit}</Text>
                      <View style={styles.healthBadge}>
                        <Text style={styles.healthBadgeText}>{c.health}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Table for Inputs */}
            {reportCategory === 'inputs' && (
              <View style={styles.tableContainer}>
                {initialInventory.map((item, idx) => (
                  <View key={item.id} style={[styles.tableRow, idx > 0 && styles.tableRowBorder]}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.tableTopLine}>
                        <Text style={styles.tableRowTitle}>{item.name}</Text>
                        <View style={styles.catMiniBadge}>
                          <Text style={styles.catMiniBadgeText}>{item.category}</Text>
                        </View>
                      </View>
                      <Text style={styles.tableRowSub}>
                        Godown: {item.storeName} • Expiry: {item.expiryDate || 'N/A'}
                      </Text>
                      <Text style={styles.tableRowRate}>
                        Rate: ₹{item.rate}/{item.unit} • Threshold: {item.lowStockThreshold} {item.unit}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={styles.tableRowQty}>{item.quantity} {item.unit}</Text>
                      <Text style={styles.tableRowVal}>₹{(item.quantity * item.rate).toLocaleString('en-IN')}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Table for Machinery */}
            {reportCategory === 'machinery' && (
              <View style={styles.tableContainer}>
                {equipmentList.map((eq, idx) => (
                  <View key={eq.id} style={[styles.tableRow, idx > 0 && styles.tableRowBorder]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tableRowTitle}>{eq.name}</Text>
                      <Text style={styles.tableRowSub}>
                        Operator: {eq.operator} • Category: {eq.category}
                      </Text>
                      <Text style={styles.tableRowFuel}>
                        Fuel: {eq.fuelSpec} • Next Service: {eq.nextService}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={styles.tableRowHours}>{eq.runtimeHours} hrs</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          eq.status === 'Operational' ? styles.statusBadgeGood : styles.statusBadgeDue,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            eq.status === 'Operational' ? { color: '#065F46' } : { color: '#92400E' },
                          ]}
                        >
                          {eq.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#26352D' },
  auditBadge: {
    backgroundColor: '#E7F3EB',
    borderWidth: 1,
    borderColor: '#C6E2D0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  auditBadgeText: { fontSize: 10, fontWeight: '700', color: colors.primary },
  headerSub: { fontSize: 11, color: '#55685D', marginTop: 1 },

  scroll: { flex: 1 },
  scrollContent: { padding: 14, gap: 12 },

  // Top Controls Card
  controlsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 14,
    gap: 12,
  },
  controlsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F4F8F4',
    padding: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE6DE',
  },
  viewToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewToggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  viewToggleText: { fontSize: 11, fontWeight: '600', color: '#55685D' },
  viewToggleTextActive: { color: colors.primary, fontWeight: '700' },

  actionButtonsRow: { flexDirection: 'row', gap: 6 },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  printBtnText: { fontSize: 11, fontWeight: '600', color: '#26352D' },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  exportBtnText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },

  // Category Pills Strip
  categoryScroll: { marginHorizontal: -4 },
  categoryScrollContent: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderTopWidth: 1,
    borderTopColor: '#F4F8F4',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCE6DE',
    backgroundColor: '#F8FAF8',
  },
  categoryPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  categoryPillText: { fontSize: 11, fontWeight: '600', color: '#55685D' },
  categoryPillTextActive: { color: colors.primary, fontWeight: '700' },

  timeframeLine: {
    flexDirection: 'column',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#F4F8F4',
    paddingTop: 8,
  },
  periodPills: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  periodPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DCE6DE',
    backgroundColor: '#F8FAF8',
  },
  periodPillActive: {
    backgroundColor: '#E7F3EB',
    borderColor: colors.primary,
  },
  periodPillText: { fontSize: 10, color: '#55685D' },
  periodPillTextActive: { color: colors.primary, fontWeight: '700' },
  dateRangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAF8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  dateRangeText: { fontSize: 10, color: '#55685D' },

  // Chart Container
  chartsContainer: { gap: 12 },
  sectionGap: { gap: 12 },

  // 4 Metric Summary Cards
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricBox: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 12,
  },
  metricBoxLabel: { fontSize: 11, color: '#55685D', fontWeight: '500' },
  metricBoxVal: { fontSize: 16, fontWeight: '700', color: '#26352D', marginTop: 3 },
  metricBoxSubGreen: { fontSize: 10, color: '#047857', fontWeight: '600', marginTop: 3 },
  metricBoxSubAmber: { fontSize: 10, color: '#B45309', fontWeight: '600', marginTop: 3 },
  metricBoxSubMuted: { fontSize: 10, color: '#889B90', marginTop: 3 },

  // Chart Cards
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 14,
    gap: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  chartTitle: { fontSize: 13, fontWeight: '700', color: '#26352D' },
  chartSubtitle: { fontSize: 10, color: '#55685D', marginTop: 1 },
  legendRow: { flexDirection: 'row', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendBox: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 10, color: '#55685D' },

  // Monthly Bar Graph
  barGraphArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 130,
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
    paddingBottom: 4,
    paddingTop: 10,
  },
  barColumn: { alignItems: 'center', flex: 1 },
  barPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 110,
    justifyContent: 'center',
  },
  singleBar: {
    width: 12,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barMonthText: { fontSize: 10, color: '#55685D', marginTop: 6, fontWeight: '600' },
  chartFooterNote: { fontSize: 10, color: '#889B90' },

  // Breakdown List
  breakdownList: { gap: 10 },
  progressRow: { gap: 4 },
  progressRowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressItemName: { fontSize: 11, fontWeight: '600', color: '#26352D' },
  progressItemVal: { fontSize: 11, fontWeight: '700', color: colors.primary },
  progressBarTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5ECE7',
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressPctText: { fontSize: 9, color: '#889B90', textAlign: 'right' },
  progressSubMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  progressMetaText: { fontSize: 10, color: '#55685D' },

  cropStageProgressCard: {
    padding: 10,
    backgroundColor: '#F8FAF8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    gap: 5,
  },
  stageLabelText: { fontSize: 10, color: '#047857', fontWeight: '500' },

  stockItemBox: {
    padding: 10,
    backgroundColor: '#F8FAF8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    gap: 5,
  },
  stockPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  stockPillGood: { backgroundColor: '#D1FAE5' },
  stockPillLow: { backgroundColor: '#FEF3C7' },
  stockPillText: { fontSize: 9, fontWeight: '700' },

  summaryFooterStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F4F8F4',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5ECE7',
  },
  summaryFooterLabel: { fontSize: 11, color: '#55685D' },
  summaryFooterVal: { fontSize: 12, fontWeight: '700', color: '#26352D' },

  // Table Card
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    overflow: 'hidden',
  },
  tableContainer: { paddingHorizontal: 14 },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 10,
  },
  tableRowBorder: { borderTopWidth: 1, borderTopColor: '#E5ECE7' },
  tableTopLine: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  tableTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeProd: { backgroundColor: '#ECFDF5' },
  badgeLoss: { backgroundColor: '#FFFBEB' },
  badgeExp: { backgroundColor: '#FEF2F2' },
  tableTypeBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'capitalize' },
  tableRowTitle: { fontSize: 12, fontWeight: '700', color: '#26352D' },
  tableRowVariety: { fontSize: 11, color: '#55685D' },
  tableRowSub: { fontSize: 10, color: '#55685D', marginTop: 2 },
  tableRowStage: { fontSize: 10, color: '#047857', fontWeight: '500', marginTop: 2 },
  tableRowRate: { fontSize: 10, color: '#55685D', marginTop: 2 },
  tableRowFuel: { fontSize: 10, color: '#55685D', marginTop: 2 },
  tableRowAmount: { fontSize: 13, fontWeight: '700' },
  settledBadge: {
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  settledBadgeText: { fontSize: 9, color: '#55685D', fontWeight: '600' },

  tableRowArea: { fontSize: 12, fontWeight: '700', color: colors.primary },
  healthBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#A7F3D0' },
  healthBadgeText: { fontSize: 9, fontWeight: '700', color: '#065F46' },

  catMiniBadge: { backgroundColor: '#E7F3EB', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  catMiniBadgeText: { fontSize: 9, color: colors.primary, fontWeight: '600' },
  tableRowQty: { fontSize: 12, fontWeight: '700', color: '#26352D' },
  tableRowVal: { fontSize: 11, fontWeight: '600', color: colors.primary },

  tableRowHours: { fontSize: 12, fontWeight: '700', color: colors.primary },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  statusBadgeGood: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  statusBadgeDue: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  statusBadgeText: { fontSize: 9, fontWeight: '700' },
});
