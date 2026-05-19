import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';

import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ROUTES } from '@/src/constants';
import { useCardsStore } from '@/src/store/cards.store';

const COLORS = {
  background: '#101416',
  surface: 'rgba(39,42,45,0.55)',
  surfaceBorder: 'rgba(255,255,255,0.08)',
  primary: '#2848EE',
  textPrimary: '#E0E3E6',
  textSecondary: '#C5C5D9',
  muted: '#8A8E99',
  danger: '#FF6B6B',
};

interface FormState {
  holderName: string;
  expiry: string;
  bankName: string;
  nickname: string;
}

/**
 * Edit card form — lets users update the editable fields of an existing card.
 *
 * Card number (last4) and network are not editable since only last4 is stored.
 * On submit, patches the card in the wallet store and navigates back.
 */
export default function EditCardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const card = useCardsStore((s) => s.cards.find((c) => c.id === id));
  const updateCard = useCardsStore((s) => s.update);

  const [form, setForm] = useState<FormState>(() => ({
    holderName: card?.holderName ?? '',
    expiry: card
      ? `${String(card.expiryMonth).padStart(2, '0')}/${String(card.expiryYear).padStart(2, '0')}`
      : '',
    bankName: card?.bankName ?? '',
    nickname: card?.nickname ?? '',
  }));
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const errors = useMemo(() => validate(form), [form]);
  const hasErrors = Object.keys(errors).length > 0;

  const handleSubmit = async () => {
    setSubmitted(true);
    if (hasErrors || isSaving || !card) return;

    const [mm, yy] = form.expiry.split('/');
    setIsSaving(true);
    try {
      await updateCard(card.id, {
        holderName: form.holderName.trim().toUpperCase(),
        expiryMonth: Number(mm),
        expiryYear: Number(yy),
        bankName: form.bankName.trim() || undefined,
        nickname: form.nickname.trim() || undefined,
      });
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  const showError = (key: keyof FormState) => submitted && errors[key];

  if (!card) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Icon name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Card</Text>
          <View style={{ width: 42 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Icon name="error-outline" size={48} color={COLORS.muted} />
          <Text style={{ color: COLORS.textSecondary, marginTop: 16, textAlign: 'center' }}>
            Card not found. It may have been removed.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Icon name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Card</Text>

        <View style={{ width: 42 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Non-editable card identity badge */}
          <View style={styles.cardBadge}>
            <View style={styles.cardBadgeIcon}>
              <Icon name="credit-card" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardBadgeTitle}>
                •••• {card.last4}
              </Text>
              <Text style={styles.cardBadgeSub}>
                {card.network.charAt(0).toUpperCase() + card.network.slice(1)} · Card number cannot be changed
              </Text>
            </View>
          </View>

          <Field
            label="Cardholder Name"
            value={form.holderName}
            onChangeText={(v) => set('holderName', v)}
            placeholder="ALEXANDER W."
            autoCapitalize="characters"
            error={showError('holderName') ? errors.holderName : undefined}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field
                label="Expiry (MM/YY)"
                value={form.expiry}
                onChangeText={(v) => set('expiry', formatExpiry(v))}
                placeholder="11/29"
                keyboardType="number-pad"
                maxLength={5}
                error={showError('expiry') ? errors.expiry : undefined}
              />
            </View>

            <View style={{ width: 14 }} />

            <View style={{ flex: 1 }}>
              <Field
                label="Bank (optional)"
                value={form.bankName}
                onChangeText={(v) => set('bankName', v)}
                placeholder="Chase"
              />
            </View>
          </View>

          <Field
            label="Nickname (optional)"
            value={form.nickname}
            onChangeText={(v) => set('nickname', v)}
            placeholder="Travel Card"
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, (hasErrors && submitted) || isSaving ? { opacity: 0.6 } : null]}
            onPress={handleSubmit}
            disabled={isSaving}
            activeOpacity={0.9}
          >
            <Text style={styles.submitText}>
              {isSaving ? 'Saving…' : 'Save Changes'}
            </Text>
            <Icon name="check" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad';
  autoCapitalize?: 'none' | 'characters' | 'sentences';
  maxLength?: number;
  error?: string;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  maxLength,
  error,
}: FieldProps) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        maxLength={maxLength}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function formatExpiry(value: string): string {
  const digits = value.replace(/[^0-9]/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (!form.holderName.trim()) errors.holderName = 'Cardholder name is required';

  const [mm, yy] = form.expiry.split('/');
  const month = Number(mm);
  const year = Number(yy);
  if (!mm || !yy || isNaN(month) || isNaN(year) || month < 1 || month > 12 || yy.length !== 2) {
    errors.expiry = 'Use MM/YY format';
  }

  return errors;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    height: 70,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
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
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40,72,238,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(40,72,238,0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 14,
  },
  cardBadgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(40,72,238,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBadgeTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  cardBadgeSub: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  scroll: { paddingHorizontal: 24, paddingBottom: 24 },
  row: { flexDirection: 'row' },
  fieldWrapper: { marginBottom: 16 },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  inputError: { borderColor: COLORS.danger },
  errorText: { color: COLORS.danger, fontSize: 12, marginTop: 6 },
  footer: { paddingHorizontal: 24, paddingBottom: 30, paddingTop: 8 },
  submitButton: {
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
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  cancelText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 13,
  },
});
