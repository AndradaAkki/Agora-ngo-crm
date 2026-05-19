import React from 'react';
import EditFirm from './EditFirm';
import MobileNav from './MobileNav';
import ContactManager from './ContactManager';
import { LayoutDashboard, Home, Calendar, Building2, Bell, Settings, ArrowLeft, ExternalLink, Edit3, Trash2, PauseCircle, CalendarClock, Plus, CheckSquare, Square, Trash } from 'lucide-react';
import { useFirmProfileLogic } from './useFirmProfileLogic';
import emptyPfp from './assets/empty_pfp.jpeg';
import './App.css';

function FirmProfile({ firms, currentUser }) {
  // Bind UI to the hook
  const {
    firm, navigate,
    isEditModalOpen, setIsEditModalOpen,
    isDeleteModalOpen, setIsDeleteModalOpen,
    isContactManagerOpen, setIsContactManagerOpen,
    isAddActivityOpen, setIsAddActivityOpen,
    isPauseModalOpen, setIsPauseModalOpen,
    isDeleteHistoryModalOpen, setIsDeleteHistoryModalOpen,
    
    localDetails, setLocalDetails, // <-- Aici sunt variabilele lipsa pentru Notes
    newTaskDesc, setNewTaskDesc,
    pauseDate, setPauseDate,
    activityData, setActivityData,
    
    handleConfirmDelete, handleSaveEdit, handleDetailsBlur, openContactManager,
    handleAddTask, toggleTask, deleteTask,
    promptDeleteHistory, confirmDeleteHistory, cancelDeleteHistory,
    isPaused, handleTogglePause, handleResumePause, handleSavePause, handleSaveActivity,
    isAddContractOpen, setIsAddContractOpen, pendingDeleteContractId,
    events, selectedNewEventId, setSelectedNewEventId,
    handleAddContract, promptDeleteContract, cancelDeleteContract, confirmDeleteContract,
    handleStepToggle
  } = useFirmProfileLogic({ firms, currentUser });

  if (!firm) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Company not found. <button onClick={() => navigate('/dashboard')}>Back</button></div>;
  }

  // Safe data fallbacks
  const profileContacts = firm.contacts || [];
  const profileContracts = firm.contracts || [];
  const profileTasks = firm.tasks || [];
  
  // History sorting (Newest first)
  const profileHistory = firm.history
    ? [...firm.history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    : [];
  
  const currentYear = new Date().getFullYear();

  // ---------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-box" style={{ marginBottom: '30px' }}>
           <div style={{ width: '40px', height: '40px', background: '#092C4C', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Building2 color="white" size={24} />
           </div>
        </div>
        <nav className="sidebar-menu">
          <Home className="menu-icon" onClick={() => navigate('/')} title="Home" />
          <LayoutDashboard className="menu-icon" onClick={() => navigate('/dashboard')} title="Dashboard" />
          <Calendar className="menu-icon" onClick={() => navigate('/stats')} title="Events & Stats" />
          {currentUser?.role !== 'General CD' && (
            <Building2 className="menu-icon" onClick={() => navigate('/firms')} title="My Firms" />
          )}
          <Bell className="menu-icon" />
          <Settings className="menu-icon" onClick={() => navigate('/profile')} title="Profile Settings" />
        </nav>
      </aside>

      <main className="main-content animate-fade-in" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        
        {/* Header */}
        <header className="dashboard-header" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'white', border: '1px solid #EAEEF4', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={20} color="#092C4C" />
            </button>
            <h1 style={{ color: '#092C4C', margin: 0 }}>{firm.name}</h1>
          </div>
          <div className="header-icons">
            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ArrowLeft size={20} style={{ transform: 'rotate(180deg)' }} color="#7E92A2" /></button>
            <img src={currentUser?.avatarUrl || emptyPfp} alt="User" className="avatar" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }} />
          </div>
        </header>

        {/* Hero Banner */}
        <div className="profile-hero">
          <div className="hero-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                www.{firm.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com <ExternalLink size={16} color="#7E92A2" />
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="icon-btn-round" onClick={() => setIsEditModalOpen(true)}>
                <Edit3 size={16} />
              </button>
              <button className="icon-btn-round" onClick={() => setIsDeleteModalOpen(true)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '15px' }}>
            <span style={{ fontWeight: '600' }}>Status:</span>
            <span className={`status-badge status-${(firm.status || '').toLowerCase().replace(/\s+/g, '-')}`}>{firm.status}</span>
          </div>

          <div className="hero-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <p style={{ margin: 0, fontWeight: '600' }}>
              Assigned CD Member: <span style={{ fontWeight: 'normal' }}>{firm.assigneeName || 'Nobody'}</span>
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              
              {/* Dynamic Pause Button */}
              <button 
                className="btn-outline" 
                onClick={handleTogglePause}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600',
                  color: isPaused ? '#FE8084' : '', 
                  borderColor: isPaused ? '#FE8084' : '' 
                }}
              >
                <PauseCircle size={18} /> 
                {isPaused ? `Paused until ${new Date(firm.pausedUntil).toLocaleDateString()}` : 'Pause all contact'}
              </button>

              <button 
                className="btn-outline" 
                onClick={() => document.getElementById('quick-task-input').focus()} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#514EF3', borderColor: '#514EF3' }}
              >
                <CalendarClock size={18} /> Follow up needed
              </button>
            </div>
          </div>
        </div>

        {/* 4-Quadrant Grid */}
        <div className="profile-grid">
          
          {/* Contacts */}
          <div className="profile-card">
            <div className="profile-card-header">Contacts</div>
            <div className="profile-card-body">
              <table className="custom-table" style={{ marginTop: 0 }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0 10px 10px 10px' }}>Name</th>
                    <th style={{ padding: '0 10px 10px 10px' }}>Position</th>
                    <th style={{ padding: '0 10px 10px 10px' }}>Email</th>
                    <th style={{ padding: '0 10px 10px 10px' }}>Phone</th>
                    <th style={{ padding: '0 10px 10px 10px' }}>Tag</th>
                  </tr>
                </thead>
                <tbody>
                  {profileContacts.map(c => (
                    <tr key={c.id}>
                      <td style={{ padding: '15px 10px', color: '#7E92A2' }}>{c.name}</td>
                      <td style={{ padding: '15px 10px', color: '#7E92A2' }}>{c.position}</td>
                      <td style={{ padding: '15px 10px', color: '#7E92A2' }}>{c.email}</td>
                      <td style={{ padding: '15px 10px', color: '#7E92A2' }}>{c.phoneNumber}</td>
                      <td style={{ padding: '15px 10px' }}>
                        {c.isPrimary && <span style={{ background: '#E0E7FF', color: '#514EF3', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>PRIMARY</span>}
                      </td>
                    </tr>
                  ))}
                  {profileContacts.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#7E92A2' }}>No contacts found. Use edit menu to add.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SPLIT CARD: Notes & Action Items */}
          <div className="profile-card">
            <div className="profile-card-header">Notes & Action Items</div>
            <div className="profile-card-body" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
              
              {/* Top Half: Scratchpad */}
              <div style={{ flex: '1', borderBottom: '1px solid #EAEEF4', background: '#F8F9FA' }}>
                <textarea 
                  value={localDetails}
                  onChange={(e) => setLocalDetails(e.target.value)}
                  onBlur={handleDetailsBlur}
                  placeholder="Type quick notes, quirks, or random details here... (Auto-saves)"
                  style={{ width: '100%' , height: '100%', minHeight: '120px', border: 'none', background: 'transparent', boxSizing: 'border-box' , padding: '20px', resize: 'none', fontFamily: 'inherit', color: '#092C4C', outline: 'none' }}
                />
              </div>

              {/* Bottom Half: To-Do List */}
              <div style={{ flex: '1.2', padding: '20px', overflowY: 'auto', background: 'white' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#092C4C', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Next Steps / To-Do</h4>
                
                {/* Task Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <Plus size={18} color="#7E92A2" />
                  <input 
                    id="quick-task-input"
                    type="text" 
                    placeholder="Press 'Enter' to save task..." 
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    onKeyDown={handleAddTask}
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#092C4C' }}
                  />
                </div>

                {/* Task List */}
                {profileTasks.map(task => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px', padding: '8px', borderRadius: '8px', background: task.isDone ? '#F6FAFD' : 'white', transition: 'all 0.2s' }}>
                    <button onClick={() => toggleTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '2px', color: task.isDone ? '#2DC8A8' : '#7E92A2' }}>
                      {task.isDone ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                    <span style={{ flex: 1, fontSize: '14px', color: task.isDone ? '#7E92A2' : '#092C4C', textDecoration: task.isDone ? 'line-through' : 'none' }}>
                      {task.desc}
                    </span>
                    <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FE8084', opacity: 0.5 }}>
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Contracts */}
          <div className="profile-card">
            <div className="profile-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Contracts
              <button
                onClick={() => setIsAddContractOpen(true)}
                style={{ background: '#F0F0FE', border: 'none', color: '#514EF3', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontWeight: 'bold', padding: '6px 12px', borderRadius: '6px' }}
              >
                <Plus size={14} /> Add Contract
              </button>
            </div>
            <div className="profile-card-body">
              {profileContracts.map((contract) => (
                <div key={contract.id} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <p style={{ fontWeight: '600', margin: 0, color: '#092C4C' }}>{contract.name}</p>
                    <button onClick={() => promptDeleteContract(contract.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FE8084', opacity: 0.6 }}>
                      <Trash size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                    {['Accepted', 'Legal info', 'Contract sent', 'Signed by them', 'Signed by us', 'Promo delivered', 'Got Paid'].map((step) => (
                      <label key={step} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#526477', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={contract.steps?.includes(step) || false}
                          onChange={(e) => handleStepToggle(contract.id, step, e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        {step}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {profileContracts.length === 0 && (
                <p style={{ color: '#7E92A2' }}>No contracts active.</p>
              )}
            </div>
          </div>

          {/* History */}
          <div className="profile-card">
            <div className="profile-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Past History
              <button 
                onClick={() => setIsAddActivityOpen(true)}
                style={{ background: '#F0F0FE', border: 'none', color: '#514EF3', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontWeight: 'bold', padding: '6px 12px', borderRadius: '6px' }}
              >
                <Plus size={14} /> Log Activity
              </button>
            </div>
            <div className="profile-card-body">
              {profileHistory.map((hist, i) => {
                const isOld = new Date(hist.timestamp).getFullYear() < currentYear;

                return (
                  <div key={i} style={{ display: 'flex', marginBottom: '20px', gap: '15px', opacity: isOld ? 0.6 : 1, transition: 'opacity 0.2s', position: 'relative' }}>
                    <div style={{ width: '8px', height: '8px', background: isOld ? '#7E92A2' : '#514EF3', borderRadius: '50%', marginTop: '5px' }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: isOld ? '#7E92A2' : '#092C4C' }}>{hist.type}</strong>
                          <span style={{ fontSize: '12px', color: '#7E92A2', fontWeight: isOld ? 'normal' : 'bold', marginLeft: '10px' }}>{hist.timestamp ? new Date(hist.timestamp).toLocaleDateString() : ''}</span>
                        </div>
                        
                        <button 
                          onClick={() => promptDeleteHistory(hist)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FE8084', opacity: 0.4 }} 
                          title="Delete Log"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                      <p style={{ margin: '5px 0', fontSize: '14px', color: '#526477' }}>{hist.details}</p>
                      {hist.author && <p style={{ margin: 0, fontSize: '12px', color: '#7E92A2' }}>by {hist.author}</p>}
                    </div>
                  </div>
                )
              })}
              {profileHistory.length === 0 && (
                <p style={{ color: '#7E92A2' }}>No past history recorded.</p>
              )}
            </div>
          </div>

        </div>
        
        {/* Modals */}
        {isEditModalOpen && (
          <EditFirm firm={firm} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveEdit} onOpenContacts={openContactManager} />
        )}
        {isContactManagerOpen && (
          <ContactManager firm={firm} firms={firms} setFirms={setFirms} onClose={() => setIsContactManagerOpen(false)} />
        )}

        {/* INLINED MODALS (Better Performance) */}
        {isAddActivityOpen && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ width: '400px' }}>
              <button className="modal-close" onClick={() => setIsAddActivityOpen(false)}>✖</button>
              <h3 style={{ margin: '0 0 20px 0', color: '#092C4C' }}>Record Past Activity</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#092C4C' }}>Activity Type</label>
                  <select className="form-input" value={activityData.type} onChange={(e) => setActivityData({...activityData, type: e.target.value})}>
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#092C4C' }}>Date Occurred</label>
                  <input type="date" className="form-input" value={activityData.date} onChange={(e) => setActivityData({...activityData, date: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#092C4C' }}>Description</label>
                  <textarea 
                    className="form-input" rows="4" placeholder="What was discussed?"
                    value={activityData.desc} onChange={(e) => setActivityData({...activityData, desc: e.target.value})} 
                    style={{ resize: 'none', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px' }}>
                <button className="btn-cancel" onClick={() => setIsAddActivityOpen(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveActivity}>Save Activity</button>
              </div>
            </div>
          </div>
        )}

        {isPauseModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ width: '380px' }}>
              <button className="modal-close" onClick={() => setIsPauseModalOpen(false)}>✖</button>
              <h3 style={{ margin: '0 0 20px 0', color: '#092C4C' }}>{isPaused ? 'Edit Pause Date' : 'Pause Contact'}</h3>
              
              <p style={{ fontSize: '14px', color: '#7E92A2', marginBottom: '20px' }}>
                Select a date. This firm will be visually greyed out in your databases until the selected date passes.
              </p>

              <input 
                type="date" 
                className="form-input" 
                value={pauseDate} 
                onChange={(e) => setPauseDate(e.target.value)} 
                min={new Date().toISOString().split('T')[0]} 
                style={{ width: '100%', marginBottom: '30px' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                <button className="btn-cancel" onClick={() => setIsPauseModalOpen(false)}>Cancel</button>
                {isPaused && (
                  <button className="btn-danger" onClick={handleResumePause}>Remove Pause</button>
                )}
                <button className="btn-primary" onClick={handleSavePause} disabled={!pauseDate}>
                  {isPaused ? 'Update Date' : 'Confirm Pause'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete History Confirmation Modal */}
        {isDeleteHistoryModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ width: '420px', textAlign: 'center', padding: '40px 30px' }}>
              <button className="modal-close" onClick={cancelDeleteHistory}>✖</button>
              
              <h3 style={{ color: '#092C4C', marginTop: '10px', fontSize: '20px', lineHeight: '1.4' }}>
                Are you sure you want to delete<br/>this history log?
              </h3>
              
              <p style={{ color: '#7E92A2', fontSize: '14px', lineHeight: '1.6', margin: '20px 0 30px 0', padding: '0 10px' }}>
                This action cannot be undone. The activity record will be permanently removed from this company's history.
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <button className="btn-cancel" onClick={cancelDeleteHistory}>Cancel</button>
                <button className="btn-danger" onClick={confirmDeleteHistory}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Company Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ width: '420px', textAlign: 'center', padding: '40px 30px' }}>
              <button className="modal-close" onClick={() => setIsDeleteModalOpen(false)}>✖</button>
              
              <h3 style={{ color: '#092C4C', marginTop: '10px', fontSize: '20px', lineHeight: '1.4' }}>
                Are you sure you want to delete<br/>this Company?
              </h3>
              
              <p style={{ color: '#7E92A2', fontSize: '14px', lineHeight: '1.6', margin: '20px 0 30px 0', padding: '0 10px' }}>
                Deleting the Company will permanently erase all information and possible history recordings of this Company.
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <button className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                <button className="btn-danger" onClick={handleConfirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Contract Modal */}
        {isAddContractOpen && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ width: '380px' }}>
              <button className="modal-close" onClick={() => setIsAddContractOpen(false)}>✖</button>
              <h3 style={{ margin: '0 0 20px 0', color: '#092C4C' }}>Add Contract</h3>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#092C4C' }}>Select Event</label>
              <select
                className="form-input"
                value={selectedNewEventId}
                onChange={(e) => setSelectedNewEventId(e.target.value)}
              >
                <option value="">— choose event —</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name}</option>
                ))}
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px' }}>
                <button className="btn-cancel" onClick={() => setIsAddContractOpen(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleAddContract} disabled={!selectedNewEventId}>Add</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Contract Confirmation Modal */}
        {pendingDeleteContractId && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ width: '420px', textAlign: 'center', padding: '40px 30px' }}>
              <button className="modal-close" onClick={cancelDeleteContract}>✖</button>
              <h3 style={{ color: '#092C4C', marginTop: '10px', fontSize: '20px', lineHeight: '1.4' }}>
                Are you sure you want to delete<br/>this contract?
              </h3>
              <p style={{ color: '#7E92A2', fontSize: '14px', lineHeight: '1.6', margin: '20px 0 30px 0', padding: '0 10px' }}>
                This action cannot be undone.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <button className="btn-cancel" onClick={cancelDeleteContract}>Cancel</button>
                <button className="btn-danger" onClick={confirmDeleteContract}>Delete</button>
              </div>
            </div>
          </div>
        )}

      </main>
      <MobileNav currentUser={currentUser} />
    </div>
  );
}

export default FirmProfile;