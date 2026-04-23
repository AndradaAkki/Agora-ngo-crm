import { useState } from 'react';

function AddFirm({ onAddFirm, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    status: 'In Progress',
    contactName: '',
    position: '',
    email: '',
    phone: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      const newFirm = {
        name: formData.name,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        lastContact: new Date().toISOString().split('T')[0],
        details: 'Newly added from dashboard.'
      };
      
      onAddFirm(newFirm); // Sends data to App.jsx offline queue
      onClose(); 
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✖</button>
        <h3 style={{ margin: '0 0 20px 0', color: '#092C4C' }}>Add New Company</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label htmlFor="company-name" style={{ fontSize: '13px', fontWeight: 'bold', color: '#092C4C' }}>Name</label>
              <input id="company-name" type="text" className="form-input" required
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label htmlFor="company-status" style={{ fontSize: '13px', fontWeight: 'bold', color: '#092C4C' }}>Status</label>
              <select id="company-status" className="form-input" 
                value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                <option value="In Progress">In Progress</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <h4 style={{ marginTop: '25px', marginBottom: '10px', fontSize: '14px', color: '#092C4C' }}>Primary Contact</h4>
          <div className="form-grid">
            <div>
              <label htmlFor="contact-name" style={{ fontSize: '13px', fontWeight: 'bold', color: '#092C4C' }}>Name</label>
              <input id="contact-name" type="text" className="form-input" 
                value={formData.contactName} onChange={(e) => setFormData({...formData, contactName: e.target.value})} />
            </div>
            <div>
              <label htmlFor="contact-position" style={{ fontSize: '13px', fontWeight: 'bold', color: '#092C4C' }}>Position</label>
              <input id="contact-position" type="text" className="form-input" 
                value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} />
            </div>
            <div>
              <label htmlFor="contact-email" style={{ fontSize: '13px', fontWeight: 'bold', color: '#092C4C' }}>Email</label>
              <input id="contact-email" type="email" className="form-input" required
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label htmlFor="contact-phone" style={{ fontSize: '13px', fontWeight: 'bold', color: '#092C4C' }}>Phone</label>
              <input id="contact-phone" type="text" className="form-input" 
                value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#526477', cursor: 'pointer', fontWeight: 'bold' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddFirm;