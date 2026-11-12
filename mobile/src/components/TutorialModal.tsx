import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons, Feather } from '@expo/vector-icons';

interface TutorialModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ visible, onClose }) => {
  const handleOpenYouTube = () => {
    Linking.openURL('https://www.youtube.com');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.playIconWrap}>
                <Ionicons name="play" size={16} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.title}>Watch Video Tutorial</Text>
                <Text style={styles.sub}>Quick 5-minute farm setup guide</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Video Placeholder Box */}
          <View style={styles.videoBox}>
            <Ionicons name="play-circle" size={54} color="#FFFFFF" />
            <Text style={styles.videoLabel}>Khetivo Smart Agriculture Demo</Text>
            <Text style={styles.videoDuration}>Runtime: 4 mins • In Punjabi & Hindi</Text>
          </View>

          {/* Chapters List */}
          <ScrollView style={styles.chapterScroll} contentContainerStyle={styles.chapterContent}>
            <Text style={styles.chapterHeading}>Video Chapters & Walkthrough:</Text>

            <View style={styles.stepItem}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>1</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>Adding Your Farm & Crops</Text>
                <Text style={styles.stepDesc}>How to register acreage, soil loam, and crop sowing dates.</Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>Tubewell Motor & Telemetry</Text>
                <Text style={styles.stepDesc}>1-tap motor switch and setting up auto-shutoff moisture limits.</Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>3</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>PAU Alerts & Daily Tasks</Text>
                <Text style={styles.stepDesc}>Reading spray windows, disease bulletins and assigning tasks.</Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.ytBtn} onPress={handleOpenYouTube} activeOpacity={0.8}>
              <Feather name="external-link" size={15} color={colors.primary} />
              <Text style={styles.ytBtnText}>Open on YouTube</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.doneBtnText}>Done Watching</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  playIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  sub: { fontSize: 11, color: colors.textMuted },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  videoBox: {
    height: 180,
    backgroundColor: '#0F291C',
    margin: 16,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLabel: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginTop: 8 },
  videoDuration: { fontSize: 11, color: '#A7F3D0', marginTop: 2 },

  chapterScroll: { paddingHorizontal: 16 },
  chapterContent: { gap: 12, paddingBottom: 12 },
  chapterHeading: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 4 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  stepTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  stepDesc: { fontSize: 11, color: colors.textMuted, marginTop: 1 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  ytBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ytBtnText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  doneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  doneBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
});

