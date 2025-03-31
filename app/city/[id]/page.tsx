import React from 'react';
import CityDetails from '../../../components/city/CityDetails';
import WeatherHistoryChart from '../../../components/city/WeatherHistoryChart';

// Define the context interface for the route handler
interface RouteHandlerContext {
    params: Promise<{ id: string }>;
}

export default async function CityPage(context: RouteHandlerContext) {
    const params = await context.params; // Await the Promise to get { id: string }
    const cityId = params.id; // Access id from the resolved params

    return (
        <div className="p-4">
            <CityDetails city={cityId} />
            <WeatherHistoryChart city={cityId} />
        </div>
    );
}