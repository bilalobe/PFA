import React from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  Paper,
  Grid,
  Chip,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Room as RoomIcon,
  Repeat as RepeatIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { Schedule } from '../../interfaces/types';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

// Schedule type display mapping
const scheduleTypeLabels = {
  'lecture': 'Lecture',
  'test': 'Test/Exam',
  'assignment': 'Assignment',
  'office-hours': 'Office Hours',
  'other': 'Other',
};

// Recurrence pattern display mapping
const recurrenceLabels = {
  'once': 'One-time',
  'daily': 'Daily',
  'weekly': 'Weekly',
  'bi-weekly': 'Every Two Weeks',
  'monthly': 'Monthly',
};

// Type colors (same as in ScheduleCalendar)
const scheduleTypeColors = {
  'lecture': '#4caf50',     // Green
  'test': '#f44336',        // Red
  'assignment': '#ff9800',  // Orange
  'office-hours': '#2196f3',// Blue
  'other': '#9c27b0'        // Purple
};

interface ScheduleDetailsProps {
  schedule: Schedule;
  onEdit?: () => void;
  onDelete?: () => void;
  viewOnly?: boolean;
}

const ScheduleDetails: React.FC<ScheduleDetailsProps> = ({
  schedule,
  onEdit,
  onDelete,
  viewOnly = false,
}) => {
  const { user } = useAuth();
  const isCreator = user && user.uid === schedule.createdBy;
  const canEditDelete = !viewOnly && isCreator;

  // Format dates for display
  const formatDateTime = (date: Date | { toDate: () => Date }): string => {
    if (date instanceof Date) {
      return format(date, 'PPP p'); // e.g., "Apr 29, 2023, 10:30 AM"
    } else if (date && typeof date.toDate === 'function') {
      return format(date.toDate(), 'PPP p');
    }
    return 'Date unavailable';
  };

  return (
    <Box>
      {/* Schedule header with type indicator */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              bgcolor: schedule.color || scheduleTypeColors[schedule.type] || 'grey',
              mr: 1,
            }}
          >
            {schedule.type === 'lecture' && <EventIcon />}
            {schedule.type === 'test' && <EventIcon />}
            {schedule.type === 'assignment' && <EventIcon />}
            {schedule.type === 'office-hours' && <PersonIcon />}
            {schedule.type === 'other' && <EventIcon />}
          </Avatar>
          <Typography variant="h6">{schedule.title}</Typography>
        </Box>

        {canEditDelete && (
          <Box>
            {onEdit && (
              <IconButton onClick={onEdit} size="small" sx={{ mr: 1 }}>
                <EditIcon />
              </IconButton>
            )}
            {onDelete && (
              <IconButton onClick={onDelete} size="small" color="error">
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Schedule details */}
      <Grid container spacing={2}>
        {/* Type */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Type
              </Typography>
              <Typography variant="body1">
                <Chip
                  label={scheduleTypeLabels[schedule.type]}
                  size="small"
                  sx={{
                    bgcolor: schedule.color || scheduleTypeColors[schedule.type] || 'grey',
                    color: 'white',
                  }}
                />
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Recurrence */}
        {schedule.recurrence && (
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <RepeatIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Recurrence
                </Typography>
                <Typography variant="body1">
                  {recurrenceLabels[schedule.recurrence]}
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}

        {/* Date and Time */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Date and Time
              </Typography>
              <Typography variant="body1">
                {formatDateTime(schedule.startTime)} - {formatDateTime(schedule.endTime)}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Location (if provided) */}
        {schedule.location && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <RoomIcon sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1">
                  {schedule.location.startsWith('http') ? (
                    <a href={schedule.location} target="_blank" rel="noopener noreferrer">
                      {schedule.location}
                    </a>
                  ) : (
                    schedule.location
                  )}
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}

        {/* Description (if provided) */}
        {schedule.description && (
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Description
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
                <Typography variant="body1">{schedule.description}</Typography>
              </Paper>
            </Box>
          </Grid>
        )}

        {/* Visibility */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {schedule.isPublic ? (
              <>
                <GroupIcon sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Visible to all course participants
                </Typography>
              </>
            ) : (
              <>
                <PersonIcon sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Private
                </Typography>
              </>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Add to calendar button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<EventIcon />}
          onClick={() => {
            // Generate .ics file or Google Calendar link
            const startIso = schedule.startTime instanceof Date ? 
              schedule.startTime.toISOString() : 
              schedule.startTime.toDate().toISOString();
            
            const endIso = schedule.endTime instanceof Date ? 
              schedule.endTime.toISOString() : 
              schedule.endTime.toDate().toISOString();
            
            const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
              schedule.title
            )}&dates=${startIso.replace(/[-:]/g, '').replace(/\.\d+/g, '')}/${endIso
              .replace(/[-:]/g, '')
              .replace(/\.\d+/g, '')}&details=${encodeURIComponent(
              schedule.description || ''
            )}&location=${encodeURIComponent(schedule.location || '')}`;
            
            window.open(googleCalUrl, '_blank');
          }}
        >
          Add to Google Calendar
        </Button>
      </Box>
    </Box>
  );
};

export default ScheduleDetails;