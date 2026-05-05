import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

export const GET_ALL_EVENTS_DATA = gql`
  query GetAllEventsData {
    getFirms(page: 1, limit: 1000) {
      data {
        id
        name
        status
        assignedCD
        email
        contracts { name steps }
        history { type }
      }
    }
  }
`;

export function useEventsStatsLogic() {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState('All Events');
  const [viewType, setViewType] = useState('chart');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newEventData, setNewEventData] = useState({ name: '', date: '', description: '' });
  const [customEvents, setCustomEvents] = useState([]);

  // Fetch all firms directly from Apollo
  const { data, loading, error } = useQuery(GET_ALL_EVENTS_DATA, {
    fetchPolicy: 'network-only' // Ensures fresh data for accurate stats
  });

  const firms = data?.getFirms?.data || [];

  // --- DATA PROCESSING ---
  const availableEvents = useMemo(() => {
    const events = new Set(customEvents);
    firms.forEach(firm => {
      if (firm.contracts) {
        firm.contracts.forEach(contract => events.add(contract.name));
      }
    });
    return ['All Events', ...Array.from(events)];
  }, [firms, customEvents]);

  const filteredFirms = useMemo(() => {
    if (selectedEvent === 'All Events') return firms;
    return firms.filter(firm =>
      firm.contracts && firm.contracts.some(c => c.name === selectedEvent)
    );
  }, [firms, selectedEvent]);

  // Pie Chart Data (Dynamic)
  const pieData = useMemo(() => {
    // 1. Numaram automat cate firme au fiecare status
    const statusCounts = {};
    filteredFirms.forEach(firm => {
      const status = firm.status || 'Unassigned';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // 2. Definim o paleta de culori frumoase (primele 3 sunt cele alese de tine)
    const COLORS = ['#2DC8A8', '#FFC357', '#FE8084', '#514EF3', '#36A2EB', '#FF6384'];

    // 3. Transformam obiectul de numaratoare intr-un format pe care il intelege Recharts
    return Object.keys(statusCounts).map((statusName, index) => ({
      name: statusName,
      value: statusCounts[statusName],
      // Alocam cate o culoare din paleta de mai sus in ordine
      color: COLORS[index % COLORS.length] 
    }));
  }, [filteredFirms]);

  // Bar Chart Data
  const activityData = useMemo(() => {
    const counts = {};
    filteredFirms.forEach(firm => {
      if (firm.history) {
        firm.history.forEach(log => {
          counts[log.type] = (counts[log.type] || 0) + 1;
        });
      }
    });
    return Object.keys(counts).map(key => ({
      name: key,
      actions: counts[key]
    })).sort((a, b) => b.actions - a.actions); 
  }, [filteredFirms]);

  // --- HANDLERS ---
  const handleAddEvent = () => {
    if (newEventData.name.trim() !== '') {
      setCustomEvents([...customEvents, newEventData.name]);
      setSelectedEvent(newEventData.name);
      setNewEventData({ name: '', date: '', description: '' });
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteEvent = () => {
    // In a real app, you would delete from DB here. For now, we just reset the view.
    setSelectedEvent('All Events');
    setIsDeleteModalOpen(false);
  };

  return {
    navigate,
    loading,
    error,
    selectedEvent,
    setSelectedEvent,
    viewType,
    setViewType,
    isAddModalOpen,
    setIsAddModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    newEventData,
    setNewEventData,
    availableEvents,
    filteredFirms,
    pieData,
    activityData,
    handleAddEvent,
    handleDeleteEvent
  };
}