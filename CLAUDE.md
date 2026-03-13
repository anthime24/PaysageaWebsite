# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (hot reload)
npm run build     # Production build → dist/
npm run lint      # ESLint (zero warnings policy)
npm run preview   # Preview production build locally
```

There are no tests configured.

The backend geo service runs separately:
```bash
cd backend_geo && node server.js   # Starts on port 3001
```
Frontend expects it at `VITE_CLIMATE_API_URL` (defaults to `http://localhost:3001`).

## Architecture

**Paysagea** is an AI garden design POC. Users upload a garden photo, select style preferences, watch a simulated analysis, and receive a transformed garden image with botanical recommendations.

### Three-page linear workflow

```
/upload → /processing → /result/:projectId
```

- **UploadPage** — image upload + design filter selection (style, maintenance level, atmosphere, description chips)
- **ProcessingPage** — 4-step animated analysis simulation (~10s hardcoded timers), then navigates to result
- **ResultPage** — before/after toggle, edit studio modal with plant library, botanical metrics, cost estimate

### State management (Zustand)

Single store in [src/store/useStore.js](src/store/useStore.js):
- `image` / `previewUrl` — user-uploaded garden photo
- `filters` — all design preferences (style, maintenance, elements, atmosphere, description, appliedSuggestions)
- `projectContext` — geolocation + climate data (set by AddressSearch, triggers `buildPlantFilter()`)
- `plantFilter` — derived botanical constraints (USDA zone, sun exposure, etc.)
- `analysisResult` / `projectId` — backend output placeholders

### Data flow for geolocation

`AddressSearch` component → `useClimate` hook → backend geo API → `setProjectContext()` → `buildPlantFilter()` in [src/utils/buildPlantFilter.js](src/utils/buildPlantFilter.js) → stored in `plantFilter`

### Styling

Tailwind CSS with custom theme defined in [tailwind.config.js](tailwind.config.js):
- `nature` (#7b9872) — primary green
- `structure` (#4b463e) — text/neutral brown
- `action` (#b26c2e) — CTA orange
- `bg-light` (#fcfcfc) — page background

Global animations (`scan-line`, `mesh-gradient`, `progress-ind`) defined in [src/index.css](src/index.css). Reusable utility classes `.glass-panel` and `.premium-button` are defined there too.

No CSS Modules or styled-components — pure Tailwind + CSS layers.

### Backend geo service (`backend_geo/`)

Node.js/Express proxy providing:
- `GET /geocode/search?q=` — Google Places autocomplete
- `GET /geocode/resolve?place_id=` — resolve → lat/lon
- `GET /climate?lat=&lon=` — real-time weather (OpenMeteo)
- `GET /climate/annual?lat=&lon=` — annual normals (hardiness zone, frost days, rainfall, sunshine hours)

### Current POC limitations

- Image generation is a placeholder (static Unsplash URL in ResultPage)
- ProcessingPage uses hardcoded timers, no real backend calls
- Edit studio modal is UI-only with no persistence
