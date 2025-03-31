import React from 'react';
import CityDetails from '../../../components/city/CityDetails';
import WeatherHistoryChart from '../../../components/city/WeatherHistoryChart';

interface Params {
    id: string;
}

export default async function CityPage({ params }: { params: Promise<Params> }) {
    const resolvedParams = await params;
    const cityId = resolvedParams.id;

    return (
        <div>
            <CityDetails city={cityId} />
            <WeatherHistoryChart city={cityId} />
        </div>
    );
}