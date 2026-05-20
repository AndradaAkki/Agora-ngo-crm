import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, FileText, Activity, Check } from 'lucide-react';
import './App.css';

function Presentation() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">

      {/* Purple glow blob behind headline */}
      <div className="landing-glow" />

      {/* Navbar */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #514EF3, #7c79ff)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(81,78,243,0.4)' }}>
            <Building2 color="white" size={20} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>Agora</span>
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

        {/* Left — text */}
        <div className="landing-text-section">
          <div className="landing-badge">
            NGO Sponsorship CRM
          </div>

          <h1 style={{ fontSize: '3.8rem', lineHeight: '1.15', margin: '0 0 24px 0', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Manage your<br />
            sponsorship<br />
            <span className="landing-gradient-text">pipeline clearly.</span>
          </h1>

          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.7', margin: '0 0 40px 0', maxWidth: '440px' }}>
            Agora helps CD teams track firms, log interactions, and close contracts without the spreadsheet chaos.
          </p>

          <button className="landing-btn" onClick={() => navigate('/login')}>
            Get started →
          </button>

          {/* Feature pills with icons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '48px', flexWrap: 'wrap' }}>
            {['Firm profiles', 'Activity logs', 'Contract tracking', 'Role-based access'].map(f => (
              <span key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)', padding: '6px 14px', borderRadius: '70px', fontSize: '13px' }}>
                <Check size={12} color="#a5a3ff" strokeWidth={3} />
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Right — decorative mock cards */}
        <div className="landing-image-section">
          <div style={{ width: '500px', position: 'relative' }}>

            {/* Mock firm card — floats gently */}
            <div className="landing-card-float" style={{ background: 'white', border: '1px solid #EAEEF4', borderRadius: '16px', padding: '24px', marginBottom: '16px', boxShadow: '-8px 16px 48px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <div style={{ color: '#092C4C', fontWeight: '700', fontSize: '15px' }}>Veridian Capital</div>
                  <div style={{ color: '#7e92a2', fontSize: '12px', marginTop: '2px' }}>Assigned: Alex Thompson</div>
                </div>
                <span style={{ background: '#d2f7ef', color: '#2DC8A8', padding: '4px 12px', borderRadius: '70px', fontSize: '12px', fontWeight: '600' }}>Accepted</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[{ icon: Users, label: '3 contacts' }, { icon: FileText, label: '2 contracts' }, { icon: Activity, label: '8 logs' }].map(({ icon: Icon, label }) => (
                  <div key={label} style={{ flex: 1, background: '#F6FAFD', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <Icon size={14} color="#514EF3" style={{ marginBottom: '4px' }} />
                    <div style={{ color: '#7e92a2', fontSize: '11px' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini activity log — floats with offset phase */}
            <div className="landing-card-float-alt" style={{ background: 'white', border: '1px solid #EAEEF4', borderRadius: '16px', padding: '20px', boxShadow: '-8px 16px 40px rgba(0,0,0,0.3)' }}>
              <div style={{ color: '#7e92a2', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Recent Activity</div>
              {[
                { type: 'Call', desc: 'Follow-up with Maria Ionescu', time: '2h ago' },
                { type: 'Email', desc: 'Sent contract draft v2', time: '1d ago' },
                { type: 'Meeting', desc: 'Sponsor onboarding session', time: '3d ago' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: i < 2 ? '1px solid #EAEEF4' : 'none' }}>
                  <div style={{ width: '8px', height: '8px', background: '#514EF3', borderRadius: '50%', flexShrink: 0, boxShadow: '0 0 6px rgba(81,78,243,0.5)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#092C4C', fontSize: '12px', fontWeight: '500' }}>{item.desc}</div>
                    <div style={{ color: '#7e92a2', fontSize: '11px' }}>{item.type} · {item.time}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Presentation;
