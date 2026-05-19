import React, { useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';

import { CardActionsSheet } from '@/src/components';
import { ROUTES } from '@/src/constants';
import { useCards } from '@/src/hooks/useCards';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useAuth } from '@/src/hooks/useAuth';
import { formatCurrency, formatExpiry, formatFullPan, formatMaskedPan } from '@/src/utils/format';
import type { BackendTransaction, SavedCard } from '@/src/types';

type CopyField = 'pan' | 'holder' | 'expiry' | 'cvv';

const SMART_SPENDING_DAYS = 6;
const BAR_MAX_HEIGHT = 90;
const BAR_MIN_HEIGHT = 8;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** Pull the first percentage out of an AI-generated benefit string. */
function parseSavingsRate(benefit: string | undefined | null): number {
  if (!benefit) return 0;
  const match = benefit.match(/([0-9]+(?:\.[0-9]+)?)\s*%/);
  if (!match) return 0;
  const pct = Number(match[1]);
  return Number.isFinite(pct) ? pct / 100 : 0;
}

/** Build the Smart Spending summary (saved-this-week + last-6-day bars). */
function buildSmartSpending(transactions: BackendTransaction[]) {
  const now = Date.now();
  const weekStart = now - 7 * ONE_DAY_MS;

  const completed = transactions.filter((t) => t.status === 'COMPLETED');
  const recent = completed.filter((t) => new Date(t.createdAt).getTime() >= weekStart);

  const savedThisWeek = recent.reduce((sum, t) => {
    const rate = parseSavingsRate(t.recommendation?.estimatedBenefit);
    return sum + t.amount * rate;
  }, 0);

  // Daily spend buckets — index 0 = (DAYS-1) days ago, last index = today.
  const buckets = new Array<number>(SMART_SPENDING_DAYS).fill(0);
  for (const t of completed) {
    const ageDays = Math.floor((now - new Date(t.createdAt).getTime()) / ONE_DAY_MS);
    if (ageDays < 0 || ageDays >= SMART_SPENDING_DAYS) continue;
    buckets[SMART_SPENDING_DAYS - 1 - ageDays] += t.amount;
  }

  const peak = Math.max(...buckets);
  const bars = buckets.map((value) =>
    peak > 0
      ? Math.max(BAR_MIN_HEIGHT, (value / peak) * BAR_MAX_HEIGHT)
      : BAR_MIN_HEIGHT,
  );

  return {
    savedThisWeek,
    currency: recent[0]?.currency ?? completed[0]?.currency ?? 'TRY',
    bars,
  };
}

const CATEGORY_ICON: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  dining: 'restaurant',
  fuel: 'local-gas-station',
  travel: 'flight',
  grocery: 'shopping-cart',
  entertainment: 'movie',
};

/** Gradient pairs by card type for visual differentiation. */
const CARD_TYPE_GRADIENT: Record<string, readonly [string, string]> = {
  CREDIT: ['#1A1F71', '#3D5AFE'],
  DEBIT: ['#2E7D32', '#66BB6A'],
  PREPAID: ['#E65100', '#FF9800'],
};

const DEFAULT_GRADIENT: readonly [string, string] = ['#3D5AFE', '#05E777'];

/**
 * Personal-user "My Cards" dashboard.
 *
 * Renders the active card on top of the wallet plus recent activity. The
 * built-in bottom-nav row from the original mock has been removed because
 * the (personal) tab navigator now owns navigation chrome.
 */
export default function MyCardsScreen() {
  const router = useRouter();
  const { cards, virtualCard, remove, update } = useCards();
  const { transactions } = useTransactions();
  const { signOut } = useAuth();

  const [activeCardId, setActiveCardId] = React.useState<string | null>(null);
  const [actionCardId, setActionCardId] = React.useState<string | null>(null);
  const [copiedField, setCopiedField] = React.useState<CopyField | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeCard: SavedCard | undefined = cards.find((c) => c.id === activeCardId) ?? cards[0];
  const actionCard = cards.find((c) => c.id === actionCardId) ?? null;

  const smartSpending = useMemo(() => buildSmartSpending(transactions), [transactions]);

  const handleCopy = async (field: CopyField, value: string | undefined | null) => {
    if (!value) return;
    await Clipboard.setStringAsync(value);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    setCopiedField(field);
    copyTimer.current = setTimeout(() => setCopiedField(null), 1500);
  };

  const handleRename = async (id: string, nickname: string) => {
    await update(id, { cardAlias: nickname });
  };

  const handleDelete = async (id: string) => {
    if (id === activeCardId) setActiveCardId(null);
    await remove(id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>SmartPay AI</Text>
            <Text style={styles.subtitle}>Virtual Card Dashboard</Text>
          </View>

          <TouchableOpacity style={styles.iconButton} onPress={signOut}>
            <Ionicons name="log-out-outline" size={22} color="#BBC3FF" />
          </TouchableOpacity>
        </View>

        {/* VIRTUAL CARD — auto-provisioned demo card the user pays with */}
        <LinearGradient
          colors={['#3D5AFE', '#05E777']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardTop}>
            <MaterialCommunityIcons
              name="contactless-payment"
              size={34}
              color="#fff"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleCopy('pan', virtualCard?.cardNumber)}
            disabled={!virtualCard}
          >
            <Text style={styles.cardNumber}>
              {virtualCard
                ? formatFullPan(virtualCard.cardNumber)
                : formatMaskedPan('0000')}
            </Text>
            <Text style={styles.copyHint}>
              {copiedField === 'pan' ? '✓ Copied' : 'Tap to copy'}
            </Text>
          </TouchableOpacity>

          <View style={styles.cardBottom}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleCopy('holder', virtualCard?.cardHolder)}
              disabled={!virtualCard}
            >
              <Text style={styles.smallText}>
                {copiedField === 'holder' ? '✓ Copied' : 'Cardholder'}
              </Text>
              <Text style={styles.cardInfo}>{virtualCard?.cardHolder ?? '—'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                handleCopy(
                  'expiry',
                  virtualCard
                    ? formatExpiry(virtualCard.expiryMonth, virtualCard.expiryYear)
                    : undefined,
                )
              }
              disabled={!virtualCard}
            >
              <Text style={styles.smallText}>
                {copiedField === 'expiry' ? '✓ Copied' : 'Expires'}
              </Text>
              <Text style={styles.cardInfo}>
                {virtualCard
                  ? formatExpiry(virtualCard.expiryMonth, virtualCard.expiryYear)
                  : '—'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleCopy('cvv', virtualCard?.cvv)}
              disabled={!virtualCard}
            >
              <Text style={styles.smallText}>
                {copiedField === 'cvv' ? '✓ Copied' : 'CVV'}
              </Text>
              <Text style={styles.cardInfo}>{virtualCard?.cvv ?? '—'}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* MY CARDS */}
        <View style={styles.myCardsSection}>
          <View style={styles.myCardsHeader}>
            <Text style={styles.sectionTitle}>My Cards</Text>
            <Text style={styles.myCardsCount}>
              {cards.length} {cards.length === 1 ? 'card' : 'cards'}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.myCardsList}
          >
            {cards.map((card) => (
              <MiniCard
                key={card.id}
                card={card}
                active={card.id === activeCard?.id}
                onPress={() => setActiveCardId(card.id)}
                onLongPress={() => setActionCardId(card.id)}
              />
            ))}

            <TouchableOpacity
              style={styles.addCardTile}
              activeOpacity={0.85}
              onPress={() => router.push(ROUTES.personal.addCard)}
            >
              <View style={styles.addCardIcon}>
                <Ionicons name="add" size={28} color="#BBC3FF" />
              </View>
              <Text style={styles.addCardLabel}>Add Card</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <View style={styles.aiCard}>
            <View style={styles.aiLeft}>
              <View style={styles.aiIcon}>
                <MaterialCommunityIcons
                  name="robot-outline"
                  size={22}
                  color="#7DFFA2"
                />
              </View>

              <View>
                <Text style={styles.actionLabel}>Optimization</Text>
                <Text style={styles.actionValue}>
                  Active & Routing
                </Text>
              </View>
            </View>

            <View style={styles.greenDot} />
          </View>

          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => router.push(ROUTES.personal.addCard)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#BBC3FF" />
            <Text style={styles.scanText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* SMART SPENDING */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Smart Spending</Text>
          </View>

          <Text style={styles.description}>
            SmartPay has maximized rewards across your wallets this week.
          </Text>

          <View style={styles.savedContainer}>
            <Text style={styles.savedAmount}>
              +{formatCurrency(smartSpending.savedThisWeek, smartSpending.currency)}
            </Text>
            <Text style={styles.savedText}>Saved</Text>
          </View>

          {/* MINI CHART */}
          <View style={styles.chart}>
            {smartSpending.bars.map((h, i) => (
              <View
                key={i}
                style={[
                  styles.bar,
                  {
                    height: h,
                    opacity: i === smartSpending.bars.length - 1 ? 1 : 0.5,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* TRANSACTIONS */}
        <View style={styles.sectionCard}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionTitle}>Recent Activity</Text>

            <TouchableOpacity onPress={() => router.push(ROUTES.personal.transactions)}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {transactions.slice(0, 3).map((tx) => (
            <TouchableOpacity
              key={tx.id}
              style={styles.transactionItem}
              activeOpacity={0.7}
              onPress={() => router.push(ROUTES.personal.transactionDetail(tx.id))}
            >
              <View style={styles.transactionLeft}>
                <View style={styles.transactionIcon}>
                  <MaterialIcons
                    name={CATEGORY_ICON[tx.recommendation?.merchantCategory ?? ''] ?? 'shopping-bag'}
                    size={24}
                    color="#fff"
                  />
                </View>

                <View>
                  <Text style={styles.transactionName}>{tx.merchantName}</Text>
                  <Text style={styles.transactionSub}>
                    {tx.status} · {tx.recommendation?.recommendedBank ?? 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.transactionAmount}>
                  -{formatCurrency(tx.amount, tx.currency)}
                </Text>

                {tx.recommendation && (
                  <View style={styles.rewardBadge}>
                    <Text style={styles.rewardText}>{tx.recommendation.estimatedBenefit}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <CardActionsSheet
        card={actionCard}
        onClose={() => setActionCardId(null)}
        onEdit={(id) => router.push(ROUTES.personal.editCard(id))}
        onRename={handleRename}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  );
}

/** Compact card tile used inside the horizontal "My Cards" rail. */
function MiniCard({
  card,
  active,
  onPress,
  onLongPress,
}: {
  card: SavedCard;
  active: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const gradient = CARD_TYPE_GRADIENT[card.cardType] ?? DEFAULT_GRADIENT;
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.miniCard, active && styles.miniCardActive]}
      >
        <View style={styles.miniCardTop}>
          <Text style={styles.miniCardBank} numberOfLines={1}>
            {card.cardAlias ?? card.bankName ?? 'Card'}
          </Text>
          {active && (
            <View style={styles.miniActiveBadge}>
              <Ionicons name="checkmark" size={12} color="#0a0c0d" />
            </View>
          )}
        </View>

        <Text style={styles.miniCardLast4}>{card.first4} ••••</Text>

        <View style={styles.miniCardBottom}>
          <Text style={styles.miniCardLabel}>
            {card.cardType}
          </Text>
          <Text style={styles.miniCardNetwork}>
            {card.bankName}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101416',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  logo: {
    color: '#BBC3FF',
    fontSize: 28,
    fontWeight: '700',
  },

  subtitle: {
    color: '#aaa',
    marginTop: 4,
  },

  iconButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#1d2022',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    margin: 20,
    borderRadius: 24,
    padding: 24,
    height: 230,
    justifyContent: 'space-between',
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cardLabel: {
    color: '#ddd',
    fontSize: 12,
  },

  cardTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },

  cardNumber: {
    color: '#fff',
    fontSize: 28,
    letterSpacing: 4,
    fontWeight: '600',
  },

  copyHint: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 0.5,
  },

  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  smallText: {
    color: '#ddd',
    fontSize: 12,
  },

  cardInfo: {
    color: '#fff',
    marginTop: 4,
    fontWeight: '600',
  },

  myCardsSection: {
    paddingHorizontal: 20,
    marginTop: 4,
  },

  myCardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  myCardsCount: {
    color: '#9AA0B4',
    fontSize: 12,
    fontWeight: '600',
  },

  myCardsList: {
    paddingRight: 4,
    gap: 12,
  },

  miniCard: {
    width: 170,
    height: 110,
    borderRadius: 16,
    padding: 14,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  miniCardActive: {
    borderColor: '#7DFFA2',
    shadowColor: '#7DFFA2',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },

  miniCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  miniCardBank: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
  },

  miniActiveBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#7DFFA2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },

  miniCardLast4: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 1.5,
  },

  miniCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  miniCardLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '500',
  },

  miniCardNetwork: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  addCardTile: {
    width: 130,
    height: 110,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(187,195,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(187,195,255,0.06)',
  },

  addCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(187,195,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  addCardLabel: {
    color: '#BBC3FF',
    fontSize: 12,
    fontWeight: '600',
  },

  actions: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },

  aiCard: {
    flex: 1,
    backgroundColor: '#1d2022',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  aiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiIcon: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: '#163322',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  actionLabel: {
    color: '#999',
    fontSize: 12,
  },

  actionValue: {
    color: '#7DFFA2',
    fontWeight: '700',
    marginTop: 4,
  },

  greenDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7DFFA2',
  },

  scanButton: {
    width: 80,
    backgroundColor: '#1d2022',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scanText: {
    color: '#aaa',
    marginTop: 4,
    fontSize: 12,
  },

  sectionCard: {
    backgroundColor: '#1d2022',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },

  description: {
    color: '#aaa',
    marginTop: 20,
    lineHeight: 22,
  },

  savedContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 24,
  },

  savedAmount: {
    color: '#BBC3FF',
    fontSize: 40,
    fontWeight: '700',
  },

  savedText: {
    color: '#999',
    marginLeft: 8,
    marginBottom: 8,
  },

  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 24,
    height: 100,
    gap: 8,
  },

  bar: {
    flex: 1,
    backgroundColor: '#BBC3FF',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },

  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  transactionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  viewAll: {
    color: '#BBC3FF',
  },

  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  transactionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#272a2d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  transactionName: {
    color: '#fff',
    fontWeight: '600',
  },

  transactionSub: {
    color: '#777',
    marginTop: 4,
    fontSize: 12,
  },

  transactionAmount: {
    color: '#fff',
    fontWeight: '700',
  },

  rewardBadge: {
    backgroundColor: '#163322',
    marginTop: 6,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  rewardText: {
    color: '#7DFFA2',
    fontSize: 11,
    fontWeight: '600',
  },

  bottomNav: {
    height: 85,
    backgroundColor: '#0b0f11',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  navItem: {
    alignItems: 'center',
  },

  navText: {
    color: '#777',
    fontSize: 11,
    marginTop: 4,
  },

  activeNavText: {
    color: '#BBC3FF',
    fontSize: 11,
    marginTop: 4,
  },

  fab: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#3D5AFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
  },
});