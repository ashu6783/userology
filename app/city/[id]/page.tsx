'use client';
import React from 'react';
import CryptoDetails from '../../../components/crypto/CryptoDetails';
import PriceHistoryChart from '../../../components/crypto/PriceHistoryChart';

interface PageProps {
    params: {
        id: string;
    };
}

export default function CryptoPage({ params }: PageProps) {
    const cryptoId = params.id;

    return (
        <div>
            <CryptoDetails cryptoId={cryptoId} />
            <PriceHistoryChart cryptoId={cryptoId} />
        </div>
    );
}