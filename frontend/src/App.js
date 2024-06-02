import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import store from './store';  // Assuming you have a Redux store configured in 'store.js'
import Navbar from './components/Common/Navbar';  // Adjust the path to your Navbar component
import Footer from './components/Common/Footer';  // Adjust the path to your Footer component
import ProtectedRoute from './components/Common/ProtectedRoute';  // Assuming you have a ProtectedRoute component
import Login from './pages/Login';  // Adjust the path to your Login page/component
import CourseDetails from './pages/Course/CourseDetails';  // Adjust the path to your CourseDetails component
import ModuleList from './components/Modules/ModuleList';  // Adjust the path to your ModuleList component
import ModuleDetails from './components/Modules/ModuleDetails';  // Adjust the path to your ModuleDetails component
import PersonalizedRecommendations from './components/Recommendations/PersonalizedRecommendations';  // Adjust the path to your component
import EditProfile from './components/Profile/EditProfile';  // Adjust the path to your EditProfile component
import UserProfile from './components/Profile/UserProfile';  // Adjust the path to your UserProfile component

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
          <Navbar />
          <Container>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute component={UserProfile} />} />
              <Route path="/edit-profile" element={<ProtectedRoute component={EditProfile} />} />
              <Route path="/course/:courseId" element={<ProtectedRoute component={CourseDetails} />} />
              <Route path="/modules/:courseId" element={<ProtectedRoute component={ModuleList} />} />
              <Route path="/modules/details/:id" element={<ProtectedRoute component={ModuleDetails} />} />
              <Route path="/recommendations" element={<ProtectedRoute component={PersonalizedRecommendations} />} />
            </Routes>
          </Container>
          <Footer />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
