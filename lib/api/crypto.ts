import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

// Interface for Crypto data response
interface CryptoData {
  id: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

// Interface for the response structure of /simple/price endpoint
interface SimplePriceResponse {
  [key: string]: {
    usd: number;
  };
}

// Fetch crypto data for multiple coins
export const fetchCryptoData = async (ids: string[]): Promise<CryptoData[]> => {
  const response = await axios.get(`${BASE_URL}/coins/markets`, {
    params: {
      vs_currency: 'usd',
      ids: ids.join(','),
      order: 'market_cap_desc',
      per_page: ids.length,
      page: 1,
      sparkline: false,
    },
  });
  return response.data;
};

// Poll crypto prices for multiple coins
export const pollCryptoPrices = async (ids: string[]): Promise<{ [key: string]: string }> => {
  const response = await axios.get<SimplePriceResponse>(`${BASE_URL}/simple/price`, {
    params: {
      ids: ids.join(','),
      vs_currencies: 'usd',
    },
  });

  // Map the response data to the desired format
  const priceData: { [key: string]: string } = {};
  for (const [id, data] of Object.entries(response.data)) {
    priceData[id] = data.usd.toString();
  }
  return priceData;
};
