'use client';
import React from 'react';
import CityDetails from '../../../components/city/CityDetails';
import WeatherHistoryChart from '../../../components/city/WeatherHistoryChart';

export default function CityPage({ params }: { params: { id: string } }) {
    const cityId = params.id;

    return (
        <div>
            <CityDetails city={cityId} />
            <WeatherHistoryChart city={cityId} />
        </div>
    );
}
