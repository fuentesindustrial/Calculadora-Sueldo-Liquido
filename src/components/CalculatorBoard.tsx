import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { calcularSueldoLiquido, LiquidacionParams, LiquidacionResult } from "../lib/calculator";
import { usePrevired } from "../lib/usePrevired";
import { formatCurrency } from "../lib/utils";
import { exportarLiquidacionPDF } from "../lib/pdf";
import { Save, Download, TrendingUp, TrendingDown, Info, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface CalculatorBoardProps {
  onSave: (params: LiquidacionParams, result: LiquidacionResult, fechaId: string) => void;
}

// ── Reusable styled field components ──────────────────────────────────────────

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: "var(--color-text-muted)" }}>
      {children}
      {hint && (
        <span title={hint} className="cursor-help" style={{ color: "var(--color-text-dim)" }}>
          <Info size={11} />
        </span>
      )}
    </label>
  );
}

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors"
      style={{
        background: "var(--color-surface-2)",
        borderColor: "var(--color-border)",
        color: "var(--color-text)",
        fontFamily: props.type === "number" ? "JetBrains Mono, monospace" : "inherit",
      }}
    />
  );
}

function StyledSelect(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer appearance-none"
      style={{
        background: "var(--color-surface-2)",
        borderColor: "var(--color-border)",
        color: "var(--color-text)",
      }}
    />
  );
}

function SectionCard({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          {title}
        </h2>
        {badge && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-mono"
            style={{ background: "rgba(245,158,11,0.12)", color: "var(--color-primary)" }}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Result row ────────────────────────────────────────────────────────────────

function ResultRow({
  label,
  value,
  variant = "neutral",
  mono = true,
}: {
  label: string;
  value: string;
  variant?: "positive" | "negative" | "neutral" | "warning";
  mono?: boolean;
}) {
  const colors = {
    positive: "var(--color-success)",
    negative: "var(--color-danger)",
    warning:  "#FB923C",
    neutral:  "var(--color-text-muted)",
  };
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{label}</span>
      <span
        className={`text-sm ${mono ? "font-mono font-medium" : "font-medium"}`}
        style={{ color: colors[variant] }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function CalculatorBoard({ onSave }: CalculatorBoardProps) {
  const { previred, mesIndicador, loading: loadingPrevired } = usePrevired();

  const [params, setParams] = useState<LiquidacionParams>({
    nombreTrabajador: "",
    rut: "",
    fechaIngreso: "",
    sueldoBase: 500000,
    gratificacionMensual: 125000,
    bonosImponibles: 0,
    horasExtras: 0,
    movilizacion: 0,
    colacion: 0,
    otrosNoImponibles: 0,
    afp: "Habitat",
    saludTipo: "fonasa",
    saludMontoUF: 2.0,
    tipoContrato: "indefinido",
    otrosDescuentos: 0,
  });

  const [fechaId, setFechaId] = useState(format(new Date(), "MMMM yyyy"));
  const [saving, setSaving] = useState(false);

  const result = useMemo(() => calcularSueldoLiquido(params, previred), [params, previred]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? Number(value) || 0 : value;

    if (name === "usarTopeGratificacion") {
      const isChecked = (e.target as HTMLInputElement).checked;
      if (isChecked) {
        const topeMensual = Math.round((previred.SueldoMinimo * 4.75) / 12);
        setParams(p => ({ ...p, gratificacionMensual: topeMensual }));
      } else {
        setParams(p => ({ ...p, gratificacionMensual: Math.round(p.sueldoBase * 0.25) }));
      }
      return;
    }
    setParams(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleExportPDF = () => {
    exportarLiquidacionPDF(params, result, format(new Date(), "dd/MM/yyyy"));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSave(params, result, fechaId);
      setSaving(false);
    }, 600);
  };

  const descuentosPct = result.totalDescuentos > 0
    ? Math.round((result.totalDescuentos / (result.totalImponible + result.totalNoImponible)) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ── Left: Form ── */}
      <div className="lg:col-span-7 space-y-4">
        {/* Worker data */}
        <SectionCard title="Datos del Trabajador">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <FieldLabel>Nombre Completo</FieldLabel>
              <StyledInput type="text" name="nombreTrabajador" value={params.nombreTrabajador || ""} onChange={handleChange} placeholder="Ej. Juan Pérez" />
            </div>
            <div>
              <FieldLabel>RUT</FieldLabel>
              <StyledInput type="text" name="rut" value={params.rut || ""} onChange={handleChange} placeholder="12.345.678-9" />
            </div>
            <div>
              <FieldLabel>Fecha de Ingreso</FieldLabel>
              <StyledInput type="date" name="fechaIngreso" value={params.fechaIngreso || ""} onChange={handleChange} />
            </div>
          </div>
        </SectionCard>

        {/* Taxable income */}
        <SectionCard title="Ingresos Imponibles" badge="ISUC">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel hint="Base del cálculo AFP y Salud">Sueldo Base ($)</FieldLabel>
              <StyledInput type="number" name="sueldoBase" value={params.sueldoBase || ""} onChange={handleChange} min={0} />
            </div>
            <div>
              <FieldLabel hint="25% del sueldo base o tope legal">Gratificación Mensual ($)</FieldLabel>
              <StyledInput type="number" name="gratificacionMensual" value={params.gratificacionMensual || ""} onChange={handleChange} min={0} />
              <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="usarTopeGratificacion"
                  name="usarTopeGratificacion"
                  onChange={handleChange}
                  className="rounded"
                  style={{ accentColor: "var(--color-primary)" }}
                />
                <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>
                  Usar tope legal ({formatCurrency(Math.round((previred.SueldoMinimo * 4.75) / 12))})
                </span>
              </label>
            </div>
            <div>
              <FieldLabel>Bonos Imponibles ($)</FieldLabel>
              <StyledInput type="number" name="bonosImponibles" value={params.bonosImponibles || ""} onChange={handleChange} min={0} />
            </div>
            <div>
              <FieldLabel>Horas Extras ($)</FieldLabel>
              <StyledInput type="number" name="horasExtras" value={params.horasExtras || ""} onChange={handleChange} min={0} />
            </div>
          </div>
        </SectionCard>

        {/* Non-taxable income */}
        <SectionCard title="Ingresos No Imponibles">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <FieldLabel>Movilización ($)</FieldLabel>
              <StyledInput type="number" name="movilizacion" value={params.movilizacion || ""} onChange={handleChange} min={0} />
            </div>
            <div>
              <FieldLabel>Colación ($)</FieldLabel>
              <StyledInput type="number" name="colacion" value={params.colacion || ""} onChange={handleChange} min={0} />
            </div>
            <div>
              <FieldLabel>Otros No Imponibles ($)</FieldLabel>
              <StyledInput type="number" name="otrosNoImponibles" value={params.otrosNoImponibles || ""} onChange={handleChange} min={0} />
            </div>
          </div>
        </SectionCard>

        {/* Legal deductions */}
        <SectionCard title="Descuentos Legales">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel hint="Tasa según AFP seleccionada">AFP</FieldLabel>
              <StyledSelect name="afp" value={params.afp} onChange={handleChange}>
                {Object.entries(previred.AFPRates).map(([key, rate]) => (
                  <option key={key} value={key}>{key} — {rate}%</option>
                ))}
              </StyledSelect>
            </div>
            <div>
              <FieldLabel>Sistema de Salud</FieldLabel>
              <StyledSelect name="saludTipo" value={params.saludTipo} onChange={handleChange}>
                <option value="fonasa">FONASA — 7%</option>
                <option value="isapre">ISAPRE — Plan en UF</option>
              </StyledSelect>
            </div>
            <AnimatePresence>
              {params.saludTipo === "isapre" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <FieldLabel hint="Mínimo garantizado: 7% del imponible">Monto Plan ISAPRE (UF)</FieldLabel>
                  <StyledInput type="number" name="saludMontoUF" step="0.01" value={params.saludMontoUF || ""} onChange={handleChange} min={0} />
                </motion.div>
              )}
            </AnimatePresence>
            <div>
              <FieldLabel hint="Contrato indefinido descuenta 0.6% cesantía">Tipo de Contrato</FieldLabel>
              <StyledSelect name="tipoContrato" value={params.tipoContrato} onChange={handleChange}>
                <option value="indefinido">Indefinido</option>
                <option value="fijo">Plazo Fijo / Por Obra</option>
              </StyledSelect>
            </div>
          </div>
        </SectionCard>

        {/* Other */}
        <SectionCard title="Otros Parámetros">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Mes Asociado</FieldLabel>
              <StyledInput type="text" value={fechaId} onChange={e => setFechaId(e.target.value)} placeholder="Ej. Junio 2025" />
            </div>
            <div>
              <FieldLabel hint="Adelantos u otros descuentos convenidos">Otros Descuentos ($)</FieldLabel>
              <StyledInput type="number" name="otrosDescuentos" value={params.otrosDescuentos || ""} onChange={handleChange} min={0} />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── Right: Result panel ── */}
      <div className="lg:col-span-5">
        <div className="sticky top-24">
          <motion.div
            layout
            className="rounded-2xl border overflow-hidden"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            {/* Liquid amount hero */}
            <div
              className="p-6 text-center relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1A56A0 0%, #134788 100%)" }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  background: "radial-gradient(circle at 50% 0%, #fff 0%, transparent 70%)",
                }}
              />
              <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
                Alcance Líquido
              </p>
              <motion.div
                key={result.sueldoLiquido}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-4xl font-bold font-mono"
                style={{ color: "#FFFFFF" }}
              >
                {formatCurrency(result.sueldoLiquido)}
              </motion.div>
              <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                Estimación según legislación vigente 2026
              </p>

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div
                  className="rounded-xl p-3 flex items-center gap-2"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <TrendingUp size={14} style={{ color: "var(--color-success)" }} />
                  <div className="text-left">
                    <div className="text-xs font-mono font-semibold" style={{ color: "#ffffff" }}>
                      {formatCurrency(result.totalImponible + result.totalNoImponible)}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Bruto total</div>
                  </div>
                </div>
                <div
                  className="rounded-xl p-3 flex items-center gap-2"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <TrendingDown size={14} style={{ color: "var(--color-danger)" }} />
                  <div className="text-left">
                    <div className="text-xs font-mono font-semibold" style={{ color: "#ffffff" }}>
                      {descuentosPct}% descuentos
                    </div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{formatCurrency(result.totalDescuentos)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="p-5">
              <div
                className="rounded-xl p-4 space-y-1 mb-4"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border-soft)" }}
              >
                <ResultRow label="+ Total Imponible"    value={formatCurrency(result.totalImponible)}    variant="positive" />
                <ResultRow label="+ Total No Imponible" value={formatCurrency(result.totalNoImponible)}  variant="positive" />
                <div className="h-px my-2" style={{ background: "var(--color-border)" }} />
                <ResultRow label={`− AFP (${params.afp})`}     value={formatCurrency(result.montoAFP)}          variant="negative" />
                <ResultRow label={`− Salud (${params.saludTipo.toUpperCase()})`} value={formatCurrency(result.montoSalud)} variant="negative" />
                <ResultRow label="− Seguro Cesantía"           value={formatCurrency(result.montoCesantia)}     variant="negative" />
                <ResultRow label="− Impuesto Único"            value={formatCurrency(result.montoImpuestoUnico)} variant="warning" />
                {params.otrosDescuentos > 0 && (
                  <ResultRow label="− Otros Descuentos" value={formatCurrency(params.otrosDescuentos)} variant="neutral" />
                )}
              </div>

              {/* Tributable */}
              <div
                className="rounded-xl px-4 py-3 flex justify-between items-center mb-5"
                style={{ background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.18)" }}
              >
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Base Tributable</span>
                <span className="text-sm font-mono font-semibold" style={{ color: "#2563EB" }}>
                  {formatCurrency(result.sueldoTributable)}
                </span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExportPDF}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium border transition-colors cursor-pointer"
                  style={{
                    background: "transparent",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-muted)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Download size={15} />
                  <span>PDF</span>
                </button>
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-opacity cursor-pointer"
                  style={{
                    background: "var(--color-primary)",
                    color: "#FFFFFF",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  <Save size={15} />
                  <span>{saving ? "Guardando…" : "Guardar"}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Previred reference */}
          <div className="mt-3 px-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {[
                { label: "UF",      value: `$${previred.UF.toLocaleString("es-CL")}` },
                { label: "UTM",     value: `$${previred.UTM.toLocaleString("es-CL")}` },
                { label: "S. Mín.", value: `$${previred.SueldoMinimo.toLocaleString("es-CL")}` },
              ].map(item => (
                <span key={item.label} className="text-xs font-mono" style={{ color: "var(--color-text-dim)" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>{item.label}: </span>
                  {item.value}
                </span>
              ))}
              {loadingPrevired ? (
                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-dim)" }}>
                  <RefreshCw size={10} className="animate-spin" />
                  Actualizando…
                </span>
              ) : mesIndicador ? (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "rgba(37,99,235,0.08)", color: "var(--color-accent)", border: "1px solid rgba(37,99,235,0.15)" }}>
                  {mesIndicador}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
