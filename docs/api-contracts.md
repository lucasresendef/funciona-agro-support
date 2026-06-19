# API Contracts Snapshot

Source: `../funciona-agro-api` (Fastify routes, controllers, zod schemas, repositories).

## Global Notes
- All protected routes require `Authorization: Bearer <accessToken>` (`ensureAuthenticated`).
- Error shape: `{ message: string, details?: unknown }`.
- List endpoints return raw paginated payload: `{ data: T[], pagination: { page, limit, total, totalPages } }`.
- Create/Update/Delete endpoints return wrapper: `{ data: T }`.
- Query pagination defaults: `page=1`, `limit=10`, `limit <= 100`.

## Auth

### GET `/auth/me`
- Auth: authenticated user.
- Response: `{ data: { authUser, user, permissions } }`
- `authUser`: `{ sub, tenantId, name, email, preferredUsername, scope, realmRoles, resourceRoles }`

### POST `/auth/sync-user`
- Auth: authenticated user.
- Body: none.
- Response: `{ data: AppUser }`

### POST `/auth/refresh`
- Auth: public.
- Body: `{ refreshToken: string }`
- Response: `{ data: { accessToken, idToken, refreshToken, expiresIn, refreshExpiresIn, tokenType, scope, user } }`

## Users (admin-only)

### GET `/users`
- Auth: `app-admin` role.
- Query: `page`, `limit`, `active?`, `isAdmin?`, `search?`.
- Response: paginated `AppUser[]`.

### POST `/users`
- Auth: `app-admin` role.
- Body: `{ keycloakUserId, name, email, isAdmin? }`
- Response: `{ data: AppUser }`

### PATCH `/users/:id`
- Auth: `app-admin` role.
- Params: `id` uuid.
- Body: `{ name?, email?, isAdmin? }` with at least one field.
- Response: `{ data: AppUser }`

### DELETE `/users/:id`
- Auth: `app-admin` role.
- Params: `id` uuid.
- Action: sets `active=false`.
- Response: `{ data: AppUser }`

## Farms

### GET `/farms`
- Auth: authenticated. Scoped by tenant and farm permissions for non-admin.
- Query: `page`, `limit`, `active?`, `search?`.
- Response: paginated `Farm[]`.

### POST `/farms`
- Auth: `app-admin` role.
- Body: `{ name, description? }`
- Response: `{ data: Farm }`

### PATCH `/farms/:id`
- Auth: `app-admin` role.
- Params: `id` uuid.
- Body: `{ name?, description?: string | null }` with at least one field.
- Response: `{ data: Farm }`

### DELETE `/farms/:id`
- Auth: `app-admin` role.
- Params: `id` uuid.
- Action: sets `active=false`.
- Response: `{ data: Farm }`

## Fields

### GET `/fields`
- Auth: authenticated. Scoped by tenant and farm permissions for non-admin.
- Query: `page`, `limit`, `farmId?`, `active?`, `search?`.
- Response: paginated `Field[]` where list includes `farm` relation.

### POST `/fields`
- Auth: authenticated and must have access to `farmId`.
- Body: `{ farmId, name, areaHectares, description? }`.
- Response: `{ data: Field }` with `farm` relation.

### PATCH `/fields/:id`
- Auth: authenticated and must have access to field farm.
- Params: `id` uuid.
- Body: `{ name?, areaHectares?, description?: string | null }` with at least one field.
- Response: `{ data: Field }` with `farm` relation.

### DELETE `/fields/:id`
- Auth: authenticated and must have access to field farm.
- Params: `id` uuid.
- Action: sets `active=false`.
- Response: `{ data: Field }` with `farm` relation.

## Farm Permissions

### GET `/farm-permissions`
- Auth: authenticated. Scoped by tenant and farm permissions for non-admin.
- Query: `page`, `limit`, `farmId?`, `keycloakUserId?`, `role?`, `active?`.
- `role`: `OWNER | MANAGER | OPERATOR | VIEWER`.
- Response: paginated `FarmUserPermission[]` where list includes `farm` relation.

### POST `/farm-permissions`
- Auth: authenticated and must access `farmId`.
- Body union:
  - `{ farmId, role, userId }`
  - `{ farmId, role, keycloakUserId, userName, userEmail }`
- Response: `{ data: FarmUserPermission }` with `farm` relation.

### PATCH `/farm-permissions/:id`
- Auth: authenticated and must access permission farm.
- Params: `id` uuid.
- Body: `{ role?, active? }` with at least one field.
- Response: `{ data: FarmUserPermission }`.

### DELETE `/farm-permissions/:id`
- Auth: authenticated and must access permission farm.
- Params: `id` uuid.
- Action: sets `active=false`.
- Response: `{ data: FarmUserPermission }`.

## Prisma Names Used For Frontend Consistency
- `AppUser`
- `Farm`
- `Field`
- `FarmUserPermission`
- `FarmUserRole`
