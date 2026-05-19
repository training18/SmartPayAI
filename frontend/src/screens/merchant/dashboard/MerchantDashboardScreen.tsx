// MerchantDashboardScreen.tsx

import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { MaterialIcons as Icon } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useMerchant } from "@/src/hooks/useMerchant";
import { useAuth } from "@/src/hooks/useAuth";
import { formatCurrency, formatPercent } from "@/src/utils/format";

const COLORS = {
  background: "#101416",
  surface: "#1d2022",
  surfaceHigh: "#272a2d",
  primary: "#bbc3ff",
  primaryContainer: "#3d5afe",
  secondary: "#7dffa2",
  text: "#e0e3e6",
  textSecondary: "#c5c5d9",
  outline: "#444656",
};

/**
 * Merchant-side dashboard.
 *
 * Surfaces commission analytics and the live AI routing decisions made for
 * each payment — which provider was offered, what was picked, and how much
 * commission was saved versus the worst-case provider.
 */
export default function MerchantDashboardScreen() {
  const { payments, summary } = useMerchant();
  const { signOut } = useAuth();

  // Blended commission rate across all routed payments.
  const blendedRate = useMemo(() => {
    if (!summary || summary.totalVolume === 0) return 0;
    return summary.totalCommissionPaid / summary.totalVolume;
  }, [summary]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Icon name="person" size={20} color={COLORS.textSecondary} />
            </View>

            <Text style={styles.logo}>SmartPay AI</Text>
          </View>

          <TouchableOpacity style={styles.boltButton} onPress={signOut}>
            <Icon name="logout" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* PAGE TITLE */}
        <View style={styles.pageHeader}>
          <Text style={styles.title}>Commission Dashboard</Text>

          <Text style={styles.subtitle}>
            Real-time routing analytics and optimization metrics.
          </Text>
        </View>

        {/* KPI CARDS */}
        <View style={styles.kpiGrid}>
          {/* BIG CARD */}
          <LinearGradient
            colors={["rgba(61,90,254,0.15)", "rgba(29,32,34,0.95)"]}
            style={[styles.card, styles.largeCard]}
          >
            <View style={styles.kpiHeader}>
              <View style={styles.kpiTitleWrap}>
                <View style={styles.primaryIconBox}>
                  <Icon name="auto-awesome" size={18} color={COLORS.primary} />
                </View>

                <Text style={styles.kpiTitle}>
                  Monthly Savings via AI Routing
                </Text>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>+14.2%</Text>
              </View>
            </View>

            <Text style={styles.bigAmount}>
              {summary
                ? formatCurrency(summary.totalCommissionSaved, summary.currency)
                : '—'}
            </Text>

            <Text style={styles.cardSubtext}>
              {summary
                ? `Saved across ${summary.transactionCount.toLocaleString()} transactions`
                : 'Awaiting first transaction'}
            </Text>
          </LinearGradient>

          {/* SMALL CARD */}
          <View style={styles.card}>
            <View style={styles.kpiHeader}>
              <View style={styles.kpiTitleWrap}>
                <View style={styles.grayIconBox}>
                  <Icon name="percent" size={18} color={COLORS.textSecondary} />
                </View>

                <Text style={styles.kpiTitle}>Avg Commission Rate</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.bigAmount}>
                {formatPercent(blendedRate, 2)}
              </Text>
            </View>

            <Text style={styles.cardSubtext}>
              Blended rate across all providers
            </Text>
          </View>
        </View>

        {/* CHART CARD */}
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Provider Performance</Text>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: COLORS.primary }]}
                />
                <Text style={styles.legendText}>AI Optimized</Text>
              </View>

              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: COLORS.outline }]}
                />
                <Text style={styles.legendText}>Default</Text>
              </View>
            </View>
          </View>

          {/* FAKE CHART */}
          <View style={styles.chart}>
            <View style={styles.chartBars}>
              {[35, 45, 55, 60, 75, 85, 95].map((height, index) => (
                <View
                  key={index}
                  style={[
                    styles.chartBar,
                    {
                      height,
                      backgroundColor:
                        index > 3 ? COLORS.primary : COLORS.outline,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* ACTIVE ROUTING */}
        <View style={styles.card}>
          <View style={styles.routingHeader}>
            <View style={styles.row}>
              <View style={styles.liveDot} />
              <Text style={styles.sectionTitle}>Active Routing</Text>
            </View>

            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {payments.map((item) => {
            const chosen = item.candidates.find(
              (c) => c.providerId === item.routedProviderId,
            );
            const worst = item.candidates.reduce((a, b) =>
              a.commissionRate > b.commissionRate ? a : b,
            );
            return (
              <View key={item.id} style={styles.routingItem}>
                <View style={styles.routingTop}>
                  <Text style={styles.txId}>{item.id}</Text>
                  <Text style={styles.amount}>
                    {formatCurrency(item.amount, item.currency)}
                  </Text>
                </View>

                <View style={styles.routingBottom}>
                  <Text style={styles.oldProvider}>
                    {worst.providerName} ({formatPercent(worst.commissionRate)})
                  </Text>

                  <Icon
                    name="arrow-forward"
                    size={16}
                    color={COLORS.primary}
                  />

                  <View style={styles.providerBadge}>
                    <Text style={styles.providerBadgeText}>
                      {chosen?.providerName} (
                      {chosen ? formatPercent(chosen.commissionRate) : '—'})
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 72,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceHigh,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  logo: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: "700",
  },

  boltButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },

  pageHeader: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 24,
  },

  title: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: "700",
  },

  subtitle: {
    color: COLORS.textSecondary,
    marginTop: 8,
    fontSize: 15,
  },

  kpiGrid: {
    paddingHorizontal: 20,
    gap: 16,
  },

  card: {
    backgroundColor: "rgba(29,32,34,0.9)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  largeCard: {
    minHeight: 180,
  },

  kpiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  kpiTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  primaryIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(61,90,254,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  grayIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surfaceHigh,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  kpiTitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    flex: 1,
  },

  badge: {
    backgroundColor: "rgba(125,255,162,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  badgeText: {
    color: COLORS.secondary,
    fontWeight: "600",
    fontSize: 12,
  },

  bigAmount: {
    color: COLORS.text,
    fontSize: 38,
    fontWeight: "700",
  },

  cardSubtext: {
    color: COLORS.textSecondary,
    marginTop: 8,
    fontSize: 14,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  successText: {
    color: COLORS.secondary,
    fontWeight: "600",
  },

  chartHeader: {
    marginBottom: 24,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  legendRow: {
    flexDirection: "row",
    gap: 16,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  legendText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },

  chart: {
    height: 220,
    justifyContent: "flex-end",
  },

  chartBars: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 160,
  },

  chartBar: {
    width: 26,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  routingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
    marginRight: 8,
  },

  viewAll: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  routingItem: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },

  routingTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  txId: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  amount: {
    color: COLORS.text,
    fontWeight: "600",
  },

  routingBottom: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  oldProvider: {
    color: "#8e8fa2",
    textDecorationLine: "line-through",
    marginRight: 8,
    fontSize: 13,
  },

  providerBadge: {
    backgroundColor: "rgba(125,255,162,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginLeft: 8,
  },

  providerBadgeText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "600",
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(11,15,17,0.95)",
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

  navLabel: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
});