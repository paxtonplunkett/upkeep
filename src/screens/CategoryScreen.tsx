import { FlatList, Pressable, Text, View } from 'react-native';
import { Button, Header, styles as ui } from '../components/ui.tsx';
import { scoredItems } from '../store/reducer.ts';
import { useStore } from '../store/StoreProvider.tsx';
import { colors, sentimentColor, spacing } from '../theme.ts';

export function CategoryScreen({
  categoryId,
  onBack,
  onAdd,
  onOpenItem,
}: {
  categoryId: string;
  onBack: () => void;
  onAdd: () => void;
  onOpenItem: (id: string) => void;
}) {
  const { state, dispatch } = useStore();
  const category = state.categories.find((c) => c.id === categoryId);
  if (!category) return null;
  const items = scoredItems(state, categoryId);
  const isPrivate = category.visibility === 'private';

  const toggle = (
    <Pressable
      onPress={() =>
        dispatch({ type: 'setVisibility', categoryId, visibility: isPrivate ? 'public' : 'private' })
      }
      hitSlop={10}
      accessibilityRole="switch"
      accessibilityState={{ checked: isPrivate }}
    >
      <Text style={{ color: colors.accent, fontWeight: '600', fontSize: 15 }}>
        {isPrivate ? '🔒 Private' : '🌐 Public'}
      </Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={
          <Header
            title={category.name}
            subtitle={items.length ? `${items.length} ranked` : undefined}
            onBack={onBack}
            right={toggle}
          />
        }
        ListEmptyComponent={
          <View style={{ padding: spacing.lg, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: colors.muted, textAlign: 'center' }}>
              Nothing ranked yet. Add your first {category.kind === 'place' ? 'place' : 'one'} to start your list.
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onOpenItem(item.id)}
            style={({ pressed }) => [
              ui.card,
              { marginHorizontal: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center' },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={{ width: 32, fontSize: 16, fontWeight: '700', color: colors.muted }}>{item.rank}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                {item.name}
              </Text>
              {item.address || item.productUrl ? (
                <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }} numberOfLines={1}>
                  {item.address ?? hostOf(item.productUrl)}
                </Text>
              ) : null}
            </View>
            <View style={{ borderWidth: 2, borderColor: sentimentColor[item.sentiment], borderRadius: 999, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: sentimentColor[item.sentiment] }}>
                {item.score.toFixed(1)}
              </Text>
            </View>
          </Pressable>
        )}
      />
      <View style={{ position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.lg }}>
        <Button label={category.kind === 'place' ? '+ Add a place' : '+ Add an item'} onPress={onAdd} />
      </View>
    </View>
  );
}

function hostOf(url?: string) {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
}
