# Tasks: Fix Expired Trial Access

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~20 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Subscription gate in `authorize` + middleware rename | PR 1 (single) | No dependencies; single PR to `main` |

## Phase 1: Core Implementation

- [ ] 1.1 Modify `auth.config.ts` authorize callback — nest `empresa { include: { suscripcion: true } }` in Prisma query (replace `empresa: true`), add `tieneAccesoEmpresa` + `isSuperAdminRole` imports, insert subscription check after password verify (SUPER_ADMIN bypass + deny logic)
      - **Files**: `auth.config.ts`
      - **Verify**: SUPER_ADMIN login works; expired-trial login returns `null`; active subscription login passes
      - **Effort**: ~15 LOC
- [ ] 1.2 Rename `src/proxy.ts` → `src/middleware.ts`
      - **Files**: `src/proxy.ts` → `src/middleware.ts`
      - **Verify**: Request to `/admin/*` triggers middleware; expired-trial redirects to `/suscripcion`; unauthenticated redirects to `/auth/login`; no broken imports (only `auth` import, no other files reference `proxy.ts`)
      - **Effort**: 0 LOC (rename only)

## Total Effort

~15 LOC changed, 0 LOC added (rename only). Single PR to `main`.
