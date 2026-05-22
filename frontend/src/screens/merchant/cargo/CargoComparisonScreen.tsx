import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';

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
  error: '#ff8a80',
};

export default function CargoComparisonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { activeOptimization, createShipment, isLoading } = useCargoStore();
  const [selectedCode, setSelectedCode] = useState<string>('');

  // Extract input details from search params
  const {
    senderName,
    senderAddress,
    senderCity,
    receiverName,
    receiverAddress,
    receiverCity,
    width,
    height,
    length,
    weight,
    merchantPreference,
  } = params;

  if (!activeOptimization) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>No optimization session found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Find recommended provider
  const recommended = activeOptimization.quotes.find((q) => q.isRecommended);

  // Set default selected code if not set
  if (!selectedCode && recommended) {
    setSelectedCode(recommended.providerCode);
  }

  const handleBookShipment = async () => {
    if (!selectedCode) {
      Alert.alert('No Selection', 'Please select a cargo provider before booking.');
      return;
    }

    try {
      const response = await createShipment({
        senderName: senderName as string,
        senderAddress: senderAddress as string,
        senderCity: senderCity as string,
        receiverName: receiverName as string,
        receiverAddress: receiverAddress as string,
        receiverCity: receiverCity as string,
        width: parseFloat(width as string),
        height: parseFloat(height as string),
        length: parseFloat(length as string),
        weight: parseFloat(weight as string),
        merchantPreference: merchantPreference as string,
        selectedProviderCode: selectedCode,
      });

      Alert.alert(
        'Shipment Confirmed',
        `Your package has been successfully booked with ${response.selectedProvider?.name}.\n\nTracking ID: #${response.id.slice(0, 8)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.dismissAll();
              router.push('/(merchant)');
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert('Booking Failed', e instanceof Error ? e.message : 'Could not create shipment. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comparison & AI Routing</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* PACKAGE QUICK SPECS */}
        <View style={styles.specsBanner}>
          <View style={styles.specItem}>
            <Icon name="straighten" size={16} color={COLORS.primary} />
            <Text style={styles.specText}>
              {width}×{height}×{length} cm
            </Text>
          </View>
          <View style={styles.specDivider} />
          <View style={styles.specItem}>
            <Icon name="fitness-center" size={16} color={COLORS.primary} />
            <Text style={styles.specText}>{weight} kg</Text>
          </View>
          <View style={styles.specDivider} />
          <View style={styles.specItem}>
            <Icon name="local-post-office" size={16} color={COLORS.primary} />
            <Text style={styles.specText}>{activeOptimization.desi} Desi</Text>
          </View>
        </View>

        {/* ROUTING INFO */}
        <View style={styles.routeHeader}>
          <Text style={styles.routeLabel}>Route</Text>
          <Text style={styles.routeText}>
            {senderCity} → {receiverCity}
          </Text>
        </View>

        {/* AI RECOMMENDATION CARD */}
        {recommended && (
          <LinearGradient
            colors={['rgba(125,255,162,0.08)', 'rgba(29,32,34,0.95)']}
            style={styles.recommendationCard}
          >
            <View style={styles.recHeader}>
              <View style={styles.badgeRow}>
                <View style={styles.recBadge}>
                  <Icon name="star" size={14} color="#101416" />
                  <Text style={styles.recBadgeText}>AI TOP PICK</Text>
                </View>
                {activeOptimization.estimatedSavings > 0 && (
                  <View style={styles.savingsTag}>
                    <Text style={styles.savingsTagText}>
                      Save {formatCurrency(activeOptimization.estimatedSavings, 'TRY')}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.recScore}>{recommended.aiScore} pts</Text>
            </View>

            <Text style={styles.recName}>{recommended.providerName}</Text>
            <Text style={styles.recExplanation}>{recommended.explanation}</Text>

            <View style={styles.recFeatures}>
              <View style={styles.recFeatureItem}>
                <Icon name="speed" size={16} color={COLORS.primary} />
                <Text style={styles.recFeatureText}>Est: {recommended.estimatedDeliveryDays} days</Text>
              </View>
              <View style={styles.recFeatureItem}>
                <Icon name="security" size={16} color={COLORS.primary} />
                <Text style={styles.recFeatureText}>Best value selection</Text>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* CARGO PROVIDERS COMPARISON LIST */}
        <Text style={styles.sectionTitle}>Available Quotes</Text>
        {activeOptimization.quotes.map((quote) => {
          const isSelected = selectedCode === quote.providerCode;

          return (
            <TouchableOpacity
              key={quote.providerCode}
              style={[
                styles.providerCard,
                !quote.isEligible && styles.providerCardIneligible,
                isSelected && styles.providerCardSelected,
              ]}
              onPress={() => quote.isEligible && setSelectedCode(quote.providerCode)}
              disabled={!quote.isEligible}
            >
              <View style={styles.cardHeader}>
                <View style={styles.providerInfo}>
                  <View
                    style={[
                      styles.circleBadge,
                      isSelected ? styles.circleBadgeActive : null,
                      !quote.isEligible ? styles.circleBadgeIneligible : null,
                    ]}
                  >
                    <Icon
                      name={quote.isEligible ? 'local-shipping' : 'block'}
                      size={18}
                      color={isSelected ? '#101416' : quote.isEligible ? COLORS.primary : COLORS.outline}
                    />
                  </View>
                  <View>
                    <Text style={styles.providerNameText}>{quote.providerName}</Text>
                    {quote.isRecommended && <Text style={styles.recommendedBadge}>AI Recommended</Text>}
                  </View>
                </View>

                {quote.isEligible ? (
                  <Text style={styles.aiScoreText}>{quote.aiScore} pts</Text>
                ) : (
                  <Text style={styles.ineligibleLabel}>Ineligible</Text>
                )}
              </View>

              {quote.isEligible ? (
                <View style={styles.cardBody}>
                  <View style={styles.metricRow}>
                    <View style={styles.metric}>
                      <Text style={styles.metricLabel}>Price</Text>
                      <Text style={styles.metricValue}>
                        {quote.price ? formatCurrency(quote.price, 'TRY') : '—'}
                      </Text>
                    </View>
                    <View style={styles.metric}>
                      <Text style={styles.metricLabel}>Delivery Speed</Text>
                      <Text style={styles.metricValue}>{quote.estimatedDeliveryDays} days</Text>
                    </View>
                    <View style={styles.metric}>
                      <Text style={styles.metricLabel}>AI Rank</Text>
                      <Text style={styles.metricValue}>#{quote.rank}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.ineligibleBody}>
                  <Text style={styles.ineligibleReasonText}>{quote.ineligibleReason}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* BOOK ACTION */}
        <TouchableOpacity
          style={[styles.bookButton, isLoading && styles.bookButtonDisabled]}
          onPress={handleBookShipment}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#101416" />
          ) : (
            <>
              <Text style={styles.bookButtonText}>Confirm & Book Selected Cargo</Text>
              <Icon name="check-circle" size={20} color="#101416" style={{ marginLeft: 6 }} />
            </>
          )}
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  specsBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    marginBottom: 16,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
  },
  specDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.outline + '40',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  routeLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  routeText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  recommendationCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(125,255,162,0.2)',
    marginBottom: 24,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  recBadgeText: {
    color: '#101416',
    fontWeight: '700',
    fontSize: 10,
  },
  savingsTag: {
    backgroundColor: 'rgba(125,255,162,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  savingsTagText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  recScore: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  recName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  recExplanation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  recFeatures: {
    flexDirection: 'row',
    gap: 16,
  },
  recFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recFeatureText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  providerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 12,
  },
  providerCardSelected: {
    borderColor: COLORS.primaryContainer,
  },
  providerCardIneligible: {
    opacity: 0.55,
    backgroundColor: '#16191b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circleBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBadgeActive: {
    backgroundColor: COLORS.primary,
  },
  circleBadgeIneligible: {
    backgroundColor: COLORS.background,
  },
  providerNameText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  recommendedBadge: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  aiScoreText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  ineligibleLabel: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
    paddingTop: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  ineligibleBody: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
    paddingTop: 10,
  },
  ineligibleReasonText: {
    color: COLORS.error,
    fontSize: 12,
    lineHeight: 16,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  bookButtonDisabled: {
    opacity: 0.5,
  },
  bookButtonText: {
    color: '#101416',
    fontSize: 16,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#101416',
    fontWeight: '600',
  },
});
