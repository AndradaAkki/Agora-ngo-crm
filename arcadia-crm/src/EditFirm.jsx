import { useState, useEffect } from 'react';

function EditFirm({ firm, onSave, onClose, onOpenContacts }) {
  const [formData, setFormData] = useState({
    name: '',
    status: '',
    assignedCD: 'nobody'
  });

  useEffect(() => {
    if (firm) {
      setFormData({
        name: firm.name || '',
        status: firm.status || 'In Progress',
        assignedCD: firm.assignedCD || 'nobody'
      });
    }
  }, [firm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...firm, ...formData });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✖</button>
        <h3 style={{ margin: '0 0 20px 0', color: '#092C4C' }}>Edit Company Details</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label htmlFor="edit-name" style={{ fontSize: '13px', fontWeight: 'bold', color: '#092C4C' }}>Name</label>
              <input id="edit-name" type="text" className="form-input" required
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label htmlFor="edit-status" style={{ fontSize: '13px', fontWeight: 'bold', color: '#092C4C' }}>Status</label>
              <select id="edit-status" className="form-input" 
                value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                <option value="In Progress">In Progress</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: '20px' }}>
            <div>
              <label htmlFor="edit-cd" style={{ fontSize: '13px', fontWeight: 'bold', color: '#092C4C' }}>Assign to CD Member</label>
              <select id="edit-cd" className="form-input" 
                value={formData.assignedCD} onChange={(e) => setFormData({...formData, assignedCD: e.target.value})}>
                <option value="nobody">Nobody</option>
                <option value="Alex Thompson">Alex Thompson</option>
                <option value="Sarah Johnson">Sarah Johnson</option>
                <option value="Mike Davis">Mike Davis</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                type="button" 
                className="btn-outline" 
                style={{ width: '100%', height: '37px', fontWeight: 'bold' }} 
                onClick={onOpenContacts}
              >
                Edit Contacts
              </button>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#526477', cursor: 'pointer', fontWeight: 'bold' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditFirm;