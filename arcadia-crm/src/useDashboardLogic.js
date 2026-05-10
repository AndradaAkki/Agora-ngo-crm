import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
// Adjust this query to match your exact backend GraphQL schema
export const GET_FIRMS = gql`
  query GetFirms($page: Int, $limit: Int) {
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

export function useDashboardLogic({ firms, onAddFirm }) {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Paginare
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 
  
  const today = new Date();
  const sortedFirms = [...firms].sort((a, b) => {
    const aIsPaused = a.pausedUntil && new Date(a.pausedUntil) >= today;
    const bIsPaused = b.pausedUntil && new Date(b.pausedUntil) >= today;
    if (aIsPaused && !bIsPaused) return 1;
    if (!aIsPaused && bIsPaused) return -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFirms = sortedFirms.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.max(1, Math.ceil(firms.length / itemsPerPage));

  return {
    navigate,
    isAddModalOpen,
    setIsAddModalOpen,
    currentFirms,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems: firms.length,
    handleAddFirm: onAddFirm
  };
}