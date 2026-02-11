# Calorie Critters

A macro/calorie tracker with a cute critter companion. Hit your nutrition goals and watch your critter grow!

## Tech Stack

- **Server**: Bun + Hono + Better Auth + Drizzle ORM (Postgres)
- **Web**: React + TanStack Router + TanStack Query + Tailwind CSS
- **Mobile**: Expo + expo-router (planned)

## Setup

```bash
# Start Postgres
docker compose up -d

# Install dependencies
bun install

# Run database migrations
bun run db:generate && bun run db:migrate

# Start dev servers (API + Web)
bun run dev
```

The API runs on `http://localhost:3000` and the web app on `http://localhost:5173`.

## Project Structure

```
packages/
  server/   — Hono API with Better Auth, Drizzle ORM
  web/      — React SPA with TanStack Router
  mobile/   — Expo app (scaffold)
```

## Roadmap

### Phase 1 — Foundation
- [x] Monorepo setup (Bun workspaces)
- [x] Auth (email/password sign up & sign in)
- [x] Postgres + Drizzle ORM
- [x] Docker Compose for local Postgres
- [x] Calorie-tracking database schema (user_profile, food_item, food_entry, daily_summary)
- [x] Server API routes (profile, foods, entries)
- [x] Web UI: landing page, dashboard, profile setup, food logging, food management

### Phase 2 — Core Experience
- [ ] Onboarding flow (height, weight, sex, activity level, goals)
- [ ] TDEE / macro target calculator
- [ ] Daily macro progress bars & summary
- [ ] Critter selection and basic display

### Phase 3 — Critter System
- [ ] Critter mood/animations tied to goal streaks
- [ ] Critter growth stages based on consistency
- [ ] Streak tracking and rewards

### Phase 4 — Smart Features
- [ ] Camera-based calorie estimation (AI)
- [ ] Food search with barcode scanning
- [ ] Meal templates and favorites

### Phase 5 — Mobile
- [ ] Expo mobile app with offline-first SQLite
- [ ] Sync between mobile and server
- [ ] Push notifications for logging reminders
