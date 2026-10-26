import { Alert, Linking, ScrollView, Text, View } from 'react-native';
import { Button, Header, styles as ui } from '../components/ui.tsx';
import { scoredItems } from '../store/reducer.ts';
import { useStore } from '../store/StoreProvider.tsx';
import { colors, sentimentColor, sentimentLabel, spacing } from '../theme.ts';

export function ItemScreen({ itemId, onBack }: { itemId: string; onBack: () => void }) {
  const { state, dispatch } = useStore();
  const base = state.items[itemId];
  if (!base) return null;
  const item = scoredItems(state, base.categoryId).find((i) => i.id === itemId);
  if (!item) return null;
  const category = state.categories.find((c) => c.id === item.categoryId);

  const remove = () =>
    Alert.alert('Remove from your list?', item.name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          onBack();
          dispatch({ type: 'deleteItem', itemId });
        },
      },
    ]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <Header title={item.name} subtitle={category?.name} onBack={onBack} />
      <View style={{ paddingHorizontal: spacing.md, gap: spacing.md }}>
        <View style={[ui.card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <View>
            <Text style={ui.label}>Rank</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>#{item.rank}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={ui.label}>{sentimentLabel[item.sentiment]}</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: sentimentColor[item.sentiment] }}>
              {item.score.toFixed(1)}
            </Text>
          </View>
        </View>
        {item.address ? <Detail label="Location" value={item.address} /> : null}
        {item.productUrl ? (
          <View style={ui.card}>
            <Text style={ui.label}>Where you bought it</Text>
            <Text style={{ fontSize: 16, color: colors.accent }} onPress={() => Linking.openURL(item.productUrl!)}>
              {item.productUrl}
            </Text>
          </View>
        ) : null}
        {item.notes ? <Detail label="Notes" value={item.notes} /> : null}
        <Button label="Remove" variant="secondary" onPress={remove} />
      </View>
    </ScrollView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={ui.card}>
      <Text style={ui.label}>{label}</Text>
      <Text style={{ fontSize: 16, color: colors.text }}>{value}</Text>
    </View>
  );
}
