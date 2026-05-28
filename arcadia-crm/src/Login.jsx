import React from 'react';
import { Building2 } from 'lucide-react';
import { useLoginLogic } from './useLoginLogic';
import './App.css';

function Login({ onLogin }) {
  const { email, setEmail, password, setPassword, error, loading, demoLoading, handleSubmit, handleDemoLogin } = useLoginLogic({ onLogin });

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div style={{ width: '48px', height: '48px', background: '#092C4C', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 color="white" size={28} />
          </div>
          <h1 className="login-title">Agora CRM</h1>
        </div>

        <p className="login-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn-primary login-btn" disabled={loading || demoLoading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="login-divider">or</div>

        <button
          className="login-demo-btn"
          onClick={handleDemoLogin}
          disabled={loading || demoLoading}
        >
          {demoLoading ? 'Loading demo…' : 'Try Demo'}
        </button>

      </div>
    </div>
  );
}

export default Login;
