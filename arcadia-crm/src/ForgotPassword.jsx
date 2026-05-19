import React, { useState } from 'react';
import { gql} from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Building2 } from 'lucide-react';
import './App.css';

const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword({ variables: { email } });
    setSubmitted(true);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div style={{ width: '48px', height: '48px', background: '#092C4C', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 color="white" size={28} />
          </div>
          <h1 className="login-title">Agora CRM</h1>
        </div>

        <p className="login-subtitle">Reset your password</p>

        {submitted ? (
          <div style={{ textAlign: 'center', color: '#526477', fontSize: '14px', lineHeight: 1.6 }}>
            <p>If that email is registered, a reset link has been printed to the server console.</p>
            <a href="/login" style={{ color: '#092C4C', fontWeight: 'bold' }}>Back to sign in</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary login-btn" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '12px' }}>
              <a href="/login" style={{ color: '#526477', fontSize: '13px' }}>Back to sign in</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
