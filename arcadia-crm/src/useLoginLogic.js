import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id username email displayName role isAdmin
    }
  }
`;

export function useLoginLogic({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [loginMutation, { loading }] = useMutation(LOGIN);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await loginMutation({ variables: { email, password } });
      if (!data.login) {
        setError('Invalid email or password.');
        return;
      }
      onLogin(data.login);
      navigate(data.login.role === 'Externe CD' ? '/firms' : '/dashboard');
    } catch {
      setError('Login failed. Please try again.');
    }
  };

  return { email, setEmail, password, setPassword, error, loading, handleSubmit };
}
