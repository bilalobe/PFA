import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Common/Navbar';
import HomeGuard from './components/HomeGuard';
import HomePage from './pages/HomePage';
import CourseList from './components/Courses/CourseList';
import CourseDetails from './components/Courses/CourseDetails';
import QuizResults from './components/Quiz/QuizResults';
import ProfilePage from './pages/ProfilePage';
import CourseEnrollment from './components/Courses/CourseEnrollment';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomeGuard />}>
              <Route index element={<HomePage />} />
              <Route element={<RoleBasedRoute requiredRole="admin" />}>
                <Route path="admin" element={<AdminDashboard />} />
              </Route>
              <Route element={<RoleBasedRoute requiredRole="teacher" />}>
                <Route path="teacher" element={<TeacherDashboard />} />
              </Route>
              <Route element={<RoleBasedRoute requiredRole="student" />}>
                <Route path="student" element={<StudentDashboard />} />
              </Route>
              <Route path="courses" element={<CourseList />} />
              <Route path="courses/:id" element={<CourseDetails />} />
              <Route path="quiz/results" element={<QuizResults />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="enroll" element={<CourseEnrollment />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
