import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  Version,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AccountStatusGuard } from '@/common/guards/account-status.guard';
import { AccountTypeGuard } from '@/common/guards/account-type.guard';
import { AccountType } from '@/common/enums/account-type.enum';
import { AccountTypes } from '@/common/decorators/account-type.decorator';
import { Permissions } from '@/common/decorators/roles.decorator';
import { Permission } from '@/common/enums/permission.enum';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Version('1')
  @Post('admin/service-categories')
  @UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create service category (Admin only)' })
  @Permissions(Permission.USER_WRITE)
  @ApiBody({ type: CreateCategoryDto })
  async createCategoryHandler(@Body() createCategoryDto: CreateCategoryDto) {
    return this.servicesService.createCategory(
      createCategoryDto.name,
      createCategoryDto.description,
    );
  }

  @Version('1')
  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Get all service categories' })
  async getCategoriesHandler() {
    return this.servicesService.getCategories();
  }

  @Version('1')
  @Post()
  @UseGuards(JwtAuthGuard, AccountStatusGuard, AccountTypeGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create service (Service Providers Only)' })
  @AccountTypes(
    AccountType.SERVICE_PROVIDER_INDEPENDENT,
    AccountType.SERVICE_PROVIDER_BUSINESS,
  )
  @ApiBody({ type: CreateServiceDto })
  async createServiceHandler(@Request() req, @Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.createService(
      req.user.id,
      createServiceDto.title,
      createServiceDto.categoryId,
      createServiceDto.price,
      createServiceDto.description,
      createServiceDto.images,
    );
  }

  @Version('1')
  @Get()
  @Public()
  @ApiOperation({ summary: 'Browse services (Public)' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'cityId', required: false })
  async browseServicesHandler(
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('cityId') cityId?: string,
  ) {
    return this.servicesService.browseServices(category, minPrice, maxPrice, cityId);
  }

  @Version('1')
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get service by ID' })
  async getServiceByIdHandler(@Param('id') id: string) {
    return this.servicesService.getServiceById(id);
  }
}
