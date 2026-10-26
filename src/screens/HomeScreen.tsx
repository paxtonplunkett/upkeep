import { FlatList, Pressable, Text, View } from 'react-native';
import { Header, styles as ui } from '../components/ui.tsx';
import { rankedItems } from '../store/reducer.ts';
import { useStore } from '../store/StoreProvider.tsx';
import { colors, spacing } from '../theme.ts';

export function HomeScreen({
  onOpenCategory,
  onNewCategory,
}: {
  onOpenCategory: (id: string) => void;
  onNewCategory: () => void;
}) {
  const { state } = useStore();
  return (
    <FlatList
      data={state.categories}
      keyExtractor={(c) => c.id}
      ListHeaderComponent={<Header title="Upkeep" subtitle="Rank what you use and where you go." />}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
      renderItem={({ item: category }) => {
        const ranked = rankedItems(state, category.id);
        const top = ranked[0];
        return (
          <Pressable
            onPress={() => onOpenCategory(category.id)}
            style={({ pressed }) => [ui.card, { marginHorizontal: spacing.md, marginBottom: spacing.sm }, pressed && { opacity: 0.7 }]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, flexShrink: 1 }}>{category.name}</Text>
              <Text style={{ fontSize: 13, color: colors.muted }}>
                {category.visibility === 'private' ? '🔒 ' : ''}
                {ranked.length} ranked
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }} numberOfLines={1}>
              {top ? `#1 ${top.name}` : category.kind === 'place' ? 'Places' : 'Things'}
            </Text>
          </Pressable>
        );
      }}
      ListFooterComponent={
        <Pressable onPress={onNewCategory} style={{ padding: spacing.md, alignItems: 'center' }}>
          <Text style={{ color: colors.accent, fontSize: 16, fontWeight: '700' }}>+ New category</Text>
        </Pressable>
      }
    />
  );
}
