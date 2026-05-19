import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

import { useAuth } from '@/src/hooks/useAuth';
import type { UserRole } from '@/src/types';

const COLORS = {
  background: '#0A0E1A',
  primary: '#3D5AFE',
  secondary: '#05E777',
  textPrimary: '#E0E3E6',
  textSecondary: '#C5C5D9',
  glass: 'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.1)',
};

type AccountType = UserRole | null;

/**
 * Auth role-picker screen.
 *
 * On confirm, signs the user into the active session with the selected role.
 * The root `_layout.tsx` listens to the auth store and swaps the protected
 * group from `(auth)` to either `(personal)` or `(merchant)` automatically.
 */
export default function UserTypeLoginScreen() {
  const [selected, setSelected] = useState<AccountType>(null);
  const { signIn, isSubmitting } = useAuth();

  const handleContinue = async () => {
    if (!selected) return;
    try {
      await signIn({ email: `${selected}@smartpay.ai`, role: selected });
    } catch {
      // surfaced via auth store `error`; intentionally swallowed here
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Ambient Glow */}
      <View style={styles.glowPrimary} />
      <View style={styles.glowSecondary} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <MaterialIcons
              name="bolt"
              size={30}
              color={COLORS.primary}
            />

            <Text style={styles.logoText}>
              SmartPay AI
            </Text>
          </View>

          <Text style={styles.title}>
            Choose Your{' '}
            <Text style={styles.gradientText}>
              Intelligence
            </Text>
          </Text>

          <Text style={styles.subtitle}>
            Select the account type that best fits your
            financial ecosystem. Our predictive AI adapts
            to optimize your capital flow instantly.
          </Text>
        </View>

        {/* Cards */}
        <View style={styles.cardsWrapper}>
          <AccountCard
            title="Personal Account"
            description="Optimize everyday spending with AI-driven cashback routing, predictive budget analysis, and automated savings triggers."
            icon="person"
            accent={COLORS.primary}
            selected={selected === 'personal'}
            onPress={() => setSelected('personal')}
            footer="Free Forever"
            features={[
              'Predictive Cashback Routing',
              'Automated Micro-investing',
              'Virtual AI Assistant',
            ]}
          />

          <AccountCard
            title="Merchant Account"
            description="Scale your business with dynamic fee routing, instant settlements, and predictive liquidity insights."
            icon="storefront"
            accent={COLORS.secondary}
            selected={selected === 'merchant'}
            onPress={() => setSelected('merchant')}
            footer="Starting at 0.5% + \$0.10"
            features={[
              'Dynamic Commission Routing',
              'Predictive Liquidity Models',
              'API & Webhook Access',
            ]}
          />
        </View>

        {/* Footer */}
        <View
          style={[
            styles.footer,
            !selected && styles.footerDisabled,
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleContinue}
            style={[
              styles.continueButton,
              (!selected || isSubmitting) && { opacity: 0.5 },
            ]}
            disabled={!selected || isSubmitting}
          >
            <Text style={styles.continueText}>
              {isSubmitting ? 'Signing in…' : 'Continue to Setup'}
            </Text>

            <MaterialIcons
              name="arrow-forward"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>

          <Text style={styles.loginText}>
            Already have an account?
            <Text style={styles.loginLink}>
              {' '}
              Log in
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type AccountCardProps = {
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  accent: string;
  features: string[];
  footer: string;
  selected: boolean;
  onPress: () => void;
};

function AccountCard({
  title,
  description,
  icon,
  accent,
  features,
  footer,
  selected,
  onPress,
}: AccountCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[
        styles.card,
        selected && {
          borderColor: accent,
          backgroundColor: 'rgba(61,90,254,0.10)',
        },
      ]}
    >
      {/* Icon */}
      <View style={styles.iconWrapper}>
        <MaterialIcons
          name={icon}
          size={32}
          color={accent}
        />
      </View>

      {/* Title */}
      <Text style={styles.cardTitle}>
        {title}
      </Text>

      {/* Desc */}
      <Text style={styles.cardDescription}>
        {description}
      </Text>

      {/* Features */}
      <View style={styles.featureList}>
        {features.map((feature) => (
          <View
            key={feature}
            style={styles.featureRow}
          >
            <MaterialIcons
              name="check-circle"
              size={20}
              color={COLORS.secondary}
            />

            <Text style={styles.featureText}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text
          style={[
            styles.footerLabel,
            { color: accent },
          ]}
        >
          {footer}
        </Text>

        <View
          style={[
            styles.selectionCircle,
            selected && {
              backgroundColor: accent,
              borderColor: accent,
            },
          ]}
        >
          <MaterialIcons
            name="check"
            size={14}
            color={selected ? '#fff' : 'transparent'}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },

  glowPrimary: {
    position: 'absolute',
    width: 350,
    height: 350,
    backgroundColor: 'rgba(61,90,254,0.15)',
    borderRadius: 999,
    top: 80,
    left: -80,
  },

  glowSecondary: {
    position: 'absolute',
    width: 300,
    height: 300,
    backgroundColor: 'rgba(5,231,119,0.08)',
    borderRadius: 999,
    bottom: 80,
    right: -80,
  },

  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  logoText: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontWeight: '700',
    marginLeft: 8,
  },

  title: {
    color: COLORS.textPrimary,
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },

  gradientText: {
    color: '#BBC3FF',
  },

  subtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 28,
    maxWidth: 500,
  },

  cardsWrapper: {
    gap: 20,
  },

  card: {
    backgroundColor: COLORS.glass,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },

  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },

  cardDescription: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 25,
    marginBottom: 24,
  },

  featureList: {
    gap: 14,
    marginBottom: 28,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  featureText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginLeft: 10,
  },

  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  footerLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  selectionCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#444656',
    justifyContent: 'center',
    alignItems: 'center',
  },

  footer: {
    marginTop: 40,
    alignItems: 'center',
  },

  footerDisabled: {
    opacity: 0.5,
  },

  continueButton: {
    width: '100%',
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },

  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },

  loginText: {
    marginTop: 24,
    color: COLORS.textSecondary,
    fontSize: 15,
  },

  loginLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});