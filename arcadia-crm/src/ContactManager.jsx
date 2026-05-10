import React from 'react';
import { Plus, Trash, Star } from 'lucide-react';
import { useContactManagerLogic } from './useContactManagerLogic';
import './App.css';

function ContactManager({ firm, onUpdateFirm, onClose }) {
  const {
    editableContacts,
    handleCellChange,
    handleSetPrimary,
    handleAddContact,
    promptDeleteContact,
    cancelDeleteContact,
    confirmDeleteContact,
    pendingDeleteId,
    handleSaveContacts
  } = useContactManagerLogic({ firm, onUpdateFirm, onClose });

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '800px', maxWidth: '90vw' }}>
        <button className="modal-close" onClick={onClose}>✖</button>
        <h3 style={{ margin: '0 0 20px 0', color: '#092C4C' }}>Manage Contacts for {firm.name}</h3>
        
        <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
          <table className="custom-table" style={{ margin: 0, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px', width: '40px' }}></th>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px' }}>Position</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Phone</th>
                <th style={{ padding: '10px', width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {editableContacts.map(contact => (
                <tr key={contact.id} style={{ background: 'white' }}>
                  <td style={{ padding: '5px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleSetPrimary(contact.id)}
                      title={contact.isPrimary ? 'Primary contact' : 'Set as primary'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                    >
                      <Star
                        size={16}
                        color={contact.isPrimary ? '#514EF3' : '#C8D4DF'}
                        fill={contact.isPrimary ? '#514EF3' : 'none'}
                      />
                    </button>
                  </td>
                  <td style={{ padding: '5px' }}>
                    <input type="text" className="form-input" style={{ margin: 0 }} value={contact.name} onChange={(e) => handleCellChange(contact.id, 'name', e.target.value)} />
                  </td>
                  <td style={{ padding: '5px' }}>
                    <input type="text" className="form-input" style={{ margin: 0 }} value={contact.position} onChange={(e) => handleCellChange(contact.id, 'position', e.target.value)} />
                  </td>
                  <td style={{ padding: '5px' }}>
                    <input type="text" className="form-input" style={{ margin: 0 }} value={contact.email} onChange={(e) => handleCellChange(contact.id, 'email', e.target.value)} />
                  </td>
                  <td style={{ padding: '5px' }}>
                    <input type="text" className="form-input" style={{ margin: 0 }} value={contact.phoneNumber || ''} onChange={(e) => handleCellChange(contact.id, 'phoneNumber', e.target.value)} />
                  </td>
                  <td style={{ padding: '5px', textAlign: 'center' }}>
                    <button onClick={() => promptDeleteContact(contact.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FE8084' }}>
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn-outline" onClick={handleAddContact} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Add Contact Row
          </button>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSaveContacts}>Save Contacts</button>
          </div>
        </div>
      </div>

      {pendingDeleteId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '420px', textAlign: 'center', padding: '40px 30px' }}>
            <button className="modal-close" onClick={cancelDeleteContact}>✖</button>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#092C4C', marginBottom: '10px' }}>
              Are you sure you want to<br />permanently remove this contact?
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn-cancel" onClick={cancelDeleteContact}>Cancel</button>
              <button className="btn-danger" onClick={confirmDeleteContact}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactManager;