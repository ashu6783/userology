'use client';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface WeatherHistory {
    date: string;
    tavg: number;
    tmin: number;
    tmax: number;
}

interface WeatherHistoryChartProps {
    city: string;
}

export default function WeatherHistoryChart({ city }: WeatherHistoryChartProps) {
    const [history, setHistory] = useState<WeatherHistory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeatherHistory = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/weather/history?city=${encodeURIComponent(city)}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch weather data");
                }

                const data = await response.json();
                setHistory(data || []);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        if (city) {
            fetchWeatherHistory();
        }
    }, [city]);

    if (loading) return <p>Loading weather history...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (history.length === 0) return <p>No weather data available for {city}.</p>;

    const data = {
        labels: history.map(entry => new Date(entry.date).toLocaleDateString()),
        datasets: [
            {
                label: 'Average Temperature (°C)',
                data: history.map(entry => entry.tavg),
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                tension: 0.4,
            },
            {
                label: 'Min Temperature (°C)',
                data: history.map(entry => entry.tmin),
                fill: false,
                borderColor: 'rgba(54,162,235,1)',
                backgroundColor: 'rgba(54,162,235,0.2)',
                tension: 0.4,
            },
            {
                label: 'Max Temperature (°C)',
                data: history.map(entry => entry.tmax),
                fill: false,
                borderColor: 'rgba(255,99,132,1)',
                backgroundColor: 'rgba(255,99,132,0.2)',
                tension: 0.4,
            },
        ],
    };

    const options: import('chart.js').ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            legend: { display: true },
            tooltip: {
                callbacks: {
                    label: function (context: import('chart.js').TooltipItem<'line'>): string {
                        const label = context.dataset.label || '';
                        return `${label}: ${context.parsed.y}°C`;
                    }
                }
            },
        },
        scales: {
            x: { title: { display: true, text: 'Date' } },
            y: { title: { display: true, text: 'Temperature (°C)' } },
        },
    };

    return (
        <div className="mt-4 p-4 border rounded-lg shadow-md bg-white">
            <h3 className="text-lg font-semibold mb-2">{city} - Weather History</h3>
            <Line data={data} options={options} />
        </div>
    );
}