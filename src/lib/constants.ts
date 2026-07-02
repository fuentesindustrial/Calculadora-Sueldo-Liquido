// Tasas y tramos estáticos — se actualizan cuando cambia la ley.
// UF y UTM se obtienen en tiempo real desde mindicador.cl (ver usePrevired.ts).

export const PREVIRED_STATIC = {
  // Fallback si la API no responde (valores referencia junio 2026)
  UF: 39_200,
  UTM: 68_306,
  SueldoMinimo: 553_553,

  // Topes imponibles
  TopeImponibleUF: 84.3,        // AFP y Salud
  TopeSeguroCesantiaUF: 126.6,  // Cesantía

  // Tasas AFP dependiente vigentes 2025-2026
  AFPRates: {
    'Capital':   11.44,
    'Cuprum':    11.44,
    'Habitat':   11.27,
    'Modelo':    10.58,
    'PlanVital': 11.16,
    'Provida':   11.45,
    'Uno':       10.49,
  },

  // Impuesto Único de Segunda Categoría — tramos en UTM
  TramosImpuestoUnico: [
    { desde: 0,    hasta: 13.5,  factor: 0.0,   rebaja: 0 },
    { desde: 13.5, hasta: 30,    factor: 0.04,  rebaja: 0.54 },
    { desde: 30,   hasta: 50,    factor: 0.08,  rebaja: 1.74 },
    { desde: 50,   hasta: 70,    factor: 0.135, rebaja: 4.49 },
    { desde: 70,   hasta: 90,    factor: 0.23,  rebaja: 11.14 },
    { desde: 90,   hasta: 120,   factor: 0.304, rebaja: 17.80 },
    { desde: 120,  hasta: 150,   factor: 0.35,  rebaja: 23.32 },
    { desde: 150,  hasta: 99999, factor: 0.40,  rebaja: 30.82 },
  ],
};

// Alias para compatibilidad con código existente
export const PREVIRED = PREVIRED_STATIC;

export type PreviredData = typeof PREVIRED_STATIC;
