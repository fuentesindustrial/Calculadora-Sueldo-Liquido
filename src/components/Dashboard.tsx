import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getHistory, saveLiquidacion, deleteLiquidacion, LiquidacionRecord } from "../lib/storage";
import { LiquidacionParams, LiquidacionResult } from "../lib/calculator";
import { CalculatorBoard } from "./CalculatorBoard";
import { HistoryList } from "./HistoryList";
import { ConfirmDialog } from "./ConfirmDialog";
import { HeroSection } from "./HeroSection";
import { useToast } from "./Toast";
import { Calculator, History, ChevronRight } from "lucide-react";

type Tab = "calculator" | "history";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("calculator");
  const [history, setHistory] = useState<LiquidacionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab]);

  const fetchHistory = () => {
    setLoading(true);
    setTimeout(() => {
      setHistory(getHistory());
      setLoading(false);
    }, 300);
  };

  const handleSave = (params: LiquidacionParams, result: LiquidacionResult, fechaId: string) => {
    try {
      saveLiquidacion({ fecha: new Date().toISOString(), fechaIdentificador: fechaId, params, result });
      toast("Liquidación guardada correctamente.", "success");
    } catch {
      toast("Error al guardar el registro.", "error");
    }
  };

  const handleDeleteRequest = (id: string) => setDeleteTarget(id);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    try {
      deleteLiquidacion(deleteTarget);
      fetchHistory();
      toast("Registro eliminado.", "info");
    } catch {
      toast("Error al eliminar el registro.", "error");
    }
    setDeleteTarget(null);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "calculator", label: "Calculadora", icon: <Calculator size={16} /> },
    { id: "history",    label: "Historial",   icon: <History size={16} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-20 border-b"
        style={{
          background: "rgba(239,244,251,0.92)",
          backdropFilter: "blur(16px)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-primary)" }}
            >
              <Calculator size={16} color="#0F172A" />
            </div>
            <span
              className="text-lg font-heading tracking-tight"
              style={{ color: "var(--color-text)" }}
            >
              SueldoLíquido<span style={{ color: "var(--color-primary)" }}>.cl</span>
            </span>
          </div>

          {/* Tabs */}
          <nav className="flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                style={{
                  color: activeTab === tab.id ? "var(--color-primary)" : "var(--color-text-muted)",
                  background: activeTab === tab.id ? "rgba(26,86,160,0.08)" : "transparent",
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: "rgba(26,86,160,0.08)", border: "1px solid rgba(26,86,160,0.2)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Breadcrumb hint */}
          <div className="hidden md:flex items-center gap-1 text-xs" style={{ color: "var(--color-text-dim)" }}>
            <span>Chile</span>
            <ChevronRight size={12} />
            <span style={{ color: "var(--color-text-muted)" }}>Legislación 2026</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <HeroSection hasImage />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {activeTab === "calculator" ? (
              <CalculatorBoard onSave={handleSave} />
            ) : (
              <HistoryList history={history} loading={loading} onDelete={handleDeleteRequest} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar registro"
        description="Esta acción no se puede deshacer. ¿Deseas eliminar esta liquidación?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
