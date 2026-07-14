# Payment Subscription Specification

## Purpose

Define the requirements for the complete Mercado Pago subscription lifecycle for admin registrations — from PreApproval creation through webhook processing to recurring payment linking.

## Requirements

### Requirement: PreApproval Creation for New Registration

When a new admin registers with a paid plan, the system MUST create a Mercado Pago PreApproval with `external_reference` in format `"temp:{tempRegistrationId}"`.

#### Scenario: New registration creates PreApproval

- GIVEN a TempRegistration exists for a new admin
- WHEN `handleSuscriber` is called with the temp registration ID
- THEN a PreApproval is created in Mercado Pago with `external_reference: "temp:{tempRegistrationId}"`
- AND the function returns the MP redirect URL
- AND no `SuscripcionEmpresa` record is created yet

#### Scenario: PreApproval creation error

- GIVEN Mercado Pago API returns an error
- WHEN `handleSuscriber` is called
- THEN the error is returned to the caller
- AND no orphaned DB state is created

### Requirement: PreApproval Creation for Existing Subscription

When an existing empresa initiates or changes a subscription, the system MUST create a Mercado Pago PreApproval with `external_reference` in format `"empresa:{empresaId}"`.

#### Scenario: Existing empresa creates PreApproval

- GIVEN an existing empresa with a valid SuscripcionEmpresa
- WHEN `iniciarSuscripcionEmpresa` is called
- THEN a PreApproval is created in Mercado Pago with `external_reference: "empresa:{empresaId}"`
- AND the SuscripcionEmpresa `mercadoPagoPreApprovalId` is updated

### Requirement: Post-Payment Account Creation

When a payment is confirmed for a new registration, the system MUST create the Empresa, Administrador, and SuscripcionEmpresa records.

#### Scenario: Payment confirmed via status route

- GIVEN a TempRegistration exists
- AND a PreApproval with `external_reference: "temp:{tempRegistrationId}"` has status `authorized` or `active`
- WHEN the status route processes the payment confirmation
- THEN a new Empresa is created
- AND a new Administrador is created linked to the Empresa
- AND a new SuscripcionEmpresa is created linked to the Empresa with `mercadoPagoPreApprovalId` set
- AND the TempRegistration is deleted

#### Scenario: Duplicate creation guard

- GIVEN an Empresa or Administrador already exists for the temp registration
- WHEN the creation is attempted again
- THEN the existing records are returned
- AND no duplicate records are created

### Requirement: SuscripcionEmpresa State

The SuscripcionEmpresa MUST always be created when a new Empresa is created via the paid flow.

#### Scenario: SuscripcionEmpresa created with correct defaults

- GIVEN a paid registration is confirmed
- WHEN the Empresa and Administrador are created
- THEN a SuscripcionEmpresa is created with `estadoSuscripcion: "ACTIVA"`, `estadoPagoMercadoPago: "AUTHORIZED"`, and `fechaFinPeriodoActual` calculated from the payment confirmation date plus the billing frequency

### Requirement: Webhook Subscription Event Processing

The webhook MUST correctly process subscription events for both `"temp:"` and `"empresa:"` external_reference formats.

#### Scenario: Webhook for temp registration

- GIVEN a PreApproval with `external_reference: "temp:{tempRegistrationId}"`
- WHEN the webhook receives a `preapproval` event
- THEN it splits the reference into type `"temp"` and the registration ID
- AND calls `createCompanyAndAdmin` if the empresa doesn't exist yet
- AND creates or updates the SuscripcionEmpresa with the MP status

#### Scenario: Webhook for existing empresa

- GIVEN a PreApproval with `external_reference: "empresa:{empresaId}"`
- WHEN the webhook receives a `preapproval` event
- THEN it updates the existing SuscripcionEmpresa estado and fechas based on MP status

### Requirement: Recurring Payment Linking

When a recurring payment webhook arrives, the system MUST find the corresponding SuscripcionEmpresa and register the payment.

#### Scenario: Payment linked by preapproval ID

- GIVEN a SuscripcionEmpresa exists with `mercadoPagoPreApprovalId` matching the payment's `preapproval_id`
- WHEN the webhook receives an `authorized_payment` or `payment` event with status `approved`
- THEN a `PagoSuscripcionEmpresa` record is created
- AND the SuscripcionEmpresa `fechaFinPeriodoActual` is extended by the billing frequency
- AND `estadoSuscripcion` is set to `"ACTIVA"`

#### Scenario: Duplicate payment idempotency

- GIVEN a `PagoSuscripcionEmpresa` already exists for the payment ID
- WHEN a duplicate payment webhook arrives
- THEN no new record is created
- AND the webhook returns `200 OK`

### Requirement: Status Route External Reference Match

The temp registration status route MUST search Mercado Pago PreApprovals using the correct `external_reference` format.

#### Scenario: Status route finds PreApproval

- GIVEN a TempRegistration exists with ID `"abc-123"`
- AND a PreApproval exists with `external_reference: "temp:abc-123"`
- WHEN the status route searches by `payer_email`
- THEN it finds the PreApproval by matching `external_reference === "temp:abc-123"`
- AND if the status is `authorized` or `active`, it triggers empresa + admin + SuscripcionEmpresa creation
