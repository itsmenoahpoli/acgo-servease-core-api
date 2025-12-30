import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1767093894789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TYPE "account_type_enum" AS ENUM('customer', 'service-provider-independent', 'service-provider-business', 'admin')
    `);

    await queryRunner.query(`
      CREATE TYPE "account_status_enum" AS ENUM('ACTIVE', 'PENDING', 'SUSPENDED', 'BLOCKED', 'BLACKLISTED')
    `);

    await queryRunner.query(`
      CREATE TYPE "permission_enum" AS ENUM('USER_READ', 'USER_WRITE', 'KYC_APPROVE', 'SYSTEM_SECURITY')
    `);

    await queryRunner.query(`
      CREATE TYPE "kyc_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')
    `);

    await queryRunner.query(`
      CREATE TYPE "booking_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    `);

    await queryRunner.query(`
      CREATE TYPE "payment_status_enum" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED')
    `);

    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "subdomain" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenants_name" UNIQUE ("name"),
        CONSTRAINT "PK_tenants" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "cities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "region" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cities" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" "permission_enum" NOT NULL,
        "description" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_permissions_name" UNIQUE ("name"),
        CONSTRAINT "PK_permissions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
        CONSTRAINT "PK_roles" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "roleId" uuid NOT NULL,
        "permissionId" uuid NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("roleId", "permissionId")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "accountType" "account_type_enum" NOT NULL,
        "accountStatus" "account_status_enum" NOT NULL DEFAULT 'PENDING',
        "roleId" uuid,
        "tenantId" uuid,
        "cityId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "otps" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "code" character varying NOT NULL,
        "type" character varying NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "used" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_otps" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "tokenHash" character varying NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "revoked" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "kycs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "documentType" character varying NOT NULL,
        "documentUrl" character varying NOT NULL,
        "status" "kyc_status_enum" NOT NULL DEFAULT 'PENDING',
        "reviewedBy" character varying,
        "reviewNotes" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_kycs" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "service_categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_service_categories_name" UNIQUE ("name"),
        CONSTRAINT "PK_service_categories" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "services" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "categoryId" uuid NOT NULL,
        "providerId" uuid NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "description" text,
        "cityId" uuid,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_services" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "serviceId" uuid NOT NULL,
        "customerId" uuid NOT NULL,
        "providerId" uuid NOT NULL,
        "schedule" TIMESTAMP WITH TIME ZONE NOT NULL,
        "address" text NOT NULL,
        "cityId" uuid,
        "status" "booking_status_enum" NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bookings" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "bookingId" uuid NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "currency" character varying NOT NULL DEFAULT 'USD',
        "status" "payment_status_enum" NOT NULL DEFAULT 'PENDING',
        "paymentIntentId" character varying,
        "transactionId" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_payments_bookingId" UNIQUE ("bookingId"),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "blacklisted_ips" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ipAddress" character varying NOT NULL,
        "reason" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_blacklisted_ips_ipAddress" UNIQUE ("ipAddress"),
        CONSTRAINT "PK_blacklisted_ips" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "blocked_emails" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "reason" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_blocked_emails_email" UNIQUE ("email"),
        CONSTRAINT "PK_blocked_emails" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permissions" 
      ADD CONSTRAINT "FK_role_permissions_roleId" 
      FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permissions" 
      ADD CONSTRAINT "FK_role_permissions_permissionId" 
      FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "FK_users_roleId" 
      FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "FK_users_tenantId" 
      FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "FK_users_cityId" 
      FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "otps" 
      ADD CONSTRAINT "FK_otps_userId" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "refresh_tokens" 
      ADD CONSTRAINT "FK_refresh_tokens_userId" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "kycs" 
      ADD CONSTRAINT "FK_kycs_userId" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "services" 
      ADD CONSTRAINT "FK_services_categoryId" 
      FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "services" 
      ADD CONSTRAINT "FK_services_providerId" 
      FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "services" 
      ADD CONSTRAINT "FK_services_cityId" 
      FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings" 
      ADD CONSTRAINT "FK_bookings_serviceId" 
      FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings" 
      ADD CONSTRAINT "FK_bookings_customerId" 
      FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings" 
      ADD CONSTRAINT "FK_bookings_providerId" 
      FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings" 
      ADD CONSTRAINT "FK_bookings_cityId" 
      FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payments" 
      ADD CONSTRAINT "FK_payments_bookingId" 
      FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_bookingId"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_cityId"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_providerId"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_customerId"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_serviceId"`);
    await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_services_cityId"`);
    await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_services_providerId"`);
    await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_services_categoryId"`);
    await queryRunner.query(`ALTER TABLE "kycs" DROP CONSTRAINT "FK_kycs_userId"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_refresh_tokens_userId"`);
    await queryRunner.query(`ALTER TABLE "otps" DROP CONSTRAINT "FK_otps_userId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_cityId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_tenantId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_roleId"`);
    await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_permissionId"`);
    await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_roleId"`);

    await queryRunner.query(`DROP TABLE "blocked_emails"`);
    await queryRunner.query(`DROP TABLE "blacklisted_ips"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(`DROP TABLE "service_categories"`);
    await queryRunner.query(`DROP TABLE "kycs"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "otps"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "cities"`);
    await queryRunner.query(`DROP TABLE "tenants"`);

    await queryRunner.query(`DROP TYPE "payment_status_enum"`);
    await queryRunner.query(`DROP TYPE "booking_status_enum"`);
    await queryRunner.query(`DROP TYPE "kyc_status_enum"`);
    await queryRunner.query(`DROP TYPE "permission_enum"`);
    await queryRunner.query(`DROP TYPE "account_status_enum"`);
    await queryRunner.query(`DROP TYPE "account_type_enum"`);
  }
}
