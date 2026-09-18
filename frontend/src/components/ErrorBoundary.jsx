import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, isChunkError: false };
  }

  static getDerivedStateFromError(error) {
    const errorMsg = error?.message || '';
    const isChunkError =
      errorMsg.includes('Failed to fetch dynamically imported module') ||
      errorMsg.includes('Importing a module script failed') ||
      errorMsg.includes('error loading dynamically imported module') ||
      errorMsg.includes('Loading chunk') ||
      errorMsg.includes('Loading CSS chunk');

    return { hasError: true, error, isChunkError };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React UI Error:', error, errorInfo);
    this.setState({ errorInfo });

    const errorMsg = error?.message || '';
    const isChunkError =
      errorMsg.includes('Failed to fetch dynamically imported module') ||
      errorMsg.includes('Importing a module script failed') ||
      errorMsg.includes('error loading dynamically imported module') ||
      errorMsg.includes('Loading chunk') ||
      errorMsg.includes('Loading CSS chunk');

    // Auto-reload once seamlessly if it's a new deployment chunk mismatch
    if (isChunkError) {
      const reloadKey = 'zokep_eb_chunk_reload';
      const hasReloaded = window.sessionStorage.getItem(reloadKey);
      if (!hasReloaded) {
        window.sessionStorage.setItem(reloadKey, 'true');
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const isChunk = this.state.isChunkError;

      return (
        <div
          style={{
            padding: '36px 28px',
            margin: '60px auto',
            maxWidth: '560px',
            background: '#ffffff',
            border: isChunk ? '1px solid #cbd5e1' : '1px solid #fecaca',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: isChunk ? '#f0fdf4' : '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            {isChunk ? (
              <RefreshCw size={26} color="#16a34a" />
            ) : (
              <AlertCircle size={26} color="#ef4444" />
            )}
          </div>

          <h2 style={{ color: '#0f172a', marginBottom: '8px', fontSize: '20px', fontWeight: 800 }}>
            {isChunk ? 'New Version Available' : 'Something went wrong'}
          </h2>

          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
            {isChunk
              ? 'A fresh update of Zokep CRM was just deployed. Please reload the page to load the latest features.'
              : 'An unexpected application error occurred. Reloading usually resolves the issue.'}
          </p>

          <button
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontSize: '14px' }}
            onClick={() => {
              window.sessionStorage.removeItem('zokep_eb_chunk_reload');
              window.sessionStorage.removeItem('zokep_chunk_preload_reload');
              window.location.reload();
            }}
          >
            <RefreshCw size={16} />
            <span>Reload Page</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
