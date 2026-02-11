// src/core/audit/audit.service.ts


import { Injectable } from '@nestjs/common';

import * as crypto from 'crypto';

interface SecurityAuditEvent {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  userAgent: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
}

interface AuditRepository {
  create(data: Record<string, unknown>): Record<string, unknown>;
  save(data: Record<string, unknown>): Promise<void>;
}

@Injectable()
export class AuditService {
  private privateKey: string;

  constructor(private auditRepository: AuditRepository) {
    this.privateKey = process.env.AUDIT_PRIVATE_KEY || '';
  }

  async logSecurityEvent(event: SecurityAuditEvent): Promise<void> {
    const auditLog = this.auditRepository.create({
      userId: event.userId,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      metadata: {
        before: event.beforeState,
        after: event.afterState,
        riskLevel: this.calculateRiskLevel(event)
      },
      digitalSignature: this.signAuditEvent(event)
    });
    
    await this.auditRepository.save(auditLog);
  }
  
  private signAuditEvent(event: SecurityAuditEvent): string {
    // Firmar digitalmente cada evento de auditoría
    const sign = crypto.createSign('SHA256');
    sign.update(JSON.stringify(event));
    return sign.sign(this.privateKey, 'base64');
  }


    private calculateRiskLevel(event: SecurityAuditEvent): 'low' | 'medium' | 'high' {
    // Lógica simple para determinar el nivel de riesgo
    if (event.action === 'DELETE' || event.action === 'UPDATE' && event.beforeState?.sensitive) {
      return 'high';
    }   
    if (event.action === 'CREATE' || event.action === 'UPDATE') {
      return 'medium';
    }
    return 'low';
  }

}