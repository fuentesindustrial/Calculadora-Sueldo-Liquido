import { Component, ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center gap-4 text-center px-6"
          style={{ minHeight: "100vh", background: "var(--color-bg)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Ocurrió un problema al mostrar la página.
          </p>
          <p className="text-xs max-w-sm" style={{ color: "var(--color-text-muted)" }}>
            Esto puede deberse a una extensión del navegador (traductor, Grammarly, etc.)
            interfiriendo con la página. Prueba recargar.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
            style={{ background: "var(--color-primary)", color: "#FFFFFF" }}
          >
            <RefreshCw size={15} />
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
