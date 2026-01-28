import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ خطأ في التطبيق:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert" aria-live="assertive">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h1>عذراً، حدث خطأ غير متوقع</h1>
            <p className="error-message">
              نعتذر عن هذا الإزعاج. حدث خطأ أثناء تشغيل التطبيق.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>تفاصيل الخطأ (للمطورين)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="error-actions">
              <button 
                className="error-btn primary"
                onClick={this.handleReload}
                aria-label="إعادة تحميل الصفحة"
              >
                🔄 إعادة تحميل الصفحة
              </button>
              <button 
                className="error-btn secondary"
                onClick={this.handleReset}
                aria-label="المحاولة مرة أخرى"
              >
                ↩️ المحاولة مرة أخرى
              </button>
            </div>

            <p className="error-support">
              إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
