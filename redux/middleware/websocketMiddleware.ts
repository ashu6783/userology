import { Middleware } from '@reduxjs/toolkit';
import { startPricePolling } from '../../lib/websocket';
import { addNotification } from '../slices/notificationSlice';

const WEBSOCKET_CONNECT = 'WEBSOCKET_CONNECT';

const websocketMiddleware: Middleware = (store) => (next) => (action: unknown) => {
  if ((action as { type: string }).type === WEBSOCKET_CONNECT) {
    startPricePolling(store.dispatch, addNotification);

    // Simulate weather alerts every 10 seconds
    const simulateWeatherAlert = () => {
      const alerts = [
        'Weather Alert: Sunny with a high of 75°F',
        'Weather Alert: Rain expected at 3 PM',
        'Weather Alert: Wind gusts up to 20 mph',
      ];
      const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
      store.dispatch(addNotification({ type: 'info', message: randomAlert }));
    };

    const interval = setInterval(simulateWeatherAlert, 10000); // Every 10 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }
  return next(action);
};

export default websocketMiddleware;