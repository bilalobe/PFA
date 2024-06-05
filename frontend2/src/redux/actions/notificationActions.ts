// frontend2/src/redux/reducers/notificationReducer.ts

import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ADD_NOTIFICATION, REMOVE_NOTIFICATION } from './notificationActions';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error';
}

const initialState: Notification[] = [];

const notificationReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(ADD_NOTIFICATION, (state, action: PayloadAction<Notification>) => {
      state.push(action.payload);
    })
    .addCase(REMOVE_NOTIFICATION, (state, action: PayloadAction<string>) => {
      return state.filter((notification) => notification.id !== action.payload);
    });
});

export default notificationReducer;