'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaFileAlt, FaFutbol, FaHistory, FaTrophy, FaUsers } from 'react-icons/fa';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Minimal Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center">
              <Image
                src="/logo192.png"
                alt="OAFs Logo"
                width={32}
                height={32}
                className="mr-3"
              />
              <span className="text-xl font-semibold text-gray-900">OAFs</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Content Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Old Age Footballers
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to your football community hub
          </p>
        </div>

        {/* Navigation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* New Game Card */}
          <Link href="/games/new" className="transform transition-all duration-300 hover:scale-105 h-full">
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-8 flex flex-col items-center transition-all duration-300 h-full">
              <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full mb-6">
                <FaFileAlt className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">New Game</h2>
              <p className="text-gray-600 text-center">Create and set up a new football game</p>
            </div>
          </Link>

          {/* Recent Game Card */}
          <Link href="/games/recent" className="transform transition-all duration-300 hover:scale-105 h-full">
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-8 flex flex-col items-center transition-all duration-300 h-full">
              <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-6">
                <FaFutbol className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Recent Game</h2>
              <p className="text-gray-600 text-center">View and manage the most recent game</p>
            </div>
          </Link>

          {/* Games Archive Card */}
          <Link href="/games/archive" className="transform transition-all duration-300 hover:scale-105 h-full">
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-8 flex flex-col items-center transition-all duration-300 h-full">
              <div className="w-16 h-16 flex items-center justify-center bg-orange-100 rounded-full mb-6">
                <FaHistory className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Games Archive</h2>
              <p className="text-gray-600 text-center">Browse and view past games</p>
            </div>
          </Link>

          {/* Leaderboard Card */}
          <Link href="/leaderboard" className="transform transition-all duration-300 hover:scale-105 h-full">
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-8 flex flex-col items-center transition-all duration-300 h-full">
              <div className="w-16 h-16 flex items-center justify-center bg-yellow-100 rounded-full mb-6">
                <FaTrophy className="w-8 h-8 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Leaderboard</h2>
              <p className="text-gray-600 text-center">View player rankings and statistics</p>
            </div>
          </Link>

          {/* Player Management Card */}
          <Link href="/admin" className="transform transition-all duration-300 hover:scale-105 h-full">
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-8 flex flex-col items-center transition-all duration-300 h-full">
              <div className="w-16 h-16 flex items-center justify-center bg-purple-100 rounded-full mb-6">
                <FaUsers className="w-8 h-8 text-purple-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Player Management</h2>
              <p className="text-gray-600 text-center">Add, edit, or remove players</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
