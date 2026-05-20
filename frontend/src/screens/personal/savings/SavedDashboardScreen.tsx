import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSavingsStore } from '@/src/store/savings.store';

const { width } = Dimensions.get('window');

const CATEGORY_ICON: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  grocery: 'shopping-cart',
  coffee: 'local-cafe',
  electronics: 'devices',
  fuel: 'local-gas-station',
  restaurant: 'restaurant',
  clothing: 'checkroom',
  travel: 'flight',
  shopping: 'shopping-bag',
};

const CATEGORY_LABEL: Record<string, string> = {
  grocery: 'Market',
  coffee: 'Kahve',
  electronics: 'Elektronik',
  fuel: 'Akaryakıt',
  restaurant: 'Restoran',
  clothing: 'Giyim',
  travel: 'Seyahat',
  shopping: 'Alışveriş',
};

export default function SavedDashboardScreen() {
  const { dashboard, isLoading, isSeeding, error, loadDashboard, seedMockHistory } = useSavingsStore();

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSeedMock = async () => {
    try {
      await seedMockHistory();
    } catch (e) {
      console.error('Failed to seed mock history:', e);
    }
  };

  if (isLoading && !dashboard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#BBC3FF" />
          <Text style={styles.loadingText}>Loading savings data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 1. Render empty/seed state if no dashboard stats or history found
  const hasHistory = dashboard && dashboard.history && dashboard.history.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Savings</Text>
            <Text style={styles.headerSubtitle}>Your earnings with AI Smart Routing</Text>
          </View>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={() => loadDashboard()} 
            disabled={isLoading || isSeeding}
          >
            <Ionicons name="refresh" size={20} color="#BBC3FF" />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={20} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!hasHistory ? (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['rgba(61, 90, 254, 0.15)', 'rgba(5, 231, 119, 0.05)']}
              style={styles.emptyCard}
            >
              <Ionicons name="sparkles" size={54} color="#7DFFA2" style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No Savings Recorded Yet</Text>
              <Text style={styles.emptyDescription}>
                As you make payments, your cashback, points, miles, and discount benefits will appear here.
              </Text>
              <TouchableOpacity
                style={styles.seedButton}
                onPress={handleSeedMock}
                disabled={isSeeding}
              >
                {isSeeding ? (
                  <ActivityIndicator size="small" color="#0F1315" />
                ) : (
                  <>
                    <Ionicons name="flash" size={18} color="#0F1315" style={{ marginRight: 6 }} />
                    <Text style={styles.seedButtonText}>Load Demo Data</Text>
                  </>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          <>
            {/* Total Saved Card (Premium Gradient) */}
            <LinearGradient
              colors={['#1A1F71', '#3D5AFE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mainSavingsCard}
            >
              <View style={styles.savingsCardHeader}>
                <Text style={styles.savingsCardLabel}>TOTAL EARNINGS</Text>
                <Ionicons name="sparkles" size={24} color="#7DFFA2" />
              </View>
              <Text style={styles.savingsCardAmount}>
                {dashboard!.summary.totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2 })} TL
              </Text>

              <View style={styles.annualProjectionPill}>
                <Ionicons name="trending-up" size={14} color="#7DFFA2" style={{ marginRight: 4 }} />
                <Text style={styles.projectionText}>
                  Projected Annual Earnings: {dashboard!.summary.estimatedAnnualSavingsProjection.toLocaleString('en-US', { maximumFractionDigits: 0 })} TL
                </Text>
              </View>
            </LinearGradient>

            {/* Quick Metrics Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>This Month</Text>
                <Text style={styles.metricValue}>
                  {dashboard!.summary.monthlySaved.toLocaleString('en-US')} TL
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>AI Smart Routing</Text>
                <Text style={[styles.metricValue, { color: '#7DFFA2' }]}>
                  {dashboard!.summary.aiSmartRoutingGain.toLocaleString('en-US')} TL
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Cashback</Text>
                <Text style={styles.metricValue}>
                  {dashboard!.summary.cashbackEarned.toLocaleString('en-US')} TL
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Earned Points</Text>
                <Text style={styles.metricValue}>
                  {dashboard!.summary.totalRewardsValue.toLocaleString('en-US')} TL
                </Text>
              </View>
            </View>

            {/* Best Performing Highlights */}
            <View style={styles.highlightsContainer}>
              <View style={styles.highlightCard}>
                <View style={styles.highlightHeader}>
                  <Ionicons name="card" size={18} color="#BBC3FF" />
                  <Text style={styles.highlightTitle}>Best Performing Card</Text>
                </View>
                <Text style={styles.highlightValue}>{dashboard!.summary.bestPerformingCard}</Text>
              </View>

              <View style={styles.highlightCard}>
                <View style={styles.highlightHeader}>
                  <Ionicons name="ribbon" size={18} color="#7DFFA2" />
                  <Text style={styles.highlightTitle}>Most Profitable Campaign</Text>
                </View>
                <Text style={styles.highlightValue} numberOfLines={1}>
                  {dashboard!.summary.mostProfitableCampaign}
                </Text>
              </View>
            </View>

            {/* Trend Graph (Vertical Bar Chart) */}
            <View style={styles.chartSection}>
              <Text style={styles.sectionTitle}>Son 7 Günlük Trend</Text>
              <Text style={styles.sectionSubtitle}>AI kararlarından günlük elde edilen tasarruflar</Text>

              <View style={styles.barChartContainer}>
                {dashboard!.trends.map((point, index) => {
                  const maxAmount = Math.max(...dashboard!.trends.map((t) => t.amount), 1);
                  const barHeight = Math.max(8, (point.amount / maxAmount) * 110);
                  const isPeak = point.amount === maxAmount && point.amount > 0;

                  return (
                    <View key={index} style={styles.chartBarWrapper}>
                      <View style={styles.barBackground}>
                        <LinearGradient
                          colors={isPeak ? ['#7DFFA2', '#3D5AFE'] : ['#BBC3FF', 'rgba(187, 195, 255, 0.4)']}
                          style={[styles.barFill, { height: barHeight }]}
                        />
                      </View>
                      <Text style={styles.barAmountText} numberOfLines={1}>
                        {point.amount > 0 ? `${point.amount.toFixed(0)}₺` : '-'}
                      </Text>
                      <Text style={styles.barLabel}>{point.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Recent History List */}
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Son Tasarruflar</Text>
              {dashboard!.history.map((tx) => (
                <View key={tx.id} style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <View style={styles.categoryIconCircle}>
                      <MaterialIcons
                        name={CATEGORY_ICON[tx.merchantCategory] ?? 'shopping-bag'}
                        size={20}
                        color="#BBC3FF"
                      />
                    </View>
                    <View>
                      <Text style={styles.merchantName}>{tx.merchantName}</Text>
                      <Text style={styles.cardInfo}>
                        {tx.recommendedBank} • {CATEGORY_LABEL[tx.merchantCategory] ?? 'Diğer'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.savedAmountText}>
                      +{tx.totalSavedAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </Text>
                    <Text style={styles.txDate}>
                      {new Date(tx.date).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Clear/Reset button for developers */}
            <TouchableOpacity style={styles.resetButton} onPress={handleSeedMock} disabled={isSeeding}>
              <Text style={styles.resetButtonText}>Demo Verilerini Yenile</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1315',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#9AA0B4',
    marginTop: 12,
    fontSize: 14,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#9AA0B4',
    fontSize: 13,
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1d2022',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  emptyContainer: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  emptyCard: {
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(187, 195, 255, 0.15)',
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDescription: {
    color: '#9AA0B4',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  seedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7DFFA2',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  seedButtonText: {
    color: '#0F1315',
    fontWeight: '700',
    fontSize: 15,
  },
  mainSavingsCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginTop: 10,
    elevation: 8,
    shadowColor: '#3D5AFE',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
  },
  savingsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savingsCardLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  savingsCardAmount: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '800',
    marginTop: 12,
    letterSpacing: -1,
  },
  annualProjectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(125, 255, 162, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 20,
  },
  projectionText: {
    color: '#7DFFA2',
    fontSize: 12,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  metricItem: {
    width: (width - 52) / 2,
    backgroundColor: '#1d2022',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  metricLabel: {
    color: '#9AA0B4',
    fontSize: 12,
    fontWeight: '500',
  },
  metricValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  highlightsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 12,
    gap: 12,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: '#1d2022',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  highlightTitle: {
    color: '#9AA0B4',
    fontSize: 11,
    fontWeight: '600',
  },
  highlightValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  chartSection: {
    backgroundColor: '#1d2022',
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#777',
    fontSize: 12,
    marginTop: 4,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  chartBarWrapper: {
    alignItems: 'center',
    width: (width - 90) / 7,
  },
  barBackground: {
    height: 110,
    width: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barAmountText: {
    color: '#9AA0B4',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 6,
    height: 12,
  },
  barLabel: {
    color: '#777',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  historySection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1d2022',
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(187, 195, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  merchantName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  cardInfo: {
    color: '#777',
    fontSize: 12,
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  savedAmountText: {
    color: '#7DFFA2',
    fontSize: 16,
    fontWeight: '800',
  },
  txDate: {
    color: '#555',
    fontSize: 11,
    marginTop: 2,
  },
  resetButton: {
    marginHorizontal: 20,
    marginTop: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  resetButtonText: {
    color: '#777',
    fontWeight: '600',
    fontSize: 13,
  },
});
