import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useMyFirmsLogic({ firms }) {
  const navigate = useNavigate();
  
  // 1. Simulam utilizatorul logat 
  const currentUser = "Alex Thompson";

  // 2. Filtram lista pentru a arata doar companiile asignate lui
  const myFirmsList = firms.filter(firm => firm.assignedCD === currentUser); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFirms = myFirmsList.slice(indexOfFirstItem, indexOfLastItem);
  
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