<div align="center">

<!-- SVG Logo -->
<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Polaris Gate logo">
  <circle cx="36" cy="36" r="34" stroke="#01696f" stroke-width="2.5" fill="none"/>
  <!-- Latitude lines -->
  <ellipse cx="36" cy="36" rx="34" ry="14" stroke="#01696f" stroke-width="1.2" fill="none" opacity="0.5"/>
  <!-- Vertical meridian -->
  <line x1="36" y1="2" x2="36" y2="70" stroke="#01696f" stroke-width="1.2" opacity="0.5"/>
  <!-- Equator -->
  <line x1="2" y1="36" x2="70" y2="36" stroke="#01696f" stroke-width="1.2" opacity="0.5"/>
  <!-- Flight path arc -->
  <path d="M18 48 Q36 10 54 28" stroke="#01696f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- Origin dot -->
  <circle cx="18" cy="48" r="3.5" fill="#01696f"/>
  <!-- Destination dot -->
  <circle cx="54" cy="28" r="3.5" fill="#01696f"/>
  <!-- Arrowhead -->
  <path d="M47 22 L54 28 L46 30" stroke="#01696f" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

# Polaris Gate

**Explore immigration pathways to any country — visualized on an interactive 3D globe.**

Enter your profile, select a destination, and our AI agent surfaces the realistic PR and visa routes available to you — timelines, requirements, and official resources included.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![Convex](https://img.shields.io/badge/Convex-DB%20%2B%20Auth-ee4e2c?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDJMMiAxOS41aDIwTDEyIDJ6Ii8+PC9zdmc+)](https://convex.dev)
[![Mapbox GL JS](https://img.shields.io/badge/Mapbox%20GL%20JS-Globe-4264fb?logo=mapbox)](https://docs.mapbox.com/mapbox-gl-js/guides/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-01696f.svg)](LICENSE)

[Live Demo](#) · [Report a Bug](issues) · [Request a Feature](issues)

</div>

---

## Overview

Polaris Gate is a side project that helps people understand their immigration options. You provide a simple profile — your citizenship, age, education, occupation, savings, and goals — and the app:

- **Colors the globe** by how well each country matches your profile.
- **Shows relevant pathways** (skilled worker, study-to-PR, investor, family) when you click any country.
- **Uses an AI agent** to retrieve, extract, and summarize routes from official government sources.
- **Links you to official pages** so you can verify everything and take the next step.

> ⚠️ **Disclaimer**: Polaris Gate is a research and exploration tool, not legal advice. Always verify information with official government sources and consult a licensed immigration advisor before making decisions.

---

## Features

- 🌍 **3D Interactive Globe** — Mapbox GL JS with globe projection; countries colored by fit score.
- 🤖 **AI Agent Research** — Retrieval-augmented agent fetches and structures official immigration routes.
- 🎯 **Profile-Based Scoring** — Factors in citizenship, occupation, savings, language, time horizon, and goals.
- 📋 **Pathway Detail Panels** — Per-country route cards: timeline, prerequisites, language requirements, official links.
- 🔍 **Country Comparison** — Pin up to 3 countries and compare side by side.
- 🔒 **Auth with Convex** — Optional user accounts to save your profile and pinned countries.
- 🌗 **Light / Dark Mode** — System-preference aware with a manual toggle.

---

## Tech Stack

| Layer                | Technology                                                   |
| -------------------- | ------------------------------------------------------------ |
| Framework            | [Next.js](https://nextjs.org) (App Router, TypeScript)       |
| 3D Globe             | [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides/) |
| Database & Real-time | [Convex](https://convex.dev)                                 |
| Auth                 | [Convex Auth](https://labs.convex.dev/auth)                  |
| AI / Agents          | Mistral AI + web retrieval (Firecrawl / Exa)                 |

---

## Getting Started

### Prerequisites

- **Node.js** `>=20.x`
- **npm** `>=10.x`
- A **Mapbox** account and public access token — [get one free](https://account.mapbox.com/)
- A **Convex** account — [sign up free](https://dashboard.convex.dev/)
- An **Mistral AI** API key — [console.mistral.ai](https://console.mistral.ai/)
- _(Optional)_ An **Firecrawl** or **Exa** API key for the agent's web-retrieval step

---

### Quick Start

If you just cloned this codebase, run:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

---

### First-Time Setup

#### 1. Set up Convex Auth

```bash
npm install @convex-dev/auth @auth/core@0.37.0
npx @convex-dev/auth
```

Follow the prompts to link your Convex project and configure the auth provider. This generates your `.env.local` with `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` automatically.

#### 2. Configure environment variables

Copy the example env file:

```bash
cp .env.example .env.local
```

Then fill in your keys:

```env
# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.ey...

# Convex (auto-generated by npx @convex-dev/auth)
CONVEX_DEPLOYMENT=dev:your-project-name
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Mistral AI
MISTRAL_API_KEY=...      # https://console.mistral.ai/

# Web retrieval (pick one or both)
FIRECRAWL_API_KEY=...   # https://firecrawl.dev
EXA_API_KEY=...          # https://exa.ai
```

#### 3. Push the Convex schema

```bash
npx convex dev
```

This starts the Convex dev server and pushes your schema and functions to your deployment. Keep it running alongside `npm run dev` in a separate terminal.

---

## Project Structure

```
Polaris Gate/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth routes (sign-in, sign-up)
│   ├── api/
│   │   ├── routes/search/      # POST /api/routes/search — agent endpoint
│   │   └── score/              # POST /api/score — profile → country scores
│   ├── globe/                  # Globe page
│   └── layout.tsx
│
├── components/
│   ├── globe/
│   │   ├── GlobeMap.tsx        # Mapbox GL JS 3D globe
│   │   ├── CountryLayer.tsx    # fill-color expression + click handler
│   │   └── Tooltip.tsx
│   ├── panels/
│   │   ├── ProfileForm.tsx     # User profile input
│   │   ├── CountryPanel.tsx    # Route detail drawer
│   │   └── ComparePanel.tsx    # Side-by-side country comparison
│   └── ui/                     # Shared UI primitives (Button, Badge, etc.)
│
├── convex/
│   ├── schema.ts               # Convex DB schema
│   ├── routes.ts               # Convex queries/mutations for route data
│   ├── savedProfiles.ts        # User profile persistence
│   └── auth.config.ts          # Convex Auth configuration
│
├── lib/
│   ├── agent/
│   │   ├── retriever.ts        # Web search via Exa/Serper
│   │   ├── extractor.ts        # LLM extraction → route schema
│   │   └── scorer.ts           # Profile × route → fit score
│   ├── scoring.ts              # Country-level score aggregation
│   └── types.ts                # Shared TypeScript types (Route, Profile, etc.)
│
├── data/
│   └── seed-routes.json        # Curated seed routes for v1 destinations
│
├── public/
│   └── geo/
│       └── countries.geojson   # Country polygons for Mapbox layer
│
├── .env.example
└── README.md
```

---

## How the Agent Works

1. **Profile submitted** → `POST /api/routes/search` receives the user profile and target country (or "all").
2. **Retriever** queries official immigration sources using targeted queries like `site:.gov canada skilled worker permanent residence requirements 2026`.
3. **Extractor** passes retrieved pages to the LLM, which outputs a structured `Route` object: `{ route_type, pr_time_estimate_years, language_requirement, min_savings, family_friendly, official_links[] }`.
4. **Scorer** applies the profile-vs-route scoring function and returns per-country scores.
5. **Globe updates** its `fill-color` expression from the returned score map.

> Routes are refreshed **offline nightly** and cached in Convex — individual user requests are fast lookups, not live scrapes.

---

## Supported Destinations (v1)

| Country           | Routes Covered                                               |
| ----------------- | ------------------------------------------------------------ |
| 🇨🇦 Canada         | Express Entry, PNP, Study → PGWP → PR                        |
| 🇦🇺 Australia      | Skilled Independent (189), State Nomination (190)            |
| 🇳🇿 New Zealand    | Skilled Migrant, Accredited Employer Work Visa               |
| 🇮🇪 Ireland        | Critical Skills Employment Permit → Stamp 4                  |
| 🇬🇧 United Kingdom | Skilled Worker visa → ILR                                    |
| 🇩🇪 Germany        | Skilled Immigration Act (Fachkräfte), Opportunity Card       |
| 🇺🇸 United States  | H-1B → EB-2/EB-3, EB-5 (high-level overview)                 |
| 🇲🇹 Malta          | Key Employee Initiative, Malta Permanent Residence Programme |

More destinations are planned for v2.

---

## Roadmap

- [ ] **v1** — Globe + profile form + 8 destination routes + agent refresh pipeline
- [ ] **v1.5** — Country comparison panel, shareable profile links, user accounts
- [ ] **v2** — Timeline view (12-month step-by-step plan), cost-of-living estimates, occupation-specific route filtering
- [ ] **v3** — Community-submitted route updates, lawyer/advisor directory integration

---

## Contributing

Contributions, bug reports, and route data corrections are welcome.

1. Fork the repo and create your branch: `git checkout -b feat/your-feature`
2. Commit your changes: `git commit -m 'feat: add xyz'`
3. Push and open a Pull Request

Please open an issue first for significant changes.

---

## License

[MIT](LICENSE) — free to use, modify, and distribute.

---

<div align="center">
Built with curiosity by someone who has been through the immigration research rabbit hole themselves.
</div>
