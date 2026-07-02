import { PREVIRED_STATIC, PreviredData } from './constants';

export interface LiquidacionParams {
  nombreTrabajador?: string;
  rut?: string;
  fechaIngreso?: string;
  sueldoBase: number;
  gratificacionMensual: number;
  bonosImponibles: number;
  horasExtras: number;
  movilizacion: number;
  colacion: number;
  otrosNoImponibles: number;
  afp: keyof typeof PREVIRED_STATIC.AFPRates;
  saludTipo: 'fonasa' | 'isapre';
  saludMontoUF: number;
  tipoContrato: 'indefinido' | 'fijo';
  otrosDescuentos: number;
}

export interface LiquidacionResult {
  totalImponible: number;
  totalNoImponible: number;
  montoAFP: number;
  montoSalud: number;
  montoCesantia: number;
  totalDescuentosLegales: number;
  sueldoTributable: number;
  montoImpuestoUnico: number;
  totalDescuentos: number;
  sueldoLiquido: number;
}

export function calcularSueldoLiquido(
  params: LiquidacionParams,
  c: PreviredData = PREVIRED_STATIC
): LiquidacionResult {
  // 1. Ingresos Imponibles
  const totalImponibleRaw = params.sueldoBase + params.gratificacionMensual + params.bonosImponibles + params.horasExtras;

  // 2. Topes imponibles
  const topeImponiblePesos  = c.TopeImponibleUF * c.UF;
  const topeCesantiaPesos   = c.TopeSeguroCesantiaUF * c.UF;
  const totalImponibleAFP   = Math.min(totalImponibleRaw, topeImponiblePesos);
  const totalImponibleSeguro = Math.min(totalImponibleRaw, topeCesantiaPesos);

  // 3. AFP
  const rateAFP  = c.AFPRates[params.afp] || 0;
  const montoAFP = Math.round(totalImponibleAFP * (rateAFP / 100));

  // 4. Salud
  const minimoLegalSalud = Math.round(totalImponibleAFP * 0.07);
  const montoSalud = params.saludTipo === 'fonasa'
    ? minimoLegalSalud
    : Math.max(Math.round(params.saludMontoUF * c.UF), minimoLegalSalud);

  // 5. Cesantía (solo contrato indefinido — 0.6% empleado)
  const montoCesantia = params.tipoContrato === 'indefinido'
    ? Math.round(totalImponibleSeguro * 0.006)
    : 0;

  const totalDescuentosLegales = montoAFP + montoSalud + montoCesantia;

  // 6. Impuesto Único de Segunda Categoría
  const sueldoTributable = Math.max(0, totalImponibleRaw - totalDescuentosLegales);
  const stUTM = sueldoTributable / c.UTM;
  let montoImpuestoUnico = 0;
  for (const tramo of c.TramosImpuestoUnico) {
    if (stUTM > tramo.desde && stUTM <= tramo.hasta) {
      montoImpuestoUnico = Math.round(Math.max(0, (sueldoTributable * tramo.factor) - (tramo.rebaja * c.UTM)));
      break;
    }
  }

  // 7. Resumen
  const totalNoImponible = params.movilizacion + params.colacion + params.otrosNoImponibles;
  const totalDescuentos  = totalDescuentosLegales + montoImpuestoUnico + params.otrosDescuentos;
  const sueldoLiquido    = (totalImponibleRaw + totalNoImponible) - totalDescuentos;

  return {
    totalImponible: totalImponibleRaw,
    totalNoImponible,
    montoAFP,
    montoSalud,
    montoCesantia,
    totalDescuentosLegales,
    sueldoTributable,
    montoImpuestoUnico,
    totalDescuentos,
    sueldoLiquido,
  };
}
