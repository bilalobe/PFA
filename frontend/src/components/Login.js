// src/components/Login.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material'; // Import CircularProgress

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { error, loading } = useSelector(state => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      return setSuccessMessage("All fields are required.");
    }
    dispatch(login({ username, password }))
      .unwrap()
      .then(() => {
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => navigate('/'), 2000);
      })
      .catch(() => {});
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      <input 
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input 
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? <CircularProgress size={20} color="inherit" /> : 'Login'}
      </button>
    </form>
  );
};

export default Login;
