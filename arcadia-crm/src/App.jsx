import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Presentation from './Presentation';
import Login from './Login';
import Dashboard from './Dashboard';
import MyFirms from './MyFirms';
import EventsStats from './EventsStats';
import FirmProfile from './FirmProfile';
import UserProfile from './UserProfile';
import { useAppLogic } from './useAppLogic';

function ProtectedRoute({ currentUser, allowedRoles, children }) {
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const handleLogout = () => setCurrentUser(null);

  const {
    isOnline,
    firms,
    hasMore,
    loadMoreFirms,
    handleAddFirm,
    handleUpdateFirm,
    handleDeleteFirm
  } = useAppLogic();

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
      </Routes>
    </Router>
  );
}

export default App;
