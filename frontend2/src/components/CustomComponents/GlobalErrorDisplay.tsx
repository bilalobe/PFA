import React from 'react';
import { useSelector } from 'react-redux';
import { Snackbar } from '@mui/material';
import { RootState } from './store';

const GlobalErrorDisplay: React.FC = () => {
  const error = useSelector((state: RootState) => state.global.error);

  return (
    <Snackbar
      open={!!error}
      message={error}
      autoHideDuration={6000}
      onClose={() => {}}
    />
  );
};

export default GlobalErrorDisplay;
