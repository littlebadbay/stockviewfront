# AdminLTE + ECharts + Vite React TS Scaffold

This project is a frontend scaffold using Vite, React, and TypeScript styled with AdminLTE/Bootstrap and integrated with ECharts.

Features
- AdminLTE-styled layout (header, sidebar, content)
- React Router: `/` (watchlist) and `/symbol/:code` (detail)
- ECharts sample candlestick chart
- WebSocket client placeholder with auto-reconnect (configurable via env)
- Env-configurable API base and WS URLs
- ESLint + Prettier
- Basic tests (Vitest + Testing Library)
- Dockerfile for production build (Nginx)

Getting started
- Copy `.env.example` to `.env` and set your values
- Install dependencies: `npm install`
- Start dev server: `npm run dev`

Environment variables
- `VITE_API_BASE_URL` - Base URL for HTTP API
- `VITE_WS_URL` - WebSocket URL

Build and run with Docker
```
docker build -t vite-adminlte .
docker run -p 8080:80 vite-adminlte
```

Deployment (Vercel)
- Connect the GitHub repository to a Vercel Project
- Framework preset: Vite/React
- Build Command: `npm run build`
- Output Directory: `dist`
- A `vercel.json` is provided with SPA rewrites so client-side routing works in production

Vercel environment variables
- Production
  - `VITE_API_BASE_URL` = `https://<render-backend-domain>`
  - `VITE_WS_URL`      = `wss://<render-backend-domain>`
- Preview (for PRs)
  - `VITE_API_BASE_URL` = `https://<render-preview-backend-domain>`
  - `VITE_WS_URL`      = `wss://<render-preview-backend-domain>`

Notes
- Router uses `<BrowserRouter basename={import.meta.env.BASE_URL}>` so base URL is correct in all environments
- WebSocket client reads `VITE_WS_URL` via `src/shared/config.ts` and is consumed by `src/shared/ws/ReconnectingWebSocket.ts`
- AdminLTE is included via CDN in `index.html` for styling only
- Vercel Analytics is disabled by default via `vercel.json`; enable it in Vercel if needed
- Pushing to `main` triggers a new deployment in Vercel once the project is connected
