'use client';
import { ReactNode } from 'react';
import { Provider } from '../redux/provider';
import Header from '../components/layout/Header';
// import Sidebar from '../components/layout/Sidebar';
import NotificationPanel from '../components/layout/NotificationPanel';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <Provider>
          <Header />
          <div className="flex">
            <main className="flex-1 p-4">{children}</main>
            <NotificationPanel />
          </div>
        </Provider>
      </body>
    </html>
  );
}