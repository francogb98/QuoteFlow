# Design: Fix Payment Subscription Flow

## Technical Approach

Three structural fixes, one file change per fix, minimal diff:

1. **`suscripcion-payment.ts`**: Remove the `SuscripcionEmpresa.upsert` (causes FK violation — empresa doesn't exist yet). Change `external_reference` to `"temp:{id}"`. Only create the MP PreApproval.
2. **`createCompanyAndAdmin.ts`**: Add `SuscripcionEmpresa` creation inside the transaction, alongside Empresa + Admin.
3. **`successSuscriber.ts`**: Parse `external_reference` correctly by splitting `"temp:{id}"` or `"empresa:{id}"` by colon.
4. **`status/route.ts`**: Fix `external_reference` search to match `"temp:{tempId}"` instead of bare ID.
5. **Webhook CASE 1**: Fix the dead code that tries to read a deleted temp registration — use `result.empresaId` + PreApproval data directly.

## Bug Addendum: Webhook CASE 1 Dead Code

In `webhooks/route.ts` CASE 1 ("temp:"): `createCompanyAndAdmin` deletes the TempRegistration, then the code tries `tempRegistration.findUnique` → null → early return. The `SuscripcionEmpresa.create` on line 318 is **dead code** — never reached. With the fix in `createCompanyAndAdmin`, this block becomes an update-only path.

## Architecture Decisions

### Decision: SuscripcionEmpresa creation ownership

| Option | Tradeoff |
|--------|----------|
| Create in `createCompanyAndAdmin` (chosen) | Single responsibility — if the empresa+admin are created, the subscription is always created. Webhook becomes update-only. |
| Create in webhook CASE 1 only | Webhook already has dead code for this. Requires more refactoring. Race condition with status route. |

**Choice**: `createCompanyAndAdmin` creates SuscripcionEmpresa.
**Rationale**: Ensures subscription record ALWAYS exists when empresa+admin exist. Idempotent via empresaId unique constraint.

### Decision: external_reference format

| Option | Tradeoff |
|--------|----------|
| `"temp:{tempId}"` for new reg, `"empresa:{empresaId}"` for existing (chosen) | Matches webhook's existing CASE 1/CASE 2 split. Consistent with how the webhook already routes. |
| Always `"empresa:{id}"` and detect new vs existing by DB lookup | Requires changing webhook logic. More ambiguous. |

**Choice**: Keep both formats, fix `suscripcion-payment.ts` to use `"temp:{tempId}"` for new registrations.
**Rationale**: Webhook already handles both. Just need to use the right format from each caller.

## Data Flow

```
NEW REGISTRATION (paid):

RegisterForm
  → prepareRegistrationForPayment() → TempRegistration {id: T1}
  → PaymentForm → handleSuscriber({empresaId: T1})
    → PreApproval.create({external_reference: "temp:T1"})   ← fixed
    → return MP redirect                                   ← no DB write
  → User pays in MP
  → MP redirects to /auth/success
  → Polls /api/temp-registration/T1/status
    → Searches MP: external_reference === "temp:T1"         ← fixed
    → If authorized → createCompanyAndAdmin(T1, preapprovalId)
      → Creates Empresa + Admin + SuscripcionEmpresa        ← fixed
  → Webhook (preapproval event, "temp:T1"):
    → createCompanyAndAdmin() → idempotent (empresa exists)
    → Updates SuscripcionEmpresa with MP estado/fechas     ← fixed
  → Webhook (payment event):
    → Finds SuscripcionEmpresa by mercadoPagoPreApprovalId  ← now works
    → Creates PagoSuscripcionEmpresa, extends fechaFin

EXISTING EMPRESA (unchanged):

iniciarSuscripcionEmpresa()
  → PreApproval.create({external_reference: "empresa:E1"})
  → Updates SuscripcionEmpresa.mercadoPagoPreApprovalId
  → Webhook CASE 2: updates subscription estado/fechas
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/actions/payment/suscripcion-payment.ts` | Modify | external_reference `"temp:{id}"`, remove SuscripcionEmpresa.upsert |
| `src/actions/auth/registration/03-createCompanyAndAdmin.ts` | Modify | Add SuscripcionEmpresa creation with fechaFin from frequency |
| `src/actions/auth/registration/02-successSuscriber.ts` | Modify | Split external_reference by ":", use referenceId portion |
| `src/app/api/temp-registration/[id]/status/route.ts` | Modify | Search `"temp:" + id` instead of bare `id` |
| `src/app/api/mercadopago/webhooks/route.ts` | Modify | CASE 1: update SuscripcionEmpresa by empresaId (createCompanyAndAdmin already created it) |
| `src/app/auth/register-payment/[id]/ui/PaymentForm.tsx` | Modify | Add clarifying comment only (no logic change) |

## Interfaces / Contracts

### createCompanyAndAdmin return value

Add `suscriptionId` to the return type so callers can reference it:

```typescript
interface CreateCompanyAndAdminResult {
  ok: boolean;
  message?: string;
  error?: string;
  empresaId?: string;
  suscripcionId?: string;  // NEW
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Type check | All files compile | `npx tsc --noEmit` |
| Lint | No new lint errors | `next lint` |
| Manual | Full registration with temp code | End-to-end: fill form → pay → verify empresa/admin/SuscripcionEmpresa created |
| Manual | Existing empresa subscription | Verify `update-suscription.ts` unchanged |
| Manual | Trial registration | Verify `createTrialAccount` unaffected |

## Migration / Rollout

No migration required. The only state change is that NEW registrations will now correctly create SuscripcionEmpresa. Existing orphaned subscriptions in MP (from the broken flow) are out of scope — those users would need to re-register or be fixed manually.

## Open Questions

None.
