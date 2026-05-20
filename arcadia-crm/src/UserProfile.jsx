import React from 'react';
import { LayoutDashboard, Building2, Bell, Settings, Calendar, Home, Search, Edit2, LogOut, ShieldCheck } from 'lucide-react';
import { useUserProfileLogic } from './useUserProfileLogic';
import MobileNav from './MobileNav';
import emptyPfp from './assets/empty_pfp.jpeg';
import './App.css';

function UserProfile({ currentUser, onLogout }) {
  const {
    navigate,
    isLogoutModalOpen,
    setIsLogoutModalOpen,
    firstName,
    lastName,
    email,
    roles,
    handleLogout,
    fileInputRef,
    handleAvatarClick,
    handleAvatarChange,
  } = useUserProfileLogic({ currentUser, onLogout });

  const avatarUrl = currentUser?.avatarUrl || emptyPfp;

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
          <div className="menu-icon-wrap" onClick={() => navigate('/')} title="Home"><Home className="menu-icon" /></div>
          <div className="menu-icon-wrap" onClick={() => navigate('/dashboard')} title="Dashboard"><LayoutDashboard className="menu-icon" /></div>
          <div className="menu-icon-wrap" onClick={() => navigate('/stats')} title="Events & Stats"><Calendar className="menu-icon" /></div>
          {currentUser?.role !== 'General CD' && (
            <div className="menu-icon-wrap" onClick={() => navigate('/firms')} title="My Firms"><Building2 className="menu-icon" /></div>
          )}
          <div className="menu-icon-wrap" title="Notifications"><Bell className="menu-icon" /></div>
          <div className="menu-icon-wrap active" onClick={() => navigate('/profile')} title="Profile Settings"><Settings className="menu-icon" /></div>
        </nav>
      </aside>

      <main className="main-content animate-fade-in" style={{ background: '#F8FAFC', padding: '0', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header className="dashboard-header" style={{ padding: '30px 60px', margin: 0, background: 'white', borderBottom: '1px solid #EAEEF4' }}>
          <h1 style={{ color: '#092C4C', margin: 0, fontSize: '24px' }}>My Profile</h1>
          <div className="header-right">
            <div className="header-icons">
              <button className="icon-btn-round" style={{ width: '45px', height: '45px', border: '1px solid #EAEEF4' }}>
                <Search size={20} color="#7E92A2" />
              </button>
              <img src={avatarUrl} alt="User" className="avatar" style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </header>

        {/* Profile Content Area */}
        <div style={{ padding: '40px 60px', flex: 1 }}>

          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflow: 'hidden' }}>

            {/* Banner */}
            <div style={{ height: '200px', background: 'linear-gradient(135deg, #E2E8F0 0%, #F8FAFC 100%)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.5, backgroundImage: 'radial-gradient(circle at 70% 30%, white 0%, transparent 50%)' }}></div>
            </div>

            {/* Avatar & Info */}
            <div style={{ padding: '0 40px 40px 40px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

              <div style={{ position: 'relative', marginTop: '-60px', marginBottom: '20px' }}>
                <img
                  src={avatarUrl}
                  alt="Profile"
                  style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid white', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <button
                  onClick={handleAvatarClick}
                  style={{ position: 'absolute', bottom: '5px', right: '5px', background: '#514EF3', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white' }}
                >
                  <Edit2 size={14} color="white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Role Badges */}
              {roles.length > 0 && (
                <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
                  {roles.map((role, i) => (
                    <span key={i} style={{
                      padding: '8px 20px',
                      borderRadius: '70px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: role.color,
                      background: role.bg,
                      border: `1px solid ${role.color}`
                    }}>
                      {role.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Form Grid */}
              <div className="form-grid" style={{ width: '100%', gap: '30px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#092C4C', display: 'block', marginBottom: '8px' }}>First Name</label>
                  <input type="text" className="form-input" value={firstName} readOnly style={{ background: '#F8FAFC', border: 'none', color: '#526477' }} />
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#092C4C', display: 'block', marginBottom: '8px' }}>Last Name</label>
                  <input type="text" className="form-input" value={lastName} readOnly style={{ background: '#F8FAFC', border: 'none', color: '#526477' }} />
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#092C4C', display: 'block', marginBottom: '8px' }}>Email</label>
                  <input type="email" className="form-input" value={email} readOnly style={{ background: '#F8FAFC', border: 'none', color: '#526477' }} />
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#092C4C', display: 'block', marginBottom: '8px' }}>Username</label>
                  <input type="text" className="form-input" value={currentUser?.username ?? ''} readOnly style={{ background: '#F8FAFC', border: 'none', color: '#526477' }} />
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #EAEEF4' }}>
                {currentUser?.role === 'ADMIN' && (
                  <button
                    onClick={() => navigate('/admin')}
                    style={{ background: '#EEF0FD', color: '#514EF3', border: 'none', padding: '12px 28px', borderRadius: '70px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  >
                    <ShieldCheck size={16} /> Admin Panel
                  </button>
                )}
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  style={{ background: '#FBEAEA', color: '#FE8084', border: 'none', padding: '12px 28px', borderRadius: '70px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {isLogoutModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ width: '400px', padding: '40px 30px', textAlign: 'center' }}>
              <button className="modal-close" onClick={() => setIsLogoutModalOpen(false)}>✖</button>

              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#FBEAEA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <LogOut size={24} color="#FE8084" />
              </div>

              <h3 style={{ color: '#092C4C', margin: '0 0 10px 0', fontSize: '20px' }}>Ready to leave?</h3>

              <p style={{ color: '#7E92A2', fontSize: '14px', lineHeight: '1.6', marginBottom: '30px' }}>
                Are you sure you want to log out? You will need to sign in again to access your CRM.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button className="btn-cancel" onClick={() => setIsLogoutModalOpen(false)}>Cancel</button>
                <button className="btn-danger" onClick={handleLogout}>Log Out</button>
              </div>
            </div>
          </div>
        )}

      </main>
      <MobileNav currentUser={currentUser} />
    </div>
  );
}

export default UserProfile;
