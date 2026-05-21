import { DataSource } from 'typeorm';

export async function seedRecommendations(dataSource: DataSource): Promise<void> {
  const rules = [
    // 1. EMERGENCIA HÍDRICA EXTREMA (ROJO)
    {
      name: 'Emergencia hídrica extrema',
      description: 'Reserva crítica de agua (<15%) - Priorizar necesidades básicas WASH según OMS',
      min_quantity_percentage: 0,
      max_quantity_percentage: 15,
      min_quality_irc: 0,
      max_quality_irc: 100,
      recommendation_text: 'PELIGRO: Implementar racionamiento inmediato para garantizar acceso básico a agua para beber, higiene y saneamiento. Priorizar 20-50 litros por persona al día según estándares mínimos de la OMS para prevención de enfermedades. Suspender TODOS los usos no esenciales (riego, lavado de vehículos, piscinas). Consumo estrictamente para necesidades básicas WASH.',
      priority_level: 'critical',
      traffic_light_color: 'red',
      category: 'emergencia',
    },

    // 2. ESCASEZ HÍDRICA SEGÚN DEFINICIÓN ONU (ROJO)
    {
      name: 'Escasez hídrica',
      description: 'Nivel de estrés hídrico según definición ONU (<1000 m³/persona/año)',
      min_quantity_percentage: 16,
      max_quantity_percentage: 30,
      min_quality_irc: 0,
      max_quality_irc: 5,
      climate_conditions: ['Sequía', 'Estiaje'],
      recommendation_text: 'PELIGRO: Activar plan de contingencia por escasez. Consumo máximo recomendado: 50-100 litros por persona al día. Priorizar usos que garanticen salud, dignidad e higiene según ODS 6. Implementar sistemas de riego por goteo para agricultura de subsistencia y establecer sistemas de recolección de agua de lluvia si es viable técnicamente.',
      priority_level: 'high',
      traffic_light_color: 'red',
      category: 'escasez',
    },

    // 3. AGUA NO POTABLE - CALIDAD PELIGROSA (ROJO)
    {
      name: 'Agua no potable',
      description: 'Agua con IRCA >80% - Riesgo alto para la salud según OMS',
      min_quantity_percentage: 0,
      max_quantity_percentage: 100,
      min_quality_irc: 80.1,
      max_quality_irc: 100,
      recommendation_text: ' PELIGRO: AGUA NO APTA PARA CONSUMO HUMANO. Notificar inmediatamente a las autoridades sanitarias locales. Utilizar exclusivamente agua embotellada con sello de seguridad o agua hervida/desinfectada según protocolos OMS para todas las necesidades. Para desinfectar recipientes: usar solución de cloro al 0.5% (5 ml de cloro doméstico al 5% por litro de agua), enjuagar y secar al aire.',
      priority_level: 'critical',
      traffic_light_color: 'red',
      category: 'emergencia',
    },

    // 4. CALIDAD MEDIA - PRECAUCIONES EN LLUVIAS (AMARILLO)
    {
      name: 'Calidad media - Precauciones en lluvias',
      description: 'Agua de calidad aceptable durante temporada lluviosa (IRCA 15-35%)',
      min_quantity_percentage: 31,
      max_quantity_percentage: 70,
      min_quality_irc: 15,
      max_quality_irc: 35,
      climate_conditions: ['Lluvias', 'Invierno'],
      recommendation_text: 'PRECAUCIÓN: Aplicar tratamiento de agua en el hogar (HWTS) según protocolos OMS. Opción 1: Hervir el agua durante 1 minuto completo tras alcanzar ebullición. Opción 2: Usar desinfectante a base de cloro (dosis según concentración del producto). Almacenar en recipientes limpios, con tapa estrecha y dispensador (como garrafón con grifo) para prevenir recontaminación. No recolectar agua de los primeros 20 minutos de lluvia intensa.',
      priority_level: 'medium',
      traffic_light_color: 'yellow',
      category: 'calidad',
    },

    // 5. REUSO SEGURO PARA ACTIVIDADES NO POTABLES (AMARILLO)
    {
      name: 'Reuso seguro',
      description: 'Promoción de prácticas de reuso seguro para actividades no potables',
      min_quantity_percentage: 0,
      max_quantity_percentage: 100,
      min_quality_irc: 0,
      max_quality_irc: 100,
      reuse_dispositions: ['Dispuesto', 'En dudas'],
      recommendation_text: 'PRÁCTICA SEGURA: Implementar reuso exclusivamente para actividades no potables. Ejemplos seguros: 1) Recolectar agua del último enjuague de la lavadora para lavado de pisos exteriores o inodoros. 2) Utilizar agua de deshumidificador o aire acondicionado para riego de plantas ornamentales. ADVERTENCIA CRÍTICA: Nunca reutilizar agua para beber, preparar alimentos, higiene personal (lavado de manos, ducha) o limpieza de utensilios de cocina. Separar claramente tuberías de agua potable y no potable.',
      priority_level: 'medium',
      traffic_light_color: 'yellow',
      category: 'reuso',
    },

    // 6. GESTIÓN PARA HOGARES GRANDES (AMARILLO)
    {
      name: 'Gestión para hogares grandes',
      description: 'Estrategias de eficiencia para hogares con 5+ miembros según ODS 6',
      min_quantity_percentage: 0,
      max_quantity_percentage: 100,
      min_quality_irc: 0,
      max_quality_irc: 5,
      recommendation_text: 'EFICIENCIA COLECTIVA: Instalar dispositivos de bajo flujo en todos los grifos y duchas (reducción de 30-50% en consumo). Establecer duchas máximo 5 minutos por persona. Meta de consumo familiar basada en estándar ODS 6: 100 litros/persona/día (ejemplo: máximo 500 litros/día para familia de 5 personas). Implementar sistema de monitoreo semanal del consumo. Educar a todos los miembros en cierre de llaves durante enjabonado, cepillado de dientes, etc.',
      priority_level: 'medium',
      traffic_light_color: 'yellow',
      category: 'hogar',
    },

    // 7. CALIDAD ACEPTABLE CON TRATAMIENTO (AMARILLO)
    {
      name: 'Calidad aceptable con tratamiento',
      description: 'Agua que requiere tratamiento obligatorio (IRCA 36-79%) según OMS',
      min_quantity_percentage: 0,
      max_quantity_percentage: 100,
      min_quality_irc: 36,
      max_quality_irc: 79,
      recommendation_text: 'TRATAMIENTO OBLIGATORIO: Agua requiere doble barrera de protección según OMS. Paso 1: Filtración con filtro de cerámica o carbón activado. Paso 2: Desinfección con cloro (1-2 mg/L de cloro residual libre, contacto mínimo 30 minutos) o ebullición (3 minutos tras hervir). Medir cloro residual con tiras reactivas (rango seguro: 0.2-0.5 mg/L). Agua tratada debe consumirse dentro de las 24 horas posteriores al tratamiento. No almacenar más de 48 horas incluso tratada.',
      priority_level: 'high',
      traffic_light_color: 'yellow',
      category: 'calidad',
    },

    // 8. CONDICIONES ÓPTIMAS - SOSTENIBILIDAD (VERDE)
    {
      name: 'Condiciones óptimas - Sostenibilidad',
      description: 'Agua abundante y de excelente calidad (IRCA <5%) - Enfoque ODS 6',
      min_quantity_percentage: 71,
      max_quantity_percentage: 100,
      min_quality_irc: 0,
      max_quality_irc: 5,
      recommendation_text: 'SOSTENIBILIDAD: Mantener consumo dentro de metas sostenibles ODS 6 (ideal ≤100 litros/persona/día). Inspeccionar, limpiar y desinfectar tanques de almacenamiento cada 6 meses (solución de cloro al 0.1%). Verificar y reparar inmediatamente fugas en tuberías internas y conexiones domiciliarias. Establecer programa de monitoreo periódico de calidad (parámetros microbiológicos básicos mensuales, químicos semestrales). Promover prácticas de uso eficiente como estándar permanente, no solo en escasez.',
      priority_level: 'low',
      traffic_light_color: 'green',
      category: 'óptimo',
    },

    // 9. CONSERVACIÓN SOSTENIBLE - MANTENIMIENTO (VERDE)
    {
      name: 'Conservación sostenible',
      description: 'Prácticas de conservación y reducción de pérdidas según estándares ONU',
      min_quantity_percentage: 50,
      max_quantity_percentage: 100,
      min_quality_irc: 0,
      max_quality_irc: 5,
      recommendation_text: 'MANTENIMIENTO PREVENTIVO: Reparar todas las fugas internas (grifos, inodoros) y reportar fugas en red pública. Una gota por segundo = ~10,000 litros/año desperdiciados. Instalar aireadores en el 100% de grifos (ahorro 30-50%). Programar riego de jardines al amanecer o atardecer (reduce evaporación 40%). Promover tecnologías WASH eficientes: inodoros de bajo volumen (6L/descarga), lavadoras de alta eficiencia (45L/carga vs 70L tradicional). La ONU estima que la reducción de pérdidas en distribución puede aumentar disponibilidad en 20-30%.',
      priority_level: 'low',
      traffic_light_color: 'green',
      category: 'conservación',
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
      recommendation_text,
      priority_level,
      traffic_light_color,
      category
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11, $12
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
      rule.recommendation_text,
      rule.priority_level,
      rule.traffic_light_color,
      rule.category,
    ]);
  }
}


