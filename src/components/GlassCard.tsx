import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Palette, Radius, Spacing } from '@/src/constants';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

/** Glassmorphic surface used by the fintech-themed screens. */
export function GlassCard({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.glass,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.glassBorder,
  },
});
