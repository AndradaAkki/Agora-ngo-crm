import React from 'react';
import { useAddFirmLogic } from './useAddFirmLogic';

function AddFirm({ onClose }) {
  // Bind the ViewModel hook to the UI
  const { formData, handleChange, handleSubmit, isLoading, error } = useAddFirmLogic({ onClose });

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} disabled={isLoading}>✖</button>
        <h3 style={{ margin: '0 0 20px 0', color: '#092C4C' }}>Add New Company</h3>
        
        {error && <p style={{ color: 'red', fontSize: '13px' }}>Error saving: {error.message}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label htmlFor="company-name" style={{ fontSize: '13px', fontWeight: 'bold', color: '#092C4C' }}>Name</label>
              <input id="company-name" type="text" className="form-input" required
                value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
            </div>
            <div>
              <label htmlFor="company-status" style={{ fontSize: '13px', fontWeight: 'bold', color: '#092C4C' }}>Status</label>
              <select id="company-status" className="form-input" 
                value={formData.status} onChange={(e) => handleChange('status', e.target.value)}>
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
                value={formData.contactName} onChange={(e) => handleChange('contactName', e.target.value)} />
            </div>
            <div>
              <label htmlFor="contact-position" style={{ fontSize: '13px', fontWeight: 'bold', color: '#092C4C' }}>Position</label>
              <input id="contact-position" type="text" className="form-input" 
                value={formData.position} onChange={(e) => handleChange('position', e.target.value)} />
            </div>
            <div>
              <label htmlFor="contact-email" style={{ fontSize: '13px', fontWeight: 'bold', color: '#092C4C' }}>Email</label>
              <input id="contact-email" type="email" className="form-input" required
                value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
            </div>
            <div>
              <label htmlFor="contact-phone" style={{ fontSize: '13px', fontWeight: 'bold', color: '#092C4C' }}>Phone</label>
              <input id="contact-phone" type="text" className="form-input" 
                value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
            <button type="button" onClick={onClose} disabled={isLoading} style={{ background: 'none', border: 'none', color: '#526477', cursor: 'pointer', fontWeight: 'bold' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddFirm;