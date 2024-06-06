import React from 'react';
import { Snackbar, Alert as MuiAlert } from '@mui/material';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

const Alert = styled(MuiAlert)(({ theme, severity }) => ({
  // Add your custom styles here. For example:
  backgroundColor: severity === 'error' ? theme.palette.error.light : theme.palette.success.light,
  color: theme.palette.common.white,
  '& .MuiAlert-icon': {
    color: theme.palette.common.white,
  },
}));

function CustomSnackbar({ open, message, type, autoHideDuration = 3000, onClose }) {
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
}

CustomSnackbar.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
  autoHideDuration: PropTypes.number,
  onClose: PropTypes.func.isRequired,
};

export default CustomSnackbar;