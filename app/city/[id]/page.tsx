'use client';
import React, { use } from 'react';
import CityDetails from '../../../components/city/CityDetails';
import WeatherHistoryChart from '../../../components/city/WeatherHistoryChart';

interface RouteHandlerContext {
  params: Promise<{ id: string }>;
}

export default function CityPage({ params }: RouteHandlerContext) {
    const resolvedParams = use(params); // Ensure resolution of promise
    const cityId = resolvedParams.id;

    return (
        <div>
            <CityDetails city={cityId} />
            <WeatherHistoryChart city={cityId} />
        </div>
    );
}
