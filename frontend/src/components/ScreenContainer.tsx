/**
 * Standard screen shell — handles SafeArea, status bar, and background.
 *
 * Every authenticated screen should render inside <ScreenContainer>; this
 * is the single place to change global screen chrome.
 */

import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, type ViewStyle } from 'react-native';

import { Palette } from '@/src/constants';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  /** When true (default), wraps children in a full-bleed background view. */
  withBackground?: boolean;
}

export function ScreenContainer({ children, style, withBackground = true }: Props) {
  return (
    <SafeAreaView style={[styles.safe, withBackground && styles.bg, style]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.inner}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  bg: { backgroundColor: Palette.background },
  inner: { flex: 1 },
});
