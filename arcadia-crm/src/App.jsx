import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Presentation from './Presentation';
import Dashboard from './Dashboard';
import MyFirms from './MyFirms';
import EventsStats from './EventsStats';
import FirmProfile from './FirmProfile';
import UserProfile from './UserProfile';
import { useAppLogic } from './useAppLogic';

function App() {
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
        <Route path="/dashboard" element={<Dashboard firms={firms} onAddFirm={handleAddFirm} loadMoreFirms={loadMoreFirms} hasMore={hasMore} />} />
        <Route path="/firms" element={<MyFirms firms={firms} onAddFirm={handleAddFirm} />} />
        <Route path="/stats" element={<EventsStats firms={firms} />} />
        <Route path="/firm/:id" element={<FirmProfile firms={firms} onUpdateFirm={handleUpdateFirm} onDeleteFirm={handleDeleteFirm} />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;