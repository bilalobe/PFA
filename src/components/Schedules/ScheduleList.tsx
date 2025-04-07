import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Divider,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Event as EventIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Schedule } from '../../interfaces/types';
import { scheduleApi } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import ScheduleForm from './ScheduleForm';
import ScheduleDetails from './ScheduleDetails';

// Type colors (same as in other schedule components)
const scheduleTypeColors = {
  'lecture': '#4caf50',     // Green
  'test': '#f44336',        // Red
  'assignment': '#ff9800',  // Orange
  'office-hours': '#2196f3',// Blue
  'other': '#9c27b0'        // Purple
};

interface ScheduleListProps {
  courseId?: string;
  moduleId?: string;
  limit?: number;
  showAddButton?: boolean;
  viewOnly?: boolean;
  compact?: boolean;
}

const ScheduleList: React.FC<ScheduleListProps> = ({
  courseId,
  moduleId,
  limit,
  showAddButton = true,
  viewOnly = false,
  compact = false,
}) => {
  const { user } = useAuth();
  
  // State for schedule data and UI controls
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [openScheduleForm, setOpenScheduleForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Fetch schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let fetchedSchedules: Schedule[] = [];
        
        if (courseId) {
          fetchedSchedules = await scheduleApi.getCourseSchedules(courseId);
        } else {
          fetchedSchedules = await scheduleApi.getUserSchedules();
        }
        
        // Sort by start time (most recent first)
        fetchedSchedules.sort((a, b) => {
          const dateA = a.startTime instanceof Date ? a.startTime : a.startTime.toDate();
          const dateB = b.startTime instanceof Date ? b.startTime : b.startTime.toDate();
          return dateA.getTime() - dateB.getTime();
        });
        
        // Apply limit if provided
        if (limit && fetchedSchedules.length > limit) {
          fetchedSchedules = fetchedSchedules.slice(0, limit);
        }
        
        setSchedules(fetchedSchedules);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch schedules');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchedules();
  }, [courseId, moduleId, limit]);
  
  // Format date for display
  const formatDateTime = (date: Date | { toDate: () => Date }): string => {
    if (date instanceof Date) {
      return format(date, compact ? 'MMM d, h:mm a' : 'PPP p');
    } else if (date && typeof date.toDate === 'function') {
      return format(date.toDate(), compact ? 'MMM d, h:mm a' : 'PPP p');
    }
    return 'Date unavailable';
  };
  
  // Handle opening the schedule form dialog
  const handleOpenScheduleForm = (existingSchedule?: Schedule) => {
    if (existingSchedule) {
      setSelectedSchedule(existingSchedule);
    } else {
      const newSchedule = {
        id: '',
        title: '',
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
        createdBy: user?.uid || '',
        type: 'lecture' as 'lecture' | 'test' | 'assignment' | 'office-hours' | 'other',
      };
      if (courseId) newSchedule.courseId = courseId;
      if (moduleId) newSchedule.moduleId = moduleId;
      setSelectedSchedule(newSchedule as Schedule);
    }
    setOpenScheduleForm(true);
  };
  
  // Handle saving a schedule
  const handleSaveSchedule = async (scheduleData: Schedule) => {
    try {
      setLoading(true);
      setError(null);
      
      if (selectedSchedule?.id) {
        // Updating existing schedule
        await scheduleApi.updateSchedule(selectedSchedule.id, scheduleData);
      } else {
        // Creating new schedule
        await scheduleApi.createSchedule(scheduleData);
      }
      
      // Refresh schedules after saving
      if (courseId) {
        const updatedSchedules = await scheduleApi.getCourseSchedules(courseId);
        setSchedules(updatedSchedules);
      } else {
        const updatedSchedules = await scheduleApi.getUserSchedules();
        setSchedules(updatedSchedules);
      }
      
      setOpenScheduleForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle showing schedule details
  const handleViewSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setOpenDetailsDialog(true);
  };
  
  // Handle deleting a schedule
  const handleDeleteSchedule = async () => {
    if (!selectedSchedule) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await scheduleApi.deleteSchedule(selectedSchedule.id, courseId);
      
      // Refresh schedules after deletion
      if (courseId) {
        const updatedSchedules = await scheduleApi.getCourseSchedules(courseId);
        setSchedules(updatedSchedules);
      } else {
        const updatedSchedules = await scheduleApi.getUserSchedules();
        setSchedules(updatedSchedules);
      }
      
      setConfirmDelete(false);
      setOpenDetailsDialog(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete schedule');
    } finally {
      setLoading(false);
    }
  };
  
  // Check if a schedule is upcoming
  const isUpcoming = (schedule: Schedule): boolean => {
    const currentTime = new Date();
    const scheduleTime = schedule.startTime instanceof Date 
      ? schedule.startTime 
      : schedule.startTime.toDate();
      
    return scheduleTime > currentTime;
  };
  
  // Group schedules by date for better organization
  const groupSchedulesByDate = (scheduleList: Schedule[]): { [date: string]: Schedule[] } => {
    const groups: { [date: string]: Schedule[] } = {};
    
    scheduleList.forEach(schedule => {
      const scheduleDate = schedule.startTime instanceof Date 
        ? schedule.startTime 
        : schedule.startTime.toDate();
        
      const dateString = format(scheduleDate, 'yyyy-MM-dd');
      
      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      
      groups[dateString].push(schedule);
    });
    
    return groups;
  };
  
  // Render the schedule list
  return (
    <Box>
      {/* Add Schedule Button */}
      {showAddButton && !viewOnly && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenScheduleForm()}
          >
            Add Schedule
          </Button>
        </Box>
      )}
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Schedule List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : schedules.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            No schedules found.
          </Typography>
        </Paper>
      ) : compact ? (
        <List>
          {schedules.map(schedule => (
            <ListItem
              key={schedule.id}
              button
              onClick={() => handleViewSchedule(schedule)}
              sx={{
                bgcolor: isUpcoming(schedule) ? 'background.paper' : 'action.hover',
                mb: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: scheduleTypeColors[schedule.type] || 'grey' }}>
                  <EventIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={schedule.title}
                secondary={formatDateTime(schedule.startTime)}
              />
              {!viewOnly && user?.uid === schedule.createdBy && (
                <Box>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenScheduleForm(schedule);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      ) : (
        <Paper sx={{ p: 2 }}>
          {Object.entries(groupSchedulesByDate(schedules)).map(([date, dateSchedules]) => (
            <Box key={date} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
              </Typography>
              <List disablePadding>
                {dateSchedules.map(schedule => (
                  <React.Fragment key={schedule.id}>
                    <ListItem
                      button
                      onClick={() => handleViewSchedule(schedule)}
                      sx={{
                        py: 1.5,
                        borderLeft: 3,
                        borderColor: schedule.color || scheduleTypeColors[schedule.type] || 'grey',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {schedule.title}
                            </Typography>
                            <Chip
                              size="small"
                              label={schedule.type.charAt(0).toUpperCase() + schedule.type.slice(1)}
                              sx={{
                                ml: 1,
                                bgcolor: schedule.color || scheduleTypeColors[schedule.type] || 'grey',
                                color: 'white',
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {format(
                              schedule.startTime instanceof Date
                                ? schedule.startTime
                                : schedule.startTime.toDate(),
                              'h:mm a'
                            )}{' '}
                            -{' '}
                            {format(
                              schedule.endTime instanceof Date
                                ? schedule.endTime
                                : schedule.endTime.toDate(),
                              'h:mm a'
                            )}
                            {schedule.location && ` • ${schedule.location}`}
                          </Typography>
                        }
                      />
                      {!viewOnly && user?.uid === schedule.createdBy && (
                        <Box>
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenScheduleForm(schedule);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSchedule(schedule);
                              setConfirmDelete(true);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Box>
          ))}
        </Paper>
      )}
      
      {/* Schedule Form Dialog */}
      <Dialog open={openScheduleForm} onClose={() => setOpenScheduleForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedSchedule?.id ? 'Edit Schedule' : 'Add Schedule'}</DialogTitle>
        <DialogContent>
          <ScheduleForm
            initialData={selectedSchedule}
            courseId={courseId}
            moduleId={moduleId}
            onSave={handleSaveSchedule}
          />
        </DialogContent>
      </Dialog>
      
      {/* Schedule Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          {selectedSchedule && (
            <ScheduleDetails
              schedule={selectedSchedule}
              onEdit={() => {
                setOpenDetailsDialog(false);
                handleOpenScheduleForm(selectedSchedule);
              }}
              onDelete={() => setConfirmDelete(true)}
              viewOnly={viewOnly}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this schedule?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button onClick={handleDeleteSchedule} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScheduleList;