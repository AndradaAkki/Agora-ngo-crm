import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useUserProfileLogic() {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Date simulate pentru utilizatorul logat
  const currentUser = {
    firstName: 'Alex',
    lastName: 'Thompson',
    email: 'alex.t@agora-crm.com',
    phone: '+1 (555) 123-9999',
    roles: [
      { name: 'Full Access: Externe CD', color: '#514EF3', bg: '#F0F0FE' },
      { name: 'Administrator', color: '#FE8084', bg: '#FBEAEA' }
    ],
    avatar: 'https://i.pravatar.cc/150?u=andra'
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    // Aici vei curata token-urile in viitor
    navigate('/'); 
  };

  return {
    navigate,
    isLogoutModalOpen,
    setIsLogoutModalOpen,
    currentUser,
    handleLogout
  };
}