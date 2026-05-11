import { useState, useMemo } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { EVENT_STATUSES } from './statusConfig';

const GET_EVENTS = gql`
  query GetEvents {
    getEvents { id name }
  }
`;

const SET_FIRM_EVENT_STATUS = gql`
  mutation SetFirmEventStatus($firmId: ID!, $eventId: ID!, $status: String!) {
    setFirmEventStatus(firmId: $firmId, eventId: $eventId, status: $status) {
      id
      status
    }
  }
`;

const STATUS_PRIORITY = ['Accepted', 'Interested', 'Waiting', 'Contacted', 'Not Started', 'Rejected'];

export function useDashboardLogic({ firms, onAddFirm }) {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState('All Events');
  const itemsPerPage = 10;

  const { data: eventsData } = useQuery(GET_EVENTS);

  const [setFirmEventStatusMutation] = useMutation(SET_FIRM_EVENT_STATUS, {
    refetchQueries: ['GetFirms']
  });

  const availableEvents = useMemo(() => {
    const list = eventsData?.getEvents || [];
    return ['All Events', ...list.map(e => e.name)];
  }, [eventsData]);

  const eventNameToId = useMemo(() => {
    const map = {};
    (eventsData?.getEvents || []).forEach(e => { map[e.name] = e.id; });
    return map;
  }, [eventsData]);

  const getEventStatus = (firm) => {
    if (selectedEvent !== 'All Events') {
      const fes = firm.firmEventStatuses?.find(s => s.eventName === selectedEvent);
      return fes?.status || 'Not Started';
    }
    const statuses = firm.firmEventStatuses?.map(s => s.status) || [];
    if (statuses.length === 0) return 'Not Started';
    return statuses.reduce((best, current) => {
      const bi = STATUS_PRIORITY.indexOf(best);
      const ci = STATUS_PRIORITY.indexOf(current);
      return ci < bi ? current : best;
    });
  };

  const handleSetFirmStatus = (firmId, status) => {
    const eventId = eventNameToId[selectedEvent];
    if (!eventId) return;
    setFirmEventStatusMutation({ variables: { firmId, eventId, status } });
  };

  const today = new Date();
  const sortedFirms = useMemo(() => [...firms].sort((a, b) => {
    const aIsPaused = a.pausedUntil && new Date(a.pausedUntil) >= today;
    const bIsPaused = b.pausedUntil && new Date(b.pausedUntil) >= today;
    if (aIsPaused && !bIsPaused) return 1;
    if (!aIsPaused && bIsPaused) return -1;
    return 0;
  }), [firms]);

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
    handleAddFirm: onAddFirm,
    selectedEvent,
    setSelectedEvent,
    availableEvents,
    getEventStatus,
    handleSetFirmStatus,
  };
}
