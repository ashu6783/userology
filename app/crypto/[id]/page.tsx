'use client';
import React, { use } from 'react';
import CityDetails from '../../../components/city/CityDetails';
import WeatherHistoryChart from '../../../components/city/WeatherHistoryChart';

export default function CityPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const cityId = resolvedParams.id;

    return (
        <div>
            <CityDetails city={cityId} />
            <WeatherHistoryChart city={cityId} />
        </div>
    );
}