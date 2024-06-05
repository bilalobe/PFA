import { createAsyncThunk } from '@reduxjs/toolkit';
import { addNotification } from './notificationSlice';

export const setupAgenda = createAsyncThunk(
  'agenda/setup',
  async (agendaDetails, { dispatch }) => {
    // Perform agenda setup here
    // ...
    

    // If setup is successful, dispatch addNotification
    const newNotification = {
        id: '1', // replace with a unique id
        message: 'Agenda set up successfully', // replace with your message
        // add other properties if needed
    };

    dispatch(addNotification(newNotification));
  }
);