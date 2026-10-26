# Upkeep — Project Plan

*Working name: Upkeep. A Beli-style app for ranking anything: hair products, places you've been, coffee, books, hotels — so you remember what you liked and what you didn't.*

---

## 1. The idea

Beli works because it skips star ratings. Instead of "how many stars is this?", it asks "is this better or worse than that one?" Comparisons are easier and more honest, and the result is a personal ranked list that turns into a score.

**Upkeep** applies that same mechanic to any category the user creates.

### Core loop
1. User adds an item (e.g. "Olaplex No. 3") to a category (e.g. "Hair products").
2. Quick gut check: **Liked it / It was fine / Didn't like it**.
3. App asks 2–4 head-to-head questions against items already in that bucket ("Better or worse than Moroccanoil?").
4. Item lands in its spot in the ranked list and gets a 0–10 score based on position.
5. Optional notes, photo, date, location, price, tags.

### How the ranking works (MVP)
Use **binary insertion**, not Elo, to start:
- Each sentiment bucket (liked / fine / disliked) is its own sorted list.
- A new item is compared against the middle of its bucket, then the middle of the remaining half, and so on — about log₂(n) questions (≈4 questions for 15 items, ≈7 for 100).
- Score = position mapped onto a range per bucket (e.g. liked 6.7–10, fine 3.4–6.6, disliked 0–3.3).

Elo or similar pairwise systems are worth revisiting later for "re-rank" sessions or comparing across friends, but binary insertion is simpler, deterministic, and gives a clean list immediately.

---

## 2. MVP scope (v0.1)

**In**
- Sign in (email or Apple/Google)
- Create custom categories (with a few starter templates: Places, Restaurants, Hair & beauty, Coffee, Books)
- Add an item → sentiment → comparisons → ranked
- Ranked list view per category, with scores
- Item detail: notes, photo, date, location
- Search within your own items

**Out (later)**
- Friends, following, feeds
- Recommendations
- Map view
- Shared/public lists
- Importing from Google Maps, Notes, etc.

---

## 3. Suggested tech stack

| Layer | Pick | Why |
|---|---|---|
| App | **React Native + Expo**, TypeScript | One codebase for iOS + Android; fastest path to a phone in your hand |
| Backend / DB / Auth | **Supabase** (Postgres) | Free tier, built-in auth and file storage, real SQL for rankings |
| Photos | Supabase Storage | Same platform |
| Places search | Google Places API (autocomplete + details) | Pick real places for "places you've been"; has a free monthly usage allowance |
| Product links | Store the purchase URL; fetch the page's title/image (Open Graph tags) via a small server function | Auto-fills name and photo when a link is pasted |
| Hosting cost at MVP | ~$0/month | Free tiers cover early users |

### Starter data model
```
users        (id, name, username, created_at)
categories   (id, user_id NULL for defaults, name, icon,
              kind 'place' | 'thing', is_default, created_at)
user_categories (user_id, category_id, visibility 'public' | 'private')
items        (id, user_id, category_id, name, sentiment, rank_position,
              score, notes, photo_url, visited_on,
              -- places
              google_place_id, address, lat, lng,
              -- things
              product_url, price,
              created_at)
comparisons  (id, user_id, item_a, item_b, winner, created_at)   -- history, useful for re-ranking later
```
Rankings and scores are computed within one user + one category, so each category has its own scale.

---

## 4. Where to start — build order

1. **Paper/Figma sketch** (1 evening): the 4 core screens — category list, ranked list, add item, comparison prompt.
2. **Set up the repo**: Expo + TypeScript project, pushed to GitHub. ✅ Done
3. **Build the ranking logic first, offline**: `src/ranking/ranking.ts` plus tests. ✅ Done. This is the heart of the app — get it right before UI.
4. **Local-only prototype**: store data on-device (AsyncStorage/SQLite). Use it yourself for a week on real stuff.
5. **Add Supabase**: auth + sync so data survives a phone change.
6. **Polish + TestFlight**: share with 5–10 friends, watch what categories they actually create.
7. **Then** decide on social features.

---

## 5. Research notes: how Beli did it

**Verified**
- Beli was founded by Judy Thelen (CEO) and Eliot Frost (CTO), both Harvard Business School alumni. Development started in 2019; the company is based in New York. — [Wikipedia](https://en.wikipedia.org/wiki/Beli_(app)), [Preqin](https://www.preqin.com/data/profile/asset/beli-technologies--inc-/614361)
- The founders met in NYC and started it because they couldn't find reliable reviews or a good way to track restaurants they'd tried. — [BU profile](https://www.bu.edu/hospitality/profile/judy-thelen)
- Raised a $5.3M round in Nov 2023 (Goodwater Capital); total funding reported around $12M. — [CB Insights](https://www.cbinsights.com/company/beli/financials), [Caplight](https://www.caplight.com/company/beliapp)
- Roughly 80% of users are under 35; the app uses streaks and gamification. — [Wikipedia](https://en.wikipedia.org/wiki/Beli_(app))

**Unverified — treat with caution**
- That Beli is built with React Native / Expo and TypeScript (plausible, not confirmed).
- Hosting on AWS + Google Cloud and ~$160K/yr infra spend.
- "80 million user ratings."
- Monetization plans (OpenTable affiliate, premium, restaurant data).
- Specific podcast episode titles/dates (Womansplain Jan 2026, The Feed Feb 2024, InProd June 2023) — search for these before relying on them.
- MVP cost estimate of $10K–$40K if hiring out (reasonable ballpark, but not sourced).

---

## 6. Decisions

- **Sharing:** visibility is set per category only: a whole category is either public or private. Items inherit their category's setting.
- **Scores are per category.** A 9.2 in Hair products is only compared against other hair products.
- **Categories:** the app ships with default categories; users can create their own when nothing fits.
- **Places** are picked via Google Maps (Places autocomplete), which stores the place ID, address and coordinates.
- **Things** link to the website where they were purchased (product URL), with an optional price.

### Default categories (v1)
| Category | Kind |
|---|---|
| Hair salons | place (Google Maps) |
| Nail salons | place (Google Maps) |
| Hair styling products | thing (purchase link) |
| Hair shampoo | thing (purchase link) |
| Hair conditioner | thing (purchase link) |
| Lips | thing (purchase link) |
| Perfumes | thing (purchase link) |
| Jeans | thing (purchase link) |

## 7. Open questions
- Final name: "Upkeep" for now; check App Store and trademark availability before launch

### Name ideas
Ranky · Tierly · Pecking Order · Better Than · Faves · Thislist · Keepr · RankRoll
