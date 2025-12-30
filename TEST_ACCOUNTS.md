# Test Accounts

This document contains the test user accounts created for development and testing purposes.

## 🔐 Default Password

**All test accounts use the same password:**

```
Test123!@#
```

---

## 👑 Admin Account

**Email:** `admin@servease.com`  
**Account Type:** `ADMIN`  
**Account Status:** `ACTIVE`  
**Role:** Admin (with all permissions)

### Permissions

- ✅ `USER_READ` - Read user information
- ✅ `USER_WRITE` - Create and update users
- ✅ `KYC_APPROVE` - Approve or reject KYC submissions
- ✅ `SYSTEM_SECURITY` - Manage system security settings

### Use Cases

- Access admin endpoints
- Manage users and their statuses
- Approve/reject KYC submissions
- Manage system security (IP blacklisting, email blocking)
- Create and manage roles

---

## 👤 Customer Account

**Email:** `customer@servease.com`  
**Account Type:** `CUSTOMER`  
**Account Status:** `ACTIVE`  
**Role:** None

### Use Cases

- Browse services
- Create bookings
- View own bookings
- Make payments
- Access customer-specific features

---

## 🔧 Service Provider (Independent)

**Email:** `provider.independent@servease.com`  
**Account Type:** `SERVICE_PROVIDER_INDEPENDENT`  
**Account Status:** `ACTIVE`  
**Role:** None

### Use Cases

- Submit KYC documents
- Create and manage services
- View bookings for their services
- Update booking status
- Access provider dashboard

---

## 🏢 Service Provider (Business)

**Email:** `provider.business@servease.com`  
**Account Type:** `SERVICE_PROVIDER_BUSINESS`  
**Account Status:** `ACTIVE`  
**Role:** None

### Use Cases

- Submit KYC documents
- Create and manage services
- View bookings for their services
- Update booking status
- Access business provider features
- Manage multiple service listings

---

## 📋 Quick Reference

| Account Type           | Email                               | Password     | Status |
| ---------------------- | ----------------------------------- | ------------ | ------ |
| Admin                  | `admin@servease.com`                | `Test123!@#` | ACTIVE |
| Customer               | `customer@servease.com`             | `Test123!@#` | ACTIVE |
| Provider (Independent) | `provider.independent@servease.com` | `Test123!@#` | ACTIVE |
| Provider (Business)    | `provider.business@servease.com`    | `Test123!@#` | ACTIVE |

---

## 🔄 Re-seeding Test Accounts

To recreate or update test accounts, run:

```bash
npm run seed
```

The seed script is idempotent - it won't create duplicate accounts if they already exist.

---

## ⚠️ Security Notice

**IMPORTANT:** These are test accounts for development purposes only.

- **DO NOT** use these credentials in production
- **DO NOT** commit real passwords to version control
- Change passwords immediately if deploying to a public environment
- Use strong, unique passwords in production

---

## 🧪 Testing Workflows

### Authentication Flow

1. Use any test account email and password `Test123!@#`
2. Sign in via `/auth/signin`
3. Verify OTP (check email or database)
4. Receive access and refresh tokens

### Admin Workflow

1. Sign in as `admin@servease.com`
2. Access admin endpoints:
   - `GET /admin/users` - List all users
   - `PATCH /admin/users/:id/status` - Update user status
   - `GET /admin/kyc` - List KYC submissions
   - `PATCH /admin/kyc/:id/approve` - Approve KYC

### Provider Workflow

1. Sign in as `provider.independent@servease.com` or `provider.business@servease.com`
2. Submit KYC via `POST /kyc/submit`
3. Create services via `POST /services`
4. View bookings via `GET /bookings?type=provider`

### Customer Workflow

1. Sign in as `customer@servease.com`
2. Browse services via `GET /services`
3. Create booking via `POST /bookings`
4. View bookings via `GET /bookings`

---

## 📝 Notes

- All accounts are created with `ACTIVE` status except for the admin account
- Admin account has full system permissions
- Service provider accounts need KYC approval before they can create services (depending on your business logic)
- Customer accounts are automatically active upon creation
- All passwords are hashed using Argon2

---

## 🔍 Database Queries

To verify test accounts in the database:

```sql
-- View all test users
SELECT email, "accountType", "accountStatus"
FROM users
WHERE email LIKE '%@servease.com';

-- View admin role and permissions
SELECT r.name, r.description, p.name as permission
FROM roles r
JOIN role_permissions rp ON r.id = rp."roleId"
JOIN permissions p ON rp."permissionId" = p.id
WHERE r.name = 'Admin';

-- View user with role
SELECT u.email, u."accountType", r.name as role_name
FROM users u
LEFT JOIN roles r ON u."roleId" = r.id
WHERE u.email = 'admin@servease.com';
```

---

**Last Updated:** Generated automatically by seed script  
**Seed Script:** `src/database/seed.ts`
