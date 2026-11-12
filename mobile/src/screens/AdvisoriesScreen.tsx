import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { colors } from '../theme/colors';
import { initialAdvisories, Advisory } from '../data/mockData';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface AdvisoriesScreenProps {
  onBack: () => void;
}

export const AdvisoriesScreen: React.FC<AdvisoriesScreenProps> = ({ onBack }) => {
  const [advisories] = useState<Advisory[]>(initialAdvisories);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'pest' | 'weather'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = advisories.filter((a) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'pest') return a.category.toLowerCase().includes('pest') || a.category.toLowerCase().includes('disease');
    if (categoryFilter === 'weather') return a.category.toLowerCase().includes('weather') || a.category.toLowerCase().includes('frost');
    return true;
  });

  const handleShare = async (item: Advisory) => {
    try {
      await Share.share({
        message: `🚨 *PAU Advisory: ${item.title}*\n${item.message}\nPrescription: ${item.actionPrescription}\nDispatched by: ${item.dispatchedBy}`,
      });
    } catch {
      Alert.alert('Shared', 'Advisory copied to share.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Crop Advisories</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Simple Sober Header Card (Matching Web Dashboard Screenshot) */}
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View style={styles.titleWrap}>
              <View style={styles.titleWithBadge}>
                <Text style={styles.headerTitle}>Crop Advisories & Bulletins</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>{advisories.length} Active</Text>
                </View>
              </View>
              <Text style={styles.headerSub}>
                PAU university recommendations and pest warnings for All Farms (Consolidated) (All Districts).
              </Text>
            </View>
          </View>

          {/* Category Filter Buttons */}
          <View style={styles.filterRow}>
            {[
              { id: 'all', label: 'All' },
              { id: 'pest', label: 'Pest & Disease' },
              { id: 'weather', label: 'Weather' },
            ].map((tab) => {
              const active = categoryFilter === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.filterBtn, active ? styles.filterBtnActive : styles.filterBtnInactive]}
                  onPress={() => setCategoryFilter(tab.id as any)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterBtnText, active ? styles.filterBtnTextActive : styles.filterBtnTextInactive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Advisories Feed List */}
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-circle-outline" size={36} color="#0C4B32" />
            <Text style={styles.emptyTitle}>No Active Advisories</Text>
            <Text style={styles.emptySub}>
              There are currently no active alerts in this category for your area.
            </Text>
            <TouchableOpacity onPress={() => setCategoryFilter('all')} style={styles.emptyAction}>
              <Text style={styles.emptyActionText}>View all categories</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardsList}>
            {filtered.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() => setExpandedId(isExpanded ? null : item.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#889B90"
                    />
                  </View>

                  <Text style={styles.cardMessage}>{item.message}</Text>

                  {/* Expanded View with Full Prescription & Share */}
                  {isExpanded && (
                    <View style={styles.expandedSection}>
                      {item.actionPrescription && (
                        <View style={styles.prescBox}>
                          <View style={styles.prescHeader}>
                            <MaterialCommunityIcons name="clipboard-check" size={14} color="#0C4B32" />
                            <Text style={styles.prescTitle}>Recommended Action / Prescription:</Text>
                          </View>
                          <Text style={styles.prescText}>{item.actionPrescription}</Text>
                        </View>
                      )}

                      <View style={styles.cardFooter}>
                        <View style={styles.metaRow}>
                          <Text style={styles.metaText}>📍 {item.targetDistrict}</Text>
                          {item.targetCrop && (
                            <Text style={styles.metaText}>🌾 {item.targetCrop}</Text>
                          )}
                        </View>

                        <TouchableOpacity
                          style={styles.shareBtn}
                          onPress={() => handleShare(item)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="share-social-outline" size={14} color="#0C4B32" />
                          <Text style={styles.shareBtnText}>Share</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
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

  // Simple Sober Header Card
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  headerTopRow: {
    flexDirection: 'column',
    gap: 6,
  },
  titleWrap: { flex: 1 },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#26352D',
  },
  activeBadge: {
    backgroundColor: '#E7F3EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0C4B32',
  },
  headerSub: {
    fontSize: 12,
    color: '#55685D',
    marginTop: 4,
    lineHeight: 17,
  },

  // Category Filter Row
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterBtnActive: {
    backgroundColor: '#0C4B32',
  },
  filterBtnInactive: {
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterBtnTextActive: {
    color: '#FFFFFF',
  },
  filterBtnTextInactive: {
    color: '#55685D',
  },

  // Cards List
  cardsList: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26352D',
    flex: 1,
    lineHeight: 20,
  },
  cardMessage: {
    fontSize: 12,
    color: '#55685D',
    lineHeight: 18,
  },

  // Expanded Section
  expandedSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
    gap: 10,
  },
  prescBox: {
    backgroundColor: '#F8FAF8',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    gap: 4,
  },
  prescHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  prescTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0C4B32',
  },
  prescText: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaText: {
    fontSize: 11,
    color: '#55685D',
    fontWeight: '500',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#E7F3EB',
  },
  shareBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0C4B32',
  },

  // Empty State
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26352D',
  },
  emptySub: {
    fontSize: 12,
    color: '#55685D',
    textAlign: 'center',
    lineHeight: 17,
  },
  emptyAction: {
    marginTop: 6,
  },
  emptyActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0C4B32',
  },
});
