# Tasks: Fix Payment Subscription Flow

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~50-70 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Core Logic Fixes

- [x] 1.1 **`suscripcion-payment.ts`**: Change `external_reference` to `` `temp:${empresaId}` ``. Remove the `SuscripcionEmpresa.upsert` block. Only create MP PreApproval and return redirect URL.
- [x] 1.2 **`createCompanyAndAdmin.ts`**: Add `SuscripcionEmpresa.create` inside the empresa creation transaction. Use `planTipo`, `frecuenciaPago` from TempRegistration. Set `estadoSuscripcion: "ACTIVA"`, `fechaFinPeriodoActual` calculated from frequency. Return `suscripcionId` in result.
- [x] 1.3 **`successSuscriber.ts`**: Fix `empresaIdToUse`: split `external_reference` by `":"`, use `referenceId` portion (works for both `"temp:{id}"` and `"empresa:{id}"`). Fall back to `data.empresaId` if no external_reference.

## Phase 2: Integration Fixes

- [x] 2.1 **`status/route.ts`**: Change external_reference search from `p.external_reference === tempRegistration.id` to `p.external_reference === \`temp:${tempRegistration.id}\`` (line 86).
- [x] 2.2 **`webhooks/route.ts` CASE 1**: After `createCompanyAndAdmin` returns `result.empresaId`, use it to `update` the `SuscripcionEmpresa` with MP data. Remove dead code that reads temp registration after deletion.
- [x] 2.3 **`PaymentForm.tsx`**: Add clarifying comment that `empresaId` is a tempRegistration.id for new registrations, not a real empresa ID. (No logic change.)

## Phase 3: Verification

- [x] 3.1 Run `npx tsc --noEmit` — verify zero type errors ✅
- [x] 3.2 Run `next lint` — verify zero lint errors ✅
- [ ] 3.3 Manual: trace the complete flow — `prepareRegistrationForPayment → handleSuscriber → PreApproval created with "temp:{id}"` — confirm no FK violation
- [ ] 3.4 Manual: verify `successSuscriber` correctly parses `"temp:{id}"` and `"empresa:{id}"` formats
- [ ] 3.5 Manual: verify `createCompanyAndAdmin` creates Empresa + Admin + SuscripcionEmpresa together
- [ ] 3.6 Manual: verify `extendSubscriptionOneMonth` (existing empresa flow) unaffected
- [ ] 3.7 Manual: verify `createTrialAccount` (trial flow) unaffected
