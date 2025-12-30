import {
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from '@/tenants/tenants.service';

@Injectable()
export class TenantResolutionMiddleware implements NestMiddleware {
  constructor(private tenantsService: TenantsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let tenantId: string | undefined;

    const tenantHeader = req.headers['x-tenant-id'] as string;
    const host = req.headers.host || '';
    const subdomain = host.split('.')[0];

    if (tenantHeader) {
      tenantId = tenantHeader;
    } else if (subdomain && subdomain !== 'localhost' && subdomain !== '127.0.0.1') {
      const tenant = await this.tenantsService.findBySubdomain(subdomain);
      if (tenant) {
        tenantId = tenant.id;
      }
    }

    if (tenantId) {
      try {
        const tenant = await this.tenantsService.findById(tenantId);
        (req as any).tenant = tenant;
        (req as any).tenantId = tenantId;
      } catch {
        throw new NotFoundException('Tenant not found');
      }
    }

    next();
  }
}
