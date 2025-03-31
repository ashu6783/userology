import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="bg-gray-800 text-white p-4 fixed bottom-0 w-full">
            <ul className="flex space-x-4 justify-center">
                <li><Link href="/" className="hover:underline">Home</Link></li>
                <li><Link href="/city/new-york" className="hover:underline">Cities</Link></li>
                <li><Link href="/crypto/bitcoin" className="hover:underline">Crypto</Link></li>
            </ul>
        </nav>
    );
}