import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

export const ADD_CONTACT = gql`
  mutation AddContact($firmId: ID!, $name: String!, $email: String!, $position: String, $phone: String, $isPrimary: Boolean) {
    addContact(firmId: $firmId, name: $name, email: $email, position: $position, phone: $phone, isPrimary: $isPrimary) { id }
  }
`;

export const UPDATE_CONTACT = gql`
  mutation UpdateContact($firmId: ID!, $contactId: ID!, $name: String, $email: String, $position: String, $phone: String, $isPrimary: Boolean) {
    updateContact(firmId: $firmId, contactId: $contactId, name: $name, email: $email, position: $position, phone: $phone, isPrimary: $isPrimary) { id }
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
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const [addContact] = useMutation(ADD_CONTACT, { refetchQueries: ['GetFirms'] });
  const [updateContact] = useMutation(UPDATE_CONTACT, { refetchQueries: ['GetFirms'] });
  const [deleteContact] = useMutation(DELETE_CONTACT, { refetchQueries: ['GetFirms'] });

  const handleCellChange = (id, field, value) => {
    setEditableContacts(editableContacts.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleSetPrimary = (id) => {
    setEditableContacts(editableContacts.map(c => ({
      ...c,
      isPrimary: c.id === id ? !c.isPrimary : false
    })));
  };

  const handleAddContact = () => {
    const newContact = {
      id: Date.now(),
      name: '',
      position: '',
      email: '',
      phoneNumber: '',
      isPrimary: editableContacts.length === 0
    };
    setEditableContacts([...editableContacts, newContact]);
  };

  const promptDeleteContact = (id) => setPendingDeleteId(id);
  const cancelDeleteContact = () => setPendingDeleteId(null);
  const confirmDeleteContact = () => {
    setEditableContacts(editableContacts.filter(c => c.id !== pendingDeleteId));
    setPendingDeleteId(null);
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
          await addContact({ variables: { firmId: firm.id, name: c.name, email: c.email || "no-email@test.com", position: c.position, phone: c.phoneNumber, isPrimary: c.isPrimary || false }});
        }
      }
      // Actualizari
      for (const c of updatedContacts) {
        await updateContact({ variables: { firmId: firm.id, contactId: String(c.id), name: c.name, email: c.email, position: c.position, phone: c.phoneNumber, isPrimary: c.isPrimary || false }});
      }
    } catch (e) {
      console.error("Error saving contacts to backend:", e);
    }
    
    onClose();
  };

  return {
    editableContacts,
    handleCellChange,
    handleSetPrimary,
    handleAddContact,
    promptDeleteContact,
    cancelDeleteContact,
    confirmDeleteContact,
    pendingDeleteId,
    handleSaveContacts
  };
}