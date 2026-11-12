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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { initialWorkers, Worker } from '../data/mockData';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface TeamScreenProps {
  onBack: () => void;
}

interface Designation {
  id: string;
  title: string;
  description: string;
  assignedCount: number;
  modules: string[];
}

const initialDesignations: Designation[] = [
  {
    id: 'des-1',
    title: 'Owner & Farm Administrator',
    description: 'Full administrative control with unrestricted operational, financial, and configuration authority.',
    assignedCount: 1,
    modules: ['Dashboard', 'Weather', 'Tasks', 'Inventory', 'Equipment', 'Crops', 'Expenses', 'Reports', 'My Farms', 'Team', 'Settings'],
  },
  {
    id: 'des-2',
    title: 'Field Supervisor & Operations Lead',
    description: 'Oversees daily field tasks, worker rosters, input dispatches, and crop phenological monitoring.',
    assignedCount: 1,
    modules: ['Dashboard', 'Weather', 'Tasks', 'Inventory', 'Equipment', 'Crops'],
  },
  {
    id: 'des-3',
    title: 'Consulting Agronomist (Crop Advisor)',
    description: 'Expert advice on pathology, pest scouting, spray windows, and crop performance telemetry.',
    assignedCount: 1,
    modules: ['Dashboard', 'Weather', 'Crops', 'Reports'],
  },
  {
    id: 'des-4',
    title: 'Tractor & Heavy Machinery Driver',
    description: 'Operates tractors, seeders, and harvesters; maintains fuel efficiency and machinery telemetry.',
    assignedCount: 1,
    modules: ['Dashboard', 'Tasks', 'Equipment'],
  },
  {
    id: 'des-5',
    title: 'Store & Inventory Keeper',
    description: 'Logs seed and chemical intake, maintains godown ledger, and tracks batch expiry dates.',
    assignedCount: 1,
    modules: ['Dashboard', 'Inventory', 'Equipment'],
  },
  {
    id: 'des-6',
    title: 'Farm Accountant / Mandi Sales Rep',
    description: 'Manages APMC Mandi dispatches, sales receipts, input bills, and financial ledger.',
    assignedCount: 1,
    modules: ['Dashboard', 'Expenses', 'Reports'],
  },
  {
    id: 'des-7',
    title: 'Irrigation & Fertigation Operator',
    description: 'Controls drip valves, tubewell pump runtime, filter flushing, and soil moisture sensors.',
    assignedCount: 2,
    modules: ['Dashboard', 'Weather', 'Tasks'],
  },
];

export const TeamScreen: React.FC<TeamScreenProps> = ({ onBack }) => {
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [designations, setDesignations] = useState<Designation[]>(initialDesignations);
  const [subTab, setSubTab] = useState<'members' | 'designations'>('members');
  const [search, setSearch] = useState('');

  // Modals
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddDesignationOpen, setIsAddDesignationOpen] = useState(false);

  // New Member Form (Exact match with Web Dashboard & Image 1)
  const [memberFormName, setMemberFormName] = useState('');
  const [memberFormPhone, setMemberFormPhone] = useState('+91 ');
  const [memberFormEmail, setMemberFormEmail] = useState('');
  const [memberFormFarm, setMemberFormFarm] = useState('All Holdings (Multi-Farm Access)');
  const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);
  const [memberFormDesignationId, setMemberFormDesignationId] = useState('des-1');
  const [isDesignationDropdownOpen, setIsDesignationDropdownOpen] = useState(false);
  const [memberFormNotes, setMemberFormNotes] = useState('');
  const [memberFormStatus, setMemberFormStatus] = useState<'Active' | 'Pending Invite'>('Active');

  // New Designation Form
  const [newDesTitle, setNewDesTitle] = useState('');
  const [newDesDesc, setNewDesDesc] = useState('');

  // Counts
  const totalWorkforce = workers.length;
  const totalRoles = designations.length;
  const activeCount = workers.filter((w) => w.status === 'On Duty').length;
  const pendingCount = 1;

  const handleCall = (phone: string, name: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Call', `Dialing ${name} at ${phone}`);
    });
  };

  const handleAddMember = () => {
    if (!memberFormName.trim()) {
      Alert.alert('Required Field', 'Please enter Full Name.');
      return;
    }
    if (!memberFormPhone.trim() || memberFormPhone.trim() === '+91') {
      Alert.alert('Required Field', 'Please enter Phone Number.');
      return;
    }
    if (!memberFormEmail.trim()) {
      Alert.alert('Required Field', 'Please enter Email Address.');
      return;
    }
    const des = designations.find((d) => d.id === memberFormDesignationId) || designations[0];
    const created: Worker = {
      id: `w-${Date.now()}`,
      name: memberFormName.trim(),
      role: des.title,
      phone: memberFormPhone.trim(),
      assignedParcels: memberFormFarm,
      status: memberFormStatus === 'Active' ? 'On Duty' : 'Off Duty',
    };
    setWorkers([...workers, created]);
    setIsAddMemberOpen(false);
    setMemberFormName('');
    setMemberFormPhone('+91 ');
    setMemberFormEmail('');
    setMemberFormNotes('');
    setMemberFormStatus('Active');
    Alert.alert('Member Added', `${created.name} added as ${created.role} (${memberFormFarm}).`);
  };

  const handleAddDesignation = () => {
    if (!newDesTitle.trim()) {
      Alert.alert('Required', 'Please enter designation title.');
      return;
    }
    const created: Designation = {
      id: `des-${Date.now()}`,
      title: newDesTitle.trim(),
      description: newDesDesc.trim() || 'Custom field designation',
      assignedCount: 0,
      modules: ['Weather', 'Tasks'],
    };
    setDesignations([...designations, created]);
    setIsAddDesignationOpen(false);
    setNewDesTitle('');
    setNewDesDesc('');
    Alert.alert('Role Created', `Designation "${created.title}" configured.`);
  };

  const filteredWorkers = workers.filter((w) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        w.name.toLowerCase().includes(q) ||
        w.role.toLowerCase().includes(q) ||
        w.phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Team & Workforce</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header Block with Sub-Tab Switcher & Action Button */}
        <View style={styles.headerBlock}>
          <View style={styles.headerTitleWrap}>
            <View style={styles.titleRow}>
              <Text style={styles.mainTitle}>Team & Workforce Management</Text>
              <View style={styles.rbacBadge}>
                <Text style={styles.rbacBadgeText}>Role-Based Access</Text>
              </View>
            </View>
            <Text style={styles.mainSub}>
              Configure designations with module-level permissions via checkboxes, and assign staff members to farm holdings.
            </Text>
          </View>

          {/* Sub-Tab Navigation & Add Button */}
          <View style={styles.subTabRow}>
            <View style={styles.subTabSwitcher}>
              <TouchableOpacity
                style={[styles.subTabBtn, subTab === 'members' && styles.subTabBtnActive]}
                onPress={() => setSubTab('members')}
                activeOpacity={0.8}
              >
                <Feather
                  name="users"
                  size={14}
                  color={subTab === 'members' ? '#0C4B32' : '#55685D'}
                />
                <Text
                  style={[
                    styles.subTabBtnText,
                    subTab === 'members' && styles.subTabBtnTextActive,
                  ]}
                >
                  Members ({totalWorkforce})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.subTabBtn, subTab === 'designations' && styles.subTabBtnActive]}
                onPress={() => setSubTab('designations')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color={subTab === 'designations' ? '#0C4B32' : '#55685D'}
                />
                <Text
                  style={[
                    styles.subTabBtnText,
                    subTab === 'designations' && styles.subTabBtnTextActive,
                  ]}
                >
                  Roles ({totalRoles})
                </Text>
              </TouchableOpacity>
            </View>

            {subTab === 'members' ? (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setIsAddMemberOpen(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="person-add" size={14} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Add Member</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setIsAddDesignationOpen(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={15} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Create Role</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 4-Metric Cards */}
        <View style={styles.metricGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Workforce</Text>
            <Text style={styles.metricVal}>{totalWorkforce}</Text>
            <Text style={styles.metricSub}>Active staff & field personnel</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Configured Roles</Text>
            <Text style={styles.metricVal}>{totalRoles}</Text>
            <TouchableOpacity onPress={() => setSubTab('designations')}>
              <Text style={styles.metricLink}>Manage roles &rarr;</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Assigned Holdings</Text>
            <Text style={styles.metricVal}>2</Text>
            <Text style={styles.metricSub}>Active parcel deployments</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Active Workforce</Text>
            <Text style={[styles.metricVal, { color: '#059669' }]}>{activeCount}</Text>
            <Text style={[styles.metricSub, { color: '#059669' }]}>
              {pendingCount} pending invite
            </Text>
          </View>
        </View>

        {/* SUB-TAB 1: MEMBERS DIRECTORY */}
        {subTab === 'members' ? (
          <View style={styles.card}>
            {/* Search Input */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={14} color="#889B90" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search staff by name, role or phone..."
                placeholderTextColor="#889B90"
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={14} color="#889B90" />
                </TouchableOpacity>
              )}
            </View>

            {/* Workers List */}
            <View style={styles.membersList}>
              {filteredWorkers.map((w, idx) => (
                <View
                  key={w.id}
                  style={[
                    styles.memberRow,
                    idx !== filteredWorkers.length - 1 && styles.rowBorder,
                  ]}
                >
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {w.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </Text>
                  </View>

                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={styles.nameRow}>
                      <Text style={styles.memberName}>{w.name}</Text>
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>Active</Text>
                      </View>
                    </View>
                    <Text style={styles.memberRole}>{w.role}</Text>
                    <Text style={styles.memberMeta}>
                      📍 {w.assignedParcels} • {w.phone}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => handleCall(w.phone, w.name)}
                    activeOpacity={0.7}
                  >
                    <Feather name="phone" size={14} color="#0C4B32" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ) : (
          /* SUB-TAB 2: DESIGNATIONS & MODULE PERMISSIONS */
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Configured Designations & Module Access</Text>
            <Text style={styles.cardSub}>
              Assign granular permissions so operators only access modules pertinent to their daily routine.
            </Text>

            <View style={styles.desList}>
              {designations.map((d) => (
                <View key={d.id} style={styles.desCard}>
                  <View style={styles.desHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.desTitle}>{d.title}</Text>
                      <Text style={styles.desDesc}>{d.description}</Text>
                    </View>
                    <View style={styles.desCountBadge}>
                      <Text style={styles.desCountText}>{d.assignedCount} Assigned</Text>
                    </View>
                  </View>

                  {/* Module Checkbox Badges */}
                  <View style={styles.modulesGrid}>
                    <Text style={styles.modLabel}>ENABLED MODULE ACCESS:</Text>
                    <View style={styles.modBadgesRow}>
                      {d.modules.map((m) => (
                        <View key={m} style={styles.modBadge}>
                          <Ionicons name="checkmark-circle" size={12} color="#0C4B32" />
                          <Text style={styles.modBadgeText}>{m}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ADD MEMBER MODAL (Slide-up Bottom Sheet) */}
      <Modal
        visible={isAddMemberOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddMemberOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdropPressable}
            activeOpacity={1}
            onPress={() => setIsAddMemberOpen(false)}
          />
          <View style={styles.modalCard}>
            {/* Slide-up handle indicator */}
            <View style={styles.sheetHandle} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconWrap}>
                  <Ionicons name="people" size={20} color="#0C4B32" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Add Team Member</Text>
                  <Text style={styles.modalSub}>
                    Enter workforce staff details and link them to an active Designation & Role.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsAddMemberOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#889B90" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Row 1: Full Name * & Phone Number * */}
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Gurmukh Ram"
                    placeholderTextColor="#9CA3AF"
                    value={memberFormName}
                    onChangeText={setMemberFormName}
                  />
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>Phone Number *</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="phone-pad"
                    placeholder="+91"
                    placeholderTextColor="#9CA3AF"
                    value={memberFormPhone}
                    onChangeText={setMemberFormPhone}
                  />
                </View>
              </View>

              {/* Row 2: Email Address * & Assigned Farm Holding * */}
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>Email Address *</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="e.g. operator@khetivo.farm"
                    placeholderTextColor="#9CA3AF"
                    value={memberFormEmail}
                    onChangeText={setMemberFormEmail}
                  />
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>Assigned Farm Holding *</Text>
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() => {
                      setIsFarmDropdownOpen(!isFarmDropdownOpen);
                      setIsDesignationDropdownOpen(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.selectBtnText} numberOfLines={1}>
                      {memberFormFarm}
                    </Text>
                    <Feather
                      name={isFarmDropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color="#55685D"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Farm Dropdown Menu */}
              {isFarmDropdownOpen && (
                <View style={styles.dropdownList}>
                  {[
                    'All Holdings (Multi-Farm Access)',
                    'Khetivo Green Acres (Samrala)',
                    'Malwa Golden Fields (Sangrur)',
                  ].map((farmOption) => (
                    <TouchableOpacity
                      key={farmOption}
                      style={[
                        styles.dropdownItem,
                        memberFormFarm === farmOption && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        setMemberFormFarm(farmOption);
                        setIsFarmDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          memberFormFarm === farmOption && styles.dropdownItemTextActive,
                        ]}
                      >
                        {farmOption}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Row 3: Assigned Designation & Role (Card Container matching Image 1) */}
              <View style={styles.roleCard}>
                <Text style={styles.roleCardLabel}>Assigned Designation & Role *</Text>
                <TouchableOpacity
                  style={styles.selectBtn}
                  onPress={() => {
                    setIsDesignationDropdownOpen(!isDesignationDropdownOpen);
                    setIsFarmDropdownOpen(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectBtnText} numberOfLines={1}>
                    {(() => {
                      const des =
                        designations.find((d) => d.id === memberFormDesignationId) ||
                        designations[0];
                      return `${des.title} (${des.modules.length} of 12 modules granted)`;
                    })()}
                  </Text>
                  <Feather
                    name={isDesignationDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#55685D"
                  />
                </TouchableOpacity>

                {isDesignationDropdownOpen && (
                  <View style={styles.dropdownList}>
                    {designations.map((des) => (
                      <TouchableOpacity
                        key={des.id}
                        style={[
                          styles.dropdownItem,
                          memberFormDesignationId === des.id && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setMemberFormDesignationId(des.id);
                          setIsDesignationDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            memberFormDesignationId === des.id && styles.dropdownItemTextActive,
                          ]}
                        >
                          {des.title} ({des.modules.length} of 12 modules granted)
                        </Text>
                        {memberFormDesignationId === des.id && (
                          <Ionicons name="checkmark-circle" size={16} color="#0C4B32" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <View style={styles.roleCardFooter}>
                  <Text style={styles.roleCardSubtext}>
                    This member will inherit the module permissions of the selected role.
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsAddMemberOpen(false);
                      setSubTab('designations');
                    }}
                  >
                    <Text style={styles.roleCardLink}>
                      Edit roles in Designations tab →
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Row 4: Operational Responsibilities (Optional) */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Operational Responsibilities (Optional)</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={3}
                  placeholder="e.g. Nighttime fertigation, tractor servicing, machinery maintenance logbook..."
                  placeholderTextColor="#9CA3AF"
                  value={memberFormNotes}
                  onChangeText={setMemberFormNotes}
                />
              </View>

              {/* Row 5: Status Radio Selection */}
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status:</Text>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setMemberFormStatus('Active')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={memberFormStatus === 'Active' ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={memberFormStatus === 'Active' ? '#0C4B32' : '#889B90'}
                  />
                  <Text style={styles.radioLabel}>Active Member</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setMemberFormStatus('Pending Invite')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={memberFormStatus === 'Pending Invite' ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={memberFormStatus === 'Pending Invite' ? '#0C4B32' : '#889B90'}
                  />
                  <Text style={styles.radioLabel}>Send Pending Invite</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Modal Footer matching Image 1 */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsAddMemberOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleAddMember}
                activeOpacity={0.8}
              >
                <Feather name="user-plus" size={14} color="#FFFFFF" />
                <Text style={styles.modalSubmitText}>Add Member</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ADD DESIGNATION MODAL (Slide-up Bottom Sheet) */}
      <Modal
        visible={isAddDesignationOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddDesignationOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdropPressable}
            activeOpacity={1}
            onPress={() => setIsAddDesignationOpen(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.sheetHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Designation</Text>
              <TouchableOpacity onPress={() => setIsAddDesignationOpen(false)}>
                <Ionicons name="close" size={22} color="#55685D" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Role / Designation Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Spray Operator"
                value={newDesTitle}
                onChangeText={setNewDesTitle}
              />

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Description</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Brief role responsibilities..."
                value={newDesDesc}
                onChangeText={setNewDesDesc}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsAddDesignationOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleAddDesignation}>
                <Text style={styles.modalSubmitText}>Save Designation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#26352D',
  },
  rbacBadge: {
    backgroundColor: '#E7F3EB',
    borderWidth: 1,
    borderColor: '#C6E2D0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  rbacBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0C4B32',
  },
  mainSub: {
    fontSize: 12,
    color: '#55685D',
    lineHeight: 16,
  },
  subTabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  subTabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 12,
    padding: 3,
  },
  subTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  subTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  subTabBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#55685D',
  },
  subTabBtnTextActive: {
    color: '#0C4B32',
    fontWeight: '700',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0C4B32',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    borderRadius: 12,
    padding: 10,
    gap: 2,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#55685D',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#26352D',
  },
  metricSub: {
    fontSize: 9,
    color: '#889B90',
  },
  metricLink: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0C4B32',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 16,
    gap: 12,
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    color: '#26352D',
    padding: 0,
  },
  membersList: {
    borderTopWidth: 1,
    borderTopColor: '#E5ECE7',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E7F3EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0C4B32',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#26352D',
  },
  activePill: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  memberRole: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0C4B32',
  },
  memberMeta: {
    fontSize: 10,
    color: '#55685D',
  },
  callBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Designations
  desList: {
    gap: 10,
    marginTop: 4,
  },
  desCard: {
    backgroundColor: '#FBFDFB',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  desHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  desTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#26352D',
  },
  desDesc: {
    fontSize: 10,
    color: '#55685D',
    marginTop: 1,
  },
  desCountBadge: {
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  desCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#55685D',
  },
  modulesGrid: {
    gap: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E5ECE7',
  },
  modLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#889B90',
  },
  modBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  modBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E7F3EB',
    borderWidth: 1,
    borderColor: '#C6E2D0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0C4B32',
  },

  // Modals (Slide-up Bottom Sheet)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: '90%',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
    width: '100%',
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E7F3EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#26352D',
  },
  modalSub: {
    fontSize: 11,
    color: '#55685D',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    maxHeight: 460,
  },
  modalScrollContent: {
    gap: 12,
    paddingVertical: 4,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formCol: {
    flex: 1,
  },
  formGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#26352D',
    marginBottom: 2,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#26352D',
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectBtnText: {
    fontSize: 12,
    color: '#26352D',
    flex: 1,
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F8F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemActive: {
    backgroundColor: '#E7F3EB',
  },
  dropdownItemText: {
    fontSize: 12,
    color: '#26352D',
    flex: 1,
  },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: '#0C4B32',
  },
  roleCard: {
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  roleCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#26352D',
  },
  roleCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    flexWrap: 'wrap',
    gap: 4,
  },
  roleCardSubtext: {
    fontSize: 10,
    color: '#55685D',
    flex: 1,
  },
  roleCardLink: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0C4B32',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#26352D',
    minHeight: 56,
    textAlignVertical: 'top',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 4,
    flexWrap: 'wrap',
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#26352D',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radioLabel: {
    fontSize: 11,
    color: '#26352D',
    fontWeight: '500',
  },
  modalBody: {
    gap: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5ECE7',
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCE6DE',
    backgroundColor: '#FFFFFF',
  },
  modalCancelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#26352D',
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0C4B32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modalSubmitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
