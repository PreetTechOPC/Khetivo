import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { Farm } from '../data/mockData';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AddFarmModal } from '../components/AddFarmModal';

interface ParcelsScreenProps {
  farms: Farm[];
  activeFarmId: string;
  onSelectFarm: (farmId: string) => void;
  onAddFarm?: (newFarm: Farm) => void;
  onBack: () => void;
  openAddModalOnMount?: boolean;
}

export const ParcelsScreen: React.FC<ParcelsScreenProps> = ({
  farms,
  activeFarmId,
  onSelectFarm,
  onAddFarm,
  onBack,
  openAddModalOnMount = false,
}) => {
  const [modalVisible, setModalVisible] = useState(openAddModalOnMount);

  useEffect(() => {
    if (openAddModalOnMount) {
      setModalVisible(true);
    }
  }, [openAddModalOnMount]);

  const totalAcres = farms.reduce((acc, f) => acc + f.totalArea, 0);

  const handleAddFarmComplete = (newFarm: Farm) => {
    if (onAddFarm) onAddFarm(newFarm);
    onSelectFarm(newFarm.id);
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>My Farms</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Sub Header Card */}
        <View style={styles.headerBlock}>
          <View style={styles.headerTitleWrap}>
            <View style={styles.titleRow}>
              <Text style={styles.mainTitle}>My Registered Farms</Text>
              <View style={styles.allFarmsBadge}>
                <Text style={styles.allFarmsBadgeText}>All Farms View Active</Text>
              </View>
            </View>
            <Text style={styles.mainSub}>
              Switch between individual farm holdings or view your combined multi-farm portfolio across Punjab.
            </Text>
          </View>

          <View style={styles.headerButtonsRow}>
            <TouchableOpacity
              style={styles.switchAllBtn}
              onPress={() => onSelectFarm('farm-1')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="layers-outline" size={14} color="#0C4B32" />
              <Text style={styles.switchAllBtnText}>All Farms ({totalAcres} Ac)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addFarmBtn}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.addFarmBtnText}>Add New Farm</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Farm Cards Grid */}
        <View style={styles.farmsList}>
          {farms.map((farm) => {
            const isSelected = farm.id === activeFarmId;
            return (
              <View
                key={farm.id}
                style={[
                  styles.farmCard,
                  isSelected && styles.farmCardSelected,
                ]}
              >
                <View style={styles.farmCardTop}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.farmNameRow}>
                      <MaterialCommunityIcons name="office-building" size={16} color="#0C4B32" />
                      <Text style={styles.farmNameText}>{farm.name}</Text>
                    </View>
                    <Text style={styles.farmAddressText}>📍 {farm.address}</Text>
                  </View>

                  {isSelected ? (
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>Active ✓</Text>
                    </View>
                  ) : (
                    <View style={styles.inactivePill}>
                      <Text style={styles.inactivePillText}>Inactive</Text>
                    </View>
                  )}
                </View>

                {/* 4 Sub-Boxes */}
                <View style={styles.subBoxesGrid}>
                  <View style={styles.subBox}>
                    <Text style={styles.subBoxLabel}>LAND HOLDING</Text>
                    <Text style={styles.subBoxVal}>
                      {farm.totalArea} {farm.areaUnit}
                    </Text>
                  </View>

                  <View style={styles.subBox}>
                    <Text style={styles.subBoxLabel}>OWNERSHIP</Text>
                    <Text style={styles.subBoxVal} numberOfLines={1}>
                      Owner / Ancestral
                    </Text>
                  </View>

                  <View style={styles.subBox}>
                    <Text style={styles.subBoxLabel}>SOIL PROFILE</Text>
                    <Text style={styles.subBoxVal} numberOfLines={1}>
                      {farm.soilType || 'Alluvial Loam'}
                    </Text>
                  </View>

                  <View style={styles.subBox}>
                    <Text style={styles.subBoxLabel}>IRRIGATION</Text>
                    <Text style={styles.subBoxVal} numberOfLines={1}>
                      {farm.irrigationType || 'Drip / Micro-Irrigation'}
                    </Text>
                  </View>
                </View>

                {/* GPS Telemetry row */}
                <View style={styles.gpsRow}>
                  <Ionicons name="navigate-outline" size={12} color="#0C4B32" />
                  <Text style={styles.gpsText}>
                    GPS: 30.5420°N, 76.0170°E • {farm.district}, Punjab
                  </Text>
                </View>

                {/* Select / Active Button */}
                <View style={styles.farmCardBottom}>
                  {isSelected ? (
                    <View style={styles.selectedBtn}>
                      <Text style={styles.selectedBtnText}>Currently Selected</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.switchBtn}
                      onPress={() => onSelectFarm(farm.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.switchBtnText}>Switch to this Farm</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}

          {/* Add Another Farm Dashed Card */}
          <TouchableOpacity
            style={styles.dashedAddCard}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.dashedAddIconBox}>
              <Ionicons name="add" size={24} color="#0C4B32" />
            </View>
            <Text style={styles.dashedAddTitle}>Add Another Farm</Text>
            <Text style={styles.dashedAddSub}>
              Configure new boundaries, soil characteristics, and irrigation.
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ADD FARM MODAL (Slide-up Bottom Sheet) */}
      <AddFarmModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddFarm={handleAddFarmComplete}
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

  headerBlock: {
    gap: 12,
  },
  headerTitleWrap: {
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#26352D',
  },
  allFarmsBadge: {
    backgroundColor: '#E7F3EB',
    borderWidth: 1,
    borderColor: '#C6E2D0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  allFarmsBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0C4B32',
  },
  mainSub: {
    fontSize: 12,
    color: '#55685D',
    lineHeight: 16,
  },
  headerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchAllBtn: {
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
  switchAllBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0C4B32',
  },
  addFarmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0C4B32',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addFarmBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  farmsList: {
    gap: 12,
  },
  farmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  farmCardSelected: {
    borderColor: '#0C4B32',
    borderWidth: 1.5,
  },
  farmCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  farmNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  farmNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26352D',
  },
  farmAddressText: {
    fontSize: 11,
    color: '#55685D',
    marginTop: 2,
  },
  activePill: {
    backgroundColor: '#E7F3EB',
    borderWidth: 1,
    borderColor: '#C6E2D0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0C4B32',
  },
  inactivePill: {
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  inactivePillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#55685D',
  },

  subBoxesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5ECE7',
  },
  subBox: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    borderRadius: 8,
    padding: 8,
    gap: 2,
  },
  subBoxLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#889B90',
  },
  subBoxVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#26352D',
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 2,
  },
  gpsText: {
    fontSize: 10,
    color: '#55685D',
    fontFamily: 'monospace',
  },
  farmCardBottom: {
    paddingTop: 6,
  },
  selectedBtn: {
    backgroundColor: '#E7F3EB',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0C4B32',
  },
  switchBtn: {
    backgroundColor: '#0C4B32',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  switchBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  dashedAddCard: {
    backgroundColor: '#FBFDFB',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C6E2D0',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  dashedAddIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E7F3EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dashedAddTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26352D',
  },
  dashedAddSub: {
    fontSize: 11,
    color: '#55685D',
    textAlign: 'center',
    maxWidth: 240,
  },
});
