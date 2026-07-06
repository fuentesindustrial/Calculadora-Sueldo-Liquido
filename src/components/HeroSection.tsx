import { Users, FileText, BarChart2, ShieldCheck } from "lucide-react";

interface HeroSectionProps {
  hasImage?: boolean;
}

const features = [
  { icon: <Users size={13} />,       label: "Personas" },
  { icon: <FileText size={13} />,    label: "Liquidaciones" },
  { icon: <BarChart2 size={13} />,   label: "Reportes PDF" },
  { icon: <ShieldCheck size={13} />, label: "Cumplimiento" },
];

export function HeroSection({ hasImage = false }: HeroSectionProps) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl mb-8"
      style={{ minHeight: "200px" }}
    >
      {/* Background */}
      {hasImage ? (
        <img
          src={`${import.meta.env.BASE_URL}hero-remuneraciones.jpg`}
          alt="Sistema de Cálculo de Remuneraciones"
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: "cover",
            objectPosition: "right center",
            filter: "brightness(0.85) saturate(0.9)",
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #0B1E3C 0%, #0F2A5E 50%, #0B1628 100%)",
          }}
        />
      )}

      {/* Gradient overlay — cubre solo la mitad izquierda para legibilidad del texto */}
      <div
        className="absolute inset-0"
        style={{
          background: hasImage
            ? "linear-gradient(90deg, rgba(11,22,40,0.72) 0%, rgba(11,22,40,0.45) 45%, rgba(11,22,40,0.0) 100%)"
            : "transparent",
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: "#93C5FD", letterSpacing: "0.2em" }}
          >
            Sistema de
          </p>
          <h1
            className="font-heading text-3xl sm:text-4xl leading-tight mb-3"
            style={{ color: "#F0F9FF" }}
          >
            Cálculo de<br />
            <span style={{ color: "#F59E0B" }}>Remuneraciones</span>
          </h1>
          <p className="text-sm leading-relaxed max-w-sm" style={{ color: "#BAC8E0" }}>
            Liquidaciones según legislación chilena vigente 2026.
            AFP · FONASA/ISAPRE · Impuesto Único de Segunda Categoría.
          </p>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
          {features.map(item => (
            <div
              key={item.label}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#F0F9FF",
                backdropFilter: "blur(8px)",
              }}
            >
              <span style={{ color: "#93C5FD" }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
