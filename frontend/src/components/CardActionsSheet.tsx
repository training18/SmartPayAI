import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import type { SavedCard } from '@/src/types';

interface Props {
  card: SavedCard | null;
  onClose: () => void;
  onEdit: (id: string) => void;
  onRename: (id: string, nickname: string) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}

type Mode = 'menu' | 'rename' | 'confirmDelete';

/**
 * Bottom-sheet action menu surfaced on long-press of a card tile.
 *
 * Hosts the Edit / Rename / Delete flows so MyCardsScreen doesn't need to
 * own the prompt + confirmation UX itself.
 *
 * Delete uses an in-sheet confirmation view rather than Alert.alert, which
 * doesn't work reliably when presented from inside a React Native Modal.
 */
export function CardActionsSheet({ card, onClose, onEdit, onRename, onDelete }: Props) {
  const [mode, setMode] = useState<Mode>('menu');
  const [nickname, setNickname] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (card) {
      setMode('menu');
      setNickname(card.cardAlias ?? '');
      setBusy(false);
    }
  }, [card]);

  const visible = card !== null;

  const handleRename = async () => {
    if (!card || busy) return;
    const next = nickname.trim();
    if (!next) return;
    setBusy(true);
    try {
      await onRename(card.id, next);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!card || busy) return;
    setBusy(true);
    try {
      await onDelete(card.id);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={busy ? undefined : onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View style={styles.sheet}>
                <View style={styles.handle} />

                {card && (
                  <View style={styles.cardSummary}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {card.cardAlias ?? card.bankName ?? 'Card'}
                    </Text>
                    <Text style={styles.cardMeta}>{card.first4} ••••</Text>
                  </View>
                )}

                {mode === 'menu' && (
                  <View>
                    <SheetButton
                      icon="edit-note"
                      label="Edit Card"
                      onPress={() => {
                        if (card) {
                          onClose();
                          onEdit(card.id);
                        }
                      }}
                    />
                    <SheetButton
                      icon="edit"
                      label="Edit Nickname"
                      onPress={() => setMode('rename')}
                    />
                    <SheetButton
                      icon="delete-outline"
                      label="Remove Card"
                      destructive
                      onPress={() => setMode('confirmDelete')}
                    />
                    <SheetButton
                      icon="close"
                      label="Cancel"
                      muted
                      onPress={onClose}
                    />
                  </View>
                )}

                {mode === 'rename' && (
                  <View>
                    <Text style={styles.fieldLabel}>Nickname</Text>
                    <TextInput
                      style={styles.input}
                      value={nickname}
                      onChangeText={setNickname}
                      placeholder="Travel Card"
                      placeholderTextColor="#7A7E8B"
                      maxLength={32}
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={handleRename}
                    />

                    <View style={styles.row}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.secondary]}
                        onPress={() => setMode('menu')}
                        disabled={busy}
                      >
                        <Text style={styles.secondaryText}>Back</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          styles.primary,
                          (!nickname.trim() || busy) && { opacity: 0.5 },
                        ]}
                        onPress={handleRename}
                        disabled={!nickname.trim() || busy}
                      >
                        {busy ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.primaryText}>Save</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {mode === 'confirmDelete' && card && (
                  <View>
                    <View style={styles.deleteWarning}>
                      <MaterialIcons name="warning-amber" size={28} color="#FF6B6B" />
                      <Text style={styles.deleteTitle}>Remove this card?</Text>
                      <Text style={styles.deleteDescription}>
                        {card.cardAlias ?? card.bankName ?? 'This card'} {card.first4} •••• will
                        be permanently removed from your wallet.
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.secondary]}
                        onPress={() => setMode('menu')}
                        disabled={busy}
                      >
                        <Text style={styles.secondaryText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          styles.danger,
                          busy && { opacity: 0.5 },
                        ]}
                        onPress={handleConfirmDelete}
                        disabled={busy}
                      >
                        {busy ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.primaryText}>Remove</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function SheetButton({
  icon,
  label,
  onPress,
  destructive,
  muted,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  muted?: boolean;
}) {
  const tint = destructive ? '#FF6B6B' : muted ? '#9AA0B4' : '#E0E3E6';
  return (
    <TouchableOpacity style={styles.sheetButton} onPress={onPress} activeOpacity={0.75}>
      <MaterialIcons name={icon} size={20} color={tint} />
      <Text style={[styles.sheetButtonText, { color: tint }]}>{label}</Text>
      {!muted && (
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Ionicons name="chevron-forward" size={18} color="#4B4F5C" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1A1D20',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 16,
  },
  cardSummary: { marginBottom: 16 },
  cardTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  cardMeta: { color: '#9AA0B4', fontSize: 13, marginTop: 4, letterSpacing: 1.2 },

  sheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  sheetButtonText: { fontSize: 15, fontWeight: '600' },

  fieldLabel: {
    color: '#9AA0B4',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    marginBottom: 16,
  },
  row: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: '#2848EE' },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  secondaryText: { color: '#C5C5D9', fontWeight: '600', fontSize: 14 },
  danger: { backgroundColor: '#D32F2F' },

  deleteWarning: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 20,
  },
  deleteTitle: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  deleteDescription: {
    color: '#9AA0B4',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
