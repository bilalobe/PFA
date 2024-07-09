import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Checkbox,
  Typography,
  Box,
} from '@mui/material';
import { Module } from '../../interfaces/types';

interface ModuleListProps {
  modules: Module[];
  completedModules: string[];
  onModuleComplete: (moduleId: string) => void;
}

const ModuleList: React.FC<ModuleListProps> = ({ modules, completedModules, onModuleComplete }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Modules
      </Typography>
      <List>
        {modules.map((module) => (
          <ListItem key={module.id} disablePadding>
            <ListItemButton
              role={undefined}
              onClick={() => onModuleComplete(module.id)}
              dense
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={completedModules.includes(module.id)}
                  disabled
                />
              </ListItemIcon>
              <ListItemText primary={module.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ModuleList;
