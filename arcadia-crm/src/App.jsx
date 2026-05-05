import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import Presentation from './Presentation';
import Dashboard from './Dashboard';
import MyFirms from './MyFirms';
import EventsStats from './EventsStats';
import FirmProfile from './FirmProfile';
import UserProfile from './UserProfile';

// --- GRAPHQL DEFINITIONS ---
const GET_FIRMS = gql`
  query GetFirms($page: Int!, $limit: Int!) {
    getFirms(page: $page, limit: $limit) {
      totalItems
      currentPage
      totalPages
      data {
        id
        name
        email
        status
      }
    }
  }
`;

const FIRM_ADDED_SUBSCRIPTION = gql`
  subscription OnFirmAdded {
    firmAdded {
      id
      name
      email
      status
    }
  }
`;

const ADD_FIRM = gql`
  mutation AddFirm($name: String!, $email: String!, $status: String) {
    addFirm(name: $name, email: $email, status: $status) {
      id
      name
      email
      status
    }
  }
`;

const UPDATE_FIRM = gql`
  mutation UpdateFirm($id: ID!, $name: String, $email: String, $status: String, $details: String) {
    updateFirm(id: $id, name: $name, email: $email, status: $status, details: $details) {
      id
      name
      email
      status
      details
    }
  }
`;

const DELETE_FIRM = gql`
  mutation DeleteFirm($id: ID!) {
    deleteFirm(id: $id) {
      id
    }
  }
`;

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [page, setPage] = useState(1);

  // 1. APOLLO QUERIES & MUTATIONS
  const { loading: isInitialLoading, error, data, fetchMore, refetch } = useQuery(GET_FIRMS, {
    variables: { page: 1, limit: 10 },
    fetchPolicy: 'cache-first', 
  });
  console.log("APOLLO CHECK:", { isInitialLoading, error, data });
  // Log any silent backend errors so you don't get stuck guessing
  if (error) {
    console.error("Apollo Query Error:", error.message);
  }
  

  const [addFirmMutation] = useMutation(ADD_FIRM, {
    // Automatically updates the cache so the UI updates instantly
    update(cache, { data: { addFirm } }) {
      const existingFirms = cache.readQuery({ query: GET_FIRMS, variables: { page: 1, limit: 10 } });
      if (existingFirms) {
        cache.writeQuery({
          query: GET_FIRMS,
          variables: { page: 1, limit: 10 },
          data: {
            getFirms: {
              ...existingFirms.getFirms,
              data: [addFirm, ...existingFirms.getFirms.data]
            }
          }
        });
      }
    }
  });

  const [updateFirmMutation] = useMutation(UPDATE_FIRM);
  const [deleteFirmMutation] = useMutation(DELETE_FIRM, {
    update(cache, { data: { deleteFirm } }) {
      cache.modify({
        fields: {
          getFirms(existingFirmsRefs, { readField }) {
            return {
              ...existingFirmsRefs,
              data: existingFirmsRefs.data.filter(
                firmRef => readField('id', firmRef) !== deleteFirm.id
              ),
            };
          }
        }
      });
    }
  });

  // 2. APOLLO SUBSCRIPTION (Replaces Socket.io)
  const { data: subscriptionData } = useSubscription(FIRM_ADDED_SUBSCRIPTION);

  useEffect(() => {
    if (subscriptionData) {
      // When a new firm arrives via WebSocket, refetch the current list to keep it synced
      refetch();
    }
  }, [subscriptionData, refetch]);

  // Online/Offline Listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Variables derived from Apollo Cache
  const firms = data?.getFirms?.data || [];
  const hasMore = data?.getFirms ? data.getFirms.currentPage < data.getFirms.totalPages : false;

  // Infinite Scroll 
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loadMoreFirms = async () => {
    if (!hasMore || isFetchingMore || isInitialLoading) return;
    setIsFetchingMore(true);
    const nextPage = page + 1;
    
    try {
      await fetchMore({ variables: { page: nextPage, limit: 10 } });
      setPage(nextPage);
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  // CRUD Handlers
  const handleAddFirm = async (newFirmData) => {
    try {
      await addFirmMutation({ variables: { ...newFirmData } });
    } catch (e) {
      console.error("Error adding firm:", e);
    }
  };

  const handleUpdateFirm = async (updatedFirm) => {
    try {
      await updateFirmMutation({ variables: { ...updatedFirm } });
    } catch (e) {
      console.error("Error updating firm:", e);
    }
  };

  const handleDeleteFirm = async (id) => {
    try {
      await deleteFirmMutation({ variables: { id } });
    } catch (e) {
      console.error("Error deleting firm:", e);
    }
  };

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