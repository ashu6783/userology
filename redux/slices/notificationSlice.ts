import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  type: 'info' | 'price_alert' | 'error';
  message: string;
  timestamp?: number;
}

interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.push({
        ...action.payload,
        timestamp: Date.now(),
      });
    },
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;