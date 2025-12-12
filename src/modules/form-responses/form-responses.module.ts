import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormResponsesController } from './from-responses.controller';
import { FormResponsesService } from './form-responses.service';
import { FormResponse } from './entities/form-response.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FormResponse])],
  controllers: [FormResponsesController],
  providers: [FormResponsesService],
  exports: [FormResponsesService],
})
export class FormResponsesModule {}