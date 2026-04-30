'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-black/8">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid grid-cols-3 items-center h-16">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center group-hover:bg-black/80 transition-colors">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg group-hover:text-black/70 transition-colors">Spotly</span>
          </Link>

          {/* Center: Nav links — perfectly centered */}
          <nav className="hidden md:flex items-center justify-center gap-8">
            <Link href="/explore" className="text-sm text-black/60 hover:text-black transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1.5px] after:bg-black after:transition-all hover:after:w-full">Explore</Link>
            <Link href="/submit" className="text-sm text-black/60 hover:text-black transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1.5px] after:bg-black after:transition-all hover:after:w-full">Submit a Spot</Link>
          </nav>

          {/* Right: Auth buttons */}
          <div className="hidden md:flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-black/60 hover:text-black hover:bg-black/5 px-4 h-9 rounded-full transition-all"
            >
              Sign In
            </Button>
            <Link href="/explore">
              <Button
                size="sm"
                className="text-sm bg-black text-white hover:bg-black/75 px-5 h-9 rounded-full transition-all shadow-sm hover:shadow-md"
              >
                Get Started →
              </Button>
            </Link>
          </div>

          {/* Mobile: Hamburger */}
          <div className="flex md:hidden justify-end">
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-black/10">
          <div className="px-4 py-4 space-y-4">
            <Link href="/explore" className="block text-sm text-black/60">Explore</Link>
            <Link href="/submit" className="block text-sm text-black/60">Submit a Spot</Link>
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm" className="flex-1">Sign In</Button>
              <Button className="flex-1 bg-black text-white hover:bg-black/90" size="sm">Get Started</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
