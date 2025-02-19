'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaHome, FaFutbol, FaHistory, FaUsers, FaBars, FaTimes, FaFileAlt, FaTrophy } from 'react-icons/fa';

const navigationItems = [
  { href: '/', label: 'Home', icon: FaHome },
  { href: '/games/new', label: 'New Game', icon: FaFileAlt },
  { href: '/games/recent', label: 'Recent Game', icon: FaFutbol },
  { href: '/games/archive', label: 'Games Archive', icon: FaHistory },
  { href: '/leaderboard', label: 'Leaderboard', icon: FaTrophy },
  { href: '/admin', label: 'Player Management', icon: FaUsers },
];

export default function Navigation() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();

  // Don't show navigation on home page
  if (pathname === '/') return null;

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop Header */}
      <nav className="hidden md:block bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <Image
                  src="/logo192.png"
                  alt="OAFs Logo"
                  width={32}
                  height={32}
                  className="mr-4"
                />
              </Link>
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center h-16 px-4 border-b-2 text-sm font-medium ${
                    isActive(item.href)
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="bg-white shadow">
          <div className="px-4 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/logo192.png"
                alt="OAFs Logo"
                width={32}
                height={32}
                className="mr-2"
              />
              <span className="text-lg font-semibold">Old Age Footballers</span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
            >
              <FaBars className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 bg-gray-600 bg-opacity-75">
            <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl">
              <div className="flex items-center justify-between h-16 px-4 border-b">
                <div className="flex items-center">
                  <Image
                    src="/logo192.png"
                    alt="OAFs Logo"
                    width={32}
                    height={32}
                    className="mr-2"
                  />
                  <span className="text-lg font-semibold">Menu</span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
              <div className="py-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex items-center px-4 py-3 text-base font-medium ${
                      isActive(item.href)
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="mr-4 h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 