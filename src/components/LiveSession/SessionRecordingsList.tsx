import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Paper
} from '@mui/material';
import { VideoLibrary, PlayArrow, GetApp } from '@mui/icons-material';
import { format } from 'date-fns';

interface Recording {
  url: string;
  createdAt: any; // Timestamp
  title: string;
}

interface SessionRecordingsListProps {
  recordings: Recording[];
  sessionTitle: string;
}

const SessionRecordingsList: React.FC<SessionRecordingsListProps> = ({ recordings, sessionTitle }) => {
  if (!recordings || recordings.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" display="flex" alignItems="center" gutterBottom>
        <VideoLibrary sx={{ mr: 1 }} />
        Session Recordings
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Watch recordings from "{sessionTitle}"
      </Typography>
      
      <List>
        {recordings.map((recording, index) => (
          <ListItem
            key={index}
            secondaryAction={
              <Box>
                <IconButton edge="end" aria-label="play" href={recording.url} target="_blank">
                  <PlayArrow />
                </IconButton>
                <IconButton edge="end" aria-label="download" href={recording.url} download>
                  <GetApp />
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={recording.title}
              secondary={recording.createdAt?.toDate ? 
                `Recorded on ${format(recording.createdAt.toDate(), 'PPp')}` : 
                'Recording date not available'
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default SessionRecordingsList;