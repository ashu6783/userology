import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  TooltipItem,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { RootState } from '../../redux/store';
import { format } from 'date-fns';

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler);

interface PriceHistoryChartProps {
  cryptoId: string;
}

const fetchPriceHistory = async (cryptoId: string) => {
  console.log(`Fetching history for ${cryptoId}, days: 7`);
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=7&interval=daily`
  );

  if (!response.ok) throw new Error(`Failed to fetch price history: ${response.statusText}`);

  const { prices, market_caps, total_volumes } = await response.json();
  const history = prices.map((price: [number, number], index: number) => ({
    time: price[0],
    priceUsd: price[1].toString(),
    marketCap: market_caps[index][1].toString(),
    volume: total_volumes[index][1].toString(),
  }));
  console.log(`Fetched ${history.length} data points for ${cryptoId}`);
  return history;
};

export default function PriceHistoryChart({ cryptoId }: PriceHistoryChartProps) {
  const [priceData, setPriceData] = useState<
    Array<{
      priceUsd: string;
      time: number;
      volume?: string;
      marketCap?: string;
    }>  
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showVolume, setShowVolume] = useState<boolean>(false); // Volume toggle state
  const [percentChange, setPercentChange] = useState<number | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

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

  // Load 1-week history
  const loadHistory = React.useCallback(async () => {
    console.log('Loading history for 1W');
    setLoading(true);
    setError(null);

    try {
      const history = await fetchPriceHistory(cryptoId);

      if (history.length === 0) {
        setError(`No price data available for ${cryptoId} in 1W interval.`);
        setPriceData([]);
        return;
      }

      console.log(`Fetched ${history.length} data points for 1W`);
      setPriceData(history);

      // Calculate percent change
      if (history.length > 1) {
        const firstPrice = parseFloat(history[0].priceUsd);
        const lastPrice = parseFloat(history[history.length - 1].priceUsd);
        const change = ((lastPrice - firstPrice) / firstPrice) * 100;
        setPercentChange(change);
      } else {
        setPercentChange(null);
      }
    } catch (err) {
      console.error('Error fetching price history:', err);
      setError('Failed to load price data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [cryptoId]);

  // Initial data load
  useEffect(() => {
    loadHistory();
  }, [cryptoId, loadHistory]);

  // Update chart with real-time polling data
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
          volume: priceData[priceData.length - 1]?.volume,
          marketCap: priceData[priceData.length - 1]?.marketCap,
        };

        setPriceData((prev) => {
          const updated = [...prev.slice(-7), newPrice]; // Keep ~7 days worth
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
  }, [notifications, cryptoId, priceData]); // Include priceData as a dependency

  // Time format for 1W (e.g., "dd MMM")
  const getTimeFormat = () => {
    return windowWidth < 640 ? 'dd MMM' : 'dd MMM';
  };

  // Format time labels
  const formatTimeLabel = (time: number) => {
    return format(new Date(time), getTimeFormat());
  };

  // Calculate dynamic point radius
  const getPointRadius = () => {
    if (windowWidth < 640) return 1;
    return 2;
  };

  // Dynamic max ticks for 1W
  const getMaxTicksLimit = () => {
    if (windowWidth < 480) return 5;
    if (windowWidth < 640) return 7;
    return 8;
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
      ...(showVolume && priceData[0]?.volume
        ? [
            {
              label: `${cryptoId.toUpperCase()} Volume (USD)`,
              data: priceData.map((d) => (d.volume ? parseFloat(d.volume) / 1000000 : 0)),
              fill: false,
              borderColor: 'rgba(153, 102, 255, 1)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              borderDash: [5, 5],
              tension: 0.1,
              pointRadius: 0,
              yAxisID: 'y1',
            },
          ]
        : []),
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        type: 'category',
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
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: windowWidth >= 640,
          text: 'Price (USD)',
        },
        ticks: {
          callback: function (tickValue: string | number) {
            const value = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
            if (windowWidth < 640) {
              return value >= 1000 ? `$${Math.round(value)}` : `$${value.toFixed(1)}`;
            }
            return value >= 1000 ? `$${value.toLocaleString()}` : `$${value.toFixed(2)}`;
          },
          font: {
            size: windowWidth < 640 ? 10 : 12,
          },
        },
      },
      ...(showVolume && priceData[0]?.volume
        ? {
            y1: {
              type: 'linear',
              position: 'right',
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
                },
                callback: (tickValue: string | number) => {
                  const value = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
                  return `${value.toFixed(1)}M`;
                },
              },
            },
          }
        : {}),
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'line'>) {
            const label = context.dataset.label || '';
            if (label.includes('Volume')) {
              return `${label}: ${parseFloat(context.formattedValue).toFixed(2)}M USD`;
            }
            return `${label}: $${parseFloat(context.formattedValue).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: windowWidth < 640 ? 10 : 12,
          },
        },
      },
    },
  };

  return (
    <div className="relative w-full h-[300px] sm:h-[400px]">
      {loading && <div className="text-center text-sm">Loading chart...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {!loading && !error && priceData.length > 0 && (
        <Line data={chartData} options={options} />
      )}
      <div className="absolute top-2 right-2 text-xs sm:text-sm font-medium">
        {percentChange !== null && (
          <span className={percentChange >= 0 ? 'text-green-500' : 'text-red-500'}>
            {percentChange >= 0 ? '+' : ''}
            {percentChange.toFixed(2)}%
          </span>
        )}
      </div>
      <div className="absolute bottom-2 left-2">
        <label className="text-xs text-white">
          Show Volume
          <input
            type="checkbox"
            checked={showVolume}
            onChange={() => setShowVolume((prev) => !prev)}
            className="ml-2"
          />
        </label>
      </div>
    </div>
  );
}
