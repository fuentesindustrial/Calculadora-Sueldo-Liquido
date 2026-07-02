import { LiquidacionParams, LiquidacionResult } from "./calculator";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatPercentage } from "./utils";

export function exportarLiquidacionPDF(
  params: LiquidacionParams,
  result: LiquidacionResult,
  fecha: string
) {
  const doc = new jsPDF();

  // Titulos
  doc.setFontSize(18);
  doc.text("Liquidación de Sueldo", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.text(`Fecha: ${fecha}`, 14, 30);
  doc.text(`Trabajador: ${params.nombreTrabajador || "Empleado"} ${params.rut ? `(${params.rut})` : ''}`, 14, 37);
  if (params.fechaIngreso) {
    doc.text(`Fecha Ingreso: ${params.fechaIngreso}`, 14, 44);
  }

  // Remuneraciones Imponibles
  autoTable(doc, {
    startY: 50,
    head: [["Haberes Imponibles", "Monto"]],
    body: [
      ["Sueldo Base", formatCurrency(params.sueldoBase)],
      ["Gratificación Legal", formatCurrency(params.gratificacionMensual)],
      ["Horas Extras", formatCurrency(params.horasExtras)],
      ["Bonos Imponibles", formatCurrency(params.bonosImponibles)],
      [{ content: "Total Haberes Imponibles", styles: { fontStyle: "bold" } }, { content: formatCurrency(result.totalImponible), styles: { fontStyle: "bold" } }],
    ],
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Remuneraciones No Imponibles
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [["Haberes No Imponibles", "Monto"]],
    body: [
      ["Movilización", formatCurrency(params.movilizacion)],
      ["Colación", formatCurrency(params.colacion)],
      ["Otros No Imponibles", formatCurrency(params.otrosNoImponibles)],
      [{ content: "Total Haberes No Imponibles", styles: { fontStyle: "bold" } }, { content: formatCurrency(result.totalNoImponible), styles: { fontStyle: "bold" } }],
    ],
    theme: "grid",
    headStyles: { fillColor: [39, 174, 96] },
  });

  // Descuentos Legales
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [["Descuentos Legales y Tributarios", "Monto"]],
    body: [
      [`AFP (${params.afp})`, formatCurrency(result.montoAFP)],
      [`Salud (${params.saludTipo.toUpperCase()})`, formatCurrency(result.montoSalud)],
      ["Seguro de Cesantía", formatCurrency(result.montoCesantia)],
      ["Impuesto Único de Segunda Categoría", formatCurrency(result.montoImpuestoUnico)],
      ["Otros Descuentos", formatCurrency(params.otrosDescuentos)],
      [{ content: "Total Descuentos", styles: { fontStyle: "bold" } }, { content: formatCurrency(result.totalDescuentos), styles: { fontStyle: "bold" } }],
    ],
    theme: "grid",
    headStyles: { fillColor: [192, 57, 43] },
  });

  // Resumen Final
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [["Resumen Final", "Monto"]],
    body: [
      ["Sueldo Tributable", formatCurrency(result.sueldoTributable)],
      [{ content: "ALCANCE LÍQUIDO A PAGAR", styles: { fontStyle: "bold", fontSize: 13 } }, { content: formatCurrency(result.sueldoLiquido), styles: { fontStyle: "bold", fontSize: 13 } }],
    ],
    theme: "plain",
    styles: { fontSize: 12 },
  });

  // Firmas
  const startY = (doc as any).lastAutoTable.finalY + 40;
  doc.line(30, startY, 80, startY);
  doc.text("Firma Empleador", 55, startY + 5, { align: "center" });

  doc.line(130, startY, 180, startY);
  doc.text("Firma Trabajador", 155, startY + 5, { align: "center" });

  doc.save(`liquidacion_${fecha.replace(/\//g, "-")}.pdf`);
}
