import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView,
} from 'react-native';
import { colors } from './src/theme/colors';
import { initialFarms, Farm } from './src/data/mockData';
import { HomeScreen } from './src/screens/HomeScreen';
import { CropGuideScreen } from './src/screens/CropGuideScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { InventoryScreen } from './src/screens/InventoryScreen';
import { LedgerScreen } from './src/screens/LedgerScreen';
import { EquipmentScreen } from './src/screens/EquipmentScreen';
import { ParcelsScreen } from './src/screens/ParcelsScreen';
import { TeamScreen } from './src/screens/TeamScreen';
import { SupportScreen } from './src/screens/SupportScreen';
import { AdvisoriesScreen } from './src/screens/AdvisoriesScreen';
import { WeatherScreen } from './src/screens/WeatherScreen';
import { ReportsScreen } from './src/screens/ReportsScreen';
import { SubscriptionScreen } from './src/screens/SubscriptionScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { MoreScreen } from './src/screens/MoreScreen';
import { TutorialModal } from './src/components/TutorialModal';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

export default function App() {
  const [farms, setFarms] = useState<Farm[]>(initialFarms);
  const [activeFarmId, setActiveFarmId] = useState<string>('farm-1');
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [farmModalVisible, setFarmModalVisible] = useState(false);
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [openAddFarmDirectly, setOpenAddFarmDirectly] = useState(false);

  const currentFarm = farms.find((f) => f.id === activeFarmId) || farms[0];

  const handleAddFarm = (newFarm: Farm) => {
    setFarms((prev) => [newFarm, ...prev]);
    setActiveFarmId(newFarm.id);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'crops':
        return <CropGuideScreen onBack={() => setCurrentScreen('home')} />;
      case 'tasks':
        return <TasksScreen onBack={() => setCurrentScreen('home')} />;
      case 'inventory':
        return <InventoryScreen onBack={() => setCurrentScreen('home')} />;
      case 'ledger':
      case 'stats':
      case 'expenses':
        return <LedgerScreen onBack={() => setCurrentScreen('home')} />;
      case 'equipment':
        return <EquipmentScreen onBack={() => setCurrentScreen('home')} />;
      case 'parcels':
      case 'my-farms':
      case 'farms':
        return (
          <ParcelsScreen
            farms={farms}
            activeFarmId={activeFarmId}
            onSelectFarm={(id) => {
              setActiveFarmId(id);
              setOpenAddFarmDirectly(false);
              setCurrentScreen('home');
            }}
            onAddFarm={handleAddFarm}
            onBack={() => {
              setOpenAddFarmDirectly(false);
              setCurrentScreen('home');
            }}
            openAddModalOnMount={openAddFarmDirectly}
          />
        );
      case 'team':
        return <TeamScreen onBack={() => setCurrentScreen('home')} />;
      case 'support':
        return <SupportScreen onBack={() => setCurrentScreen('home')} />;
      case 'advisories':
        return <AdvisoriesScreen onBack={() => setCurrentScreen('home')} />;
      case 'weather':
        return <WeatherScreen farm={currentFarm} onBack={() => setCurrentScreen('home')} />;
      case 'reports':
        return <ReportsScreen farm={currentFarm} onBack={() => setCurrentScreen('home')} />;
      case 'subscription':
        return <SubscriptionScreen onBack={() => setCurrentScreen('home')} />;
      case 'settings':
        return <SettingsScreen onBack={() => setCurrentScreen('home')} />;
      case 'more':
        return (
          <MoreScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenTutorial={() => setTutorialVisible(true)}
          />
        );
      case 'home':
      default:
        return (
          <HomeScreen
            currentFarm={currentFarm}
            farms={farms}
            onSelectFarm={() => setFarmModalVisible(true)}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenTutorial={() => setTutorialVisible(true)}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        {/* Main Active Screen */}
        <View style={styles.screenContainer}>{renderScreen()}</View>

        {/* ========================================================================= */}
        {/* MOBILE BOTTOM NAVIGATION BAR (Symmetrical 5-Tab Bar matching branding)    */}
        {/* Tabs: Home | Farms | Tasks | Reports | More                               */}
        {/* Active tab has a rich dark-green pill capsule around the icon only        */}
        {/* ========================================================================= */}
        <View style={styles.bottomNav}>
          {/* 1. Home */}
          <TouchableOpacity
            style={styles.navTab}
            onPress={() => setCurrentScreen('home')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconHolder, currentScreen === 'home' && styles.iconHolderActive]}>
              <Ionicons
                name={currentScreen === 'home' ? 'home' : 'home-outline'}
                size={currentScreen === 'home' ? 19 : 22}
                color={currentScreen === 'home' ? '#FFFFFF' : '#55685D'}
              />
            </View>
            <Text style={[styles.navLabel, currentScreen === 'home' && styles.navLabelActive]}>
              Home
            </Text>
          </TouchableOpacity>

          {/* 2. Farms */}
          <TouchableOpacity
            style={styles.navTab}
            onPress={() => setCurrentScreen('parcels')}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconHolder,
                ['parcels', 'farms', 'my-farms'].includes(currentScreen) && styles.iconHolderActive,
              ]}
            >
              <MaterialCommunityIcons
                name={
                  ['parcels', 'farms', 'my-farms'].includes(currentScreen)
                    ? 'sprout'
                    : 'sprout-outline'
                }
                size={['parcels', 'farms', 'my-farms'].includes(currentScreen) ? 20 : 22}
                color={
                  ['parcels', 'farms', 'my-farms'].includes(currentScreen)
                    ? '#FFFFFF'
                    : '#55685D'
                }
              />
            </View>
            <Text
              style={[
                styles.navLabel,
                ['parcels', 'farms', 'my-farms'].includes(currentScreen) && styles.navLabelActive,
              ]}
            >
              Farms
            </Text>
          </TouchableOpacity>

          {/* 3. Tasks */}
          <TouchableOpacity
            style={styles.navTab}
            onPress={() => setCurrentScreen('tasks')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconHolder, currentScreen === 'tasks' && styles.iconHolderActive]}>
              <MaterialCommunityIcons
                name={currentScreen === 'tasks' ? 'checkbox-marked' : 'checkbox-marked-outline'}
                size={currentScreen === 'tasks' ? 19 : 21}
                color={currentScreen === 'tasks' ? '#FFFFFF' : '#55685D'}
              />
            </View>
            <Text style={[styles.navLabel, currentScreen === 'tasks' && styles.navLabelActive]}>
              Tasks
            </Text>
          </TouchableOpacity>

          {/* 4. Reports */}
          <TouchableOpacity
            style={styles.navTab}
            onPress={() => setCurrentScreen('reports')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconHolder, currentScreen === 'reports' && styles.iconHolderActive]}>
              <Ionicons
                name={currentScreen === 'reports' ? 'bar-chart' : 'bar-chart-outline'}
                size={currentScreen === 'reports' ? 19 : 21}
                color={currentScreen === 'reports' ? '#FFFFFF' : '#55685D'}
              />
            </View>
            <Text style={[styles.navLabel, currentScreen === 'reports' && styles.navLabelActive]}>
              Reports
            </Text>
          </TouchableOpacity>

          {/* 5. More */}
          <TouchableOpacity
            style={styles.navTab}
            onPress={() => setCurrentScreen('more')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconHolder, currentScreen === 'more' && styles.iconHolderActive]}>
              <MaterialCommunityIcons
                name={currentScreen === 'more' ? 'view-grid' : 'view-grid-outline'}
                size={currentScreen === 'more' ? 19 : 21}
                color={currentScreen === 'more' ? '#FFFFFF' : '#55685D'}
              />
            </View>
            <Text style={[styles.navLabel, currentScreen === 'more' && styles.navLabelActive]}>
              More
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* ALL FARMS SWITCHER MODAL (With + Add Another Farm)                         */}
        {/* ========================================================================= */}
        <Modal
          visible={farmModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setFarmModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Farm Holding</Text>
                <TouchableOpacity onPress={() => setFarmModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 340 }}>
                {farms.map((farm) => {
                  const isSelected = farm.id === activeFarmId;
                  return (
                    <TouchableOpacity
                      key={farm.id}
                      style={[
                        styles.farmSelectCard,
                        isSelected && styles.farmSelectCardActive,
                      ]}
                      onPress={() => {
                        setActiveFarmId(farm.id);
                        setFarmModalVisible(false);
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.farmSelectIcon}>
                        <MaterialCommunityIcons
                          name="office-building"
                          size={22}
                          color={isSelected ? colors.secondary : colors.primary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.farmSelectName}>{farm.name}</Text>
                        <Text style={styles.farmSelectSub}>
                          {farm.district}, {farm.state} • {farm.totalArea} Acres
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />
                      )}
                    </TouchableOpacity>
                  );
                })}

                {/* + Add Another Farm */}
                <TouchableOpacity
                  style={styles.addFarmModalBtn}
                  onPress={() => {
                    setFarmModalVisible(false);
                    setOpenAddFarmDirectly(true);
                    setCurrentScreen('parcels');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                  <Text style={styles.addFarmModalBtnText}>+ Add Another Farm Holding</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Tutorial Modal */}
        <TutorialModal
          visible={tutorialVisible}
          onClose={() => setTutorialVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContainer: {
    flex: 1,
  },

  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5ECE7',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconHolder: {
    width: 38,
    height: 38,
    borderRadius: 9999,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconHolderActive: {
    backgroundColor: '#0C4B32',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#55685D',
    marginTop: 2,
    letterSpacing: -0.1,
  },
  navLabelActive: {
    color: '#0C4B32',
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  farmSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 12,
  },
  farmSelectCardActive: {
    borderColor: colors.secondary,
    backgroundColor: '#F0FDF4',
  },
  farmSelectIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  farmSelectName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  farmSelectSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  addFarmModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
    marginTop: 6,
  },
  addFarmModalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
