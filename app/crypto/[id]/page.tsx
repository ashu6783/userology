'use client';
import CryptoDetails from '../../../components/crypto/CryptoDetails';
import PriceHistoryChart from '../../../components/crypto/PriceHistoryChart';

export default function CryptoPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <CryptoDetails cryptoId={params.id} />
      <PriceHistoryChart cryptoId={params.id} />
    </div>
  );
}