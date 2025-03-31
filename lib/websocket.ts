import { AppDispatch } from '../redux/store';
import { addNotification } from '../redux/slices/notificationSlice';

const COINCAP_WS_URL = 'wss://ws.coincap.io/prices?assets=bitcoin,ethereum';

export const connectWebSocket = (dispatch: AppDispatch, addNotificationAction: typeof addNotification) => {
  const ws = new WebSocket(COINCAP_WS_URL);

  ws.onopen = () => {
    console.log('Connected to CoinCap WebSocket');
  };

  ws.onmessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data as string); // e.g., { "bitcoin": "6929.82", "ethereum": "404.97" }
    dispatch(addNotificationAction({ type: 'price_alert', message: JSON.stringify(data) }));
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
    setTimeout(() => connectWebSocket(dispatch, addNotificationAction), 2000); // Auto-reconnect
  };

  return ws;
};
