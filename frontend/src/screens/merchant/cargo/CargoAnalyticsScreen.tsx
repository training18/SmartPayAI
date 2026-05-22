import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { useCargoStore } from '@/src/store/cargo.store';
import { formatCurrency } from '@/src/utils/format';

const COLORS = {
  background: '#101416',
  surface: '#1d2022',
  surfaceHigh: '#272a2d',
  primary: '#bbc3ff',
  primaryContainer: '#3d5afe',
  secondary: '#7dffa2',
  text: '#e0e3e6',
  textSecondary: '#c5c5d9',
  outline: '#444656',
  warning: '#ffe082',
  accent: '#ff91e6',
};

export default function CargoAnalyticsScreen() {
  const router = useRouter();
  const { analytics, isLoading, loadAnalytics } = useCargoStore();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const totalSpent = analytics?.totalSpent || 0;
  const totalSaved = analytics?.totalSaved || 0;
  const totalVolume = totalSpent + totalSaved;

  // Percentage of savings vs total possible costs
  const savingsRate = totalVolume > 0 ? (totalSaved / totalVolume) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shipping Analytics</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadAnalytics}>
            <Icon name="refresh" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {isLoading && !analytics ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* SAVINGS KPI SUMMARY */}
            <LinearGradient
              colors={['rgba(255,145,230,0.12)', 'rgba(29,32,34,0.95)']}
              style={styles.heroCard}
            >
              <View style={styles.heroHeader}>
                <View style={styles.iconContainer}>
                  <Icon name="savings" size={20} color={COLORS.accent} />
                </View>
                <Text style={styles.heroLabel}>AI Optimization Savings Rate</Text>
              </View>

              <Text style={styles.heroAmount}>{savingsRate.toFixed(1)}%</Text>
              <Text style={styles.heroSubtext}>
                Reduced overall shipping costs by choosing AI-recommended routes.
              </Text>

              {/* PROGRESS BAR */}
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${savingsRate}%` }]} />
              </View>
            </LinearGradient>

            {/* SPENT & SAVED METRICS */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Total Cost Spent</Text>
                <Text style={styles.kpiValue}>{formatCurrency(totalSpent, 'TRY')}</Text>
                <Text style={styles.kpiSub}>Paid to carriers</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Total Saved</Text>
                <Text style={[styles.kpiValue, { color: COLORS.secondary }]}>
                  {formatCurrency(totalSaved, 'TRY')}
                </Text>
                <Text style={styles.kpiSub}>Kept in balance</Text>
              </View>
            </View>

            {/* PERFORMANCE INSIGHTS */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Logistics Efficiency</Text>

              <View style={styles.efficiencyRow}>
                <View style={styles.efficiencyItem}>
                  <View style={styles.efficiencyIconWrap}>
                    <Icon name="speed" size={20} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.efficiencyVal}>
                      {analytics ? `${analytics.avgDeliveryTime} Days` : '0 Days'}
                    </Text>
                    <Text style={styles.efficiencyLabel}>Average Delivery Speed</Text>
                  </View>
                </View>

                <View style={styles.efficiencyItem}>
                  <View style={styles.efficiencyIconWrap}>
                    <Icon name="tag" size={20} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.efficiencyVal}>
                      {analytics ? analytics.totalShipments : 0} Orders
                    </Text>
                    <Text style={styles.efficiencyLabel}>Total Packages Shipped</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* PROVIDER SHARE DISTRIBUTION */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Carrier Volume Share</Text>

              {analytics && analytics.providerShares && analytics.providerShares.length > 0 ? (
                analytics.providerShares.map((p, index) => {
                  const colors = [COLORS.primary, COLORS.secondary, COLORS.warning];
                  const barColor = colors[index % colors.length];

                  return (
                    <View key={p.providerName} style={styles.shareItem}>
                      <View style={styles.shareHeader}>
                        <Text style={styles.shareName}>{p.providerName}</Text>
                        <Text style={styles.shareStats}>
                          {p.count} shipments ({p.percentage}%)
                        </Text>
                      </View>
                      <View style={styles.shareBarBg}>
                        <View
                          style={[
                            styles.shareBarFill,
                            { width: `${p.percentage}%`, backgroundColor: barColor },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No distribution data available</Text>
                  <Text style={styles.emptySubtext}>Share chart will populate once shipments are processed.</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  refreshButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,145,230,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  heroLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  heroAmount: {
    fontSize: 38,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  heroSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 18,
    lineHeight: 18,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  kpiLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  kpiSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  efficiencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  efficiencyItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  efficiencyIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  efficiencyVal: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  efficiencyLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  shareItem: {
    marginBottom: 16,
  },
  shareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  shareName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  shareStats: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  shareBarBg: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  shareBarFill: {
    height: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
});
