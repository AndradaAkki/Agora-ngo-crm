import { useState } from 'react';
import { Plus, Trash } from 'lucide-react';
// Explicit imports to bypass Vite caching
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';
import './App.css';

const ADD_CONTACT = gql`
  mutation AddContact($firmId: ID!, $name: String!, $email: String!, $position: String, $phone: String) {
    addContact(firmId: $firmId, name: $name, email: $email, position: $position, phone: $phone) { id }
  }
`;

const UPDATE_CONTACT = gql`
  mutation UpdateContact($firmId: ID!, $contactId: ID!, $name: String, $email: String, $position: String, $phone: String) {
    updateContact(firmId: $firmId, contactId: $contactId, name: $name, email: $email, position: $position, phone: $phone) { id }
  }
`;

const DELETE_CONTACT = gql`
  mutation DeleteContact($firmId: ID!, $contactId: ID!) {
    deleteContact(firmId: $firmId, contactId: $contactId) { id }
  }
`;

// Added onUpdateFirm to your props so it can instantly update the UI
function ContactManager({ firm, onUpdateFirm, onClose }) {
  const profileContacts = firm.contacts || [];
  const [editableContacts, setEditableContacts] = useState([...profileContacts]);

  // GraphQL Mutations
  const [addContact] = useMutation(ADD_CONTACT);
  const [updateContact] = useMutation(UPDATE_CONTACT);
  const [deleteContact] = useMutation(DELETE_CONTACT);

  const handleCellChange = (id, field, value) => {
    setEditableContacts(editableContacts.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleAddContact = () => {
    const newContact = { 
      id: Date.now(), // Temporary ID for the UI
      name: '', 
      position: '', 
      email: '', 
      phone: '', 
      isPrimary: editableContacts.length === 0
    };
    setEditableContacts([...editableContacts, newContact]);
  };

  const handleDeleteContact = (id) => {
    setEditableContacts(editableContacts.filter(c => c.id !== id));
  };

  const handleSaveContacts = async () => {
    // 1. Instantly update the React UI (optimistic update)
    if (onUpdateFirm) {
        onUpdateFirm({ ...firm, contacts: editableContacts });
    }

    // 2. Sort out what needs to go to the Database
    const currentIds = editableContacts.map(c => c.id);
    const deletedContacts = profileContacts.filter(c => !currentIds.includes(c.id));
    const addedContacts = editableContacts.filter(c => typeof c.id === 'number'); // New ones have timestamp numbers
    const updatedContacts = editableContacts.filter(c => typeof c.id === 'string'); // Old ones have string IDs from GraphQL

    try {
      // Execute deletions
      for (const c of deletedContacts) {
        await deleteContact({ variables: { firmId: firm.id, contactId: String(c.id) }});
      }
      // Execute additions
      for (const c of addedContacts) {
        if (c.name) { 
          await addContact({ variables: { firmId: firm.id, name: c.name, email: c.email || "no-email@test.com", position: c.position, phone: c.phone }});
        }
      }
      // Execute updates
      for (const c of updatedContacts) {
        await updateContact({ variables: { firmId: firm.id, contactId: String(c.id), name: c.name, email: c.email, position: c.position, phone: c.phone }});
      }
    } catch (e) {
      console.error("Error saving contacts to backend:", e);
    }
    
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '800px', maxWidth: '90vw' }}>
        <button className="modal-close" onClick={onClose}>✖</button>
        <h3 style={{ margin: '0 0 20px 0', color: '#092C4C' }}>Manage Contacts for {firm.name}</h3>
        
        <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
          <table className="custom-table" style={{ margin: 0, width: '100%' }}>
            <thead>
              <tr>
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
                    <input type="text" className="form-input" style={{ margin: 0 }} value={contact.phone} onChange={(e) => handleCellChange(contact.id, 'phone', e.target.value)} />
                  </td>
                  <td style={{ padding: '5px', textAlign: 'center' }}>
                    <button onClick={() => handleDeleteContact(contact.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FE8084' }}>
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
    </div>
  );
}

export default ContactManager;