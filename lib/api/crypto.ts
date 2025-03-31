import axios from 'axios';

const BASE_URL = 'https://api.coincap.io/v2';

interface CryptoData {
  id: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
  marketCapUsd: string;
}

export const fetchCryptoData = async (ids: string[]): Promise<CryptoData[]> => {
  const response = await axios.get(`${BASE_URL}/assets?ids=${ids.join(',')}`);
  return response.data.data;
};