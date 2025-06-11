/**
 * Funciones de utilidad para el dashboard
 * Manejan datos nulos o indefinidos para evitar errores en los gráficos
 */

/**
 * Comprueba si un objeto es válido (no es nulo ni indefinido)
 */
export function isValidObject(obj: any): boolean {
  return obj !== null && obj !== undefined;
}

/**
 * Obtiene un valor de forma segura de un objeto, devolviendo un valor por defecto si no existe
 */
export function getSafeValue(obj: any, key: string, defaultValue: any = null): any {
  if (!isValidObject(obj)) {
    return defaultValue;
  }
  return obj[key] !== undefined ? obj[key] : defaultValue;
}

/**
 * Prepara datos seguros para gráficos ApexCharts
 */
export function prepareSafeChartData(data: any[] | null | undefined, valueKey: string = 'value'): any[] {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [0]; // Valor por defecto para evitar gráficos rotos
  }
  return data.map(item => getSafeValue(item, valueKey, 0));
}

/**
 * Prepara etiquetas seguras para gráficos ApexCharts
 */
export function prepareSafeChartLabels(data: any[] | null | undefined, labelKey: string = 'label'): string[] {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return ['Sin datos']; // Etiqueta por defecto
  }
  return data.map(item => getSafeValue(item, labelKey, 'Sin etiqueta').toString());
}

/**
 * Prepara opciones seguras para ApexCharts
 */
export function getSafeChartOptions(chartId: string, defaultOptions: any = {}): any {
  const element = document.getElementById(chartId);
  if (!element) {
    console.warn(`Elemento con ID ${chartId} no encontrado`);
    return defaultOptions;
  }
  
  return defaultOptions;
}

/**
 * Inicializa un gráfico de forma segura
 */
export function initChartSafely(chartInitFunction: Function): void {
  try {
    if (typeof chartInitFunction === 'function') {
      chartInitFunction();
    }
  } catch (error) {
    console.error('Error inicializando gráfico:', error);
  }
}

/**
 * Devuelve un array seguro (nunca nulo o indefinido)
 */
export function getSafeArray(array: any[] | null | undefined): any[] {
  if (!array || !Array.isArray(array)) {
    return [];
  }
  return array;
}

/**
 * Devuelve un objeto de respuesta seguro para la API
 */
export function getSafeApiResponse(response: any, defaultValue: any = {}): any {
  if (!isValidObject(response)) {
    return defaultValue;
  }
  return response;
}

/**
 * Añade datos seguros a un gráfico existente
 */
export function updateChartSafely(chartInstance: any, seriesData: any[], labels: any[] = []): void {
  if (!chartInstance) {
    console.warn('Instancia de gráfico no válida');
    return;
  }
  
  try {
    // Asegurarse de que hay al menos un valor
    const safeSeriesData = seriesData.length > 0 ? seriesData : [0];
    const safeLabels = labels.length > 0 ? labels : ['Sin datos'];
    
    // Actualizar el gráfico
    chartInstance.updateOptions({
      series: safeSeriesData,
      labels: safeLabels
    });
  } catch (error) {
    console.error('Error actualizando gráfico:', error);
  }
} 