# Earth Risk Dashboard

Real-time environmental and disaster risk assessment platform.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (installed globally)
- PostgreSQL database (using Neon)

### Installation
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and database URL

# Generate Prisma client
cd packages/db && pnpm generate

# Run database migrations
pnpm migrate
```

### Development
```bash
# Start all services
pnpm dev

# The web app will be available at http://localhost:3000
```

## 📁 Project Structure
```
risk-dashboard/
├── apps/
│   └── web/              # Next.js frontend application
├── packages/
│   ├── core-api/         # API logic and data fetching
│   ├── db/              # Database schema and client
│   └── ui/              # Shared UI components
├── scripts/             # Utility scripts
└── infra/              # Infrastructure configuration
```

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Maps**: Mapbox GL
- **Database**: Neon (PostgreSQL), Prisma ORM
- **Styling**: Tailwind CSS + shadcn/ui components
- **Monorepo**: Turborepo, pnpm workspaces

## 📋 Available Scripts
- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript checks
- `pnpm test` - Run tests

## 🔑 Required API Keys
Configure these in your `.env` file:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NASA_FIRMS_API_KEY` - For wildfire data
- `EPA_AIRNOW_API_KEY` - For air quality data
- `MAPBOX_PUBLIC_TOKEN` - For map display

## 📊 Data Sources
- NASA FIRMS - Active fire data
- EPA AirNow - Air quality index
- NOAA/NWS - Weather alerts
- FEMA - Flood zones
- USGS - Earthquake data
- EPA ECHO - Water quality