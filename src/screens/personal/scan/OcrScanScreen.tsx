import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';

import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ROUTES } from '@/src/constants';
import { ocrService } from '@/src/services/ocr.service';
import { useCardsStore } from '@/src/store/cards.store';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#101416',
  surface: '#272A2D',
  primary: '#2848EE',
  secondary: '#05E777',
  textPrimary: '#E0E3E6',
  textSecondary: '#C5C5D9',
};

const CARD_WIDTH = width - 48;
const CARD_HEIGHT = CARD_WIDTH / 1.58;

/**
 * OCR scan flow.
 *
 * On confirm, runs the OCR pipeline, persists the recognized card to the
 * wallet store, and routes back to the My Cards tab where the new card
 * will appear at the top of the list.
 */
export default function OcrScanScreen() {
  const scanAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const addCard = useCardsStore((s) => s.add);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.timing(scanAnim, {
        toValue: CARD_HEIGHT,
        duration: 3000,
        useNativeDriver: true,
      }),
    ).start();
  }, [scanAnim]);

  const handleConfirm = async () => {
    if (isConfirming) return;
    setIsConfirming(true);
    try {
      const result = await ocrService.scan();
      await addCard(ocrService.toCard(result));
      router.replace(ROUTES.personal.cards);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Ambient Glow */}
      <View style={styles.glow} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Icon name="close" size={20} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Scan Card</Text>

        <TouchableOpacity style={styles.helpButton} hitSlop={8}>
          <Icon name="help-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Main */}
      <View style={styles.main}>
        <Text style={styles.description}>
          Position your card within the frame to scan details automatically.
        </Text>

        {/* Scanner */}
        <View style={styles.scannerWrapper}>
          {/* Corners */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {/* Scanner Area */}
          <View style={styles.scannerInner}>
            <Icon
              name="credit-card"
              size={70}
              color="rgba(255,255,255,0.08)"
            />

            {/* Scan Line */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{ translateY: scanAnim }],
                },
              ]}
            />
          </View>
        </View>

        {/* Glass Card */}
        <View style={styles.detectCard}>
          {/* Header */}
          <View style={styles.detectHeader}>
            <View style={styles.successIcon}>
              <Icon
                name="check-circle"
                size={18}
                color="#7DFFA2"
              />
            </View>

            <Text style={styles.detectTitle}>Card Detected</Text>
          </View>

          {/* Rows */}
          <InfoRow
            label="Bank"
            value="Chase"
            icon="account-balance"
          />

          <Divider />

          <InfoRow
            label="Type"
            value="Visa Infinite" icon={undefined}          />

          <Divider />

          <View style={styles.perkRow}>
            <View style={styles.perkLeft}>
              <Icon
                name="auto-awesome"
                size={16}
                color="#7DFFA2"
              />

              <Text style={styles.perkText}>
                AI Detected Perks
              </Text>
            </View>

            <View style={styles.cashbackBadge}>
              <Text style={styles.cashbackText}>
                3% Cashback
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, isConfirming && { opacity: 0.6 }]}
          onPress={handleConfirm}
          disabled={isConfirming}
        >
          <Text style={styles.confirmText}>
            {isConfirming ? 'Adding…' : 'Confirm & Add Card'}
          </Text>

          <Icon
            name="arrow-forward"
            size={18}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(ROUTES.personal.scanManual)}
          hitSlop={8}
          disabled={isConfirming}
        >
          <Text style={styles.manualText}>
            Enter details manually
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: keyof typeof Icon.glyphMap;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>

      <View style={styles.infoRight}>
        {icon && (
          <Icon
            name={icon}
            size={16}
            color="#C3C6D7"
            style={{ marginRight: 6 }}
          />
        )}

        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  glow: {
    position: 'absolute',
    width: 350,
    height: 350,
    backgroundColor: 'rgba(40,72,238,0.15)',
    borderRadius: 999,
    top: '20%',
    alignSelf: 'center',
  },

  header: {
    height: 70,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },

  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  helpButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },

  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  description: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 40,
    maxWidth: 320,
  },

  scannerWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginBottom: 40,
    position: 'relative',
  },

  scannerInner: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 10,
  },

  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: COLORS.primary,
    zIndex: 20,
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 16,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 16,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 16,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 16,
  },

  detectCard: {
    width: '100%',
    backgroundColor: 'rgba(39,42,45,0.5)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },

  detectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  successIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(5,231,119,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(5,231,119,0.3)',
    marginRight: 12,
  },

  detectTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },

  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoValue: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 14,
  },

  perkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  perkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  perkText: {
    marginLeft: 6,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },

  cashbackBadge: {
    backgroundColor: 'rgba(40,72,238,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(40,72,238,0.3)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  cashbackText: {
    color: '#DEE0FF',
    fontWeight: '600',
    fontSize: 13,
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },

  confirmButton: {
    height: 56,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },

  confirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },

  manualText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 13,
  },
});