import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { WaterQuantityModule } from './modules/water-quantity/water-quantity.module';
import { WaterQualityModule } from './modules/water-quality/water-quality.module';
import { FormResponsesModule } from './modules/form-responses/form-responses.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    
    TypeOrmModule.forRootAsync({
      
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'jeyson1171'),
        database: configService.get('DB_DATABASE', 'aguasegura'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE', true),
        autoLoadEntities: true,
        logging: true,
        retryDelay: 3000,
        retryAttempts: 10,
      }),
      inject: [ConfigService],
    }),
    
    AuthModule,
    UsersModule,
    RecommendationsModule,
    WaterQuantityModule,
    WaterQualityModule,
    FormResponsesModule
  ],
})
export class AppModule {}
