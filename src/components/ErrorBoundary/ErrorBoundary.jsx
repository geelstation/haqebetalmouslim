import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          <h1 style={{ color: '#b8983a', marginBottom: '20px' }}>عذراً، حدث خطأ</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            حدث خطأ غير متوقع. يرجى تحديث الصفحة والمحاولة مرة أخرى.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#b8983a',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            تحديث الصفحة
          </button>
          {this.state.error && (
            <details style={{ marginTop: '20px', color: '#999', fontSize: '12px' }}>
              <summary style={{ cursor: 'pointer' }}>تفاصيل الخطأ</summary>
              <pre style={{ textAlign: 'left', marginTop: '10px', whiteSpace: 'pre-wrap' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
