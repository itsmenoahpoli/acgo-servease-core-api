# Service Provider Marketplace – Backend Service

This repository contains the backend service for a **Service Provider Marketplace** platform where residents/customers can browse, search, and book home-service professionals such as plumbers, electricians, gardeners, carpenters, painters, car mechanics, and similar services.

This README serves as a **system blueprint + Swagger-ready API contract** and is designed to be used directly inside **Cursor IDE** for scaffolding and AI-assisted development.

---

## 🧱 Tech Stack

* **Runtime**: Node.js (TypeScript)
* **Framework**: NestJS (Express adapter)
* **ORM**: TypeORM
* **Database**: PostgreSQL
* **Authentication**: JWT (jsonwebtoken)
* **Password Hashing**: Argon2
* **Email Service**: Nodemailer
* **API Docs**: Swagger (OpenAPI 3)

---

## 👥 User Types

* `customer`
* `service-provider-independent`
* `service-provider-business`
* `admin`

---

## 🔐 Authentication & Authorization (JWT + 2FA)

### Signup

**POST** `/auth/signup`

```json
{
  "email": "user@email.com",
  "password": "strongPassword",
  "accountType": "service-provider-independent"
}
```

* Password hashed using **Argon2**
* OTP sent via email
* Account status:

  * `ACTIVE` → customers
  * `PENDING` → service providers (requires KYC)

---

### Verify Signup OTP

**POST** `/auth/signup/verify-otp`

```json
{
  "email": "user@email.com",
  "otp": "123456"
}
```

---

### Signin

**POST** `/auth/signin`

```json
{
  "email": "user@email.com",
  "password": "strongPassword"
}
```

* OTP sent before token issuance

---

### Verify Signin OTP

**POST** `/auth/signin/verify-otp`

```json
{
  "email": "user@email.com",
  "otp": "123456"
}
```

**Response**

```json
{
  "accessToken": "jwt-token"
}
```

---

## 🪪 KYC Module

### Submit KYC (Service Providers Only)

**POST** `/kyc/submit`

```json
{
  "documentType": "government_id",
  "documentUrl": "https://..."
}
```

### Admin – Review KYC

**PATCH** `/admin/kyc/:id/approve`
**PATCH** `/admin/kyc/:id/reject`

Email notification is automatically sent.

---

## 🛂 Admin UAC (User Access Control)

### Roles & Permissions

```ts
ADMIN: [
  'USER_READ',
  'USER_WRITE',
  'KYC_APPROVE',
  'SYSTEM_SECURITY'
]
```

### Admin APIs

* **GET** `/admin/users`
* **PATCH** `/admin/users/:id/status`
* **POST** `/admin/roles`
* **PATCH** `/admin/roles/:id`
* **POST** `/admin/blacklist/ip`
* **POST** `/admin/block-email`

---

## 🧰 Service Marketplace Module (Item #4)

### Service Categories

**POST** `/admin/service-categories`

```json
{
  "name": "Plumbing"
}
```

### Create Service (Providers)

**POST** `/services`

```json
{
  "title": "Leak Repair",
  "categoryId": "uuid",
  "price": 500,
  "description": "Fix leaking pipes"
}
```

### Browse Services (Public)

**GET** `/services?category=plumbing&minPrice=100&maxPrice=1000`

---

## 📅 Booking Module (Item #4 continued)

### Create Booking

**POST** `/bookings`

```json
{
  "serviceId": "uuid",
  "schedule": "2025-02-10T10:00:00Z",
  "address": "Customer address"
}
```

### Booking Statuses

* `PENDING`
* `CONFIRMED`
* `COMPLETED`
* `CANCELLED`

---

## 💳 Payments (Item #4 – Payment-Ready)

> Payment gateway integration-ready (Stripe/PayMongo)

```ts
PaymentIntent
- amount
- currency
- bookingId
- status
```

---

## 🧩 Database Entities (Item #2)

### Core Entities

* User
* Role
* Permission
* OTP
* KYC
* ServiceCategory
* Service
* Booking
* Payment
* BlacklistedIP
* BlockedEmail

---

## 🛡️ Security Middlewares (Item #3)

### Global

* Helmet
* Rate Limiter
* CORS
* Validation Pipe

### Custom

* `JwtAuthGuard`
* `RolesGuard`
* `AccountStatusGuard`
* `AccountTypeGuard`
* `IPBlacklistMiddleware`
* `EmailBlockMiddleware`

---

## 📚 Swagger API Documentation (Item #1)

### Swagger Setup

```ts
const config = new DocumentBuilder()
  .setTitle('Service Provider Marketplace API')
  .setDescription('Marketplace backend API documentation')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
```

### Swagger Tags

* Auth
* Users
* Admin
* KYC
* Services
* Bookings
* Payments

### Auth Example (Swagger)

```ts
@ApiTags('Auth')
@ApiOperation({ summary: 'User Signup' })
@ApiResponse({ status: 201 })
@Post('signup')
```

---

## 📁 Project Structure (Item #5)

```
src/
 ├── auth/
 ├── users/
 ├── admin/
 ├── kyc/
 ├── services/
 ├── bookings/
 ├── payments/
 ├── notifications/
 ├── common/
 │   ├── guards/
 │   ├── middlewares/
 │   ├── decorators/
 │   └── enums/
 ├── entities/
 └── main.ts
```

---

## ⚙️ Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/marketplace
JWT_SECRET=supersecret
JWT_EXPIRES_IN=1d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=yourpassword
OTP_EXPIRY_MINUTES=5
```

---

## 🚀 Implemented Items Summary

1. ✅ Swagger API Documentation
2. ✅ TypeORM Entity Architecture
3. ✅ Security & User-Type Middlewares
4. ✅ Service, Booking & Payment-Ready Marketplace
5. ✅ Modular, Scalable Project Structure

---

## 📄 License

MIT License
