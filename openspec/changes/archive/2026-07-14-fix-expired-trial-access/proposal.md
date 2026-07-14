# Proposal: Fix Expired Trial Access

## Intent

Expired-trial users can log in and access `/admin/*` because neither `authorize` callback nor request pipeline checks subscription status — despite a working `tieneAccesoEmpresa()` and full middleware (`proxy.ts`) already existing.

## Scope

### In Scope
- Subscription check in `auth.config.ts` `authorize`, rejecting login when `tieneAccesoEmpresa()` denies
- Rename `proxy.ts` → `middleware.ts` to activate request-time guard on `/admin/:path*`

### Out of Scope
- MercadoPago webhook reconciliation, UI changes, role-based route restrictions

## Capabilities

### New Capabilities
- `auth-subscription-gate`: Login-time subscription validation. Rejects auth when subscription expired or missing.
- `admin-access-middleware`: Request-time guard evaluating `tieneAccesoEmpresa()` on `/admin/:path*`.

### Modified Capabilities
None.

## Approach

Two independent layers for defense-in-depth:
1. **Login guard** (`auth.config.ts`): After password verify, check `tieneAccesoEmpresa()` on user's subscription, return `null` if denied.
2. **Middleware** (`proxy.ts` → `middleware.ts`): Rename to activate. Already has correct redirect to `/suscripcion`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `auth.config.ts:118-130` | Modified | Subscription check between password verify and user return |
| `src/proxy.ts` | Renamed → `src/middleware.ts` | No logic changes |
| `src/app/admin/layout.tsx:15` | Unchanged | Session check only; middleware handles subscription |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| SUPER_ADMIN locked out | Low | Explicit SUPER_ADMIN skip in both layers |
| Middleware rename breaks imports | Low | Only `auth` import; no other files reference `proxy.ts` |

## Rollback Plan

1. Remove subscription check in `authorize` — no migration needed.
2. Rename `middleware.ts` back to `proxy.ts`.
Both are file-level changes, instantly reversible.

## Dependencies

None. `tieneAccesoEmpresa()` already imported in `proxy.ts`. `auth.config.ts` already has Prisma and `empresa` relation.

## Success Criteria

- [ ] Expired-trial user receives auth error on login
- [ ] Logged-in expired-trial admin redirected to `/suscripcion` on `/admin/*`
- [ ] Active trial, SUPER_ADMIN, manual override users unaffected
