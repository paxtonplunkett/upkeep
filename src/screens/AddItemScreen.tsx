import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Button, Field, Header, Pill, styles as ui } from '../components/ui.tsx';
import { SENTIMENTS, type Sentiment } from '../ranking/ranking.ts';
import { useStore } from '../store/StoreProvider.tsx';
import type { ItemDraft } from '../store/types.ts';
import { sentimentColor, sentimentLabel, spacing } from '../theme.ts';

export function AddItemScreen({
  categoryId,
  onCancel,
  onSubmit,
}: {
  categoryId: string;
  onCancel: () => void;
  onSubmit: (draft: ItemDraft) => void;
}) {
  const { state } = useStore();
  const category = state.categories.find((c) => c.id === categoryId);
  const [name, setName] = useState('');
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  if (!category) return null;
  const isPlace = category.kind === 'place';
  const canSubmit = name.trim().length > 0 && sentiment !== null;

  const submit = () => {
    if (!canSubmit || !sentiment) return;
    onSubmit({
      categoryId,
      name: name.trim(),
      sentiment,
      notes: notes.trim() || undefined,
      ...(isPlace ? { address: link.trim() || undefined } : { productUrl: normalizeUrl(link) }),
    });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Header title={isPlace ? 'Add a place' : 'Add an item'} subtitle={category.name} onBack={onCancel} />
        <View style={{ paddingHorizontal: spacing.md }}>
          <Field
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder={isPlace ? 'e.g. Salon name' : 'e.g. Product name'}
            autoFocus
            returnKeyType="next"
          />
          {/* TODO: replace with Google Places autocomplete (stores googlePlaceId, lat/lng). */}
          <Field
            label={isPlace ? 'Address or neighborhood' : 'Where you bought it (link)'}
            value={link}
            onChangeText={setLink}
            placeholder={isPlace ? 'e.g. Lower East Side' : 'https://…'}
            autoCapitalize={isPlace ? 'words' : 'none'}
            keyboardType={isPlace ? 'default' : 'url'}
          />
          <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional" multiline />

          <Text style={[ui.label, { marginTop: spacing.sm }]}>How was it?</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
            {SENTIMENTS.map((s) => (
              <Pill
                key={s}
                label={sentimentLabel[s]}
                color={sentimentColor[s]}
                selected={sentiment === s}
                onPress={() => setSentiment(s)}
              />
            ))}
          </View>
          <Button label="Rank it" onPress={submit} disabled={!canSubmit} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function normalizeUrl(raw: string): string | undefined {
  const url = raw.trim();
  if (!url) return undefined;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
