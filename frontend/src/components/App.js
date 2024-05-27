import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import store from './store';
import { fetchUsers } from './actions/userActions';
import { fetchCours } from './actions/coursActions';
import { fetchModules } from './actions/moduleActions';
import { useSelector, useDispatch } from 'react-redux';
import UserList from './components/UserList/UserList.js';
import CoursList from './components/CoursList/CoursList.js';
import ModuleList from './components/ModuleList/ModuleList.js';
import { ThemeProvider, createTheme, Grid, CircularProgress } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
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

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <div>
          <h1>Welcome to the App</h1>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              {isLoading && <CircularProgress />}
              <UserList users={users} />
            </Grid>
            <Grid item xs={12} md={4}>
              {isLoading && <CircularProgress />}
              <CoursList courses={courses} />
            </Grid>
            <Grid item xs={12} md={4}>
              {isLoading && <CircularProgress />}
              <ModuleList modules={modules} />
            </Grid>
          </Grid>
        </div>
      </ThemeProvider>
    </Provider>
  );
}

export default App;