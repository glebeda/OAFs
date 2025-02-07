import { FaFutbol, FaChartBar, FaHistory, FaCog } from 'react-icons/fa';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="py-16 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-gray-800">
            Old Aged Footballers
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Welcome to your football community hub. Track games, celebrate victories, and keep the spirit of football alive!
          </p>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="px-8 pb-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Enter Game Details Card */}
          <Link href="/game/new" className="group">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 text-center cursor-pointer border border-gray-100 hover:border-blue-500">
              <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FaFutbol className="text-white text-2xl" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Enter Game Details</h2>
              <p className="text-gray-600">Record a new game with our easy-to-use wizard</p>
            </div>
          </Link>

          {/* Dashboard Card */}
          <Link href="/dashboard" className="group">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 text-center cursor-pointer border border-gray-100 hover:border-green-500">
              <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FaChartBar className="text-white text-2xl" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Dashboard</h2>
              <p className="text-gray-600">View leaderboards, stats, and season highlights</p>
            </div>
          </Link>

          {/* Games Archive Card */}
          <Link href="/games" className="group">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 text-center cursor-pointer border border-gray-100 hover:border-purple-500">
              <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FaHistory className="text-white text-2xl" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Games Archive</h2>
              <p className="text-gray-600">Browse through past games and results</p>
            </div>
          </Link>

          {/* Admin Card */}
          <Link href="/admin" className="group">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 text-center cursor-pointer border border-gray-100 hover:border-orange-500">
              <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FaCog className="text-white text-2xl" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Admin</h2>
              <p className="text-gray-600">Manage players and system settings</p>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
