import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';

const GET_USERS = gql`
  query GetUsers {
    getUsers { id username email displayName role isAdmin avatarUrl }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($username: String!, $email: String!, $password: String!, $displayName: String, $role: String!) {
    createUser(username: $username, email: $email, password: $password, displayName: $displayName, role: $role) {
      id username email displayName role isAdmin
    }
  }
`;

const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $role: String!) {
    updateUserRole(userId: $userId, role: $role) { id username email displayName role isAdmin }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId) { id }
  }
`;

const ROLES = ['Externe CD', 'General CD', 'ADMIN'];

export function useUsersAdminLogic() {
  const navigate = useNavigate();
  const { data, loading } = useQuery(GET_USERS);
  const [createUser] = useMutation(CREATE_USER, { refetchQueries: [{ query: GET_USERS }] });
  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);
  const [deleteUser] = useMutation(DELETE_USER, { refetchQueries: [{ query: GET_USERS }] });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '', role: 'Externe CD' });
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleFormChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.username || !form.email || !form.password) {
      setFormError('Username, email and password are required.');
      return;
    }
    try {
      await createUser({ variables: form });
      setForm({ username: '', email: '', password: '', displayName: '', role: 'Externe CD' });
      setShowForm(false);
    } catch (err) {
      setFormError(err.message || 'Failed to create user.');
    }
  };

  const handleRoleChange = async (userId, role) => {
    await updateUserRole({ variables: { userId, role } });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteUser({ variables: { userId: deleteTarget } });
    setDeleteTarget(null);
  };

  return {
    navigate,
    users: data?.getUsers || [],
    loading,
    showForm, setShowForm,
    form, handleFormChange,
    formError,
    handleCreate,
    handleRoleChange,
    deleteTarget, setDeleteTarget,
    handleDelete,
    ROLES,
  };
}
