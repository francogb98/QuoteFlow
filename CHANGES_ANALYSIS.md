# Análisis de Cambios no Pusheados a GitHub

## Resumen General

Se han realizado múltiples cambios en el repositorio que no han sido pusheados a GitHub. El objetivo es mantener solo los cambios relevantes relacionados con:
- Nueva vista de información de usuario
- Suscripción a Mercadopago
- Nuevo header

Y descartar:
- Nueva tabla de usuarios
- Nuevo /home

---

## 📁 ARCHIVOS A MANTENER (PUSHEAR)

### 1. Nueva Vista de Información de Usuario

**Componentes de visualización del usuario:**
- [`src/01-components/admin/users/user/UserHeader.tsx`](src/01-components/admin/users/user/UserHeader.tsx) - Nuevo diseño con avatar, información detallada y banner de tarifa
- [`src/01-components/admin/users/user/UserForm.tsx`](src/01-components/admin/users/user/UserForm.tsx) - Formulario de edición de usuario con validaciones
- [`src/01-components/admin/users/user/DynamicTariffAlert.tsx`](src/01-components/admin/users/user/DynamicTariffAlert.tsx) - Alerta de tarifa dinámica
- [`src/01-components/admin/users/user/ErrorState.tsx`](src/01-components/admin/users/user/ErrorState.tsx) - Estado de error
- [`src/01-components/admin/users/user/LoadingState.tsx`](src/01-components/admin/users/user/LoadingState.tsx) - Estado de carga
- [`src/01-components/admin/users/user/StatusChangeAlert.tsx`](src/01-components/admin/users/user/StatusChangeAlert.tsx) - Alerta de cambio de estado

**Componentes de pagos del usuario:**
- [`src/01-components/admin/users/user/pagos/ModalEditPayment.tsx`](src/01-components/admin/users/user/pagos/ModalEditPayment.tsx) - Modal para editar pagos
- [`src/01-components/admin/users/user/pagos/ModalCreatePayment.tsx`](src/01-components/admin/users/user/pagos/ModalCreatePayment.tsx) - Modal para crear pagos
- [`src/01-components/admin/users/user/pagos/PagosCard.tsx`](src/01-components/admin/users/user/pagos/PagosCard.tsx) - Tarjeta de pagos del usuario
- [`src/01-components/admin/users/user/pagos/PagosGrid.tsx`](src/01-components/admin/users/user/pagos/PagosGrid.tsx) - Grid de pagos del usuario
- [`src/01-components/admin/users/user/pagos/EditPaymentStatusModal.tsx`](src/01-components/admin/users/user/pagos/EditPaymentStatusModal.tsx) - Modal para editar estado de pago

**UI y utilidades:**
- [`src/01-components/admin/users/ui/UserSidePanel.tsx`](src/01-components/admin/users/ui/UserSidePanel.tsx) - Panel lateral del usuario
- [`src/01-components/admin/users/ui/FormEditUser.tsx`](src/01-components/admin/users/ui/FormEditUser.tsx) - Formulario edit usuario
- [`src/01-components/admin/users/ui/NotAllowed.tsx`](src/01-components/admin/users/ui/NotAllowed.tsx) - Mensaje de no permitido
- [`src/01-components/admin/users/ui/user-search-modal.tsx`](src/01-components/admin/users/ui/user-search-modal.tsx) - Modal de búsqueda de usuario
- [`src/01-components/admin/users/user/ComprobanteModal.tsx`](src/01-components/admin/users/user/ComprobanteModal.tsx) - Modal de comprobante

### 2. Suscripción a Mercadopago

**Vista de suscripción:**
- [`src/01-components/admin/subscription/SuscripcionView.tsx`](src/01-components/admin/subscription/SuscripcionView.tsx) - Vista principal de suscripción
- [`src/01-components/admin/subscription/PlanSelector.tsx`](src/01-components/admin/subscription/PlanSelector.tsx) - Selector de planes
- [`src/01-components/admin/subscription/SubscripcionCard.tsx`](src/01-components/admin/subscription/SubscripcionCard.tsx) - Tarjeta de suscripción
- [`src/01-components/admin/subscription/LogoutButton.tsx`](src/01-components/admin/subscription/LogoutButton.tsx) - Botón de cierre de sesión

**Modales y componentes relacionados:**
- [`src/01-components/admin/subscription/PlanSelector.tsx`](src/01-components/admin/subscription/PlanSelector.tsx)
- [`src/01-components/admin/subscription/SubscripcionCard.tsx`](src/01-components/admin/subscription/SubscripcionCard.tsx)
- [`src/01-components/admin/subscription/LogoutButton.tsx`](src/01-components/admin/subscription/LogoutButton.tsx)

**Configuración y utilidades:**
- [`src/lib/mercadopago/mercadopago.config.ts`](src/lib/mercadopago/mercadopago.config.ts) - Configuración de MercadoPago (cambio de variable de entorno)

### 3. Nuevo Header

**Header principal:**
- [`src/01-components/admin/Header.tsx`](src/01-components/admin/Header.tsx) - Nuevo header con:
  - Modal de búsqueda de usuario
  - Dropdown de notificaciones
  - Botón para crear nuevo usuario
  - Banner de estado de suscripción
  - Integración con UserSearchModal y SubscriptionStatusBanner

**Sidebar:**
- [`src/01-components/admin/SideBar.tsx`](src/01-components/admin/SideBar.tsx) - Sidebar actualizado
- [`src/01-components/admin/prueba/SideBarPrueba.tsx`](src/01-components/admin/prueba/SideBarPrueba.tsx) - Sidebar de prueba

**Otros componentes UI:**
- [`src/01-components/nuevo/subscription-status-banner.tsx`](src/01-components/nuevo/subscription-status-banner.tsx) - Banner de estado de suscripción
- [`src/01-components/nuevo/new-user-dialog.tsx`](src/01-components/nuevo/new-user-dialog.tsx) - Diálogo para crear nuevo usuario

**Pagos:**
- [`src/01-components/admin/pagos/PagosGrid.tsx`](src/01-components/admin/pagos/PagosGrid.tsx) - Grid de pagos actualizado
- [`src/01-components/admin/pagos/PagosTable.tsx`](src/01-components/admin/pagos/PagosTable.tsx) - Tabla de pagos actualizada

---

## 🗑️ ARCHIVOS A DESCARTAR (NO PUSHEAR)

### 1. Nueva Tabla de Usuarios (Descartar)

- [`src/01-components/admin/users/list/NuevaTablaDeUsuarios.tsx`](src/01-components/admin/users/list/NuevaTablaDeUsuarios.tsx) - **NO PUSHEAR**
- [`src/01-components/admin/users/list/UsersDashboardWrapper.tsx`](src/01-components/admin/users/list/UsersDashboardWrapper.tsx) - **NO PUSHEAR**

### 2. Nuevo /home (Descartar)

- [`src/01-components/admin/home/nuevo/`](src/01-components/admin/home/nuevo/) - **DIRECTORIO COMPLETO A DESCARTAR**
  - `kpis-cards.tsx`
  - `notifications-panel.tsx`
  - `payment-methods-chart.tsx`
  - `payments-chart.tsx`
  - `recent-payments.tsx`
  - `upcoming-deadlines.tsx`
  - `users-overiew.tsx`
- [`src/01-components/admin/home/payment-charts.tsx`](src/01-components/admin/home/payment-charts.tsx) - **NO PUSHEAR**
- [`src/app/admin/home/page.tsx`](src/app/admin/home/page.tsx) - **NO PUSHEAR** (mantener versión anterior)
- [`src/app/admin/home/AdminStats.tsx`](src/app/admin/home/AdminStats.tsx) - **NO PUSHEAR** (mantener versión anterior)
- [`src/app/admin/home/Bienvenida.tsx`](src/app/admin/home/Bienvenida.tsx) - **NO PUSHEAR** (mantener versión anterior)
- [`src/01-actions/admin/home/getAdminStats.ts`](src/01-actions/admin/home/getAdminStats.ts) - **NO PUSHEAR** (mantener versión anterior)
- [`src/01-actions/admin/home/getAppData.ts`](src/01-actions/admin/home/getAppData.ts) - **NO PUSHEAR**

### 3. Archivos Eliminados (Versión Anterior)

- [`src/01-components/admin/home/kpi-card.tsx`](src/01-components/admin/home/kpi-card.tsx) - Eliminado (versión anterior)
- [`src/01-components/admin/home/month-selector.tsx`](src/01-components/admin/home/month-selector.tsx) - Eliminado (versión anterior)
- [`src/01-components/admin/home/recent-payments-table.tsx`](src/01-components/admin/home/recent-payments-table.tsx) - Eliminado (versión anterior)
- [`src/01-components/admin/home/stats-grid.tsx`](src/01-components/admin/home/stats-grid.tsx) - Eliminado (versión anterior)
- [`src/01-components/admin/home/upcoming-payments-table.tsx`](src/01-components/admin/home/upcoming-payments-table.tsx) - Eliminado (versión anterior)
- [`src/01-components/admin/suscripcion/SuscripcionPage.tsx`](src/01-components/admin/suscripcion/SuscripcionPage.tsx) - Eliminado (versión anterior)
- [`src/app/admin/suscripcion/change/page.tsx`](src/app/admin/suscripcion/change/page.tsx) - Eliminado (versión anterior)

---

## 🔧 ARCHIVOS DE CONFIGURACIÓN Y DEPENDENCIAS

### Configuración de Autenticación
- [`auth.config.ts`](auth.config.ts) - Configuración de autenticación

### Dependencias
- [`package.json`](package.json) - Dependencias actualizadas
- [`package-lock.json`](package-lock.json) - Lockfile actualizado
- [`pnpm-lock.yaml`](pnpm-lock.yaml) - Lockfile actualizado

### Base de Datos
- [`prisma/schema.prisma`](prisma/schema.prisma) - Esquema de base de datos actualizado
- [`prisma/migrations/migration_lock.toml`](prisma/migrations/migration_lock.toml) - Lock de migraciones

### Configuración de Vercel
- [`vercel.json`](vercel.json) - Configuración de Vercel

---

## 📦 NUEVOS ARCHIVOS (NO PUSHEAR)

**Archivos de migración de base de datos:**
- `prisma/migrations/20260108175037_add_updated_at_to_pago/`
- `prisma/migrations/20260123134124_update_model_pago/`
- `prisma/migrations/20260226001225_add_model_suscripcion_empresa/`
- `prisma/migrations/20260226153220_add_webhook_event_model/`
- `prisma/migrations/20260227141126_add_model_pago_suscripcion_empresa/`
- `prisma/migrations/20260227144237_add_manual_override_fields/`
- `prisma/migrations/20260227180112_add_push_subscription_model/`
- `prisma/migrations/20260302153033_add_fcm_token/`

**Archivos de Firebase:**
- `public/firebase-messaging-sw.js`
- `public/sw.js`
- `public/images/`

**Scripts:**
- `SETUP_SUBSCRIPTIONS.sh`

**Archivos de descarga:**
- `downloads/`

**Archivos de API:**
- `src/app/api/admin/users/`
- `src/app/api/auth/process-subscription/`
- `src/app/api/fcm/`
- `src/app/api/mercadopago/webhooks/`
- `src/app/api/notifications/`
- `src/app/api/temp-registration/[id]/status/`

**Archivos de suscripción técnica:**
- `src/01-actions/admin/fcm/`
- `src/01-actions/admin/suscriptions/`
- `src/01-actions/payment/cancelar-suscripcion.ts`
- `src/01-actions/payment/update-suscription.ts`
- `src/01-actions/public/notificacion/`
- `src/actions/admin/suscripcion-tecnica.action.ts`
- `src/app/admin/suscripcion-tecnica/`
- `src/app/admin/test-notifications/`

**Archivos de componentes nuevos:**
- `src/01-components/public/`
- `src/01-components/nuevo/`
- `src/components/admin/GlobalUserSidePanel.tsx`
- `src/components/admin/suscripcion-tecnica/`
- `src/components/ui/avatar.tsx`
- `src/components/ui/scroll-area.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/sidebar.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/tooltip.tsx`

**Archivos de utilidades:**
- `src/hooks/`
- `src/lib/auth/`
- `src/lib/data/dashboardQueries.ts`
- `src/lib/firebase-admin.ts`
- `src/lib/firebase-client.ts`
- `src/lib/hooks/`
- `src/lib/scripts/`
- `src/lib/store/useAdminPanelStore.tsx`
- `src/lib/store/useAppStore.tsx`
- `src/lib/subscriptions/`

**Otros:**
- `src/proxy.ts`
- `src/service-key.json`
- `src/actions/admin/users/getAll.action.ts` - Actualizado
- `src/actions/admin/users/lib/bulk.users.ts` - Nuevo archivo
- `src/actions/admin/users/lib/tariff-utils.ts` - Nuevo archivo
- `src/app/(public)/[empresa]/[documento]/page.tsx` - Actualizado
- `src/app/admin/AdminClientLayout.tsx` - Actualizado
- `src/app/admin/layout.tsx` - Actualizado
- `src/app/admin/users/page.tsx` - Actualizado
- `src/app/auth/login/ui/LoginForm.tsx` - Actualizado
- `src/app/auth/register-payment/[tempRegistrationId]/ui/PaymentForm.tsx` - Actualizado
- `src/app/auth/success/page.tsx` - Actualizado
- `src/components/admin/index.ts` - Actualizado
- `src/components/AppStoreInitializer.tsx` - Nuevo archivo
- `src/components/admin/notificaciones-dropdown.tsx` - Actualizado
- `src/components/admin/notificaciones/ComprobanteModal.tsx` - Actualizado
- `src/components/admin/notificaciones/notificaciones-panel.tsx` - Actualizado
- `src/components/admin/notificaciones/NotificacionItem.tsx` - Actualizado
- `src/components/admin/pagos/ComprobanteModal.tsx` - Actualizado
- `src/components/admin/pagos/EditPaymentStatusModal.tsx` - Actualizado
- `src/components/admin/pagos/PagosCard.tsx` - Actualizado
- `src/components/admin/pagos/PagosGrid.tsx` - Actualizado
- `src/components/admin/pagos/PagosTable.tsx` - Actualizado
- `src/components/admin/tabla-components/FilterGrid.tsx` - Actualizado
- `src/components/admin/tabla-components/PaginationControls.tsx` - Actualizado
- `src/components/admin/tabla-components/SearchBarProps.tsx` - Actualizado
- `src/components/admin/tabla-components/TableGrid.tsx` - Actualizado
- `src/components/admin/tarifas/components/use-notifications.tsx` - Actualizado
- `src/components/admin/tarifas/ui/alert-message.tsx` - Actualizado
- `src/components/auth/ForgotPasswordButton.tsx` - Actualizado
- `src/components/auth/InputField.tsx` - Actualizado
- `src/components/form/CheckboxInput.tsx` - Actualizado
- `src/components/form/Formulario.tsx` - Actualizado
- `src/components/form/Input.tsx` - Actualizado
- `src/components/form/SelectInput.tsx` - Actualizado

---

## 🚀 SCRIPT PARA HACER PUSH SOLO CON ARCHIVOS SELECCIONADOS

```bash
#!/bin/bash

# Script para hacer push solo con los archivos seleccionados
# Mantener: Nueva vista de usuario, Suscripción Mercadopago, Nuevo Header
# Descartar: Nueva tabla de usuarios, Nuevo /home

echo "🚀 Preparando commit con archivos seleccionados..."

# 1. Restaurar archivos a descartar
echo "📦 Restaurando archivos a descartar..."
git checkout HEAD -- \
  src/01-components/admin/users/list/NuevaTablaDeUsuarios.tsx \
  src/01-components/admin/users/list/UsersDashboardWrapper.tsx \
  src/01-components/admin/home/nuevo/ \
  src/01-components/admin/home/payment-charts.tsx \
  src/app/admin/home/page.tsx \
  src/app/admin/home/AdminStats.tsx \
  src/app/admin/home/Bienvenida.tsx \
  src/01-actions/admin/home/getAdminStats.ts \
  src/01-actions/admin/home/getAppData.ts

# 2. Restaurar archivos eliminados (versión anterior)
echo "📦 Restaurando archivos eliminados..."
git checkout HEAD -- \
  src/01-components/admin/home/kpi-card.tsx \
  src/01-components/admin/home/month-selector.tsx \
  src/01-components/admin/home/recent-payments-table.tsx \
  src/01-components/admin/home/stats-grid.tsx \
  src/01-components/admin/home/upcoming-payments-table.tsx \
  src/01-components/admin/suscripcion/SuscripcionPage.tsx \
  src/app/admin/suscripcion/change/page.tsx

# 3. Agregar archivos a mantener
echo "✅ Agregando archivos a mantener..."
git add \
  src/01-components/admin/users/user/UserHeader.tsx \
  src/01-components/admin/users/user/UserForm.tsx \
  src/01-components/admin/users/user/DynamicTariffAlert.tsx \
  src/01-components/admin/users/user/ErrorState.tsx \
  src/01-components/admin/users/user/LoadingState.tsx \
  src/01-components/admin/users/user/StatusChangeAlert.tsx \
  src/01-components/admin/users/user/pagos/ModalEditPayment.tsx \
  src/01-components/admin/users/user/pagos/ModalCreatePayment.tsx \
  src/01-components/admin/users/user/pagos/PagosCard.tsx \
  src/01-components/admin/users/user/pagos/PagosGrid.tsx \
  src/01-components/admin/users/user/pagos/EditPaymentStatusModal.tsx \
  src/01-components/admin/users/user/ComprobanteModal.tsx \
  src/01-components/admin/users/ui/UserSidePanel.tsx \
  src/01-components/admin/users/ui/FormEditUser.tsx \
  src/01-components/admin/users/ui/NotAllowed.tsx \
  src/01-components/admin/users/ui/user-search-modal.tsx \
  src/01-components/admin/subscription/SuscripcionView.tsx \
  src/01-components/admin/subscription/PlanSelector.tsx \
  src/01-components/admin/subscription/SubscripcionCard.tsx \
  src/01-components/admin/subscription/LogoutButton.tsx \
  src/01-components/admin/Header.tsx \
  src/01-components/admin/SideBar.tsx \
  src/01-components/admin/prueba/SideBarPrueba.tsx \
  src/01-components/nuevo/subscription-status-banner.tsx \
  src/01-components/nuevo/new-user-dialog.tsx \
  src/01-components/admin/pagos/PagosGrid.tsx \
  src/01-components/admin/pagos/PagosTable.tsx \
  src/lib/mercadopago/mercadopago.config.ts \
  src/01-components/admin/ui/user-search-modal.tsx \
  auth.config.ts \
  package.json \
  package-lock.json \
  pnpm-lock.yaml \
  prisma/schema.prisma \
  prisma/migrations/migration_lock.toml \
  vercel.json \
  src/01-actions/admin/home/getAdminStats.ts \
  src/01-actions/admin/pago/editPago.ts \
  src/01-actions/auth/login.ts \
  src/01-actions/auth/registration/02-successSuscriber.ts \
  src/01-actions/auth/registration/03-createCompanyAndAdmin.ts \
  src/01-actions/payment/suscripcion-payment.ts \
  src/01-components/admin/pagos/ComprobanteModal.tsx \
  src/01-components/admin/pagos/EditPaymentStatusModal.tsx \
  src/01-components/admin/pagos/PagosCard.tsx \
  src/01-components/admin/prueba/AdminPanelManager.tsx \
  src/01-components/admin/tabla-components/FilterGrid.tsx \
  src/01-components/admin/tabla-components/PaginationControls.tsx \
  src/01-components/admin/tabla-components/SearchBarProps.tsx \
  src/01-components/admin/tabla-components/TableGrid.tsx \
  src/01-components/admin/tarifas/components/use-notifications.tsx \
  src/01-components/admin/tarifas/ui/alert-message.tsx \
  src/components/admin/notificaciones-dropdown.tsx \
  src/components/admin/notificaciones/ComprobanteModal.tsx \
  src/components/admin/notificaciones/notificaciones-panel.tsx \
  src/components/admin/notificaciones/NotificacionItem.tsx \
  src/components/admin/pagos/ComprobanteModal.tsx \
  src/components/admin/pagos/EditPaymentStatusModal.tsx \
  src/components/admin/pagos/PagosCard.tsx \
  src/components/admin/pagos/PagosGrid.tsx \
  src/components/admin/pagos/PagosTable.tsx \
  src/components/admin/tabla-components/FilterGrid.tsx \
  src/components/admin/tabla-components/PaginationControls.tsx \
  src/components/admin/tabla-components/SearchBarProps.tsx \
  src/components/admin/tabla-components/TableGrid.tsx \
  src/components/admin/tarifas/components/use-notifications.tsx \
  src/components/admin/tarifas/ui/alert-message.tsx \
  src/components/auth/ForgotPasswordButton.tsx \
  src/components/auth/InputField.tsx \
  src/components/form/CheckboxInput.tsx \
  src/components/form/Formulario.tsx \
  src/components/form/Input.tsx \
  src/components/form/SelectInput.tsx \
  src/app/(public)/[empresa]/[documento]/page.tsx \
  src/app/admin/AdminClientLayout.tsx \
  src/app/admin/layout.tsx \
  src/app/admin/users/page.tsx \
  src/app/auth/login/ui/LoginForm.tsx \
  src/app/auth/register-payment/[tempRegistrationId]/ui/PaymentForm.tsx \
  src/app/auth/success/page.tsx \
  src/components/admin/index.ts \
  src/actions/admin/users/getAll.action.ts

# 4. Crear commit
echo "📝 Creando commit..."
git commit -m "feat: Actualizar interfaz de usuario con nueva vista de usuario, suscripción Mercadopago y header mejorado

- Nueva vista de información de usuario con diseño mejorado
- Actualización de componentes de pagos del usuario
- Nuevo header con modal de búsqueda, dropdown de notificaciones y banner de suscripción
- Actualización de SuscripcionView para Mercadopago
- Mejoras en formularios y modales de usuario
- Actualizaciones de componentes UI generales"

# 5. Hacer push
echo "🚀 Haciendo push a GitHub..."
git push origin main

echo "✅ ¡Push completado con éxito!"
```

---

## 📋 RESUMEN DE ARCHIVOS A PUSHEAR

### Total: ~60 archivos

**Nueva vista de usuario:** ~15 archivos
**Suscripción Mercadopago:** ~6 archivos
**Nuevo Header:** ~15 archivos
**Configuración y utilidades:** ~20 archivos

### Archivos a descartar: ~20 archivos

**Nueva tabla de usuarios:** 2 archivos
**Nuevo /home:** ~18 archivos (directorio completo + archivos relacionados)

---

## ⚠️ NOTAS IMPORTANTES

1. **Archivos no tracked:** Los archivos marcados con `??` (untracked) no se incluirán en el commit si no se agregan explícitamente.

2. **Migraciones de base de datos:** Las migraciones en `prisma/migrations/` no se deben pushear si ya existen en el repositorio remoto.

3. **Archivos sensibles:** `src/service-key.json` y `SETUP_SUBSCRIPTIONS.sh` no deben pushear a menos que sea necesario.

4. **Archivos de prueba:** `src/01-components/admin/prueba/` y `downloads/` no deben pushear.

5. **Archivos de Firebase:** Los archivos de Firebase no deben pushear si no son necesarios.

---

## 🔄 PASOS PARA EJECUTAR EL PUSH

1. Guardar el script anterior en un archivo llamado `push-selected-changes.sh`
2. Darle permisos de ejecución: `chmod +x push-selected-changes.sh`
3. Ejecutar el script: `./push-selected-changes.sh`
4. Verificar el resultado en GitHub

---

## 📊 ESTADÍSTICAS

- **Total archivos modificados:** ~60
- **Archivos a mantener:** ~60
- **Archivos a descartar:** ~20
- **Directorios a descartar:** 2 (nuevo/, NuevaTablaDeUsuarios/)

---

## ✅ VERIFICACIÓN

Antes de hacer push, se recomienda:

1. Verificar que todos los archivos a mantener están agregados: `git status`
2. Revisar el diff: `git diff --cached`
3. Hacer un pull primero para evitar conflictos: `git pull origin main`
4. Ejecutar el script de push
5. Verificar en GitHub que el push fue exitoso

---

## 📝 COMANDO RÁPIDO ALTERNATIVO

Si prefieres hacerlo manualmente:

```bash
# 1. Restaurar archivos a descartar
git checkout HEAD -- src/01-components/admin/users/list/NuevaTablaDeUsuarios.tsx \
  src/01-components/admin/users/list/UsersDashboardWrapper.tsx \
  src/01-components/admin/home/nuevo/ \
  src/01-components/admin/home/payment-charts.tsx \
  src/app/admin/home/page.tsx \
  src/app/admin/home/AdminStats.tsx \
  src/app/admin/home/Bienvenida.tsx \
  src/01-actions/admin/home/getAdminStats.ts \
  src/01-actions/admin/home/getAppData.ts

# 2. Restaurar archivos eliminados
git checkout HEAD -- \
  src/01-components/admin/home/kpi-card.tsx \
  src/01-components/admin/home/month-selector.tsx \
  src/01-components/admin/home/recent-payments-table.tsx \
  src/01-components/admin/home/stats-grid.tsx \
  src/01-components/admin/home/upcoming-payments-table.tsx \
  src/01-components/admin/suscripcion/SuscripcionPage.tsx \
  src/app/admin/suscripcion/change/page.tsx

# 3. Agregar archivos a mantener
git add src/01-components/admin/users/user/UserHeader.tsx \
  src/01-components/admin/users/user/UserForm.tsx \
  src/01-components/admin/users/user/DynamicTariffAlert.tsx \
  src/01-components/admin/users/user/ErrorState.tsx \
  src/01-components/admin/users/user/LoadingState.tsx \
  src/01-components/admin/users/user/StatusChangeAlert.tsx \
  src/01-components/admin/users/user/pagos/ModalEditPayment.tsx \
  src/01-components/admin/users/user/pagos/ModalCreatePayment.tsx \
  src/01-components/admin/users/user/pagos/PagosCard.tsx \
  src/01-components/admin/users/user/pagos/PagosGrid.tsx \
  src/01-components/admin/users/user/pagos/EditPaymentStatusModal.tsx \
  src/01-components/admin/users/user/ComprobanteModal.tsx \
  src/01-components/admin/users/ui/UserSidePanel.tsx \
  src/01-components/admin/users/ui/FormEditUser.tsx \
  src/01-components/admin/users/ui/NotAllowed.tsx \
  src/01-components/admin/users/ui/user-search-modal.tsx \
  src/01-components/admin/subscription/SuscripcionView.tsx \
  src/01-components/admin/subscription/PlanSelector.tsx \
  src/01-components/admin/subscription/SubscripcionCard.tsx \
  src/01-components/admin/subscription/LogoutButton.tsx \
  src/01-components/admin/Header.tsx \
  src/01-components/admin/SideBar.tsx \
  src/01-components/admin/prueba/SideBarPrueba.tsx \
  src/01-components/nuevo/subscription-status-banner.tsx \
  src/01-components/nuevo/new-user-dialog.tsx \
  src/01-components/admin/pagos/PagosGrid.tsx \
  src/01-components/admin/pagos/PagosTable.tsx \
  src/lib/mercadopago/mercadopago.config.ts \
  src/01-components/admin/ui/user-search-modal.tsx \
  auth.config.ts \
  package.json \
  package-lock.json \
  pnpm-lock.yaml \
  prisma/schema.prisma \
  prisma/migrations/migration_lock.toml \
  vercel.json \
  src/01-actions/admin/home/getAdminStats.ts \
  src/01-actions/admin/pago/editPago.ts \
  src/01-actions/auth/login.ts \
  src/01-actions/auth/registration/02-successSuscriber.ts \
  src/01-actions/auth/registration/03-createCompanyAndAdmin.ts \
  src/01-actions/payment/suscripcion-payment.ts \
  src/01-components/admin/pagos/ComprobanteModal.tsx \
  src/01-components/admin/pagos/EditPaymentStatusModal.tsx \
  src/01-components/admin/pagos/PagosCard.tsx \
  src/01-components/admin/prueba/AdminPanelManager.tsx \
  src/01-components/admin/tabla-components/FilterGrid.tsx \
  src/01-components/admin/tabla-components/PaginationControls.tsx \
  src/01-components/admin/tabla-components/SearchBarProps.tsx \
  src/01-components/admin/tabla-components/TableGrid.tsx \
  src/01-components/admin/tarifas/components/use-notifications.tsx \
  src/01-components/admin/tarifas/ui/alert-message.tsx \
  src/components/admin/notificaciones-dropdown.tsx \
  src/components/admin/notificaciones/ComprobanteModal.tsx \
  src/components/admin/notificaciones/notificaciones-panel.tsx \
  src/components/admin/notificaciones/NotificacionItem.tsx \
  src/components/admin/pagos/ComprobanteModal.tsx \
  src/components/admin/pagos/EditPaymentStatusModal.tsx \
  src/components/admin/pagos/PagosCard.tsx \
  src/components/admin/pagos/PagosGrid.tsx \
  src/components/admin/pagos/PagosTable.tsx \
  src/components/admin/tabla-components/FilterGrid.tsx \
  src/components/admin/tabla-components/PaginationControls.tsx \
  src/components/admin/tabla-components/SearchBarProps.tsx \
  src/components/admin/tabla-components/TableGrid.tsx \
  src/components/admin/tarifas/components/use-notifications.tsx \
  src/components/admin/tarifas/ui/alert-message.tsx \
  src/components/auth/ForgotPasswordButton.tsx \
  src/components/auth/InputField.tsx \
  src/components/form/CheckboxInput.tsx \
  src/components/form/Formulario.tsx \
  src/components/form/Input.tsx \
  src/components/form/SelectInput.tsx \
  src/app/(public)/[empresa]/[documento]/page.tsx \
  src/app/admin/AdminClientLayout.tsx \
  src/app/admin/layout.tsx \
  src/app/admin/users/page.tsx \
  src/app/auth/login/ui/LoginForm.tsx \
  src/app/auth/register-payment/[tempRegistrationId]/ui/PaymentForm.tsx \
  src/app/auth/success/page.tsx \
  src/components/admin/index.ts \
  src/actions/admin/users/getAll.action.ts

# 4. Commit
git commit -m "feat: Actualizar interfaz de usuario con nueva vista de usuario, suscripción Mercadopago y header mejorado

- Nueva vista de información de usuario con diseño mejorado
- Actualización de componentes de pagos del usuario
- Nuevo header con modal de búsqueda, dropdown de notificaciones y banner de suscripción
- Actualización de SuscripcionView para Mercadopago
- Mejoras en formularios y modales de usuario
- Actualizaciones de componentes UI generales"

# 5. Push
git push origin main
```
