import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Search, Bell, Settings, Calendar, LogOut, Home, Mail, Filter, Plus } from 'lucide-react';
import { useDashboardLogic } from './useDashboardLogic';
import AddFirm from './AddFirm';
import CustomDropdown from './CustomDropdown';
import { STATUS_OPTION_STYLES, EVENT_STATUSES } from './statusConfig';
import emptyPfp from './assets/empty_pfp.jpeg';
import './App.css';

function Dashboard({ firms, onAddFirm, currentUser }) {
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
          {currentUser?.role !== 'General CD' && (
            <Building2 className="menu-icon" onClick={() => navigate('/firms')} title="My Firms" />
          )}
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
            Total: {totalItems} companies
          </p>
          <div className="filter-group">
             <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Mail size={16} /> Mass Mail
             </button>
             <CustomDropdown
               variant="pill"
               value={selectedEvent}
               options={availableEvents}
               getLabel={(ev) => ev === 'All Events' ? 'All Events' : `Event: ${ev}`}
               onChange={(ev) => { setSelectedEvent(ev); setCurrentPage(1); }}
             />
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
                const primary = firm.contacts?.find(c => c.isPrimary) || firm.contacts?.[0];
                return (
                  <tr key={firm.id} className="table-row" style={{ opacity: isPaused ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                    <td className="firm-name-cell"><strong>{firm.name}</strong></td>
                    <td style={{ color: '#526477', fontSize: '14px' }}>{primary?.name || 'N/A'}</td>
                    <td style={{ color: '#526477', fontSize: '14px' }}>{firm.email}</td>
                    <td style={{ color: '#526477', fontSize: '14px' }}>{primary?.phoneNumber || 'N/A'}</td>
                    <td>
                      {selectedEvent === 'All Events' ? (
                        <span className={`status-badge status-${getEventStatus(firm).toLowerCase().replace(/\s+/g, '-')}`}>
                          {getEventStatus(firm)}
                        </span>
                      ) : (
                        <CustomDropdown
                          variant="badge"
                          value={getEventStatus(firm)}
                          options={EVENT_STATUSES}
                          optionStyles={STATUS_OPTION_STYLES}
                          onChange={(status) => handleSetFirmStatus(firm.id, status)}
                        />
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