# GhostHaul 🚚
### Predictive Dead Freight Eliminator — 100% Free-Tier Stack

> AI pre-books return truck legs 48–72h before they go empty.  
> Turns movement data into financial identity for 10M+ informal truck drivers.

---

## Quick Start (5 minutes)

```bash
git clone https://github.com/your-org/ghosthaul.git
cd ghosthaul
npm install
cp .env.local.example .env.local
# → Fill in API keys (see guide below)
npm run dev
# Open http://localhost:3000
```

The app runs with **demo data** even without API keys. Add keys one by one to unlock real features.

---

## API Keys Setup Guide

### 🟢 No Key Needed (works immediately)
| Service | What it does |
|---|---|
| Open-Meteo | Weather delay prediction for all routes |
| OSRM (public demo) | Route distance & duration |
| Nominatim / OSM | Geocoding Indian addresses |
| TensorFlow.js | LSTM model runs in-browser |

### 🔑 Free Keys to Get (10 minutes total)

---

#### 1. Supabase — Database + Auth + Realtime
**Free tier: 500MB DB, 2GB transfer, unlimited auth**

1. Go to **https://supabase.com** → Sign up (GitHub login works)
2. Click "New project" → give it a name → set a DB password → Create
3. Wait ~2 minutes for provisioning
4. Go to: **Project Settings → API**
5. Copy these into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...   ← Keep this secret!
   ```
6. Go to **SQL Editor → New Query** → paste contents of `supabase/schema.sql` → Run
7. Go to **Table Editor → trucks → Realtime** → enable toggle
8. Repeat for `matches` and `carbon_credits`

---

#### 2. OpenRouteService — Routing + ETA
**Free tier: 2,000 requests/day — plenty for hackathon**

1. Go to **https://openrouteservice.org/dev/#/signup**
2. Sign up with email → verify email
3. Dashboard → **Tokens** → **Create Token** → name it "ghosthaul"
4. Copy token into `.env.local`:
   ```
   ORS_API_KEY=5b3ce3597851110...
   ```

---

#### 3. Firebase — Push Notifications to Drivers
**Free tier: Unlimited push notifications**

1. Go to **https://console.firebase.google.com**
2. Click "Create a project" → name it "ghosthaul" → Continue
3. Disable Google Analytics (optional) → Create project
4. Click "Web" icon (`</>`) → Register app name "ghosthaul-web"
5. Copy the `firebaseConfig` values into `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=ghosthaul-xxxxx
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   ```
6. Go to **Project Settings → Cloud Messaging**
7. Copy "Server key" → `FIREBASE_SERVER_KEY=AAAA...` in `.env.local`
8. Under **Web Push certificates** → Generate key pair → copy it:
   ```
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=BNxxx...
   ```

---

## Project Structure

```
ghosthaul/
├── app/
│   ├── page.js              ← Dashboard (map + live stats)
│   ├── shipper/page.js      ← Shipper: pre-book return legs
│   ├── driver/page.js       ← Driver: credit score + earnings
│   ├── carbon/page.js       ← Carbon credits engine
│   ├── algorithm/page.js    ← AI pipeline simulation
│   └── api/
│       ├── predict/route.js ← POST: run LSTM prediction
│       ├── match/route.js   ← POST: confirm a booking
│       ├── trucks/route.js  ← GET/POST: truck registry
│       └── carbon/route.js  ← GET: carbon stats
├── components/
│   ├── Navbar.jsx           ← Navigation
│   ├── IndiaMap.jsx         ← Leaflet map (no key needed)
│   ├── LiveStats.jsx        ← Supabase realtime stats ticker
│   └── CreditScoreGauge.jsx ← Driver credit score arc
├── lib/
│   ├── supabase.js          ← DB helpers (🔑 Supabase keys)
│   ├── openroute.js         ← Routing API (🔑 ORS key)
│   ├── openmeteo.js         ← Weather API (✅ no key)
│   ├── predictor.js         ← TF.js LSTM model (✅ no key)
│   ├── carbon.js            ← Carbon credit calculator (✅ no key)
│   └── firebase.js          ← Push notifications (🔑 Firebase key)
├── supabase/
│   └── schema.sql           ← Run this in Supabase SQL editor
├── .env.local.example       ← Copy to .env.local, fill keys
└── README.md
```

---

## Tech Stack — 100% Free, Zero Paid Tier

| Layer | Technology | Free Limit |
|---|---|---|
| Frontend | Next.js 14 + Tailwind CSS | Open source |
| Database + Auth | Supabase | 500MB + 2GB transfer |
| Realtime sync | Supabase Realtime | Included in free |
| Maps | Leaflet.js + OpenStreetMap | Unlimited |
| Routing / ETA | OpenRouteService | 2,000 req/day |
| Route engine | OSRM (public demo server) | Unlimited |
| Weather | Open-Meteo | Unlimited |
| ML Prediction | TensorFlow.js (browser) | No server cost |
| Geocoding | Nominatim / OSM | 1 req/sec |
| Push notifications | Firebase FCM | Unlimited |
| Hosting | Vercel | Hobby free tier |
| Charts | Recharts | Open source |

---

## Deploying to Vercel (Free)

```bash
npm install -g vercel
vercel login
vercel
# Follow prompts — select "Next.js"
```

Then in Vercel Dashboard → Settings → Environment Variables → add all keys from `.env.local`

---

## API Reference

### `POST /api/predict`
Run AI empty-return prediction on a list of trucks.
```json
{
  "trucks": [
    { "id": 1, "current_city": "Chennai", "destination": "Mumbai", "available_tonnes": 6, "credit_score": 812 }
  ]
}
```
Returns ranked list with `empty_probability`, `carbon_saving`, `distance_km`.

### `POST /api/match`
Confirm a shipper booking.
```json
{ "truckId": 1, "shipperName": "ABC Logistics", "fromCity": "Chennai", "toCity": "Mumbai", "loadTonnes": 6, "agreedPrice": 10800 }
```
Returns match confirmation + carbon credit generated.

### `GET /api/trucks?status=available`
List trucks. Filter by status: `available`, `matched`, `predicting`.

### `GET /api/carbon`
Live carbon dashboard stats.

### `POST /api/carbon`
Estimate carbon credit for a hypothetical route.
```json
{ "fromCity": "Chennai", "toCity": "Mumbai", "loadTonnes": 8 }
```

---

## How GhostHaul Works

```
1. Truck departs Chennai → Mumbai (full load, outbound)
2. GhostHaul LSTM predicts: 74% chance of empty return in 18h
3. Return slot pre-auctioned to Mumbai shippers NOW
4. Shipper books the return leg before truck even unloads
5. Truck never goes empty — driver earns extra ₹14,200
6. 0.8 tonnes CO₂ saved → ₹1,032 carbon credit generated
7. 60% of credit (₹619) goes to driver as green bonus
8. Driver's 47 trips build a Freight Credit Score → ₹4.2L loan eligibility
```

---

## Hackathon Presentation Tips

- Open **Dashboard** tab first — live map + animating stats impress judges instantly
- Click **AI Engine** → hit **"Run now"** — live pipeline steps build confidence
- Click **Carbon Credits** → show the live CO₂ counter ticking up
- Open **Shipper** → click **Book** on a truck → show instant confirmation + savings
- Show **Driver** → credit score gauge + the stacked earnings chart tells the social impact story

---

Built for hackathons. Made with ♥ and zero paid APIs.
