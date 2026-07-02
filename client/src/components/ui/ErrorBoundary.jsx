import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary captured error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-[#0A0A0F]">
          <div className="w-full max-w-md p-6 bg-dark-surface rounded-2xl border border-dark-border text-center space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
            <div className="mx-auto w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center">
              <AlertOctagon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-md font-bold text-white">Something went wrong</h2>
              <p className="text-xs text-[#94A3B8] mt-1 leading-normal">
                {this.state.error?.message || 'An unexpected rendering error occurred inside this component block.'}
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-brand hover-glow-purple text-white font-bold text-xs cursor-pointer transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
