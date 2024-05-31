// src/components/Register.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material'; // Import CircularProgress

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { error, loading } = useSelector(state => state.auth);

  const validateForm = () => {
    if (!username || !email || !password || !userType) {
      return "All fields are required.";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Please enter a valid email address.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errorMessage = validateForm();
    if (errorMessage) {
      return setSuccessMessage(errorMessage);
    }
    dispatch(register({ username, email, password, userType }))
      .unwrap()
      .then(() => {
        setSuccessMessage('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      })
      .catch(() => {});
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
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
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input 
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <select value={userType} onChange={(e) => setUserType(e.target.value)} required>
        <option value="">Select User Type</option>
        <option value="teacher">Teacher</option>
        <option value="student">Student</option>
        <option value="supervisor">Supervisor</option>
      </select>
      <button type="submit" disabled={loading}>
        {loading ? <CircularProgress size={20} color="inherit" /> : 'Register'}
      </button>
    </form>
  );
};

export default Register;
