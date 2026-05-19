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
import { useRouter } from 'expo-router';

import { ROUTES } from '@/src/constants';
import { cardsService } from '@/src/services/cards.service';
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
  pan: string;
  expiry: string;
  bankName: string;
  nickname: string;
}

const INITIAL: FormState = {
  holderName: '',
  pan: '',
  expiry: '',
  bankName: '',
  nickname: '',
};

/**
 * Manual card-entry form — the primary way for users to add cards.
 *
 * On submit, normalizes the input via `cardsService.fromManual`, persists
 * through the wallet store and navigates back to the My Cards tab.
 */
export default function ManualCardEntryScreen() {
  const router = useRouter();
  const addCard = useCardsStore((s) => s.add);

  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const errors = useMemo(() => validate(form), [form]);
  const hasErrors = Object.keys(errors).length > 0;

  const handleSubmit = async () => {
    setSubmitted(true);
    if (hasErrors || isSaving) return;

    const [mm, yy] = form.expiry.split('/');
    setIsSaving(true);
    try {
      const card = cardsService.fromManual({
        holderName: form.holderName,
        pan: form.pan,
        expiryMonth: Number(mm),
        expiryYear: Number(yy),
        bankName: form.bankName,
        nickname: form.nickname,
      });
      await addCard(card);
      router.replace(ROUTES.personal.cards);
    } finally {
      setIsSaving(false);
    }
  };

  const showError = (key: keyof FormState) => submitted && errors[key];

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

        <Text style={styles.headerTitle}>Add Card Manually</Text>

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
          <Text style={styles.description}>
            Enter the details printed on your card. We only store the last 4 digits
            of the card number.
          </Text>

          <Field
            label="Cardholder Name"
            value={form.holderName}
            onChangeText={(v) => set('holderName', v)}
            placeholder="ALEXANDER W."
            autoCapitalize="characters"
            error={showError('holderName') ? errors.holderName : undefined}
          />

          <Field
            label="Card Number"
            value={form.pan}
            onChangeText={(v) => set('pan', formatPan(v))}
            placeholder="1234 5678 9012 3456"
            keyboardType="number-pad"
            maxLength={23}
            error={showError('pan') ? errors.pan : undefined}
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
              {isSaving ? 'Saving…' : 'Add Card'}
            </Text>
            <Icon name="arrow-forward" size={18} color="#fff" />
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

function formatPan(value: string): string {
  const digits = value.replace(/[^0-9]/g, '').slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/[^0-9]/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (!form.holderName.trim()) errors.holderName = 'Cardholder name is required';

  const panDigits = form.pan.replace(/[^0-9]/g, '');
  if (panDigits.length < 13 || panDigits.length > 19) {
    errors.pan = 'Enter a valid card number';
  }

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
  scroll: { paddingHorizontal: 24, paddingBottom: 24 },
  description: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
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
