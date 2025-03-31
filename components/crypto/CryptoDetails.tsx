'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCryptoData } from '../../lib/api/crypto';
import { fetchCryptoStart, fetchCryptoSuccess, fetchCryptoFailure } from '../../redux/slices/cryptoSlice';
import { RootState, AppDispatch } from '../../redux/store';
import Card from '../ui/Card';
import Link from 'next/link';

interface Crypto {
  id: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
  marketCapUsd: string;
}

interface CryptoDetailsProps {
  cryptoId: string;
}

export default function CryptoDetails({ cryptoId }: CryptoDetailsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.crypto);
  const notifications = useSelector((state: RootState) => state.notifications.notifications);

  useEffect(() => {
    if (cryptoId) {
      dispatch(fetchCryptoStart());
      fetchCryptoData([cryptoId])
        .then((result) => dispatch(fetchCryptoSuccess(result)))
        .catch((err) => dispatch(fetchCryptoFailure(err.message)));
    }
  }, [cryptoId, dispatch]);

  // Find the latest price from WebSocket notifications
  const latestPrice = notifications
    .filter((n) => n.type === 'price_alert')
    .reverse()
    .find((n) => n.message.includes(cryptoId))
    ?.message.match(/\"([^\"]+)\":\"([^\"]+)\"/);

  if (loading) return <Card><p>Loading...</p></Card>;
  if (error) return <Card><p className="text-red-500">Error: {error}</p></Card>;
  if (!data || data.length === 0) return <Card><p>No data available for {cryptoId}.</p></Card>;

  const crypto: Crypto = data.find((item: Crypto) => item.id === cryptoId) || data[0];
  const realTimePrice = latestPrice ? latestPrice[2] : crypto.priceUsd;

  return (
    <Card className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold capitalize">{crypto.name || cryptoId}</h2>
      <p>Price: ${parseFloat(realTimePrice).toFixed(2)} {latestPrice && <span className="text-green-500">(Live)</span>}</p>
      <p>24h Change: {parseFloat(crypto.changePercent24Hr).toFixed(2)}%</p>
      <p>Market Cap: ${parseFloat(crypto.marketCapUsd).toFixed(2)}</p>
      <Link href="/" className="text-blue-500 hover:underline mt-4 block">
        Back to Dashboard
      </Link>
    </Card>
  );
}