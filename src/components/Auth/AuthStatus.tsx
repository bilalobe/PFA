import React from 'react';
import { Chip, Box, Tooltip } from '@mui/material';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SecurityIcon from '@mui/icons-material/Security';
import { useAuth } from '../../hooks/useAuth';

interface AuthStatusProps {
  showOffline?: boolean;
  size?: 'small' | 'medium';
}

const AuthStatus: React.FC<AuthStatusProps> = ({ 
  showOffline = true,
  size = 'medium'
}) => {
  const { isLoggedIn, isOfflineAuthenticated, isOnline, userProfile } = useAuth();
  
  if (!isLoggedIn && !isOfflineAuthenticated) {
    return null;
  }
  
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {isLoggedIn && (
        <Tooltip title={`Signed in as ${userProfile?.displayName || userProfile?.email}`}>
          <Chip
            icon={<AccountCircleIcon />}
            label={userProfile?.displayName || 'Signed in'}
            color="primary"
            size={size}
            variant="outlined"
          />
        </Tooltip>
      )}
      
      {isOfflineAuthenticated && (
        <Tooltip title="Using cached credentials - limited functionality available">
          <Chip
            icon={<SecurityIcon />}
            label="Offline access"
            color="warning"
            size={size}
            variant="outlined"
          />
        </Tooltip>
      )}
      
      {showOffline && !isOnline && (
        <Tooltip title="You are currently offline">
          <Chip
            icon={<SignalWifiOffIcon />}
            label="Offline"
            color="error"
            size={size}
            variant="outlined"
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default AuthStatus;