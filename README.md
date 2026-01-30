# Nicotine Tracker

Track your nicotine intake, visualize costs, and work toward quitting goals.

## Tech Stack

- **Monorepo**: Bun workspaces
- **Backend**: Hono, Drizzle ORM, PostgreSQL, Better Auth, Stripe
- **Frontend**: React, TanStack Router, TanStack Query, Tailwind CSS
- **Mobile**: Expo (React Native), Expo Router
- **Type Safety**: Hono RPC for end-to-end typed API calls

## Getting Started

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL, BETTER_AUTH_SECRET, STRIPE keys

# Run database migrations
bun run db:generate
bun run db:migrate

# Start development servers
bun run dev

# Start Expo mobile app (optional)
bun run dev:mobile
```

## Project Structure

```
packages/
├── server/           # Hono API server
│   └── src/
│       ├── auth/     # Authentication (Better Auth)
│       ├── entries/  # Nicotine entry logging
│       ├── products/ # Saved product presets
│       ├── goals/    # Quitting goals
│       ├── billing/  # Stripe subscriptions
│       ├── common/   # Logger, CORS, utilities
│       └── db/       # Drizzle schema & client
├── app/              # React frontend
│   └── src/
│       ├── routes/   # TanStack Router pages
│       └── lib/      # API client, auth hooks
├── mobile/           # Expo (React Native) app
├── api-client/       # Shared Hono RPC client
└── shared/           # Shared types & constants
```

---

## MVP Features

### Nicotine Input and Tracking
- [x] Log entries: cigarettes, vapes, zyns, pouches, gum, patches
- [x] Track nicotine mg per entry
- [x] Calculate bloodstream levels (2-hour half-life model)
- [x] View recent entries and 24h stats
- [ ] Quick-add from saved product presets
- [ ] Bulk import historical data

### Product Presets
- [x] Save your usual products (brand, type, nicotine mg, cost)
- [x] Set default products per type
- [ ] Popular products database (community-sourced)
- [ ] Auto-suggest nicotine content by product name

### Cost Tracking
- [x] Track cost per entry
- [x] Daily/weekly/monthly spending stats
- [ ] Cost projections (if you continue at this rate...)
- [ ] Money saved since reducing/quitting
- [ ] Currency support (USD, GBP, EUR, etc.)

### Quitting Goals
- [x] Daily limit goals (max mg per day)
- [x] Reduction goals (reduce by X% by date)
- [x] Quit date goals (countdown to zero)
- [x] Progress tracking per goal
- [ ] Milestone celebrations
- [ ] Goal suggestions based on usage patterns

### Sleep Impact
- [ ] Track sleep quality alongside nicotine intake
- [ ] Correlate evening nicotine levels with sleep
- [ ] Recommendations for cutoff times
- [ ] Sleep score based on usage

### Analytics & Insights
- [ ] Weekly/monthly reports
- [ ] Trends over time (charts)
- [ ] Percentile comparison (anonymous, opt-in)
- [ ] Export data (CSV, JSON)

### Social & Accountability
- [ ] Share progress (optional)
- [ ] Accountability partners
- [ ] Community challenges

---

## API Endpoints

### Auth (Better Auth)
- `POST /api/auth/sign-up/email` - Create account
- `POST /api/auth/sign-in/email` - Sign in
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session

### Entries
- `GET /api/entries` - List entries
- `POST /api/entries` - Create entry
- `DELETE /api/entries/:id` - Delete entry
- `GET /api/entries/stats` - Bloodstream stats (24h)
- `GET /api/entries/cost-stats` - Spending stats

### Products
- `GET /api/products` - List saved products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Goals
- `GET /api/goals` - List all goals
- `GET /api/goals/active` - List active goals
- `GET /api/goals/:id/progress` - Get goal progress
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Billing
- `POST /api/billing/create-checkout-session` - Start subscription
- `POST /api/billing/create-portal-session` - Manage subscription
