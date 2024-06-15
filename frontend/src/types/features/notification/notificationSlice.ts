import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface Notification {
    id: string;
    message: string;
    type: 'error' | 'success' | 'info' | 'warning';
    duration: number;
}

interface NotificationState {
    notifications: Notification[];
}

const initialState: NotificationState = {
    notifications: [],
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Notification>) => {
            state.notifications.push(action.payload);
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(
                (notification) => notification.id !== action.payload
            );
        },
    },
});

// Selectors
export const selectNotifications = (state: RootState) => state.notification.notifications;

export const { addNotification, removeNotification } = notificationSlice.actions;

export default notificationSlice.reducer;