# Calorie Critters

A macro/calorie tracker with a cute critter companion. Hit your nutrition goals and watch your critter grow!

## Tech Stack

- **Server**: Bun + Hono + Better Auth + Drizzle ORM (Postgres)
- **Web**: React + TanStack Router + TanStack Query + Tailwind CSS
- **Mobile**: Expo + Expo Router (recommended next client; not yet scaffolded)

## Setup

```bash
# Copy local env defaults
cp .env.example .env

# Start Postgres + Redis
docker compose up -d

# Install dependencies
bun install

# Run database migrations
bun run db:generate && bun run db:migrate

# Start dev servers (API + Web)
bun run dev
```

The API runs on `http://localhost:3000` and the web app on `http://localhost:5173`.

Local Postgres is published on `localhost:15433` and Redis on `localhost:6380` so this app can run alongside other cloned starters without sharing the same local services.

## Open Food Facts Integration

The web app can import foods from Open Food Facts via the `/foods` page.

Set a custom User-Agent in `packages/server/.env`:

```bash
OPEN_FOOD_FACTS_BASE_URL=https://world.openfoodfacts.org
OPEN_FOOD_FACTS_USER_AGENT=CalorieCritters/0.1.0 (you@example.com)
OPEN_FOOD_FACTS_TIMEOUT_MS=8000
OPEN_FOOD_FACTS_CACHE_TTL_MS=86400000
OPEN_FOOD_FACTS_CACHE_MAX_ENTRIES=500
REDIS_URL=redis://localhost:6380
```

Why this matters:

- Open Food Facts asks API clients to identify themselves via `User-Agent`.
- Search is debounced on the web and server-cached with memory + Redis (shared cache across users/instances).

## Project Structure

```
packages/
  server/   — Hono API with Better Auth, Drizzle ORM
  web/      — React SPA with TanStack Router
  shared/   — Validation schemas, domain types, nutrition math, and pet constants
```

## Production setup and recommended services

The app can run locally without paid integrations. For a production launch, add services in this order and keep every secret in the host's encrypted environment settings—never in `VITE_*` variables or the repository.

| Priority | Service / credential | Purpose | Cost and privacy notes |
| --- | --- | --- | --- |
| Required | Production Postgres, `DATABASE_URL` | Durable accounts, profiles, food logs, and critters | Use encrypted connections, automated backups, least-privilege credentials, and a written retention/deletion policy. Nutrition history is sensitive even when it is not regulated health data. |
| Required | `BETTER_AUTH_SECRET` and canonical API/web origins | Secure session signing and correct cross-origin cookies | Generate a long random production-only secret. Use HTTPS and explicitly list production origins. Rotate the secret through the hosting provider if exposed. |
| Recommended when running multiple server instances | Managed Redis, `REDIS_URL` | Shared Open Food Facts cache across instances | The existing in-memory cache is enough for a small single-instance launch. Do not store user profiles or meal logs in this cache. |
| Required for account recovery | [Resend](https://resend.com/docs/examples) `RESEND_API_KEY`, verified sending domain, and From address | Email verification, password reset, and security notices through Better Auth | Start with a sending-only key. Email addresses are personal data; do not use transactional recipients for marketing without consent. |
| Recommended | [USDA FoodData Central](https://fdc.nal.usda.gov/api-guide/) `USDA_FDC_API_KEY` | Higher-quality generic ingredient and nutrient lookup alongside Open Food Facts | The API and data are free/public-domain; the default documented limit is 1,000 requests/hour/IP. Keep the key server-side and cache normalized results. |
| Recommended | [Sentry](https://docs.sentry.io/platforms/javascript/) DSNs for web and server | Crash reporting, slow-request traces, and release health | Has a limited free tier, then usage pricing. Scrub request bodies, cookies, email, food notes, and search terms before sending events. |
| Recommended after beta | [PostHog](https://posthog.com/docs/libraries/react) project token and host | Measure onboarding completion, logging success, retention, and feature flags | The browser token is intentionally public, but analytics still require a consent/retention decision. Disable input capture and mask nutrition screens in session replay. Prefer coarse events over raw food names. |
| Optional | Google and Apple OAuth client credentials | Faster sign-in on web and mobile | Adds provider review/configuration and account-linking work. Request only identity scopes. Apple sign-in is generally expected when equivalent third-party social login is offered on iOS. |
| Optional, only with clear disclosure | AI provider key for meal-photo suggestions | Suggest foods/portions from a photo before the user confirms the log | Usage-priced and inherently approximate. Obtain explicit consent, strip image metadata, avoid retaining photos, show the estimate source, and require confirmation. Do not present AI calorie estimates as medical advice. |
| Optional for paid mobile plans | [RevenueCat](https://www.revenuecat.com/docs/getting-started/installation/expo) public app keys plus App Store / Play products | Cross-platform subscription entitlements | Free to start, then usage/revenue-based plans. Public SDK keys are not secrets, but webhook secrets are. Add only after the free core loop has retention. |

Open Food Facts does not require an API key; keep the identifying `OPEN_FOOD_FACTS_USER_AGENT` and cache already implemented here. Barcode scanning also does not need a new food API: a mobile camera can read a GTIN and the server can fetch the matching Open Food Facts product. Keep a manual fallback because community data can be missing or inaccurate.

Before public launch, also add a privacy policy, terms, in-app account/data deletion, database backups with restore testing, structured rate limits on auth and external-food endpoints, and a small suite of API integration tests.

## Mobile path

Build mobile as a new `packages/mobile` Expo Router app rather than wrapping the website. Reuse `@calorie-critters/shared` for schemas, goal math, meal types, and critter rules, and reuse the existing Hono API; keep the React Native screens native and touch-first.

1. Ship an online-first MVP with Better Auth's [Expo integration](https://better-auth.com/docs/integrations/expo), credentials in platform secure storage, dashboard, search, log, history, goals, and critter.
2. Add barcode capture with `expo-camera` and local meal reminders. Remote reminders later require an Expo/EAS project, Android FCM credentials, and an Apple Developer account/APNs credentials; Expo's [push setup guide](https://docs.expo.dev/push-notifications/push-notifications-setup/) covers both platforms.
3. Add SQLite only after the online loop is stable. Cache recent foods and queue create/update/delete operations with client-generated idempotency keys, retry state, and visible sync status. An offline-first database from day one would add conflict and auth complexity before the product proves it needs it.
4. Use EAS development builds, internal distribution, and TestFlight/Play testing before store submission. Plan for store privacy disclosures, account deletion, deep links for email verification, and accessible dynamic type.

## Roadmap

### Phase 1 — Foundation

- [x] Monorepo setup (Bun workspaces)
- [x] Auth (email/password sign up & sign in)
- [x] Postgres + Drizzle ORM
- [x] Docker Compose for local Postgres + Redis
- [x] Calorie-tracking database schema (user_profile, food_item, food_entry, daily_summary)
- [x] Server API routes (profile, foods, entries)
- [x] Web UI: landing page, dashboard, profile setup, food logging, food management

### Phase 2 — Core Experience

- [x] Onboarding flow (height, weight, sex, activity level, goals)
- [x] TDEE / macro target calculator
- [x] Daily macro progress, today feed, and editable goals
- [x] Critter selection, moods, and interactions
- [x] Configurable macro goals
- [ ] Edit serving size and meal type after logging
- [ ] Favorites and reusable meal templates
- [ ] Weekly trends and consistency insights

### Phase 3 — Critter System

- [ ] Tie critter mood and growth to nutrition consistency
- [ ] Critter growth stages based on consistency
- [ ] Gentle streaks and non-punitive rewards

### Phase 4 — Smart Features

- [ ] USDA FoodData Central fallback
- [ ] Barcode scanning
- [ ] Camera-based meal suggestions with user confirmation
- [ ] Observability, analytics consent, and email recovery

### Phase 5 — Mobile

- [ ] Expo Router online-first app
- [ ] Secure mobile auth and deep links
- [ ] Barcode camera and local reminders
- [ ] Sync between mobile and server
- [ ] Offline queue and SQLite cache
- [ ] Optional remote push notifications
