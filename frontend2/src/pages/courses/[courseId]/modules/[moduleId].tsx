import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchModuleDetails } from '../../actions/moduleActions';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import ResourceList from '../../components/Resources/ResourceList';

function ModuleDetails() {
  const router = useRouter();
  const { moduleId } = router.query;
  const dispatch = useDispatch();

  const { currentModule: module, loading, error } = useSelector((state) => state.module);

  useEffect(() => {
    if (moduleId) {
      dispatch(fetchModuleDetails(moduleId));
    }
  }, [moduleId, dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
        <CircularProgress />
        <Typography variant="h6">Loading module details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    );
  }

  if (!module) {
    return (
      <Typography variant="h6">Module not found</Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h4">{module.title}</Typography>
      <Typography variant="body1">{module.content}</Typography>
      {module.resources.map((resource) => (
        <Typography key={resource.id} variant="body2">{resource.title}</Typography>
      ))}
      <ResourceList resources={module.resources} />
    </Box>
  );
}

export async function getServerSideProps(context) {
  const { moduleId } = context.query;
  dispatch(fetchModuleDetails(moduleId));

  return {
    props: {},
  };
}

export default ModuleDetails;