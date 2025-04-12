'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCryptoData } from '../../lib/api/crypto';
import { fetchCryptoStart, fetchCryptoSuccess, fetchCryptoFailure } from '../../redux/slices/cryptoSlice';
import { RootState, AppDispatch } from '../../redux/store';
import Card from '../ui/Card';

// Define the Crypto interface matching CoinGecko API and cryptoSlice
interface Crypto {
  id: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

export default function CryptoSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.crypto);

  useEffect(() => {
    const cryptos = ['bitcoin', 'ethereum', 'litecoin'];
    dispatch(fetchCryptoStart());
    fetchCryptoData(cryptos)
      .then((results) => dispatch(fetchCryptoSuccess(results)))
      .catch((err) => dispatch(fetchCryptoFailure(err.message)));
  }, [dispatch]);

  // Handle loading, error, and empty states
  if (loading) return <Card><p>Loading...</p></Card>;
  if (error) return <Card><p className="text-red-500">Error: {error}</p></Card>;
  if (data.length === 0) return <Card><p>No cryptocurrency data available.</p></Card>;

  return (
    <Card>
      <h2 className="text-xl font-bold text-black">Cryptocurrency</h2>
      {data.map((crypto: Crypto) => (
        <div key={crypto.id} className="mt-2 text-black">
          <p>
            {crypto.name}: $
            {crypto.current_price
              ? crypto.current_price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : 'N/A'}
          </p>
        </div>
      ))}
    </Card>
  );
}