import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the structure of a single news article
interface NewsArticle {
  title: string;
  content: string;
  date: string;
}

// Define the state structure for the news slice
interface NewsState {
  data: NewsArticle[]; // Use the NewsArticle interface for better type safety
  loading: boolean;
  error: string | null;
}

// Initial state for the news slice
const initialState: NewsState = {
  data: [],
  loading: false,
  error: null,
};

// Create the news slice
const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    fetchNewsStart(state) {
      state.loading = true;
      state.error = null; // Reset error when starting a new fetch
    },
    fetchNewsSuccess(state, action: PayloadAction<NewsArticle[]>) {
      state.data = action.payload;
      state.loading = false;
    },
    fetchNewsFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

// Export the actions and reducer
export const { fetchNewsStart, fetchNewsSuccess, fetchNewsFailure } = newsSlice.actions;
export default newsSlice.reducer;