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
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  const notifications = useSelector((state: RootState) => state.notifications.notifications);

  // Track window resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
        return windowWidth < 640 ? 'HH:mm' : 'HH:mm, dd MMM';
      case '1d':
        return windowWidth < 640 ? 'dd MMM' : 'dd MMM';
      default:
        return windowWidth < 640 ? 'dd MMM' : 'dd MMM yy';
    }
  };

  // Format time labels
  const formatTimeLabel = (time: number) => {
    return format(new Date(time), getTimeFormat());
  };

  // Calculate dynamic point radius based on screen size and data points
  const getPointRadius = () => {
    if (timeInterval === '30d') return 0;
    if (windowWidth < 640) return 1;
    return 2;
  };

  // Dynamic max ticks based on screen width
  const getMaxTicksLimit = () => {
    if (windowWidth < 480) return 5;
    if (windowWidth < 640) return 7;
    if (windowWidth < 1024) return 8;
    return timeInterval === '30d' ? 10 : 12;
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
        pointRadius: getPointRadius(),
        pointHoverRadius: windowWidth < 640 ? 4 : 6,
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
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        type: 'category' as const,
        title: {
          display: windowWidth >= 640,
          text: 'Time',
        },
        ticks: {
          maxTicksLimit: getMaxTicksLimit(),
          maxRotation: windowWidth < 640 ? 90 : 45,
          minRotation: windowWidth < 640 ? 45 : 0,
          font: {
            size: windowWidth < 640 ? 8 : 12,
          }
        },
        grid: {
          display: false,
        },
      },
      y: {
        position: 'left' as const,
        title: {
          display: windowWidth >= 640,
          text: 'Price (USD)',
        },
        ticks: {
          callback: function (tickValue: string | number) {
            const value = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
            // Simpler formatting for mobile
            if (windowWidth < 640) {
              return value >= 1000 ? `$${Math.round(value)}` : `$${value.toFixed(1)}`;
            }
            return value >= 1000 ? `$${value.toLocaleString()}` : `$${value.toFixed(2)}`;
          },
          font: {
            size: windowWidth < 640 ? 10 : 12,
          }
        },
      },
      ...(showVolume ? {
        y1: {
          position: 'right' as const,
          title: {
            display: windowWidth >= 640,
            text: windowWidth < 768 ? 'Vol (M)' : 'Volume (Million USD)',
          },
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            font: {
              size: windowWidth < 640 ? 10 : 12,
            }
          }
        }
      } : {}),
    },
    plugins: {
      legend: {
        position: 'top' as const,
        display: windowWidth >= 480,
        labels: {
          font: {
            size: windowWidth < 768 ? 10 : 12,
          },
          boxWidth: windowWidth < 768 ? 10 : 16,
        }
      },
      title: {
        display: false, // Hide title - we have our own h3 heading
      },
      tooltip: {
        titleFont: {
          size: windowWidth < 640 ? 10 : 14,
        },
        bodyFont: {
          size: windowWidth < 640 ? 10 : 14,
        },
        callbacks: {
          label: function (context: TooltipItem<'line'>) {
            if (context.dataset.label?.includes('Price')) {
              return `Price: $${parseFloat(context.raw as string).toLocaleString(undefined, {
                minimumFractionDigits: windowWidth < 640 ? 1 : 2,
                maximumFractionDigits: windowWidth < 640 ? 2 : 6
              })}`;
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
    <div className="mt-4 w-full p-2 sm:p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex flex-col mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{cryptoId.toUpperCase()} Price History</h3>

        <div className="flex flex-col sm:flex-row gap-2">
          {percentChange !== null && (
            <div className={`text-xs sm:text-sm px-2 py-1 rounded-full font-medium inline-flex items-center justify-center w-fit ${percentChange >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
              {percentChange >= 0 ? '↑' : '↓'} {Math.abs(percentChange).toFixed(2)}%
            </div>
          )}

          <div className="flex flex-wrap gap-1">
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

            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-1 text-xs rounded-md ${showVolume ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
            >
              {windowWidth < 640 ? 'Vol' : (showVolume ? 'Hide Volume' : 'Show Volume')}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-2 sm:p-3 mb-4 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-md text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48 sm:h-64">
          <div className="w-10 h-10 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {priceData.length === 0 ? (
            <p className="text-center py-10 sm:py-16 text-sm sm:text-base">No price data available for {cryptoId}.</p>
          ) : (
            <div className="h-52 sm:h-64 md:h-80 lg:h-96">
              <Line data={chartData} options={options} />
            </div>
          )}

          <div className="mt-2 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <div className="flex flex-col xs:flex-row justify-between gap-1">
              <span>Updated: {priceData.length > 0 ? formatTimeLabel(priceData[priceData.length - 1].time) : '-'}</span>
              <span>Source: CoinCap</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}