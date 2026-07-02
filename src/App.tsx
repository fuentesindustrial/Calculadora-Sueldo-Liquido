import { ToastProvider } from "./components/Toast";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Dashboard />
      </ToastProvider>
    </ErrorBoundary>
  );
}
