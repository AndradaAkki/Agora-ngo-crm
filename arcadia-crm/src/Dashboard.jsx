import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Search, Bell, Settings, Calendar, LogOut, Home } from 'lucide-react';
import './App.css';
import AddFirm from './AddFirm';

function Dashboard({ firms, onAddFirm, loadMoreFirms, hasMore }) {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // -----------------------------------------------------
  // INFINITE SCROLL LISTENER
  // -----------------------------------------------------
  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    // Trigger loadMoreFirms if the user is within 50px of the bottom
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (hasMore) {
        loadMoreFirms();
      }
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-box" style={{ marginBottom: '30px' }}>
           <div style={{ width: '40px', height: '40px', background: '#092C4C', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Building2 color="white" size={24} />
           </div>
        </div>
        <nav className="sidebar-menu">
          <Home className="menu-icon" onClick={() => navigate('/')} title="Home" />
          <LayoutDashboard className="menu-icon active" title="Dashboard" />
          <Calendar className="menu-icon" onClick={() => navigate('/stats')} title="Events & Stats" />
          <Building2 className="menu-icon" onClick={() => navigate('/firms')} title="My Firms" />
          <Bell className="menu-icon" />
          <Settings className="menu-icon" />
        </nav>
      </aside>

      <main className="main-content animate-fade-in">
        <header className="dashboard-header">
          <h1 style={{ color: '#092C4C', margin: 0 }}>Dashboard - all companies</h1>
          <div className="header-right">
            <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
                Add New Company +
            </button>
            <div className="header-icons">
              <Search className="menu-icon" size={22} />
              <img 
                src="https://i.pravatar.cc/150?u=andra" 
                alt="User" 
                className="avatar" 
                onClick={() => navigate('/profile')} 
                style={{ cursor: 'pointer' }} 
              />
            </div>
          </div>
        </header>

        <div className="stats-bar">
          <p className="total-count">Total: <strong>{firms.length} companies</strong></p>
          <div className="filter-group">
             <button className="btn-secondary">Mass Mail</button>
             <button className="btn-outline">Event: CariereInIT</button>
             <button className="btn-outline">Filter</button>
          </div>
        </div>

        {/* The onScroll event and fixed height are required for the infinite scroll to detect the bottom */}
        <div 
          className="table-wrapper" 
          onScroll={handleScroll} 
          style={{ maxHeight: '65vh', overflowY: 'auto' }}
        >
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Primary Contact</th>
                <th>Primary email</th>
                <th>Primary Phone Nr</th>
                <th>Status</th>
                <th>Profile</th>
              </tr>
            </thead>
            <tbody>
              {/* Notice we map over ALL 'firms' now, not 'currentFirms' */}
              {firms.map((firm) => (
                <tr key={firm.id} className="table-row">
                  <td className="firm-name-cell"><strong>{firm.name}</strong></td>
                  <td style={{ color: '#526477', fontSize: '14px' }}>{firm.contactName || 'N/A'}</td>
                  <td style={{ color: '#526477', fontSize: '14px' }}>{firm.email}</td>
                  <td style={{ color: '#526477', fontSize: '14px' }}>{firm.phone || 'N/A'}</td>
                  
                  <td>
                    <span className={`status-badge status-${(firm.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                      {firm.status}
                    </span>
                  </td>
                  <td>
                    <button className="profile-icon-btn" onClick={() => navigate(`/firm/${firm.id}`)}>
                      <LogOut size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Visual indicator for infinite scrolling */}
          {hasMore && (
            <div style={{ textAlign: 'center', padding: '15px', color: '#526477', fontWeight: 'bold' }}>
              Loading more companies...
            </div>
          )}
          {!hasMore && firms.length > 0 && (
            <div style={{ textAlign: 'center', padding: '15px', color: '#ccc', fontSize: '12px' }}>
              End of list
            </div>
          )}
        </div>
      </main>

      {isAddModalOpen && (
      <AddFirm 
        onAddFirm={onAddFirm} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    )}
  </div>
);
}

export default Dashboard;