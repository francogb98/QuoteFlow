# AUDITORÍA TÉCNICA — CuotaFacil

> Fecha: 17 de Junio 2026
> Estado: **EN PROGRESO**

---

## CREDENCIALES DEL PROYECTO

- **Nombre**: CuotaFacil (internamente "Vocabite")
- **Stack**: Next.js 16, React 19, TypeScript 5.9, Tailwind CSS 4, shadcn/ui, Prisma 6.9, PostgreSQL 15
- **Despliegue**: Vercel
- **Domain**: cuotafacil.com.ar

---

## P0 — SEGURIDAD Y DATOS (Fix inmediato) ✅ COMPLETADO

### Vulnerabilidades de seguridad

- [x] **`POST /api/mercadopago`** — Sin auth. Cualquiera puede aprobar pagos. Agregar verificación de sesión o firma HMAC.
- [x] **`GET /api/mercadopago`** — Sin auth. Cualquiera consulta detalles de pagos. Agregar verificación de sesión.
- [x] **`POST /api/test/run-daily-cron`** — Endpoint de test en producción sin auth. Eliminar o agregar check `NODE_ENV !== "development"`.
- [x] **`POST /api/payments/upload-comprobante`** — Sin auth. Cualquiera sube comprobantes falsos. Agregar verificación de sesión + ownership check.
- [x] **`POST /api/auth/process-subscription`** — Sin auth. Cualquiera activa suscripciones. Agregar verificación de sesión.
- [x] **`GET /api/temp-registration/[id]/status`** — Sin auth + race condition que crea empresas duplicadas. Agregar locking o idempotency.
- [x] **`POST /api/notifications/subscribe`** — Sin auth. Cualquiera se suscribe a notificaciones de任意 usuario. Agregar verificación de sesión.

### Bugs de seguridad en código

- [x] **`src/lib/crypto.ts`** — IV (initialization vector) reutilizado para TODAS las encriptaciones. AES-256-CBC roto. Fix: generar IV único por cada `encrypt()` call.
- [x] **`src/components/Providers.tsx:6`** — `QueryClient` creado fuera del componente. Causa data leaks entre usuarios en SSR. Fix: mover a `useState` + `useRef`.

### Bugs de integridad de datos

- [x] **`src/actions/users/public/generarPago.ts:25`** — `pagoExistente` se ELIMINA en lugar de actualizarse. Destruye historial financiero. Fix: cambiar `delete` por `update`.

---

## P1 — BUGS CRÍTICOS DE UX ✅ COMPLETADO

- [x] **`src/app/admin/page.tsx`** — Redirect a `/admin/dashboard` que NO EXISTE. Fix: cambiar a `/admin/home`.
- [x] **`src/app/admin/(marketplace)/market/success/page.tsx`** — Mismo redirect roto a `/admin/dashboard`. Fix: cambiar a `/admin/home`.
- [x] **`src/app/auth/reset-password/reset-password-form.tsx`** — Texto corrupto: "contraseÃ±a" en lugar de "contraseña". Fix: re-guardar archivo con UTF-8 encoding correcto.
- [x] **`src/app/(public)/payment/failure/page.tsx:93`** — Botón "Intentar nuevamente" sin `onClick` handler. Fix: agregar redirección al flujo de pago.
- [x] **`src/app/auth/new-account/ui/RegisterForm.tsx`** — Trial redirect va a `/` (landing) en lugar de `/admin/home`. Fix: cambiar URL de destino.
- [x] **`src/app/layout.tsx:27`** — `<html lang="en">` en app española. Fix: cambiar a `<html lang="es">`.
- [x] **`src/app/auth/success/page.tsx:230`** — Icono `CheckCircle` (verde) usado para estado de error. Fix: cambiar por `XCircle` o `AlertCircle`.
- [x] **`src/components/ButtonBack.tsx`** — "Volver atras" sin tilde. Fix: "Volver atrás".
- [x] **`src/01-components/admin/SideBar.tsx:213`** — CSS bug `hiddenrelative` (sin espacio). Fix: `hidden relative`.
- [x] **`src/app/(public)/payment/page.tsx`** — Página placeholder con solo `<h1>Hello Page</h1>`. Fix: eliminar o completar.

---

## P2 — INFRAESTRUCTURA DE ERRORES Y LOADING ✅ COMPLETADO

### Error Boundaries

- [x] Agregar `src/app/error.tsx` — Error boundary global.
- [x] Agregar `src/app/admin/error.tsx` — Error boundary para admin.
- [x] Agregar `src/app/auth/error.tsx` — Error boundary para auth.

### Loading States

- [x] Agregar `src/app/admin/loading.tsx` — Skeleton para transiciones admin.
- [x] Agregar `src/app/admin/home/loading.tsx` — Skeleton para dashboard.
- [x] Agregar `src/app/admin/users/loading.tsx` — Skeleton para lista de usuarios.
- [x] Agregar `src/app/admin/pagos/loading.tsx` — Skeleton para lista de pagos.
- [x] Agregar `src/app/admin/notificaciones/loading.tsx` — Skeleton para notificaciones.
- [x] Agregar `src/app/admin/settings/loading.tsx` — Skeleton para settings.

---

## P3 — CONSOLIDACIÓN DE DIRECTORIOS

### Acciones

- [ ] Migrar contenido de `src/01-actions/` a `src/actions/`.
- [ ] Eliminar `src/01-actions/`.
- [ ] Verificar que todos los imports apunten al directorio consolidado.

### Componentes

- [ ] Migrar componentes válidos de `src/01-components/` a `src/components/`.
- [ ] Eliminar `src/01-components/`.
- [ ] Eliminar componentes obsoletos: `components/admin/Header.tsx` (viejo), `components/NavBar.tsx` (viejo), `01-components/admin/Footer.tsx` (obsoleto).

### Consolidación específica

- [ ] Unificar 2 Headers admin → 1 solo.
- [ ] Unificar 2 NavBars → 1 solo.
- [ ] Unificar 2 Pricing pages → 1 solo (o eliminar la de admin si la landing es la fuente de verdad).
- [ ] Unificar `lib/plans/data.tsx` y `lib/data/plansData.tsx` → 1 solo archivo.
- [ ] Unificar `lib/auth/get-admin.ts` y `actions/users/admin/getAdmin.ts` → 1 solo.
- [ ] Unificar `tieneAcceso.ts` y `subscriptions.ts` → 1 solo módulo de verificación de acceso.

---

## P4 — SISTEMA DE DISEÑO

### Migración a design tokens

- [ ] Migrar `src/components/form/Input.tsx` a design tokens.
- [ ] Migrar `src/components/form/SelectInput.tsx` a design tokens.
- [ ] Migrar `src/components/form/CheckboxInput.tsx` a design tokens.
- [ ] Migrar `src/components/form/Formulario.tsx` a design tokens + responsive.
- [ ] Migrar `src/app/auth/login/ui/LoginForm.tsx` a design tokens.
- [ ] Migrar `src/app/auth/new-account/ui/RegisterForm.tsx` a design tokens.
- [ ] Migrar `src/01-components/admin/users/user/UserForm.tsx` a design tokens.
- [ ] Migrar `src/01-components/admin/users/new/FormCreateUser.tsx` a design tokens.
- [ ] Migrar `src/components/admin/AdminCard.tsx` a design tokens.
- [ ] Migrar `src/components/admin/AdminList.tsx` a design tokens.
- [ ] Migrar `src/components/admin/GlobalUserSidePanel.tsx` a design tokens.
- [ ] Migrar `src/01-components/admin/Header.tsx` a design tokens.
- [ ] Migrar `src/components/DataTable.tsx` a design tokens.
- [ ] Migrar `src/components/admin/tabla-components/*` a design tokens.
- [ ] Migrar `src/components/admin/planes/Planes.tsx` a design tokens.
- [ ] Migrar `src/components/admin/suscripcion-tecnica/SuscripcionTecnicaPanel.tsx` a design tokens.

### Accesibilidad

- [ ] `src/components/ui/spinner.tsx` — Agregar `role="status"`, `aria-live="polite"`, `aria-label="Cargando"`.
- [ ] `src/app/auth/login/ui/LoginForm.tsx` — Agregar `<Label>` al campo password.
- [ ] `src/components/ui/table.tsx` — Agregar `scope="col"` a `<th>`.
- [ ] `src/components/Logo.tsx` — Agregar `<title>` al SVG.
- [ ] `src/components/DataTable.tsx` — Agregar `aria-label` a botones de paginación.
- [ ] Eliminar `alert()` nativo en `notificaciones-dropdown.tsx:131` → usar sonner toast.

---

## P5 — TYPE SAFETY

### Eliminar `any` en funciones financieras críticas

- [ ] `src/lib/cron/01-payments/lib/generarProximoPago.ts` — Definir interfaces para `usuario`, `configuracion`, `pagoReferencia`.
- [ ] `src/actions/admin/users/lib/tariff-utils.ts` — Definir interface para `configuracionTarifa`.
- [ ] `src/actions/admin/users/admin/tarifas/actualizarTarifa.ts` — Definir interface para `data`.
- [ ] `src/actions/admin/users/admin/tarifas/crearTarifa.ts` — Definir interface para `data`.
- [ ] `src/actions/users/public/updateUserPayment.ts` — Definir interface para `payment`.
- [ ] `src/lib/data/dashboardQueries.ts` — Definir interfaces para queries internas.
- [ ] `src/lib/cron/01-payments/daily/orchestrator.ts` — Definir interface para `summary`.

### Eliminar `@ts-ignore`

- [ ] `src/components/AppStoreInitializer.tsx:22-23` — Corregir tipo de `setTarifa`.
- [ ] `src/app/admin/page.tsx:64` — Corregir tipo de `UsersTable`.
- [ ] `src/app/admin/users/page.tsx` — Corregir tipos de searchParams.
- [ ] `src/app/admin/users/[id]/page.tsx` — Corregir acceso a `dinamicas`.
- [ ] `src/app/admin/tarifas/page.tsx` — Corregir tipo de `user`.
- [ ] `src/app/admin/account/page.tsx` — Corregir import.
- [ ] `src/app/admin/codigos/page.tsx` — Corregir tipos.

---

## P6 — ELIMINAR DUPLICACIÓN

### Funciones a consolidar

- [ ] `getNormalizedBusinessDate()` — Existe en `dateUtils.ts` Y `processing-payments-daily.action.ts`. Mantener solo en `dateUtils.ts`.
- [ ] `findTarifaRangeForDate` / `getApplicableTariffRange` — Existe en `calculations.ts` Y `tariff-utils.ts`. Mantener solo en `tariff-utils.ts`.
- [ ] `clampPage` / `clampPageSize` — Existe en `super-admin-dashboard.ts` Y `super-admin-whatsapp.ts`. Extraer a `lib/utils/pagination.ts`.
- [ ] Notificación de vencimientos fijos vs dinámicos — `notificarVencimientosFijos.ts` y `notificarVencimientosDinamicos.ts` son casi idénticos. Unificar en función parametrizada.
- [ ] Tarifa upsert logic — Existe en `actualizarTarifa.ts` Y `lib/config/tariff.ts`. Mantener solo en `lib/config/tariff.ts`.
- [ ] Subscription access check — Existe en `tieneAcceso.ts` Y `subscriptions.ts`. Unificar en un solo módulo.

---

## P7 — PERFORMANCE

### Queries optimizadas

- [ ] `src/lib/data/dashboardQueries.ts` — Dividir `getDashboardData` (619 líneas, 15+ queries) en funciones más pequeñas.
- [ ] `src/lib/data/dashboardQueries.ts` — Paginar query de usuarios (query #11 trae TODOS sin límite).
- [ ] `src/lib/data/dashboardQueries.ts` — Eliminar duplicación de query `pagosPagadosMes` / `detallesPagados`.
- [ ] `src/lib/cron/01-payments/daily/orchestrator.ts` — Eliminar N+1: reemplazar `findFirst` por loop con `findMany`.
- [ ] `src/actions/users/public/findUser.ts` — Eliminar N+1: reemplazar loop de `findFirst` por query con `OR`.
- [ ] `src/actions/admin/users/admin/tarifas/actualizarTarifa.ts` — Batch update de usuarios en lugar de loop con `updateMany` individual.

### Optimizaciones de bundle

- [ ] Eliminar `moment-timezone` (~300KB) → usar solo `date-fns`.
- [ ] Revisar si `framer-motion` se usa lo suficiente para justificar el bundle.
- [ ] Revisar si `react-datepicker` + `react-day-picker` ambos son necesarios.

### Caché

- [ ] `auth.config.ts` — Agregar caché corta (5 min) al `session` callback que consulta DB.
- [ ] `src/lib/auth/get-admin.ts` — Agregar caché de revalidation para datos de admin.

---

## P8 — ACCESIBILIDAD

- [x] `<html lang="en">` → `<html lang="es">` en `layout.tsx`.
- [ ] Spinner sin `role="status"` ni `aria-label`.
- [ ] Password field sin `<Label>` en login.
- [ ] Tabla sin `scope="col"` en `<th>`.
- [ ] Logo SVG sin `<title>`.
- [ ] Botones de paginación sin `aria-label`.
- [ ] `alert()` nativo en lugar de componentes accesibles.
- [ ] Botón hamburger sin `aria-label` en Header.

---

## P9 — FEATURES NUEVAS (Post-fix)

### Quick wins de producto

- [ ] Exportación CSV de usuarios.
- [ ] Exportación CSV de pagos.
- [ ] Wizard de onboarding post-registro (checklist de 3-5 pasos).
- [ ] Confirmation dialogs antes de acciones destructivas (eliminar notificación, etc.).
- [ ] Estados vacíos descriptivos en todas las listas.

### Features de alto valor

- [ ] Dashboard analítico con gráficos de tendencia de cobranza.
- [ ] Recordatorios automáticos configurables por el admin.
- [ ] Reportes programables (email automático semanal de estado de cobranza).
- [ ] Filtros avanzados en lista de usuarios (por estado de pago, rango de fechas, etc.).
- [ ] Búsqueda de usuarios por nombre o DNI desde el dashboard.
- [ ] Badges de estado visual (dots de color) en la lista de usuarios.

---

## VERIFICACIÓN FINAL

### Checklist de calidad

- [ ] `npm run lint` pasa sin errores.
- [ ] `npm run build` completa sin errores.
- [ ] Todos los endpoints sensibles requieren autenticación.
- [ ] Login funciona correctamente (redirect a `/admin/home`).
- [ ] Reset password muestra texto legible ("contraseña").
- [ ] Trial redirect lleva al dashboard, no a la landing.
- [ ] Dark mode funciona en toda la app.
- [ ] No hay `any` en funciones financieras.
- [ ] No hay `@ts-ignore` en el proyecto.
- [ ] No hay `console.log` de datos sensibles.
- [ ] Spinner anuncia estado de carga a lectores de pantalla.
- [ ] Todos los formularios tienen labels asociados.

---

## SCORING FINAL

| Categoría | Antes | Actual | Meta |
|-----------|-------|--------|------|
| Arquitectura | 4/10 | 5/10 | 7/10 |
| Código | 3/10 | 4/10 | 7/10 |
| Base de Datos | 5/10 | 5/10 | 7/10 |
| Performance | 4/10 | 4/10 | 7/10 |
| UI | 4/10 | 4/10 | 7/10 |
| UX | 3/10 | 5/10 | 7/10 |
| Escalabilidad | 3/10 | 3/10 | 7/10 |
| Producto | 4/10 | 4/10 | 6/10 |
| Preparación para vender | 2/10 | 4/10 | 6/10 |
