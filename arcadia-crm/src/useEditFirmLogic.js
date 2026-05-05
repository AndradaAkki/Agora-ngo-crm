import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useMutation} from '@apollo/client/react';

// 1. Define the GraphQL Mutation to update the database
export const UPDATE_FIRM = gql`
  mutation UpdateFirm($id: ID!, $name: String, $status: String, $assignedCD: String) {
    updateFirm(id: $id, name: $name, status: $status, assignedCD: $assignedCD) {
      id
      name
      status
      assignedCD
    }
  }
`;

export function useEditFirmLogic({ firm, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    status: '',
    assignedCD: 'nobody'
  });

  // 2. Pre-fill the form with the existing firm data
  useEffect(() => {
    if (firm) {
      setFormData({
        name: firm.name || '',
        status: firm.status || 'In Progress',
        assignedCD: firm.assignedCD || 'nobody'
      });
    }
  }, [firm]);

  // 3. Initialize the Apollo Mutation
  const [updateFirm, { loading, error }] = useMutation(UPDATE_FIRM, {
    onCompleted: (data) => {
      // Once the database successfully updates, we tell the UI to close the modal
      // and update the screen with the new data.
      onSave({ ...firm, ...data.updateFirm });
    },
    onError: (err) => {
      console.error("Error updating firm:", err);
    }
  });

  // 4. Handle the form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Trigger the GraphQL mutation
    updateFirm({
      variables: {
        id: firm.id,
        name: formData.name,
        status: formData.status,
        assignedCD: formData.assignedCD
      }
    });
  };

  return {
    formData,
    setFormData,
    handleSubmit,
    isSaving: loading,
    saveError: error
  };
}