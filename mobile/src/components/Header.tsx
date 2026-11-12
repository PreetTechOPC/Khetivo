import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface HeaderProps {
  currentFarmName: string;
  totalAcres: number;
  onSelectFarm: () => void;
  onOpenNotifications: () => void;
  selectedLang: 'en' | 'pa' | 'hi';
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentFarmName,
  totalAcres,
  onSelectFarm,
  onOpenNotifications,
  selectedLang,
  onToggleLang,
}) => {
  const getGreeting = () => {
    if (selectedLang === 'pa') return 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਗੁਰਪ੍ਰੀਤ ਸਿੰਘ';
    if (selectedLang === 'hi') return 'नमस्ते, गुरप्रीत सिंह';
    return 'Welcome, Gurpreet Singh';
  };

  return (
    <View style={styles.container}>
      {/* Top Brand Bar */}
      <View style={styles.topRow}>
        <View style={styles.brandWrap}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="cover"
          />
          <View>
            <Text style={styles.brandTitle}>KHETIVO</Text>
            <Text style={styles.greeting}>{getGreeting()}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {/* Language Toggle */}
          <TouchableOpacity
            style={styles.langBtn}
            onPress={onToggleLang}
            activeOpacity={0.7}
          >
            <Text style={styles.langText}>
              {selectedLang === 'en' ? 'EN' : selectedLang === 'pa' ? 'ਪੰ' : 'हिं'}
            </Text>
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onOpenNotifications}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
            <View style={styles.dot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Farm Holding Bar */}
      <TouchableOpacity
        style={styles.farmBar}
        onPress={onSelectFarm}
        activeOpacity={0.8}
      >
        <View style={styles.farmLeft}>
          <MaterialCommunityIcons name="map-marker-radius" size={16} color={colors.primary} />
          <Text style={styles.farmName} numberOfLines={1}>
            {currentFarmName}
          </Text>
          <Text style={styles.farmAcres}>• {totalAcres} Acres</Text>
        </View>
        <View style={styles.switchPill}>
          <Text style={styles.switchText}>Switch</Text>
          <Ionicons name="chevron-down" size={12} color={colors.primary} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  farmBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAF8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  farmLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  farmName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  farmAcres: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  switchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.greenLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  switchText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
});
