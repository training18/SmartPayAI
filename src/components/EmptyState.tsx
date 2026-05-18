import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Palette, Spacing } from '@/src/constants';

interface Props {
  icon?: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description?: string;
}

export function EmptyState({ icon = 'inbox', title, description }: Props) {
  return (
    <View style={styles.container}>
      <MaterialIcons name={icon} size={48} color={Palette.textSecondary} />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  title: { color: Palette.textPrimary, fontSize: 18, fontWeight: '700', marginTop: Spacing.sm },
  description: {
    color: Palette.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
  },
});
