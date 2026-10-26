import { Pressable, Text, View } from 'react-native';
import { Header } from '../components/ui.tsx';
import { maxQuestions, nextOpponent, type PlacementState } from '../ranking/ranking.ts';
import type { Item } from '../store/types.ts';
import { colors, radius, spacing } from '../theme.ts';

/** One "which is better?" question per screen. */
export function CompareScreen({
  placement,
  asked,
  onAnswer,
  onCancel,
}: {
  placement: PlacementState<Item>;
  asked: number;
  onAnswer: (newItemIsBetter: boolean) => void;
  onCancel: () => void;
}) {
  const opponent = nextOpponent(placement);
  if (!opponent) return null;
  const total = maxQuestions(placement.bucket.length);

  return (
    <View style={{ flex: 1 }}>
      <Header title="Which is better?" subtitle={`Question ${asked + 1} of up to ${total}`} onBack={onCancel} />
      <View style={{ flex: 1, paddingHorizontal: spacing.md, justifyContent: 'center', gap: spacing.md, paddingBottom: spacing.xl }}>
        <Choice title={placement.item.name} tag="New" onPress={() => onAnswer(true)} />
        <Text style={{ textAlign: 'center', fontSize: 15, fontWeight: '700', color: colors.muted }}>or</Text>
        <Choice title={opponent.name} onPress={() => onAnswer(false)} />
      </View>
    </View>
  );
}

function Choice({ title, tag, onPress }: { title: string; tag?: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        backgroundColor: pressed ? colors.accentSoft : colors.surface,
        borderColor: colors.accent,
        borderWidth: 2,
        borderRadius: radius.lg,
        paddingVertical: 40,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
      })}
    >
      {tag ? (
        <Text style={{ fontSize: 12, fontWeight: '800', color: colors.accent, letterSpacing: 1, marginBottom: 6 }}>
          {tag.toUpperCase()}
        </Text>
      ) : null}
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center' }}>{title}</Text>
    </Pressable>
  );
}
