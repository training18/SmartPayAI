import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ROUTES } from '@/src/constants';
import { useTransactions } from '@/src/hooks/useTransactions';
import { formatCurrency, formatDateTime } from '@/src/utils/format';
import type { BackendTransaction } from '@/src/types';

const CATEGORY_ICON: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  dining: 'restaurant',
  fuel: 'local-gas-station',
  travel: 'flight',
  grocery: 'shopping-cart',
  entertainment: 'movie',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#FFB74D',
  COMPLETED: '#7DFFA2',
  REJECTED: '#FF6B6B',
  APPROVED: '#7DFFA2',
  FAILED: '#FF6B6B',
};

/**
 * Transactions list — entry-point for the Activity tab and the destination
 * of the "View All" link on the wallet screen. Tapping a row navigates to
 * the per-transaction routing-flow detail.
 */
export default function TransactionsListScreen() {
  const router = useRouter();
  const { transactions, isLoading } = useTransactions();

  const totalSpent = useMemo(
    () => transactions.reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>
          {transactions.length} transactions ·{' '}
          {formatCurrency(totalSpent, transactions[0]?.currency ?? 'TRY')} spent
        </Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TransactionRow
            transaction={item}
            onPress={() => router.push(ROUTES.personal.transactionDetail(item.id))}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={32} color="#666" />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptyHint}>
                Make a payment and SmartPay will route it through the best card.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function TransactionRow({
  transaction,
  onPress,
}: {
  transaction: BackendTransaction;
  onPress: () => void;
}) {
  const icon = CATEGORY_ICON[transaction.recommendation?.merchantCategory ?? ''] ?? 'shopping-bag';
  const statusColor = STATUS_COLOR[transaction.status] ?? '#9AA0B4';

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.row}>
      <View style={styles.rowIcon}>
        <MaterialIcons name={icon} size={22} color="#BBC3FF" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.merchant} numberOfLines={1}>
          {transaction.merchantName}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {formatDateTime(transaction.createdAt)} ·{' '}
          <Text style={{ color: statusColor }}>{transaction.status}</Text>
        </Text>
      </View>

      <View style={styles.rowRight}>
        <Text style={styles.amount}>
          -{formatCurrency(transaction.amount, transaction.currency)}
        </Text>
        {transaction.recommendation && (
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>
              {transaction.recommendation.savingsBreakdown
                ? `+${transaction.recommendation.savingsBreakdown.value} ${transaction.recommendation.savingsBreakdown.unit}`
                : transaction.recommendation.estimatedBenefit}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101416' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
  title: { color: '#fff', fontSize: 26, fontWeight: '700' },
  subtitle: { color: '#9AA0B4', fontSize: 13, marginTop: 4 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  separator: { height: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(29,32,34,0.7)',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(187,195,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  merchant: { color: '#fff', fontSize: 15, fontWeight: '600' },
  meta: { color: '#9AA0B4', fontSize: 12, marginTop: 3 },
  rowRight: { alignItems: 'flex-end' },
  amount: { color: '#fff', fontSize: 15, fontWeight: '700' },
  rewardBadge: {
    marginTop: 4,
    backgroundColor: 'rgba(125,255,162,0.12)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rewardText: { color: '#7DFFA2', fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  emptyText: { color: '#C5C5D9', fontSize: 15, marginTop: 12, fontWeight: '600' },
  emptyHint: {
    color: '#777',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
});
