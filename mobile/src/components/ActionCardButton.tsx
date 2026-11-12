import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export interface ActionCardProps {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons' | 'FontAwesome5';
  iconColor: string;
  iconBgColor: string;
  badge?: string | number;
  badgeColor?: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const ActionCardButton: React.FC<ActionCardProps> = ({
  title,
  subtitle,
  iconName,
  iconFamily,
  iconColor,
  iconBgColor,
  badge,
  badgeColor,
  onPress,
  style,
}) => {
  const renderIcon = () => {
    if (iconFamily === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={iconName as any} size={22} color={iconColor} />;
    }
    if (iconFamily === 'FontAwesome5') {
      return <FontAwesome5 name={iconName as any} size={20} color={iconColor} />;
    }
    return <Ionicons name={iconName as any} size={22} color={iconColor} />;
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top Row: Icon + Optional Badge */}
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: iconBgColor }]}>
          {renderIcon()}
        </View>

        {badge !== undefined && (
          <View style={[styles.badge, { backgroundColor: badgeColor || colors.greenLight }]}>
            <Text style={[styles.badgeText, { color: badgeColor ? '#FFFFFF' : colors.primary }]}>
              {badge}
            </Text>
          </View>
        )}
      </View>

      {/* Title & Subtitle */}
      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    justifyContent: 'space-between',
    minHeight: 104,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textWrap: {
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
