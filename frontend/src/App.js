import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import HomeGuard from './components/HomeGuard';
import UserList from './components/UserList';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/*" element={<HomeGuard />} />
          <Route path="/users" element={<UserList />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
