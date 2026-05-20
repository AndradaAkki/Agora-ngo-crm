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

      {/* Glowing line chart — full page, sits behind semicircle so white sweeps over it */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice" fill="none">
          <defs>
            <filter id="sharpGlow" x="-5%" y="-60%" width="110%" height="220%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* X-axis */}
          <line x1="0" y1="700" x2="1400" y2="700" stroke="rgba(165,163,255,0.2)" strokeWidth="1" />
          {[0, 200, 400, 600, 800, 1000, 1200, 1400].map((x, i) => (
            <line key={i} x1={x} y1="696" x2={x} y2="706" stroke="rgba(165,163,255,0.14)" strokeWidth="1" />
          ))}

          {/* Dim background line */}
          <path
            d="M 0 640 C 112 640, 168 592, 280 592 C 392 592, 448 482, 560 482 C 656 482, 704 552, 800 552 C 900 552, 950 402, 1050 402 C 1142 402, 1188 458, 1280 458 C 1328 458, 1352 422, 1400 422"
            stroke="rgba(165,163,255,0.22)"
            strokeWidth="1"
          />

          {/* Magenta-purple line */}
          <path
            d="M 0 610 C 112 610, 168 462, 280 462 C 392 462, 448 562, 560 562 C 656 562, 704 352, 800 352 C 900 352, 950 462, 1050 462 C 1142 462, 1188 262, 1280 262 C 1328 262, 1352 282, 1400 282"
            stroke="#c084fc"
            strokeWidth="1"
            filter="url(#sharpGlow)"
            opacity="0.75"
          />

          {/* Primary lavender line */}
          <path
            d="M 0 580 C 112 580, 168 522, 280 522 C 392 522, 448 322, 560 322 C 656 322, 704 422, 800 422 C 900 422, 950 222, 1050 222 C 1142 222, 1188 312, 1280 312 C 1328 312, 1352 262, 1400 262"
            stroke="#a5a3ff"
            strokeWidth="1.5"
            filter="url(#sharpGlow)"
          />

          {/* Dashed drop lines at nodes */}
          {[[280, 522], [560, 322], [800, 422], [1050, 222], [1280, 312]].map(([x, y], i) => (
            <line key={i} x1={x} y1={y + 6} x2={x} y2="698"
              stroke="rgba(165,163,255,0.1)" strokeWidth="1" strokeDasharray="4 5" />
          ))}

          {/* Small sharp dots at nodes */}
          {[[280, 522], [560, 322], [800, 422], [1050, 222], [1280, 312]].map(([x, y], i) => (
            <g key={i} filter="url(#dotGlow)">
              <circle cx={x} cy={y} r="3" fill="rgba(165,163,255,0.5)" />
              <circle cx={x} cy={y} r="1.5" fill="white" />
            </g>
          ))}
        </svg>
      </div>

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
