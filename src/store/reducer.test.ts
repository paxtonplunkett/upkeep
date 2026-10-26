/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { insertWithComparisons } from '../ranking/ranking.ts';
import { bucketFor, initialState, reducer, scoredItems } from './reducer.ts';
import type { AppState, Item } from './types.ts';

const item = (id: string, sentiment: Item['sentiment']): Item => ({
  id,
  name: id,
  sentiment,
  categoryId: 'perfumes',
  createdAt: '2026-10-26T00:00:00Z',
});

async function add(state: AppState, newItem: Item, better: (a: string, b: string) => boolean) {
  const bucket = bucketFor(state, newItem.categoryId, newItem.sentiment);
  const placed = await insertWithComparisons(bucket, newItem, (a, b) => better(a.id, b.id));
  return reducer(state, { type: 'placeItem', item: newItem, bucket: placed.map((i) => i.id) });
}

test('starts with the 8 default categories, all public', () => {
  const s = initialState();
  assert.equal(s.categories.length, 8);
  assert.ok(s.categories.every((c) => c.isDefault && c.visibility === 'public'));
});

test('keeps buckets in liked → fine → disliked order with scores', async () => {
  const rank = ['A', 'B', 'C', 'D', 'E'];
  const better = (a: string, b: string) => rank.indexOf(a) < rank.indexOf(b);
  let s = initialState();
  s = await add(s, item('D', 'disliked'), better);
  s = await add(s, item('B', 'liked'), better);
  s = await add(s, item('C', 'fine'), better);
  s = await add(s, item('A', 'liked'), better);
  s = await add(s, item('E', 'disliked'), better);
  assert.deepEqual(s.rankings.perfumes, ['A', 'B', 'C', 'D', 'E']);
  assert.deepEqual(
    scoredItems(s, 'perfumes').map((i) => [i.id, i.score]),
    [['A', 10], ['B', 6.7], ['C', 6.6], ['D', 3.3], ['E', 0]],
  );
});

test('privacy is set per category and delete removes from the ranking', async () => {
  let s = initialState();
  s = reducer(s, { type: 'setVisibility', categoryId: 'jeans', visibility: 'private' });
  assert.equal(s.categories.find((c) => c.id === 'jeans')?.visibility, 'private');
  s = await add(s, item('X', 'liked'), () => true);
  s = reducer(s, { type: 'deleteItem', itemId: 'X' });
  assert.deepEqual(s.rankings.perfumes, []);
  assert.equal(s.items.X, undefined);
});

test('custom categories can be added', () => {
  const s = reducer(initialState(), { type: 'addCategory', id: 'c1', name: ' Sneakers ', kind: 'thing' });
  const c = s.categories.at(-1);
  assert.deepEqual([c?.name, c?.isDefault, c?.kind], ['Sneakers', false, 'thing']);
});
