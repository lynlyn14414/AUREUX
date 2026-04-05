import React from 'react';
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from "./app/App.tsx";
import "./styles/index.css";

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          background: '#0f172a', 
          color: 'white', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Please try refreshing the page</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Refresh Page
          </button>
          <details style={{ marginTop: '2rem', color: '#64748b', maxWidth: '600px' }}>
            <summary style={{ cursor: 'pointer' }}>Error details</summary>
            <pre style={{ textAlign: 'left', fontSize: '0.75rem', overflow: 'auto' }}>
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Google OAuth Client ID - Using a demo client ID for testing
// Replace with your actual Google Cloud OAuth client ID
const GOOGLE_CLIENT_ID = '1068552851607-a2fjh4ue7ro0breqlp2p6a03pcce102e.apps.googleusercontent.com';

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </ErrorBoundary>
);
