# Absolute Imports Implementation

This document describes the absolute import configuration implemented across the project.

## Configuration

### TypeScript Configuration (`tsconfig.json`)
Added path mappings for absolute imports:
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@/common/*": ["src/common/*"],
      "@/entities/*": ["src/entities/*"],
      "@/auth/*": ["src/auth/*"],
      "@/admin/*": ["src/admin/*"],
      "@/kyc/*": ["src/kyc/*"],
      "@/services/*": ["src/services/*"],
      "@/bookings/*": ["src/bookings/*"],
      "@/payments/*": ["src/payments/*"],
      "@/notifications/*": ["src/notifications/*"],
      "@/tenants/*": ["src/tenants/*"],
      "@/cities/*": ["src/cities/*"],
      "@/users/*": ["src/users/*"],
      "@/roles/*": ["src/roles/*"],
      "@/permissions/*": ["src/permissions/*"]
    }
  }
}
```

### Jest Configuration (`package.json`)
Added module name mapper for test files:
```json
{
  "jest": {
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/$1",
      "^@/common/(.*)$": "<rootDir>/common/$1",
      "^@/entities/(.*)$": "<rootDir>/entities/$1",
      // ... all module mappings
    }
  }
}
```

### E2E Test Configuration (`test/jest-e2e.json`)
Added module name mapper for E2E tests:
```json
{
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/../src/$1",
    // ... all module mappings
  }
}
```

## Import Patterns

### Before (Relative Imports)
```typescript
import { User } from '../entities/user.entity';
import { AccountType } from '../../common/enums/account-type.enum';
import { AuthService } from './auth.service';
```

### After (Absolute Imports)
```typescript
import { User } from '@/entities/user.entity';
import { AccountType } from '@/common/enums/account-type.enum';
import { AuthService } from '@/auth/auth.service';
```

## Benefits

1. **Cleaner Imports**: No more `../../../` paths
2. **Easier Refactoring**: Moving files doesn't break imports
3. **Better IDE Support**: Autocomplete works better with absolute paths
4. **Consistency**: All imports follow the same pattern
5. **Readability**: Easier to understand where imports come from

## Usage Examples

### Entities
```typescript
import { User } from '@/entities/user.entity';
import { Service } from '@/entities/service.entity';
```

### Common Utilities
```typescript
import { AccountType } from '@/common/enums/account-type.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Public } from '@/common/decorators/public.decorator';
```

### Module Imports
```typescript
import { AuthService } from '@/auth/auth.service';
import { KycService } from '@/kyc/kyc.service';
import { AdminService } from '@/admin/admin.service';
```

### DTOs
```typescript
import { SignupDto } from '@/auth/dto/signup.dto';
import { CreateBookingDto } from '@/bookings/dto/create-booking.dto';
```

## Migration Status

✅ All source files (`src/`) converted to absolute imports
✅ All test files (`src/**/*.spec.ts`) converted to absolute imports
✅ Configuration files updated
✅ TypeScript compilation verified

## Notes

- Same-directory imports (e.g., `./file`) within a module are kept as relative for clarity
- All cross-module imports use absolute paths with `@/` prefix
- The `@/` prefix maps to the `src/` directory
