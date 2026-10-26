/**
 * Upkeep ranking engine.
 *
 * Items in a category are ranked by head-to-head comparisons instead of stars.
 * Each sentiment bucket (liked / fine / disliked) is its own list, sorted
 * best-first. A new item is placed with binary insertion: we compare it to the
 * middle of the remaining range, halve the range based on the answer, and
 * repeat — about log2(n) questions.
 *
 * The comparison flow is a small state machine so the UI can ask one question
 * per screen: startPlacement -> (nextOpponent / answer)* -> placeItem.
 */

export type Sentiment = 'liked' | 'fine' | 'disliked';

export const SENTIMENTS: readonly Sentiment[] = ['liked', 'fine', 'disliked'];

export interface RankableItem {
  id: string;
  name: string;
  sentiment: Sentiment;
}

/** Score range (inclusive) for each bucket on the 0–10 scale. */
export const SCORE_RANGES: Record<Sentiment, { min: number; max: number }> = {
  liked: { min: 6.7, max: 10 },
  fine: { min: 3.4, max: 6.6 },
  disliked: { min: 0, max: 3.3 },
};

/** Where we are in placing a new item into a bucket. */
export interface PlacementState<T extends RankableItem> {
  item: T;
  /** The bucket the item is being placed into, sorted best-first. */
  bucket: readonly T[];
  /** Search window: the item's final index lies in [low, high]. */
  low: number;
  high: number;
}

/** Begin placing `item` into `bucket` (best-first list of the same sentiment). */
export function startPlacement<T extends RankableItem>(
  bucket: readonly T[],
  item: T,
): PlacementState<T> {
  return { item, bucket, low: 0, high: bucket.length };
}

/** The item to compare against next, or null when the position is decided. */
export function nextOpponent<T extends RankableItem>(state: PlacementState<T>): T | null {
  if (state.low >= state.high) return null;
  return state.bucket[midpoint(state)];
}

/**
 * Record the user's answer to "Is the new item better than the current opponent?"
 * Returns a new state; the input state is not modified.
 */
export function answer<T extends RankableItem>(
  state: PlacementState<T>,
  newItemIsBetter: boolean,
): PlacementState<T> {
  if (state.low >= state.high) {
    throw new Error('Placement already decided; no question to answer.');
  }
  const mid = midpoint(state);
  return newItemIsBetter
    ? { ...state, high: mid } // better than mid → goes above it
    : { ...state, low: mid + 1 }; // worse than mid → goes below it
}

export function isDecided<T extends RankableItem>(state: PlacementState<T>): boolean {
  return state.low >= state.high;
}

/** Final index of the item within its bucket (only valid once decided). */
export function finalIndex<T extends RankableItem>(state: PlacementState<T>): number {
  if (!isDecided(state)) throw new Error('Placement not decided yet.');
  return state.low;
}

/** Returns a new bucket with the item inserted at its decided position. */
export function placeItem<T extends RankableItem>(state: PlacementState<T>): T[] {
  const index = finalIndex(state);
  return [...state.bucket.slice(0, index), state.item, ...state.bucket.slice(index)];
}

/**
 * Convenience wrapper: runs the whole placement, asking `isBetter(newItem, opponent)`
 * for each comparison. Useful for tests, imports and re-ranking.
 */
export async function insertWithComparisons<T extends RankableItem>(
  bucket: readonly T[],
  item: T,
  isBetter: (newItem: T, opponent: T) => boolean | Promise<boolean>,
): Promise<T[]> {
  let state = startPlacement(bucket, item);
  let opponent = nextOpponent(state);
  while (opponent) {
    state = answer(state, await isBetter(item, opponent));
    opponent = nextOpponent(state);
  }
  return placeItem(state);
}

/** Maximum number of questions needed to place an item into a bucket of size n. */
export function maxQuestions(bucketSize: number): number {
  return bucketSize === 0 ? 0 : Math.ceil(Math.log2(bucketSize + 1));
}

/**
 * Score every item in one category. Each bucket is spread evenly across its
 * score range, best item at the top. Scores are per category, so a 9.2 in
 * "Perfumes" is only relative to other perfumes.
 */
export function scoreBuckets<T extends RankableItem>(
  buckets: Record<Sentiment, readonly T[]>,
): Array<T & { score: number; rank: number }> {
  const result: Array<T & { score: number; rank: number }> = [];
  let rank = 1;
  for (const sentiment of SENTIMENTS) {
    const items = buckets[sentiment];
    const { min, max } = SCORE_RANGES[sentiment];
    items.forEach((item, i) => {
      const fraction = items.length === 1 ? 0 : i / (items.length - 1);
      const score = Math.round((max - (max - min) * fraction) * 10) / 10;
      result.push({ ...item, score, rank: rank++ });
    });
  }
  return result;
}

/** Split a category's items into sentiment buckets, preserving order. */
export function groupBySentiment<T extends RankableItem>(
  items: readonly T[],
): Record<Sentiment, T[]> {
  const buckets: Record<Sentiment, T[]> = { liked: [], fine: [], disliked: [] };
  for (const item of items) buckets[item.sentiment].push(item);
  return buckets;
}

function midpoint<T extends RankableItem>(state: PlacementState<T>): number {
  return Math.floor((state.low + state.high) / 2);
}
