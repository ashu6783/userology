'use client';
import React from 'react';
import CryptoDetails from '../../../components/crypto/CryptoDetails';
import PriceHistoryChart from '../../../components/crypto/PriceHistoryChart';

export default function CryptoPage({ params }: { params: { id: string } }) {
    const cryptoId = params.id;

    return (
        <div>
            <CryptoDetails cryptoId={cryptoId} />
            <PriceHistoryChart cryptoId={cryptoId} />
        </div>
    );
}
