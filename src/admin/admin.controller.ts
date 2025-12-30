import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AccountStatusGuard } from '@/common/guards/account-status.guard';
import { Permissions } from '@/common/decorators/roles.decorator';
import { Permission } from '@/common/enums/permission.enum';
import { AccountStatus } from '@/common/enums/account-status.enum';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { BlacklistIPDto } from './dto/blacklist-ip.dto';
import { BlockEmailDto } from './dto/block-email.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @Permissions(Permission.USER_READ)
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user status' })
  @Permissions(Permission.USER_WRITE)
  @ApiBody({ type: UpdateUserStatusDto })
  async updateUserStatus(
    @Param('id') userId: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(
      userId,
      updateUserStatusDto.status,
    );
  }

  @Post('roles')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create role' })
  @Permissions(Permission.USER_WRITE)
  @ApiBody({ type: CreateRoleDto })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.adminService.createRole(
      createRoleDto.name,
      createRoleDto.description,
      createRoleDto.permissionIds,
    );
  }

  @Patch('roles/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update role' })
  @Permissions(Permission.USER_WRITE)
  @ApiBody({ type: UpdateRoleDto })
  async updateRole(
    @Param('id') roleId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.adminService.updateRole(
      roleId,
      updateRoleDto.name,
      updateRoleDto.permissionIds,
    );
  }

  @Patch('kyc/:id/approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve KYC' })
  @Permissions(Permission.KYC_APPROVE)
  @ApiBody({ schema: { type: 'object', properties: { notes: { type: 'string' } } } })
  async approveKYC(
    @Param('id') kycId: string,
    @Request() req,
    @Body() body: { notes?: string },
  ) {
    return this.adminService.approveKYC(kycId, req.user.id, body.notes);
  }

  @Patch('kyc/:id/reject')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject KYC' })
  @Permissions(Permission.KYC_APPROVE)
  @ApiBody({ schema: { type: 'object', properties: { notes: { type: 'string' } } } })
  async rejectKYC(
    @Param('id') kycId: string,
    @Request() req,
    @Body() body: { notes?: string },
  ) {
    return this.adminService.rejectKYC(kycId, req.user.id, body.notes);
  }

  @Get('kyc')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all KYC submissions' })
  @Permissions(Permission.KYC_APPROVE)
  async getKYCList() {
    return this.adminService.getKYCList();
  }

  @Post('blacklist/ip')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Blacklist IP address' })
  @Permissions(Permission.SYSTEM_SECURITY)
  @ApiBody({ type: BlacklistIPDto })
  async blacklistIP(@Body() blacklistIPDto: BlacklistIPDto) {
    return this.adminService.blacklistIP(
      blacklistIPDto.ipAddress,
      blacklistIPDto.reason,
    );
  }

  @Post('block-email')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Block email address' })
  @Permissions(Permission.SYSTEM_SECURITY)
  @ApiBody({ type: BlockEmailDto })
  async blockEmail(@Body() blockEmailDto: BlockEmailDto) {
    return this.adminService.blockEmail(
      blockEmailDto.email,
      blockEmailDto.reason,
    );
  }
}
