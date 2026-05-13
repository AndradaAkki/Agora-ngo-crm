import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useMyFirmsLogic({ firms, currentUser }) {
  const navigate = useNavigate();

  const myFirmsList = firms.filter(firm => firm.assignedCD === currentUser?.id);

  const today = new Date();
  const sortedMyFirms = [...myFirmsList].sort((a, b) => {
    const aIsPaused = a.pausedUntil && new Date(a.pausedUntil) >= today;
    const bIsPaused = b.pausedUntil && new Date(b.pausedUntil) >= today;
    if (aIsPaused && !bIsPaused) return 1;
    if (!aIsPaused && bIsPaused) return -1;
    return 0;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFirms = sortedMyFirms.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.max(1, Math.ceil(myFirmsList.length / itemsPerPage));

  return {
    navigate,
    myFirmsList,
    currentFirms,
    currentPage,
    setCurrentPage,
    totalPages
  };
}