/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  answer,
  groupBySentiment,
  insertWithComparisons,
  maxQuestions,
  nextOpponent,
  placeItem,
  scoreBuckets,
  startPlacement,
  type RankableItem,
} from './ranking.ts';

// A "true" quality value lets the tests act as a consistent user.
type TestItem = RankableItem & { quality: number };
const make = (name: string, quality: number, sentiment: RankableItem['sentiment'] = 'liked'): TestItem => ({
  id: name,
  name,
  sentiment,
  quality,
});
const userPrefers = (a: TestItem, b: TestItem) => a.quality > b.quality;

test('first item in an empty bucket needs no questions', async () => {
  const state = startPlacement<TestItem>([], make('A', 5));
  assert.equal(nextOpponent(state), null);
  assert.deepEqual(placeItem(state).map((i) => i.name), ['A']);
});

test('builds a correctly sorted list from random insertion order', async () => {
  const qualities = [42, 7, 93, 15, 61, 88, 3, 50, 27, 74, 99, 12];
  let bucket: TestItem[] = [];
  for (const q of qualities) {
    bucket = await insertWithComparisons(bucket, make(`item${q}`, q), userPrefers);
  }
  const expected = [...qualities].sort((a, b) => b - a);
  assert.deepEqual(bucket.map((i) => i.quality), expected);
});

test('never asks more than log2(n+1) questions', async () => {
  let bucket: TestItem[] = [];
  for (let q = 0; q < 100; q++) {
    let asked = 0;
    const quality = (q * 37) % 101; // scrambled order
    bucket = await insertWithComparisons(bucket, make(`i${q}`, quality), (a, b) => {
      asked++;
      return userPrefers(a, b);
    });
    assert.ok(asked <= maxQuestions(bucket.length - 1), `asked ${asked} for size ${bucket.length - 1}`);
  }
  assert.equal(maxQuestions(15), 4);
  assert.equal(maxQuestions(100), 7);
});

test('step-by-step flow matches what the UI will do', () => {
  const bucket = [make('Best', 90), make('Middle', 50), make('Worst', 10)];
  let state = startPlacement(bucket, make('New', 70));
  assert.equal(nextOpponent(state)?.name, 'Middle');
  state = answer(state, true); // better than Middle
  assert.equal(nextOpponent(state)?.name, 'Best');
  state = answer(state, false); // worse than Best
  assert.equal(nextOpponent(state), null);
  assert.deepEqual(placeItem(state).map((i) => i.name), ['Best', 'New', 'Middle', 'Worst']);
});

test('answering a decided placement throws', () => {
  const state = startPlacement<TestItem>([], make('A', 1));
  assert.throws(() => answer(state, true));
});

test('scores stay within each bucket range, best first', () => {
  const items = [
    make('L1', 0, 'liked'),
    make('L2', 0, 'liked'),
    make('L3', 0, 'liked'),
    make('F1', 0, 'fine'),
    make('D1', 0, 'disliked'),
    make('D2', 0, 'disliked'),
  ];
  const scored = scoreBuckets(groupBySentiment(items));
  assert.deepEqual(
    scored.map((i) => [i.name, i.rank, i.score]),
    [
      ['L1', 1, 10],
      ['L2', 2, 8.4],
      ['L3', 3, 6.7],
      ['F1', 4, 6.6],
      ['D1', 5, 3.3],
      ['D2', 6, 0],
    ],
  );
});
