import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Crypto {
  id: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

interface CryptoState {
  data: Crypto[];
  loading: boolean;
  error: string | null;
}

const initialState: CryptoState = { data: [], loading: false, error: null };

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    fetchCryptoStart(state) {
      state.loading = true;
    },
    fetchCryptoSuccess(state, action: PayloadAction<Crypto[]>) {
      state.data = action.payload;
      state.loading = false;
    },
    fetchCryptoFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { fetchCryptoStart, fetchCryptoSuccess, fetchCryptoFailure } = cryptoSlice.actions;
export default cryptoSlice.reducer;