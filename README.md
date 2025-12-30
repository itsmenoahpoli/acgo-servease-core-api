# Servease Core Server

A production-ready NestJS backend service for a Service Provider Marketplace platform. This application provides a comprehensive API for managing service providers, customers, bookings, payments, and administrative functions with multi-tenant and multi-city support.

## 🚀 Features

### Core Functionality

- **User Management**: Support for multiple account types (customers, service providers, admins)
- **Authentication & Authorization**: JWT-based authentication with 2FA (OTP) and refresh token rotation
- **Service Marketplace**: Browse, create, and manage services with category support
- **Booking System**: Complete booking lifecycle management
- **Payment Processing**: Payment-ready structure (Stripe/PayMongo/GCash compatible)
- **KYC Verification**: Document verification for service providers
- **Admin Panel**: Comprehensive admin controls with RBAC

### Advanced Features

- **Multi-Tenant Architecture**: Subdomain and header-based tenant resolution
- **Multi-City Support**: City-scoped services and bookings
- **Role-Based Access Control (RBAC)**: Fine-grained permissions system
- **Security Middlewares**: IP blacklisting, email blocking, rate limiting
- **Comprehensive Testing**: Unit, integration, and E2E tests

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Authentication Flow](#authentication-flow)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Architecture](#architecture)
- [Security Features](#security-features)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🛠 Tech Stack

### Core Framework

- **NestJS** (v11.0.1) - Progressive Node.js framework
- **TypeScript** (v5.7.3) - Type-safe JavaScript
- **Express** - HTTP server framework

### Database & ORM

- **PostgreSQL** - Relational database
- **TypeORM** (v0.3.28) - Object-Relational Mapping

### Authentication & Security

- **JWT** - JSON Web Tokens for authentication
- **Passport** - Authentication middleware
- **Argon2** - Password hashing
- **Helmet** - Security headers
- **@nestjs/throttler** - Rate limiting

### Additional Libraries

- **Nodemailer** - Email notifications
- **Swagger/OpenAPI** - API documentation
- **class-validator** - DTO validation
- **class-transformer** - Object transformation

## 📁 Project Structure

```
servease-core-server/
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── strategies/      # JWT strategy
│   │   └── *.ts             # Controllers, services, modules
│   ├── admin/               # Admin management module
│   ├── kyc/                 # KYC verification module
│   ├── services/            # Service marketplace module
│   ├── bookings/            # Booking management module
│   ├── payments/            # Payment processing module
│   ├── tenants/             # Multi-tenant support
│   ├── cities/              # Multi-city support
│   ├── users/               # User management
│   ├── roles/               # Role management
│   ├── permissions/         # Permission management
│   ├── notifications/       # Email notifications
│   ├── common/              # Shared utilities
│   │   ├── decorators/      # Custom decorators
│   │   ├── guards/          # Route guards
│   │   ├── middlewares/     # Custom middlewares
│   │   └── enums/           # Enumerations
│   ├── entities/            # TypeORM entities
│   ├── app.module.ts        # Root module
│   └── main.ts              # Application entry point
├── test/                    # E2E and integration tests
├── dist/                    # Compiled output
├── coverage/                # Test coverage reports
├── .env.example             # Environment variables template
├── tsconfig.json            # TypeScript configuration
├── nest-cli.json            # NestJS CLI configuration
└── package.json             # Dependencies and scripts
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher) or **yarn**
- **PostgreSQL** (v12 or higher)
- **Git**

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd servease-core-server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration (see [Configuration](#configuration))

4. **Set up the database**

   ```bash
   # Create PostgreSQL database
   createdb marketplace
   ```

5. **Run database migrations** (if using migrations)
   ```bash
   npm run migration:run
   ```
   Note: In development, TypeORM will auto-sync schema.

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/marketplace

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# OTP Configuration
OTP_EXPIRY_MINUTES=5

# Application
NODE_ENV=development
PORT=3000
```

### Environment Variables Explained

- **DATABASE_URL**: PostgreSQL connection string
- **JWT_SECRET**: Secret key for signing JWT tokens (use a strong random string in production)
- **JWT_EXPIRES_IN**: Access token expiration time (default: 15 minutes)
- **JWT_REFRESH_EXPIRES_IN**: Refresh token expiration time (default: 7 days)
- **SMTP\_\***: Email server configuration for sending OTPs and notifications
- **OTP_EXPIRY_MINUTES**: OTP code validity period
- **NODE_ENV**: Environment mode (development/production)
- **PORT**: Server port (default: 3000)

## 🏃 Running the Application

### Development Mode

```bash
npm run start:dev
```

The application will start on `http://localhost:3000` with hot-reload enabled.

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Debug Mode

```bash
npm run start:debug
```

## 📚 API Documentation

Once the application is running, access the Swagger API documentation at:

```
http://localhost:3000/api
```

The Swagger UI provides:

- Interactive API exploration
- Request/response schemas
- Authentication testing
- All available endpoints

### Key Endpoints

#### Authentication

- `POST /auth/signup` - User registration
- `POST /auth/signup/verify-otp` - Verify signup OTP
- `POST /auth/signin` - User login
- `POST /auth/signin/verify-otp` - Verify signin OTP
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and revoke tokens
- `GET /auth/profile` - Get current user profile

#### Services

- `GET /services` - Browse services (public)
- `GET /services/:id` - Get service details
- `POST /services` - Create service (service providers only)
- `GET /services/categories` - Get all categories

#### Bookings

- `POST /bookings` - Create booking
- `GET /bookings` - Get user bookings
- `GET /bookings/:id` - Get booking details
- `PATCH /bookings/:id/status` - Update booking status

#### Admin

- `GET /admin/users` - List all users
- `PATCH /admin/users/:id/status` - Update user status
- `GET /admin/kyc` - List KYC submissions
- `PATCH /admin/kyc/:id/approve` - Approve KYC
- `PATCH /admin/kyc/:id/reject` - Reject KYC
- `POST /admin/blacklist/ip` - Blacklist IP address
- `POST /admin/block-email` - Block email address

## 🔐 Authentication Flow

### Signup Flow

1. User submits email, password, and account type
2. System creates user account (status: PENDING for service providers, ACTIVE for customers)
3. OTP code is generated and sent via email
4. User verifies OTP to activate account

### Signin Flow

1. User submits email and password
2. System validates credentials
3. OTP code is generated and sent via email
4. User verifies OTP
5. System returns access token and refresh token

### Token Refresh

1. Client sends refresh token to `/auth/refresh`
2. System validates refresh token
3. Old refresh token is revoked
4. New access and refresh tokens are issued

### Token Rotation

- Refresh tokens are rotated on every refresh
- Old tokens are automatically revoked
- Supports secure token management

## 🗄️ Database Schema

### Core Entities

#### User

- `id` (UUID) - Primary key
- `email` (string, unique) - User email
- `password` (string, hashed) - Argon2 hashed password
- `accountType` (enum) - customer | service-provider-independent | service-provider-business | admin
- `accountStatus` (enum) - ACTIVE | PENDING | SUSPENDED | BLOCKED | BLACKLISTED
- `roleId` (UUID, nullable) - Foreign key to Role
- `tenantId` (UUID, nullable) - Foreign key to Tenant
- `cityId` (UUID, nullable) - Foreign key to City
- `createdAt`, `updatedAt` - Timestamps

#### Service

- `id` (UUID) - Primary key
- `title` (string) - Service title
- `description` (text) - Service description
- `price` (decimal) - Service price
- `categoryId` (UUID) - Foreign key to ServiceCategory
- `providerId` (UUID) - Foreign key to User
- `cityId` (UUID, nullable) - Foreign key to City
- `isActive` (boolean) - Service availability

#### Booking

- `id` (UUID) - Primary key
- `serviceId` (UUID) - Foreign key to Service
- `customerId` (UUID) - Foreign key to User
- `providerId` (UUID) - Foreign key to User
- `schedule` (timestamp) - Booking schedule
- `address` (text) - Service address
- `cityId` (UUID, nullable) - Foreign key to City
- `status` (enum) - PENDING | CONFIRMED | COMPLETED | CANCELLED

#### Payment

- `id` (UUID) - Primary key
- `bookingId` (UUID) - Foreign key to Booking
- `amount` (decimal) - Payment amount
- `currency` (string) - Payment currency
- `status` (enum) - PENDING | PROCESSING | COMPLETED | FAILED | REFUNDED
- `paymentIntentId` (string, nullable) - Payment gateway intent ID
- `transactionId` (string, nullable) - Transaction ID

### Relationship Diagram

```
User ──┬── Role
       ├── Tenant
       ├── City
       ├── Services (as provider)
       ├── Bookings (as customer/provider)
       └── RefreshTokens

Service ──┬── ServiceCategory
          ├── User (provider)
          ├── City
          └── Bookings

Booking ──┬── Service
          ├── User (customer)
          ├── User (provider)
          ├── City
          └── Payment
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

### Test Structure

- **Unit Tests**: `src/**/*.spec.ts` - Test individual services and controllers
- **E2E Tests**: `test/*.e2e-spec.ts` - Test complete API endpoints
- **Integration Tests**: `test/integration/*.spec.ts` - Test complete user flows

### Test Coverage

The project includes comprehensive test coverage for:

- Authentication flows
- Service management
- Booking lifecycle
- Payment processing
- Admin operations
- Guards and middlewares

## 🏗️ Architecture

### Module Architecture

The application follows NestJS modular architecture:

- **Feature Modules**: Each feature (auth, services, bookings, etc.) is a self-contained module
- **Shared Modules**: Common utilities, guards, and decorators are in the `common/` directory
- **Entity Modules**: Database entities are centralized in the `entities/` directory

### Design Patterns

- **Dependency Injection**: All services use NestJS DI
- **Repository Pattern**: TypeORM repositories for data access
- **DTO Pattern**: Data Transfer Objects for request/response validation
- **Guard Pattern**: Route guards for authentication and authorization
- **Middleware Pattern**: Request processing middleware

### Multi-Tenant Architecture

- **Tenant Resolution**: Via subdomain (`tenant1.example.com`) or header (`X-Tenant-ID`)
- **Data Isolation**: All queries are tenant-scoped
- **Tenant Middleware**: Automatically resolves tenant from request

### Multi-City Support

- **City Scoping**: Services and bookings are city-scoped
- **Automatic Assignment**: User's city is automatically assigned to services/bookings
- **Filtering**: Services can be filtered by city

## 🔒 Security Features

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **2FA with OTP**: Two-factor authentication via email OTP
- **Refresh Token Rotation**: Automatic token rotation on refresh
- **Password Hashing**: Argon2 for secure password storage

### Security Middlewares

- **Helmet**: Security headers (XSS protection, content security policy, etc.)
- **Rate Limiting**: Throttling to prevent abuse (100 requests/minute)
- **IP Blacklisting**: Block malicious IP addresses
- **Email Blocking**: Block spam/abusive email addresses

### Guards

- **JwtAuthGuard**: Validates JWT tokens
- **RolesGuard**: Checks user permissions
- **AccountStatusGuard**: Ensures account is active
- **AccountTypeGuard**: Validates account type for specific routes

### Data Validation

- **class-validator**: Request validation
- **DTOs**: Type-safe data transfer objects
- **Input Sanitization**: Automatic input cleaning

## 🚢 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure production database
- [ ] Set up proper SMTP server
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Review security settings

### Docker Deployment (Example)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### Environment-Specific Configuration

- **Development**: Auto-sync database schema, detailed error messages
- **Production**: Manual migrations, minimal error exposure, optimized builds

## 📝 Code Style

### Absolute Imports

The project uses absolute imports with `@/` prefix:

```typescript
import { User } from '@/entities/user.entity';
import { AuthService } from '@/auth/auth.service';
import { AccountType } from '@/common/enums/account-type.enum';
```

### Naming Conventions

- **Files**: kebab-case (e.g., `auth.service.ts`)
- **Classes**: PascalCase (e.g., `AuthService`)
- **Variables**: camelCase (e.g., `userService`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `JWT_SECRET`)

### Code Organization

- Each module contains: `*.module.ts`, `*.service.ts`, `*.controller.ts`
- DTOs are in `dto/` subdirectory
- Entities are centralized in `entities/`
- Shared utilities in `common/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Follow existing code style
- Update documentation
- Ensure all tests pass
- Run linter before committing

## 📄 License

This project is private and proprietary. All rights reserved.

## 👥 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api`

## 🔄 Version History

- **v0.0.1** - Initial release
  - Core authentication with 2FA
  - Service marketplace
  - Booking system
  - Payment structure
  - Multi-tenant support
  - Multi-city support
  - Admin panel with RBAC
  - Comprehensive test suite

---

**Built with ❤️ using NestJS**
