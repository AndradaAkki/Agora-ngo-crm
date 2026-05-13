import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

const UPDATE_AVATAR = gql`
  mutation UpdateAvatar($userId: ID!, $avatarUrl: String!) {
    updateAvatar(userId: $userId, avatarUrl: $avatarUrl) {
      id avatarUrl
    }
  }
`;

const ROLE_STYLES = {
  'ADMIN':       { name: 'Admin',       color: '#FE8084', bg: '#FBEAEA' },
  'General CD':  { name: 'General CD',  color: '#514EF3', bg: '#F0F0FE' },
  'Externe CD':  { name: 'Externe CD',  color: '#2DC8A8', bg: '#d2f7ef' },
};

export function useUserProfileLogic({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [updateAvatarMutation] = useMutation(UPDATE_AVATAR);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      await updateAvatarMutation({ variables: { userId: currentUser.id, avatarUrl: dataUrl } });
      // Update in-memory currentUser so the UI refreshes immediately
      currentUser.avatarUrl = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const [firstName, ...rest] = (currentUser?.displayName ?? '').split(' ');
  const lastName = rest.join(' ');

  const roles = [];
  if (currentUser?.role && ROLE_STYLES[currentUser.role]) {
    roles.push(ROLE_STYLES[currentUser.role]);
  }
  if (currentUser?.isAdmin && currentUser.role !== 'ADMIN') {
    roles.push(ROLE_STYLES['ADMIN']);
  }

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    onLogout();
    navigate('/login');
  };

  return {
    navigate,
    isLogoutModalOpen,
    setIsLogoutModalOpen,
    firstName,
    lastName,
    email: currentUser?.email ?? '',
    roles,
    handleLogout,
    fileInputRef,
    handleAvatarClick,
    handleAvatarChange,
  };
}
