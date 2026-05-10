import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';


// --- GRAPHQL DEFINITIONS ---
export const GET_FIRMS = gql`
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
        details
        pausedUntil
        assignedCD
        tasks {
          id
          desc
          isDone
        }
        contacts {
          id
          name
          email
          phoneNumber
          position
          isPrimary
        }
        history {
          id
          type
          details
          author
          timestamp
        }
        contracts {
          id
          name
          status
          steps
        }
        firmEventStatuses {
          id
          status
          eventId
          eventName
        }
      }
    }
  }
`;

export const FIRM_ADDED_SUBSCRIPTION = gql`
  subscription OnFirmAdded {
    firmAdded {
      id
      name
      email
      status
    }
  }
`;

export const ADD_FIRM = gql`
  mutation AddFirm($name: String!, $email: String!, $status: String) {
    addFirm(name: $name, email: $email, status: $status) {
      id
      name
      email
      status
    }
  }
`;

export const UPDATE_FIRM = gql`
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

export const DELETE_FIRM = gql`
  mutation DeleteFirm($id: ID!) {
    deleteFirm(id: $id) {
      id
    }
  }
`;

export function useAppLogic() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // 1. APOLLO QUERIES
  const { loading: isInitialLoading, error, data, fetchMore, refetch } = useQuery(GET_FIRMS, {
    variables: { page: 1, limit: 100 },
    fetchPolicy: 'cache-first', 
  });

  console.log("APOLLO CHECK:", { isInitialLoading, error, data });
  if (error) {
    console.error("Apollo Query Error:", error.message);
  }

  // 2. APOLLO MUTATIONS
  const [addFirmMutation] = useMutation(ADD_FIRM, {
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

  // 3. APOLLO SUBSCRIPTION
  const { data: subscriptionData } = useSubscription(FIRM_ADDED_SUBSCRIPTION);

  useEffect(() => {
    if (subscriptionData) {
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

  // Variabile derivate
  const firms = data?.getFirms?.data || [];
  const hasMore = data?.getFirms ? data.getFirms.currentPage < data.getFirms.totalPages : false;

  // Handlers
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

  return {
    isOnline,
    firms,
    hasMore,
    loadMoreFirms,
    handleAddFirm,
    handleUpdateFirm,
    handleDeleteFirm
  };
}