'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCryptoNews } from '../../lib/api/news';
import { fetchNewsStart, fetchNewsSuccess, fetchNewsFailure } from '../../redux/slices/newsSlice';
import { RootState, AppDispatch } from '../../redux/store';
import Card from '../ui/Card';

interface NewsArticle {
    title: string;
    content?: string;
    date?: string;
    link?: string;  // ✅ Ensuring link is included
}

export default function NewsSection() {
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading, error } = useSelector((state: RootState) => state.news) as {
        data: NewsArticle[];
        loading: boolean;
        error: string | null;
    };

    useEffect(() => {
        dispatch(fetchNewsStart());
        fetchCryptoNews()
            .then(results => {
                results.forEach(article => console.log("News Link:", article.link)); // ✅ Log each news link
                dispatch(fetchNewsSuccess(results.map(article => ({
                    title: article.title,
                    content: article.content || '',
                    date: article.date || '',
                    link: article.link || '#'
                }))));
            })
            .catch(err => dispatch(fetchNewsFailure(err.message)));
    }, [dispatch]);

    if (loading) return <Card><p>Loading...</p></Card>;
    if (error) return <Card><p className="text-red-500">Error: {error}</p></Card>;

    return (
        <Card>
            <h2 className="text-xl font-bold text-black">News</h2>
            {data.map((article, index) => (
                <div key={index} className="mt-2">
                    {/* ✅ Clickable title */}
                    <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-semibold hover:underline cursor-pointer"
                        onClick={() => console.log("Opening Link:", article.link)} // ✅ Log when clicking the link
                    >
                        {article.title}
                    </a>
                    <p className="text-gray-700">{article.content}</p>
                    <p className="text-gray-500 text-sm">{article.date}</p>
                </div>
            ))}
        </Card>
    );
}
