import { useNavigate } from 'react-router-dom';
import './App.css';

function Presentation() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Logo Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '80px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '20px', height: '20px', border: '3px solid white', borderRadius: '50%' }}></div>
        </div>
        <h2 style={{ margin: 0, fontSize: '36px', fontWeight: 'bold' }}>Agora</h2>
      </div>

      {/* Main Text */}
      <div style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '4rem', lineHeight: '1.2', margin: '0', fontWeight: '700' }}>
          Manage IT companies with firm profiles, activity logs, and filtered menus.
        </h1>
        <button className="landing-btn" onClick={() => navigate('/dashboard')}>
          Log in
        </button>
      </div>
    </div>
  );
}

export default Presentation;