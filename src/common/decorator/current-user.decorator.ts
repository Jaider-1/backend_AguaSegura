// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    if (!request.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    
    // Si se especifica un campo, devolver solo ese campo
    if (field && request.user) {
      return request.user[field];
    }
    
    // Devolver todo el objeto usuario
    return request.user;
  },
);