import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Check } from 'lucide-react';
import './App.css';

function Presentation() {
  const navigate = useNavigate();
  const [expanding, setExpanding] = useState(false);

  return (
    <div className="landing-container">

      {/* White semicircle — expands on CTA hover */}
      <div className={`landing-semicircle${expanding ? ' is-expanding' : ''}`} />

      {/* Navbar */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #514EF3, #7c79ff)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(81,78,243,0.4)' }}>
            <Building2 color="white" size={20} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#092C4C' }}>Agora</span>
        </div>
        <button
          className="landing-signin-btn"
          onClick={() => navigate('/login')}
        >
          Sign in
        </button>
      </nav>

      {/* Hero */}
      <div className="landing-content">

        {/* Text section — sits on top of white semicircle, so all dark */}
        <div className="landing-text-section">
          <div className="landing-badge" style={{
            color: '#514EF3',
            background: 'rgba(81,78,243,0.08)',
            border: '1px solid rgba(81,78,243,0.25)',
            animation: 'none'
          }}>
            NGO Sponsorship CRM
          </div>

          <h1 style={{ fontSize: '3.8rem', lineHeight: '1.15', margin: '0 0 24px 0', fontWeight: '800', letterSpacing: '-0.02em', color: '#092C4C' }}>
            Manage your<br />
            sponsorship<br />
            <span className="landing-gradient-text">pipeline clearly.</span>
          </h1>

          <p style={{ fontSize: '18px', color: '#526477', lineHeight: '1.7', margin: '0 0 40px 0', maxWidth: '440px' }}>
            Agora helps CD teams track firms, log interactions, and close contracts without the spreadsheet chaos.
          </p>

          <button
            className="landing-btn"
            style={{ background: '#092C4C', color: 'white' }}
            onMouseEnter={() => setExpanding(true)}
            onMouseLeave={() => setExpanding(false)}
            onClick={() => navigate('/login')}
          >
            Get started →
          </button>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '48px', flexWrap: 'wrap' }}>
            {['Firm profiles', 'Activity logs', 'Contract tracking', 'Role-based access'].map(f => (
              <span key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(81,78,243,0.06)', border: '1px solid rgba(81,78,243,0.18)', color: '#526477', padding: '6px 14px', borderRadius: '70px', fontSize: '13px' }}>
                <Check size={12} color="#514EF3" strokeWidth={3} />
                {f}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Presentation;
