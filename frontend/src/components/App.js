// re_act/src/AppContent.js
import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, createTheme, Grid, CircularProgress, Box, Typography, Alert } from '@mui/material';
import store from './store';
import { fetchUsers } from './actions/userActions';
import { fetchCours } from './actions/coursActions';
import { fetchModules } from './actions/moduleActions';
import UserList from './components/UserList/UserList.js';
import CoursList from './components/CoursList/CoursList.js';
import ModuleList from './components/ModuleList/ModuleList.js';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function AppContent() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.user.users);
  const courses = useSelector((state) => state.cours.courses);
  const modules = useSelector((state) => state.module.modules);
  const isLoading = useSelector((state) => state.user.isLoading || state.cours.isLoading || state.module.isLoading);
  const error = useSelector((state) => state.user.error || state.cours.error || state.module.error);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchCours());
    dispatch(fetchModules());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="error">
          Error: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <div>
      <h1>Welcome to the App</h1>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <UserList users={users} />
        </Grid>
        <Grid item xs={12} md={4}>
          <CoursList courses={courses} />
        </Grid>
        <Grid item xs={12} md={4}>
          <ModuleList modules={modules} />
        </Grid>
      </Grid>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;