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
import { Farm, initialAdvisories } from '../data/mockData';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface HomeScreenProps {
  currentFarm: Farm;
  farms: Farm[];
  onSelectFarm: () => void;
  onNavigate: (screen: string) => void;
  onOpenTutorial?: () => void;
  farmerName?: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentFarm,
  farms,
  onSelectFarm,
  onNavigate,
  farmerName = 'Mohan Lal',
}) => {
  const totalAcres = farms.reduce((acc, f) => acc + f.totalArea, 0);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================================= */}
        {/* 1. TOP APP BAR (Logo + Notification Bell)                                 */}
        {/* ========================================================================= */}
        <View style={styles.topAppBar}>
          <Image
            source={require('../../assets/logo-khetivo-cropped.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />

          <View style={styles.topRightActions}>
            {/* Account / Auth Button */}
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => onNavigate('auth')}
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

        {/* Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
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
});
