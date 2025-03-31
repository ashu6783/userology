## Userology Dashboard
A modern, responsive dashboard built with Next.js, TypeScript, and Tailwind CSS. The application provides a user-friendly interface to view weather, cryptocurrency prices, and news, with a dynamic landing page featuring animated text using Framer Motion. The dashboard supports real-time updates via WebSocket (using Redux) and includes a tabbed navigation system for seamless section switching

# Features
# Dynamic Dashboard:
Tabbed navigation to switch between Weather, Crypto, News, and All sections.
Responsive single-column layout for consistent alignment across devices.
# Real-Time Updates:
WebSocket integration using Redux for real-time data updates (e.g., crypto prices).
# Landing Page:
Animated "Userology" text for Lazy Loading.
# Components:
# WeatherSection: Displays current weather data (excluding historical charts).
# CryptoSection: Shows cryptocurrency data.
# NewsSection: Displays news articles.
# PriceHistoryChart: Visualizes cryptocurrency price history using Chart.js.
# Styling:
Tailwind CSS for responsive, utility-first styling.
## Setup
# Prerequisites
Node.js: Version 18.x or higher.
npm: Version 8.x or higher.
# API Keys:
# Crypto API key (e.g., CoinGecko API for CryptoSection and PriceHistoryChart).
# News API key (e.g., NewsAPI for NewsSection).
# Weather API key (e.g., OpenWeatherMap for WeatherSection).
# Installation
Clone the Repository
git clone <repository-url>
cd your-nextjs-project
# Install Dependencies:
npm install

# Set Up Environment Variables: Create a .env.local file in the root directory and add your API keys:
CRYPTO_API_KEY=your-coingecko-api-key
NEWS_API_KEY=your-newsapi-key
OPENWEATHERMAP_API_KEY=your-openweathermap-api-key

# Run the Development Server:


## Usage
Landing Page
URL: / (root route)
Description: Displays an animated "Userology" title using Framer Motion, with a gradient background and a welcome message.
Navigation: Add a button or link to navigate to the dashboard (e.g., /dashboard).

# Dashboard
URL: /dashboard
Description: A tabbed interface with four sections:
Weather: Displays current weather data via WeatherSection.
Crypto: Shows cryptocurrency data (CryptoSection) and a price history chart (PriceHistoryChart for Bitcoin).
News: Displays news articles via NewsSection.
All: Combines all sections in a single view.

# Navigation:
Click the "Weather", "Crypto", "News", or "All" buttons to switch sections.
The active section is highlighted.
Real-Time Updates
The dashboard connects to a WebSocket on mount (via Redux action WEBSOCKET_CONNECT) to enable real-time updates for cryptocurrency prices.
Design Decisions
Architecture
Next.js: Chosen for its server-side rendering, API routes, and file-based routing, which simplify development and deployment.
TypeScript: Used for type safety and better developer experience, especially with complex data structures (e.g., API responses).
Redux: Integrated for state management and WebSocket handling, enabling real-time updates for dynamic data like crypto prices.
UI/UX
Single-Column Layout: A grid grid-cols-1 layout ensures consistent vertical alignment across all screen sizes, improving readability on mobile devices.
Tabbed Navigation: Buttons for section switching (Weather, Crypto, News, All) are styled with Tailwind CSS and use a flex-wrap layout for mobile responsiveness.

# Styling
Tailwind CSS: Adopted for its utility-first approach, enabling rapid development and responsive design without writing custom CSS.
Consistent Theming: Buttons and sections use a cohesive color scheme (e.g., bg-blue-600 for active states, bg-gray-200 for inactive states).

# Component Design
Modularity: Components like WeatherSection, CryptoSection, and NewsSection are self-contained, making them reusable and easy to maintain.
Chart.js for Visualization: Used in PriceHistoryChart to display cryptocurrency price trends, with a focus on simplicity and performance.
Real-Time Data
WebSocket with Redux: A WebSocket connection is established on dashboard load to fetch real-time crypto price updates, ensuring the data stays current without manual refreshes.

# Dependencies
Next.js: Framework for React applications with SSR and API routes.
React: Core library for building UI components.
TypeScript: For type safety and better tooling.
Tailwind CSS: Utility-first CSS framework for styling.
Chart.js & react-chartjs-2: For rendering the crypto price history chart.
Redux & Redux Toolkit: For state management and WebSocket integration.
@types/ packages*: Type definitions for TypeScript compatibility.

npm install next react react-dom typescript @types/node @types/react tailwindcss postcss autoprefixer framer-motion chart.js react-chartjs-2 @reduxjs/toolkit react-redux
