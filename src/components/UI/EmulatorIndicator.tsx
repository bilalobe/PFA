import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import { isEmulatorEnvironment } from '../../firebaseConfig';

/**
 * A component that displays an indicator when the app is running in emulator mode
 * This is useful for development and demo purposes
 */
export const EmulatorIndicator: React.FC = () => {
  // Only show the indicator when in emulator mode
  if (!isEmulatorEnvironment) return null;
  
  return (
    <Box position="fixed" bottom={16} right={16} zIndex={9999}>
      <Tooltip title="Running in Firebase Emulator Mode">
        <Chip
          icon={<BugReportIcon />}
          label="Emulator Mode"
          color="secondary"
          variant="outlined"
          sx={{
            fontWeight: 'bold',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }
          }}
        />
      </Tooltip>
    </Box>
  );
};

export default EmulatorIndicator;