// src/components/Login.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { error, loading } = useSelector(state => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(login({ username, password })).unwrap()
      .then(() => navigate('/'))
      .catch(() => {});
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      {error && (
        <div className="error-message">{error}</div>
      )}
      <input 
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input 
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={loading}>Login</button>
    </form>
  );
};

export default Login;
