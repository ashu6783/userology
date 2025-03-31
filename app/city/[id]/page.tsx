'use client';
import React from 'react';
import CityDetails from '../../../components/city/CityDetails';
import WeatherHistoryChart from '../../../components/city/WeatherHistoryChart';

interface CityPageProps {
    params: { id: string };
}

export default function CityPage({ params }: CityPageProps) {
    const cityId = params.id;

    return (
        <div>
            <CityDetails city={cityId} />
            <WeatherHistoryChart city={cityId} />
        </div>
    );
}
