import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import store from './store';  // Assuming you have a Redux store configured in 'store.js'
import Navbar from './components/Navbar';  // Assuming you have a Navbar component
import ModuleList from './components/Modules/ModuleList';
import ModuleDetails from './components/Modules/ModuleDetails';
import PersonalizedRecommendations from './components/Recommendations/PersonalizedRecommendations';
import EditProfile from './components/Profile/EditProfile';
import UserProfile from './components/Profile/UserProfile';

const theme = createTheme({
  palette: {
    primary: { main: '#007bff' },
    secondary: { main: '#6c757d' },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Navbar />  {/* Assuming you have a Navbar component for navigation */}
          <Container>
            <Routes>
              <Route path="/" element={<UserProfile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/modules/:courseId" element={<ModuleList />} />
              <Route path="/modules/details/:id" element={<ModuleDetails />} />
              <Route path="/recommendations" element={<PersonalizedRecommendations />} />
            </Routes>
          </Container>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
