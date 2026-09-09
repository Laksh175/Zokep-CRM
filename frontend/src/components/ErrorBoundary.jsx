import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React UI Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', margin: '40px auto', maxWidth: '600px', background: '#ffffff', border: '2px solid #ef4444', borderRadius: '14px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '12px', fontSize: '20px' }}>Something went wrong</h2>
          <p style={{ color: '#334155', fontSize: '14px', marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px', fontFamily: 'monospace' }}>
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
