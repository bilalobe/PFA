// src/components/LiveSession/LiveSessionCalendar.tsx
import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { format } from 'date-fns';
import { LiveSession } from '../../interfaces/types';

interface LiveSessionCalendarProps {
  sessions: LiveSession[];
}

const LiveSessionCalendar: React.FC<LiveSessionCalendarProps> = ({ sessions }) => {
  // Group sessions by day
  const sessionsByDay = sessions.reduce((acc, session) => {
    const dateKey = format(session.scheduledStartTime.toDate(), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(session);
    return acc;
  }, {} as Record<string, LiveSession[]>);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Upcoming Sessions</Typography>
      <Grid container spacing={2}>
        {Object.entries(sessionsByDay).map(([dateKey, daySessions]) => (
          <Grid item xs={12} key={dateKey}>
            <Typography variant="subtitle1" fontWeight="bold">
              {format(new Date(dateKey), 'EEEE, MMMM d')}
            </Typography>
            {daySessions.map(session => (
              <Box key={session.id} sx={{ p: 1, borderLeft: '2px solid', borderColor: 'primary.main', ml: 2, my: 1 }}>
                <Typography>{format(session.scheduledStartTime.toDate(), 'h:mm a')} - {session.title}</Typography>
              </Box>
            ))}
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default LiveSessionCalendar;