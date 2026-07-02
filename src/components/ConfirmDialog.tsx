import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open, title, description, confirmLabel = "Eliminar", onConfirm, onCancel
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="rounded-2xl border p-6 w-full max-w-sm shadow-2xl"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl" style={{ background: "rgba(239,68,68,0.1)" }}>
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-1" style={{ color: "var(--color-text)", fontFamily: "Inter" }}>
                  {title}
                </h3>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {description}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border transition-colors cursor-pointer"
                style={{
                  background: "transparent",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-muted)",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                style={{ background: "var(--color-danger)", color: "#fff" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
