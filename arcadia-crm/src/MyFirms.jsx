import React from 'react';
import { LayoutDashboard, Building2, Search, Bell, Settings, Calendar, LogOut, Home, Mail, ChevronDown, Filter } from 'lucide-react';
import { useMyFirmsLogic } from './useMyFirmsLogic';
import emptyPfp from './assets/empty_pfp.jpeg';
import './App.css';

function MyFirms({ firms, currentUser }) {
  const {
    navigate,
    myFirmsList,
    currentFirms,
    currentPage,
    setCurrentPage,
    totalPages
  } = useMyFirmsLogic({ firms, currentUser });

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
          <LayoutDashboard className="menu-icon" onClick={() => navigate('/dashboard')} title="Dashboard" />
          <Calendar className="menu-icon" onClick={() => navigate('/stats')} title="Events & Stats" />
          {currentUser?.role !== 'General CD' && (
            <Building2 className="menu-icon active" title="My Firms" />
          )}
          <Bell className="menu-icon" />
          <Settings className="menu-icon" />
        </nav>
      </aside>

      <main className="main-content animate-fade-in">
        <header className="dashboard-header">
          <h1 style={{ color: '#092C4C', margin: 0 }}>My companies</h1>
          <div className="header-right">
            <div className="header-icons">
              <button className="icon-btn-round" style={{ width: '45px', height: '45px' }}>
                <Search size={20} color="#7E92A2" />
              </button>
              <img 
                src={currentUser?.avatarUrl || emptyPfp}
                alt="User"
                className="avatar" 
                onClick={() => navigate('/profile')} 
                style={{ cursor: 'pointer' }} 
                />
            </div>
          </div>
        </header>

        <div className="stats-bar">
          <p className="total-count" style={{ fontWeight: '700', color: '#092C4C', fontSize: '15px' }}>
            Total: {myFirmsList.length} companies
          </p>
          <div className="filter-group">
             <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Mail size={16} /> Mass Mail
             </button>
             <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               Event: CariereInIT <ChevronDown size={16} />
             </button>
             <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               Filter Follow up <Filter size={16} />
             </button>
          </div>
        </div>

        <div className="table-wrapper">
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
              {currentFirms.map((firm) => {
                const isPaused = firm.pausedUntil && new Date(firm.pausedUntil) >= new Date();
                const primary = firm.contacts?.find(c => c.isPrimary) || firm.contacts?.[0];
                return (
                  <tr key={firm.id} className="table-row" style={{ opacity: isPaused ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                    <td className="firm-name-cell"><strong>{firm.name}</strong></td>
                    <td style={{ color: '#526477', fontSize: '14px' }}>{primary?.name || 'N/A'}</td>
                    <td style={{ color: '#526477', fontSize: '14px' }}>{firm.email}</td>
                    <td style={{ color: '#526477', fontSize: '14px' }}>{primary?.phoneNumber || 'N/A'}</td>
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
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
          <button className="pag-arrow" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>&lt;</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i+1} className={`pag-number ${currentPage === i+1 ? 'active' : ''}`} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
          ))}
          <button className="pag-arrow" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>&gt;</button>
        </div>
      </main>
    </div>
  );
}

export default MyFirms;