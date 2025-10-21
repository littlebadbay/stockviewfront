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

Notes
- AdminLTE is included via CDN in `index.html` for styling only.
- The WebSocket client lives at `src/shared/ws/ReconnectingWebSocket.ts` and is not auto-connected by default.
