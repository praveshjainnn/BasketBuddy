<<<<<<< HEAD
# BasketBuddy: Smart Grocery Deals, Lists and Set-Theory Comparisons

## Abstract

BasketBuddy is a full‑stack web application that helps households minimize grocery spend and plan collaboratively. It aggregates seller‑submitted perishable items, surfaces dynamic discounts based on time‑to‑expiry, and lets users add discounted items directly into personal or family lists. On top of lists, BasketBuddy implements discrete‑mathematics set operations (union, intersection, differences, complement, cartesian product) to compare lists, quantify overlaps, and guide cost‑aware decisions. The system combines a Python/Flask backend over a lightweight SQLite store for perishable items, and a Next.js/React frontend for a rich, responsive UI with Firebase authentication and optional Firestore sync. Empirically, the approach reduces decision friction and highlights savings opportunities while preserving explainability through transparent formulas for pricing, discount computation, and set operations.

## High‑Level Overview

- **Deals ingestion (Admin/Sellers):** Admin/seller routes write perishable items into a SQLite database (`perishable_items.db`). Each item stores base price, discounted price, expiry date, category, seller, and quantity.
- **Dynamic discounting:** Discounts are computed from stored prices and exposed via API with derived fields like days‑to‑expiry and discount percentage.
- **User browsing and carting:** Users browse “Perishable Deals,” filter/sort items, and add to cart; the app creates/updates a dedicated list (e.g., "Deals Cart").
- **Lists & collaboration:** Users manage multiple lists, optionally share among family members, and sync to Firestore when authenticated.
- **Set‑theory analysis:** Compare lists using exact string‑normalized names to compute union, intersection, differences, complement, and cartesian product, with summaries and visualizations.

## Core Features

- Perishable deals with search, filters (category, seller, min‑discount), and sorting (highest discount, lowest price, expiring soon)
- Add‑to‑Cart from deals → auto‑creates/updates a "Deals Cart" in Lists
- Multi‑list manager with inline item add/remove, colors, share‑with members
- Set operations across lists (U, S): union, intersection, difference, symmetric difference, complement, cartesian product
- Savings indicators and expiring‑soon cues
- Firebase auth and optional Firestore persistence (localStorage fallback when logged out)

## Architecture

- **Frontend:** Next.js (App Router) + React + TypeScript + Tailwind/ShadCN UI. Key components live in `components/` and feature‑rich panels live under `app/page.tsx` tabs.
- **Backend:** Python/Flask (`backend/app.py`, `routes/public_routes.py`, `routes/seller_routes.py`) with a thin SQLite data layer (`backend/database.py`).
- **Data:** SQLite for perishable items; optional Google Firestore for user lists post‑login.

### Backend APIs (selected)

- `GET /api/perishables` — all items with derived fields
- `GET /api/perishables/public` — active, non‑expired items for users
- `GET /api/perishables/expiring?days=k` — items expiring within k days
- `GET /api/perishables/<id>` — item by id
- `POST /api/perishables` — create item (admin/seller side)

## Methodology

### 1) Perishable Discount Model

- Discount percentage:

\[ \text{discount\_\%} = \left( \frac{\text{base\_price} - \text{discounted\_price}}{\text{base\_price}} \right) \times 100 \]

- Days‑to‑expiry:

\[ \text{days\_to\_expiry} = \max\{0, \lceil (\text{expiry\_date} - \text{today}) \rceil \} \]

- Savings per item:

\[ \text{savings} = \text{base\_price} - \text{discounted\_price} \]

- Heuristic urgency coloring (UI):
  - days ≤ 1 → critical (red)
  - days ≤ 2 → high (orange)
  - days ≤ 3 → medium (yellow)
  - otherwise low (green)

### 2) Deals Filtering & Sorting

Given item set \(D\):

- Search filter: keep items whose lowercase name contains the query substring.
- Category filter: \( D' = \{ x \in D : x.category = c \}\) if \(c \neq \text{"all"}\).
- Sort key options:
  - Highest Discount: descending \(\text{discount\_%}\)
  - Lowest Price: ascending \(\text{discounted\_price}\)
  - Expiring Soon: ascending \(\text{days\_to\_expiry}\)

### 3) List Data Model

Each list \(L\) contains items \(i = (\text{name}, \text{category}, \text{quantity}, \text{unit}, \text{price})\). Local state persists to localStorage and optionally syncs to Firestore (timestamps serialized to ISO strings).

### 4) Set‑Theory Operations on Lists

Let \(U\) and \(S\) be two lists (or, in general, a family of lists). Item identity uses a normalized key \(k(i) = \text{lowercase}(\text{name}).\)

1. **Union** (all unique items):
   \[ U \cup S = \{ x : x \in U \ \text{or} \ x \in S \} \]
   Implementation: combine by key; aggregate counts and sources.

2. **Intersection** (common items):
   \[ U \cap S = \{ x : x \in U \ \text{and} \ x \in S \} \]
   For \(n\) lists, keep items whose key appears in all \(n\) sets.

3. **Difference** (items in first but not others):
   \[ U - S = \{ x : x \in U \ \text{and} \ x \notin S \} \]

4. **Symmetric Difference** (in either but not both):
   \[ U \triangle S = (U - S) \cup (S - U) \]

5. **Complement** (relative to a universe \(\Omega\) of all items across selected lists):
   \[ U^c = \Omega - U \]

6. **Cartesian Product** (pairwise combinations):
   \[ U \times S = \{ (u, s) : u \in U, s \in S \} \]
   Used to explore bundle ideas (e.g., recipe or meal planning combinations), limited in UI to prevent explosion.

### 5) Savings Analytics

- Total potential savings if replacing a user price with seller price on intersecting items:

\[ \text{total\_savings} = \sum_{x \in (U \cap S)} \max\big(0, \text{user\_price}(x) - \text{seller\_price}(x)\big) \]

- Average discount across a filtered set \(D'\):

\[ \text{avg\_discount} = \frac{1}{|D'|} \sum_{x \in D'} \text{discount\_%}(x) \]

## How “Add to Cart” Works

1) In the Deals panel, users click “Add to Cart.”
2) The app creates/locates a list named "Deals Cart" and appends the selected item as a normalized grocery item (name, category, quantity, unit, price, timestamps). 
3) The UI switches to the Lists tab and highlights the updated list; subsequent additions append to the same list.

## Running the App

1. Backend (Flask):
   - Windows: double‑click `start_backend.bat` (or run `python backend/app.py`).
2. Frontend (Next.js):
   - Windows: double‑click `start_frontend.bat` (or run `npm install && npm run dev` inside `BasketBuddy/`).

Optional: Configure Firebase (see `lib/firebase.ts`) to enable login and Firestore sync for lists.

## Limitations & Future Work

- Name normalization can be improved with fuzzy matching (edit distance, embeddings) to align semantically similar items across lists/sellers.
- Multi‑seller price comparison and store‑route optimization are natural extensions.
- Privacy‑preserving analytics and on‑device models for recommendations.

## Citation‑Style Notes (for your paper)

- Formal set‑operation definitions appear above; we recommend defining your universe \(\Omega\) precisely as the union of all items across the selected lists under comparison.
- Empirical evaluation can report (i) time saved in planning, (ii) monetary savings from intersections where seller prices are lower, and (iii) overlap metrics such as Jaccard similarity: \( J(U,S)=\frac{|U\cap S|}{|U\cup S|} \).


=======
# BasketBuddy
>>>>>>> c81525357f1b4d4fdf244ac7983c166637f78dd2
