// frontend2/src/redux/actions/notificationActions.ts

export const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
export const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';

interface Notification {
  id: string;
  message: string;
  // add other properties if needed
}

interface AddNotificationAction {
  type: typeof ADD_NOTIFICATION;
  payload: Notification;
}

export const addNotification = (notification: Notification): AddNotificationAction => ({
  type: ADD_NOTIFICATION,
  payload: notification,
});

interface RemoveNotificationAction {
  type: typeof REMOVE_NOTIFICATION;
  payload: string; // assuming id is a string
}

export const removeNotification = (id: string): RemoveNotificationAction => ({
  type: REMOVE_NOTIFICATION,
  payload: id,
});

export type NotificationActionTypes = AddNotificationAction | RemoveNotificationAction;