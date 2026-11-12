import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

interface LeafScannerScreenProps {
  onBack: () => void;
}

interface DiagnosisResult {
  disease: string;
  crop: string;
  confidence: number;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'None';
  symptoms: string;
  treatment: string;
  chemicalDosage: string;
  caution: string;
}

const sampleCases: { name: string; crop: string; result: DiagnosisResult }[] = [
  {
    name: 'Wheat Leaf - Yellow Powdery Pustules',
    crop: 'Wheat (Kanak)',
    result: {
      disease: 'Stripe / Yellow Rust (Puccinia striiformis)',
      crop: 'Wheat (PBW-826)',
      confidence: 98.6,
      severity: 'Moderate',
      symptoms: 'Linear yellow streaks and powdery fungal pustules running parallel along the leaf veins.',
      treatment: 'Tilt 25% EC (Propiconazole) or Folicur (Tebuconazole 25.9% EC).',
      chemicalDosage: '200 ml in 200 Litres of clean water per acre using a hollow cone nozzle.',
      caution: 'Spray strictly during calm morning hours. Do not spray during windy afternoons to prevent drift.',
    },
  },
  {
    name: 'Paddy Leaf - Greyish Oval Lesions',
    crop: 'Paddy (Dhan)',
    result: {
      disease: 'Sheath Blight (Rhizoctonia solani)',
      crop: 'Paddy (Basmati 1121)',
      confidence: 96.2,
      severity: 'Severe',
      symptoms: 'Greenish-grey oval or irregular water-soaked spots on leaf sheaths near water level with dark brown borders.',
      treatment: 'Amistar Top (Azoxystrobin 18.2% + Difenoconazole 11.4% SC) or Pulsor.',
      chemicalDosage: '200 ml in 200L water per acre targeted directed towards lower plant sheaths.',
      caution: 'Drain excessive field standing water for 48 hours to reduce relative humidity inside canopy.',
    },
  },
  {
    name: 'Mustard Leaf - Pale White Blisters',
    crop: 'Mustard (Sarson)',
    result: {
      disease: 'White Rust & Downy Mildew Complex',
      crop: 'Mustard (Pusa Bold)',
      confidence: 94.8,
      severity: 'Mild',
      symptoms: 'Raised white or creamy pustules on lower leaf surface and floral malformation (stag-head).',
      treatment: 'Ridomil Gold (Metalaxyl 4% + Mancozeb 64% WP).',
      chemicalDosage: '500 grams in 200 Litres water per acre.',
      caution: 'Avoid overhead sprinkler irrigation for 3 days post chemical spray application.',
    },
  },
  {
    name: 'Healthy Crop Leaf',
    crop: 'Wheat / Potato',
    result: {
      disease: '100% Healthy Foliage (No Pathogen Detected)',
      crop: 'Wheat Parcel #01',
      confidence: 99.4,
      severity: 'None',
      symptoms: 'Normal chlorophyll distribution, healthy turgor, no fungal sporulation or insect vector feeding marks.',
      treatment: 'No fungicide or chemical intervention required. Continue regular irrigation schedule.',
      chemicalDosage: 'N/A',
      caution: 'Maintain bi-weekly scouting and leaf inspections.',
    },
  },
];

export const LeafScannerScreen: React.FC<LeafScannerScreenProps> = ({ onBack }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedCase, setSelectedCase] = useState(0);
  const [activeResult, setActiveResult] = useState<DiagnosisResult | null>(null);

  const handleRunScan = (index: number) => {
    setSelectedCase(index);
    setAnalyzing(true);
    setActiveResult(null);

    setTimeout(() => {
      setAnalyzing(false);
      setActiveResult(sampleCases[index].result);
    }, 1800);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>AI Leaf Doctor & Diagnostic</Text>
          <Text style={styles.headerSub}>Instant 5-Second Pathogen Scanner</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Viewfinder Mockup */}
        <View style={styles.viewfinder}>
          {/* Target Corners */}
          <View style={[styles.targetCorner, styles.targetTL]} />
          <View style={[styles.targetCorner, styles.targetTR]} />
          <View style={[styles.targetCorner, styles.targetBL]} />
          <View style={[styles.targetCorner, styles.targetBR]} />

          <View style={styles.viewfinderInner}>
            {analyzing ? (
              <View style={styles.analyzingBox}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.analyzingText}>Running Neural Plant Pathology Model...</Text>
                <Text style={styles.analyzingSub}>Checking 420+ PAU Fungus & Bacterial Profiles</Text>
              </View>
            ) : (
              <View style={styles.readyBox}>
                <MaterialCommunityIcons name="line-scan" size={48} color={colors.primary} />
                <Text style={styles.readyTitle}>Position Leaf Inside Frame</Text>
                <Text style={styles.readySub}>Hold camera 15-20 cm away in natural sunlight</Text>
              </View>
            )}
          </View>
        </View>

        {/* Test Preset Leaves */}
        <Text style={styles.presetTitle}>Select Leaf Photo to Diagnose:</Text>
        <View style={styles.presetsList}>
          {sampleCases.map((c, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.presetBtn, selectedCase === idx && styles.presetBtnActive]}
              onPress={() => handleRunScan(idx)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={idx === 3 ? 'leaf' : 'bug'}
                size={16}
                color={selectedCase === idx ? '#FFFFFF' : colors.primary}
              />
              <Text
                style={[
                  styles.presetBtnText,
                  selectedCase === idx && styles.presetBtnTextActive,
                ]}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Diagnosis Results */}
        {activeResult && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.resultTitleWrap}>
                <View
                  style={[
                    styles.severityDot,
                    {
                      backgroundColor:
                        activeResult.severity === 'Severe'
                          ? colors.danger
                          : activeResult.severity === 'Moderate'
                          ? colors.warning
                          : activeResult.severity === 'Mild'
                          ? colors.accent
                          : colors.success,
                    },
                  ]}
                />
                <Text style={styles.diseaseName}>{activeResult.disease}</Text>
              </View>
              <View style={styles.confBadge}>
                <Text style={styles.confText}>{activeResult.confidence}% Confidence</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.cropTag}>Crop: {activeResult.crop}</Text>
              <Text style={styles.severityTag}>Severity: {activeResult.severity}</Text>
            </View>

            {/* Symptoms */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeading}>Identified Symptoms:</Text>
              <Text style={styles.sectionBody}>{activeResult.symptoms}</Text>
            </View>

            {/* Prescribed PAU Treatment */}
            <View style={[styles.sectionBox, styles.treatmentBox]}>
              <View style={styles.treatmentHeader}>
                <MaterialCommunityIcons name="medical-bag" size={16} color={colors.secondary} />
                <Text style={styles.treatmentTitle}>Recommended PAU Spray & Remedy:</Text>
              </View>
              <Text style={styles.treatmentBody}>{activeResult.treatment}</Text>

              {activeResult.chemicalDosage !== 'N/A' && (
                <View style={styles.dosageRow}>
                  <Text style={styles.dosageLabel}>Dosage per Acre:</Text>
                  <Text style={styles.dosageValue}>{activeResult.chemicalDosage}</Text>
                </View>
              )}
            </View>

            {/* Caution */}
            <View style={styles.cautionBox}>
              <Ionicons name="warning-outline" size={16} color={colors.warning} />
              <Text style={styles.cautionText}>{activeResult.caution}</Text>
            </View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  viewfinder: {
    height: 180,
    backgroundColor: '#0F291E',
    borderRadius: 20,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#278449',
    overflow: 'hidden',
  },
  targetCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: colors.accent,
  },
  targetTL: {
    top: 12,
    left: 12,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  targetTR: {
    top: 12,
    right: 12,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  targetBL: {
    bottom: 12,
    left: 12,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  targetBR: {
    bottom: 12,
    right: 12,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  viewfinderInner: {
    alignItems: 'center',
    padding: 16,
  },
  analyzingBox: {
    alignItems: 'center',
  },
  analyzingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
  },
  analyzingSub: {
    color: colors.accent,
    fontSize: 11,
    marginTop: 4,
  },
  readyBox: {
    alignItems: 'center',
  },
  readyTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  readySub: {
    color: '#A7C7B7',
    fontSize: 11,
    marginTop: 2,
  },
  presetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  presetsList: {
    gap: 8,
    marginBottom: 16,
  },
  presetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  presetBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  presetBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  diseaseName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  confBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  cropTag: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  severityTag: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  sectionBox: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  sectionBody: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
  },
  treatmentBox: {
    backgroundColor: '#E7F3EB',
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  treatmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  treatmentTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  treatmentBody: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 16,
  },
  dosageRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#C6E2D0',
  },
  dosageLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  dosageValue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 1,
  },
  cautionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.warningBg,
  },
  cautionText: {
    flex: 1,
    fontSize: 10,
    color: colors.warning,
    lineHeight: 14,
    fontWeight: '600',
  },
});

