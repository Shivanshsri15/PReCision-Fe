# PReCision — Frontend

React 19 + Vite + TypeScript + Tailwind CSS v4, with Redux Toolkit (async thunks) for state.

## Setup

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:3000
npm install
npm run dev            # http://localhost:5173
```

The backend must have `FRONTEND_URL` set to this app's origin (CORS + GitHub OAuth redirect to `/auth/callback`).

## Structure

```
src/
  app/         store, typed hooks, router, listener middleware, createApiThunk
  api/         axios client (JWT + 401 handling), endpoint paths, SSE reader
  services/    one module per backend area (auth, github, repoIndex, review, dashboard)
  features/    Redux slices, thunks and selectors per domain
  components/  layout (shell, sidebar, guards), ui kit, review widgets
  pages/       one folder per page, page-only components live next to it
  types/       API types
  utils/       pure helpers (findings, diff parsing, run comparison, formatting)
```

Data flow: component → thunk → service → `api/client`. Derived data (filters, counts, comparisons) lives in memoized selectors and `utils`.

## Pages

| Route | Page |
|---|---|
| `/login`, `/auth/callback` | GitHub sign-in |
| `/` | Overview: stats, recent reviews, Analyze PR |
| `/repositories` | Repos with index status, index/re-index a branch |
| `/pull-requests` | PRs per repo with latest review |
| `/repos/:owner/:repo/pulls/:n` | PR detail: Overview, Findings, Diff, Context, Runs |
| `/repos/:owner/:repo/pulls/:n/analyze` | Live pipeline progress (SSE) |
| `/reviews` | Review history and run comparison |
| `/settings` | Profile, Gemini key, sign out |
