// src/components/Register.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState(''); // Add state for user type
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook for navigation

  const { error, loading } = useSelector(state => state.auth);

  const handleRegister = async (e) => {
    e.preventDefault();
    dispatch(register({ username, email, password, userType })).unwrap()
      .then(() => navigate('/login'))
      .catch(() => {});
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
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
        type="email" 
        placeholder="Email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <select value={userType} onChange={(e) => setUserType(e.target.value)}>
        <option value="">Select User Type</option>
        <option value="teacher">Teacher</option>
        <option value="student">Student</option>
        <option value="supervisor">Supervisor</option>
      </select>
      <button type="submit" disabled={loading}>Register</button>
    </form>
  );
};

export default Register;
