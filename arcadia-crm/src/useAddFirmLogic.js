import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { GET_FIRMS } from './useAppLogic';

// Update this mutation to match the exact arguments your backend resolver expects
export const ADD_FIRM = gql`
  mutation AddFirm($name: String!, $email: String!, $status: String, $contactName: String, $position: String, $phone: String) {
    addFirm(name: $name, email: $email, status: $status, contactName: $contactName, position: $position, phone: $phone) {
      id
      name
      email
      status
    }
  }
`;

export function useAddFirmLogic({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    status: 'In Progress',
    contactName: '',
    position: '',
    email: '',
    phone: ''
  });

  const [addFirm, { loading, error }] = useMutation(ADD_FIRM, {
    // This magically refreshes your dashboard list so the new company appears instantly!
    refetchQueries: [{ query: GET_FIRMS, variables: { page: 1, limit: 15 } }],
    onCompleted: () => {
      onClose(); // Close the modal only after the database confirms the save
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      try {
        await addFirm({ variables: { ...formData } });
      } catch (err) {
        console.error("Error saving company:", err);
      }
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    isLoading: loading,
    error
  };
}