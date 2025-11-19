import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { User } from './modules/users/entities/user.entity';
import configuration from './config/configuration';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: configuration().database.host,
      port: configuration().database.port,
      username: configuration().database.username,
      password: configuration().database.password,
      database: configuration().database.database,
      entities: [User],
      synchronize: true,
      logging: true,
    }),
    // Eliminar JwtModule de aquí
    AuthModule,
    UsersModule,
    RecommendationsModule,
  ],
})
export class AppModule {}