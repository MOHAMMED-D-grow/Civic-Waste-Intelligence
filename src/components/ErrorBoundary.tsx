import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = "dashboard";
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050c08] text-[#e8f2ec] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#07160f] border border-emerald-800/80 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                CleanWatch AI Experienced an Issue
              </h1>
              <p className="text-xs text-emerald-300/80 leading-relaxed">
                The application encountered an unexpected error while rendering. You can reload the page to restore your civic session.
              </p>
              {this.state.error && (
                <div className="p-3 rounded-xl bg-black/40 border border-emerald-950 font-mono text-[11px] text-amber-300/90 text-left overflow-x-auto max-h-32">
                  {this.state.error.message || String(this.state.error)}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  try {
                    sessionStorage.clear();
                    window.location.hash = "dashboard";
                    window.location.reload();
                  } catch {
                    window.location.reload();
                  }
                }}
                className="px-4 py-2.5 bg-[#091f15] hover:bg-[#0c2a1c] border border-emerald-800/60 text-emerald-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Overview</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
