import { AppDispatch } from '../redux/store';
import { addNotification } from '../redux/slices/notificationSlice';
import { pollCryptoPrices } from './api/crypto';

export const startPricePolling = (
  dispatch: AppDispatch,
  addNotificationAction: typeof addNotification,
  assets: string[] = ['bitcoin', 'ethereum']
) => {
  console.log('Starting CoinGecko price polling');

  const poll = async () => {
    try {
      const data = await pollCryptoPrices(assets);
      dispatch(addNotificationAction({ type: 'price_alert', message: JSON.stringify(data) }));
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  poll();
  const intervalId = setInterval(poll, 10000);

  return () => {
    console.log('Stopping CoinGecko price polling');
    clearInterval(intervalId);
  };
};