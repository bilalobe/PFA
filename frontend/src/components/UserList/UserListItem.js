// re_act/src/components/UserList/UserListItem.js
import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

function UserListItem({ user }) {
  return (
    
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {user.username}
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="body2">Email: {user.email}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">Role: {user.role}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">Niveau: {user.niveau_competence}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">Domaine: {user.domaine_expertise}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    
  );
}

export default UserListItem;