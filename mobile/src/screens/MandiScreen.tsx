import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { colors } from '../theme/colors';
import { initialMandiRates, MandiRate } from '../data/mockData';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface MandiScreenProps {
  onBack: () => void;
}

export const MandiScreen: React.FC<MandiScreenProps> = ({ onBack }) => {
  const [rates] = useState<MandiRate[]>(initialMandiRates);
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const crops = ['All', 'Wheat', 'Basmati', 'Mustard', 'Potato'];

  const filteredRates = rates.filter((r) => {
    const matchesCrop =
      selectedCrop === 'All' ||
      r.crop.toLowerCase().includes(selectedCrop.toLowerCase());
    const matchesSearch =
      r.mandi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCrop && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Live APMC Mandi Rates</Text>
          <Text style={styles.headerSub}>Punjab & Haryana Government APMCs</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          placeholder="Search mandi or district (e.g. Khanna, Sirsa)..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipBar}
        contentContainerStyle={styles.chipBarContent}
      >
        {crops.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, selectedCrop === c && styles.chipActive]}
            onPress={() => setSelectedCrop(c)}
          >
            <Text style={[styles.chipText, selectedCrop === c && styles.chipTextActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Mandi Cards List */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {filteredRates.map((item) => {
          const diffMsp = item.modalPrice - item.msp;
          const isAboveMsp = diffMsp >= 0;

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.mandiNameWrap}>
                  <Text style={styles.mandiTitle}>{item.mandi}</Text>
                  <Text style={styles.mandiDist}>{item.district} • {item.date}</Text>
                </View>
                <View
                  style={[
                    styles.trendBadge,
                    {
                      backgroundColor:
                        item.trend === 'up'
                          ? colors.successBg
                          : item.trend === 'down'
                          ? colors.dangerBg
                          : colors.warningBg,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      item.trend === 'up'
                        ? 'trending-up'
                        : item.trend === 'down'
                        ? 'trending-down'
                        : 'trending-neutral'
                    }
                    size={14}
                    color={
                      item.trend === 'up'
                        ? colors.success
                        : item.trend === 'down'
                        ? colors.danger
                        : colors.warning
                    }
                  />
                  <Text
                    style={[
                      styles.trendText,
                      {
                        color:
                          item.trend === 'up'
                            ? colors.success
                            : item.trend === 'down'
                            ? colors.danger
                            : colors.warning,
                      },
                    ]}
                  >
                    {item.trend.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.cropDetailsRow}>
                <View>
                  <Text style={styles.cropName}>{item.crop}</Text>
                  <Text style={styles.cropVariety}>Var: {item.variety}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceModal}>₹{item.modalPrice.toLocaleString()}</Text>
                  <Text style={styles.pricePerQtl}>per Quintal (Modal)</Text>
                </View>
              </View>

              {/* Price Range & MSP diff */}
              <View style={styles.cardBottom}>
                <View style={styles.rangeBox}>
                  <Text style={styles.rangeText}>
                    Range: ₹{item.minPrice} - ₹{item.maxPrice}
                  </Text>
                </View>
                <View
                  style={[
                    styles.mspBadge,
                    { backgroundColor: isAboveMsp ? '#DCFCE7' : '#FEE2E2' },
                  ]}
                >
                  <Text
                    style={[
                      styles.mspBadgeText,
                      { color: isAboveMsp ? colors.secondary : colors.danger },
                    ]}
                  >
                    {isAboveMsp ? `+₹${diffMsp} above MSP` : `-₹${Math.abs(diffMsp)} below MSP`}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {filteredRates.length === 0 && (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="store-search-outline" size={40} color={colors.textLight} />
            <Text style={styles.emptyText}>No APMC Mandi rates found matching criteria.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  headerSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
  },
  chipBar: {
    maxHeight: 46,
    marginTop: 8,
  },
  chipBarContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mandiNameWrap: {
    flex: 1,
    marginRight: 8,
  },
  mandiTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  mandiDist: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 9,
    fontWeight: '800',
  },
  cropDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cropName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  cropVariety: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceModal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  pricePerQtl: {
    fontSize: 9,
    color: colors.textMuted,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rangeBox: {},
  rangeText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
  },
  mspBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  mspBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
  },
});

