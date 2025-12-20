import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class GlobalSecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 1. Sanitización de inputs
    this.sanitizeRequest(req);
    
    // 2. Validación de content-type
    this.validateContentType(req);
    
    // 3. Rate limiting por IP
    this.applyRateLimiting(req);
    
    // 4. Logging de seguridad
    this.logSecurityEvent(req);
    
    next();
  }
  
  private sanitizeRequest(req: Request): void {
    // Implementar sanitización profunda
    if (req.body) {
      req.body = this.deepSanitize(req.body);
    }
  }

  private deepSanitize<T>(obj: T): T {
    if (!obj || typeof obj !== 'object') return obj;
    const clone: any = Array.isArray(obj) ? [] : {};
    for (const key of Object.keys(obj as any)) {
      const val = (obj as any)[key];
      if (typeof val === 'string') {
        // simple sanitization: strip angle brackets to reduce XSS risk
        clone[key] = val.replace(/[<>]/g, '');
      } else if (val && typeof val === 'object') {
        clone[key] = this.deepSanitize(val);
      } else {
        clone[key] = val;
      }
    }
    return clone as T;
  }

  private validateContentType(req: Request): void {
    const contentType = req.headers['content-type'];
    if (!contentType) {
      // no content type provided; optionally set a default or log
      return;
    }
    // basic enforcement example: allow JSON or form data
    if (!/application\/json|application\/x-www-form-urlencoded/.test(contentType)) {
      // do not throw here to keep middleware non-intrusive; you may send a response if desired
      return;
    }
  }

  private applyRateLimiting(req: Request): void {
    // stub implementation: integrate a real rate limiter (e.g., redis, in-memory, or express-rate-limit)
    return;
  }

  private logSecurityEvent(req: Request): void {
    // minimal logging stub; replace with a structured logger as needed
    // console.debug(`[Security] ${req.method} ${req.url}`);
    return;
  }
}