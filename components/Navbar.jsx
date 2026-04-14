'use client';
// components/Navbar.jsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck } from 'lucide-react';

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/shipper', label: 'Shipper' },
  { href: '/auction', label: '⚡ Auction', hot: true },
  { href: '/driver', label: 'Driver' },
  { href: '/leaderboard', label: '🏆 Ranks' },
  { href: '/carbon', label: 'Carbon' },
  { href: '/heatmap', label: 'Heatmap' },
  { href: '/ai-assistant', label: '🤖 AI Chat', hot: true },
  { href: '/algorithm', label: 'AI Engine' },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-blue-700">
          <Truck size={20} />
          GhostHaul
        </Link>
        <div className="flex gap-1 flex-wrap">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors relative ${
                pathname === l.href
                  ? 'bg-blue-50 text-blue-800 font-medium'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}>
              {l.label}
              {l.hot && pathname !== l.href && (
                <span style={{ position: 'absolute', top: 2, right: 2, width: 5, height: 5, borderRadius: '50%', background: '#E24B4A', display: 'inline-block' }} />
              )}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
          Live
        </div>
      </div>
    </nav>
  );
}
