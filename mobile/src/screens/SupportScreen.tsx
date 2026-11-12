import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface SupportScreenProps {
  onBack: () => void;
}

interface SupportTicket {
  id: string;
  ticketNo: string;
  subject: string;
  category: string;
  farmName: string;
  cropName: string;
  priority: 'Low' | 'Normal' | 'Urgent';
  status: 'Open' | 'In Review' | 'Resolved';
  createdAt: string;
  lastReply: string;
  assignedAgronomist: string;
  description: string;
}

const initialTickets: SupportTicket[] = [
  {
    id: 'tkt-1',
    ticketNo: 'TKT-8942',
    subject: 'Yellow rust patches detected on wheat leaves after heavy rain',
    category: 'Crop Health & Pathology',
    farmName: 'Khetivo Green Acres (Samrala)',
    cropName: 'Wheat (PBW-824)',
    priority: 'Urgent',
    status: 'In Review',
    createdAt: '27 Oct 2026, 09:30 AM',
    lastReply:
      'Dr. Harpreet Singh: Advised foliar spray of Propiconazole 25% EC @ 200ml/acre in 200L water. Monitor for 48 hours.',
    assignedAgronomist: 'Dr. Harpreet Singh (PAU Senior Pathologist)',
    description:
      'Observed scattered yellow powdery pustules forming linear stripes along leaf veins in Block B following the morning fog and wet spell. Need confirmation on fungicide dosage.',
  },
  {
    id: 'tkt-2',
    ticketNo: 'TKT-7821',
    subject: 'Solar tubewell pump solenoid valve relay offline',
    category: 'IoT & Machinery Telemetry',
    farmName: 'Samrala Model Farm',
    cropName: 'All Holdings',
    priority: 'Normal',
    status: 'Resolved',
    createdAt: '22 Oct 2026, 03:15 PM',
    lastReply:
      'Hardware Support: Field technician rebooted 4G SIM module and re-flashed relay board firmware to v2.4.',
    assignedAgronomist: 'Telemetry Support Team',
    description:
      'Automation trigger for overnight tubewell watering failed to start the pump.',
  },
];

const faqs = [
  {
    question: 'When is the optimal foliar spray window for fungicide/insecticide?',
    category: 'Crop Health & Pathology',
    answer:
      'Spray during calm morning hours (7:00 AM – 10:30 AM) or late afternoon (4:00 PM – 6:30 PM). Avoid spraying when wind speed exceeds 12 km/h or leaf wetness is excessive to prevent drift and wash-off.',
  },
  {
    question: 'How should I interpret soil moisture percentages across soil types?',
    category: 'Irrigation & Soil',
    answer:
      'For typical Punjab/Haryana alluvial sandy loam, 30%–45% volumetric water content indicates optimal field capacity. Below 24% signals critical water stress requiring irrigation. Above 50% risks root aeration restriction.',
  },
  {
    question: 'How do I add a new tractor driver or operator with restricted access?',
    category: 'Platform & Workforce',
    answer:
      "Go to the Team tab, click '+ Add Team Member', enter their name, phone, and select their Designation & Role. You can manage exact module permissions in the 'Designations & Roles' sub-tab so operators only see their assigned modules.",
  },
  {
    question: 'How are 10-meter Sentinel-2 NDVI satellite biomass scans updated?',
    category: 'Satellite & Advisory',
    answer:
      'NDVI and NDRE vegetation indices are refreshed every 5 days when the European Space Agency Sentinel-2 constellation passes over your geo-tagged farm coordinates, provided cloud cover is below 20%.',
  },
  {
    question: 'Can I download official expense & harvest audit records for bank loans/KCC?',
    category: 'Billing & Reports',
    answer:
      "Yes! Navigate to the 'Reports' module where you can generate bank audit telemetry and download official harvest ledger CSV and PDF reports formatted for APMC Mandi, crop insurance, and Kisan Credit Card (KCC) verifications.",
  },
];

export const SupportScreen: React.FC<SupportScreenProps> = ({ onBack }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Quick Ask Form
  const [askFarm, setAskFarm] = useState('Khetivo Green Acres (Samrala)');
  const [askCrop, setAskCrop] = useState('Wheat (PBW-826)');
  const [askQuestion, setAskQuestion] = useState('');

  // New Ticket Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSubject, setModalSubject] = useState('');
  const [modalCategory, setModalCategory] = useState('Crop Health & Pathology');
  const [modalPriority, setModalPriority] = useState<'Low' | 'Normal' | 'Urgent'>('Normal');
  const [modalDesc, setModalDesc] = useState('');

  const handleCall = () => {
    Linking.openURL('tel:18005438486').catch(() => {
      Alert.alert('Helpline', 'Dialing 1800-KHETIVO (1800-543-8486)');
    });
  };

  const handleWhatsApp = () => {
    Linking.openURL(
      'https://wa.me/919876543210?text=Hello%20Khetivo%20Agronomist,%20I%20need%20expert%20diagnosis%20for%20my%20crop'
    ).catch(() => {
      Alert.alert('WhatsApp', 'Connecting to Dr. Harpreet Singh at +91 98765-43210');
    });
  };

  const handleQuickAsk = () => {
    if (!askQuestion.trim()) {
      Alert.alert('Required', 'Please describe your crop question or problem.');
      return;
    }
    const created: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNo: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: `Agronomy Query: ${askCrop}`,
      category: 'Crop Health & Pathology',
      farmName: askFarm,
      cropName: askCrop,
      priority: 'Normal',
      status: 'Open',
      createdAt: 'Just now',
      lastReply: 'Ticket assigned to PAU Agronomy Desk. Reply expected within 2 hours.',
      assignedAgronomist: 'Dr. Harpreet Singh (PAU)',
      description: askQuestion.trim(),
    };
    setTickets([created, ...tickets]);
    setAskQuestion('');
    Alert.alert('Question Submitted', `Ticket #${created.ticketNo} logged. Agronomist assigned.`);
  };

  const handleCreateTicket = () => {
    if (!modalSubject.trim() || !modalDesc.trim()) {
      Alert.alert('Required', 'Please provide a ticket subject and description.');
      return;
    }
    const created: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNo: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: modalSubject.trim(),
      category: modalCategory,
      farmName: askFarm,
      cropName: askCrop,
      priority: modalPriority,
      status: 'Open',
      createdAt: 'Just now',
      lastReply: 'Ticket assigned. Agronomist reviewing farm telemetry.',
      assignedAgronomist: 'Agronomy Support Team',
      description: modalDesc.trim(),
    };
    setTickets([created, ...tickets]);
    setIsModalOpen(false);
    setModalSubject('');
    setModalDesc('');
    Alert.alert('Ticket Created', `Support Ticket #${created.ticketNo} created.`);
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Support & Helpline</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header Block */}
        <View style={styles.headerBlock}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.mainTitle}>Agronomy Help & Support</Text>
            <Text style={styles.mainSub}>
              Direct agricultural advisory, crop disease diagnosis, and platform support.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.openTicketBtn}
            onPress={() => setIsModalOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.openTicketBtnText}>Open Support Ticket</Text>
          </TouchableOpacity>
        </View>

        {/* 3 Contact Channels */}
        <View style={styles.channelsGrid}>
          {/* Toll-Free */}
          <View style={styles.channelCard}>
            <View style={styles.channelHeader}>
              <View style={[styles.channelIconBox, { backgroundColor: '#E7F3EB' }]}>
                <Feather name="phone-call" size={16} color="#0C4B32" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.channelTitle}>Toll-Free Helpline</Text>
                <Text style={styles.channelHighlight}>1800-KHETIVO</Text>
                <Text style={styles.channelSub}>Daily 6:00 AM – 10:00 PM</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.channelActionBtn} onPress={handleCall}>
              <Text style={styles.channelActionBtnText}>Call Helpline</Text>
            </TouchableOpacity>
          </View>

          {/* WhatsApp */}
          <View style={styles.channelCard}>
            <View style={styles.channelHeader}>
              <View style={[styles.channelIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="logo-whatsapp" size={18} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.channelTitle}>WhatsApp Crop Desk</Text>
                <Text style={styles.channelHighlight}>Photo Pest Diagnosis</Text>
                <Text style={styles.channelSub}>Dr. Harpreet Singh (PAU)</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.channelActionBtn, { backgroundColor: '#E7F3EB', borderColor: '#C6E2D0' }]}
              onPress={handleWhatsApp}
            >
              <Text style={[styles.channelActionBtnText, { color: '#0C4B32' }]}>Chat on WhatsApp</Text>
            </TouchableOpacity>
          </View>

          {/* Extension Visit */}
          <View style={styles.channelCard}>
            <View style={styles.channelHeader}>
              <View style={[styles.channelIconBox, { backgroundColor: '#F4F8F4' }]}>
                <Ionicons name="location-outline" size={18} color="#55685D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.channelTitle}>Extension Field Visit</Text>
                <Text style={styles.channelHighlight}>Soil & Drone Tests</Text>
                <Text style={styles.channelSub}>Turnaround within 48h</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.channelActionBtn}
              onPress={() => setIsModalOpen(true)}
            >
              <Text style={styles.channelActionBtnText}>Request Visit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ask an Agronomist Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ask an Agronomist</Text>
          <Text style={styles.cardSub}>
            Submit a question directly to our agronomy queue. We will check your farm records and reply quickly.
          </Text>

          <View style={styles.formFields}>
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Target Farm</Text>
              <TextInput
                style={styles.textInput}
                value={askFarm}
                onChangeText={setAskFarm}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Crop / Variety</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Wheat PBW-826"
                value={askCrop}
                onChangeText={setAskCrop}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Your Question or Issue</Text>
              <TextInput
                style={[styles.textInput, { height: 75, textAlignVertical: 'top' }]}
                multiline
                placeholder="e.g. Leaves turning pale yellow after recent watering. Please advise on nutrient or spray recommendations."
                value={askQuestion}
                onChangeText={setAskQuestion}
              />
            </View>

            <View style={styles.askFooter}>
              <Text style={styles.avgTimeText}>
                Avg. reply time: <Text style={{ fontWeight: '700', color: '#0C4B32' }}>under 2 hours</Text>
              </Text>
              <TouchableOpacity
                style={styles.submitQuestionBtn}
                onPress={handleQuickAsk}
                activeOpacity={0.8}
              >
                <Ionicons name="send" size={13} color="#FFFFFF" />
                <Text style={styles.submitQuestionBtnText}>Submit Question</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Support Tickets */}
        <View style={styles.card}>
          <View style={styles.ticketCardHeader}>
            <Text style={styles.cardTitle}>Recent Tickets & Inquiries</Text>
            <Text style={styles.ticketCountText}>{tickets.length} Total</Text>
          </View>

          <View style={styles.ticketList}>
            {tickets.map((t) => (
              <View key={t.id} style={styles.ticketItem}>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={styles.ticketTopRow}>
                    <Text style={styles.ticketNo}>#{t.ticketNo}</Text>
                    <Text style={styles.ticketSubject} numberOfLines={1}>
                      {t.subject}
                    </Text>
                  </View>
                  <Text style={styles.ticketMeta}>
                    {t.farmName} • {t.assignedAgronomist}
                  </Text>
                </View>

                <View style={styles.ticketRight}>
                  <View
                    style={[
                      styles.ticketStatusBadge,
                      {
                        backgroundColor:
                          t.status === 'Resolved' ? '#ECFDF5' : '#FFFBEB',
                        borderColor:
                          t.status === 'Resolved' ? '#A7F3D0' : '#FDE68A',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.ticketStatusText,
                        {
                          color:
                            t.status === 'Resolved' ? '#059669' : '#B45309',
                        },
                      ]}
                    >
                      {t.status}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.viewThreadBtn}
                    onPress={() => setSelectedTicket(t)}
                  >
                    <Text style={styles.viewThreadText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* FAQs Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Frequently Asked Questions</Text>
          <Text style={styles.cardSub}>Quick answers to common farming and platform questions.</Text>

          <View style={styles.faqList}>
            {faqs.map((f, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <View key={idx} style={styles.faqItem}>
                  <TouchableOpacity
                    style={styles.faqQuestionBtn}
                    onPress={() => setExpandedFaq(isOpen ? null : idx)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.faqQuestionText}>{f.question}</Text>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color="#55685D"
                    />
                  </TouchableOpacity>
                  {isOpen && (
                    <View style={styles.faqAnswerBox}>
                      <Text style={styles.faqAnswerText}>{f.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* NEW TICKET MODAL */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Open Support Ticket</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={22} color="#55685D" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} contentContainerStyle={{ gap: 10 }}>
              <View>
                <Text style={styles.inputLabel}>Subject / Headline *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Brief summary of the issue..."
                  value={modalSubject}
                  onChangeText={setModalSubject}
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>Category</Text>
                <TextInput
                  style={styles.textInput}
                  value={modalCategory}
                  onChangeText={setModalCategory}
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>Priority</Text>
                <View style={styles.pillsRow}>
                  {(['Low', 'Normal', 'Urgent'] as const).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.unitPill,
                        modalPriority === p && styles.unitPillActive,
                      ]}
                      onPress={() => setModalPriority(p)}
                    >
                      <Text
                        style={[
                          styles.unitPillText,
                          modalPriority === p && styles.unitPillTextActive,
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={styles.inputLabel}>Detailed Description *</Text>
                <TextInput
                  style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                  multiline
                  placeholder="Describe your issue with field symptoms, date of onset, or hardware readings..."
                  value={modalDesc}
                  onChangeText={setModalDesc}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateTicket}>
                <Text style={styles.modalSubmitText}>Submit Ticket</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* VIEW TICKET DETAIL MODAL */}
      <Modal visible={selectedTicket !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ticket #{selectedTicket?.ticketNo}</Text>
              <TouchableOpacity onPress={() => setSelectedTicket(null)}>
                <Ionicons name="close" size={22} color="#55685D" />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10, paddingVertical: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#26352D' }}>
                {selectedTicket?.subject}
              </Text>
              <Text style={{ fontSize: 11, color: '#55685D' }}>
                {selectedTicket?.farmName} • {selectedTicket?.cropName} • {selectedTicket?.createdAt}
              </Text>
              <View style={{ backgroundColor: '#F8FAF8', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E5ECE7' }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#889B90', marginBottom: 2 }}>
                  YOUR REPORT
                </Text>
                <Text style={{ fontSize: 11, color: '#26352D' }}>{selectedTicket?.description}</Text>
              </View>
              <View style={{ backgroundColor: '#ECFDF5', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#A7F3D0' }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#047857', marginBottom: 2 }}>
                  LATEST AGRONOMIST RESPONSE
                </Text>
                <Text style={{ fontSize: 11, color: '#065F46' }}>{selectedTicket?.lastReply}</Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: '#0C4B32' }]}
                onPress={() => setSelectedTicket(null)}
              >
                <Text style={styles.modalSubmitText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  openTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0C4B32',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  openTicketBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  channelsGrid: {
    gap: 10,
  },
  channelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 14,
    gap: 10,
  },
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  channelIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#26352D',
  },
  channelHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0C4B32',
    marginTop: 1,
  },
  channelSub: {
    fontSize: 10,
    color: '#55685D',
    marginTop: 1,
  },
  channelActionBtn: {
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  channelActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#26352D',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26352D',
  },
  cardSub: {
    fontSize: 11,
    color: '#55685D',
  },
  formFields: {
    gap: 10,
    marginTop: 4,
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
  },
  askFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  avgTimeText: {
    fontSize: 11,
    color: '#55685D',
  },
  submitQuestionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0C4B32',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  submitQuestionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Tickets
  ticketCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketCountText: {
    fontSize: 11,
    color: '#55685D',
  },
  ticketList: {
    gap: 8,
    marginTop: 4,
  },
  ticketItem: {
    backgroundColor: '#FBFDFB',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  ticketTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketNo: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0C4B32',
    fontFamily: 'monospace',
  },
  ticketSubject: {
    fontSize: 12,
    fontWeight: '600',
    color: '#26352D',
    flex: 1,
  },
  ticketMeta: {
    fontSize: 10,
    color: '#55685D',
    marginTop: 2,
  },
  ticketRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketStatusBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ticketStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  viewThreadBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#E7F3EB',
  },
  viewThreadText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0C4B32',
  },

  // FAQ
  faqList: {
    gap: 8,
    marginTop: 4,
  },
  faqItem: {
    backgroundColor: '#FBFDFB',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    borderRadius: 10,
    overflow: 'hidden',
  },
  faqQuestionBtn: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  faqQuestionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#26352D',
    flex: 1,
  },
  faqAnswerBox: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5ECE7',
    paddingTop: 8,
  },
  faqAnswerText: {
    fontSize: 11,
    color: '#55685D',
    lineHeight: 16,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    padding: 18,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#26352D',
  },
  modalBody: {
    maxHeight: 380,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
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
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5ECE7',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCE6DE',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#55685D',
  },
  modalSubmitBtn: {
    flex: 1,
    backgroundColor: '#0C4B32',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
