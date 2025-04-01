'use client';
import { useEffect, useState, lazy, Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import '../lib/chartSetup';


const WeatherSection = lazy(() => import('../components/dashboard/WeatherSection'));
const CryptoSection = lazy(() => import('../components/dashboard/CryptoSection'));
const NewsSection = lazy(() => import('../components/dashboard/NewsSection'));
const PriceHistoryChart = lazy(() => import('@/components/crypto/PriceHistoryChart'));


const LoadingComponent = () => (
  <div className="flex items-center justify-center h-40">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const InitialLoadingScreen = () => (
  <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
    <div className="text-white text-6xl font-bold animate-pulse">Weathereum</div>
    <div className="mt-8 text-white">Loading a goto dashboard experience with real-time updates of crypto and weather...</div>
    <div className="mt-8 text-white">Please wait...</div>
  </div>
);

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const [activeSection, setActiveSection] = useState('weather');
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('Vancouver');

  const cities = ['Vancouver', 'London', 'New York', 'Tokyo', 'Sydney'];

  useEffect(() => {

    dispatch({ type: 'WEBSOCKET_CONNECT' });

    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'weather':
        return (
          <Suspense fallback={<LoadingComponent />}>
            <WeatherSection city={selectedCity} />
          </Suspense>
        );
      case 'crypto':
        return (
          <div className="flex flex-col gap-4 w-full">
            <Suspense fallback={<LoadingComponent />}>
              <CryptoSection />
            </Suspense>
            <Suspense fallback={<LoadingComponent />}>
              <PriceHistoryChart cryptoId="bitcoin" />
            </Suspense>
          </div>
        );
      case 'news':
        return (
          <Suspense fallback={<LoadingComponent />}>
            <NewsSection />
          </Suspense>
        );
      case 'all':
        return (
          <div className="flex flex-col gap-6 w-full">
            <Suspense fallback={<LoadingComponent />}>
              <WeatherSection city={selectedCity} />
            </Suspense>
            <Suspense fallback={<LoadingComponent />}>
              <CryptoSection />
            </Suspense>
            <Suspense fallback={<LoadingComponent />}>
              <PriceHistoryChart cryptoId="bitcoin" />
            </Suspense>
            <Suspense fallback={<LoadingComponent />}>
              <NewsSection />
            </Suspense>
          </div>
        );
      default:
        return (
          <Suspense fallback={<LoadingComponent />}>
            <WeatherSection city={selectedCity} />
          </Suspense>
        );
    }
  };


  if (initialLoading) {
    return <InitialLoadingScreen />;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      {/* City Selection Dropdown */}
      <div className="mb-6">
        <label htmlFor="city-select" className="mr-2 text-lg font-medium text-white">
          Select City:
        </label>
        <select
          id="city-select"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-3 py-2 border rounded-md focus:outline-none text-gray-800 bg-white"
        >
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile-friendly navigation*/}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveSection('weather')}
          className={`px-4 py-2 rounded-md font-semibold flex-1 min-w-[80px] ${activeSection === 'weather'
            ? 'bg-gradient-to-r from-green-500 to-[#29e2e8] text-black'
            : 'bg-gray-200 hover:bg-gray-300'
            }`}
        >
          Weather
        </button>
        <button
          onClick={() => setActiveSection('crypto')}
          className={`px-4 py-2 rounded-md flex-1 min-w-[80px] ${activeSection === 'crypto'
            ? 'bg-gradient-to-r from-green-500 to-[#29e2e8] text-black'
            : 'bg-gray-200 hover:bg-gray-300'
            }`}
        >
          Crypto
        </button>
        <button
          onClick={() => setActiveSection('news')}
          className={`px-4 py-2 rounded-md flex-1 min-w-[80px] ${activeSection === 'news'
            ? 'bg-gradient-to-r from-green-500 to-[#29e2e8] text-black'
            : 'bg-gray-200 hover:bg-gray-300'
            }`}
        >
          News
        </button>
        <button
          onClick={() => setActiveSection('all')}
          className={`px-4 py-2 rounded-md flex-1 min-w-[80px] ${activeSection === 'all'
            ? 'bg-gradient-to-r from-green-500 to-[#29e2e8] text-black'
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