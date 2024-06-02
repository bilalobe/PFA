import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

function RegistrationForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student'); // Default user type
  const [registrationError, setRegistrationError] = useState(null);
  const navigate = useNavigate(); // From react-router-dom

  const handleSubmit = async (event) => {
    event.preventDefault();
    setRegistrationError(null); // Clear error message on new registration attempt

    try {
      const response = await axios.post('/api/users/', { // Your API endpoint
        username,
        email,
        password,
        user_type: userType,
      });
      // Handle successful registration
      console.log('Registration successful:', response.data);
      navigate('/login'); // Redirect to login
    } catch (error) {
      // Handle errors
      setRegistrationError(error.response.data.detail || 'An error occurred. Please try again.');
      console.error('Error during registration:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h5" component="div" gutterBottom>
        Register
      </Typography>
      {registrationError && (
        <Alert severity="error">{registrationError}</Alert>
      )}
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {/* ... other form fields (email, password, user type selection) ... */}
            <TextField
        label="Email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextField
        label="User Type"
        select
        value={userType}
        onChange={(e) => setUserType(e.target.value)}
        fullWidth
        margin="normal"
      >
        <MenuItem value="student">Student</MenuItem>
        <MenuItem value="teacher">Teacher</MenuItem>
        <MenuItem value="supervisor">Supervisor</MenuItem>
      </TextField>
      
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Register
      </Button>
    </Box>
  );
}

export default RegistrationForm;