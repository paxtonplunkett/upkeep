import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { answer, isDecided, placeItem, startPlacement, type PlacementState } from './src/ranking/ranking.ts';
import { AddItemScreen } from './src/screens/AddItemScreen.tsx';
import { CategoryScreen } from './src/screens/CategoryScreen.tsx';
import { CompareScreen } from './src/screens/CompareScreen.tsx';
import { HomeScreen } from './src/screens/HomeScreen.tsx';
import { ItemScreen } from './src/screens/ItemScreen.tsx';
import { NewCategoryScreen } from './src/screens/NewCategoryScreen.tsx';
import { bucketFor, newId } from './src/store/reducer.ts';
import { StoreProvider, useStore } from './src/store/StoreProvider.tsx';
import type { Item, ItemDraft } from './src/store/types.ts';
import { colors } from './src/theme.ts';

type Route =
  | { name: 'home' }
  | { name: 'newCategory' }
  | { name: 'category'; categoryId: string }
  | { name: 'item'; itemId: string }
  | { name: 'add'; categoryId: string }
  | { name: 'compare'; placement: PlacementState<Item>; asked: number };

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
          <Navigator />
        </SafeAreaView>
        <StatusBar style="dark" />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

/** A tiny stack navigator — enough for the prototype. */
function Navigator() {
  const { state, dispatch } = useStore();
  const [stack, setStack] = useState<Route[]>([{ name: 'home' }]);
  const route = stack[stack.length - 1];
  const push = (r: Route) => setStack((s) => [...s, r]);
  const pop = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  /** Back to the category screen, dropping the add/compare screens. */
  const popToCategory = () =>
    setStack((s) => s.slice(0, s.findLastIndex((r) => r.name === 'category') + 1 || 1));

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length === 1) return false;
      if (route.name === 'compare') popToCategory();
      else pop();
      return true;
    });
    return () => sub.remove();
  }, [stack, route.name]);

  const finishPlacement = (placement: PlacementState<Item>) => {
    dispatch({ type: 'placeItem', item: placement.item, bucket: placeItem(placement).map((i) => i.id) });
    popToCategory();
  };

  const startRanking = (draft: ItemDraft) => {
    const item: Item = { ...draft, id: newId(), createdAt: new Date().toISOString() };
    const placement = startPlacement(bucketFor(state, item.categoryId, item.sentiment), item);
    if (isDecided(placement)) finishPlacement(placement);
    else setStack((s) => [...s.slice(0, -1), { name: 'compare', placement, asked: 0 }]);
  };

  switch (route.name) {
    case 'home':
      return (
        <HomeScreen
          onOpenCategory={(categoryId) => push({ name: 'category', categoryId })}
          onNewCategory={() => push({ name: 'newCategory' })}
        />
      );
    case 'newCategory':
      return (
        <NewCategoryScreen
          onCancel={pop}
          onCreate={(name, kind) => {
            const id = newId();
            dispatch({ type: 'addCategory', id, name, kind });
            setStack([{ name: 'home' }, { name: 'category', categoryId: id }]);
          }}
        />
      );
    case 'category':
      return (
        <CategoryScreen
          categoryId={route.categoryId}
          onBack={pop}
          onAdd={() => push({ name: 'add', categoryId: route.categoryId })}
          onOpenItem={(itemId) => push({ name: 'item', itemId })}
        />
      );
    case 'item':
      return <ItemScreen itemId={route.itemId} onBack={pop} />;
    case 'add':
      return <AddItemScreen categoryId={route.categoryId} onCancel={pop} onSubmit={startRanking} />;
    case 'compare':
      return (
        <CompareScreen
          key={route.asked}
          placement={route.placement}
          asked={route.asked}
          onCancel={popToCategory}
          onAnswer={(better) => {
            const next = answer(route.placement, better);
            if (isDecided(next)) finishPlacement(next);
            else setStack((s) => [...s.slice(0, -1), { name: 'compare', placement: next, asked: route.asked + 1 }]);
          }}
        />
      );
  }
}
