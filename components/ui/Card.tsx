import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;  // Make className optional
}

export default function Card({ children, className = '' }: CardProps) {
    return <div className={`bg-white p-4 rounded-lg shadow ${className}`}>{children}</div>;
}