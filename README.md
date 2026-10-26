# Upkeep

Rank the things you use and the places you go — hair products, salons, perfumes, jeans — by comparing them head to head instead of giving stars. Upkeep turns your answers into a ranked list and a 0–10 score per category, so you always remember what you loved and what to skip.

See **[PLAN.md](PLAN.md)** for the full product plan, decisions and build order.

## How ranking works

1. Add an item and pick a gut feeling: **liked it / it was fine / didn't like it**.
2. Upkeep asks a few "better or worse than X?" questions against items in the same bucket.
3. The item drops into place (binary insertion — about 4 questions for 15 items, 7 for 100).
4. Scores are spread across each bucket: liked 6.7–10, fine 3.4–6.6, didn't like 0–3.3.

The logic lives in [`src/ranking/ranking.ts`](src/ranking/ranking.ts), with tests alongside it.

## Default categories

Hair salons and nail salons (places, picked via Google Maps); hair styling products, shampoo, conditioner, lips, perfumes and jeans (things, saved with a purchase link). Users can add their own. Each category is public or private.

## Run it

```bash
npm install
npm test          # ranking engine tests
npm run typecheck
npm start         # then scan the QR code with the Expo Go app on your phone
```

## Stack

React Native + Expo, TypeScript. Planned: Supabase (auth, database, photos), Google Places API.
