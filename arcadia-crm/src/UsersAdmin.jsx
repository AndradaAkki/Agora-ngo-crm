import React from 'react';
import { LayoutDashboard, Building2, Calendar, Home, Settings, Shield, Trash2, Plus, X } from 'lucide-react';
import { useUsersAdminLogic } from './useUsersAdminLogic';
import MobileNav from './MobileNav';
import emptyPfp from './assets/empty_pfp.jpeg';
import './App.css';

const ROLE_COLORS = {
  'ADMIN':       { background: '#ffe0e0', color: '#c0392b' },
  'Externe CD':  { background: '#e0f0ff', color: '#1a6fb5' },
  'General CD':  { background: '#e8f5e9', color: '#2e7d32' },
};

function RoleBadge({ role }) {
  const style = ROLE_COLORS[role] || { background: '#eee', color: '#555' };
  return (
    <span style={{ ...style, padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
      {role}
    </span>
  );
}

export default function UsersAdmin({ currentUser, onLogout }) {
  const {
    navigate, users, loading,
    showForm, setShowForm,
    form, handleFormChange, formError, handleCreate,
    handleRoleChange,
    deleteTarget, setDeleteTarget, handleDelete,
    ROLES,
  } = useUsersAdminLogic();

  return (
    <div className="dashboard-container">
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
          <Shield className="menu-icon active" title="User Management" />
          <Settings className="menu-icon" onClick={() => navigate('/profile')} title="Profile" />
        </nav>
        <div className="sidebar-avatar" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <img src={currentUser?.avatarUrl || emptyPfp} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
        </div>
      </aside>

      <main className="main-content" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#092C4C' }}>User Management</h1>
            <p style={{ margin: '4px 0 0', color: '#888', fontSize: '14px' }}>{users.length} users in the system</p>
          </div>
          <button
            onClick={() => setShowForm(s => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#092C4C', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 18px', cursor: 'pointer', fontWeight: 600 }}
          >
            <Plus size={16} /> Add User
          </button>
        </div>

        {/* Create user form */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>New User</h3>
              <X size={18} style={{ cursor: 'pointer', color: '#888' }} onClick={() => setShowForm(false)} />
            </div>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input placeholder="Username *" value={form.username} onChange={e => handleFormChange('username', e.target.value)} style={inputStyle} />
              <input placeholder="Email *" type="email" value={form.email} onChange={e => handleFormChange('email', e.target.value)} style={inputStyle} />
              <input placeholder="Password *" type="password" value={form.password} onChange={e => handleFormChange('password', e.target.value)} style={inputStyle} />
              <input placeholder="Display name" value={form.displayName} onChange={e => handleFormChange('displayName', e.target.value)} style={inputStyle} />
              <select value={form.role} onChange={e => handleFormChange('role', e.target.value)} style={inputStyle}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button type="submit" style={{ background: '#092C4C', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontWeight: 600 }}>
                Create User
              </button>
              {formError && <p style={{ color: '#c0392b', gridColumn: 'span 2', margin: 0 }}>{formError}</p>}
            </form>
          </div>
        )}

        {/* Users table */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          {loading ? (
            <p style={{ padding: '24px', color: '#888' }}>Loading users...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                  {['User', 'Email', 'Role', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={user.avatarUrl || emptyPfp} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{user.displayName || user.username}</div>
                          <div style={{ color: '#888', fontSize: '12px' }}>@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#555', fontSize: '14px' }}>{user.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px' }}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <RoleBadge role={user.role} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => setDeleteTarget(user.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <MobileNav currentUser={currentUser} />

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '28px', maxWidth: '360px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ marginTop: 0 }}>Delete User?</h3>
            <p style={{ color: '#666' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: 'white' }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px',
  width: '100%',
  boxSizing: 'border-box',
};
