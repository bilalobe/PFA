import React from 'react';
import { Box, Typography, Button, createTheme, ThemeProvider } from '@mui/material';

const lightTheme = createTheme({
    palette: {
      mode: 'light',
      background: {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
      text: {
        primary: '#000000',
        secondary: '#555555',
      },
    },
  });
  
const HeroSection = () => (
<ThemeProvider theme={lightTheme}>
    <Box sx={{ backgroundColor: 'background.default', padding: 8, textAlign: 'center', color: 'text.primary' }}>
        <Typography variant="h2" gutterBottom>
            Welcome to Our Learning Platform
        </Typography>
        <Typography variant="h5" gutterBottom>
            Discover the best courses and enhance your skills
        </Typography>
        <Button variant="contained" color="primary" size="large">
            Get Started
        </Button>
    </Box>
</ThemeProvider>
);

export default HeroSection;