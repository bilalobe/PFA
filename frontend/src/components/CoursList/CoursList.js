import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCours } from '../../actions/coursActions.js'; 
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText, Typography, CircularProgress } from '@mui/material';

const CoursList = () => {
  const dispatch = useDispatch();
  const coursState = useSelector((state) => state.cours); 
  const { cours, isLoading, error } = coursState;

  useEffect(() => {
    dispatch(fetchCours());
  }, [dispatch]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <Typography variant="h6" color="error">
        Erreur : {error.message}
      </Typography>
    );
  }

  return (
    <List>
      {cours.map((cours) => (
        <ListItem key={cours.id} component={Link} to={`/cours/${cours.id}`}>
          <ListItemText primary={cours.titre} secondary={`Par ${cours.formateur.username} - ${cours.niveau_difficulte}`} />
        </ListItem>
      ))}
    </List>
  );
};

export default CoursList;
