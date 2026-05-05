import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export function useFirmProfileLogic({ firms, setFirms }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Using String() ensures it matches whether the ID is a string (UUID) or an int
  const firm = firms?.find(f => String(f.id) === String(id));
  
  // --- Modals State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isContactManagerOpen, setIsContactManagerOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [isDeleteHistoryModalOpen, setIsDeleteHistoryModalOpen] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState(null);

  // --- Input States ---
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [pauseDate, setPauseDate] = useState('');
  const [activityData, setActivityData] = useState({ type: 'Call', desc: '', date: new Date().toISOString().split('T')[0] });

  // --- Handlers ---
  const handleConfirmDelete = () => {
    const updatedFirms = firms.filter(f => f.id !== firm.id);
    setFirms(updatedFirms);
    navigate('/dashboard');
  };

  const handleSaveEdit = (updatedFirm) => {
    const updatedFirms = firms.map(f => f.id === updatedFirm.id ? updatedFirm : f);
    setFirms(updatedFirms);
    setIsEditModalOpen(false);
  };

  const handleDetailsChange = (e) => {
    const updatedFirms = firms.map(f => 
      f.id === firm.id ? { ...f, details: e.target.value } : f
    );
    setFirms(updatedFirms);
  };

  const openContactManager = () => {
    setIsEditModalOpen(false);
    setIsContactManagerOpen(true);
  };

  // --- Task Handlers ---
  const handleAddTask = (e) => {
    if (e.key === 'Enter' && newTaskDesc.trim() !== '') {
      const newTask = { id: Date.now(), desc: newTaskDesc, isDone: false };
      const updatedTasks = [...(firm.tasks || []), newTask];
      
      const updatedFirms = firms.map(f => f.id === firm.id ? { ...f, tasks: updatedTasks } : f);
      setFirms(updatedFirms);
      setNewTaskDesc('');
    }
  };

  const toggleTask = (taskId) => {
    const updatedTasks = (firm.tasks || []).map(t => t.id === taskId ? { ...t, isDone: !t.isDone } : t);
    const updatedFirms = firms.map(f => f.id === firm.id ? { ...f, tasks: updatedTasks } : f);
    setFirms(updatedFirms);
  };

  const deleteTask = (taskId) => {
    const updatedTasks = (firm.tasks || []).filter(t => t.id !== taskId);
    const updatedFirms = firms.map(f => f.id === firm.id ? { ...f, tasks: updatedTasks } : f);
    setFirms(updatedFirms);
  };

  // --- History Handlers ---
  const promptDeleteHistory = (hist) => {
    setHistoryToDelete(hist);
    setIsDeleteHistoryModalOpen(true);
  };

  const confirmDeleteHistory = () => {
    if (historyToDelete) {
      const updatedHistory = (firm.history || []).filter(h => h !== historyToDelete);
      const updatedFirms = firms.map(f => f.id === firm.id ? { ...f, history: updatedHistory } : f);
      setFirms(updatedFirms);
      setIsDeleteHistoryModalOpen(false);
      setHistoryToDelete(null);
    }
  };

  const cancelDeleteHistory = () => {
    setIsDeleteHistoryModalOpen(false);
    setHistoryToDelete(null);
  };

  const handleSaveActivity = () => {
    if (activityData.desc.trim() !== '') {
      const newActivity = {
        type: activityData.type,
        desc: activityData.desc,
        date: activityData.date,
        author: 'Alex Thompson' 
      };
      const updatedHistory = [...(firm.history || []), newActivity];
      const updatedFirms = firms.map(f => f.id === firm.id ? { ...f, history: updatedHistory } : f);
      setFirms(updatedFirms);
      setIsAddActivityOpen(false);
      // Reset form
      setActivityData({ type: 'Call', desc: '', date: new Date().toISOString().split('T')[0] });
    }
  };

  // --- Pause Handlers ---
  const isPaused = firm?.pausedUntil && new Date(firm.pausedUntil) >= new Date();
  
  const handleTogglePause = () => {
    if (isPaused) {
      const updatedFirms = firms.map(f => f.id === firm.id ? { ...f, pausedUntil: null } : f);
      setFirms(updatedFirms);
    } else {
      setIsPauseModalOpen(true);
    }
  };

  const handleSavePause = () => {
    if (pauseDate) {
      const updatedFirms = firms.map(f => f.id === firm.id ? { ...f, pausedUntil: pauseDate } : f);
      setFirms(updatedFirms);
      setIsPauseModalOpen(false);
    }
  };

  // Cookies
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
    firm, navigate,
    isEditModalOpen, setIsEditModalOpen,
    isDeleteModalOpen, setIsDeleteModalOpen,
    isContactManagerOpen, setIsContactManagerOpen,
    isAddActivityOpen, setIsAddActivityOpen,
    isPauseModalOpen, setIsPauseModalOpen,
    isDeleteHistoryModalOpen, setIsDeleteHistoryModalOpen,
    newTaskDesc, setNewTaskDesc,
    pauseDate, setPauseDate,
    activityData, setActivityData,
    handleConfirmDelete, handleSaveEdit, handleDetailsChange, openContactManager,
    handleAddTask, toggleTask, deleteTask,
    promptDeleteHistory, confirmDeleteHistory, cancelDeleteHistory,
    isPaused, handleTogglePause, handleSavePause, handleSaveActivity
  };
}