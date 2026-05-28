import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useMutation, useApolloClient } from '@apollo/client/react';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user { id username email displayName avatarUrl role isAdmin }
    }
  }
`;

const DEMO_EMAIL = 'admin@arcadia.com';
const DEMO_PASSWORD = 'password123';

export function useLoginLogic({ onLogin }) {
  const navigate = useNavigate();
  const client = useApolloClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [loginMutation, { loading }] = useMutation(LOGIN);

  const doLogin = async (loginEmail, loginPassword) => {
    const { data } = await loginMutation({ variables: { email: loginEmail, password: loginPassword } });
    if (!data.login) return false;
    const { token, user } = data.login;
    localStorage.setItem('arcadia_token', token);
    localStorage.setItem('arcadia_user', JSON.stringify(user));
    onLogin(user);
    await client.resetStore();
    return user;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await doLogin(email, password);
      if (!user) { setError('Invalid email or password.'); return; }
      navigate(user.role === 'Externe CD' ? '/firms' : '/dashboard');
    } catch {
      setError('Login failed. Please try again.');
    }
  };

  const [demoLoading, setDemoLoading] = useState(false);
  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      const user = await doLogin(DEMO_EMAIL, DEMO_PASSWORD);
      if (!user) { setError('Demo account unavailable.'); return; }
      navigate('/dashboard');
    } catch {
      setError('Demo login failed. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, error, loading, demoLoading, handleSubmit, handleDemoLogin };
}
