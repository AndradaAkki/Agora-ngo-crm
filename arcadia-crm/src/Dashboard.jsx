import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Search, Bell, Settings, Calendar, LogOut, Home, Mail, ChevronDown, Filter, Plus } from 'lucide-react';
import { useDashboardLogic } from './useDashboardLogic';
import AddFirm from './AddFirm';
import './App.css';

function Dashboard({ firms, onAddFirm }) {
  const {
    navigate,
    isAddModalOpen,
    setIsAddModalOpen,
    currentFirms,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    handleAddFirm,
    selectedEvent,
    setSelectedEvent,
    availableEvents,
    getEventStatus,
    handleSetFirmStatus,
    EVENT_STATUSES
  } = useDashboardLogic({ firms, onAddFirm });

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
          <Settings className="menu-icon" onClick={() => navigate('/profile')} title="Profile Settings" />
        </nav>
      </aside>

      <main className="main-content animate-fade-in">
        <header className="dashboard-header">
          <h1 style={{ color: '#092C4C', margin: 0 }}>Dashboard - all companies</h1>
          <div className="header-right">
            {/* Folosim clasa ta existenta .btn-primary care are deja umbra si hover-ul dorit */}
            <button className="btn-primary" onClick={() => setIsAddModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Add New Company <Plus size={16} />
            </button>
            <div className="header-icons">
              <button className="icon-btn-round" style={{ width: '45px', height: '45px' }}>
                <Search size={20} color="#7E92A2" />
              </button>
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
          <p className="total-count" style={{ fontWeight: '700', color: '#092C4C', fontSize: '15px' }}>
            Total: {totalItems} companies
          </p>
          <div className="filter-group">
             <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Mail size={16} /> Mass Mail
             </button>
             <select
               className="btn-outline"
               style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
               value={selectedEvent}
               onChange={(e) => { setSelectedEvent(e.target.value); setCurrentPage(1); }}
             >
               {availableEvents.map(ev => (
                 <option key={ev} value={ev}>{ev === 'All Events' ? 'All Events' : `Event: ${ev}`}</option>
               ))}
             </select>
             <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               Filter <Filter size={16} color="#7E92A2" />
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
                <th>{selectedEvent === 'All Events' ? 'CRM Status' : 'Sponsorship Status'}</th>
                <th>Profile</th>
              </tr>
            </thead>
            <tbody>
              {currentFirms.map((firm) => {
                const isPaused = firm.pausedUntil && new Date(firm.pausedUntil) >= new Date();
                return (
                  <tr key={firm.id} className="table-row" style={{ opacity: isPaused ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                    <td className="firm-name-cell"><strong>{firm.name}</strong></td>
                    <td style={{ color: '#526477', fontSize: '14px' }}>{firm.contactName || 'N/A'}</td>
                    <td style={{ color: '#526477', fontSize: '14px' }}>{firm.email}</td>
                    <td style={{ color: '#526477', fontSize: '14px' }}>{firm.phone || 'N/A'}</td>
                    <td>
                      {selectedEvent === 'All Events' ? (
                        <span className={`status-badge status-${(firm.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                          {firm.status ? firm.status.toUpperCase() : 'UNKNOWN'}
                        </span>
                      ) : (
                        <select
                          className="form-input"
                          style={{ margin: 0, padding: '4px 8px', fontSize: '13px' }}
                          value={getEventStatus(firm)}
                          onChange={(e) => handleSetFirmStatus(firm.id, e.target.value)}
                        >
                          {EVENT_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      <button className="profile-icon-btn" onClick={() => navigate(`/firm/${firm.id}`)}>
                        <LogOut size={18} color="#7E92A2"/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginare folosind clasele tale din CSS */}
        <div className="pagination-container" style={{ justifyContent: 'flex-end' }}>
          <button className="pag-arrow" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>&lt;</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i+1} className={`pag-number ${currentPage === i+1 ? 'active' : ''}`} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
          ))}
          <button className="pag-arrow" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>&gt;</button>
        </div>
      </main>

      {isAddModalOpen && (
        <AddFirm 
          onAddFirm={(newFirm) => {
            handleAddFirm(newFirm);
            setIsAddModalOpen(false);
          }} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}
    </div>
  );
}

export default Dashboard;