import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Crop, Farm, initialCrops } from '../data/mockData';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlert } from '../context/AlertContext';

interface TelemetryScreenProps {
  farm: Farm;
  crops?: Crop[];
  onBack: () => void;
}

export const TelemetryScreen: React.FC<TelemetryScreenProps> = ({
  farm,
  crops = initialCrops,
  onBack,
}) => {
  const { showAlert, showSuccess } = useAlert();
  const [motorRunning, setMotorRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState('45 Mins');
  const [selectedCrop, setSelectedCrop] = useState(crops[0]);

  const handleToggleMotor = () => {
    if (!motorRunning) {
      showAlert({
        title: 'Start Tubewell Motor',
        message: `Start 10HP Submersible motor for ${selectedCrop.name} with ${timerDuration} auto-cutoff?`,
        type: 'warning',
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start Motor',
            style: 'default',
            onPress: () => setMotorRunning(true),
          },
        ],
      });
    } else {
      setMotorRunning(false);
      showSuccess('Tubewell Stopped', 'The motor has been turned off safely.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Soil & Irrigation Telemetry</Text>
          <Text style={styles.headerSub}>
            {farm.name} • {farm.irrigationType.split('(')[0].trim()}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Motor Automation Card */}
        <View style={styles.motorCard}>
          <View style={styles.motorHeader}>
            <View style={styles.motorTitleWrap}>
              <View style={[styles.motorDot, { backgroundColor: motorRunning ? '#22C55E' : '#94A3B8' }]} />
              <Text style={styles.motorCardTitle}>Borewell #01 (10 HP Submersible)</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: motorRunning ? colors.greenLight : '#F1F5F9' }]}>
              <Text style={[styles.statusBadgeText, { color: motorRunning ? colors.secondary : colors.textMuted }]}>
                {motorRunning ? '⚡ PUMPING WATER' : 'IDLE / OFF'}
              </Text>
            </View>
          </View>

          <View style={styles.motorStats}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Voltage</Text>
              <Text style={styles.statVal}>415 V (3-Phase)</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Water Flow</Text>
              <Text style={styles.statVal}>{motorRunning ? '480 LPM' : '0 LPM'}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Timer Cutoff</Text>
              <Text style={styles.statVal}>{timerDuration}</Text>
            </View>
          </View>

          {/* Timer Selector */}
          <View style={styles.timerRow}>
            {['30 Mins', '45 Mins', '2 Hours', 'Continuous'].map((dur) => (
              <TouchableOpacity
                key={dur}
                style={[styles.timerBtn, timerDuration === dur && styles.timerBtnActive]}
                onPress={() => setTimerDuration(dur)}
              >
                <Text style={[styles.timerBtnText, timerDuration === dur && styles.timerBtnTextActive]}>
                  {dur}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Motor Action Button */}
          <TouchableOpacity
            style={[styles.motorToggleBtn, { backgroundColor: motorRunning ? colors.danger : colors.primary }]}
            onPress={handleToggleMotor}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={motorRunning ? 'power' : 'water-pump'}
              size={22}
              color="#FFFFFF"
            />
            <Text style={styles.motorToggleText}>
              {motorRunning ? 'STOP TUBEWELL PUMP' : 'START TUBEWELL MOTOR'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Real-Time Parcel Moisture Telemetry */}
        <Text style={styles.sectionTitle}>Real-Time Soil Moisture Probes</Text>
        {crops.map((crop) => {
          const isAttention = crop.currentMoisture < crop.lowMoistureAlert + 5;
          return (
            <TouchableOpacity
              key={crop.id}
              style={[
                styles.parcelCard,
                selectedCrop.id === crop.id && styles.parcelCardSelected,
              ]}
              onPress={() => setSelectedCrop(crop)}
              activeOpacity={0.8}
            >
              <View style={styles.parcelTop}>
                <View>
                  <Text style={styles.parcelName}>{crop.name}</Text>
                  <Text style={styles.parcelCrop}>
                    {crop.area} {crop.areaUnit} • {crop.variety}
                  </Text>
                </View>
                <View
                  style={[
                    styles.moisturePill,
                    { backgroundColor: isAttention ? colors.amberLight : colors.greenLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.moisturePillText,
                      { color: isAttention ? colors.warning : colors.secondary },
                    ]}
                  >
                    {crop.currentMoisture}% Moisture
                  </Text>
                </View>
              </View>

              {/* Moisture Progress Bar */}
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(crop.currentMoisture, 100)}%`,
                      backgroundColor: isAttention ? colors.accent : colors.secondary,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.targetMarker,
                    { left: `${crop.lowMoistureAlert}%` },
                  ]}
                />
              </View>

              <View style={styles.barLabels}>
                <Text style={styles.barSubText}>
                  Alert Threshold: &lt;{crop.lowMoistureAlert}%
                </Text>
                <Text
                  style={[
                    styles.statusSubText,
                    { color: isAttention ? colors.danger : colors.secondary },
                  ]}
                >
                  {isAttention ? '⚠️ Low Moisture Warning' : '✅ Optimal Root Zone'}
                </Text>
              </View>

              <View style={styles.parcelMetaRow}>
                <Text style={styles.metaText}>🌱 Stage: {crop.stage}</Text>
                <Text style={styles.metaText}>💧 {farm.irrigationType.split('(')[0].trim()}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* PAU AWD Guidelines Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoTitleWrap}>
            <MaterialCommunityIcons name="information" size={20} color={colors.primary} />
            <Text style={styles.infoTitle}>PAU AWD (Alternate Wetting & Drying) Rule</Text>
          </View>
          <Text style={styles.infoBody}>
            Allow soil water level to drop 2-3 inches below surface before re-irrigating during active tillering. This saves up to 35% tubewell electricity and deepens root penetration without losing grain yield.
          </Text>
        </View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  motorCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  motorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  motorTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  motorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  motorCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  motorStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  statVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 6,
  },
  timerBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timerBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
  },
  timerBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  motorToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  motorToggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  parcelCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  parcelCardSelected: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  parcelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  parcelName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  parcelCrop: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  moisturePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  moisturePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  barContainer: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    position: 'relative',
    marginVertical: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  targetMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.danger,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  barSubText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  statusSubText: {
    fontSize: 10,
    fontWeight: '700',
  },
  parcelMetaRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  infoBody: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
  },
});
