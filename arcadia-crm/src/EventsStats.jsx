import { Home, LayoutDashboard, Calendar, Building2, Bell, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function EventsStats({ firms }) {
  const navigate = useNavigate();

  const totalFirms = firms.length;
  const totalContacts = firms.reduce((sum, firm) => sum + (firm.contacts ? firm.contacts.length : 0), 0);
  const avgContacts = totalFirms > 0 ? (totalContacts / totalFirms).toFixed(1) : 0;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <nav className="sidebar-menu">
          <Home className="menu-icon" onClick={() => navigate('/')} title="Home" />
          <LayoutDashboard className="menu-icon" onClick={() => navigate('/dashboard')} title="Dashboard" />
          <Calendar className="menu-icon active" title="Events & Stats" />
          <Building2 className="menu-icon" onClick={() => navigate('/firms')} title="My Firms" />
          <Bell className="menu-icon" />
          <Settings className="menu-icon" />
        </nav>
      </aside>

      <main className="main-content">
        <h1 style={{ color: '#092C4C' }}>Database Statistics</h1>
        
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', flex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#526477' }}>Total Companies</h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#092C4C' }}>{totalFirms}</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', flex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#526477' }}>Total Contacts</h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#092C4C' }}>{totalContacts}</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', flex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#526477' }}>Avg Contacts / Company</h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#092C4C' }}>{avgContacts}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EventsStats;