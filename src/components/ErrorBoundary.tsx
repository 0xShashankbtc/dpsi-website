import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { captureError } from "@/lib/sentry";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error captured by ErrorBoundary:", error, errorInfo);
    captureError(error, { componentStack: errorInfo.componentStack || "" });
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {this.props.fallbackTitle || "Something went wrong"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                An unexpected interface error occurred. You can safely reload the page or return home.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-left overflow-x-auto max-h-32 text-[11px] font-mono text-red-600 dark:text-red-400">
                {this.state.error.message || this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleGoHome}
                className="text-xs gap-1.5 border-slate-200 dark:border-slate-800"
              >
                <Home className="w-3.5 h-3.5" /> Return Home
              </Button>
              <Button
                size="sm"
                onClick={this.handleReload}
                className="text-xs gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
