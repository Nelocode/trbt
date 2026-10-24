import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080A10] text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full p-6 rounded-2xl bg-[#0D1017] border border-[#FF3B69]/30 shadow-[0_20px_50px_rgba(255,59,105,0.15)] text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FF3B69]/15 border border-[#FF3B69]/30 flex items-center justify-center text-[#FF3B69]">
              <AlertOctagon className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold font-heading text-white">
                Error de Renderizado en la Terminal
              </h2>
              <p className="text-xs text-[#8E95A2]">
                Se ha capturado un error en la interfaz. El estado ha sido preservado de forma segura.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-black/60 border border-white/[0.08] text-left font-mono text-xs text-[#FF3B69] max-h-40 overflow-y-auto whitespace-pre-wrap">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-xs font-mono font-medium transition cursor-pointer"
              >
                Reintentar Render
              </button>
              <button
                onClick={this.handleReload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg figma-btn-primary text-xs font-bold font-heading transition cursor-pointer text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recargar Página</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
