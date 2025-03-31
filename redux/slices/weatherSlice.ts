import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  date: string;
}

interface WeatherState {
  data: WeatherData[]; // ✅ Added `city` in the WeatherData type
  loading: boolean;
  error: string | null;
}

const initialState: WeatherState = { data: [], loading: false, error: null };

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    fetchWeatherStart(state) {
      state.loading = true;
      state.error = null; // ✅ Reset error when a new request starts
    },
    fetchWeatherSuccess(state, action: PayloadAction<WeatherData[]>) {
      state.data = action.payload;
      state.loading = false;
    },
    fetchWeatherFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { fetchWeatherStart, fetchWeatherSuccess, fetchWeatherFailure } = weatherSlice.actions;
export default weatherSlice.reducer;
