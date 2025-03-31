'use client';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Card from '../ui/Card';

export default function NotificationPanel() {
    const notifications = useSelector((state: RootState) => state.notifications.notifications);

    return (
        <Card className="max-w-md mx-auto mt-4">
            <h2 className="text-xl font-bold text-black">Notifications</h2>
            {notifications.length === 0 ? (
                <p>No notifications yet.</p>
            ) : (
                <ul className="mt-2 space-y-2">
                    {notifications.map((notification, index) => (
                        <li key={index} className={`p-2 rounded ${notification.type === 'error' ? 'bg-red-100' : 'bg-green-100'}`}>
                            <span className="font-semibold">{notification.type.toUpperCase()}:</span> {notification.message}
                            <span className="text-sm text-gray-500 block">
                                {notification.timestamp && new Date(notification.timestamp).toLocaleTimeString()}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}