import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

export const ADD_CONTACT = gql`
  mutation AddContact($firmId: ID!, $name: String!, $email: String!, $position: String, $phone: String) {
    addContact(firmId: $firmId, name: $name, email: $email, position: $position, phone: $phone) { id }
  }
`;

export const UPDATE_CONTACT = gql`
  mutation UpdateContact($firmId: ID!, $contactId: ID!, $name: String, $email: String, $position: String, $phone: String) {
    updateContact(firmId: $firmId, contactId: $contactId, name: $name, email: $email, position: $position, phone: $phone) { id }
  }
`;

export const DELETE_CONTACT = gql`
  mutation DeleteContact($firmId: ID!, $contactId: ID!) {
    deleteContact(firmId: $firmId, contactId: $contactId) { id }
  }
`;

export function useContactManagerLogic({ firm, onUpdateFirm, onClose }) {
  const profileContacts = firm.contacts || [];
  const [editableContacts, setEditableContacts] = useState([...profileContacts]);

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
      id: Date.now(), 
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
    if (onUpdateFirm) {
        onUpdateFirm({ ...firm, contacts: editableContacts });
    }

    const currentIds = editableContacts.map(c => c.id);
    const deletedContacts = profileContacts.filter(c => !currentIds.includes(c.id));
    const addedContacts = editableContacts.filter(c => typeof c.id === 'number'); // Cele noi au ID tip timestamp
    const updatedContacts = editableContacts.filter(c => typeof c.id === 'string'); // Cele vechi au ID string din GraphQL

    try {
      // Stergeri
      for (const c of deletedContacts) {
        await deleteContact({ variables: { firmId: firm.id, contactId: String(c.id) }});
      }
      // Adaugari
      for (const c of addedContacts) {
        if (c.name) { 
          await addContact({ variables: { firmId: firm.id, name: c.name, email: c.email || "no-email@test.com", position: c.position, phone: c.phone }});
        }
      }
      // Actualizari
      for (const c of updatedContacts) {
        await updateContact({ variables: { firmId: firm.id, contactId: String(c.id), name: c.name, email: c.email, position: c.position, phone: c.phone }});
      }
    } catch (e) {
      console.error("Error saving contacts to backend:", e);
    }
    
    onClose();
  };

  return {
    editableContacts,
    handleCellChange,
    handleAddContact,
    handleDeleteContact,
    handleSaveContacts
  };
}