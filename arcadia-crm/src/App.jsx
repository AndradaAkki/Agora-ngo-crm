import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client/core';
import Presentation from './Presentation';
import Dashboard from './Dashboard';
import MyFirms from './MyFirms';
import EventsStats from './EventsStats';
import FirmProfile from './FirmProfile';
import UserProfile from './UserProfile';

// --- THE GRAPHQL QUERY ---
const GET_FIRMS = gql`
  query GetFirms($page: Int, $limit: Int) {
    getFirms(page: $page, limit: $limit) {
      totalItems
      currentPage
      totalPages
      data {
        id name contactName email phone status details assignedCD pausedUntil
        contacts { id name position email phone isPrimary }
        tasks { id desc isDone }
        history { type desc author date }
        contracts { name steps }
      }
    }
  }
`;

function App() {
  const [firms, setFirms] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // INFINITE SCROLL STATE
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // -----------------------------------------------------
  // GRAPHQL: Initial Fetch & Infinite Scroll Engine
  // -----------------------------------------------------
  const { loading: isInitialLoading, data, fetchMore, refetch } = useQuery(GET_FIRMS, {
    variables: { page: 1, limit: 10 },
    fetchPolicy: 'network-only',
  });

  // Watch the data object directly instead of relying on onCompleted
  useEffect(() => {
    if (data && data.getFirms && page === 1) {
      setFirms(data.getFirms.data);
      setHasMore(data.getFirms.currentPage < data.getFirms.totalPages);
    }
  }, [data, page]);

  // Lock to prevent firing 100 requests if the user scrolls too fast
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // The function to trigger when the user scrolls to the bottom
  const loadMoreFirms = async () => {
    if (!hasMore || !isOnline || isFetchingMore || isInitialLoading) return;
    
    setIsFetchingMore(true); 
    const nextPage = page + 1;
    
    try {
      await fetchMore({
        variables: { page: nextPage, limit: 10 },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          
          const newFirms = fetchMoreResult.getFirms.data;
          
          // Append new firms while removing duplicates just in case
          setFirms(currentFirms => {
            const existingIds = new Set(currentFirms.map(f => f.id));
            const uniqueNewFirms = newFirms.filter(f => !existingIds.has(f.id));
            return [...currentFirms, ...uniqueNewFirms];
          });
          
          setPage(nextPage);
          setHasMore(fetchMoreResult.getFirms.currentPage < fetchMoreResult.getFirms.totalPages);
          
          return prev; 
        }
      });
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setIsFetchingMore(false); 
    }
  };

  // -----------------------------------------------------
  // HELPER: Sync Queue Management (GraphQL Edition)
  // -----------------------------------------------------
  const getSyncQueue = () => {
    const queue = localStorage.getItem('arcadiaSyncQueue');
    return queue ? JSON.parse(queue) : [];
  };

  const addToSyncQueue = (action) => {
    const queue = getSyncQueue();
    queue.push(action);
    localStorage.setItem('arcadiaSyncQueue', JSON.stringify(queue));
  };

  const processSyncQueue = async () => {
    const queue = getSyncQueue();
    if (queue.length === 0) return;

    for (const action of queue) {
      try {
        // We simulate the offline sync by running mutations via standard fetch to the /graphql endpoint
        let mutationString = '';
        if (action.method === 'POST') {
          mutationString = `mutation { addFirm(name: "${action.payload.name}", email: "${action.payload.email}", status: "${action.payload.status}") { id } }`;
        } else if (action.method === 'PUT') {
          mutationString = `mutation { updateFirm(id: "${action.id}", name: "${action.payload.name}", email: "${action.payload.email}", status: "${action.payload.status}") { id } }`;
        } else if (action.method === 'DELETE') {
          mutationString = `mutation { deleteFirm(id: "${action.id}") { id } }`;
        }

        await fetch('http://localhost:3000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: mutationString })
        });
      } catch (error) {
        console.error("Sync error:", error);
      }
    }

    localStorage.removeItem('arcadiaSyncQueue');
    refetch(); // Refresh list after sync
  };

  // -----------------------------------------------------
  // INITIAL SETUP: Network & WebSockets
  // -----------------------------------------------------
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processSyncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const socket = io('http://localhost:3000');
    socket.on('new_firms_added', (newBatch) => {
      setFirms(prevFirms => [...newBatch, ...prevFirms]);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      socket.disconnect();
    };
  }, []);

  // -----------------------------------------------------
  // WRAPPER FUNCTIONS FOR CRUD OPERATIONS
  // -----------------------------------------------------
  const handleAddFirm = async (newFirmData) => {
    const optimisticFirm = { id: Date.now(), ...newFirmData };
    setFirms(prev => [optimisticFirm, ...prev]);

    if (isOnline) {
      try {
        await fetch('http://localhost:3000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: `mutation { addFirm(name: "${newFirmData.name}", email: "${newFirmData.email}", status: "${newFirmData.status}") { id } }` 
          })
        });
        refetch(); 
      } catch (e) {
         addToSyncQueue({ method: 'POST', payload: newFirmData });
      }
    } else {
      addToSyncQueue({ method: 'POST', payload: newFirmData });
    }
  };

  const handleUpdateFirm = async (updatedFirm) => {
     setFirms(prev => prev.map(f => f.id === updatedFirm.id ? updatedFirm : f));

     if(isOnline) {
         try {
             await fetch('http://localhost:3000/graphql', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ 
                   query: `mutation { updateFirm(id: "${updatedFirm.id}", name: "${updatedFirm.name}", email: "${updatedFirm.email}", status: "${updatedFirm.status}") { id } }` 
                 })
             });
         } catch (e) {
             addToSyncQueue({ method: 'PUT', id: updatedFirm.id, payload: updatedFirm });
         }
     } else {
         addToSyncQueue({ method: 'PUT', id: updatedFirm.id, payload: updatedFirm });
     }
  }

   const handleDeleteFirm = async (id) => {
     setFirms(prev => prev.filter(f => f.id !== id));

     if(isOnline) {
         try {
             await fetch('http://localhost:3000/graphql', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ query: `mutation { deleteFirm(id: "${id}") { id } }` })
             });
         } catch (e) {
             addToSyncQueue({ method: 'DELETE', id: id });
         }
     } else {
         addToSyncQueue({ method: 'DELETE', id: id });
     }
  }

  return (
    <Router>
      {!isOnline && (
          <div style={{ background: '#FE8084', color: 'white', textAlign: 'center', padding: '5px', fontSize: '12px', position: 'fixed', top: 0, width: '100%', zIndex: 9999 }}>
              You are currently offline. Changes will be synced when you reconnect.
          </div>
      )}

      <Routes>
        <Route path="/" element={<Presentation />} />
        {/* We pass the loadMoreFirms function and hasMore state down to the Dashboard */}
        <Route path="/dashboard" element={<Dashboard firms={firms} setFirms={setFirms} onAddFirm={handleAddFirm} loadMoreFirms={loadMoreFirms} hasMore={hasMore} />} />
        <Route path="/firms" element={<MyFirms firms={firms} setFirms={setFirms} onAddFirm={handleAddFirm} />} />
        <Route path="/stats" element={<EventsStats firms={firms} />} />
        <Route path="/firm/:id" element={<FirmProfile firms={firms} setFirms={setFirms} onUpdateFirm={handleUpdateFirm} onDeleteFirm={handleDeleteFirm} />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;