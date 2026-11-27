import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlert } from '../context/AlertContext';

interface SubscriptionScreenProps {
  onBack: () => void;
  onContinueToHome?: () => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  onBack,
  onContinueToHome,
}) => {
  const { showAlert, showSuccess } = useAlert();
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [selectedPlanId, setSelectedPlanId] = useState('pro');

  const plans = [
    {
      id: 'starter',
      name: 'Kisan Starter',
      tagline: 'Basic record keeping for small progressive farms',
      annualPrice: 0,
      monthlyPrice: 0,
      acreageLimit: 'Up to 5 Acres',
      farmLimit: '1 Farm Holding',
      seats: '1 Owner Login',
      popular: false,
      features: [
        '1 Registered Farm Plot with GPS boundary auto-detection.',
        'Full Stock Register: Seeds, fertilizers, chemicals & diesel.',
        'Expiry Alerts at 90, 30 & 7 days to eliminate inventory waste.',
        'Equipment & Machinery Register: Service logs & breakdown tracking.',
      ],
    },
    {
      id: 'pro',
      name: 'Khetivo Pro',
      tagline: 'Multi-farm portfolio, crop timeline & smart foliar windows',
      annualPrice: 2499,
      monthlyPrice: 249,
      acreageLimit: 'Up to 5 Farms',
      farmLimit: '5 Farm Holdings',
      seats: 'Supervisor Accounts',
      popular: true,
      features: [
        'Up to 5 Farms with Multi-Farm portfolio selector.',
        'Crop Planning & Growth Timeline: Day 1 to 140 tracking.',
        '7-Day Hyperlocal Weather & smart foliar spray windows.',
        'Daily Task Operations & field labor assignment.',
        'Financial Accounting: Input costs vs. harvest P&L margin per acre.',
        'Team Management: Role-based access for supervisors.',
      ],
    },
    {
      id: 'enterprise',
      name: 'Khetivo Prime',
      tagline: 'Unlimited farms, agronomy guides & dedicated account manager',
      annualPrice: 6999,
      monthlyPrice: 599,
      acreageLimit: 'Unlimited Acres',
      farmLimit: 'Unlimited Farms',
      seats: 'All Holdings + Priority Desk',
      popular: false,
      features: [
        'Unlimited Farms & Holdings across all regions.',
        "Recommended Do's & Don'ts: Stage-wise admin agronomy guides.",
        'Live Advisories & Alerts: Instant disease & weather bulletins.',
        'Expert Agronomy Support: Direct tickets & on-site field visits.',
        'Dedicated Account Manager with priority desk access.',
        'AI Disease Scanner (Google Lens): Instant leaf diagnosis [Coming Soon].',
      ],
    },
  ];

  const handleBuyOnWebsite = async (plan: (typeof plans)[0]) => {
    if (plan.annualPrice === 0) {
      showSuccess(
        'Kisan Starter Activated',
        'You are subscribed to the free starter tier. You can explore all basic features immediately.',
        () => {
          if (onContinueToHome) {
            onContinueToHome();
          } else {
            onBack();
          }
        }
      );
      return;
    }

    // Purchase URL on Web Dashboard
    const purchaseUrl = `https://khetivo.farm/dashboard?tab=subscription&plan=${plan.id}&cycle=${billingCycle}`;

    showAlert({
      title: 'Proceed to Secure Checkout',
      message: `You will be redirected to the Khetivo website to securely complete payment for the ${plan.name} (${billingCycle === 'annual' ? 'Annual' : 'Monthly'}) plan via Razorpay / UPI / NetBanking.`,
      type: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Website to Buy',
          style: 'default',
          onPress: async () => {
            try {
              const supported = await Linking.canOpenURL(purchaseUrl);
              if (supported) {
                await Linking.openURL(purchaseUrl);
              } else {
                await Linking.openURL('https://khetivo.farm/dashboard');
              }
            } catch (err) {
              console.warn('Could not open purchase URL:', err);
              Linking.openURL('https://khetivo.farm');
            }
          },
        },
      ],
    });
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Subscription Plans</Text>
        {onContinueToHome ? (
          <TouchableOpacity onPress={onContinueToHome} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Block */}
        <View style={styles.headerBlock}>
          <View style={styles.headerIconCircle}>
            <MaterialCommunityIcons name="shield-check" size={26} color={colors.primary} />
          </View>
          <Text style={styles.mainTitle}>Choose Your Farmer Plan</Text>
          <Text style={styles.mainSub}>
            Tailored precision agriculture tiers designed for progressive growers, commercial orchards, and multi-holding farms.
          </Text>

          {/* Billing Frequency Switcher */}
          <View style={styles.cycleSwitcher}>
            <TouchableOpacity
              style={[styles.cycleBtn, billingCycle === 'annual' && styles.cycleBtnActive]}
              onPress={() => setBillingCycle('annual')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.cycleBtnText,
                  billingCycle === 'annual' && styles.cycleBtnTextActive,
                ]}
              >
                Annual (Save 20%)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cycleBtn, billingCycle === 'monthly' && styles.cycleBtnActive]}
              onPress={() => setBillingCycle('monthly')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.cycleBtnText,
                  billingCycle === 'monthly' && styles.cycleBtnTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Available Plans (3 Professional Cards) */}
        <View style={styles.plansList}>
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const priceVal =
              billingCycle === 'annual'
                ? plan.annualPrice === 0
                  ? 'Free'
                  : `₹${plan.annualPrice.toLocaleString('en-IN')}`
                : plan.monthlyPrice === 0
                ? 'Free'
                : `₹${plan.monthlyPrice.toLocaleString('en-IN')}`;
            const period =
              plan.annualPrice === 0
                ? 'forever'
                : billingCycle === 'annual'
                ? '/ year'
                : '/ month';

            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planTierCard,
                  isSelected && styles.planTierCardSelected,
                  plan.popular && styles.planTierCardPopular,
                ]}
                onPress={() => setSelectedPlanId(plan.id)}
                activeOpacity={0.9}
              >
                {/* Popular Ribbon */}
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                  </View>
                )}

                <View style={styles.tierTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tierTitle}>{plan.name}</Text>
                    <Text style={styles.tierTagline}>{plan.tagline}</Text>
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleActive,
                    ]}
                  >
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </View>

                {/* Price Display */}
                <View style={styles.tierPriceRow}>
                  <Text style={styles.tierPriceVal}>{priceVal}</Text>
                  <Text style={styles.tierPricePeriod}>{period}</Text>
                </View>

                {/* Quota Strip */}
                <View style={styles.quotaStrip}>
                  <View style={styles.quotaItem}>
                    <Ionicons name="resize-outline" size={13} color={colors.primary} />
                    <Text style={styles.quotaText}>{plan.acreageLimit}</Text>
                  </View>
                  <Text style={styles.quotaDot}>•</Text>
                  <View style={styles.quotaItem}>
                    <Ionicons name="business-outline" size={13} color={colors.primary} />
                    <Text style={styles.quotaText}>{plan.farmLimit}</Text>
                  </View>
                  <Text style={styles.quotaDot}>•</Text>
                  <View style={styles.quotaItem}>
                    <Ionicons name="people-outline" size={13} color={colors.primary} />
                    <Text style={styles.quotaText}>{plan.seats}</Text>
                  </View>
                </View>

                {/* Feature Bullets */}
                <View style={styles.featuresList}>
                  {plan.features.map((feat, fIdx) => (
                    <View key={fIdx} style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
                      <Text style={styles.featureText}>{feat}</Text>
                    </View>
                  ))}
                </View>

                {/* CTA Button: Redirects to Web Checkout */}
                <TouchableOpacity
                  style={[
                    styles.buyBtn,
                    plan.annualPrice === 0 ? styles.freeBtn : styles.paidBtn,
                  ]}
                  onPress={() => handleBuyOnWebsite(plan)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.buyBtnText,
                      plan.annualPrice === 0 ? styles.freeBtnText : styles.paidBtnText,
                    ]}
                  >
                    {plan.annualPrice === 0
                      ? 'Continue with Free Starter'
                      : `Purchase on Website →`}
                  </Text>
                  {plan.annualPrice > 0 && (
                    <Feather name="external-link" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Security & Money Back Guarantee Strip */}
        <View style={styles.guaranteeCard}>
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.guaranteeTitle}>Bank-Grade Secure Checkout</Text>
            <Text style={styles.guaranteeSub}>
              Payments are processed securely on the official Khetivo web portal via Razorpay, UPI, credit/debit cards, and NetBanking with GST invoices.
            </Text>
          </View>
        </View>

        {/* Bottom Home Action if entered from signup */}
        {onContinueToHome && (
          <TouchableOpacity
            style={styles.continueToHomeBtn}
            onPress={onContinueToHome}
            activeOpacity={0.7}
          >
            <Text style={styles.continueToHomeText}>Decide Later • Continue to Dashboard</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#E7F3EB',
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },

  headerBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  mainSub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },

  cycleSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F4F8F4',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#DCE6DE',
    width: '100%',
  },
  cycleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  cycleBtnActive: {
    backgroundColor: colors.primary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cycleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  cycleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  plansList: {
    gap: 16,
  },
  planTierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  planTierCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FCFFFD',
  },
  planTierCardPopular: {
    borderColor: colors.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  tierTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingRight: 60,
    marginBottom: 8,
  },
  tierTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  tierTagline: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },

  tierPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  tierPriceVal: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  tierPricePeriod: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
    fontWeight: '500',
  },

  quotaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    backgroundColor: '#F8FAF8',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8EFE9',
    marginBottom: 14,
  },
  quotaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quotaText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  quotaDot: {
    fontSize: 10,
    color: colors.textMuted,
  },

  featuresList: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
    paddingTop: 12,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 17,
    flex: 1,
  },

  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  buyBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  paidBtn: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  paidBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  freeBtn: {
    backgroundColor: '#E7F3EB',
    borderWidth: 1,
    borderColor: '#C6E2D0',
  },
  freeBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  guaranteeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  guaranteeSub: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
  },

  continueToHomeBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  continueToHomeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
