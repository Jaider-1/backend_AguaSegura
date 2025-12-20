// src/modules/users/users.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { RecommendationsModule } from '../recommendations/recommendations.module'; // ← Importa RecommendationsModule

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => RecommendationsModule), // ← Importa RecommendationsModule también
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}