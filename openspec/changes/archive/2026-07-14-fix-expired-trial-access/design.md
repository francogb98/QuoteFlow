# Design: Fix Expired Trial Access

## Technical Approach

Two-layer defense-in-depth: (1) login-time guard in `auth.config.ts` `authorize` callback rejects expired-trial users before a session is created, (2) request-time guard via existing middleware logic — renamed from `proxy.ts` to `middleware.ts` so Next.js activates it. SUPER_ADMIN bypasses both layers.

## Architecture Decisions

### Decision: Subscription check in authorize, not session callback

| Option | Tradeoff |
|--------|----------|
| Check in `authorize` | Blocks session creation entirely — user never gets past login |
| Check in `session` callback | Session is created but then nullified — confusing UX, token still exists |
| Check in both | Defense-in-depth, redundant checks (chosen) |

**Choice**: authorize check for login rejection + middleware for existing sessions.
**Rationale**: authorize runs once per login, middleware runs per request. Together they cover both entry points without coupling.

### Decision: Extend Prisma `include` vs separate query for subscription

| Option | Tradeoff |
|--------|----------|
| Nest `empresa { include: { suscripcion: true } }` | Single query, no N+1 (chosen) |
| Separate `prisma.suscripcionEmpresa.findUnique` | Extra round-trip, more code |

**Choice**: Nest `empresa { include: { suscripcion: true } }` in the existing `findUnique`.
**Rationale**: The authorize callback already fetches the user with `empresa: true` — nesting adds negligible cost.

### Decision: No type changes to `next-auth.d.ts`

**Choice**: Leave session type as-is. Middleware uses `(session.user as any)?.empresa?.suscripcion`.
**Rationale**: The `Session.user.empresa` type is `PrismaEmpresa` which doesn't model the relation type. The existing code already works around this with `as any`. Adding proper type mapping would require Prisma's `include` return types (the `EmpresaGetPayload` pattern) which is out of scope.

## Data Flow

### Layer 1: Login guard (authorize)

```
POST /api/auth/callback/credentials
  │
  ├─ authorize(credentials)
  │   ├─ Parse & validate Zod schema
  │   ├─ prisma.administrador.findUnique({ include: { empresa: { include: { suscripcion: true } } } })
  │   ├─ bcryptjs.compare(password)
  │   ├─ isSuperAdminRole(user.rol)? → YES → return user
  │   ├─ tieneAccesoEmpresa(user.empresa.suscripcion)
  │   │   ├─ tieneAcceso === true → return user
  │   │   └─ tieneAcceso === false → return null
  │   └─ return null (generic error)
  │
  └─ Session NOT created → client shows "Credenciales inválidas"
```

### Layer 2: Middleware guard

```
GET /admin/usuarios
  │
  ├─ middleware.ts
  │   ├─ auth() → session?
  │   │   └─ No session → redirect /auth/login
  │   ├─ isSuperAdminRole(session.user.rol)? → YES → NextResponse.next()
  │   ├─ tieneAccesoEmpresa(session.user.empresa.suscripcion)
  │   │   ├─ tieneAcceso === true → NextResponse.next()
  │   │   └─ tieneAcceso === false → redirect /suscripcion
  │
  └─ Page renders (or redirect to /suscripcion)
```

```
          ┌──────────────┐
          │  authorize() │ ← Layer 1: blocks login
          └──────┬───────┘
                 │ session created
                 ▼
          ┌──────────────┐
          │  middleware()│ ← Layer 2: blocks requests
          │ (proxy.ts)   │
          └──────┬───────┘
                 │ next()
                 ▼
          ┌──────────────┐
          │ /admin/page  │
          └──────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `auth.config.ts` | Modify | Import `isSuperAdminRole`, `tieneAccesoEmpresa`; nest `empresa { include: { suscripcion } }` in Prisma query; add subscription check after password verify |
| `src/proxy.ts` | Rename → `src/middleware.ts` | No logic changes; Next.js picks up `config.matcher` automatically |
| `src/middleware.ts` | Create (exists as proxy.ts) | Already has import path `./lib/auth/tieneAcceso` and `import { auth } from "@/*"` — both work as-is |
| `next-auth.d.ts` | Unchanged | Session type already has `empresa: PrismaEmpresa` |

## Interfaces / Contracts

No new interfaces. The `tieneAccesoEmpresa()` function signature (defined in `src/lib/auth/tieneAcceso.ts`) is the contract for both layers:

```typescript
tieneAccesoEmpresa(suscripcion: {
  estadoSuscripcion: string;
  estadoPagoMercadoPago?: string | null;
  fechaFinPeriodoActual: Date | string | null;
  manualOverrideEstado: string | null;
  manualOverrideHasta: Date | string | null;
} | null): ResultadoAcceso
```

## auth.config.ts — Specific Change Points

**Import block** (add after existing imports):
```typescript
import { isSuperAdminRole } from "@/lib/auth/isSuperAdmin";
import { tieneAccesoEmpresa } from "@/lib/auth/tieneAcceso";
```

**Prisma query** (line 108–118, change `empresa: true` to nested include):
```typescript
include: {
  empresa: {
    include: {
      suscripcion: true,
    },
  },
  configuracionTarifa: {
    include: {
      rangos: true,
    },
  },
},
```

**Subscription check** (insert after line 129 `if (!passwordMatch)` block, before line 132):
```typescript
// SUPER_ADMIN bypasses subscription check
if (isSuperAdminRole(user.rol)) {
  const { password: _, ...rest } = user;
  return { ...rest, mercadoPagoActivo: false };
}

const suscripcion = user.empresa?.suscripcion ?? null;
const resultado = tieneAccesoEmpresa(suscripcion);
if (!resultado.tieneAcceso) {
  console.error(`Acceso denegado para ${user.documento}: ${resultado.motivo}`);
  return null;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `tieneAccesoEmpresa` with expired/null subscription | Already works; validate in isolation |
| Integration | authorize callback rejects expired trial, allows SUPER_ADMIN | Mock Prisma, call `authorize` directly |
| Runtime | middleware redirects expired trial to `/suscripcion` | Manual test with real DB: set `fechaFinPeriodoActual` in past, try login + navigate |
| E2E | Full flow: expired trial → login blocked + session guard | Cypress/Playwright (not configured — manual for now) |

## Migration / Rollout

1. **No data migration required.** The subscription data already exists in the DB.
2. **No feature flag.** Low-risk, immediately effective after deploy.
3. **Deploy order**: (a) merge `auth.config.ts` changes, (b) rename proxy → middleware, (c) deploy.

## Rollback

1. Revert `auth.config.ts` changes (remove import + check block) — instantly reversible.
2. Move `src/middleware.ts` back to `src/proxy.ts`.

## Open Questions

None. All dependencies (`tieneAccesoEmpresa`, `isSuperAdminRole`) exist and are used in `proxy.ts` already.
