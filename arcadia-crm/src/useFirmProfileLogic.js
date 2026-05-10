import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import {  gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

// 1. Definim mutatiile GraphQL
const UPDATE_FIRM_DETAILS = gql`
  mutation UpdateFirmDetails($id: ID!, $details: String, $pausedUntil: String) {
    updateFirm(id: $id, details: $details, pausedUntil: $pausedUntil) { id details pausedUntil }
  }
`;

const DELETE_FIRM = gql`
  mutation DeleteFirm($id: ID!) { deleteFirm(id: $id) { id } }
`;

const ADD_TASK = gql`
  mutation AddTask($firmId: ID!, $desc: String!) { addTask(firmId: $firmId, desc: $desc) { id desc isDone } }
`;

const TOGGLE_TASK = gql`
  mutation ToggleTask($taskId: ID!) { toggleTask(taskId: $taskId) { id isDone } }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($taskId: ID!) { deleteTask(taskId: $taskId) { id } }
`;

const ADD_HISTORY = gql`
  mutation AddHistory($firmId: ID!, $type: String!, $desc: String!, $author: String!, $date: String!) {
    addHistory(firmId: $firmId, type: $type, desc: $desc, author: $author, date: $date) { id }
  }
`;

const DELETE_HISTORY = gql`
  mutation DeleteHistory($historyId: ID!) { deleteHistory(historyId: $historyId) { id } }
`;

// Atentie: am scos setFirms din props, nu mai avem nevoie de el!
export function useFirmProfileLogic({ firms }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const firm = firms?.find(f => String(f.id) === String(id));

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isContactManagerOpen, setIsContactManagerOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [isDeleteHistoryModalOpen, setIsDeleteHistoryModalOpen] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState(null);

  const [localDetails, setLocalDetails] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [pauseDate, setPauseDate] = useState('');
  const [activityData, setActivityData] = useState({ type: 'Call', desc: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    if (firm) setLocalDetails(firm.details || '');
  }, [firm?.details]);

  // 2. Initializam mutatiile
  const [updateFirm] = useMutation(UPDATE_FIRM_DETAILS, { refetchQueries: ['GetFirms'] });
  const [deleteFirm] = useMutation(DELETE_FIRM, { onCompleted: () => navigate('/dashboard'), refetchQueries: ['GetFirms'] });
  const [addTask] = useMutation(ADD_TASK, { refetchQueries: ['GetFirms'] });
  const [toggleTask] = useMutation(TOGGLE_TASK, { refetchQueries: ['GetFirms'] });
  const [deleteTask] = useMutation(DELETE_TASK, { refetchQueries: ['GetFirms'] });
  const [addHistory] = useMutation(ADD_HISTORY, { refetchQueries: ['GetFirms'] });
  const [deleteHistory] = useMutation(DELETE_HISTORY, { refetchQueries: ['GetFirms'] });

  // 3. Handlere conectate la baza de date
  const handleConfirmDelete = () => deleteFirm({ variables: { id: firm.id } });
  const handleSaveEdit = () => setIsEditModalOpen(false); 
  const openContactManager = () => { setIsEditModalOpen(false); setIsContactManagerOpen(true); };

  const handleDetailsBlur = () => {
    if (localDetails !== firm.details) {
      updateFirm({ variables: { id: firm.id, details: localDetails } });
    }
  };

  const handleAddTask = (e) => {
    if (e.key === 'Enter' && newTaskDesc.trim() !== '') {
      addTask({ variables: { firmId: firm.id, desc: newTaskDesc } });
      setNewTaskDesc('');
    }
  };

  const handleToggleTask = (taskId) => toggleTask({ variables: { taskId } });
  const handleDeleteTask = (taskId) => deleteTask({ variables: { taskId } });

  const promptDeleteHistory = (hist) => { setHistoryToDelete(hist); setIsDeleteHistoryModalOpen(true); };
  
  const confirmDeleteHistory = () => {
    if (historyToDelete) {
      deleteHistory({ variables: { historyId: String(historyToDelete.id) } });
      setIsDeleteHistoryModalOpen(false);
      setHistoryToDelete(null);
    }
  };
  
  const cancelDeleteHistory = () => { setIsDeleteHistoryModalOpen(false); setHistoryToDelete(null); };

  const handleSaveActivity = () => {
    if (activityData.desc.trim() !== '') {
      addHistory({ 
        variables: { 
          firmId: firm.id, 
          type: activityData.type, 
          desc: activityData.desc, 
          author: 'Alex Thompson', 
          date: activityData.date 
        } 
      });
      setIsAddActivityOpen(false);
      setActivityData({ type: 'Call', desc: '', date: new Date().toISOString().split('T')[0] });
    }
  };

  const isPaused = firm?.pausedUntil && new Date(firm.pausedUntil) >= new Date();
  
  const handleTogglePause = () => {
    setPauseDate(firm.pausedUntil || '');
    setIsPauseModalOpen(true);
  };

  const handleResumePause = () => {
    updateFirm({ variables: { id: firm.id, pausedUntil: null } });
    setIsPauseModalOpen(false);
  };

  const handleSavePause = () => {
    if (pauseDate) {
      updateFirm({ variables: { id: firm.id, pausedUntil: pauseDate } });
      setIsPauseModalOpen(false);
    }
  };

  useEffect(() => {
    if (firm) {
      let activityLog = Cookies.get('userActivity');
      activityLog = activityLog ? JSON.parse(activityLog) : [];
      activityLog.push({ action: 'viewed_profile', firmName: firm.name, timestamp: new Date().toISOString() });
      if (activityLog.length > 5) activityLog.shift();
      Cookies.set('userActivity', JSON.stringify(activityLog), { expires: 1 });
    }
  }, [firm?.id]);

  return {
    firm, navigate, isEditModalOpen, setIsEditModalOpen, isDeleteModalOpen, setIsDeleteModalOpen,
    isContactManagerOpen, setIsContactManagerOpen, isAddActivityOpen, setIsAddActivityOpen,
    isPauseModalOpen, setIsPauseModalOpen, isDeleteHistoryModalOpen, setIsDeleteHistoryModalOpen,
    localDetails, setLocalDetails, newTaskDesc, setNewTaskDesc, pauseDate, setPauseDate, activityData, setActivityData,
    handleConfirmDelete, handleSaveEdit, handleDetailsBlur, openContactManager,
    handleAddTask, toggleTask: handleToggleTask, deleteTask: handleDeleteTask,
    promptDeleteHistory, confirmDeleteHistory, cancelDeleteHistory,
    isPaused, handleTogglePause, handleResumePause, handleSavePause, handleSaveActivity
  };
}