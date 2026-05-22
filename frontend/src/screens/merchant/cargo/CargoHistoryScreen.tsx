import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { useCargoStore } from '@/src/store/cargo.store';
import { formatCurrency } from '@/src/utils/format';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

const FILTERS = ['ALL', 'PENDING', 'SHIPPED', 'DELIVERED'];

export default function CargoHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { shipments, isLoading, loadHistory } = useCargoStore();

  const [filter, setFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  // Handle default expansion if activeShipmentId is passed from Dashboard
  useEffect(() => {
    if (params.activeShipmentId && typeof params.activeShipmentId === 'string') {
      setExpandedId(params.activeShipmentId);
    }
  }, [params.activeShipmentId]);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

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

  const filteredShipments = shipments.filter((s) => {
    if (filter === 'ALL') return true;
    return s.status.toUpperCase() === filter.toUpperCase();
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shipment History</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadHistory}>
          <Icon name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* FILTER TABS */}
      <View style={styles.filterContainer}>
        {FILTERS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filter === tab && styles.filterTabActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterTabText, filter === tab && styles.filterTabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && shipments.length === 0 ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : filteredShipments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="history" size={48} color={COLORS.outline} />
          <Text style={styles.emptyText}>No shipments found</Text>
          <Text style={styles.emptySubtext}>There are no shipments matching your filter criteria.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {filteredShipments.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <View key={item.id} style={[styles.historyCard, isExpanded && styles.historyCardExpanded]}>
                {/* CARD SUMMARY HEADER */}
                <TouchableOpacity
                  style={styles.cardSummary}
                  onPress={() => toggleExpand(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.summaryTop}>
                    <Text style={styles.shipmentId} numberOfLines={1}>#{item.id.slice(0, 8)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.summaryMiddle}>
                    <View style={styles.locationContainer}>
                      <Text style={styles.cityText}>{item.senderCity}</Text>
                      <Icon name="arrow-forward" size={14} color={COLORS.textSecondary} style={{ marginHorizontal: 6 }} />
                      <Text style={styles.cityText}>{item.receiverCity}</Text>
                    </View>
                    <Text style={styles.dateText}>
                      {new Date(item.createdAt).toLocaleDateString('tr-TR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  <View style={styles.summaryBottom}>
                    <Text style={styles.providerName}>{item.selectedProvider?.name || 'Carrier Unassigned'}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceText}>
                        {item.finalPrice ? formatCurrency(item.finalPrice, 'TRY') : '—'}
                      </Text>
                      <Icon name={isExpanded ? 'expand-less' : 'expand-more'} size={20} color={COLORS.textSecondary} />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* EXPANDED DETAILS */}
                {isExpanded && (
                  <View style={styles.expandedDetails}>
                    <View style={styles.detailDivider} />

                    {/* RECIPIENT SPECS */}
                    <Text style={styles.detailSectionTitle}>Shipment Specifications</Text>
                    <View style={styles.specGrid}>
                      <View style={styles.specBox}>
                        <Text style={styles.specLabel}>Recipient</Text>
                        <Text style={styles.specVal} numberOfLines={1}>{item.receiverName}</Text>
                      </View>
                      <View style={styles.specBox}>
                        <Text style={styles.specLabel}>Address</Text>
                        <Text style={styles.specVal} numberOfLines={1}>{item.receiverAddress}</Text>
                      </View>
                      <View style={styles.specBox}>
                        <Text style={styles.specLabel}>Dimensions</Text>
                        <Text style={styles.specVal}>
                          {item.width}×{item.height}×{item.length} cm ({item.desi} Desi)
                        </Text>
                      </View>
                      <View style={styles.specBox}>
                        <Text style={styles.specLabel}>Weight</Text>
                        <Text style={styles.specVal}>{item.weight} kg</Text>
                      </View>
                    </View>

                    {/* SIMULATED TRACKING LOGS TIMELINE */}
                    <Text style={styles.detailSectionTitle}>Delivery Timeline</Text>
                    <View style={styles.timelineContainer}>
                      {item.tracking && item.tracking.length > 0 ? (
                        item.tracking.map((track, tIndex) => (
                          <View key={track.id} style={styles.timelineRow}>
                            <View style={styles.timelineLeft}>
                              <View
                                style={[
                                  styles.timelineDot,
                                  tIndex === 0 ? styles.timelineDotActive : null,
                                ]}
                              />
                              {tIndex < item.tracking.length - 1 && (
                                <View style={styles.timelineLine} />
                              )}
                            </View>
                            <View style={styles.timelineRight}>
                              <View style={styles.timelineHeader}>
                                <Text style={[styles.timelineStatus, tIndex === 0 && styles.timelineStatusActive]}>
                                  {track.status}
                                </Text>
                                <Text style={styles.timelineTime}>
                                  {new Date(track.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                              </View>
                              <Text style={styles.timelineLocation}>{track.location}</Text>
                              <Text style={styles.timelineDesc}>{track.description}</Text>
                            </View>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noTrackingText}>No tracking updates available yet.</Text>
                      )}
                    </View>

                    {/* SAVED BREAKDOWN IF AVAILABLE */}
                    {item.quotes && item.quotes.length > 0 && (
                      <>
                        <Text style={styles.detailSectionTitle}>Optimized Rates</Text>
                        <View style={styles.quotesTable}>
                          {item.quotes.map((q) => (
                            <View key={q.provider.code} style={styles.quoteRow}>
                              <Text style={styles.quoteProviderName}>{q.provider.name}</Text>
                              <View style={styles.quoteStats}>
                                <Text style={styles.quoteScore}>{q.aiScore} pts</Text>
                                <Text style={styles.quotePrice}>
                                  {q.price > 0 ? formatCurrency(q.price, 'TRY') : 'Ineligible'}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outline + '20',
  },
  filterTabActive: {
    backgroundColor: 'rgba(61,90,254,0.15)',
    borderColor: COLORS.primaryContainer,
  },
  filterTabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
  },
  historyCardExpanded: {
    borderColor: COLORS.outline + '40',
  },
  cardSummary: {
    padding: 16,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  summaryMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  summaryBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerName: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 6,
  },
  expandedDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 14,
  },
  detailSectionTitle: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  specBox: {
    width: '48%',
    backgroundColor: COLORS.surfaceHigh,
    padding: 10,
    borderRadius: 8,
  },
  specLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  specVal: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  timelineContainer: {
    paddingLeft: 4,
    marginBottom: 18,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 50,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 12,
    width: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.outline,
    marginTop: 4,
  },
  timelineDotActive: {
    backgroundColor: COLORS.secondary,
    transform: [{ scale: 1.2 }],
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.outline + '40',
    marginVertical: 4,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 12,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  timelineStatus: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  timelineStatusActive: {
    color: COLORS.text,
  },
  timelineTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  timelineLocation: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  timelineDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  noTrackingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  quotesTable: {
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 10,
    padding: 10,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  quoteProviderName: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  quoteStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quoteScore: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  quotePrice: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    width: 80,
    textAlign: 'right',
  },
});
