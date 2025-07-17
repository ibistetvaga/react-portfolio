import { Component } from 'react';

class TranslationErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('Translation system error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI - render children without translation context
      // This ensures the app continues to work even if translations fail completely
      console.warn('Translation system failed, rendering without translations');
      
      // If a fallback component is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Otherwise, try to render children normally
      // Components should handle missing translation context gracefully
      return this.props.children;
    }

    return this.props.children;
  }
}

export default TranslationErrorBoundary;