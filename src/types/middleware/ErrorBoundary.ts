import React from "react";


class ErrorBoundary extends React.Component<{ fallback: React.ReactNode, children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error: any) {
      return { hasError: true };
    }
  
    componentDidCatch(error: any, errorInfo: any) {
      console.error("Uncaught error:", error, errorInfo);
    }
  
    render() {
      if (this.state.hasError) {
        return this.props.fallback;
      }
  
      return this.props.children;
    }
  }

export default ErrorBoundary;