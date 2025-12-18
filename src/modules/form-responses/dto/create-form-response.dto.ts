import { IsString, IsBoolean, IsNumber, IsArray, IsOptional, Min, Max, IsIn, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFormResponseDto {

  // ID del usuario (opcional para pruebas)
  @ApiProperty({ 
    example: 'user-id-here', 
    description: 'ID del usuario (opcional para desarrollo)',
    required: false 
  })
  @IsOptional()
  @IsString()
  userId?: string;

// ===== SECCIÓN 2: Métodos de Reuso =====
  @ApiProperty({
    example: ['riego_plantas', 'lavado_pisos'],
    description: 'Métodos de reuso actualmente utilizados',
    enum: ['riego_plantas', 'lavado_pisos', 'lavado_auto', 'cisterna_baño']
  })
  @IsArray()
  @IsString({ each: true })
  @IsIn(['riego_plantas', 'lavado_pisos', 'lavado_auto', 'cisterna_baño'], { each: true })
  currentMethods: string[];

   // ===== SECCIÓN 3: Fuentes de Agua =====
  @ApiProperty({
    example: ['agua_ducha', 'agua_lluvia'],
    description: 'Fuentes de agua potenciales para reuso',
    enum: ['agua_lavadora', 'agua_ducha', 'agua_lavamanos', 'agua_lluvia', 'agua_cocina']
  })
  @IsArray()
  @IsString({ each: true })
  @IsIn(['agua_lavadora', 'agua_ducha', 'agua_lavamanos', 'agua_lluvia', 'agua_cocina'], { each: true })
  potentialSources: string[];


  // ===== SECCIÓN 4: Barreras =====
  @ApiProperty({
    example: ['falta_conocimiento', 'costo_elevado'],
    description: 'Barreras para el reuso de agua',
    enum: ['falta_espacio', 'costo_elevado', 'falta_conocimiento', 'falta_tiempo']
  })
  @IsArray()
  @IsString({ each: true })
  @IsIn(['falta_espacio', 'costo_elevado', 'falta_conocimiento', 'falta_tiempo'], { each: true })
  barriers: string[];

// ===== SECCIÓN 5: Actitudes y Conocimientos =====
  @ApiProperty({ 
    example: 3, 
    description: 'Conocimiento sobre métodos de reuso (1-5)',
    minimum: 1,
    maximum: 5 
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  reuseKnowledgeLevel: number;


// ===== SECCIÓN 6: Motivación y Disposición =====
   @ApiProperty({ 
    example: 4, 
    description: 'Motivación para implementar reuso (1-5)',
    minimum: 1,
    maximum: 5 
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  motivationLevel: number;


// ===== SECCIÓN 7: Comportamientos Fututos =====
  @ApiProperty({ 
    example: true, 
    description: '¿Estaría dispuesto a reusar agua?' 
  })
  @IsBoolean()
  willingToReuse: boolean;

  @ApiProperty({
    example: 'Uso agua del aire acondicionado para plantas',
    description: 'Descripción de otros métodos de reuso',
    required: false
  })
  @IsOptional()
  @IsString()
  otherMethodsDescription?: string;

 

  

  // ===== SECCIÓN 5: Información del Hogar =====
  @ApiProperty({ 
    example: 4, 
    description: 'Número de habitantes en el hogar',
    minimum: 1,
    maximum: 20 
  })
  @IsNumber()
  @Min(1)
  @Max(20)
  householdMembers: number;

  @ApiProperty({ 
    example: 'casa', 
    description: 'Tipo de vivienda',
    enum: ['casa', 'apartamento', 'finca', 'lote', 'otro'] 
  })
  @IsString()
  @IsIn(['casa', 'apartamento', 'finca', 'lote', 'otro'])
  housingType: string;

  @ApiProperty({ 
    example: 'Bogotá, Chapinero', 
    description: 'Ubicación (opcional)',
    required: false 
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ 
    example: 12000.50, 
    description: 'Consumo mensual de agua en litros',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyWaterConsumption?: number;

  
}