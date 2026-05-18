import React from 'react';
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
import { useRouter } from 'expo-router';

import { CardActionsSheet } from '@/src/components';
import { ROUTES } from '@/src/constants';
import { useCards } from '@/src/hooks/useCards';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useAuth } from '@/src/hooks/useAuth';
import { formatCurrency, formatExpiry, formatMaskedPan } from '@/src/utils/format';
import type { Card, CardNetwork } from '@/src/types';

const RECENT_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  dining: 'restaurant',
  fuel: 'local-gas-station',
  travel: 'flight',
};

const NETWORK_GRADIENT: Record<CardNetwork, readonly [string, string]> = {
  visa: ['#1A1F71', '#3D5AFE'],
  mastercard: ['#EB001B', '#F79E1B'],
  amex: ['#2E77BB', '#0F4C81'],
  discover: ['#F47216', '#FFB347'],
  unknown: ['#3D5AFE', '#05E777'],
};

const NETWORK_LABEL: Record<CardNetwork, string> = {
  visa: 'VISA',
  mastercard: 'Mastercard',
  amex: 'Amex',
  discover: 'Discover',
  unknown: 'Card',
};

/**
 * Personal-user "My Cards" dashboard.
 *
 * Renders the active card on top of the wallet plus recent activity. The
 * built-in bottom-nav row from the original mock has been removed because
 * the (personal) tab navigator now owns navigation chrome.
 */
export default function MyCardsScreen() {
  const router = useRouter();
  const { cards, remove, update } = useCards();
  const { transactions } = useTransactions();
  const { signOut } = useAuth();

  const [activeCardId, setActiveCardId] = React.useState<string | null>(null);
  const [actionCardId, setActionCardId] = React.useState<string | null>(null);
  const activeCard = cards.find((c) => c.id === activeCardId) ?? cards[0];
  const actionCard = cards.find((c) => c.id === actionCardId) ?? null;

  const handleRename = async (id: string, nickname: string) => {
    await update(id, { nickname });
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

        {/* CARD */}
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

            <View>
              <Text style={styles.cardLabel}>AI OPTIMIZER</Text>
              <Text style={styles.cardTitle}>{activeCard?.nickname ?? 'Your Card'}</Text>
            </View>
          </View>

          <View>
            <Text style={styles.cardNumber}>
              {formatMaskedPan(activeCard?.last4 ?? '0000')}
            </Text>
          </View>

          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.smallText}>Cardholder</Text>
              <Text style={styles.cardInfo}>{activeCard?.holderName ?? '—'}</Text>
            </View>

            <View>
              <Text style={styles.smallText}>Expires</Text>
              <Text style={styles.cardInfo}>
                {activeCard
                  ? formatExpiry(activeCard.expiryMonth, activeCard.expiryYear)
                  : '—'}
              </Text>
            </View>
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
              onPress={() => router.push(ROUTES.personal.scan)}
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
            onPress={() => router.push(ROUTES.personal.scan)}
          >
            <Ionicons name="scan" size={24} color="#BBC3FF" />
            <Text style={styles.scanText}>Scan</Text>
          </TouchableOpacity>
        </View>

        {/* SMART SPENDING */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Smart Spending</Text>

            <View style={styles.scoreBadge}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color="#BBC3FF"
              />
              <Text style={styles.scoreText}>Score: 98</Text>
            </View>
          </View>

          <Text style={styles.description}>
            SmartPay has maximized rewards across your wallets this week.
          </Text>

          <View style={styles.savedContainer}>
            <Text style={styles.savedAmount}>+$42.50</Text>
            <Text style={styles.savedText}>Saved</Text>
          </View>

          {/* MINI CHART */}
          <View style={styles.chart}>
            {[30, 50, 40, 70, 60, 90].map((h, i) => (
              <View
                key={i}
                style={[
                  styles.bar,
                  {
                    height: h,
                    opacity: i === 5 ? 1 : 0.5,
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
                    name={RECENT_ICONS[tx.category ?? ''] ?? 'shopping-bag'}
                    size={24}
                    color="#fff"
                  />
                </View>

                <View>
                  <Text style={styles.transactionName}>{tx.merchant}</Text>
                  <Text style={styles.transactionSub}>
                    Routed to •••• {cards.find((c) => c.id === tx.cardId)?.last4 ?? '----'}
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.transactionAmount}>
                  -{formatCurrency(tx.amount, tx.currency)}
                </Text>

                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardText}>{tx.reward.label}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <CardActionsSheet
        card={actionCard}
        onClose={() => setActionCardId(null)}
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
  card: Card;
  active: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
    >
      <LinearGradient
        colors={NETWORK_GRADIENT[card.network]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.miniCard, active && styles.miniCardActive]}
      >
        <View style={styles.miniCardTop}>
          <Text style={styles.miniCardBank} numberOfLines={1}>
            {card.nickname ?? card.bankName ?? 'Card'}
          </Text>
          {active && (
            <View style={styles.miniActiveBadge}>
              <Ionicons name="checkmark" size={12} color="#0a0c0d" />
            </View>
          )}
        </View>

        <Text style={styles.miniCardLast4}>•••• {card.last4}</Text>

        <View style={styles.miniCardBottom}>
          <Text style={styles.miniCardLabel}>
            {formatExpiry(card.expiryMonth, card.expiryYear)}
          </Text>
          <Text style={styles.miniCardNetwork}>
            {NETWORK_LABEL[card.network]}
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

  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#272a2d',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  scoreText: {
    color: '#aaa',
    marginLeft: 4,
    fontSize: 12,
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