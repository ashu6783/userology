'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCryptoData } from '../../lib/api/crypto';
import { fetchCryptoStart, fetchCryptoSuccess, fetchCryptoFailure } from '../../redux/slices/cryptoSlice';
import { RootState, AppDispatch } from '../../redux/store';
import Card from '../ui/Card';
import Link from 'next/link';
import { startPricePolling } from '../../lib/websocket';
import { addNotification } from '../../redux/slices/notificationSlice';

interface Crypto {
  id: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

interface CryptoDetailsProps {
  cryptoId: string;
}

export default function CryptoDetails({ cryptoId }: CryptoDetailsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.crypto);
  const notifications = useSelector((state: RootState) => state.notifications.notifications);

  useEffect(() => {
    const stopPolling = startPricePolling(dispatch, addNotification, [cryptoId]);

    if (cryptoId) {
      dispatch(fetchCryptoStart());
      fetchCryptoData([cryptoId])
        .then((result) => dispatch(fetchCryptoSuccess(result)))
        .catch((err) => dispatch(fetchCryptoFailure(err.message)));
    }

    return () => stopPolling();
  }, [cryptoId, dispatch]);

  const latestPrice = notifications
    .filter((n) => n.type === 'price_alert')
    .reverse()
    .find((n) => n.message.includes(cryptoId))
    ?.message.match(/\"([^\"]+)\":\"([^\"]+)\"/);

  if (loading) return <Card><p>Loading...</p></Card>;
  if (error) return <Card><p className="text-red-500">Error: {error}</p></Card>;
  if (!data || data.length === 0) return <Card><p>No data available for {cryptoId}.</p></Card>;

  const crypto: Crypto = data.find((item: Crypto) => item.id === cryptoId) || data[0];

  // Ensure realTimePrice is always a string
  const realTimePrice = latestPrice ? latestPrice[2].toString() : crypto.current_price.toString();

  return (
    <Card className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold capitalize">{crypto.name || cryptoId}</h2>
      <p>
        Price: ${parseFloat(realTimePrice).toFixed(2)}{' '}
        {latestPrice && <span className="text-green-500">(Live)</span>}
      </p>
      <p>24h Change: {parseFloat(crypto.price_change_percentage_24h.toString()).toFixed(2)}%</p>
      <p>Market Cap: ${parseFloat(crypto.market_cap.toString()).toFixed(2)}</p>
      <Link href="/" className="text-blue-500 hover:underline mt-4 block">
        Back to Dashboard
      </Link>
    </Card>
  );
}
