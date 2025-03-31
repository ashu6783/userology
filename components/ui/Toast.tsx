interface ToastProps {
    message: string;
    type: string;
}

export default function Toast({ message, type }: ToastProps) {
    return (
        <div className={`p-2 rounded ${type === 'price_alert' ? 'bg-green-200' : 'bg-yellow-200'}`}>
            {message}
        </div>
    );
}