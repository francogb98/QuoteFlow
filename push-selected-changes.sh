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
