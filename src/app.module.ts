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
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('database.url', '');
        const explicitDbHost = process.env.DB_HOST || process.env.DATABASE_HOST;
        const isProduction = configService.get<string>('NODE_ENV') === 'production';

        if (isProduction && !databaseUrl && !explicitDbHost) {
          throw new Error(
            'Database configuration is missing in production. Set DATABASE_URL or DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_DATABASE.',
          );
        }

        return {
          type: 'postgres',
          ...(databaseUrl
            ? {
                url: databaseUrl,
                ssl: { rejectUnauthorized: false },
              }
            : {
                host: configService.get<string>('database.host', '127.0.0.1'),
                port: configService.get<number>('database.port', 5432),
                username: configService.get<string>('database.username', 'postgres'),
                password: configService.get<string>('database.password', ''),
                database: configService.get<string>('database.database', 'aguasegura'),
              }),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get<boolean>('database.synchronize', false),
          autoLoadEntities: true,
          logging: configService.get<string>('NODE_ENV') !== 'production',
          retryDelay: 3000,
          retryAttempts: 10,
        };
      },
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
