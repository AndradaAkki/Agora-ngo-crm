import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';

const GET_USERS = gql`
  query GetUsers {
    getUsers { id displayName role }
  }
`;

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

  // 2. Fetch all users for the CD dropdown
  const { data: usersData } = useQuery(GET_USERS);
  const users = usersData?.getUsers ?? [];

  // 3. Pre-fill the form. assignedCD from getFirms is already a User UUID.
  useEffect(() => {
    if (!firm) return;
    setFormData({
      name: firm.name || '',
      status: firm.status || 'In Progress',
      assignedCD: firm.assignedCD ?? 'nobody'
    });
  }, [firm]);

  // 4. Initialize the Apollo Mutation
  const [updateFirm, { loading, error }] = useMutation(UPDATE_FIRM, {
    refetchQueries: ['GetFirms'],
    onCompleted: (data) => {
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
    saveError: error,
    users
  };
}