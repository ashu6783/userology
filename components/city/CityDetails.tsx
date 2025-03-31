'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWeather } from '../../lib/api/weather';
import { fetchWeatherStart, fetchWeatherSuccess, fetchWeatherFailure } from '../../redux/slices/weatherSlice';
import { RootState, AppDispatch } from '../../redux/store';
import Card from '../ui/Card';

interface CityDetailsProps {
    city: string;
}

export default function CityDetails({ city }: CityDetailsProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading, error } = useSelector((state: RootState) => state.weather);

    useEffect(() => {
        dispatch(fetchWeatherStart());
        fetchWeather(city)
            .then(result => {
                const transformedResult = {
                    city: result.name, // ✅ Fix: Extract city name from API response
                    temperature: result.main.temp,
                    description: result.weather[0].description,
                    date: new Date().toISOString(),
                };
                dispatch(fetchWeatherSuccess([transformedResult]));
            })
            .catch(err => dispatch(fetchWeatherFailure(err.message)));
    }, [city, dispatch]);

    if (loading) return <Card><p>Loading...</p></Card>;
    if (error) return <Card><p className="text-red-500">Error: {error}</p></Card>;

    if (!data.length) return <Card><p>No weather data available</p></Card>;

    return (
        <Card>
            <h2 className="text-2xl font-bold text-white">{data[0].city} Weather</h2> {/* ✅ Fix applied here */}
            <p>Temperature: {data[0].temperature}°C</p>
            <p>Conditions: {data[0].description}</p>
            <p>Last updated: {new Date(data[0].date).toLocaleString()}</p>
        </Card>
    );
}
