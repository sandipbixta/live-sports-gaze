
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  info: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    info: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, info: null };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({ info });
    console.error("Error caught by ErrorBoundary:", error, info);
  }

  private handleRetry = (): void => {
    window.location.reload();
  };

  private handleUseAlternateServer = (): void => {
    // Store a flag in localStorage to use alternate server
    localStorage.setItem('use_alternate_server', 'true');
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1A1F2C] text-white flex items-center justify-center p-4">
          <div className="bg-[#242836] max-w-md w-full rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="mb-6 text-gray-300">
              We're experiencing some technical difficulties. This could be due to connectivity issues or regional restrictions.
            </p>
            <div className="space-y-4">
              <Button 
                onClick={this.handleRetry}
                className="w-full bg-[#9b87f5] hover:bg-[#8a75e8]"
              >
                Try Again
              </Button>
              <Button 
                onClick={this.handleUseAlternateServer}
                variant="outline"
                className="w-full border border-[#343a4d]"
              >
                Use Alternate Server
              </Button>
              <div className="text-xs text-gray-400 mt-4">
                If you continue to experience issues, please try using a different device or network connection.
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
