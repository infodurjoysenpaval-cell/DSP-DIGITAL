import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Home, Trash2 } from 'lucide-react';

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
    console.error('DSP Digital Mart Uncaught Error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-sm">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-rose-500/20">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
              DSP DIGITAL MART
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              সিস্টেম ব্যবহারে সাময়িক সমস্যা দেখা দিয়েছে। ওয়েবসাইটটি পুনরায় লোড করতে নিচের বাটনে ক্লিক করুন।
            </p>

            {this.state.error?.message && (
              <div className="mb-6 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-left overflow-x-auto">
                <p className="text-[11px] font-mono text-rose-300 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ওয়েবসাইট রিফ্রেশ করুন (Reload)</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetStorage}
                className="w-full py-2.5 px-4 bg-slate-700/80 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-600/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ক্লিয়ার ক্যাশ ও রিস্টার্ট (Reset App)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
