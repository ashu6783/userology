import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY;
const BASE_URL = 'https://newsdata.io/api/1/news';

interface NewsArticle {
  title: string;
  content: string;
  date: string;
  link: string;
}

export const fetchCryptoNews = async (): Promise<NewsArticle[]> => {
  const response = await axios.get(`${BASE_URL}?apikey=${API_KEY}&q=cryptocurrency`);
  
  return response.data.results.slice(0, 5).map((article: { 
    title?: string; 
    description?: string; 
    pubDate?: string; 
    link?: string;
  }) => ({
    title: article.title || 'No Title',
    content: article.description || 'No Content',
    date: article.pubDate || 'Unknown Date',
    link: article.link || '#'
  }));
};
