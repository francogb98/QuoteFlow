# README_AUDIT

> Auditoría técnica generada el 15/04/2026  
> Stack: Next.js 15 · React 19 · TypeScript 5.9 · Prisma 6.9 · PostgreSQL 15 · NextAuth v5 beta · Zustand 5 · TanStack Query · Tailwind CSS 4 · shadcn/ui · MercadoPago · Cloudinary · Twilio · Firebase  
> Dominio: cuotafacil.com.ar

---

## 🧾 Resumen General

| Ítem | Valor |
|------|-------|
| **Estado general** | Funcional en producción, con deuda técnica crítica acumulada |
| **Nivel de madurez** | MVP Avanzado (feature-complete, no production-hardened) |
| **Propósito** | SaaS multi-tenant para gestión de cobros recurrentes (gimnasios, academias, clubes) |
| **Arquitectura base** | Next.js App Router + Server Actions + API Routes + Prisma ORM |
| **Versión** | 0.1.0 |

**Resumen ejecutivo**: La lógica de negocio está bien pensada. El modelado de dominio (tarifas fijas/dinámicas, cobros, notificaciones, suscripciones) es sólido y está bien reflejado en el schema de Prisma. El flujo de MercadoPago para empresas y usuarios individuales está implementado con HMAC validation. Sin embargo, en la iteración de Semana 1 se identificaron y corrigieron **9 vulnerabilidades críticas/altas de seguridad** que existían en producción. La deuda técnica principal ahora está concentrada en calidad de código, consistencia de arquitectura y performance.

---

## 🚨 Problemas Críticos (Alta prioridad)

> ✅ = **RESUELTO** en la primera iteración de implementación (15/04/2026)

### C1 — Endpoint cron sin autenticación ✅ RESUELTO
- **Archivo**: `src/app/api/cron/diario/route.ts`
- **Problema**: El check de autenticación estaba comentado. Cualquier usuario anónimo podía hacer `GET /api/cron/diario` y disparar el procesamiento diario de pagos: marcar cuotas como vencidas, aplicar recargos, generar pagos futuros.
- **Impacto**: Manipulación directa del estado financiero de todos los clientes de la plataforma.
- **Fix aplicado**: Re-habilitado el check `if (!token || token !== process.env.CRON_SECRET)`.
- **Pendiente**: Asegurarse de que `CRON_SECRET` esté configurado en Vercel. El cron de Vercel debe pasar el header `Authorization: Bearer $CRON_SECRET`.

### C2 — GET /api/admin/user/[id] sin autenticación ni ownership check ✅ RESUELTO
- **Archivo**: `src/app/api/admin/user/[id]/route.ts`
- **Problema**: El endpoint no llamaba a `auth()`. Cualquier request con un UUID válido obtenía todos los datos del usuario: nombre, documento, email, historial de pagos, configuración de tarifa.
- **Impacto**: Exposición de PII de todos los estudiantes/clientes de la plataforma mediante enumeración de IDs.
- **Fix aplicado**: Agregado `auth()` + verificación `user.administradorId !== session.user.id` (403 en caso de mismatch).

### C3 — GET /api/admin/users-report acepta adminId como query param sin verificar ✅ RESUELTO
- **Archivo**: `src/app/api/admin/users-report/route.ts`
- **Problema**: Sin `auth()`. El parámetro `adminId` venía del query string — cualquiera podía consultar los datos de cualquier admin.
- **Impacto**: Exfiltración masiva de datos de todas las empresas registradas (usuarios, pagos, tarifas).
- **Fix aplicado**: Agregado `auth()`. Admins normales (`ADMINISTRADOR`/`PROFESOR`) usan forzosamente `session.user.id`. Solo `SUPER_ADMIN` puede pasar `adminId` por query param.

### C4 — GET /api/temp-registration/[id] expone PII en proceso de registro ✅ RESUELTO
- **Archivos**: `src/app/api/temp-registration/[id]/route.ts`, `src/app/api/temp-registration/[id]/status/route.ts`
- **Problema**: Endpoints sin autenticación que retornaban `documento`, `email`, `telefono` de registros en curso. El status endpoint además retornaba el `email` en la respuesta.
- **Impacto**: Cosecha de PII de empresas en proceso de alta.
- **Fix aplicado**: Eliminados `documento`, `email`, `telefono` del `select` en el endpoint de detalle. Eliminado `email` de la respuesta del endpoint de status. El endpoint sigue siendo público (necesario para el flujo de registro sin sesión) pero ya no expone datos sensibles.

### C5 — Token de reset de contraseña expuesto en URL
- **Archivo**: `src/01-actions/auth/reset-password/request-password-reset.ts:31`
- **Problema**: El link de reset incluye el token como query param (`?token=abc&id=uuid`). Queda en historial del navegador, headers `Referer` hacia terceros, logs de acceso de Cloudflare/Vercel, y proxies.
- **Impacto**: Vector de account takeover para cualquier administrador de la plataforma.
- **Estado**: ⬜ PENDIENTE — Requiere cambio en el flujo de reset: el token debería enviarse como POST body o usando un cookie HTTP-only de corta duración.

### C6 — POST /api/send-whatsapp sin autenticación ✅ RESUELTO
- **Archivo**: `src/app/api/send-whatsapp/route.ts`
- **Problema**: Cualquier actor podía enviar mensajes WhatsApp (vía Twilio) a cualquier número usando la cuenta de la plataforma.
- **Fix aplicado**: Agregado `auth()` — retorna 401 si no hay sesión activa.

### C7 — DATABASE_URL logueada en producción ✅ RESUELTO
- **Archivo**: `auth.config.ts`
- **Problema**: `console.log("DATABASE_URL:", process.env.DATABASE_URL)` — credenciales de DB en logs de Vercel.
- **Fix aplicado**: Línea eliminada.

### C8 — Sin rate limiting en ningún endpoint
- **Afecta**: Login, reset-password, todos los endpoints de API.
- **Problema**: Sin throttling, un atacante puede hacer brute-force de contraseñas, enumerar admins por email en el flujo de reset, o disparar el cron en loop con requests paralelos.
- **Estado**: ⬜ PENDIENTE — Implementación recomendada: `@upstash/ratelimit` + Redis (Upstash free tier). Ver Roadmap Paso 10.

### C9 — Push notification subscribe permite reasignar notificaciones a cualquier usuarioId ✅ PARCIALMENTE RESUELTO
- **Archivo**: `src/app/api/notifications/subscribe/route.ts`
- **Problema**: Tomaba `usuarioId` del body sin verificar que existiera o que el solicitante fuera ese usuario.
- **Fix aplicado**: Agregada verificación de existencia del `usuarioId` en DB antes de crear la suscripción. Eliminado el `console.log` que exponía datos del body.
- **Pendiente**: La solución completa requeriría un mecanismo de autenticación para usuarios públicos (no autenticados con NextAuth). Evaluarlo en Mes 2.

---

## ⚠️ Problemas Importantes (Media prioridad)

### M1 — `claveMercadoPago` almacenada sin cifrar
- **Modelo**: `Administrador` en `prisma/schema.prisma`
- **Problema**: El access token de MercadoPago se guarda en texto plano. Un dump de DB expone todos los tokens.
- **Fix recomendado**: Usar el módulo `src/lib/crypto.ts` (ya existe) para cifrar antes de persistir y descifrar al leer.
- **Estado**: ⬜ PENDIENTE

### M2 — Archivo zombie con secreto de webhook hardcodeado ✅ RESUELTO
- **Archivo**: `src/app/api/mercadopago/payment/route.ts` (eliminado)
- **Problema**: Contenía `const webhookSecret = "TU_SECRETO_DE_WEBHOOK"` — código muerto con comentarios de tutorial que dejaba el endpoint expuesto o completamente roto.
- **Fix aplicado**: Archivo eliminado.

### M3 — Dev tunnel hardcodeado en `next.config.ts` ✅ RESUELTO
- **Problema**: `"d4r7slnh-3000.brs.devtunnels.ms"` en `allowedOrigins` de Server Actions permitía requests desde ese túnel en producción.
- **Fix aplicado**: Reemplazado por `process.env.ALLOWED_ORIGIN` (spread condicional). Agregar a `.env` local si se necesita el túnel en dev.

### M4 — Páginas de test/fix-payments accesibles en producción ✅ RESUELTO
- **Archivos**: `src/app/admin/test/page.tsx`, `src/app/admin/fix-payments/page.tsx`
- **Fix aplicado**: Agregado guard `if (process.env.NODE_ENV !== "development") notFound()` en ambas.

### M5 — Arquitectura duplicada: `01-components/` + `components/`, `01-actions/` + `actions/`
- **Problema**: Dos árboles de carpetas paralelos sin límites claros. ~215 archivos en `01-components/`, ~50 en `components/`. La carpeta `nuevo/` dentro de `01-components/` sugiere una refactorización iniciada y abandonada.
- **Impacto**: Confusión para nuevos developers. El código nuevo puede ir al lugar equivocado.
- **Estado**: ⬜ PENDIENTE — Plan de consolidación en Roadmap Paso 20.

### M6 — 20+ instancias de tipo `any` y 6+ `@ts-ignore`
- **Archivos clave**:
  - `src/types/find-user-result.ts` — interface principal con `any`
  - `src/01-components/admin/users/user/pagos/PagosGrid.tsx` — todas las props como `any`
  - `src/01-components/admin/users/list/NuevaTablaDeUsuarios.tsx` — `@ts-ignore` en sorting
  - `src/01-components/admin/users/user/pagos/ModalEditPayment.tsx` — props como `any`
  - `auth.config.ts` — cast `as any` en token callback
- **Impacto**: TypeScript no puede detectar errores en runtime. `strict: true` en tsconfig queda anulado en los puntos más críticos.
- **Estado**: ⬜ PENDIENTE — Ver Roadmap Paso 13.

### M7 — Dos bibliotecas de validación en paralelo
- **Problema**: `zod ^4.0.5` Y `yup ^1.6.1` coexisten. Schemas no están centralizados.
- **Impacto**: Bundle más grande, patrones inconsistentes, schemas duplicados.
- **Estado**: ⬜ PENDIENTE — Ver Roadmap Paso 19.

### M8 — Respuestas de API/Server Actions inconsistentes
- **Problema**: Los actions retornan indistintamente `{ ok: boolean, message }`, `{ success: boolean, data, error }`, `{ error: string }`. El archivo `src/lib/utils/action-errors.ts` define `ActionResponse<T>` pero con ambos campos `ok` y `success` simultáneamente.
- **Impacto**: El frontend hace `.ok`, `.success`, `.error` sin saber qué esperar en cada caso.
- **Estado**: ⬜ PENDIENTE — Ver Roadmap Paso 14.

### M9 — N+1 risk en `getAdminForAuth()`
- **Archivo**: `src/lib/auth/get-admin.ts`
- **Problema**: En cada validación de sesión se hace una cadena de queries: Admin → Empresa → ConfiguracionTarifa → RangosTarifa → ConfiguracionDinamica. Sin caché, esto se ejecuta en cada request server-side.
- **Impacto**: Latencia alta en producción con muchos usuarios concurrentes.
- **Estado**: ⬜ PENDIENTE — Ver Roadmap Paso 26.

### M10 — Missing indexes en Prisma schema ✅ RESUELTO
- **Problema**: `Administrador` (empresaId, configuracionTarifaId), `PasswordResetToken` (adminId, expiresAt), `TempRegistration` (expiresAt) carecían de índices.
- **Fix aplicado**: Agregados `@@index` en los tres modelos.
- **Pendiente**: Ejecutar `pnpm prisma migrate dev --name add_missing_indexes` en staging para aplicar la migración.

### M11 — Lógica de timezone duplicada 3+ veces
- **Archivos**: `ModalCreatePayment.tsx` (2x), `UserForm.tsx`
- **Problema**: La conversión UTC → `America/Argentina/Buenos_Aires` está implementada manualmente con aritmética de offsets.
- **Fix recomendado**: Extraer a `src/lib/utils/timezone.ts` usando `date-fns-tz` (ya instalado).
- **Estado**: ⬜ PENDIENTE

### M12 — Memory leak: `URL.createObjectURL` sin revoke ✅ RESUELTO
- **Archivo**: `src/app/(public)/[empresa]/[documento]/comprobante/PaymentModal.tsx`
- **Fix aplicado**: Agregado `useEffect` con cleanup que llama `URL.revokeObjectURL(previewUrl)` cuando cambia la URL o se desmonta el componente.

### M13 — `manualOverrideEstado` sin trazabilidad
- **Modelo**: `SuscripcionEmpresa` en `prisma/schema.prisma`
- **Problema**: Los campos `manualOverrideEstado` y `manualOverrideHasta` pueden ser modificados sin registro de quién los cambió y cuándo.
- **Fix recomendado**: Agregar `manualOverrideBy String?` y `manualOverrideAt DateTime?` al modelo.
- **Estado**: ⬜ PENDIENTE

---

## 🧹 Mejoras Sugeridas (Baja prioridad)

### B1 — Console.logs en producción ✅ PARCIALMENTE RESUELTO
- Configurada la regla ESLint `"no-console": ["warn", { allow: ["error", "warn"] }]` en `eslint.config.mjs`.
- Sigue pendiente eliminar las 15+ instancias existentes (ahora marcarán como warning en el linter).
- Ejemplos: `console.log("entre aqui")` en `recent-payments.tsx`, múltiples en `temp-registration/status`.

### B2 — Deprecated Tailwind gradient classes
- **Archivos**: `UserDataUnified.tsx`, `UserForm.tsx`, `login/page.tsx` (8+ instancias)
- **Fix**: `bg-gradient-to-r` → `bg-linear-to-r`, `bg-gradient-to-br` → `bg-linear-to-br`, `flex-shrink-0` → `shrink-0`
- **Estado**: ⬜ PENDIENTE

### B3 — Dos bibliotecas de fechas: `date-fns` + `moment-timezone`
- Ambas en el bundle final. `date-fns-tz` ya cubre el timezone handling.
- Migrar todo a `date-fns` + `date-fns-tz`, eliminar `moment-timezone`.
- **Estado**: ⬜ PENDIENTE

### B4 — Solo 2 custom hooks para toda la aplicación
- Oportunidad de extraer lógica repetida: `useAdminSession`, `useUserSearch`, `usePagoActions`.
- **Estado**: ⬜ PENDIENTE

### B5 — Zustand: 3 stores separados
- `useAdminPanelStore`, `useAppStore`, `useSideBarStore`. Unificar con slices.
- **Estado**: ⬜ PENDIENTE

### B6 — TempRegistration sin cleanup automático
- Los registros temporales expirados siguen en la DB. Agregar limpieza en el cron diario.
- **Estado**: ⬜ PENDIENTE

### B7 — Sin soft deletes
- No hay `deletedAt` en ningún modelo. Los registros eliminados se pierden permanentemente.
- **Estado**: ⬜ PENDIENTE

### B8 — Timestamps inconsistentes entre modelos
- Algunos modelos usan `createdAt`/`updatedAt` (convención Prisma), otros usan `fechaCreacion`/`fechaActualizacion`.
- Estandarizar en próxima iteración de schema.
- **Estado**: ⬜ PENDIENTE

### B9 — `skipLibCheck: true` en tsconfig
- Oculta errores de tipos en las declaraciones de dependencias.
- **Estado**: ⬜ PENDIENTE — evaluar desactivar y resolver errores resultantes.

### B10 — Filtros y sort sin `useMemo` en tabla de usuarios
- **Archivo**: `src/01-components/admin/users/list/NuevaTablaDeUsuarios.tsx:123-160`
- `.filter()` y `.sort()` se recalculan en cada render. Con listas grandes esto es un bottleneck.
- **Estado**: ⬜ PENDIENTE

---

## 🏗 Recomendaciones de Arquitectura

### A1 — Consolidar estructura de carpetas (prioridad alta)
Actualmente hay una migración iniciada `01-*` → estructura nueva que quedó inconclusa. Definir una convención y migrar progresivamente:

```
src/
  actions/           # SOLO esta carpeta (deprecar/eliminar 01-actions/)
  components/        # SOLO esta carpeta (deprecar/eliminar 01-components/)
    ui/              # shadcn components
    admin/           # Componentes panel admin
    public/          # Componentes portal público
    shared/          # Componentes transversales
  lib/
    schemas/         # TODOS los schemas Zod centralizados
    utils/
    auth/
    payments/
    notifications/
```

### A2 — Middleware global de autenticación
Crear `src/middleware.ts` que proteja todas las rutas `/admin/*` y `/api/admin/*` a nivel de Edge, en lugar de verificar sesión en cada route handler individualmente. Esto elimina el riesgo de que un nuevo endpoint quede sin proteger por omisión.

### A3 — Contrato único de respuesta para Server Actions
```typescript
// src/lib/types/action-result.ts
type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code?: string }
```
Todos los server actions y API routes deben retornar este tipo. Eliminar el uso de `ok` como alias de `success`.

### A4 — Schema de validación centralizado
Mover todos los schemas Zod a `src/lib/schemas/` con un index barrel. Eliminar Yup completamente. Co-locar tipos TypeScript inferidos desde los schemas con `z.infer<typeof Schema>`.

### A5 — Rate limiting en capa middleware
Implementar con `@upstash/ratelimit` + Redis (Upstash tiene free tier), aplicado en `middleware.ts` para login, reset-password y otros endpoints críticos.

---

## 📈 Roadmap de Mejora (ordenado por impacto/urgencia)

### Semana 1 — Hardening de seguridad crítico ✅ COMPLETADO

| Paso | Tarea | Estado |
|------|-------|--------|
| 1 | Re-habilitar auth en cron diario | ✅ |
| 2 | Auth + ownership en `/api/admin/user/[id]` | ✅ |
| 3 | Auth + SUPER_ADMIN check en `/api/admin/users-report` | ✅ |
| 4 | Reducir PII en temp-registration endpoints | ✅ |
| 5 | Auth en `/api/send-whatsapp` | ✅ |
| 6 | Eliminar DATABASE_URL del console.log | ✅ |
| 7 | Verificación de usuarioId en push notifications | ✅ |
| 8 | Eliminar archivo zombie `/api/mercadopago/payment/route.ts` | ✅ |
| 9 | Dev tunnel a variable de entorno en `next.config.ts` | ✅ |

### Semana 2 — Estabilización de código

| Paso | Tarea | Status |
|------|-------|--------|
| 10 | Implementar rate limiting básico en login y reset-password (puede ser sin Redis como primera iteración con `next-rate-limit`) | ⬜ |
| 11 | Migrar Prisma schema a DB (ejecutar `prisma migrate dev` para aplicar nuevos indexes) | ⬜ |
| 12 | Cifrar `claveMercadoPago` con `src/lib/crypto.ts` antes de guardar/leer | ⬜ |
| 13 | Mover token de reset de contraseña a POST body (C5) | ⬜ |
| 14 | Eliminar páginas `admin/test` y `admin/fix-payments` completamente (o moverlas a routes protegidas) | ✅ Guard agregado |

### Semana 3 — Calidad de código y tipos

| Paso | Tarea | Status |
|------|-------|--------|
| 15 | Eliminar 15+ `console.log` de producción (ESLint ahora avisa) | ⬜ |
| 16 | Tipar correctamente los 5 archivos con mayor densidad de `any` | ⬜ |
| 17 | Estandarizar respuesta de Server Actions con `ActionResult<T>` | ⬜ |
| 18 | Corregir deprecated Tailwind classes (8+ instancias) | ⬜ |
| 19 | Extraer timezone utils a `src/lib/utils/timezone.ts` | ⬜ |

### Mes 2 — Arquitectura

| Paso | Tarea | Status |
|------|-------|--------|
| 20 | Crear `src/middleware.ts` con protección global de rutas admin | ⬜ |
| 21 | Eliminar Yup, centralizar todos los schemas en `src/lib/schemas/` | ⬜ |
| 22 | Plan de consolidación de carpetas (`01-components/` → `components/`) | ⬜ |
| 23 | Implementar rate limiting con Upstash Redis | ⬜ |
| 24 | Agregar soft deletes (`deletedAt`) en modelos Usuario y Pago | ⬜ |
| 25 | Agregar `manualOverrideBy` y `manualOverrideAt` en `SuscripcionEmpresa` | ⬜ |
| 26 | Eliminar `moment-timezone` del bundle | ⬜ |

### Mes 3 — Performance y DX

| Paso | Tarea | Status |
|------|-------|--------|
| 27 | `useMemo` en filtros/sort de `NuevaTablaDeUsuarios` | ⬜ |
| 28 | Cachear `getAdminForAuth()` en el token de sesión (reducir joins por request) | ⬜ |
| 29 | Extraer custom hooks reutilizables (`useAdminSession`, etc.) | ⬜ |
| 30 | Limpieza automática de `TempRegistration` expiradas en cron | ⬜ |
| 31 | Estandarizar timestamps en schema (`createdAt`/`updatedAt` en todos los modelos) | ⬜ |

---

## 🧠 Notas Técnicas

### NT1 — CRON_SECRET en Vercel

Después del fix C1, el cron de Vercel debe configurarse pasando el header de autorización. En `vercel.json` los crons usan el header `Authorization: Bearer $CRON_SECRET` automáticamente si se configura en las variables de entorno del proyecto.

### NT2 — NextAuth v5 beta en producción

La versión `^5.0.0-beta.28` es experimental. Los `@ts-ignore` en los callbacks de sesión son probablemente por cambios de tipos no estabilizados en la beta. Monitorear el release de v5 estable.

### NT3 — Arquitectura de cobros es sólida

La lógica de `FIJA_MENSUAL` vs `DINAMICA_POR_FECHA_INGRESO` con rangos de tarifa está bien modelada. El cron diario que genera pagos y marca vencidos es el corazón correcto del sistema. La seguridad del endpoint del cron es lo que se corrigió primero.

### NT4 — Webhook MercadoPago tiene validación HMAC ✅

`src/app/api/mercadopago/webhooks/route.ts` implementa correctamente la verificación de firma HMAC-SHA256. Este endpoint específico está bien. El archivo zombie (`mercadopago/payment/route.ts`) que fue eliminado era código de tutorial copiado, no el webhook real.

### NT5 — Prisma gestiona bien SQL injection

El uso de Prisma ORM elimina el riesgo de SQL injection por queries parametrizadas. No hay queries raw (`$queryRaw`) identificadas en la base de código.

### NT6 — React Query bien integrado
El patrón de `queryClient.invalidateQueries()` después de server actions es correcto. La inconsistencia está en los query keys (algunos arrays, algunos strings) — unificar al estandarizar arquitectura.

### NT7 — Migración pendiente en Prisma

Después de los nuevos `@@index` agregados al schema, se debe ejecutar:

```bash
pnpm prisma migrate dev --name add_missing_indexes
```

En staging primero, luego en producción con `pnpm prisma migrate deploy`.

---

## ✅ Estado de Implementación

### Semana 1 completada el 15/04/2026

**9 vulnerabilidades críticas/medias resueltas:**

- C1: Cron auth re-habilitado

- C2: Admin user endpoint protegido con auth + ownership

- C3: Users-report protegido, adminId no viene del query param

- C4: PII (documento, email, telefono) eliminada de endpoints públicos

- C6: WhatsApp endpoint requiere sesión

- C7: DATABASE_URL removida de logs

- C9: Push notifications verifican existencia del usuarioId

- M2: Archivo zombie eliminado

- M3: Dev tunnel movido a variable de entorno

**Otras mejoras:**

- M4: Páginas de test/fix-payments protegidas con NODE_ENV guard

- M10: Indexes de BD agregados en Administrador, PasswordResetToken, TempRegistration

- M12: Memory leak del blob URL corregido en PaymentModal

- B1: Regla ESLint `no-console` configurada como warning
