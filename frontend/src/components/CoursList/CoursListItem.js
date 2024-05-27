import React from 'react';
import { Grid, Typography, Card, CardContent, CardMedia } from '@mui/material';

function CoursListItem({ cours }) {
  return (
    <Grid item xs={12} md={6} lg={4}>
      <Card>
        {cours.image && (
          <CardMedia
            component="img"
            height="140"
            image={cours.image}
            alt={cours.titre}
          />
        )}
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {cours.titre}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Par {cours.formateur.username}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Niveau: {cours.niveau_difficulte}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

export default CoursListItem;
