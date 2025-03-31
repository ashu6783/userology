'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWeather } from '../../lib/api/weather';
import { fetchWeatherStart, fetchWeatherSuccess, fetchWeatherFailure } from '../../redux/slices/weatherSlice';
import { RootState, AppDispatch } from '../../redux/store';
import Card from '../ui/Card';

interface WeatherItem {
    city: string;
    temperature: number;
    description: string;
    date: string;
}

export default function WeatherSection() {
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading, error } = useSelector((state: RootState) => state.weather);

    useEffect(() => {
        const cities = ['New York', 'London', 'Tokyo'];

        const fetchCitiesWeather = async () => {
            try {
                dispatch(fetchWeatherStart());
                const results = await Promise.all(cities.map(city => fetchWeather(city)));

                const formattedData = results.map((result, index) => ({
                    city: cities[index], // ✅ Fix: Include city name in the response
                    temperature: result.main.temp,
                    description: result.weather[0].description,
                    date: new Date().toISOString(),
                }));

                dispatch(fetchWeatherSuccess(formattedData));
            } catch (err) {
                dispatch(fetchWeatherFailure(err instanceof Error ? err.message : 'Failed to fetch weather'));
            }
        };

        fetchCitiesWeather();
    }, [dispatch]);

    if (loading) return <Card><p>Loading...</p></Card>;
    if (error) return <Card><p className="text-red-500">Error: {error}</p></Card>;

    return (
        <Card>
            <h2 className="text-xl font-bold text-black">Weather</h2>
            {data.map((item: WeatherItem, index: number) => (
                <div key={index} className="mt-2 p-3 bg-black rounded-md">
                    <h3 className="font-semibold text-white">{item.city}</h3> {/* ✅ Fix: Display the city name */}
                    <p className='font-semibold text-white'>{item.temperature.toFixed(1)}°C, {item.description}</p>
                    <p className="text-xs text-gray-500">Updated: {new Date(item.date).toLocaleString()}</p>
                </div>
            ))}
        </Card>
    );
}
