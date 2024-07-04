import { createAsyncThunk } from '@reduxjs/toolkit';
import { addNotification } from './notificationSlice';
import { apiUrl } from './utils/api'; // Assuming you have your API URLs in a separate file
import axios from 'axios';

// Define async thunk for setting up agenda
export const setupAgenda = createAsyncThunk(
  'agenda/setup',
  async (agendaDetails, { dispatch, rejectWithValue }) => {
    try {
      // Call API to set up agenda
      const response = await axios.post(`${apiUrl}/agenda/setup/`, agendaDetails); 

      if (response.status === 201) { 
        // If setup is successful, dispatch addNotification
        const newNotification = {
          id: Date.now().toString(), // Use a unique ID (e.g., Date.now() or a UUID)
          message: 'Agenda set up successfully',
          // add other properties if needed
        };
        dispatch(addNotification(newNotification));
        return response.data; 
      } else {
        return rejectWithValue(response.data.message || 'Agenda setup failed.'); 
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);