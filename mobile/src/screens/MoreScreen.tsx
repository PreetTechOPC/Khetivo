import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface MoreScreenProps {
  onNavigate: (screen: string) => void;
  onOpenTutorial: () => void;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({ onNavigate, onOpenTutorial }) => {
  const dailyItems = [
    {
      id: 'advisories',
      title: 'Advisories & Alerts',
      subtitle: 'Crop outbreak alerts & PAU advisories',
      icon: 'radio-outline',
      color: '#DC2626',
      bgColor: '#FEE2E2',
    },
    {
      id: 'weather',
      title: 'Weather',
      subtitle: 'Hyper-local farm GPS & 7-day forecast',
      icon: 'weather-partly-cloudy',
      color: '#D97706',
      bgColor: '#FEF3C7',
      isMci: true,
    },
    {
      id: 'tasks',
      title: 'Tasks',
      subtitle: 'Field operations & calendar schedules',
      icon: 'checkbox-marked-outline',
      color: colors.primary,
      bgColor: '#E7F3EB',
      isMci: true,
    },
    {
      id: 'inventory',
      title: 'Inventory',
      subtitle: 'Seeds, agrochemicals & hardware stock',
      icon: 'package-variant-closed',
      color: '#7C3AED',
      bgColor: '#F3E8FF',
      isMci: true,
    },
    {
      id: 'equipment',
      title: 'Equipment',
      subtitle: 'Fleet tracking, maintenance & machinery',
      icon: 'tractor',
      color: '#15803D',
      bgColor: '#DCFCE7',
      isMci: true,
    },
  ];

  const recordsItems = [
    {
      id: 'crops',
      title: 'Crop Management',
      subtitle: 'Crop planning, stages & timelines',
      icon: 'sprout',
      color: '#15803D',
      bgColor: '#DCFCE7',
      isMci: true,
    },
    {
      id: 'stats',
      title: 'Stats',
      subtitle: 'Production, losses & operating expenses',
      icon: 'receipt',
      color: colors.primary,
      bgColor: '#E7F3EB',
      isMci: true,
    },
    {
      id: 'reports',
      title: 'Reports',
      subtitle: 'Certified farm audit statements & telemetry',
      icon: 'document-text-outline',
      color: '#0284C7',
      bgColor: '#E0F2FE',
    },
  ];

  const manageItems = [
    {
      id: 'my-farms',
      title: 'My Farms',
      subtitle: 'All registered holdings & GPS land parcels',
      icon: 'business-outline',
      color: colors.primary,
      bgColor: '#E7F3EB',
    },
    {
      id: 'team',
      title: 'Team',
      subtitle: 'Workforce directory, roles & field scouts',
      icon: 'people-outline',
      color: '#2563EB',
      bgColor: '#EFF6FF',
    },
    {
      id: 'subscription',
      title: 'Subscription / Plan',
      subtitle: 'Active plan, acreage quota & invoices',
      icon: 'shield-checkmark-outline',
      color: '#D97706',
      bgColor: '#FEF3C7',
    },
    {
      id: 'support',
      title: 'Support',
      subtitle: '24/7 Agronomist helpline & WhatsApp desk',
      icon: 'help-buoy-outline',
      color: colors.secondary,
      bgColor: '#DCFCE7',
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Farmer profile, units & language preferences',
      icon: 'settings-outline',
      color: '#4B5563',
      bgColor: '#F3F4F6',
    },
    {
      id: 'auth',
      title: 'Farmer Account / Sign In',
      subtitle: 'Gmail, Farmer ID & Google sign-in / registration',
      icon: 'person-circle-outline',
      color: '#059669',
      bgColor: '#D1FAE5',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Modules & Features</Text>
        <Text style={styles.headerSub}>Manage holdings, records & preferences</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* DAILY SECTION */}
        <Text style={styles.sectionHeader}>DAILY</Text>
        <View style={styles.menuList}>
          {dailyItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => onNavigate(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, { backgroundColor: item.bgColor }]}>
                {item.isMci ? (
                  <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
                ) : (
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSub}>{item.subtitle}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* RECORDS SECTION */}
        <Text style={[styles.sectionHeader, { marginTop: 8 }]}>RECORDS</Text>
        <View style={styles.menuList}>
          {recordsItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => onNavigate(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, { backgroundColor: item.bgColor }]}>
                {item.isMci ? (
                  <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
                ) : (
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSub}>{item.subtitle}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* MANAGE SECTION */}
        <Text style={[styles.sectionHeader, { marginTop: 8 }]}>MANAGE</Text>
        <View style={styles.menuList}>
          {manageItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => onNavigate(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, { backgroundColor: item.bgColor }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSub}>{item.subtitle}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* WATCH VIDEO TUTORIAL */}
        <TouchableOpacity
          style={styles.tutorialCard}
          onPress={onOpenTutorial}
          activeOpacity={0.85}
        >
          <View style={styles.playWrap}>
            <Ionicons name="play" size={16} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tutorialTitle}>Watch Video Tutorial</Text>
            <Text style={styles.tutorialSub}>Learn how to manage your crops & farm holdings</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.primary} />
        </TouchableOpacity>

        {/* Farm OS Branding */}
        <View style={styles.footerInfo}>
          <MaterialCommunityIcons name="shield-check" size={16} color={colors.primary} />
          <Text style={styles.footerText}>Khetivo Smart Agriculture OS • Clean & Farmer-Friendly</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  headerSub: { fontSize: 11, color: colors.textMuted, marginTop: 1 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 10 },

  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  menuList: { gap: 8 },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  menuSub: { fontSize: 11, color: colors.textMuted, marginTop: 1 },

  tutorialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
  },
  playWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  tutorialSub: { fontSize: 11, color: colors.textMuted, marginTop: 1 },

  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  footerText: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
});
