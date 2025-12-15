// database/seeds/recommendations.seed.ts
import { DataSource } from 'typeorm';

export async function seedRecommendations(dataSource: DataSource): Promise<void> {
  const rules = [
    // Regla 1: Cantidad crítica, cualquier calidad
    {
      name: 'Emergencia por escasez extrema',
      description: 'Cuando la cantidad de agua es menor al 15%',
      min_quantity_percentage: 0,
      max_quantity_percentage: 15,
      recommendation_text: 'Suspender actividades no esenciales que usen agua. Priorizar solo para consumo humano y cocina.',
      priority_level: 'high',
      traffic_light_color: 'red',
      category: 'emergencia',
    },
    
    // Regla 2: Cantidad baja, calidad buena, dispuesto a reusar
    {
      name: 'Ahorro con reuso para sequía',
      description: 'Poca agua de buena calidad en época de sequía',
      min_quantity_percentage: 16,
      max_quantity_percentage: 30,
      min_quality_irc: 0,
      max_quality_irc: 14,
      climate_conditions: ['Sequía'],
      reuse_dispositions: ['Dispuesto'],
      recommendation_text: 'Recolectar agua de la ducha para el inodoro. Reutilizar agua de lavar verduras para plantas.',
      priority_level: 'high',
      traffic_light_color: 'yellow',
      category: 'reuso',
    },

    // Regla 3: Cantidad normal, calidad regular, lluvias
    {
      name: 'Calidad media en lluvias',
      description: 'Agua de calidad regular en época de lluvias',
      min_quantity_percentage: 31,
      max_quantity_percentage: 70,
      min_quality_irc: 14.1,
      max_quality_irc: 35,
      climate_conditions: ['Lluvias'],
      recommendation_text: 'Hervir el agua antes de consumir. Usar filtros adicionales durante lluvias intensas.',
      priority_level: 'medium',
      traffic_light_color: 'yellow',
      category: 'calidad',
    },

    // Regla 4: Cantidad alta, calidad excelente
    {
      name: 'Mantenimiento óptimo',
      description: 'Agua abundante y de excelente calidad',
      min_quantity_percentage: 71,
      max_quantity_percentage: 100,
      min_quality_irc: 0,
      max_quality_irc: 5,
      recommendation_text: 'Mantener 👌buenas prácticas. Realizar mantenimiento preventivo del sistema de almacenamiento.',
      priority_level: 'low',
      traffic_light_color: 'green',
      category: 'ahorro',
    },

    // Regla 5: Calidad peligrosa
    {
      name: 'Emergencia por calidad peligrosa',
      description: 'Agua con IRCA mayor a 80% (peligrosa)',
      min_quality_irc: 80.1,
      max_quality_irc: 100,
      recommendation_text: 'NO CONSUMIR BAJO NINGUNA CIRCUNSTANCIA. Contactar autoridades sanitarias inmediatamente.',
      priority_level: 'high',
      traffic_light_color: 'red',
      category: 'emergencia',
    },

    // Regla 6: En dudas sobre reuso, cualquier condición
    {
      name: 'Concienciación sobre reuso',
      description: 'Para usuarios que dudan sobre reusar agua',
      reuse_dispositions: ['En dudas'],
      recommendation_text: 'Comience reusando agua de actividades sencillas como lavar verduras. El impacto es significativo.',
      priority_level: 'medium',
      traffic_light_color: 'yellow',
      category: 'reuso',
    },

    // Regla 7: Hogares con más de 5 personas
    {
      name: 'Optimización para familias grandes',
      description: 'Recomendaciones específicas para hogares con 5+ personas',
      recommendation_text: 'Establecer horarios para duchas. Usar lavadora con carga completa. Educar a todos los miembros.',
      priority_level: 'medium',
      traffic_light_color: 'yellow',
      category: 'ahorro',
    },
  ];

  console.log('Sembrando reglas de recomendación...');

  for (const ruleData of rules) {
    // Verificar si la regla ya existe
    const existingRule = await dataSource.query(
      `SELECT id FROM recommendation_rules WHERE name = $1`,
      [ruleData.name]
    );

    if (existingRule.length === 0) {
      await dataSource.query(`
        INSERT INTO recommendation_rules (
          name, description, min_quantity_percentage, max_quantity_percentage,
          min_quality_irc, max_quality_irc, climate_conditions, reuse_dispositions,
          recommendation_text, priority_level, traffic_light_color, category
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        ruleData.name,
        ruleData.description,
        ruleData.min_quantity_percentage,
        ruleData.max_quantity_percentage,
        ruleData.min_quality_irc || null,
        ruleData.max_quality_irc || null,
        ruleData.climate_conditions || null,
        ruleData.reuse_dispositions || null,
        ruleData.recommendation_text,
        ruleData.priority_level,
        ruleData.traffic_light_color,
        ruleData.category
      ]);
      
      console.log(`Regla creada: ${ruleData.name}`);
    } else {
      console.log(`Regla ya existe: ${ruleData.name}`);
    }
  }

  console.log('Seed de reglas completado exitosamente');
}