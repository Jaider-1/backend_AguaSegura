import { DataSource } from 'typeorm';

type Priority = 'critical' | 'high' | 'medium' | 'low';
type TrafficLight = 'red' | 'yellow' | 'green';

interface RecommendationRule {
  name: string;
  description: string;
  min_quantity_percentage?: number;
  max_quantity_percentage?: number;
  min_quality_irc?: number;
  max_quality_irc?: number;
  climate_conditions?: string[];
  reuse_dispositions?: string[];
  habitantes?: number;
  tipo_vivienda?: string;
  recommendation_text: string;
  priority_level: Priority;
  traffic_light_color: TrafficLight;
  category: string;
}

export async function seedRecommendations(dataSource: DataSource): Promise<void> {
  const rules: RecommendationRule[] = [
    {
      name: 'Emergencia hídrica extrema',
      description: 'Reserva crítica <15%',
      min_quantity_percentage: 0,
      max_quantity_percentage: 15,
      min_quality_irc: 0,
      max_quality_irc: 100,
      recommendation_text: 'Racionamiento inmediato. Priorizar consumo vital.',
      priority_level: 'critical',
      traffic_light_color: 'red',
      category: 'emergencia',
    },
    {
      name: 'Doble riesgo crítico',
      description: 'Baja cantidad + mala calidad',
      min_quantity_percentage: 0,
      max_quantity_percentage: 20,
      min_quality_irc: 80,
      max_quality_irc: 100,
      recommendation_text: 'Uso exclusivo de agua tratada o embotellada.',
      priority_level: 'critical',
      traffic_light_color: 'red',
      category: 'emergencia',
    },
    {
      name: 'Alta demanda en escasez',
      description: 'Hogares grandes (4+ habitantes) con escasez',
      min_quantity_percentage: 0,
      max_quantity_percentage: 30,
      min_quality_irc: 0,
      max_quality_irc: 100,
      habitantes: 4,
      recommendation_text: '≤50L por persona/día.',
      priority_level: 'critical',
      traffic_light_color: 'red',
      category: 'escasez',
    },
    {
      name: 'Escasez hídrica',
      description: 'Definición ONU',
      min_quantity_percentage: 16,
      max_quantity_percentage: 30,
      min_quality_irc: 0,
      max_quality_irc: 5,
      recommendation_text: 'Reducir consumo y priorizar higiene.',
      priority_level: 'high',
      traffic_light_color: 'red',
      category: 'escasez',
    },
    {
      name: 'Gestión intensiva en casas grandes',
      description: 'Hogares de 5+ habitantes en vivienda tipo casa',
      min_quantity_percentage: 0,
      max_quantity_percentage: 100,
      min_quality_irc: 0,
      max_quality_irc: 100,
      habitantes: 5,
      tipo_vivienda: 'Casa',
      recommendation_text: 'Reuso de aguas grises y control por zonas.',
      priority_level: 'high',
      traffic_light_color: 'yellow',
      category: 'hogar',
    },
    {
      name: 'Riesgo sanitario elevado',
      description: 'Vivienda tipo otro con mala calidad',
      min_quality_irc: 35,
      max_quality_irc: 100,
      tipo_vivienda: 'Otro',
      recommendation_text: 'Filtración + cloración obligatoria.',
      priority_level: 'high',
      traffic_light_color: 'red',
      category: 'calidad',
    },
    {
      name: 'Eficiencia en apartamentos',
      description: 'Apartamentos con ocupación baja o media (hasta 3 habitantes)',
      habitantes: 3,
      tipo_vivienda: 'Apartamento',
      recommendation_text: 'Duchas cortas y reutilización limitada.',
      priority_level: 'medium',
      traffic_light_color: 'yellow',
      category: 'hogar',
    },
    {
      name: 'Reuso en casas',
      description: 'Reuso ampliado en vivienda tipo casa',
      tipo_vivienda: 'Casa',
      reuse_dispositions: ['Dispuesto', 'En dudas'],
      recommendation_text: 'Reusar aguas grises en riego.',
      priority_level: 'medium',
      traffic_light_color: 'yellow',
      category: 'reuso',
    },
    {
      name: 'Captación de lluvia',
      description: 'Solo para vivienda tipo casa en temporada de lluvias',
      climate_conditions: ['Lluvias'],
      tipo_vivienda: 'Casa',
      recommendation_text: 'Recolectar agua lluvia.',
      priority_level: 'medium',
      traffic_light_color: 'yellow',
      category: 'infraestructura',
    },
    {
      name: 'Control de fugas',
      description: 'Todas las viviendas',
      recommendation_text: 'Reparar fugas inmediatamente.',
      priority_level: 'medium',
      traffic_light_color: 'yellow',
      category: 'conservación',
    },
    {
      name: 'Consumo eficiente urbano',
      description: 'Apartamento con buena calidad',
      min_quality_irc: 0,
      max_quality_irc: 5,
      tipo_vivienda: 'Apartamento',
      recommendation_text: 'Uso eficiente con dispositivos.',
      priority_level: 'low',
      traffic_light_color: 'green',
      category: 'óptimo',
    },
    {
      name: 'Optimización en casas',
      description: 'Alta disponibilidad en vivienda tipo casa',
      min_quantity_percentage: 70,
      max_quantity_percentage: 100,
      tipo_vivienda: 'Casa',
      recommendation_text: 'Uso sostenible y almacenamiento.',
      priority_level: 'low',
      traffic_light_color: 'green',
      category: 'óptimo',
    },
    {
      name: 'Autogestión individual',
      description: 'Hogar de una persona',
      habitantes: 1,
      recommendation_text: 'Control total del consumo.',
      priority_level: 'low',
      traffic_light_color: 'green',
      category: 'óptimo',
    },
  ];

  const insertQuery = `
    INSERT INTO recommendation (
      name,
      description,
      min_quantity_percentage,
      max_quantity_percentage,
      min_quality_irc,
      max_quality_irc,
      climate_conditions,
      reuse_dispositions,
      habitantes,
      tipo_vivienda,
      recommendation_text,
      priority_level,
      traffic_light_color,
      category
    ) VALUES (
      $1,$2,$3,$4,$5,$6,
      $7,$8,$9,$10,$11,$12,$13,$14
    )
  `;

  for (const rule of rules) {
    await dataSource.query(insertQuery, [
      rule.name,
      rule.description,
      rule.min_quantity_percentage ?? null,
      rule.max_quantity_percentage ?? null,
      rule.min_quality_irc ?? null,
      rule.max_quality_irc ?? null,
      rule.climate_conditions ?? null,
      rule.reuse_dispositions ?? null,
      rule.habitantes ?? null,
      rule.tipo_vivienda ?? null,
      rule.recommendation_text,
      rule.priority_level,
      rule.traffic_light_color,
      rule.category,
    ]);
  }
}
