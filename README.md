# Funciona Agro Support Frontend

React admin/support app for platform operations with strict contract alignment to `funciona-agro-api`.

## Stack
- React + TypeScript + Vite
- Tailwind CSS
- shadcn/ui-compatible component base
- Biome
- React Router
- TanStack Query
- React Hook Form + Zod
- Axios with interceptors
- Keycloak JS

## Setup
1. `npm install`
2. Create `.env`:
- `VITE_API_URL`
- `VITE_KEYCLOAK_URL`
- `VITE_KEYCLOAK_REALM`
- `VITE_KEYCLOAK_CLIENT_ID`
3. `npm run dev`

## Scripts
- `npm run dev`
- `npm run typecheck`
- `npm run check`
- `npm run lint`
- `npm run build`
- `npm test`

## Architecture
- `docs/api-contracts.md`: source-of-truth snapshot from backend.
- Shared HTTP/auth infra under `src/shared/lib`.
- Route guards under `src/app/router/guards`.
- Modules: `users`, `farms`, `fields`, `farm-permissions`.

## Auth Flow
- Login/logout via Keycloak JS.
- Backend integration for `/auth/me`, `/auth/sync-user`, `/auth/refresh`.
- Request interceptor attaches bearer token.
- Proactive and reactive refresh with single-flight queue.

## Safe Contract Updates
1. Re-read backend routes, schemas and controllers.
2. Update `docs/api-contracts.md` first.
3. Update DTOs and mappers.
4. Update UI entities and screens.

## Modules
- Dashboard: baseline operational area.
- Users: app-admin CRUD list/update/deactivate.
- Farms: list + admin CRUD.
- Fields: tenant/farm-scoped CRUD.
- Farm Permissions: role assignment CRUD.
