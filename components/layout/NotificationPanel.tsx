'use client';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Card from '../ui/Card';
import { useEffect, useState } from 'react';

export default function NotificationPanel() {
    const notifications = useSelector((state: RootState) => state.notifications.notifications);
    const currentIndex = useSelector((state: RootState) =>
        state.notifications.isFull ?
            (state.notifications.currentIndex - 1 + 8) % 8 : // Get the index of the most recently updated notification
            null
    );
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

    // Highlight the most recently updated notification
    useEffect(() => {
        if (currentIndex !== null) {
            setHighlightedIndex(currentIndex);
            const timer = setTimeout(() => {
                setHighlightedIndex(null);
            }, 600);

            return () => clearTimeout(timer);
        }
    }, [currentIndex, notifications]);

    return (
        <div className="w-full max-w-md mx-auto mt-4">
            <Card className="w-full h-auto min-h-64">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-black">Notifications</h2>
                    <span className="text-sm text-gray-500">
                        {notifications.length}/8
                    </span>
                </div>

                <div className="p-4">
                    {notifications.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No notifications yet.</p>
                    ) : (
                        <ul className="space-y-2">
                            {notifications.map((notification, index) => (
                                <li
                                    key={index}
                                    className={`p-3 rounded transition-colors duration-300 
                                        ${notification.type === 'error' ? 'bg-red-100' : 'bg-[linear-gradient(to_right,_#22c55e,_#29e2e8)]'}
                                        ${index === highlightedIndex ? 'ring-3 ring-black' : ''}`}
                                >
                                    <span className="font-semibold">{notification.type.toUpperCase()}:</span> {notification.message}
                                    <span className="text-sm text-gray-500 block mt-1">
                                        {notification.timestamp && new Date(notification.timestamp).toLocaleTimeString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Card>
        </div>
    );
}