/**
 * Categories every Upkeep user starts with. Users can add their own.
 * - 'place' categories are picked through Google Maps (Places autocomplete).
 * - 'thing' categories store a link to where the item was purchased.
 * Visibility is set per category (public or private), never per item.
 */

export type CategoryKind = 'place' | 'thing';
export type Visibility = 'public' | 'private';

export interface CategoryTemplate {
  slug: string;
  name: string;
  kind: CategoryKind;
}

export const DEFAULT_CATEGORIES: readonly CategoryTemplate[] = [
  { slug: 'hair-salons', name: 'Hair salons', kind: 'place' },
  { slug: 'nail-salons', name: 'Nail salons', kind: 'place' },
  { slug: 'hair-styling-products', name: 'Hair styling products', kind: 'thing' },
  { slug: 'hair-shampoo', name: 'Hair shampoo', kind: 'thing' },
  { slug: 'hair-conditioner', name: 'Hair conditioner', kind: 'thing' },
  { slug: 'lips', name: 'Lips', kind: 'thing' },
  { slug: 'perfumes', name: 'Perfumes', kind: 'thing' },
  { slug: 'jeans', name: 'Jeans', kind: 'thing' },
];

export const DEFAULT_VISIBILITY: Visibility = 'public';
