'use client';

import Link from 'next/link';
import { FaFutbol, FaHistory, FaUsers, FaFileAlt, FaTrophy } from 'react-icons/fa';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Old Age Footballers
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link href="/games/new" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col items-center text-center">
              <FaFileAlt className="w-12 h-12 text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">New Game</h2>
              <p className="text-gray-600">Create and set up a new football game</p>
            </div>
          </Link>

          <Link href="/games/recent"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col items-center text-center">
              <FaFutbol className="w-12 h-12 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Recent Game</h2>
              <p className="text-gray-600">View and manage the most recent game</p>
            </div>
          </Link>

          <Link href="/games/archive"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col items-center text-center">
              <FaHistory className="w-12 h-12 text-orange-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Games Archive</h2>
              <p className="text-gray-600">Browse and view past games</p>
            </div>
          </Link>

          <Link href="/leaderboard"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col items-center text-center">
              <FaTrophy className="w-12 h-12 text-yellow-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Leaderboard</h2>
              <p className="text-gray-600">View player rankings and statistics</p>
            </div>
          </Link>

          <Link href="/admin"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col items-center text-center">
              <FaUsers className="w-12 h-12 text-purple-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Player Management</h2>
              <p className="text-gray-600">Add, edit, or remove players</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
