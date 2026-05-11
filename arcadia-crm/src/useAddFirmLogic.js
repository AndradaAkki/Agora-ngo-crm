import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { GET_FIRMS } from './useAppLogic';
import { ADD_CONTACT } from './useContactManagerLogic';

export const ADD_FIRM = gql`
  mutation AddFirm($name: String!, $email: String!, $status: String) {
    addFirm(name: $name, email: $email, status: $status) {
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
    refetchQueries: [{ query: GET_FIRMS, variables: { page: 1, limit: 100 } }]
  });

  const [addContact] = useMutation(ADD_CONTACT);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    try {
      const { data } = await addFirm({
        variables: { name: formData.name, email: formData.email, status: formData.status }
      });
      if (formData.contactName && data?.addFirm?.id) {
        await addContact({
          variables: {
            firmId: data.addFirm.id,
            name: formData.contactName,
            email: formData.email,
            position: formData.position,
            phone: formData.phone,
            isPrimary: true
          }
        });
      }
      onClose();
    } catch (err) {
      console.error("Error saving company:", err);
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