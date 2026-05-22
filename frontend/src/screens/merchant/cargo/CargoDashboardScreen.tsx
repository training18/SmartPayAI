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
  info: '#90caf9',
};

export default function CargoDashboardScreen() {
  const router = useRouter();
  const { shipments, analytics, isLoading, loadHistory, loadAnalytics } = useCargoStore();

  useEffect(() => {
    loadHistory();
    loadAnalytics();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return COLORS.secondary;
      case 'SHIPPED':
        return COLORS.info;
      case 'PENDING':
      default:
        return COLORS.warning;
    }
  };

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
          <Text style={styles.headerTitle}>AI Cargo Hub</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={() => { loadHistory(); loadAnalytics(); }}>
            <Icon name="refresh" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* OVERALL SAVINGS CARD */}
        <LinearGradient
          colors={['rgba(61,90,254,0.18)', 'rgba(29,32,34,0.95)']}
          style={styles.heroCard}
        >
          <View style={styles.kpiHeader}>
            <View style={styles.kpiTitleWrap}>
              <View style={styles.iconContainer}>
                <Icon name="auto-awesome" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.heroLabel}>Total Logistics Savings</Text>
            </View>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsBadgeText}>AI Optimized</Text>
            </View>
          </View>

          <Text style={styles.heroAmount}>
            {analytics ? formatCurrency(analytics.totalSaved, 'TRY') : '0.00 ₺'}
          </Text>
          <Text style={styles.heroSubtext}>
            Saved compared to default/worst-rate cargo options
          </Text>
        </LinearGradient>

        {/* MINI STATS */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Shipments</Text>
            <Text style={styles.statValue}>
              {analytics ? analytics.totalShipments : 0}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg Cost</Text>
            <Text style={styles.statValue}>
              {analytics && analytics.totalShipments > 0
                ? formatCurrency(analytics.totalSpent / analytics.totalShipments, 'TRY')
                : '0 ₺'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg Speed</Text>
            <Text style={styles.statValue}>
              {analytics ? `${analytics.avgDeliveryTime}d` : '0d'}
            </Text>
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={() => router.push('/(merchant)/create-shipment' as any)}
          >
            <LinearGradient
              colors={['#536dfe', '#3d5afe']}
              style={styles.gradientButton}
            >
              <Icon name="local-shipping" size={22} color="#fff" />
              <Text style={styles.primaryButtonText}>Optimize & Ship Package</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(merchant)/history' as any)}
            >
              <Icon name="history" size={20} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.secondaryButtonText}>Shipment History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(merchant)/analytics' as any)}
            >
              <Icon name="insert-chart" size={20} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.secondaryButtonText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RECENT SHIPMENTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Shipments</Text>
          <TouchableOpacity onPress={() => router.push('/(merchant)/history' as any)}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {isLoading && shipments.length === 0 ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : shipments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={48} color={COLORS.outline} />
            <Text style={styles.emptyText}>No shipments created yet</Text>
            <Text style={styles.emptySubtext}>Use the optimizer above to route your first order.</Text>
          </View>
        ) : (
          shipments.slice(0, 5).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.shipmentCard}
              onPress={() => router.push({ pathname: '/(merchant)/history' as any, params: { activeShipmentId: item.id } })}
            >
              <View style={styles.shipmentHeader}>
                <Text style={styles.shipmentId} numberOfLines={1}>#{item.id.slice(0, 8)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.shipmentDetails}>
                <View style={styles.locationRow}>
                  <Text style={styles.locationCity}>{item.senderCity}</Text>
                  <Icon name="arrow-forward" size={14} color={COLORS.textSecondary} style={{ marginHorizontal: 8 }} />
                  <Text style={styles.locationCity}>{item.receiverCity}</Text>
                </View>
                <Text style={styles.customerName}>Recipient: {item.receiverName}</Text>
              </View>

              <View style={styles.shipmentFooter}>
                <Text style={styles.providerName}>{item.selectedProvider?.name || 'Unassigned'}</Text>
                <Text style={styles.shipmentPrice}>
                  {item.finalPrice ? formatCurrency(item.finalPrice, 'TRY') : '—'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
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
    marginBottom: 10,
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
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  kpiTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(61,90,254,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  heroLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  savingsBadge: {
    backgroundColor: 'rgba(125,255,162,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  savingsBadgeText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  heroAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  heroSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  actionsContainer: {
    marginBottom: 28,
  },
  primaryActionButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outline + '40',
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  shipmentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  shipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shipmentId: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  shipmentDetails: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationCity: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  customerName: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  shipmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    paddingTop: 12,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  shipmentPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
});
