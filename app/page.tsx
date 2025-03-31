'use client';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import WeatherSection from '../components/dashboard/WeatherSection';
import CryptoSection from '../components/dashboard/CryptoSection';
import NewsSection from '../components/dashboard/NewsSection';
import '../lib/chartSetup'; // Import here to register Chart.js components
import PriceHistoryChart from '@/components/crypto/PriceHistoryChart';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const [activeSection, setActiveSection] = useState('weather');

  useEffect(() => {
    dispatch({ type: 'WEBSOCKET_CONNECT' });
  }, [dispatch]);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'weather':
        return <WeatherSection />;
      case 'crypto':
        return (
          <div className="flex flex-col gap-4 w-full">
            <CryptoSection />
            <PriceHistoryChart cryptoId="bitcoin" />
          </div>
        );
      case 'news':
        return <NewsSection />;
      case 'all':
        return (
          <div className="flex flex-col gap-6 w-full">
            <WeatherSection />
            <CryptoSection />
            <NewsSection />
            <PriceHistoryChart cryptoId="bitcoin" />
          </div>
        );
      default:
        return <WeatherSection />;
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      {/* Mobile-friendly navigation - flex wrap and full width buttons on small screens */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveSection('weather')}
          className={`px-4 py-2 rounded-md flex-1 min-w-[80px] ${activeSection === 'weather'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
            }`}
        >
          Weather
        </button>
        <button
          onClick={() => setActiveSection('crypto')}
          className={`px-4 py-2 rounded-md flex-1 min-w-[80px] ${activeSection === 'crypto'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
            }`}
        >
          Crypto
        </button>
        <button
          onClick={() => setActiveSection('news')}
          className={`px-4 py-2 rounded-md flex-1 min-w-[80px] ${activeSection === 'news'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
            }`}
        >
          News
        </button>
        <button
          onClick={() => setActiveSection('all')}
          className={`px-4 py-2 rounded-md flex-1 min-w-[80px] ${activeSection === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
            }`}
        >
          All
        </button>
      </div>

      {/* Single column layout on all screen sizes for consistent vertical alignment */}
      <div className="grid grid-cols-1 gap-4 w-full">
        {renderActiveSection()}
      </div>
    </div>
  );
}