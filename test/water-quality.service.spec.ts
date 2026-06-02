import { WaterQualityService } from '../src/modules/water-quality/water-quality.service';

describe('WaterQualityService - cálculo de calidad', () => {
  let service: WaterQualityService;

  beforeAll(() => {
    // Pasamos repositorios falsos ya que los métodos que probamos no los usan
    service = new WaterQualityService(undefined as any, undefined as any);
  });

  test('calculateOnly devuelve categoría sin riesgo para parámetros ideales', async () => {
    const params = {
      ph: 7.5,
      turbidez: 1,
      conductividad_electrica: 100,
      oxigeno_disuelto: 9.1,
      temperatura: 20,
    };

    const result = await service.calculateOnly(params);

    expect(result).toHaveProperty('resultado_final');
    expect(result.resultado_final).toHaveProperty('calidad');
    expect(result.resultado_final).toHaveProperty('categoria');
    expect(result.resultado_final.categoria).toBe('sin riesgo');
    expect(typeof result.resultado_final.calidad).toBe('number');
    expect(result.resultado_final.calidad).toBeGreaterThanOrEqual(0);
    expect(result.resultado_final.calidad).toBeLessThanOrEqual(100);
  });
});
