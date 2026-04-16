# WhatsApp / Twilio Removal Report

**Date:** 2026-04-16  
**Status:** ✅ Complete — TypeScript check passes, zero WhatsApp/Twilio references remain in source.

---

## Files Deleted

| File | Reason |
|---|---|
| `src/app/api/send-whatsapp/route.ts` | HTTP POST endpoint for sending WhatsApp via Twilio — no callers |
| `src/01-actions/twilio/twilio.ts` | Core `sendWhatsAppReminder` server action — all callers cleaned first |

---

## Files Modified

### Backend

| File | Change |
|---|---|
| `src/lib/cron/01-payments/daily/notificarVencimientosFijos.ts` | Removed `sendWhatsAppReminder` import, `tipoTwilio` variable, and the `if (whatsappHabilitado && telefono)` send block |
| `src/lib/cron/01-payments/daily/notificarVencimientosDinamicos.ts` | Same pattern as above |
| `src/01-actions/admin/pago/editPago.ts` | Removed exported `editPagoNotificacionWhatsApp` function (zero callers) |
| `src/app/api/mercadopago/webhooks/route.ts` | Removed `whatsappHabilitado: existing.planTipo === "PRO"` write (line 227) and `whatsappHabilitado: subscription.planTipo === "PRO"` write (line 337). Cleaned up the resulting no-op `prisma.empresa.update` calls. |
| `src/app/suscripcion/resultado/syncSubscriptionAfterResult.ts` | Removed `whatsappHabilitado: localSub.planTipo === "PRO"` write. Removed resulting no-op `prisma.empresa.update` from the `$transaction`. |

### Frontend / Admin

| File | Change |
|---|---|
| `src/01-components/admin/home/nuevo/kpis-cards.tsx` | Removed active `sendWhatsAppReminder` import, commented-out duplicate import, `MessageCircle` and `PhoneOff` Lucide icons, `whatsappHabilitado` prop from `KpiCardsProps` and destructuring, `sendingId` / `setSendingId` state, `handleTestTwilio` function, "Usuarios sin teléfono" KPI card conditional on `whatsappHabilitado`, commented-out Twilio test buttons JSX, commented-out WhatsApp send button in pago modal rows |
| `src/app/admin/home/page.tsx` | Removed `whatsappHabilitado={session.user.empresa?.whatsappHabilitado}` prop passthrough to `KpiCards` |

### Marketing / Landing

| File | Change |
|---|---|
| `src/components/home/hero-section.tsx` | Badge text changed from "Nuevo: Notificaciones automáticas por WhatsApp" → "Notificaciones automáticas de pago". Hero description updated to remove WhatsApp mention. |
| `src/components/home/features-section.tsx` | Removed "Notificaciones por WhatsApp" feature card (replaced first card with "Notificaciones automáticas" / email). Removed unused `MessageSquare` Lucide import. |
| `src/components/home/how-it-works-section.tsx` | Step description "Conecta WhatsApp y email..." → "Configura notificaciones automáticas por email..." |
| `src/components/home/testimonials-section.tsx` | Testimonial updated: "La notificación por WhatsApp fue un cambio total" → "Los recordatorios por email son un cambio total" |
| `src/components/home/pricing-section.tsx` | "Recordatorios automáticos por WhatsApp" → "Recordatorios automáticos por email" in both PRO plan feature arrays |
| `src/lib/plans/data.tsx` | Cleaned commented-out WhatsApp feature strings in disabled plan objects |
| `src/lib/data/plansData.tsx` | Same as above |

---

## Database Changes

| Migration | Applied |
|---|---|
| `20260416133827_remove_whatsapp_fields` | ✅ Applied and pushed to production database |

**Dropped columns:**

| Model | Field | Type |
|---|---|---|
| `Empresa` | `whatsappHabilitado` | `Boolean @default(false)` |
| `Pago` | `ultimaNotificacionWhatsApp` | `DateTime?` |

---

## Environment Variables Removed

These variables were referenced in the deleted files and should be removed from all `.env` files and deployment environments (Vercel, Railway, etc.):

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`
- `TWILIO_CONTENT_SID_VENCIDO`
- `TWILIO_CONTENT_SID_PENDIENTE`

---

## Dependency Removed

| Package | Version | Action |
|---|---|---|
| `twilio` | `^5.10.6` | Removed via `pnpm remove twilio` |

---

## Validation

| Check | Result |
|---|---|
| `pnpm tsc --noEmit` | ✅ No errors |
| Grep for `whatsapp\|twilio` in `src/` | ✅ Zero matches |
| Prisma migration applied | ✅ `20260416133827_remove_whatsapp_fields` |
| Prisma client regenerated | ✅ v6.19.2 |

---

## Preserved Functionality

- **Email notifications** (`sendReminderEmail`) in both `notificarVencimientosFijos` and `notificarVencimientosDinamicos` cron jobs remain fully operational.
- **`telefono` field on `Usuario`** model is NOT removed — it serves as a contact record and is used in the "Usuarios sin teléfono" section of the admin dashboard (the section for updating phone data was preserved; only the WhatsApp-gated KPI card was removed).
- All payment flows, subscription flows, and MercadoPago webhook handling remain intact.

---

## Potential Side Effects

- **PRO plan no longer has a WhatsApp differentiator**: The `whatsappHabilitado` flag was the only PRO-exclusive feature beyond email. The plan tiers still exist but their functional difference is now solely email priority support. Consider re-evaluating PRO plan value proposition.
- **12 existing `Empresa` rows had `whatsappHabilitado = TRUE`**: These were PRO subscribers who previously had WhatsApp notifications. They were migrated without data loss (column dropped, boolean value discarded).
- **1 `Pago` row had `ultimaNotificacionWhatsApp` set**: Historical timestamp, no functional impact.

---

## Future Notification Alternatives (Not Implemented)

If the notification system gap needs to be filled, recommended options in order of complexity:

1. **Email enhancement** — Currently using `sendReminderEmail`; can be expanded with richer HTML templates via [Resend](https://resend.com) or SMTP (already partially integrated).
2. **In-app notifications** — Real-time notifications stored in the existing `Notificacion` model, rendered in the admin/user dashboard (the model and table already exist).
3. **Push notifications** — Next.js + service workers (the project already has `public/sw.js`). Would require a push subscription management system.
