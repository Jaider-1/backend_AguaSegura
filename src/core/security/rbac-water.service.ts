import { Injectable } from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service';


@Injectable()
export class WaterRBACService {
  private readonly rolePermissions = {
    CITIZEN: ['view_own_data', 'generate_recommendations'],
    TECHNICIAN: ['view_quality_data', 'create_alerts', 'view_recommendations'],
    HEALTH_OFFICER: ['view_critical_data', 'export_reports', 'manage_alerts'],
    ADMIN: ['manage_users', 'view_audit_logs', 'system_configuration']
  };

  constructor(private readonly usersService: UsersService) {}

  async checkWaterDataAccess(userId: string, dataType: string): Promise<boolean> {
    const user = await this.usersService.findOne(userId);
    const userRole = user.role;
    
    // Reglas específicas para datos de agua
    if (dataType === 'CRITICAL_QUALITY_DATA') {
      return ['HEALTH_OFFICER', 'ADMIN'].includes(userRole);
    }
    
    if (dataType === 'HISTORICAL_DATA') {
      return ['TECHNICIAN', 'HEALTH_OFFICER', 'ADMIN'].includes(userRole);
    }
    
    return this.rolePermissions[userRole]?.includes(`view_${dataType}`) ?? false;
  }
}