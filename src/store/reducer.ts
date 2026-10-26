import { DEFAULT_CATEGORIES, DEFAULT_VISIBILITY, type CategoryKind, type Visibility } from '../data/defaultCategories.ts';
import { SENTIMENTS, groupBySentiment, scoreBuckets, type Sentiment } from '../ranking/ranking.ts';
import type { AppState, Category, Item } from './types.ts';

export type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'addCategory'; id: string; name: string; kind: CategoryKind }
  | { type: 'setVisibility'; categoryId: string; visibility: Visibility }
  /** Insert a ranked item; `bucket` is the item's sentiment bucket after placement, best-first. */
  | { type: 'placeItem'; item: Item; bucket: string[] }
  | { type: 'deleteItem'; itemId: string };

export function initialState(): AppState {
  return {
    categories: DEFAULT_CATEGORIES.map((c) => ({
      id: c.slug,
      name: c.name,
      kind: c.kind,
      isDefault: true,
      visibility: DEFAULT_VISIBILITY,
    })),
    items: {},
    rankings: {},
  };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return action.state;

    case 'addCategory': {
      const category: Category = {
        id: action.id,
        name: action.name.trim(),
        kind: action.kind,
        isDefault: false,
        visibility: DEFAULT_VISIBILITY,
      };
      return { ...state, categories: [...state.categories, category] };
    }

    case 'setVisibility':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.categoryId ? { ...c, visibility: action.visibility } : c,
        ),
      };

    case 'placeItem': {
      const { item, bucket } = action;
      const items = { ...state.items, [item.id]: item };
      const current = state.rankings[item.categoryId] ?? [];
      const ranking = SENTIMENTS.flatMap((s) =>
        s === item.sentiment ? bucket : current.filter((id) => items[id]?.sentiment === s),
      );
      return { ...state, items, rankings: { ...state.rankings, [item.categoryId]: ranking } };
    }

    case 'deleteItem': {
      const item = state.items[action.itemId];
      if (!item) return state;
      const { [action.itemId]: _removed, ...items } = state.items;
      const ranking = (state.rankings[item.categoryId] ?? []).filter((id) => id !== action.itemId);
      return { ...state, items, rankings: { ...state.rankings, [item.categoryId]: ranking } };
    }
  }
}

/** A category's items best-first. */
export function rankedItems(state: AppState, categoryId: string): Item[] {
  return (state.rankings[categoryId] ?? []).map((id) => state.items[id]).filter(Boolean);
}

/** A category's items in one sentiment bucket, best-first. */
export function bucketFor(state: AppState, categoryId: string, sentiment: Sentiment): Item[] {
  return rankedItems(state, categoryId).filter((i) => i.sentiment === sentiment);
}

/** A category's items with rank and 0–10 score. */
export function scoredItems(state: AppState, categoryId: string) {
  return scoreBuckets(groupBySentiment(rankedItems(state, categoryId)));
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
