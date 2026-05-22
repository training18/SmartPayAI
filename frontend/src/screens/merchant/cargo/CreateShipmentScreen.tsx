import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useCargoStore } from '@/src/store/cargo.store';

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
  error: '#ff8a80',
};

const TURKISH_CITIES = ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Trabzon', 'Gaziantep'];

export default function CreateShipmentScreen() {
  const router = useRouter();
  const { fetchQuotes, isLoading } = useCargoStore();

  // Form states
  const [senderName, setSenderName] = useState('My Fintech Store');
  const [senderAddress, setSenderAddress] = useState('Nispetiye Cd. No:34, Beşiktaş');
  const [senderCity, setSenderCity] = useState('Istanbul');

  const [receiverName, setReceiverName] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [receiverCity, setReceiverCity] = useState('Ankara');

  const [width, setWidth] = useState('30');
  const [height, setHeight] = useState('20');
  const [length, setLength] = useState('40');
  const [weight, setWeight] = useState('2.5');

  const [merchantPreference, setMerchantPreference] = useState('');

  const handleCitySelect = (type: 'sender' | 'receiver', city: string) => {
    if (type === 'sender') setSenderCity(city);
    else setReceiverCity(city);
  };

  const handleOptimize = async () => {
    if (!senderName || !senderAddress || !receiverName || !receiverAddress) {
      Alert.alert('Missing Information', 'Please fill in all sender and recipient address fields.');
      return;
    }

    const w = parseFloat(width);
    const h = parseFloat(height);
    const l = parseFloat(length);
    const wt = parseFloat(weight);

    if (isNaN(w) || isNaN(h) || isNaN(l) || isNaN(wt) || w <= 0 || h <= 0 || l <= 0 || wt <= 0) {
      Alert.alert('Invalid Measurements', 'Please enter valid, positive numbers for dimensions and weight.');
      return;
    }

    try {
      await fetchQuotes({
        senderName,
        senderAddress,
        senderCity,
        receiverName,
        receiverAddress,
        receiverCity,
        width: w,
        height: h,
        length: l,
        weight: wt,
        merchantPreference,
      });

      // Pass input details to comparison page in params
      router.push({
        pathname: '/(merchant)/comparison' as any,
        params: {
          senderName,
          senderAddress,
          senderCity,
          receiverName,
          receiverAddress,
          receiverCity,
          width: width,
          height: height,
          length: length,
          weight: weight,
          merchantPreference,
        },
      });
    } catch (e) {
      Alert.alert('Optimization Error', e instanceof Error ? e.message : 'Could not optimize quotes. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Icon name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Shipment</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* SENDER BOX */}
          <Text style={styles.sectionLabel}>Sender Information</Text>
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Business Name</Text>
            <TextInput
              style={styles.input}
              value={senderName}
              onChangeText={setSenderName}
              placeholder="e.g. My Merchant Ltd."
              placeholderTextColor="#555"
            />

            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={styles.input}
              value={senderAddress}
              onChangeText={setSenderAddress}
              placeholder="Address details..."
              placeholderTextColor="#555"
            />

            <Text style={styles.inputLabel}>City</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
              {TURKISH_CITIES.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[styles.cityChip, senderCity === city && styles.cityChipActive]}
                  onPress={() => handleCitySelect('sender', city)}
                >
                  <Text style={[styles.cityChipText, senderCity === city && styles.cityChipTextActive]}>
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* RECEIVER BOX */}
          <Text style={styles.sectionLabel}>Recipient Information</Text>
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Customer Name</Text>
            <TextInput
              style={styles.input}
              value={receiverName}
              onChangeText={setReceiverName}
              placeholder="e.g. Ahmet Yılmaz"
              placeholderTextColor="#555"
            />

            <Text style={styles.inputLabel}>Delivery Address</Text>
            <TextInput
              style={styles.input}
              value={receiverAddress}
              onChangeText={setReceiverAddress}
              placeholder="Full address detail..."
              placeholderTextColor="#555"
            />

            <Text style={styles.inputLabel}>City</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
              {TURKISH_CITIES.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[styles.cityChip, receiverCity === city && styles.cityChipActive]}
                  onPress={() => handleCitySelect('receiver', city)}
                >
                  <Text style={[styles.cityChipText, receiverCity === city && styles.cityChipTextActive]}>
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* DIMENSIONS BOX */}
          <Text style={styles.sectionLabel}>Package Specifications</Text>
          <View style={styles.card}>
            <View style={styles.dimensionsRow}>
              <View style={styles.dimField}>
                <Text style={styles.inputLabel}>Width (cm)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={width}
                  onChangeText={setWidth}
                />
              </View>
              <View style={styles.dimField}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>
              <View style={styles.dimField}>
                <Text style={styles.inputLabel}>Length (cm)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={length}
                  onChangeText={setLength}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />

            <View style={styles.infoBox}>
              <Icon name="info-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.infoText}>
                Volumetric Weight (Desi) will be calculated automatically using (W × H × L) / 3000.
              </Text>
            </View>
          </View>

          {/* AI SCORING PREFERENCE */}
          <Text style={styles.sectionLabel}>AI Optimization Preferences (Optional)</Text>
          <View style={styles.card}>
            <Text style={styles.inputLabel}>What is most important for this order?</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={3}
              value={merchantPreference}
              onChangeText={setMerchantPreference}
              placeholder="e.g. Deliver as fast as possible. Avoid carrier MNG Kargo due to recent delays in Ankara."
              placeholderTextColor="#555"
            />
            <Text style={styles.preferenceHelp}>
              The AI engine will read your instructions and adjust the cargo scores (0-100) accordingly.
            </Text>
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleOptimize}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#101416" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Run AI Cargo Optimization</Text>
                <Icon name="bolt" size={20} color="#101416" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  sectionLabel: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    color: COLORS.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.outline + '40',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  cityScroll: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  cityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceHigh,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.outline + '20',
  },
  cityChipActive: {
    backgroundColor: 'rgba(61,90,254,0.15)',
    borderColor: COLORS.primaryContainer,
  },
  cityChipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  cityChipTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  dimensionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dimField: {
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(187,195,255,0.06)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  preferenceHelp: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 14,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#101416',
    fontSize: 16,
    fontWeight: '700',
  },
});
