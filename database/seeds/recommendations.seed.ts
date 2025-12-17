// database/seeds/recommendations.seed.ts
import { DataSource } from 'typeorm';

export async function seedRecommendations(dataSource: DataSource): Promise<void> {
  const rules = [
    // 1. EMERGENCIA POR ESCASEZ CRÍTICA (<15%)
    {
      name: 'Emergencia hídrica - Nivel crítico',
      description: 'Reserva de agua inferior al 15% según estándares OMS',
      min_quantity_percentage: 0,
      max_quantity_percentage: 15,
      recommendation_text: 'EMERGENCIA: Implementar medidas de racionamiento inmediato. Priorizar solo agua para beber, preparar alimentos e higiene personal básica. Suspender riego de jardines, lavado de autos y otras actividades no esenciales. Consumir mínimo 2 litros por persona al día según OMS.',
      priority_level: 'critical',
      traffic_light_color: 'red',
      category: 'emergencia',
    },
    
    // 2. ESCASEZ MODERADA (16-30%)
    {
      name: 'Escasez moderada - Ahorro intensivo',
      description: 'Reserva entre 16-30% en condiciones de sequía',
      min_quantity_percentage: 16,
      max_quantity_percentage: 30,
      min_quality_irc: 0,
      max_quality_irc: 14,
      climate_conditions: ['Sequía'],
      reuse_dispositions: ['Dispuesto'],
      recommendation_text: 'AHORRO INTENSIVO: Recolectar agua de la ducha para el inodoro. Reutilizar agua de lavar verduras para plantas. Reducir tiempo de ducha a 5 minutos máximo. Usar lavadora solo con carga completa. Según UNESCO, estas prácticas pueden ahorrar hasta 50% del consumo doméstico.',
      priority_level: 'high',
      traffic_light_color: 'yellow',
      category: 'ahorro',
    },

    // 3. CALIDAD REGULAR EN ÉPOCA DE LLUVIAS
    {
      name: 'Calidad media - Precauciones en lluvias',
      description: 'Agua de calidad aceptable durante temporada lluviosa (IRCA 15-35%)',
      min_quantity_percentage: 31,
      max_quantity_percentage: 70,
      min_quality_irc: 15,
      max_quality_irc: 35,
      climate_conditions: ['Lluvias'],
      recommendation_text: 'PRECAUCIÓN: Hervir el agua antes de consumir (1 minuto en ebullición según OMS). Usar filtros de sedimentos. Evitar recolectar agua de los primeros 10 minutos de lluvia. Almacenar agua en recipientes limpios y tapados.',
      priority_level: 'medium',
      traffic_light_color: 'yellow',
      category: 'calidad',
    },

    // 4. SITUACIÓN ÓPTIMA
    {
      name: 'Condiciones óptimas - Mantenimiento preventivo',
      description: 'Agua abundante y de excelente calidad (IRCA <5%)',
      min_quantity_percentage: 71,
      max_quantity_percentage: 100,
      min_quality_irc: 0,
      max_quality_irc: 5,
      recommendation_text: 'SITUACIÓN ÓPTIMA: Mantener buenas prácticas de conservación. Revisar y limpiar tanques de almacenamiento cada 6 meses. Verificar que no haya fugas. La ONU recomienda usar máximo 100 litros por persona al día como consumo sostenible.',
      priority_level: 'low',
      traffic_light_color: 'green',
      category: 'mantenimiento',
    },

    // 5. CALIDAD PELIGROSA (IRCA >80%)
    {
      name: 'Emergencia sanitaria - Agua no potable',
      description: 'Agua con IRCA mayor a 80% (riesgo alto según OMS)',
      min_quality_irc: 80.1,
      max_quality_irc: 100,
      recommendation_text: 'PELIGRO: AGUA NO POTABLE. NO CONSUMIR. Contactar inmediatamente a autoridades sanitarias. Usar agua embotellada o hervida para todas las necesidades. Desinfectar recipientes con cloro (2 gotas por litro, esperar 30 minutos). Según OMS, agua con IRCA >80% representa riesgo alto para la salud.',
      priority_level: 'critical',
      traffic_light_color: 'red',
      category: 'emergencia',
    },

    // 6. PROMOCIÓN DE REUSO
    {
      name: 'Reuso responsable - Iniciación',
      description: 'Promoción de prácticas de reuso para principiantes',
      reuse_dispositions: ['En dudas'],
      recommendation_text: 'COMENZAR CON REUSO: 1) Recolectar agua de aire acondicionado para plantas. 2) Reutilizar agua de cocer huevos (enfriada) para regar. 3) Usar agua de lavar frutas para el inodoro. La UNESCO estima que el reuso puede reducir consumo doméstico en 30-40%.',
      priority_level: 'medium',
      traffic_light_color: 'yellow',
      category: 'reuso',
    },

    // 7. FAMILIAS GRANDES (>5 personas)
    {
      name: 'Gestión familiar eficiente',
      description: 'Estrategias para hogares con 5+ miembros',
      recommendation_text: 'Establecer horarios de ducha (máximo 5 minutos por persona). Usar lavavajillas solo lleno. Educar a niños sobre cierre de llaves. La ONU recomienda monitorear consumo familiar semanal. Meta: menos de 500 litros/día para familia de 5.',
      priority_level: 'medium',
      traffic_light_color: 'yellow',
      category: 'familias',
    },

    // 8. NUEVA: CALIDAD ACEPTABLE (IRCA 36-79%)
    {
      name: 'Calidad aceptable con tratamiento',
      description: 'Agua que requiere tratamiento básico (IRCA 36-79%)',
      min_quality_irc: 36,
      max_quality_irc: 79,
      recommendation_text: 'Usar filtro de carbón activado o hervir agua (3 minutos). Agregar cloro si almacena (1 gota por litro). Consumir dentro de 24 horas después de tratamiento. La OMS recomienda tratamiento para agua con IRCA >35%.',
      priority_level: 'high',
      traffic_light_color: 'yellow',
      category: 'calidad',
    },

    // 9. NUEVA: CONSERVACIÓN EN CONDICIONES NORMALES
    {
      name: 'Conservación sostenible',
      description: 'Prácticas diarias de ahorro según estándares ONU',
      min_quantity_percentage: 50,
      max_quantity_percentage: 70,
      recommendation_text: 'Reparar goteos inmediatamente (una gota por segundo = 10,000 litros/año). Instalar aireadores en grifos. Regar plantas al amanecer o atardecer. La ONU recomienda duchas de 5 minutos máximo para uso sostenible.',
      priority_level: 'low',
      traffic_light_color: 'green',
      category: 'conservacion',
    }
  ];

  console.log('Sembrando reglas de recomendación mejoradas según OMS/UNESCO...');

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
      
      console.log(`✅ Regla creada: ${ruleData.name}`);
    } else {
      console.log(`⚠️  Regla ya existe: ${ruleData.name}`);
    }
  }

  console.log('✅ Seed de reglas mejoradas completado exitosamente');
}