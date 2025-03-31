export default function Sidebar() {
    return (
        <aside className="bg-gray-200 w-64 p-4 hidden md:block">
            <h2 className="text-lg font-semibold">Quick Links</h2>
            <ul>
                <li><a href="#" className="hover:text-blue-600">Favorites</a></li>
                <li><a href="#" className="hover:text-blue-600">Settings</a></li>
            </ul>
        </aside>
    );
}