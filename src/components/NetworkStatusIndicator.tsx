import React, { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const NetworkStatusIndicator: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [showOnlineAlert, setShowOnlineAlert] = useState(false);
  
  // Show alerts when network status changes
  useEffect(() => {
    if (!isOnline) {
      setShowOfflineAlert(true);
    } else {
      setShowOnlineAlert(true);
      // Hide offline alert if it was showing
      setShowOfflineAlert(false);
    }
  }, [isOnline]);

  return (
    <>
      <Snackbar 
        open={showOfflineAlert} 
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="warning" 
          variant="filled"
          onClose={() => setShowOfflineAlert(false)}
        >
          You are offline. Some features may be limited.
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={showOnlineAlert} 
        autoHideDuration={3000} 
        onClose={() => setShowOnlineAlert(false)} 
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success"
          variant="filled"
          onClose={() => setShowOnlineAlert(false)}
        >
          Connected to the network
        </Alert>
      </Snackbar>
    </>
  );
};

export default NetworkStatusIndicator;