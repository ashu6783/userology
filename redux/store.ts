import { configureStore } from '@reduxjs/toolkit';
import weatherReducer from './slices/weatherSlice';
import cryptoReducer from './slices/cryptoSlice';
import newsReducer from './slices/newsSlice';
import notificationReducer from './slices/notificationSlice';
import websocketMiddleware from './middleware/websocketMiddleware';

// Correct Redux Store Configuration
export const store = configureStore({
  reducer: {
    weather: weatherReducer,
    crypto: cryptoReducer,
    news: newsReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['WEBSOCKET_CONNECT'],
      },
    }).concat(websocketMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Define TypeScript Types for Redux Store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;