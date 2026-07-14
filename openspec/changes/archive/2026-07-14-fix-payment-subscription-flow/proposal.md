# Proposal: Fix Payment Subscription Flow

## Intent

Fix the Mercado Pago paid registration flow so new admins who pay by credit card get their empresa, admin account, and subscription record created correctly — and recurring payments are properly linked.

## Scope

### In Scope

- Fix `suscripcion-payment.ts`: change `external_reference` to `"temp:{tempId}"` for new registrations, remove the `SuscripcionEmpresa.upsert` that causes FK violation
- Fix `PaymentForm.tsx`: stop passing `empresaId: tempRegistration.id` — the empresa doesn't exist yet
- Fix `createCompanyAndAdmin.ts`: create `SuscripcionEmpresa` record alongside the empresa and admin
- Fix `successSuscriber.ts`: properly parse `external_reference` to extract the temp registration ID
- Fix `temp-registration/[id]/status/route.ts`: search MP preapprovals with correct `external_reference` format
- Fix `webhooks/route.ts`: ensure `handleSubscriptionEvent` CASE 1 ("temp:") creates `SuscripcionEmpresa` — verify it already does, or fix if not
- Fix `webhooks/route.ts` `handlePaymentEvent`: ensure it can link payments even when `SuscripcionEmpresa` was just created
- Verify `update-suscription.ts` uses consistent external_reference format

### Out of Scope

- UI changes to the registration or payment forms
- Changes to the trial account flow (`createTrialAccount` — already works)
- Mercado Pago webhook signature validation
- Email notifications or logging improvements
- Subscription cancellation flow

## Capabilities

### New Capabilities

- `payment-subscription`: Covers the complete Mercado Pago subscription lifecycle for new admin registrations, from PreApproval creation through webhook processing to recurring payment linking.

### Modified Capabilities

None — no existing spec files need behavioral changes.

## Approach

### Core Strategy: Consistent external_reference format

The root cause is an `external_reference` format mismatch. We'll standardize on two formats:

- **New registration**: `"temp:{tempRegistrationId}"` — triggers webhook CASE 1 to create empresa + admin + SuscripcionEmpresa
- **Existing empresa**: `"empresa:{empresaId}"` — triggers webhook CASE 2 to update existing subscription

### File-by-file changes

1. **`suscripcion-payment.ts`**: Change `external_reference` to `"temp:{empresaId}"` (when called from new registration). Remove `SuscripcionEmpresa.upsert` — it causes FK violation because empresa doesn't exist yet. Only create the MP PreApproval and return the redirect URL.

2. **`PaymentForm.tsx`**: Keep passing `empresaId: tempRegistration.id` but now `suscripcion-payment.ts` won't try to upsert SuscripcionEmpresa with it, so no FK error. Add clarifying comment.

3. **`createCompanyAndAdmin.ts`**: After creating Empresa and Admin, also create `SuscripcionEmpresa` with `mercadoPagoPreApprovalId` linked. Calculate `fechaFinPeriodoActual` based on frequency (1 or 12 months from now). This is the KEY fix — ensures subscription record always exists.

4. **`successSuscriber.ts`**: Fix `empresaIdToUse`: split `"temp:{tempId}"` by ":" and use referenceId, or fall back to `data.empresaId`. Also handle "empresa:" prefix for existing company flow.

5. **`temp-registration/[id]/status/route.ts`**: Fix external_reference search to include the "temp:" prefix: `external_reference === "temp:" + tempRegistration.id`.

6. **`webhooks/route.ts`**: Verify CASE 1 ("temp:") correctly creates SuscripcionEmpresa. If `createCompanyAndAdmin` now creates it, the webhook should check for existence first (idempotency). CASE 2 ("empresa:") stays as-is. `handlePaymentEvent`: verify fallback search also handles "temp:" format.

7. **`update-suscription.ts`**: Verify `"empresa:{empresaId}"` format is correct for existing companies — it is, no change needed.

### Sequence (new registration flow)

```
RegisterForm → prepareRegistrationForPayment → TempRegistration
  → PaymentForm → handleSuscriber({ empresaId: tempId })  
    → Creates PreApproval in MP with external_reference "temp:{tempId}"
    → Returns MP redirect URL (no DB write, no FK error)
  → User pays in MP
  → MP redirects to /auth/success
  → Success page polls /api/temp-registration/{tempId}/status
    → Status route searches MP by payer_email + external_reference "temp:{tempId}" ✓
    → If payment authorized, calls createCompanyAndAdmin(tempId, preapprovalId)
  → createCompanyAndAdmin:
    → Creates Empresa + Administrador + SuscripcionEmpresa in transaction ✓
  → Webhook arrives (preapproval event with "temp:{tempId}"):
    → CASE 1: empresa already exists → skip creation (idempotent)
    → Updates SuscripcionEmpresa estado based on MP status
  → Webhook arrives (payment event):
    → Finds SuscripcionEmpresa by mercadoPagoPreApprovalId ✓
    → Creates PagoSuscripcionEmpresa record
    → Extends fechaFinPeriodoActual
```

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/actions/payment/suscripcion-payment.ts` | Modified | Remove upsert, change external_reference to "temp:" prefix |
| `src/app/auth/register-payment/[id]/ui/PaymentForm.tsx` | Modified | Add clarifying comment only |
| `src/actions/auth/registration/03-createCompanyAndAdmin.ts` | Modified | Add SuscripcionEmpresa creation in transaction |
| `src/actions/auth/registration/02-successSuscriber.ts` | Modified | Fix external_reference parsing |
| `src/app/api/temp-registration/[id]/status/route.ts` | Modified | Fix external_reference search prefix |
| `src/app/api/mercadopago/webhooks/route.ts` | Modified | Verify and ensure idempotent "temp:" handling |
| `src/actions/payment/update-suscription.ts` | Verified | No change needed |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Race condition: webhook and status route both try to create empresa+admin | Medium | `createCompanyAndAdmin` already checks if empresa/admin exist before creating — idempotent |
| Duplicate SuscripcionEmpresa creation | Low | `empresaId` is unique — Prisma would throw unique constraint error; wrap in findUnique check first |
| PreApproval created but user never pays | Low | MP handles this; TempRegistration expires after 24h; no DB state leaked |
| Webhook arrives before empresa exists (for "temp:" case) | Low | CASE 1 already handles this — calls `createCompanyAndAdmin` first, then creates SuscripcionEmpresa |
| Existing subscriptions ("empresa:" format) break | Low | We do NOT change the "empresa:" format or the CASE 2 handler |

## Rollback Plan

Revert each file individually:
- `suscripcion-payment.ts`: restore upsert and change external_reference back to "empresa:" prefix
- `createCompanyAndAdmin.ts`: remove SuscripcionEmpresa creation
- `successSuscriber.ts`: restore original external_reference logic
- `status/route.ts`: restore external_reference search without prefix
- `webhooks/route.ts`: no changes expected beyond verification

Alternatively, `git revert` the commit(s).

## Dependencies

- Mercado Pago API must be reachable (webhook and PreApproval API)
- PostgreSQL database must be up

## Success Criteria

- [ ] New admin registers with credit card → empresa, admin, and SuscripcionEmpresa created
- [ ] SuscripcionEmpresa has correct estadoSuscripcion ("ACTIVA" for paid, "TRIAL" for trial)
- [ ] SuscripcionEmpresa has correct fechaFinPeriodoActual calculated from payment
- [ ] Recurring MP payment webhook finds SuscripcionEmpresa by mercadoPagoPreApprovalId
- [ ] PagoSuscripcionEmpresa record created for each payment
- [ ] Existing empresa subscription flow (update-suscription.ts) unchanged
- [ ] Trial registration flow (createTrialAccount) unchanged
