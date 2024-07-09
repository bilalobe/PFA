import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Checkbox,
  Typography,
  Box,
  TablePagination,
} from '@mui/material';
import { Module } from '../../interfaces/types';

interface ModuleListProps {
  modules: Module[];
  completedModules: string[];
  onModuleComplete: (moduleId: string) => void;
}

const ModuleList: React.FC<ModuleListProps> = ({ modules, completedModules, onModuleComplete }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedModules = modules.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (!modules.length) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography variant="body1" color="textSecondary">
          No modules available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Modules
      </Typography>
      <List>
        {paginatedModules.map((module) => (
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
      <TablePagination
        component="div"
        count={modules.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Box>
  );
};

export default ModuleList;