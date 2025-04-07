import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  Grid,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Controller, useForm } from 'react-hook-form';
import { Schedule } from '../../interfaces/types';
import { ChromePicker } from 'react-color';

interface ScheduleFormProps {
  initialData: Schedule | null;
  courseId?: string;
  moduleId?: string;
  onSave: (data: Schedule) => void;
  loading?: boolean;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  initialData,
  courseId,
  moduleId,
  onSave,
  loading = false,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(
    initialData?.color || ''
  );

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      startTime: initialData?.startTime || new Date(),
      endTime: initialData?.endTime || new Date(new Date().getTime() + 60 * 60 * 1000), // Default to 1 hour later
      type: initialData?.type || 'lecture',
      recurrence: initialData?.recurrence || 'once',
      location: initialData?.location || '',
      isPublic: initialData?.isPublic !== undefined ? initialData.isPublic : true,
      notifyStudents: initialData?.notifyStudents !== undefined ? initialData.notifyStudents : true,
      color: initialData?.color || '',
    },
  });

  const scheduleType = watch('type');

  // Schedule type options
  const scheduleTypes = [
    { value: 'lecture', label: 'Lecture' },
    { value: 'test', label: 'Test/Exam' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'office-hours', label: 'Office Hours' },
    { value: 'other', label: 'Other' },
  ];

  // Recurrence options
  const recurrenceTypes = [
    { value: 'once', label: 'One-time Event' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Every Two Weeks' },
    { value: 'monthly', label: 'Monthly' },
  ];

  // Type colors (same as in other schedule components)
  const scheduleTypeColors = {
    'lecture': '#4caf50',     // Green
    'test': '#f44336',        // Red
    'assignment': '#ff9800',  // Orange
    'office-hours': '#2196f3',// Blue
    'other': '#9c27b0'        // Purple
  };

  const onSubmit = (data: any) => {
    const scheduleData: Schedule = {
      ...initialData,
      ...data,
      color: selectedColor || scheduleTypeColors[data.type] || '',
      courseId: courseId || initialData?.courseId,
      moduleId: moduleId || initialData?.moduleId,
      createdBy: initialData?.createdBy || '',
    };
    
    onSave(scheduleData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={3}>
        {/* Title */}
        <Grid item xs={12}>
          <Controller
            name="title"
            control={control}
            rules={{ required: 'Title is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Title"
                variant="outlined"
                fullWidth
                required
                error={!!errors.title}
                helperText={errors.title?.message?.toString()}
              />
            )}
          />
        </Grid>

        {/* Description */}
        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
              />
            )}
          />
        </Grid>

        {/* Type */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="type"
            control={control}
            rules={{ required: 'Schedule type is required' }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel id="schedule-type-label">Schedule Type</InputLabel>
                <Select
                  {...field}
                  labelId="schedule-type-label"
                  label="Schedule Type"
                >
                  {scheduleTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.type && (
                  <FormHelperText>{errors.type.message?.toString()}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        {/* Recurrence */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="recurrence"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="recurrence-label">Recurrence</InputLabel>
                <Select
                  {...field}
                  labelId="recurrence-label"
                  label="Recurrence"
                >
                  {recurrenceTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        {/* Start Time */}
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Controller
              name="startTime"
              control={control}
              rules={{ required: 'Start time is required' }}
              render={({ field }) => (
                <DateTimePicker
                  label="Start Time"
                  value={field.value}
                  onChange={(newValue) => {
                    field.onChange(newValue);
                  }}
                  slotProps={{
                    textField: {
                      variant: 'outlined',
                      fullWidth: true,
                      required: true,
                      error: !!errors.startTime,
                      helperText: errors.startTime?.message?.toString(),
                    },
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>

        {/* End Time */}
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Controller
              name="endTime"
              control={control}
              rules={{ required: 'End time is required' }}
              render={({ field }) => (
                <DateTimePicker
                  label="End Time"
                  value={field.value}
                  onChange={(newValue) => {
                    field.onChange(newValue);
                  }}
                  slotProps={{
                    textField: {
                      variant: 'outlined',
                      fullWidth: true,
                      required: true,
                      error: !!errors.endTime,
                      helperText: errors.endTime?.message?.toString(),
                    },
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>

        {/* Location */}
        <Grid item xs={12}>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Location"
                placeholder={scheduleType === 'office-hours' ? "Office number or virtual meeting link" : scheduleType === 'lecture' ? "Classroom or virtual meeting link" : "Location"}
                variant="outlined"
                fullWidth
              />
            )}
          />
        </Grid>

        {/* Color */}
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Color (Optional)
          </Typography>
          <Box 
            sx={{ 
              height: 36, 
              width: 120, 
              bgcolor: selectedColor || scheduleTypeColors[scheduleType] || 'grey',
              borderRadius: 1,
              cursor: 'pointer',
              mb: 1
            }}
            onClick={() => setShowColorPicker(!showColorPicker)}
          />
          {showColorPicker && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <ChromePicker
                color={selectedColor || scheduleTypeColors[scheduleType] || 'grey'}
                onChange={(color) => setSelectedColor(color.hex)}
                disableAlpha
              />
            </Box>
          )}
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" gutterBottom>
            Options
          </Typography>
        </Grid>

        {/* Public/Private toggle */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="isPublic"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="Visible to all course participants"
              />
            )}
          />
        </Grid>

        {/* Notify Students toggle */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="notifyStudents"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="Notify students"
              />
            )}
          />
        </Grid>

        {/* Submit Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2, minWidth: 100 }}
            >
              {loading ? <CircularProgress size={24} /> : initialData?.id ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ScheduleForm;