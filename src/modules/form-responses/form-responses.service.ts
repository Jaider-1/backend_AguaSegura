import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormResponse } from './entities/form-response.entity';
import { CreateFormResponseDto } from './dto/create-form-response.dto';
import { UpdateFormResponseDto } from './dto/update-form-response.dto';

@Injectable()
export class FormResponsesService {
  constructor(
    @InjectRepository(FormResponse)
    private formResponseRepository: Repository<FormResponse>,
  ) {}

  // ========== CREATE ==========
  async create(createDto: CreateFormResponseDto): Promise<FormResponse> {
    try {
      // Validar que los arrays no estén vacíos si se requieren
      this.validateFormData(createDto);
      
      const formResponse = this.formResponseRepository.create(createDto);
      return await this.formResponseRepository.save(formResponse);
    } catch (error) {
      throw new BadRequestException(`Error al crear respuesta: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ========== FIND ALL ==========
  async findAll(userId?: string): Promise<FormResponse[]> {
    const where: any = {};
    if (userId) where.userId = userId;
    
    return this.formResponseRepository.find({ 
      where,
      order: { createdAt: 'DESC' },
      relations: ['user']
    });
  }

  // ========== FIND ONE ==========
  async findOne(id: string): Promise<FormResponse> {
    const formResponse = await this.formResponseRepository.findOne({ 
      where: { id },
      relations: ['user']
    });
    
    if (!formResponse) {
      throw new NotFoundException(`Respuesta con ID "${id}" no encontrada`);
    }
    
    return formResponse;
  }

  // ========== FIND BY USER ID ==========
  async findByUserId(userId: string): Promise<FormResponse[]> {
    return this.formResponseRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['user']
    });
  }

  // ========== GET LATEST BY USER ==========
  async getLatestByUser(userId: string): Promise<FormResponse | null> {
    return this.formResponseRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['user']
    });
  }

  // ========== UPDATE ==========
  async update(id: string, updateDto: UpdateFormResponseDto): Promise<FormResponse> {
    const existingResponse = await this.findOne(id);
    
    // Verificar que el usuario no cambie el userId de la respuesta
    if (updateDto.userId && existingResponse.userId !== updateDto.userId) {
      throw new BadRequestException('No puede cambiar el usuario de una respuesta existente');
    }
    
    // Validar datos si se proporcionan
    if (updateDto.currentMethods || updateDto.potentialSources || updateDto.barriers) {
      this.validatePartialFormData(updateDto);
    }
    
    // Actualizar campos
    Object.assign(existingResponse, updateDto);
    
    return await this.formResponseRepository.save(existingResponse);
  }

  // ========== UPDATE LATEST BY USER ==========
  async updateLatestByUser(userId: string, updateDto: UpdateFormResponseDto): Promise<FormResponse> {
    const latestResponse = await this.getLatestByUser(userId);
    
    if (!latestResponse) {
      throw new NotFoundException(`No se encontraron respuestas previas para el usuario ${userId}`);
    }
    
    // Validar datos parciales
    this.validatePartialFormData(updateDto);
    
    Object.assign(latestResponse, updateDto);
    return await this.formResponseRepository.save(latestResponse);
  }

  // ========== CREATE OR UPDATE (UPSERT) ==========
  async createOrUpdate(userId: string, data: CreateFormResponseDto): Promise<FormResponse> {
    try {
      // Intentar actualizar la última respuesta
      const updated = await this.updateLatestByUser(userId, { ...data, userId });
      return updated;
    } catch (error) {
      // Si no hay respuesta previa, crear nueva
      if (error instanceof NotFoundException) {
        return this.create({ ...data, userId });
      }
      throw error;
    }
  }

  // ========== DELETE ==========
  async remove(id: string): Promise<void> {
    const formResponse = await this.findOne(id);
    await this.formResponseRepository.remove(formResponse);
  }

  // ========== DELETE BY USER ==========
  async removeByUser(userId: string): Promise<{ deletedCount: number }> {
    const result = await this.formResponseRepository.delete({ userId });
    return { deletedCount: result.affected || 0 };
  }

  // ========== STATS BY USER ==========
  async getUserStats(userId: string): Promise<any> {
    const responses = await this.findByUserId(userId);
    
    if (responses.length === 0) {
      return { message: 'No hay respuestas para este usuario', count: 0 };
    }
    
    const latest = responses[0];
    
    // Calcular promedios si hay múltiples respuestas
    const avgKnowledge = responses.reduce((sum, r) => sum + r.reuseKnowledgeLevel, 0) / responses.length;
    const avgMotivation = responses.reduce((sum, r) => sum + r.motivationLevel, 0) / responses.length;
    
    // Métodos más comunes
    const methodCounts = {};
    responses.forEach(r => {
      r.currentMethods.forEach(method => {
        methodCounts[method] = (methodCounts[method] || 0) + 1;
      });
    });
    
    // Barreras más comunes
    const barrierCounts = {};
    responses.forEach(r => {
      r.barriers.forEach(barrier => {
        barrierCounts[barrier] = (barrierCounts[barrier] || 0) + 1;
      });
    });
    
    return {
      totalResponses: responses.length,
      latestResponseDate: latest.createdAt,
      willingness: latest.willingToReuse ? 'Dispuesto' : 'No dispuesto',
      averageKnowledge: avgKnowledge.toFixed(1),
      averageMotivation: avgMotivation.toFixed(1),
      mostCommonMethods: Object.entries(methodCounts)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 3),
      mostCommonBarriers: Object.entries(barrierCounts)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 3),
      householdInfo: {
        members: latest.householdMembers,
        housingType: latest.housingType,
        location: latest.location,
        avgConsumption: responses.reduce((sum, r) => sum + (r.monthlyWaterConsumption || 0), 0) / responses.filter(r => r.monthlyWaterConsumption).length
      }
    };
  }

  // ========== VALIDATION METHODS ==========
  private validateFormData(dto: CreateFormResponseDto | UpdateFormResponseDto): void {
    // Validar que los arrays tengan valores válidos
    this.validateArrayValues(dto.currentMethods, 
      ['riego_plantas', 'lavado_pisos', 'lavado_auto', 'cisterna_baño'], 
      'currentMethods');
    
    this.validateArrayValues(dto.potentialSources,
      ['agua_lavadora', 'agua_ducha', 'agua_lavamanos', 'agua_lluvia', 'agua_cocina'],
      'potentialSources');
    
    this.validateArrayValues(dto.barriers,
      ['falta_espacio', 'costo_elevado', 'falta_conocimiento', 'falta_tiempo'],
      'barriers');
    
    // Validar niveles
    if (dto.reuseKnowledgeLevel && (dto.reuseKnowledgeLevel < 1 || dto.reuseKnowledgeLevel > 5)) {
      throw new BadRequestException('reuseKnowledgeLevel debe estar entre 1 y 5');
    }
    
    if (dto.motivationLevel && (dto.motivationLevel < 1 || dto.motivationLevel > 5)) {
      throw new BadRequestException('motivationLevel debe estar entre 1 y 5');
    }
    
    // Validar tipo de vivienda
    const validHousingTypes = ['casa', 'apartamento', 'finca', 'lote', 'otro'];
    if (dto.housingType && !validHousingTypes.includes(dto.housingType)) {
      throw new BadRequestException(`housingType debe ser uno de: ${validHousingTypes.join(', ')}`);
    }
  }

  private validatePartialFormData(dto: UpdateFormResponseDto): void {
    this.validateFormData(dto as CreateFormResponseDto);
  }

  private validateArrayValues(array: string[], validValues: string[], fieldName: string): void {
    if (array && array.length > 0) {
      const invalidValues = array.filter(value => !validValues.includes(value));
      if (invalidValues.length > 0) {
        throw new BadRequestException(
          `Valores inválidos en ${fieldName}: ${invalidValues.join(', ')}. Valores válidos: ${validValues.join(', ')}`
        );
      }
    }
  }
}