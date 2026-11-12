import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  // Form State matching `src/app/dashboard/page.tsx` Settings
  const [farmerName, setFarmerName] = useState('Mohan Lal');
  const [phone, setPhone] = useState('+91 98140-54321');
  const [email, setEmail] = useState('mohan.lal@khetivo.farm');
  const [mandi, setMandi] = useState("Khanna Mandi (Asia's Largest Grain Market - Ludhiana)");
  const [baseAddress, setBaseAddress] = useState('Village Samrala, GT Road Belt, Ludhiana, Punjab 141001');

  const [defaultUnit, setDefaultUnit] = useState('Acres');
  const [language, setLanguage] = useState('English (Default)');
  const [currency, setCurrency] = useState('₹ INR (Indian Rupee / Quintal)');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY (e.g. 28/10/2026)');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = () => {
    setToastMessage('Farm & system preferences saved successfully.');
    Alert.alert('Settings Saved', 'Your farmer profile and system defaults have been updated.');
  };

  const handleReset = () => {
    setFarmerName('Mohan Lal');
    setPhone('+91 98140-54321');
    setEmail('mohan.lal@khetivo.farm');
    setMandi("Khanna Mandi (Asia's Largest Grain Market - Ludhiana)");
    setBaseAddress('Village Samrala, GT Road Belt, Ludhiana, Punjab 141001');
    setDefaultUnit('Acres');
    setLanguage('English (Default)');
    setCurrency('₹ INR (Indian Rupee / Quintal)');
    setDateFormat('DD/MM/YYYY (e.g. 28/10/2026)');
    setToastMessage('Settings reset to default.');
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Toast Notification */}
        {toastMessage && (
          <View style={styles.toastCard}>
            <View style={styles.toastLeft}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
            <TouchableOpacity onPress={() => setToastMessage(null)}>
              <Ionicons name="close" size={16} color="#059669" />
            </TouchableOpacity>
          </View>
        )}

        {/* Sub Header (Matching Web Dashboard) */}
        <View style={styles.headerBlock}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.mainTitle}>Farm & System Settings</Text>
            <Text style={styles.mainSub}>
              Configure your farmer identity, regional measurement units, and interface preferences.
            </Text>
          </View>

          <View style={styles.headerButtonsRow}>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={14} color="#55685D" />
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={15} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CARD 1: Farmer Identity & Account Profile */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.cardTopLeft}>
              <View style={styles.cardIconBox}>
                <Ionicons name="person-circle-outline" size={18} color="#0C4B32" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Farmer Identity & Account Profile</Text>
                <Text style={styles.cardSub}>
                  Official details used on mandi dispatch slips and GST receipts
                </Text>
              </View>
            </View>

            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>Verified Farmer ID</Text>
            </View>
          </View>

          <View style={styles.formFields}>
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Registered Farmer Full Name *</Text>
              <TextInput
                style={styles.textInput}
                value={farmerName}
                onChangeText={setFarmerName}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Primary Mobile Number (OTP & SMS) *</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Official Email Address</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Primary APMC Mandi Linkage</Text>
              <View style={styles.selectBox}>
                <Text style={styles.selectBoxText} numberOfLines={1}>
                  {mandi}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#55685D" />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Farm Headquarters Base Address</Text>
              <TextInput
                style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                multiline
                value={baseAddress}
                onChangeText={setBaseAddress}
              />
            </View>
          </View>
        </View>

        {/* CARD 2: Regional Units & Interface Preferences */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.cardTopLeft}>
              <View style={styles.cardIconBox}>
                <MaterialCommunityIcons name="ruler" size={18} color="#0C4B32" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Regional Units & Interface Preferences</Text>
                <Text style={styles.cardSub}>
                  Standards used across all crop records, field maps, and reports
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.formFields}>
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Default Area Measurement Unit</Text>
              <View style={styles.pillsRow}>
                {['Acres', 'Hectares', 'Bigha', 'Killa', 'Kanal', 'Guntha'].map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitPill, defaultUnit === u && styles.unitPillActive]}
                    onPress={() => setDefaultUnit(u)}
                  >
                    <Text
                      style={[
                        styles.unitPillText,
                        defaultUnit === u && styles.unitPillTextActive,
                      ]}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Interface Language</Text>
              <View style={styles.pillsRow}>
                {[
                  'English (Default)',
                  'ਪੰਜਾਬੀ (Punjabi)',
                  'हिन्दी (Hindi)',
                  'मराठी (Marathi)',
                  'ગુજરાતી (Gujarati)',
                ].map((l) => (
                  <TouchableOpacity
                    key={l}
                    style={[styles.unitPill, language === l && styles.unitPillActive]}
                    onPress={() => setLanguage(l)}
                  >
                    <Text
                      style={[
                        styles.unitPillText,
                        language === l && styles.unitPillTextActive,
                      ]}
                    >
                      {l}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Currency & Financial Standard</Text>
              <View style={styles.selectBox}>
                <Text style={styles.selectBoxText}>{currency}</Text>
                <Ionicons name="chevron-down" size={14} color="#55685D" />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Calendar Date Format</Text>
              <View style={styles.selectBox}>
                <Text style={styles.selectBoxText}>{dateFormat}</Text>
                <Ionicons name="chevron-down" size={14} color="#55685D" />
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Save Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.resetBottomBtn}
            onPress={handleReset}
            activeOpacity={0.8}
          >
            <Text style={styles.resetBottomText}>Reset Defaults</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveBottomBtn}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.saveBottomText}>Save Settings</Text>
          </TouchableOpacity>
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

  toastCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toastLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },

  headerBlock: {
    gap: 12,
  },
  headerTitleWrap: {
    gap: 2,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#26352D',
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
  resetBtn: {
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
  resetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#55685D',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0C4B32',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
    gap: 8,
  },
  cardTopLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  cardIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#E7F3EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#26352D',
  },
  cardSub: {
    fontSize: 10,
    color: '#55685D',
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  formFields: {
    gap: 12,
  },
  fieldGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#55685D',
  },
  textInput: {
    backgroundColor: '#FBFDFB',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#26352D',
    fontWeight: '500',
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FBFDFB',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  selectBoxText: {
    fontSize: 12,
    color: '#26352D',
    fontWeight: '500',
    flex: 1,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 2,
  },
  unitPill: {
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  unitPillActive: {
    backgroundColor: '#0C4B32',
    borderColor: '#0C4B32',
  },
  unitPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#55685D',
  },
  unitPillTextActive: {
    color: '#FFFFFF',
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 6,
    paddingBottom: 20,
  },
  resetBottomBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCE6DE',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  resetBottomText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#55685D',
  },
  saveBottomBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0C4B32',
  },
  saveBottomText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
