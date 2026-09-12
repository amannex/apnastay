'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Reusable Error Boundary component for Property Listing Wizard and Dashboard.
 * Gracefully isolates runtime component crashes and provides actionable recovery.
 */
export class PropertyErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[PropertyErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="my-6 mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-6 sm:p-8 shadow-lg text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {this.props.fallbackTitle || 'Something went wrong loading this section'}
          </h3>

          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
            {this.props.fallbackMessage ||
              'We encountered an unexpected issue rendering this property component. Your unsaved drafts remain safely stored.'}
          </p>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="mb-6 text-left rounded-lg bg-gray-50 p-4 border border-gray-200 text-xs font-mono text-red-700 overflow-x-auto max-h-40">
              <p className="font-semibold mb-1">{this.state.error.name}: {this.state.error.message}</p>
              {this.state.error.stack && (
                <pre className="text-[11px] leading-tight text-gray-600 whitespace-pre-wrap">
                  {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                </pre>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF385C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#E00B41] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>

            <Link
              href="/owner/dashboard/properties"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:ring-offset-2"
            >
              <Home className="h-4 w-4 text-gray-500" />
              My Properties
            </Link>

            <Link
              href="/owner/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-transparent px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Owner Dashboard
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PropertyErrorBoundary;
