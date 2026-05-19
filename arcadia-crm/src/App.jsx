import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Presentation from './Presentation';
import Login from './Login';
import Dashboard from './Dashboard';
import MyFirms from './MyFirms';
import EventsStats from './EventsStats';
import FirmProfile from './FirmProfile';
import UserProfile from './UserProfile';
import UsersAdmin from './UsersAdmin';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import { useAppLogic } from './useAppLogic';
import { useInactivityLogout } from './useInactivityLogout';

function ProtectedRoute({ currentUser, allowedRoles, children }) {
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('arcadia_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = useCallback(() => {
    localStorage.removeItem('arcadia_token');
    localStorage.removeItem('arcadia_user');
    setCurrentUser(null);
  }, []);

  // Handle OAuth redirect: ?token=JWT lands here after Google/GitHub login.
  // Only runs for JWT tokens (3 dot-separated parts)  never on /reset-password
  // which uses a plain hex token with a different purpose.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token || token.split('.').length !== 3) return;

    // Strip JWT from URL bar immediately never let it linger
    window.history.replaceState({}, '', window.location.pathname);

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user = { id: payload.id, email: payload.email, role: payload.role, isAdmin: payload.isAdmin };
      localStorage.setItem('arcadia_token', token);
      localStorage.setItem('arcadia_user', JSON.stringify(user));
      setCurrentUser(user);
    } catch {
      // Malformed token ignore
    }
  }, []);

  useInactivityLogout(currentUser, handleLogout);

  const { isOnline, firms, hasMore, loadMoreFirms, handleAddFirm, handleUpdateFirm, handleDeleteFirm } = useAppLogic();

  return (
    <Router>
      {!isOnline && (
        <div style={{ background: '#FE8084', color: 'white', textAlign: 'center', padding: '5px', fontSize: '12px', position: 'fixed', top: 0, width: '100%', zIndex: 9999 }}>
          You are currently offline. Working from local cache.
        </div>
      )}
      <Routes>
        <Route path="/" element={<Presentation />} />
        <Route path="/login" element={
          currentUser ? <Navigate to="/dashboard" replace /> : <Login onLogin={setCurrentUser} />
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute currentUser={currentUser}>
            <Dashboard firms={firms} onAddFirm={handleAddFirm} loadMoreFirms={loadMoreFirms} hasMore={hasMore} currentUser={currentUser} />
          </ProtectedRoute>
        } />
        <Route path="/firms" element={
          <ProtectedRoute currentUser={currentUser} allowedRoles={['Externe CD', 'ADMIN']}>
            <MyFirms firms={firms} onAddFirm={handleAddFirm} currentUser={currentUser} />
          </ProtectedRoute>
        } />
        <Route path="/stats" element={
          <ProtectedRoute currentUser={currentUser}>
            <EventsStats firms={firms} currentUser={currentUser} />
          </ProtectedRoute>
        } />
        <Route path="/firm/:id" element={
          <ProtectedRoute currentUser={currentUser}>
            <FirmProfile firms={firms} onUpdateFirm={handleUpdateFirm} onDeleteFirm={handleDeleteFirm} currentUser={currentUser} />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute currentUser={currentUser}>
            <UserProfile currentUser={currentUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute currentUser={currentUser} allowedRoles={['ADMIN']}>
            <UsersAdmin currentUser={currentUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
