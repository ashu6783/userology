'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCryptoData } from '../../lib/api/crypto';
import { fetchCryptoStart, fetchCryptoSuccess, fetchCryptoFailure } from '../../redux/slices/cryptoSlice';
import { RootState, AppDispatch } from '../../redux/store';
import Card from '../ui/Card';

export default function CryptoSection() {
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading, error } = useSelector((state: RootState) => state.crypto) as {
        data: { name: string; priceUsd: string }[];
        loading: boolean;
        error: string | null;
    };
    useEffect(() => {
        const cryptos = ['bitcoin', 'ethereum', 'litecoin'];
        dispatch(fetchCryptoStart());
        fetchCryptoData(cryptos)
            .then(results => dispatch(fetchCryptoSuccess(results)))
            .catch(err => dispatch(fetchCryptoFailure(err.message)));
    }, [dispatch]);

    if (loading) return <Card><p>Loading...</p></Card>;
    if (error) return <Card><p className="text-red-500">Error: {error}</p></Card>;

    return (
        <Card>
            <h2 className="text-xl font-bold text-black">Cryptocurrency</h2>
            {data.map((crypto, index) => (
                <div key={index} className="mt-2 text-black">
                    <p>{crypto.name}: ${parseFloat(crypto.priceUsd).toFixed(2)}</p>
                </div>
            ))}
        </Card>
    );
}