import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Define the WeatherData interface with more specificity
interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: {
    description: string;
    id: number; // Adding id for completeness
  }[];
  dt?: number; // Optional timestamp from API
}

// Error handling and type-safe fetch function
export const fetchWeather = async (city: string): Promise<WeatherData> => {
  try {
    if (!API_KEY) {
      throw new Error('OpenWeatherMap API key is missing. Check your environment variables.');
    }

    const response = await axios.get<WeatherData>(
      `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch weather data: ${error.response?.data?.message || error.message}`);
    }
    throw new Error(`Failed to fetch weather data: ${(error as Error).message}`);
  }
};