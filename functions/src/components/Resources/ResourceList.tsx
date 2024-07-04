import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchResources } from '@/types/features/resource/resourceSlice';
import { Typography, CircularProgress, Box } from '@mui/material';
import { FixedSizeList as List } from 'react-window';
import { RootState, AppDispatch } from '@/types/store';

function ResourceList({ moduleId }: { moduleId: string }) {
  const dispatch: AppDispatch = useDispatch();
  const { resources, loading, error } = useSelector((state: RootState) => ({
    resources: state.resource.resources,
    loading: state.resource.loading,
    error: state.resource.error,
  }));

  useEffect(() => {
    dispatch(fetchResources({ moduleId }));
  }, [dispatch, moduleId]);

  const Row = ({ index, style }) => (
    <Box style={style} key={resources[index].id}>
      <Typography variant="h6" gutterBottom>
        {resources[index].title}
      </Typography>
      <Typography variant="body2" gutterBottom>
        {resources[index].description}
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4} aria-label="Loading resources">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={4} aria-label="Error">
        <Typography variant="body1" color="error">
          Error: {error?.message || 'Unknown error'}
        </Typography>
      </Box>
    );
  }

  return (
    <List
      height={600}
      width={'100%'}
      itemCount={resources.length}
      itemSize={120}
    >
      {Row}
    </List>
  );
}

export default ResourceList;
