'use client';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  CategoryScale,
  TooltipItem
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { RootState } from '../../redux/store';
import { format } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  CategoryScale
);

interface PriceHistoryChartProps {
  cryptoId: string;
}

// Time interval options
type TimeInterval = '1h' | '6h' | '12h' | '1d' | '7d' | '30d';

const fetchPriceHistory = async (cryptoId: string, interval: string, days: number) => {
  // Calculate start and end timestamps
  const end = Date.now();
  const start = end - (days * 24 * 60 * 60 * 1000);

  // Adjust interval based on time range
  let apiInterval = 'h1'; // Default hourly
  if (days > 7) apiInterval = 'd1'; // Daily for longer periods

  const response = await fetch(
    `https://api.coincap.io/v2/assets/${cryptoId}/history?interval=${apiInterval}&start=${start}&end=${end}`
  );

  if (!response.ok) throw new Error(`Failed to fetch price history: ${response.statusText}`);

  const { data } = await response.json();
  return data.map((item: { priceUsd: string; time: number; volumeUsd?: string; marketCapUsd?: string }) => ({
    priceUsd: item.priceUsd,
    time: item.time,
    volume: item.volumeUsd,
    marketCap: item.marketCapUsd
  }));
};

export default function PriceHistoryChart({ cryptoId }: PriceHistoryChartProps) {
  const [priceData, setPriceData] = useState<Array<{
    priceUsd: string;
    time: number;
    volume?: string;
    marketCap?: string;
  }>>([]);
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('1d');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showVolume, setShowVolume] = useState<boolean>(false);
  const [percentChange, setPercentChange] = useState<number | null>(null);

  const notifications = useSelector((state: RootState) => state.notifications.notifications);

  // Map time interval to days
  const intervalToDays = React.useMemo(() => ({
    '1h': 1 / 24,
    '6h': 0.25,
    '12h': 0.5,
    '1d': 1,
    '7d': 7,
    '30d': 30
  }), []);

  // Function to load history based on selected interval
  const loadHistory = React.useCallback(async (interval: TimeInterval) => {
    setLoading(true);
    setError(null);

    try {
      const days = intervalToDays[interval];
      const history = await fetchPriceHistory(cryptoId, interval, days);

      // Calculate data points based on interval
      let dataPoints = history;
      if (interval === '1h') {
        dataPoints = history.slice(-24); // Last 24 hours
      } else if (interval === '6h') {
        dataPoints = history.slice(-24 * 6); // Last 6 days hourly
      }

      setPriceData(dataPoints);

      // Calculate percent change
      if (dataPoints.length > 1) {
        const firstPrice = parseFloat(dataPoints[0].priceUsd);
        const lastPrice = parseFloat(dataPoints[dataPoints.length - 1].priceUsd);
        const change = ((lastPrice - firstPrice) / firstPrice) * 100;
        setPercentChange(change);
      }

    } catch (err) {
      console.error('Error fetching price history:', err);
      setError('Failed to load price data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [cryptoId, intervalToDays]);

  // Initial data load
  useEffect(() => {
    loadHistory(timeInterval);
  }, [cryptoId, timeInterval, loadHistory]);

  // Update chart with real-time WebSocket data
  useEffect(() => {
    const latestPriceUpdate = notifications
      .filter((n) => n.type === 'price_alert')
      .reverse()
      .find((n) => n.message.includes(cryptoId));

    if (latestPriceUpdate && priceData.length > 0) {
      const priceMatch = latestPriceUpdate.message.match(/\"([^\"]+)\":\"([^\"]+)\"/);
      if (priceMatch && priceMatch[1] === cryptoId) {
        const newPrice = {
          priceUsd: priceMatch[2],
          time: Date.now(),
        };

        setPriceData((prev) => {
          // Keep appropriate number of data points based on interval
          const sliceIndex = timeInterval === '1h' ? -23 : -prev.length + 1;
          const updated = [...prev.slice(sliceIndex), newPrice];

          // Recalculate percent change
          if (updated.length > 1) {
            const firstPrice = parseFloat(updated[0].priceUsd);
            const lastPrice = parseFloat(updated[updated.length - 1].priceUsd);
            const change = ((lastPrice - firstPrice) / firstPrice) * 100;
            setPercentChange(change);
          }

          return updated;
        });
      }
    }
  }, [notifications, cryptoId, timeInterval, priceData.length]);

  // Determine appropriate time format based on interval
  const getTimeFormat = () => {
    switch (timeInterval) {
      case '1h':
        return 'HH:mm';
      case '6h':
      case '12h':
        return 'HH:mm, dd MMM';
      case '1d':
        return 'dd MMM';
      default:
        return 'dd MMM yy';
    }
  };

  // Format time labels
  const formatTimeLabel = (time: number) => {
    return format(new Date(time), getTimeFormat());
  };

  // Chart configuration
  const chartData = {
    labels: priceData.map((d) => formatTimeLabel(d.time)),
    datasets: [
      {
        label: `${cryptoId.toUpperCase()} Price (USD)`,
        data: priceData.map((d) => parseFloat(d.priceUsd)),
        fill: 0.2,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.3,
        pointRadius: timeInterval === '30d' ? 0 : 2,
        pointHoverRadius: 6,
      },
      ...(showVolume && priceData[0]?.volume ? [{
        label: `${cryptoId.toUpperCase()} Volume (USD)`,
        data: priceData.map((d) => d.volume ? parseFloat(d.volume) / 1000000 : 0),
        fill: false,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderDash: [5, 5],
        tension: 0.1,
        pointRadius: 0,
        yAxisID: 'y1',
      }] : []),
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        type: 'category' as const,
        title: {
          display: true,
          text: 'Time',
        },
        ticks: {
          maxTicksLimit: timeInterval === '30d' ? 10 : 12,
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          display: false,
        },
      },
      y: {
        position: 'left' as const,
        title: {
          display: true,
          text: 'Price (USD)',
        },
        ticks: {
          callback: function (tickValue: string | number) {
            const value = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
            return value >= 1000 ? `$${value.toLocaleString()}` : `$${value.toFixed(2)}`;
          },
        },
      },
      ...(showVolume ? {
        y1: {
          position: 'right' as const,
          title: {
            display: true,
            text: 'Volume (Million USD)',
          },
          grid: {
            drawOnChartArea: false,
          },
        }
      } : {}),
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${cryptoId.toUpperCase()} Price History`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'line'>) {
            if (context.dataset.label?.includes('Price')) {
              return `Price: $${parseFloat(context.raw as string).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
            } else if (context.dataset.label?.includes('Volume')) {
              return `Volume: $${((context.raw as number) * 1000000).toLocaleString()} USD`;
            }
            return context.dataset.label;
          }
        }
      }
    },
  };

  // Handle interval change
  const handleIntervalChange = (interval: TimeInterval) => {
    setTimeInterval(interval);
  };

  return (
    <div className="mt-4 w-max p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h3 className="text-xl font-semibold text-white">{cryptoId.toUpperCase()} Price History</h3>

        <div className="mt-2 md:mt-0 flex flex-wrap gap-2">
          {percentChange !== null && (
            <div className={`text-sm px-3 py-1 rounded-full font-medium ${percentChange >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
              {percentChange >= 0 ? '↑' : '↓'} {Math.abs(percentChange).toFixed(2)}%
            </div>
          )}

          <div className="flex gap-1">
            <button
              onClick={() => handleIntervalChange('1h')}
              className={`px-2 py-1 text-xs rounded-md ${timeInterval === '1h' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
            >
              1H
            </button>
            <button
              onClick={() => handleIntervalChange('6h')}
              className={`px-2 py-1 text-xs rounded-md ${timeInterval === '6h' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
            >
              6H
            </button>
            <button
              onClick={() => handleIntervalChange('1d')}
              className={`px-2 py-1 text-xs rounded-md ${timeInterval === '1d' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
            >
              1D
            </button>
            <button
              onClick={() => handleIntervalChange('7d')}
              className={`px-2 py-1 text-xs rounded-md ${timeInterval === '7d' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
            >
              1W
            </button>
            <button
              onClick={() => handleIntervalChange('30d')}
              className={`px-2 py-1 text-xs rounded-md ${timeInterval === '30d' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
            >
              1M
            </button>
          </div>

          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2 py-1 text-xs rounded-md ${showVolume ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
          >
            {showVolume ? 'Hide Volume' : 'Show Volume'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {priceData.length === 0 ? (
            <p className="text-center py-16">No price data available for {cryptoId}.</p>
          ) : (
            <div className="h-64 md:h-96">
              <Line data={chartData} options={options} />
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Last updated: {priceData.length > 0 ? formatTimeLabel(priceData[priceData.length - 1].time) : '-'}</span>
              <span>Data source: CoinCap API</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}