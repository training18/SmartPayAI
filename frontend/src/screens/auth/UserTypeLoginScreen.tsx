import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
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
  inputBg: 'rgba(255,255,255,0.06)',
  inputBorder: 'rgba(255,255,255,0.12)',
  inputFocusBorder: 'rgba(61,90,254,0.5)',
  error: '#FF5252',
};

type AuthMode = 'login' | 'register';

/**
 * Auth screen — Login / Register.
 *
 * On successful auth, the root `_layout.tsx` listens to the auth store
 * and swaps the protected group from `(auth)` to either `(personal)` or
 * `(merchant)` automatically based on the user's role.
 */
export default function UserTypeLoginScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('personal');
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, isSubmitting, error } = useAuth();

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    // Clear form state on mode change but keep email
    setPassword('');
    setFullName('');
    setRole('personal');
  };

  const isFormValid =
    email.trim().length > 0 &&
    password.length >= 6 &&
    (mode === 'login' || fullName.trim().length > 0);

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;
    try {
      if (mode === 'register') {
        await register({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          role,
        });
      } else {
        await login({
          email: email.trim(),
          password,
        });
      }
    } catch {
      // Error is surfaced via auth store `error`
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Ambient Glow */}
      <View style={styles.glowPrimary} />
      <View style={styles.glowSecondary} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <MaterialIcons name="bolt" size={30} color={COLORS.primary} />
              <Text style={styles.logoText}>SmartPay AI</Text>
            </View>

            <Text style={styles.title}>
              {mode === 'login' ? 'Welcome ' : 'Create Your '}
              <Text style={styles.gradientText}>
                {mode === 'login' ? 'Back' : 'Account'}
              </Text>
            </Text>

            <Text style={styles.subtitle}>
              {mode === 'login'
                ? 'Sign in to access your AI-powered payment optimization engine.'
                : 'Join SmartPay AI and let our intelligence optimize every transaction.'}
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Account type (register only) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Type</Text>
                <View style={styles.roleRow}>
                  <RoleOption
                    icon="person"
                    label="Personal"
                    description="Pay with smart routing"
                    selected={role === 'personal'}
                    onPress={() => setRole('personal')}
                  />
                  <RoleOption
                    icon="storefront"
                    label="Merchant"
                    description="Accept optimized payments"
                    selected={role === 'merchant'}
                    onPress={() => setRole('merchant')}
                  />
                </View>
              </View>
            )}

            {/* Full Name (register only) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="person-outline"
                    size={20}
                    color={COLORS.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Alexander Williams"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                </View>
              </View>
            )}

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="mail-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@smartpay.ai"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="lock-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  textContentType={mode === 'register' ? 'newPassword' : 'password'}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {error && (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleSubmit}
              style={[
                styles.submitButton,
                (!isFormValid || isSubmitting) && { opacity: 0.5 },
              ]}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.submitText}>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <FeatureRow
              icon="security"
              text="Bank-grade encryption"
              accent={COLORS.primary}
            />
            <FeatureRow
              icon="auto-awesome"
              text="AI-powered card optimization"
              accent={COLORS.secondary}
            />
            <FeatureRow
              icon="speed"
              text="Real-time recommendations"
              accent={COLORS.primary}
            />
          </View>

          {/* Toggle */}
          <View style={styles.footer}>
            <Text style={styles.toggleText}>
              {mode === 'login'
                ? "Don't have an account?"
                : 'Already have an account?'}
              <Text style={styles.toggleLink} onPress={toggleMode}>
                {' '}
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FeatureRow({
  icon,
  text,
  accent,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  text: string;
  accent: string;
}) {
  return (
    <View style={styles.featureRow}>
      <View style={[styles.featureIconBg, { backgroundColor: `${accent}15` }]}>
        <MaterialIcons name={icon} size={18} color={accent} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

function RoleOption({
  icon,
  label,
  description,
  selected,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.roleOption, selected && styles.roleOptionSelected]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <MaterialIcons
        name={icon}
        size={22}
        color={selected ? COLORS.primary : COLORS.textSecondary}
      />
      <Text style={[styles.roleLabel, selected && styles.roleLabelSelected]}>
        {label}
      </Text>
      <Text style={styles.roleDescription}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardView: {
    flex: 1,
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
    marginBottom: 36,
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
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },

  gradientText: {
    color: '#BBC3FF',
  },

  subtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 25,
    maxWidth: 500,
  },

  // ── Form Card ────────────────────────────────────────────────────────────
  formCard: {
    backgroundColor: COLORS.glass,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },

  inputGroup: {
    marginBottom: 20,
  },

  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },

  roleOption: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
  },

  roleOptionSelected: {
    borderColor: COLORS.inputFocusBorder,
    backgroundColor: 'rgba(61,90,254,0.10)',
  },

  roleLabel: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },

  roleLabelSelected: {
    color: COLORS.primary,
  },

  roleDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    height: 52,
  },

  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,82,82,0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },

  submitButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
    marginTop: 4,
  },

  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },

  // ── Features ─────────────────────────────────────────────────────────────
  features: {
    marginTop: 32,
    gap: 14,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  featureIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  featureText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },

  // ── Footer ───────────────────────────────────────────────────────────────
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },

  toggleText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },

  toggleLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});