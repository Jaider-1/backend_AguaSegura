// src/core/security/encryption.service.ts
import { Injectable } from '@nestjs/common';
import * as nodeCrypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    const secret = process.env.ENCRYPTION_KEY;
    if (!secret) {
      throw new Error('ENCRYPTION_KEY is not set');
    }
    // derive a 32-byte key for AES-256
    this.key = nodeCrypto.scryptSync(secret, 'salt', 32);
  }
  
  async encryptSensitiveData(data: any): Promise<string> {
    // Encriptar datos críticos de calidad de agua
    const iv = nodeCrypto.randomBytes(16);
    const cipher = nodeCrypto.createCipheriv(this.algorithm, this.key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(data), 'utf8'),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      iv: iv.toString('hex'),
      encrypted: encrypted.toString('hex'),
      authTag: authTag.toString('hex')
    });
  }
}