import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Bell, Settings, Calendar, Home, Plus, Users, Copy, Activity, Table as TableIcon, PieChart as ChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as PieTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip } from 'recharts';
import './App.css';

function EventsStats({ firms }) {
  const navigate = useNavigate();

  // --- STATE ---
  const [selectedEvent, setSelectedEvent] = useState('All Events');
  const [viewType, setViewType] = useState('chart'); // 'chart' or 'table'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // State for the new event form
  const [newEventData, setNewEventData] = useState({ name: '', date: '', description: '' });
  const [customEvents, setCustomEvents] = useState([]); // Stores manually added events

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

  // Pie Chart Data
  const acceptedCount = filteredFirms.filter(f => f.status === 'Accepted').length;
  const waitingCount = filteredFirms.filter(f => f.status === 'In Progress').length;
  const refusedCount = filteredFirms.filter(f => f.status === 'Rejected').length;
  
  const PIE_COLORS = { Accepted: '#2DC8A8', Waiting: '#FFC357', Refused: '#FE8084' };
  const pieData = [
    { name: 'Accepted', value: acceptedCount, color: PIE_COLORS.Accepted },
    { name: 'Waiting', value: waitingCount, color: PIE_COLORS.Waiting },
    { name: 'Refused', value: refusedCount, color: PIE_COLORS.Refused },
  ];

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

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-box" style={{ marginBottom: '30px' }}>
           <div style={{ width: '40px', height: '40px', background: '#092C4C', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Building2 color="white" size={24} />
           </div>
        </div>
        <nav className="sidebar-menu">
          <Home className="menu-icon" onClick={() => navigate('/')} title="Home" />
          <LayoutDashboard className="menu-icon" onClick={() => navigate('/dashboard')} title="Dashboard" />
          <Calendar className="menu-icon active" title="Events & Stats" />
          <Building2 className="menu-icon" onClick={() => navigate('/firms')} title="My Firms" />
          <Bell className="menu-icon" />
          <Settings className="menu-icon" />
        </nav>
      </aside>

      <main className="main-content animate-fade-in" style={{ background: '#F8FAFC', padding: '40px 60px', overflowY: 'auto', height: '100vh' }}>
        
        {/* Header */}
        <header className="dashboard-header" style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '45px', height: '45px', background: '#092C4C', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Copy color="white" size={20} />
            </div>
            <h1 style={{ color: '#092C4C', margin: 0 }}>{selectedEvent}</h1>
          </div>
          <div className="header-right">
            <button className="btn-primary" onClick={() => setIsAddModalOpen(true)} style={{ background: '#514EF3', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Add New Event <Plus size={16} />
            </button>
            
            <select 
              className="btn-outline" 
              style={{ background: 'white', padding: '10px 16px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', color: '#092C4C', fontWeight: '600' }}
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              {availableEvents.map(eventName => (
                <option key={eventName} value={eventName}>{eventName}</option>
              ))}
            </select>

            <img src="https://i.pravatar.cc/150?u=andra" alt="User" className="avatar" />
          </div>
        </header>

        {/* Sub-header Controls */}
        <div style={{ marginBottom: '30px' }}>
          <button 
            className="btn-outline" 
            onClick={() => setViewType(viewType === 'chart' ? 'table' : 'chart')}
            style={{ background: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
          >
            Change View Type {viewType === 'chart' ? <TableIcon size={16} /> : <ChartIcon size={16} />}
          </button>
        </div>

        {/* --- DYNAMIC VIEW PORTION --- */}
        {viewType === 'chart' ? (
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            {/* Left Column: Stats & Pie Chart */}
            <div style={{ flex: '1', minWidth: '350px' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', marginBottom: '30px' }}>
                <div>
                  <p style={{ color: '#7E92A2', margin: '0 0 5px 0', fontSize: '16px' }}>Total Companies</p>
                  <h2 style={{ color: '#092C4C', margin: 0, fontSize: '48px', fontWeight: 'bold' }}>{filteredFirms.length}</h2>
                </div>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#d2f7ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users color="#2DC8A8" size={30} />
                </div>
              </div>

              <div style={{ height: '350px', width: '100%', background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#092C4C', fontSize: '16px' }}>Status Distribution</h3>
                {filteredFirms.length > 0 ? (
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie data={pieData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={0} outerRadius={100} dataKey="value" stroke="none">
                        {pieData.filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <PieTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="middle" layout="vertical" align="right" iconType="circle" wrapperStyle={{ fontSize: '14px', color: '#526477' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7E92A2' }}>No data available.</div>
                )}
              </div>
            </div>

            {/* Right Column: Activity Bar Chart */}
            <div style={{ flex: '1.5', minWidth: '450px' }}>
              <div style={{ height: '525px', width: '100%', background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                  <div style={{ width: '35px', height: '35px', borderRadius: '8px', background: '#F0F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity color="#514EF3" size={18} />
                  </div>
                  <h3 style={{ margin: 0, color: '#092C4C', fontSize: '16px' }}>Activity Breakdown</h3>
                </div>

                {activityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEEF4" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7E92A2', fontSize: 13 }} dy={10} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#7E92A2', fontSize: 13 }} />
                      <BarTooltip cursor={{ fill: '#F6FAFD' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="actions" fill="#E2DDF5" radius={[6, 6, 0, 0]} barSize={60}>
                        {activityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#514EF3' : '#EAE6DB'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7E92A2' }}>No activities recorded.</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="table-wrapper animate-fade-in" style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <table className="custom-table" style={{ marginTop: 0 }}>
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Status</th>
                  <th>Assigned CD</th>
                  <th>Contact Info</th>
                </tr>
              </thead>
              <tbody>
                {filteredFirms.length > 0 ? filteredFirms.map((firm) => (
                  <tr key={firm.id} className="table-row">
                    <td className="firm-name-cell"><strong>{firm.name}</strong></td>
                    <td>
                      <span className={`status-badge status-${firm.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {firm.status}
                      </span>
                    </td>
                    <td style={{ color: '#526477', fontSize: '14px' }}>{firm.assignedCD || 'Nobody'}</td>
                    <td style={{ color: '#526477', fontSize: '14px' }}>{firm.email}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#7E92A2' }}>No companies associated with this event.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            style={{ background: '#FBEAEA', color: '#FE8084', border: 'none', padding: '12px 24px', borderRadius: '70px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            End event and record history <Copy size={16} />
          </button>
        </div>

        {/* --- ADD EVENT MODAL --- */}
        {isAddModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ width: '400px', padding: '30px' }}>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>✖</button>
              <h3 style={{ margin: '0 0 25px 0', color: '#092C4C' }}>Add Event</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Name" 
                  value={newEventData.name} 
                  onChange={e => setNewEventData({...newEventData, name: e.target.value})} 
                />
                <input 
                  type="date" 
                  className="form-input" 
                  value={newEventData.date} 
                  onChange={e => setNewEventData({...newEventData, date: e.target.value})} 
                  style={{ color: newEventData.date ? '#092C4C' : '#7E92A2' }}
                />
                
                <div style={{ marginTop: '10px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#092C4C', display: 'block', marginBottom: '8px' }}>Description</label>
                  <textarea 
                    className="form-input" 
                    placeholder="Optional" 
                    rows="3"
                    value={newEventData.description} 
                    onChange={e => setNewEventData({...newEventData, description: e.target.value})} 
                    style={{ resize: 'none', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ color: '#FE8084', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                >
                  Delete
                </button>
                <button className="btn-primary" style={{ background: '#514EF3', padding: '10px 30px' }} onClick={handleAddEvent}>
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- DELETE EVENT MODAL --- */}
        {isDeleteModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ width: '420px', padding: '40px 30px', textAlign: 'left' }}>
              <button className="modal-close" onClick={() => setIsDeleteModalOpen(false)}>✖</button>
              
              <h3 style={{ color: '#092C4C', marginTop: '0', fontSize: '18px', lineHeight: '1.4' }}>
                Are you sure you want to delete<br/>this Event?
              </h3>
              
              <p style={{ color: '#7E92A2', fontSize: '14px', lineHeight: '1.6', margin: '20px 0 10px 0' }}>
                Deleting the Event will permanently erase all possibility to select this event in the context menu, therefore adding any additional contracts.
              </p>
              <p style={{ color: '#7E92A2', fontSize: '14px', lineHeight: '1.6', margin: '0 0 30px 0' }}>
                Furthermore, all interactions associated with this event will be automatically recorded in the history section of each company.
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  className="btn-cancel" 
                  onClick={() => setIsDeleteModalOpen(false)}
                  style={{ color: '#092C4C', padding: '0' }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-danger" 
                  onClick={handleDeleteEvent}
                  style={{ padding: '10px 30px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default EventsStats;