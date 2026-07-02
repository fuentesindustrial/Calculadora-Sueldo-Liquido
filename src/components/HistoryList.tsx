import { motion } from "motion/react";
import { formatCurrency } from "../lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FileText, Download, Trash2, Calendar, ClipboardList } from "lucide-react";
import { exportarLiquidacionPDF } from "../lib/pdf";
import { LiquidacionRecord } from "../lib/storage";

interface HistoryListProps {
  history: LiquidacionRecord[];
  loading: boolean;
  onDelete: (id: string) => void;
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl border p-5 animate-pulse"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full" style={{ background: "var(--color-surface-2)" }} />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded-lg w-48" style={{ background: "var(--color-surface-2)" }} />
          <div className="h-3 rounded-lg w-32" style={{ background: "var(--color-surface-2)" }} />
        </div>
        <div className="h-6 rounded-lg w-28" style={{ background: "var(--color-surface-2)" }} />
      </div>
    </div>
  );
}

export function HistoryList({ history, loading, onDelete }: HistoryListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 rounded-2xl border"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}
        >
          <ClipboardList size={28} style={{ color: "var(--color-primary)" }} />
        </div>
        <h3 className="text-base font-semibold mb-1" style={{ color: "var(--color-text)" }}>
          Sin registros guardados
        </h3>
        <p className="text-sm text-center max-w-xs" style={{ color: "var(--color-text-muted)" }}>
          Calcula una liquidación y presiona <strong>Guardar</strong> para verla aquí.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((record, i) => (
        <motion.div
          key={record.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.18 }}
          className="rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group transition-colors"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-border-soft)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-border)")}
        >
          {/* Left: icon + info */}
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}
            >
              <FileText size={18} style={{ color: "var(--color-success)" }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                {record.fechaIdentificador || "Liquidación"}
                {record.params.nombreTrabajador
                  ? <span style={{ color: "var(--color-text-muted)" }}> — {record.params.nombreTrabajador}</span>
                  : null}
              </h3>
              <div className="flex items-center gap-1 mt-0.5" style={{ color: "var(--color-text-dim)" }}>
                <Calendar size={11} />
                <span className="text-xs">
                  {format(new Date(record.fecha), "dd MMM yyyy, HH:mm", { locale: es })}
                </span>
              </div>
            </div>
          </div>

          {/* Right: amount + actions */}
          <div className="flex items-center gap-5 ml-auto sm:ml-0">
            <div className="text-right">
              <div className="text-xs font-medium uppercase tracking-wider mb-0.5" style={{ color: "var(--color-text-dim)" }}>
                Líquido
              </div>
              <div className="text-lg font-bold font-mono" style={{ color: "var(--color-primary)" }}>
                {formatCurrency(record.result.sueldoLiquido)}
              </div>
            </div>

            <div className="flex items-center gap-1 border-l pl-5" style={{ borderColor: "var(--color-border)" }}>
              <button
                onClick={() => exportarLiquidacionPDF(record.params, record.result, record.fechaIdentificador)}
                className="p-2 rounded-lg transition-colors cursor-pointer"
                title="Exportar PDF"
                style={{ color: "var(--color-text-dim)" }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "#60A5FA";
                  e.currentTarget.style.background = "rgba(96,165,250,0.08)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "var(--color-text-dim)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <Download size={16} />
              </button>
              <button
                onClick={() => onDelete(record.id)}
                className="p-2 rounded-lg transition-colors cursor-pointer"
                title="Eliminar registro"
                style={{ color: "var(--color-text-dim)" }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "var(--color-danger)";
                  e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "var(--color-text-dim)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
