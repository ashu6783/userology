'use client';
import { useEffect, useState } from 'react';

interface WeatherData {
    main: {
        temp: number;
        humidity: number;
    };
    weather: { description: string }[];
    name: string;
}

interface WeatherSectionProps {
    city: string;
}

export default function WeatherSection({ city }: WeatherSectionProps) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            setLoading(true);
            setError(null);

            try {
                // Mock coordinates for cities (in production, use OpenWeatherMap's Geocoding API)
                const cityCoordinates: { [key: string]: { lat: number; lon: number } } = {
                    vancouver: { lat: 49.2497, lon: -123.1193 },
                    london: { lat: 51.5074, lon: -0.1278 },
                    'new york': { lat: 40.7128, lon: -74.0060 },
                    tokyo: { lat: 35.6762, lon: 139.6503 },
                    sydney: { lat: -33.8688, lon: 151.2093 },
                };

                const coords = cityCoordinates[city.toLowerCase()];
                if (!coords) {
                    throw new Error(`Coordinates for ${city} not found`);
                }

                const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
                if (!apiKey) {
                    throw new Error('OpenWeatherMap API key not configured');
                }

                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}`;
                const response = await fetch(url);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch weather data');
                }

                const data = await response.json();
                setWeather(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [city]); // Re-fetch when city changes

    if (loading) return <p className="text-gray-500">Loading weather...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!weather) return <p>No weather data available for {city}.</p>;

    return (
        <div className="p-4 border rounded-lg shadow-md bg-white">
            <h3 className="text-lg font-semibold mb-2">Current Weather in {weather.name}</h3>
            <p>Temperature: {(weather.main.temp - 273.15).toFixed(1)}°C</p>
            <p>Condition: {weather.weather[0]?.description || 'N/A'}</p>
            <p>Humidity: {weather.main.humidity}%</p>
        </div>
    );
}