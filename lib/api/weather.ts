import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

interface WeatherData {
  name: string;
  main: { temp: number; humidity: number };
  weather: { description: string }[];
}

export const fetchWeather = async (city: string): Promise<WeatherData> => {
  const response = await axios.get(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
  return response.data;
};