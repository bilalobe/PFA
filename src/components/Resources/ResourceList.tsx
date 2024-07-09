import { Box, Typography, List, ListItem, ListItemText, Button, Link } from '@mui/material';
import { Resource } from '../../interfaces/types';

interface ResourceListProps {
  resources: Resource[];
}

const ResourceList: React.FC<ResourceListProps> = ({ resources }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Resources
      </Typography>
      <List>
        {resources.map((resource: Resource) => (
          <ListItem key={resource.id}>
            <ListItemText primary={resource.title} />
            {resource.url && (
              <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                <Button variant="contained" size="small">
                  View Resource
                </Button>
              </Link>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ResourceList;
