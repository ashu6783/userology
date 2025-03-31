'use client';
import React from 'react';
import CityDetails from '../../../components/city/CityDetails';
import WeatherHistoryChart from '../../../components/city/WeatherHistoryChart';

interface CityPageProps {
    params?: { id?: string };
}

export default function CityPage({ params }: CityPageProps) {
    if (!params?.id) {
        return <p className="text-red-500">Invalid city ID</p>;
    }

    return (
        <div>
            <CityDetails city={params.id} />
            <WeatherHistoryChart city={params.id} />
        </div>
    );
}
