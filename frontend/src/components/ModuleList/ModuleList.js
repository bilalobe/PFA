import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchModules } from '../../actions/moduleActions'; // Assurez-vous d'importer les actions appropriées pour les modules
import ModuleListItem from './ModuleListItem';
import { Grid, Typography, CircularProgress } from '@mui/material';

function ModuleList() {
  const dispatch = useDispatch();
  const modules = useSelector((state) => state.module.modules); // Accéder à l'état des modules depuis le store
  const isLoading = useSelector((state) => state.module.isLoading);
  const error = useSelector((state) => state.module.error);

  useEffect(() => {
    dispatch(fetchModules()); // Récupérer les modules
  }, [dispatch]);

  if (isLoading) {
    return (
      <Grid container justifyContent="center" alignItems="center">
        <CircularProgress />
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid container justifyContent="center" alignItems="center">
        <Typography variant="h6" color="error">
          Erreur de chargement des modules: {error}
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Liste des modules
        </Typography>
      </Grid>
      {modules.map((module) => (
        <Grid item key={module.id} xs={12} md={6} lg={4}>
          <ModuleListItem module={module} />
        </Grid>
      ))}
    </Grid>
  );
}

export default ModuleList;
