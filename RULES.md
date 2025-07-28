# Risk Assessment Application - Development Rules & Context

## Project Overview
- **Name**: Earth Risk Dashboard (working title)
- **Purpose**: Provide everyday people one centralized location to check real-time safety status across all major environmental and disaster risks
- **Target Users**: General public seeking location-based hazard information

## Core Features
### MVP (6-week timeline)
1. **Search**: Address/ZIP code lookup
2. **Real-time Data**: 
   - Wildfires (NASA FIRMS)
   - Air Quality (EPA AirNow)
   - Weather Alerts (NOAA/NWS)
   - Flood Zones (FEMA)
   - Earthquakes (USGS)
   - Water Quality (EPA ECHO)
3. **Visualization**: Interactive map with hazard overlays
4. **Summary**: "Today's Risk" card with aggregated assessment
5. **User Accounts**: Save up to 3 favorite locations

### Future Phases
- Push/email/SMS notifications
- Long-term risk scores
- Preparedness checklists
- Insurance guidance
- API & embeddable widgets
- Additional hazards (volcanoes, heat waves, boil-water alerts, swim bans, burn bans)

## Technical Stack
### Frontend
- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL
- **CDN**: Cloudflare Edge

### Backend
- **Functions**: Serverless (Vercel Functions/Lambda)
- **Database**: Neon (Postgres)
- **Cache**: Redis/Upstash (ZIP hazard snapshots, 30-60min TTL)
- **Auth**: Supabase or Clerk (Phase 2)
- **Notifications**: Twilio/Postmark/Resend (Phase 2)

### Data Sources
- NASA FIRMS API (wildfires)
- EPA AirNow API (air quality)
- NOAA/NWS API (weather alerts)
- FEMA Flood GIS (flood zones)
- USGS (earthquakes)
- EPA ECHO (water quality)
- State datasets (swim bans, burn bans - future)

## Development Principles
1. **Performance**: <3 second load time for search → risk summary
2. **Coverage**: Minimum 4 hazard types with current data
3. **Accessibility**: Mobile-responsive, consumer-friendly design
4. **Simplicity**: No auth required for basic lookup (MVP)
5. **Scalability**: Architecture supports growth from MVP to full platform

## Key Endpoints
- `/hazards?zip=` - Main API endpoint for hazard data
- Auth endpoints (user management)
- Cron ingesters (scheduled data fetching)

## Data Flow
1. User enters ZIP/address
2. Frontend queries backend API
3. Backend checks Redis cache
4. If cache miss, queries external APIs
5. Aggregates hazard data
6. Returns unified risk assessment
7. Frontend displays on map with summary card

## Success Metrics
- Load time under 3 seconds
- 4+ hazard types covered
- Mobile and desktop compatible
- 10+ pilot users validate clarity and usefulness
- Production deployment achieved

## MVP Timeline
- Week 1: Core UI & geo lookup
- Week 2: Wildfire & AQI integration
- Week 3: Heat & NWS alerts
- Week 4: Flood zones & earthquakes
- Week 5: Water quality & summary
- Week 6: User accounts & deployment

## Important Notes
- Start with read-only map, evolve to interactive platform
- Focus on consumer-friendly presentation
- Prioritize real-time accuracy
- Design for future API/widget distribution
- Consider branding after MVP validation

## Repository Structure
```
risk-dashboard/
├── apps/               # Application workspaces
│   └── web/           # Next.js frontend + API routes
├── packages/          # Shared packages
│   ├── db/           # Neon Prisma schema + migrations
│   ├── core-api/     # Hazard fetch + caching logic
│   └── ui/           # Design system components
├── infra/            # Infrastructure as code
├── scripts/          # One-off CLI helpers
└── .github/          # CI workflows
```

## Naming Conventions

### File Naming
- **API Fetchers**: `get[Service]Data.ts` (e.g., `getAirNowData.ts`, `getFIRMSData.ts`)
- **Transformers**: `normalize[Service].ts` (e.g., `normalizeAirNow.ts`)
- **Cron Jobs**: `[frequency]-[task].ts` (e.g., `hourly-fire.ts`, `daily-water.ts`)
- **Components**: PascalCase (e.g., `HazardMap.tsx`, `RiskSummaryCard.tsx`)
- **Hooks**: `use[Feature].ts` (e.g., `useFetchHazards.ts`, `useGeolocation.ts`)
- **Utils**: camelCase (e.g., `mapHelpers.ts`, `dateFormatters.ts`)

### Code Style
- **TypeScript**: Strict mode enabled, explicit types preferred
- **React**: Functional components with hooks
- **API Routes**: `/api/[resource]/[action]` (e.g., `/api/hazards/by-zip`)
- **Database**: Snake_case for tables/columns (e.g., `zip_codes`, `created_at`)
- **Environment Variables**: SCREAMING_SNAKE_CASE (e.g., `NASA_FIRMS_API_KEY`)

### Import Paths
- `@/*` - Web app internals
- `@core/*` - Core API package
- `@db/*` - Database package
- `@ui/*` - UI components package

### Git Conventions
- **Branches**: `feature/[description]`, `fix/[issue]`, `chore/[task]`
- **Commits**: Conventional commits (feat:, fix:, docs:, chore:)
- **PRs**: Include issue number, descriptive title

### Testing
- **Unit Tests**: `[file].test.ts` alongside source
- **Integration**: `__tests__/[feature].integration.ts`
- **E2E**: `e2e/[user-flow].spec.ts`