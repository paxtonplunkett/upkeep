import type { CategoryKind, Visibility } from '../data/defaultCategories.ts';
import type { RankableItem, Sentiment } from '../ranking/ranking.ts';

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
  isDefault: boolean;
  visibility: Visibility;
}

export interface Item extends RankableItem {
  categoryId: string;
  notes?: string;
  /** Places: address text for now; Google Place ID once Places search is added. */
  address?: string;
  googlePlaceId?: string;
  /** Things: where it was bought. */
  productUrl?: string;
  createdAt: string;
}

export interface AppState {
  categories: Category[];
  items: Record<string, Item>;
  /** Per category: item ids best-first (liked bucket, then fine, then disliked). */
  rankings: Record<string, string[]>;
}

export type ItemDraft = {
  categoryId: string;
  name: string;
  sentiment: Sentiment;
  notes?: string;
  address?: string;
  productUrl?: string;
};
