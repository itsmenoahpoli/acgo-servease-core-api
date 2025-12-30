# NestJS Service Provider Marketplace – Implementation Guide

This README defines the **actual implementation contract** for generating a **production-ready NestJS backend** based on the marketplace blueprint.

This document is intended to be used by **Cursor IDE / AI code generation** to scaffold **full NestJS modules**, **TypeORM entities**, **RBAC**, **refresh-token rotation**, and **multi-city / multi-tenant architecture**.

---

## 🧱 Core Stack

- **Framework**: NestJS (Express adapter)
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Auth**: JWT (Access + Refresh tokens)
- **Hashing**: Argon2
- **Email**: Nodemailer
- **Docs**: Swagger (OpenAPI 3)

---

## 🧩 Modules Overview (Auto-Generate)

Each module MUST include:

- `controller.ts`
- `service.ts`
- `dto/`
- `entity.ts`
- `module.ts`

### Modules

```
AuthModule
UsersModule
RolesModule
PermissionsModule
KycModule
ServicesModule
BookingsModule
PaymentsModule
AdminModule
TenantsModule
CitiesModule
NotificationsModule
```

---

## 🔐 Authentication Module (JWT + Refresh Rotation)

### Tokens

- **Access Token** (short-lived, e.g. 15m)
- **Refresh Token** (long-lived, e.g. 7d)
- Refresh tokens are:
  - Stored hashed in DB
  - Rotated on every refresh
  - Invalidated on logout

### Auth Endpoints

```
POST   /auth/signup
POST   /auth/signup/verify-otp
POST   /auth/signin
POST   /auth/signin/verify-otp
POST   /auth/refresh
POST   /auth/logout
```

### Auth DTOs

- `SignupDto`
- `SigninDto`
- `VerifyOtpDto`
- `RefreshTokenDto`

---

## 👥 Users Module

### User Types

- customer
- service-provider-independent
- service-provider-business
- admin

### Account Status

- ACTIVE
- PENDING
- SUSPENDED
- BLACKLISTED

### User Entity

```ts
User -
  id(uuid) -
  email(unique) -
  passwordHash -
  roleId -
  accountType -
  status -
  tenantId -
  cityId -
  createdAt;
```

---

## 🛂 RBAC (Roles & Permissions)

### Permission Entity

```ts
Permission
- id
- code (USER_READ, KYC_APPROVE, etc.)
```

### Role Entity

```ts
Role
- id
- name
- permissions[]
```

### RBAC Decorators

```ts
@RequirePermissions('USER_READ', 'USER_WRITE')
@RequireRoles('admin')
```

### Guards

- `JwtAuthGuard`
- `RolesGuard`
- `PermissionsGuard`

---

## 🪪 KYC Module

### Applies To

- service-provider-independent
- service-provider-business

### KYC Entity

```ts
Kyc -
  id -
  userId -
  documentType -
  documentUrl -
  status(PENDING | APPROVED | REJECTED) -
  reviewedBy;
```

### Endpoints

```
POST   /kyc/submit
GET    /admin/kyc
PATCH  /admin/kyc/:id/approve
PATCH  /admin/kyc/:id/reject
```

---

## 🧰 Services Marketplace Module

### ServiceCategory Entity

```ts
ServiceCategory - id - name;
```

### Service Entity

```ts
Service - id - providerId - categoryId - title - description - price - isActive;
```

### Endpoints

```
POST   /services
GET    /services
GET    /services/:id
```

---

## 📅 Bookings Module

### Booking Entity

```ts
Booking - id - serviceId - customerId - schedule - address - status;
```

### Booking Status

- PENDING
- CONFIRMED
- COMPLETED
- CANCELLED

---

## 💳 Payments Module

### Payment Entity

```ts
Payment - id - bookingId - amount - provider - status;
```

> Gateway-agnostic (Stripe / PayMongo / GCash-ready)

---

## 🌍 Multi-City Support

### City Entity

```ts
City - id - name - region;
```

- Services, users, and bookings are city-scoped
- City filter applied automatically via middleware

---

## 🏢 Multi-Tenant Architecture

### Tenant Entity

```ts
Tenant - id - name - isActive;
```

### Tenant Resolution

- Via subdomain OR header: `X-Tenant-ID`
- Tenant injected into request context
- All queries are tenant-scoped

---

## 🛡️ Global Security

### Middlewares

- Helmet
- Rate Limiting
- IP Blacklist
- Email Block

### Guards

- AccountStatusGuard
- AccountTypeGuard

---

## 📚 Swagger Requirements

- Every controller MUST include:
  - `@ApiTags`
  - `@ApiBearerAuth()` where protected
  - DTO-based request/response models

---

## 📁 Final Project Structure

```
src/
 ├── auth/
 ├── users/
 ├── roles/
 ├── permissions/
 ├── kyc/
 ├── services/
 ├── bookings/
 ├── payments/
 ├── tenants/
 ├── cities/
 ├── admin/
 ├── notifications/
 ├── common/
 │   ├── decorators/
 │   ├── guards/
 │   ├── middlewares/
 │   └── enums/
 └── main.ts
```

---

## 🚀 Implementation Rules for Cursor / AI

- Always generate DTOs first
- Controllers must be thin
- Services contain business logic only
- Entities must use TypeORM decorators
- Guards & decorators must be reusable
- No hard-coded role checks inside services

---

## ✅ Implementation Goals

- Production-grade security
- Scalable SaaS-ready architecture
- Multi-tenant & multi-city isolation
- Clean RBAC enforcement
- Token-rotation-safe authentication

---

## 📄 License

MIT License
