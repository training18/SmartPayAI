import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useCards } from '@/src/hooks/useCards';
import { useTransactions } from '@/src/hooks/useTransactions';
import { formatCurrency, formatDateTime } from '@/src/utils/format';
import type { BackendTransaction } from '@/src/types';

/**
 * Transaction detail / routing-flow screen.
 *
 * Reads the transaction id from `/transactions/[id]` and renders the AI's
 * card-selection decision, reward breakdown, and a "Smart Routing Flow"
 * visualization for that specific payment. Falls back to the latest
 * transaction if the id is missing or unresolved.
 */
export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { transactions } = useTransactions();
  const { cards: walletCards } = useCards();

  const transaction = useMemo(
    () => transactions.find((t) => t.id === id) ?? transactions[0],
    [transactions, id],
  );

  const [detailsOpen, setDetailsOpen] = useState(false);

  // Card list rendered in the "Smart Routing Flow" visualization.
  // Each card is decorated with either the winning subtitle (estimated benefit)
  // or — for losers — the AI-authored rejection reason from `rejectedCards`.
  const routingCards = useMemo(() => {
    const rec = transaction?.recommendation;
    const rejections = rec?.rejectedCards ?? [];
    return walletCards.map((c) => {
      const isWinner = rec?.recommendedCardId === c.id;
      const rejection = rejections.find((r) => r.cardId === c.id);
      return {
        id: c.id,
        name: `${c.cardAlias ?? c.bankName ?? 'Card'} • ${c.first4}`,
        active: isWinner,
        subtitle: isWinner
          ? rec?.estimatedBenefit
          : rejection?.reason,
      };
    });
  }, [walletCards, transaction]);

  const campaignMatches = transaction?.recommendation?.campaignMatches ?? [];
  const savings = transaction?.recommendation?.savingsBreakdown ?? null;

  const statusIcon = transaction?.status === 'COMPLETED' ? 'checkmark-circle' : 
                     transaction?.status === 'PENDING' ? 'time' :
                     transaction?.status === 'REJECTED' ? 'close-circle' : 'alert-circle';
  
  const statusColor = transaction?.status === 'COMPLETED' ? '#7DFFA2' :
                      transaction?.status === 'PENDING' ? '#FFB74D' :
                      '#FF6B6B';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={{ width: 40 }} />

          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color="#C5C5D9" />
          </TouchableOpacity>
        </View>

        {/* SUCCESS HERO */}
        <View style={styles.hero}>
          <View style={[styles.successGlow, { backgroundColor: statusColor }]} />

          <View style={styles.successCircle}>
            <Ionicons
              name={statusIcon as any}
              size={54}
              color={statusColor}
            />
          </View>

          <Text style={styles.amount}>
            {transaction
              ? formatCurrency(transaction.amount, transaction.currency)
              : '—'}
          </Text>

          <Text style={styles.paymentText}>
            {transaction ? `Paid at ${transaction.merchantName}` : 'No transactions yet'}
          </Text>

          {transaction && (
            <View style={[styles.statusBadge, { borderColor: statusColor }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {transaction.status}
              </Text>
            </View>
          )}
        </View>

        {/* AI RECOMMENDATION CARD */}
        {transaction?.recommendation && (
          <View style={styles.glassCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <MaterialIcons
                  name="auto-awesome"
                  size={22}
                  color="#BBC3FF"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>
                  AI recommends: {transaction.recommendation.recommendedBank}
                  {transaction.recommendation.recommendedNetwork
                    ? ` · ${transaction.recommendation.recommendedNetwork}`
                    : ''}
                </Text>

                <Text style={styles.cardSubtitle}>AI RECOMMENDATION</Text>
              </View>
            </View>

            <Text style={styles.reasonText}>
              {transaction.recommendation.reason}
            </Text>

            <View style={styles.statsRow}>
              <View>
                <View style={styles.statLabelRow}>
                  <Ionicons name="wallet" size={14} color="#999" />
                  <Text style={styles.statLabel}>BENEFIT</Text>
                </View>

                <Text style={styles.successValue}>
                  {savings
                    ? `${savings.value} ${savings.unit}`
                    : transaction.recommendation.estimatedBenefit}
                </Text>
                {savings?.installments ? (
                  <Text style={styles.routeCardSub}>
                    {savings.installments}x installment
                  </Text>
                ) : null}
              </View>

              <View>
                <View style={styles.statLabelRow}>
                  <Ionicons name="flash" size={14} color="#999" />
                  <Text style={styles.statLabel}>CONFIDENCE</Text>
                </View>

                <Text style={styles.primaryValue}>
                  {Math.round(transaction.recommendation.confidence * 100)}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* MATCHED CAMPAIGNS */}
        {campaignMatches.length > 0 && (
          <View style={styles.glassCard}>
            <View style={styles.routingHeader}>
              <Text style={styles.routingTitle}>Matched Campaigns</Text>
              <MaterialCommunityIcons name="tag-multiple" size={20} color="#aaa" />
            </View>
            {campaignMatches.map((m) => (
              <View key={m.campaignId} style={styles.campaignRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.campaignTitle} numberOfLines={1}>
                    {m.title}
                  </Text>
                  <Text style={styles.campaignMeta}>
                    {m.bankName} · {m.rewardRate}%
                  </Text>
                </View>
                <Text style={styles.campaignValue}>
                  +{m.rewardValue} {m.rewardUnit}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ROUTING FLOW */}
        {routingCards.length > 0 && (
          <View style={styles.glassCard}>
            <View style={styles.routingHeader}>
              <Text style={styles.routingTitle}>Smart Routing Flow</Text>

              <MaterialCommunityIcons
                name="source-branch"
                size={20}
                color="#aaa"
              />
            </View>

            <View style={styles.routingContainer}>
              {/* AI CORE */}
              <View style={styles.aiCore}>
                <View style={styles.aiCoreInner}>
                  <Ionicons name="sparkles" size={28} color="#BBC3FF" />
                </View>
              </View>

              {/* LINES */}
              <View style={styles.linesContainer}>
                {routingCards.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.line,
                      item.active && styles.activeLine,
                    ]}
                  />
                ))}
              </View>

              {/* CARD LIST */}
              <View style={styles.cardList}>
                {routingCards.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.routeCard,
                      item.active && styles.activeRouteCard,
                    ]}
                  >
                    <View
                      style={[
                        styles.routeCardIcon,
                        item.active && styles.activeRouteCardIcon,
                      ]}
                    >
                      <Ionicons
                        name="card"
                        size={18}
                        color={item.active ? '#7DFFA2' : '#aaa'}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.routeCardText,
                          item.active && styles.activeRouteCardText,
                        ]}
                      >
                        {item.name}
                      </Text>

                      {item.subtitle && (
                        <Text style={styles.routeCardSub}>
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* BUTTON */}
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={!transaction}
          onPress={() => setDetailsOpen(true)}
        >
          <LinearGradient
            colors={['#3D5AFE', '#5B74FF']}
            style={[styles.button, !transaction && { opacity: 0.4 }]}
          >
            <Text style={styles.buttonText}>View Transaction Details</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      <TransactionDetailsModal
        visible={detailsOpen && !!transaction}
        transaction={transaction}
        onClose={() => setDetailsOpen(false)}
      />
    </SafeAreaView>
  );
}

interface TransactionDetailsModalProps {
  visible: boolean;
  transaction?: BackendTransaction;
  onClose: () => void;
}

/**
 * Bottom-sheet style modal surfacing the full breakdown of a transaction.
 */
function TransactionDetailsModal({
  visible,
  transaction,
  onClose,
}: TransactionDetailsModalProps) {
  if (!transaction) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Transaction Details</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color="#C5C5D9" />
            </TouchableOpacity>
          </View>

          <DetailRow label="Reference" value={transaction.id.toUpperCase()} mono />
          <DetailRow label="Date" value={formatDateTime(transaction.createdAt)} />
          <DetailRow label="Merchant" value={transaction.merchantName} />
          <DetailRow label="Status" value={transaction.status} />
          {transaction.recommendation?.merchantCategory && (
            <DetailRow label="Category" value={transaction.recommendation.merchantCategory} />
          )}
          {transaction.recommendation?.recommendedBank && (
            <DetailRow label="Recommended Card" value={transaction.recommendation.recommendedBank} />
          )}
          <DetailRow
            label="Amount"
            value={formatCurrency(transaction.amount, transaction.currency)}
            strong
          />
          {transaction.recommendation?.estimatedBenefit && (
            <DetailRow
              label="Estimated Benefit"
              value={transaction.recommendation.estimatedBenefit}
            />
          )}

          {transaction.recommendation?.reason && (
            <View style={styles.reasonBox}>
              <MaterialIcons name="auto-awesome" size={16} color="#BBC3FF" />
              <Text style={styles.modalReasonText}>
                {transaction.recommendation.reason}
              </Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DetailRow({
  label,
  value,
  strong,
  mono,
}: {
  label: string;
  value: string;
  strong?: boolean;
  mono?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[
          styles.detailValue,
          strong && styles.detailValueStrong,
          mono && styles.detailValueMono,
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101416',
  },

  scroll: {
    padding: 24,
    paddingBottom: 50,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  hero: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },

  successGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 100,
    opacity: 0.12,
  },

  successCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(125,255,162,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(125,255,162,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  amount: {
    color: '#fff',
    fontSize: 52,
    fontWeight: '700',
    marginTop: 24,
  },

  paymentText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 8,
  },

  statusBadge: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },

  glassCard: {
    backgroundColor: 'rgba(29,32,34,0.7)',
    borderRadius: 28,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(187,195,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  cardTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  cardSubtitle: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 1,
  },

  reasonText: {
    color: '#BBC3FF',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 16,
    marginBottom: 4,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },

  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statLabel: {
    color: '#888',
    fontSize: 11,
    marginLeft: 5,
  },

  successValue: {
    color: '#7DFFA2',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 10,
  },

  primaryValue: {
    color: '#BBC3FF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 10,
  },

  routingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  routingTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  routingContainer: {
    flexDirection: 'row',
  },

  aiCore: {
    width: 70,
    alignItems: 'center',
    paddingTop: 80,
  },

  aiCoreInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1d2022',
    borderWidth: 1,
    borderColor: '#444656',
    justifyContent: 'center',
    alignItems: 'center',
  },

  linesContainer: {
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },

  line: {
    height: 2,
    backgroundColor: '#444656',
    marginVertical: 18,
    opacity: 0.3,
  },

  activeLine: {
    backgroundColor: '#7DFFA2',
    opacity: 1,
    shadowColor: '#7DFFA2',
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },

  cardList: {
    flex: 1,
  },

  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    opacity: 0.45,
  },

  activeRouteCard: {
    opacity: 1,
    backgroundColor: 'rgba(125,255,162,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(125,255,162,0.2)',
  },

  routeCardIcon: {
    width: 36,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#323538',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  activeRouteCardIcon: {
    backgroundColor: 'rgba(125,255,162,0.1)',
  },

  routeCardText: {
    color: '#aaa',
    fontSize: 13,
  },

  activeRouteCardText: {
    color: '#7DFFA2',
    fontWeight: '700',
  },

  routeCardSub: {
    color: '#7DFFA2',
    fontSize: 10,
    marginTop: 2,
  },

  campaignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },

  campaignTitle: {
    color: '#E0E3E6',
    fontSize: 13,
    fontWeight: '600',
  },

  campaignMeta: {
    color: '#9AA0B4',
    fontSize: 11,
    marginTop: 2,
  },

  campaignValue: {
    color: '#7DFFA2',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 12,
  },

  button: {
    height: 58,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },

  modalSheet: {
    backgroundColor: '#1A1D24',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  modalHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 16,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },

  detailLabel: {
    color: '#9AA0B4',
    fontSize: 13,
  },

  detailValue: {
    color: '#E0E3E6',
    fontSize: 14,
    maxWidth: '60%',
    textAlign: 'right',
  },

  detailValueStrong: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  detailValueMono: {
    fontFamily: 'Courier',
    letterSpacing: 0.5,
  },

  reasonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(187,195,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(187,195,255,0.18)',
  },

  modalReasonText: {
    flex: 1,
    color: '#BBC3FF',
    fontSize: 13,
    lineHeight: 18,
  },
});