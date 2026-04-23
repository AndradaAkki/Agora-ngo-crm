import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Bell, Settings, Calendar, Home, Search, Edit2, LogOut } from 'lucide-react';
import './App.css';

function UserProfile() {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Simulated Logged-In User Data
  const currentUser = {
    firstName: 'Alex',
    lastName: 'Thompson',
    email: 'alex.t@agora-crm.com',
    phone: '+1 (555) 123-9999',
    roles: [
      { name: 'Full Access: Externe CD', color: '#514EF3', bg: '#F0F0FE' },
      { name: 'Administrator', color: '#FE8084', bg: '#FBEAEA' }
    ],
    avatar: 'https://i.pravatar.cc/150?u=andra'
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    // In a real app, you would clear auth tokens/cookies here
    navigate('/'); // Redirect to the Presentation/Login page
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
          <LayoutDashboard className="menu-icon" onClick={() => navigate('/dashboard')} title="Dashboard" />
          <Calendar className="menu-icon" onClick={() => navigate('/stats')} title="Events & Stats" />
          <Building2 className="menu-icon" onClick={() => navigate('/firms')} title="My Firms" />
          <Bell className="menu-icon" />
          {/* Highlight the settings icon for the profile page */}
          <Settings className="menu-icon active" title="Profile Settings" />
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
              <img src={currentUser.avatar} alt="User" className="avatar" style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </header>

        {/* Profile Content Area */}
        <div style={{ padding: '40px 60px', flex: 1 }}>
          
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
            
            {/* Banner Area */}
            <div style={{ height: '200px', background: 'linear-gradient(135deg, #E2E8F0 0%, #F8FAFC 100%)', position: 'relative' }}>
              {/* Abstract decoration to mimic Figma banner */}
              <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.5, backgroundImage: 'radial-gradient(circle at 70% 30%, white 0%, transparent 50%)' }}></div>
              
              <button className="icon-btn-round" style={{ position: 'absolute', bottom: '20px', right: '30px', background: 'white', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Edit2 size={16} color="#7E92A2" />
              </button>
            </div>

            {/* Avatar & Badges Area */}
            <div style={{ padding: '0 40px 40px 40px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              {/* Overlapping Avatar */}
              <div style={{ position: 'absolute', top: '-60px', left: '40px', position: 'relative', marginTop: '-60px', marginBottom: '20px' }}>
                <img 
                  src={currentUser.avatar} 
                  alt="Profile" 
                  style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid white', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                />
                <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: '#514EF3', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white' }}>
                  <Edit2 size={14} color="white" />
                </div>
              </div>

              {/* Roles Badges */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
                {currentUser.roles.map((role, i) => (
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

              {/* Form Grid */}
              <div className="form-grid" style={{ width: '100%', gap: '30px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#092C4C', display: 'block', marginBottom: '8px' }}>First Name</label>
                  <input type="text" className="form-input" value={currentUser.firstName} readOnly style={{ background: '#F8FAFC', border: 'none', color: '#526477' }} />
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#092C4C', display: 'block', marginBottom: '8px' }}>Last Name</label>
                  <input type="text" className="form-input" value={currentUser.lastName} readOnly style={{ background: '#F8FAFC', border: 'none', color: '#526477' }} />
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#092C4C', display: 'block', marginBottom: '8px' }}>Email</label>
                  <input type="email" className="form-input" value={currentUser.email} readOnly style={{ background: '#F8FAFC', border: 'none', color: '#526477' }} />
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#092C4C', display: 'block', marginBottom: '8px' }}>Phone</label>
                  <input type="text" className="form-input" value={currentUser.phone} readOnly style={{ background: '#F8FAFC', border: 'none', color: '#526477' }} />
                </div>
              </div>

              {/* Logout Button */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #EAEEF4' }}>
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

        {/* --- LOGOUT CONFIRMATION MODAL --- */}
        {isLogoutModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ width: '400px', padding: '40px 30px', textAlign: 'center' }}>
              <button className="modal-close" onClick={() => setIsLogoutModalOpen(false)}>✖</button>
              
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#FBEAEA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <LogOut size={24} color="#FE8084" />
              </div>

              <h3 style={{ color: '#092C4C', margin: '0 0 10px 0', fontSize: '20px' }}>
                Ready to leave?
              </h3>
              
              <p style={{ color: '#7E92A2', fontSize: '14px', lineHeight: '1.6', marginBottom: '30px' }}>
                Are you sure you want to log out of your account? You will need to sign in again to access your CRM.
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button className="btn-cancel" onClick={() => setIsLogoutModalOpen(false)}>Cancel</button>
                <button className="btn-danger" onClick={handleLogout}>Log Out</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default UserProfile;