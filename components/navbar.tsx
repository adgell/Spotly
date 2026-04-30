'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-black/8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Use flex + justify-between for proper alignment */}
        <div className="flex items-center justify-between h-16">
          {/* Logo - left */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center group-hover:bg-black/80 transition-colors">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg group-hover:text-black/70 transition-colors">Spotly</span>
          </Link>

          {/* Desktop navigation - center (hidden on mobile) */}
          <nav className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            <Link href="/explore" className="text-sm text-black/60 hover:text-black transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1.5px] after:bg-black after:transition-all hover:after:w-full">
              Explore
            </Link>
            <Link href="/submit" className="text-sm text-black/60 hover:text-black transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1.5px] after:bg-black after:transition-all hover:after:w-full">
              Submit a Spot
            </Link>
          </nav>

          {/* Desktop auth buttons - right (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-2">
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

          {/* Mobile hamburger - far right */}
          <button
            className="flex md:hidden p-2 -mr-2" // negative margin to align perfectly
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-black/10 animate-in slide-in-from-top duration-200">
          <div className="px-4 py-4 space-y-4">
            <Link
              href="/explore"
              className="block text-sm text-black/60 py-2 hover:text-black transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore
            </Link>
            <Link
              href="/submit"
              className="block text-sm text-black/60 py-2 hover:text-black transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Submit a Spot
            </Link>
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm" className="flex-1">
                Sign In
              </Button>
              <Link href="/explore" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-black text-white hover:bg-black/90" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}