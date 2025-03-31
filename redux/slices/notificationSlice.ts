import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  type: string;
  message: string;
  timestamp?: number;
}

interface NotificationState {
  notifications: Notification[];
  currentIndex: number;
  isFull: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  currentIndex: 0,
  isFull: false
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      const notification = {
        ...action.payload,
        timestamp: action.payload.timestamp || Date.now()
      };

      // First fill up to 8 notifications
      if (!state.isFull) {
        if (state.notifications.length < 9) {
          state.notifications.push(notification);
          
          // Mark as full when we reach 8 notifications
          if (state.notifications.length === 8) {
            state.isFull = true;
          }
        }
      } else {
        // When full, replace notifications starting from index 0 and cycling through
        state.notifications[state.currentIndex] = notification;
        
        // Move to the next position for the next notification
        state.currentIndex = (state.currentIndex + 1) % 8;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.currentIndex = 0;
      state.isFull = false;
    }
  }
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;