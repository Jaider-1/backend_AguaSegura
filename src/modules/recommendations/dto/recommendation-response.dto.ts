import { ApiProperty } from '@nestjs/swagger';

export class RecommendationResponseDto {
  @ApiProperty({ description: 'ID de la recomendación' })
  id: string;

  @ApiProperty({ description: 'ID del usuario' })
  user_id: string;

  @ApiProperty({ description: 'ID del tipo de recomendación aplicada' })
  tipo_id: string;

  @ApiProperty({ description: 'Mensaje de la recomendación' })
  mensaje: string;

  @ApiProperty({ 
    description: 'Datos contextuales', 
    required: false,
    type: Object 
  })
  datos_contexto?: Record<string, any>;

  @ApiProperty({ description: 'Indica si fue leída' })
  leida: boolean;

  @ApiProperty({ description: 'Fecha de aplicación', required: false })
  fecha_aplicacion?: Date;

  @ApiProperty({ description: 'Prioridad (0-100)' })
  prioridad: number;

  @ApiProperty({ description: 'Fecha de creación' })
  created_at: Date;

  @ApiProperty({ description: 'Nombre del tipo', required: false })
  tipo_nombre?: string;

  @ApiProperty({ description: 'Descripción del tipo', required: false })
  tipo_descripcion?: string;

  @ApiProperty({ description: 'Categoría del tipo', required: false })
  tipo_categoria?: string;

  @ApiProperty({ description: 'Nivel de prioridad del tipo', required: false })
  tipo_prioridad?: string;

  @ApiProperty({ description: 'Color de semáforo del tipo', required: false })
  tipo_color_semaforo?: string;

  @ApiProperty({ description: 'Indica si es urgente' })
  es_urgente: boolean;

  @ApiProperty({ description: 'Días desde la creación' })
  dias_desde_creacion: number;

  @ApiProperty({ description: 'Indica si puede aplicarse' })
  puede_aplicarse: boolean;
}
