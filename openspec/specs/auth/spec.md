# Spec: Fix Expired Trial Access

## 1. Requirements

### Requirement: Login-time subscription gate (auth-subscription-gate)

The system MUST reject credential login when the user's `SuscripcionEmpresa` does not grant access via `tieneAccesoEmpresa()`.

The system MUST allow SUPER_ADMIN users to bypass this check.

The system MUST return `null` from `authorize` (failing login) when access is denied, without revealing whether the failure was due to credentials or subscription.

#### Scenario: Active trial user logs in successfully

- GIVEN a user with `estadoSuscripcion: TRIAL` and `fechaFinPeriodoActual` in the future
- WHEN the user submits valid credentials
- THEN the `authorize` callback returns the user object
- AND the session is created normally

#### Scenario: SUPER_ADMIN bypasses subscription check

- GIVEN a user with `rol: SUPER_ADMIN` and any subscription state (including expired or null)
- WHEN the user submits valid credentials
- THEN the `authorize` callback returns the user object without evaluating `tieneAccesoEmpresa()`

#### Scenario: Expired trial user is rejected at login

- GIVEN a user with `estadoSuscripcion: TRIAL` and `fechaFinPeriodoActual` in the past
- WHEN the user submits valid credentials
- THEN the `authorize` callback returns `null`
- AND the user sees a generic "Credenciales inválidas" error

#### Scenario: User with no subscription is rejected at login

- GIVEN a user whose `empresa.suscripcion` is `null`
- WHEN the user submits valid credentials
- THEN the `authorize` callback returns `null`

### Requirement: Request-time admin access guard (admin-access-middleware)

The system MUST evaluate `tieneAccesoEmpresa()` on every request to `/admin/:path*` and redirect to `/suscripcion` when access is denied.

The middleware MUST run before the page renders, not after.

The system MUST allow SUPER_ADMIN to bypass this check.

The system MUST redirect unauthenticated requests to `/auth/login`.

#### Scenario: Authenticated user with active subscription accesses admin

- GIVEN an authenticated session with a subscription granting access (`TRIAL_ACTIVO`, `ACTIVA`, `MANUAL_OVERRIDE`, or `CANCELADA_CON_ACCESO`)
- WHEN the user navigates to `/admin/usuarios`
- THEN the middleware calls `NextResponse.next()`
- AND the page renders normally

#### Scenario: SUPER_ADMIN bypasses middleware check

- GIVEN an authenticated session with `rol: SUPER_ADMIN` and any subscription state
- WHEN the user navigates to `/admin`
- THEN the middleware calls `NextResponse.next()` without evaluating subscription

#### Scenario: Expired trial user is redirected to subscription page

- GIVEN an authenticated session with a subscription that denies access (`VENCIDA` or `SIN_SUSCRIPCION`)
- WHEN the user navigates to `/admin`
- THEN the middleware redirects to `/suscripcion`

#### Scenario: Unauthenticated request is redirected to login

- GIVEN no valid session cookie
- WHEN the request targets `/admin/:path*`
- THEN the middleware redirects to `/auth/login`

## 2. Acceptance Criteria

- [ ] Expired-trial user receives generic auth error on login (not subscription-specific)
- [ ] SUPER_ADMIN logs in regardless of subscription state
- [ ] Logged-in expired-trial user is redirected to `/suscripcion` on any `/admin/*` path
- [ ] Active-trial / ACTIVE / manual-override users are unaffected in both flows
- [ ] Unauthenticated requests to `/admin/*` redirect to `/auth/login`
- [ ] Middleware does not break existing `matcher` config for `/admin/:path*`
