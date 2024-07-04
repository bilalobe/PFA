import React, { FC } from 'react';
import { Snackbar, Alert as MuiAlert, AlertColor } from '@mui/material';
import { styled } from '@mui/material/styles';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

interface CustomSnackbarProps {
  open: boolean;
  message: string;
  type: AlertColor;
  autoHideDuration?: number;
  onClose: () => void;
}

const Alert = styled(MuiAlert)(({ theme, severity }) => ({
  backgroundColor: severity === 'error' ? theme.palette.error.light : theme.palette.success.light,
  color: theme.palette.common.white,
  '& .MuiAlert-icon': {
    color: theme.palette.common.white,
  },
}));

const CustomSnackbar: FC<CustomSnackbarProps> = ({ open, message, type, autoHideDuration = 3000, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <ErrorIcon />;
      case 'success':
        return <CheckCircleIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return null;
    }
  };

  return (
    <Snackbar open={open} autoHideDuration={autoHideDuration} onClose={onClose}>
      <Alert onClose={onClose} severity={type} sx={{ width: '100%' }} icon={getIcon()}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;