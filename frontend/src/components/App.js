import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import store from './store';
import CustomNavBar from './components/CustomNavBar';
import ModuleList from './components/Modules/ModuleList';
import ModuleDetails from './components/Modules/ModuleDetails';
import PersonalizedRecommendations from './components/Recommendations/PersonalizedRecommendations';
import EditProfile from './components/Profile/EditProfile';
import UserProfile from './components/Profile/UserProfile';
import Login from './components/Auth/Login';
import theme from './theme';
import ProtectedRoute from './components/ProtectedRoute';

function retryAuthentication() {
  // Implement retry logic here, if needed
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <CustomNavBar />
          <Container sx={{ mt: 4 }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute component={UserProfile} retryAction={retryAuthentication} />} />
              <Route path="/edit-profile" element={<ProtectedRoute component={EditProfile} retryAction={retryAuthentication} />} />
              <Route path="/modules/:courseId" element={<ProtectedRoute component={ModuleList} retryAction={retryAuthentication} />} />
              <Route path="/modules/details/:id" element={<ProtectedRoute component={ModuleDetails} retryAction={retryAuthentication} />} />
              <Route path="/recommendations" element={<ProtectedRoute component={PersonalizedRecommendations} retryAction={retryAuthentication} />} />
            </Routes>
          </Container>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
