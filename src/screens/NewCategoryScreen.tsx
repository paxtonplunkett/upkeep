import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Field, Header, Pill, styles as ui } from '../components/ui.tsx';
import type { CategoryKind } from '../data/defaultCategories.ts';
import { colors, spacing } from '../theme.ts';

export function NewCategoryScreen({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (name: string, kind: CategoryKind) => void;
}) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState<CategoryKind>('thing');
  return (
    <View>
      <Header title="New category" subtitle="Make your own list for anything." onBack={onCancel} />
      <View style={{ paddingHorizontal: spacing.md }}>
        <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Sneakers" autoFocus />
        <Text style={ui.label}>What are you ranking?</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
          <Pill label="Things" color={colors.accent} selected={kind === 'thing'} onPress={() => setKind('thing')} />
          <Pill label="Places" color={colors.accent} selected={kind === 'place'} onPress={() => setKind('place')} />
        </View>
        <Button label="Create" onPress={() => onCreate(name, kind)} disabled={!name.trim()} />
      </View>
    </View>
  );
}
