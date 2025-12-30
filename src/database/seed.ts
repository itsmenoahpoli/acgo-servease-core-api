import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { config } from 'dotenv';
import { User } from '@/entities/user.entity';
import { Role } from '@/entities/role.entity';
import { Permission } from '@/entities/permission.entity';
import { AccountType } from '@/common/enums/account-type.enum';
import { AccountStatus } from '@/common/enums/account-status.enum';
import { Permission as PermissionEnum } from '@/common/enums/permission.enum';
import dataSource from './data-source';

config();

async function seed() {
  const AppDataSource = await dataSource.initialize();

  try {
    console.log('🌱 Starting database seeding...');

    const permissionRepository = AppDataSource.getRepository(Permission);
    const roleRepository = AppDataSource.getRepository(Role);
    const userRepository = AppDataSource.getRepository(User);

    const existingPermissions = await permissionRepository.find();
    if (existingPermissions.length === 0) {
      console.log('📝 Creating permissions...');
      const permissions = await permissionRepository.save([
        {
          name: PermissionEnum.USER_READ,
          description: 'Read user information',
        },
        {
          name: PermissionEnum.USER_WRITE,
          description: 'Create and update users',
        },
        {
          name: PermissionEnum.KYC_APPROVE,
          description: 'Approve or reject KYC submissions',
        },
        {
          name: PermissionEnum.SYSTEM_SECURITY,
          description: 'Manage system security settings',
        },
      ]);
      console.log(`✅ Created ${permissions.length} permissions`);
    } else {
      console.log('✅ Permissions already exist');
    }

    const allPermissions = await permissionRepository.find();

    let adminRole = await roleRepository.findOne({ where: { name: 'Admin' } });
    if (!adminRole) {
      console.log('👑 Creating Admin role...');
      adminRole = await roleRepository.save({
        name: 'Admin',
        description: 'Administrator with full system access',
        permissions: allPermissions,
      });
      console.log('✅ Admin role created');
    } else {
      console.log('✅ Admin role already exists');
    }

    const hashedPassword = await argon2.hash('Test123!@#');

    const testUsers = [
      {
        email: 'admin@servease.com',
        name: 'Admin User',
        password: hashedPassword,
        accountType: AccountType.ADMIN,
        accountStatus: AccountStatus.ACTIVE,
        roleId: adminRole.id,
      },
      {
        email: 'customer@servease.com',
        name: 'John Customer',
        password: hashedPassword,
        accountType: AccountType.CUSTOMER,
        accountStatus: AccountStatus.ACTIVE,
      },
      {
        email: 'provider.independent@servease.com',
        name: 'Jane Provider',
        password: hashedPassword,
        accountType: AccountType.SERVICE_PROVIDER_INDEPENDENT,
        accountStatus: AccountStatus.ACTIVE,
      },
      {
        email: 'provider.business@servease.com',
        name: 'Business Corp',
        password: hashedPassword,
        accountType: AccountType.SERVICE_PROVIDER_BUSINESS,
        accountStatus: AccountStatus.ACTIVE,
      },
    ];

    console.log('👥 Creating test users...');
    for (const userData of testUsers) {
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        await userRepository.save(userData);
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        existingUser.name = userData.name;
        await userRepository.save(existingUser);
        console.log(`✅ Updated user: ${userData.email}`);
      }
    }

    console.log('\n📋 Test User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 Password for all accounts: Test123!@#');
    console.log('');
    console.log('👑 Admin:');
    console.log('   Email: admin@servease.com');
    console.log('   Type: ADMIN');
    console.log('');
    console.log('👤 Customer:');
    console.log('   Email: customer@servease.com');
    console.log('   Type: CUSTOMER');
    console.log('');
    console.log('🔧 Service Provider (Independent):');
    console.log('   Email: provider.independent@servease.com');
    console.log('   Type: SERVICE_PROVIDER_INDEPENDENT');
    console.log('');
    console.log('🏢 Service Provider (Business):');
    console.log('   Email: provider.business@servease.com');
    console.log('   Type: SERVICE_PROVIDER_BUSINESS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

