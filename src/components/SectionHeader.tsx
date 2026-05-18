import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Palette, Spacing, Typography } from '@/src/constants';

interface Props {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function SectionHeader({ title, actionLabel, onActionPress }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onActionPress} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: { ...Typography.heading, color: Palette.textPrimary },
  action: { color: Palette.primarySoft, fontWeight: '600' },
});
