# LBI FIB UI Admin Dashboard

Admin dashboard for the LBI FIB UI registration system. Built with React, Vite, Tailwind CSS, and Radix UI primitives.

## Requirements

- Node.js 20.19+ or 22.12+
- Corepack and Yarn 4.10.3
- Access to the LBI registration API

## Local development

```bash
corepack enable
corepack yarn install
copy .env.example .env
corepack yarn start
```

Vite starts the dashboard at `http://localhost:5174`.

## Environment variables

| Variable | Description |
| --- | --- |
| `VITE_APP_VERSION` | Version displayed in the dashboard |
| `GENERATE_SOURCEMAP` | Build source-map preference |
| `VITE_APP_BASE_NAME` | Frontend base path, usually `/` |
| `PORT` | Local Vite development port |
| `VITE_API_BASE_URL` | Backend API base URL, including `/api/v1` |
| `VITE_STORAGE_BASE_URL` | Backend base URL used for uploaded assets |
| `VITE_PUBLIC_APP_URL` | Public landing-page URL |

Set production values in the deployment environment. Never commit `.env` files, API credentials, or environment-specific secrets. Vite variables prefixed with `VITE_` are embedded in client-side code and must not contain secrets.

## Checks

```bash
corepack yarn eslint src/views/dashboard/Default/index.jsx
corepack yarn build
```

## Production build

```bash
corepack yarn build
corepack yarn preview
```

The production bundle is generated in `dist/`. Deploy its contents to a static web server configured to serve the SPA entry point for client-side routes.
