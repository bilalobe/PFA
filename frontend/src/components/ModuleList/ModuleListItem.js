import React from 'react';
import { Grid, Typography } from '@mui/material';

function ModuleListItem({ module }) {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {module.titre}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2">Type: {module.type}</Typography>
      </Grid>
    </Grid>
  );
}

export default ModuleListItem;
