import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Farm } from '../data/mockData';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface WeatherScreenProps {
  farm: Farm;
  onBack: () => void;
}

export const WeatherScreen: React.FC<WeatherScreenProps> = ({ farm, onBack }) => {
  const forecastDays = [
    { day: 'Mon', icon: 'weather-sunny', isRain: false, high: 27, low: 15, rain: '0mm' },
    { day: 'Tue', icon: 'weather-sunny', isRain: false, high: 28, low: 16, rain: '0mm' },
    { day: 'Wed', icon: 'weather-rainy', isRain: true, high: 29, low: 15, rain: '3.2mm rain' },
    { day: 'Thu', icon: 'weather-sunny', isRain: false, high: 27, low: 16, rain: '0mm' },
    { day: 'Fri', icon: 'weather-sunny', isRain: false, high: 28, low: 15, rain: '0mm' },
    { day: 'Sat', icon: 'weather-sunny', isRain: false, high: 29, low: 16, rain: '0mm' },
    { day: 'Sun', icon: 'weather-sunny', isRain: false, high: 27, low: 15, rain: '0mm' },
  ];

  return (
    <View style={styles.container}>
      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Weather & Telemetry</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Main Weather Card (Matching Web Dashboard Screenshot 2) */}
        <View style={styles.weatherCard}>
          {/* Header Row */}
          <View style={styles.cardHeader}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              {/* GPS Telemetry Pill Badge */}
              <View style={styles.gpsBadge}>
                <Ionicons name="location-sharp" size={13} color="#0C4B32" />
                <Text style={styles.gpsBadgeText}>Hyper-Local Farm GPS Telemetry</Text>
              </View>

              <Text style={styles.weatherTitle}>
                Weather Advisory ({farm.district || 'All Districts'}, {farm.state || 'Punjab'})
              </Text>
              <Text style={styles.weatherSub}>
                Coordinates: 30.5420°N, 76.0170°E • Updated 10 mins ago
              </Text>
            </View>

            {/* Current Temp and Icon */}
            <View style={styles.tempWrap}>
              <Text style={styles.tempText}>28°C</Text>
              <MaterialCommunityIcons name="weather-partly-cloudy" size={38} color="#F59E0B" />
            </View>
          </View>

          {/* 4 Sensor Metrics Strip */}
          <View style={styles.metricGrid}>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Relative Humidity</Text>
              <Text style={styles.metricVal}>58%</Text>
            </View>

            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Wind Velocity</Text>
              <Text style={styles.metricVal}>12 km/h NW</Text>
            </View>

            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Precipitation Probability</Text>
              <Text style={styles.metricVal}>5% (Dry)</Text>
            </View>

            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Foliar Spray Window</Text>
              <Text style={[styles.metricVal, { color: '#15803D' }]}>Optimal Today</Text>
            </View>
          </View>

          {/* 7-Day Agricultural Forecast */}
          <View style={styles.forecastSection}>
            <Text style={styles.forecastSectionTitle}>7-Day Agricultural Forecast</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.forecastScroll}
            >
              {forecastDays.map((item) => (
                <View key={item.day} style={styles.dayCard}>
                  <Text style={styles.dayName}>{item.day}</Text>
                  <View style={styles.dayIconWrap}>
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={24}
                      color={item.isRain ? '#3B82F6' : '#F59E0B'}
                    />
                  </View>
                  <Text style={styles.dayTemp}>
                    {item.high}° / {item.low}°
                  </Text>
                  <Text style={styles.dayRain}>{item.rain}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Farming Operations Spray Window Advisory Card */}
        <View style={styles.advisoryCard}>
          <View style={styles.advisoryHeader}>
            <View style={styles.sprayIconCircle}>
              <MaterialCommunityIcons name="spray" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.advisoryCardTitle}>Field Spray Recommendation</Text>
              <Text style={styles.advisoryCardSub}>Window: 06:30 AM – 10:00 AM (Calm winds)</Text>
            </View>
            <View style={styles.safeTag}>
              <Ionicons name="checkmark-circle" size={13} color="#15803D" />
              <Text style={styles.safeTagText}>Safe to Spray</Text>
            </View>
          </View>
          <Text style={styles.advisoryBody}>
            Wind velocity is well under the 15 km/h PAU drift threshold. Relative humidity at 58% ensures optimal droplet adhesion on leaf surfaces with no rain risk for the next 48 hours.
          </Text>
        </View>
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

  // Main Weather Card
  weatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 18,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E7F3EB',
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
    marginBottom: 6,
  },
  gpsBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0C4B32',
  },
  weatherTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#26352D',
    lineHeight: 22,
  },
  weatherSub: {
    fontSize: 11,
    color: '#55685D',
    marginTop: 3,
  },
  tempWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tempText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0C4B32',
  },

  // 4 Sensor Metrics Strip
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5ECE7',
  },
  metricCell: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 12,
    padding: 10,
    gap: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#55685D',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26352D',
  },

  // 7-Day Forecast Section
  forecastSection: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5ECE7',
    gap: 10,
  },
  forecastSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#26352D',
  },
  forecastScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  dayCard: {
    minWidth: 80,
    backgroundColor: '#FBFDFB',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#26352D',
  },
  dayIconWrap: {
    marginVertical: 4,
  },
  dayTemp: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0C4B32',
  },
  dayRain: {
    fontSize: 10,
    color: '#55685D',
  },

  // Spray Advisory Card
  advisoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 16,
    gap: 10,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sprayIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#0C4B32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  advisoryCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#26352D',
  },
  advisoryCardSub: {
    fontSize: 11,
    color: '#55685D',
    marginTop: 1,
  },
  safeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E7F3EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  safeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  advisoryBody: {
    fontSize: 11,
    color: '#55685D',
    lineHeight: 16,
  },
});
