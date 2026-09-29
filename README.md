# PReCision — Frontend

Web app for PReCision, an AI pull request reviewer. Sign in with GitHub, index a repository, and get a multi-agent review (quality, security, performance, bugs) of any pull request, grounded in the code around the change.

React 19 + Vite + TypeScript + Tailwind CSS v4, with Redux Toolkit (async thunks) for state.

## Setup

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:3100
npm install
npm run dev            # http://localhost:5173
```

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend origin, no trailing slash. Read at build time, so restart `npm run dev` or rebuild after changing it. |

The backend must list this app's origin in `FRONTEND_URL`. It is used for CORS and for the redirect back to `/auth/callback` after GitHub sign-in.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## How it works

- **Server wake screen.** Before rendering the app, `ServerGate` pings the API root. A warm server answers immediately and the screen never shows; a sleeping free-tier backend gets an animated "starting server" screen that retries every few seconds until it responds.
- **Sign-in.** The app asks the backend for a GitHub authorize URL and sends the browser there. GitHub returns to the backend, which issues a JWT and redirects to `/auth/callback#token=…`. The token is read from the URL hash, stored, and the hash is cleared.
- **Gemini key gate.** Signed-in users without a Gemini API key are sent to `/setup/gemini-key` before they can use the app.
- **Live updates.** A per-user event stream (SSE) reports indexing progress and analysis results as toasts, so jobs keep running when you navigate away or refresh. Only one repository indexes at a time; other index buttons are locked meanwhile.
- **Analysis.** Starting an analysis streams pipeline progress on the Analyzing page. Completed PRs can be re-analyzed; each run is independent and kept in the run history.

## Structure

```
src/
  app/         store, typed hooks, router, listener middleware, createApiThunk
  api/         axios client (JWT + 401 handling), endpoint paths, SSE reader
  services/    one module per backend area (auth, github, repoIndex, review, dashboard)
  features/    Redux slices, thunks and selectors per domain (auth, events, repositories, pullRequests, reviews, ...)
  hooks/       shared hooks (server status, ...)
  components/  layout (shell, sidebar, guards), server wake screen, ui kit, review widgets
  pages/       one folder per page, page-only components live next to it
  types/       API types
  utils/       pure helpers (findings, diff parsing, run comparison, formatting)
```

Data flow: component → thunk → service → `api/client`. Derived data (filters, counts, comparisons) lives in memoized selectors and `utils`.

## Pages

| Route | Page |
|---|---|
| `/login`, `/auth/callback` | GitHub sign-in |
| `/setup/gemini-key` | Add a Gemini API key (required once) |
| `/` | Overview: recent reviews, Analyze PR |
| `/repositories` | Repos with index status, index/re-index a branch |
| `/pull-requests` | PRs per repo with latest review |
| `/repos/:owner/:repo/pulls/:n` | PR detail: Overview, Findings, Diff, Context, Runs |
| `/repos/:owner/:repo/pulls/:n/analyze` | Live pipeline progress |
| `/reviews` | Review history and run comparison |
| `/settings` | Profile, Gemini key, sign out |

## Deploying (Render static site)

1. **New → Static Site**, connect the repo.
2. Root Directory `pre-cision-fe`, Build Command `npm ci && npm run build`, Publish Directory `dist`.
3. Environment: `VITE_API_URL=https://<your-backend>.onrender.com`, `NODE_VERSION=22`.
4. After the site is created, open **Redirects/Rewrites** and add a rule: Source `/*`, Destination `/index.html`, Action **Rewrite**. Without it, `/auth/callback` and page refreshes return 404.
5. On the backend, add the site URL to `FRONTEND_URL` (comma-separated if you keep localhost too), and make sure the GitHub OAuth App callback matches the backend's `GITHUB_CALLBACK_URL`.

Changing `VITE_API_URL` requires a redeploy, since it is baked in at build time.
