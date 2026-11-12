import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons, Feather } from '@expo/vector-icons';

interface SubscriptionScreenProps {
  onBack: () => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ onBack }) => {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [activePlanId, setActivePlanId] = useState('enterprise');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free Starter Tier',
      annualPrice: 0,
      monthlyPrice: 0,
      acreageLimit: 'Up to 5 Acres',
      farmLimit: '1 Farm Holding',
      features: [
        'Real-time hyper-local weather advisory',
        'Basic PAU crop schedule templates',
        'Daily field tasks calendar',
        'Standard APMC mandi live rates',
      ],
    },
    {
      id: 'pro',
      name: 'Pro Kisan Grower',
      annualPrice: 2999,
      monthlyPrice: 249,
      acreageLimit: 'Up to 25 Acres',
      farmLimit: '2 Farm Holdings',
      features: [
        'Everything in Free Starter Tier',
        'Automated fertilizer split calculator',
        'Inventory low-stock & expiry alerts',
        'Priority PAU disease warnings',
      ],
    },
    {
      id: 'enterprise',
      name: 'Precision Enterprise Agri',
      annualPrice: 5999,
      monthlyPrice: 599,
      acreageLimit: 'Up to 50 Acres',
      farmLimit: 'Unlimited Holdings',
      features: [
        'Everything in Pro Kisan Grower',
        'Multi-farm portfolio consolidation',
        'Official NABARD/SBI audit PDF reports',
        '24/7 Priority agronomist WhatsApp helpline',
      ],
    },
  ];

  const invoices = [
    {
      id: 'inv-01',
      invoiceNo: 'KV-INV-2026-089',
      date: '14 Nov 2026',
      planName: 'Precision Enterprise Agri (Annual)',
      amount: 5999,
    },
    {
      id: 'inv-02',
      invoiceNo: 'KV-INV-2025-042',
      date: '14 Nov 2025',
      planName: 'Pro Kisan Grower (Annual)',
      amount: 2999,
    },
  ];

  const currentActivePlan = plans.find((p) => p.id === activePlanId) || plans[2];

  const handleSelectPlan = (planId: string) => {
    setActivePlanId(planId);
    setToastMessage('Plan updated successfully.');
    Alert.alert('Plan Selected', 'Your farm subscription license has been updated.');
  };

  const handleDownloadInvoice = (inv: (typeof invoices)[0]) => {
    Alert.alert('Invoice Download', `Tax invoice ${inv.invoiceNo} (₹${inv.amount.toLocaleString('en-IN')}) downloaded as PDF.`);
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Subscription / Plan</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Toast */}
        {toastMessage && (
          <View style={styles.toastCard}>
            <Ionicons name="checkmark-circle" size={16} color="#059669" />
            <Text style={styles.toastText}>{toastMessage}</Text>
            <TouchableOpacity onPress={() => setToastMessage(null)} style={{ marginLeft: 'auto' }}>
              <Ionicons name="close" size={16} color="#059669" />
            </TouchableOpacity>
          </View>
        )}

        {/* Sub Header */}
        <View style={styles.headerBlock}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.mainTitle}>Subscription & Plan</Text>
            <Text style={styles.mainSub}>
              Manage your farm license, active acreage allocation, and billing receipts.
            </Text>
          </View>

          {/* Billing Cycle Switcher */}
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

        {/* Active Plan Overview Card */}
        <View style={styles.activePlanCard}>
          <View style={styles.activePlanHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.activeLicenseBadgeRow}>
                <View style={styles.activeLicenseBadge}>
                  <Text style={styles.activeLicenseBadgeText}>Active License</Text>
                </View>
                <Text style={styles.renewalText}>Renews 14 Nov 2027 via UPI</Text>
              </View>
              <Text style={styles.activePlanName}>{currentActivePlan.name}</Text>
            </View>

            <View style={styles.priceWrap}>
              <Text style={styles.priceVal}>
                {billingCycle === 'annual'
                  ? currentActivePlan.annualPrice === 0
                    ? 'Free'
                    : `₹${currentActivePlan.annualPrice.toLocaleString('en-IN')}`
                  : currentActivePlan.monthlyPrice === 0
                  ? 'Free'
                  : `₹${currentActivePlan.monthlyPrice.toLocaleString('en-IN')}`}
              </Text>
              <Text style={styles.pricePeriod}>
                {currentActivePlan.annualPrice === 0
                  ? 'forever'
                  : billingCycle === 'annual'
                  ? '/ year'
                  : '/ month'}
              </Text>
            </View>
          </View>

          {/* Quotas Meter */}
          <View style={styles.quotasGrid}>
            <View style={styles.quotaBox}>
              <View style={styles.quotaHeader}>
                <Text style={styles.quotaLabel}>Acreage Used</Text>
                <Text style={styles.quotaVal}>35.5 / 50.0 Ac</Text>
              </View>
              <View style={styles.quotaTrack}>
                <View style={[styles.quotaFill, { width: '71%', backgroundColor: '#0C4B32' }]} />
              </View>
            </View>

            <View style={styles.quotaBox}>
              <View style={styles.quotaHeader}>
                <Text style={styles.quotaLabel}>Farm Holdings</Text>
                <Text style={styles.quotaVal}>2 Registered</Text>
              </View>
              <View style={styles.quotaTrack}>
                <View style={[styles.quotaFill, { width: '40%', backgroundColor: '#278449' }]} />
              </View>
            </View>

            <View style={styles.quotaBox}>
              <View style={styles.quotaHeader}>
                <Text style={styles.quotaLabel}>Team Members</Text>
                <Text style={styles.quotaVal}>4 of 10 Seats</Text>
              </View>
              <View style={styles.quotaTrack}>
                <View style={[styles.quotaFill, { width: '40%', backgroundColor: '#0C4B32' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Available Plans (3 Cards) */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Available Plans</Text>

          <View style={styles.plansList}>
            {plans.map((plan) => {
              const isCurrent = activePlanId === plan.id;
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
                <View
                  key={plan.id}
                  style={[
                    styles.planTierCard,
                    isCurrent && styles.planTierCardCurrent,
                  ]}
                >
                  <View style={styles.tierTop}>
                    <Text style={styles.tierTitle}>{plan.name}</Text>
                    {isCurrent && (
                      <View style={styles.tierCurrentBadge}>
                        <Text style={styles.tierCurrentBadgeText}>Active Plan</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.tierPriceRow}>
                    <Text style={styles.tierPriceVal}>{priceVal}</Text>
                    <Text style={styles.tierPricePeriod}>{period}</Text>
                  </View>
                  <Text style={styles.tierLimits}>
                    {plan.acreageLimit} • {plan.farmLimit}
                  </Text>

                  {/* Feature Bullets */}
                  <View style={styles.featuresList}>
                    {plan.features.map((feat, fIdx) => (
                      <View key={fIdx} style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                        <Text style={styles.featureText}>{feat}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Button */}
                  {isCurrent ? (
                    <View style={styles.currentBtnDisabled}>
                      <Text style={styles.currentBtnText}>Current Plan</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.selectPlanBtn}
                      onPress={() => handleSelectPlan(plan.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.selectPlanBtnText}>Select Plan</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent Payment Invoices */}
        <View style={styles.invoicesCard}>
          <Text style={styles.invoicesTitle}>Recent Payment Invoices</Text>
          <Text style={styles.invoicesSub}>
            Tax receipts for Samrala Precision Agro Enterprises (GSTIN: 03AAAFK1234Q1Z5)
          </Text>

          <View style={styles.invoicesList}>
            {invoices.map((inv) => (
              <View key={inv.id} style={styles.invoiceRow}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.invNo}>{inv.invoiceNo}</Text>
                  <Text style={styles.invDate}>{inv.date} • {inv.planName}</Text>
                </View>

                <View style={styles.invRight}>
                  <Text style={styles.invAmt}>₹{inv.amount.toLocaleString('en-IN')}</Text>
                  <TouchableOpacity
                    style={styles.downloadIconBtn}
                    onPress={() => handleDownloadInvoice(inv)}
                    activeOpacity={0.7}
                  >
                    <Feather name="download" size={15} color="#0C4B32" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
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
  },
  cycleSwitcher: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 12,
    padding: 3,
  },
  cycleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cycleBtnActive: {
    backgroundColor: '#0C4B32',
  },
  cycleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#55685D',
  },
  cycleBtnTextActive: {
    color: '#FFFFFF',
  },

  // Active Plan Card
  activePlanCard: {
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
  activePlanHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  activeLicenseBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  activeLicenseBadge: {
    backgroundColor: '#E7F3EB',
    borderWidth: 1,
    borderColor: '#C6E2D0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  activeLicenseBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0C4B32',
  },
  renewalText: {
    fontSize: 10,
    color: '#55685D',
  },
  activePlanName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#26352D',
  },
  priceWrap: {
    alignItems: 'flex-end',
  },
  priceVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0C4B32',
  },
  pricePeriod: {
    fontSize: 10,
    color: '#55685D',
  },
  quotasGrid: {
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5ECE7',
  },
  quotaBox: {
    backgroundColor: '#FBFDFB',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    borderRadius: 10,
    padding: 8,
    gap: 4,
  },
  quotaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quotaLabel: {
    fontSize: 11,
    color: '#55685D',
  },
  quotaVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#26352D',
  },
  quotaTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5ECE7',
    overflow: 'hidden',
  },
  quotaFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Available Plans
  sectionWrap: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26352D',
  },
  plansList: {
    gap: 12,
  },
  planTierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 16,
    gap: 10,
  },
  planTierCardCurrent: {
    borderColor: '#0C4B32',
    borderWidth: 1.5,
  },
  tierTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26352D',
  },
  tierCurrentBadge: {
    backgroundColor: '#E7F3EB',
    borderWidth: 1,
    borderColor: '#C6E2D0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  tierCurrentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0C4B32',
  },
  tierPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  tierPriceVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0C4B32',
  },
  tierPricePeriod: {
    fontSize: 11,
    color: '#55685D',
  },
  tierLimits: {
    fontSize: 11,
    color: '#55685D',
  },
  featuresList: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5ECE7',
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 11,
    color: '#26352D',
    flex: 1,
  },
  currentBtnDisabled: {
    backgroundColor: '#E7F3EB',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  currentBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0C4B32',
  },
  selectPlanBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0C4B32',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  selectPlanBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0C4B32',
  },

  // Invoices
  invoicesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 16,
    gap: 6,
  },
  invoicesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26352D',
  },
  invoicesSub: {
    fontSize: 10,
    color: '#55685D',
    marginBottom: 8,
  },
  invoicesList: {
    borderTopWidth: 1,
    borderTopColor: '#E5ECE7',
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
    gap: 10,
  },
  invNo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#26352D',
    fontFamily: 'monospace',
  },
  invDate: {
    fontSize: 10,
    color: '#55685D',
  },
  invRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  invAmt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0C4B32',
  },
  downloadIconBtn: {
    padding: 4,
  },
});
