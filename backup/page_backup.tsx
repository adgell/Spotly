'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MapPin, Search, ArrowRight, Bookmark, Languages, Wallet, Users, FolderOpen, Globe, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MapWithNoSSR = dynamic(() => import('@/components/leaflet-map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center rounded-2xl">
      <div className="text-white/50">Loading map...</div>
    </div>
  )
});

const categories = ['All', 'Food', 'Coffee', 'Nightlife', 'Culture', 'Shopping'];
const districts = ['All Areas', 'Jing\'an', 'Xuhui', 'French Concession', 'Pudong', 'Hongkou'];
const budgetOptions = ['$', '$$', '$$$'];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All Areas');
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/10">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg">Spotly TEST</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/explore" className="text-sm text-black/60 hover:text-black transition-colors">Explore</Link>
              <Link href="/submit" className="text-sm text-black/60 hover:text-black transition-colors">Submit a Spot</Link>
            </nav>

            <Link href="/explore" className="hidden md:block">
              <Button className="bg-black text-white hover:bg-black/90 rounded-full h-9 px-5 text-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              Discover Shanghai<br />Like a Local
            </h1>
            
            <p className="text-xl text-black/60 mb-8 leading-relaxed">
              Stop juggling Instagram saves, TikTok bookmarks, and scattered pins. 
              All the best local spots, curated for foreigners.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/explore">
                <Button className="bg-black text-white hover:bg-black/90 rounded-full h-12 px-8 text-base gap-2">
                  Start Exploring
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/submit">
                <Button variant="outline" className="border-black/20 text-black hover:bg-black/5 rounded-full h-12 px-8 text-base">
                  Submit a Spot
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm text-black/50">
                <Languages className="w-4 h-4" />
                <span>English + Chinese</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-black/50">
                <Wallet className="w-4 h-4" />
                <span>Budget Friendly</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-black/50">
                <Users className="w-4 h-4" />
                <span>Verified by Locals</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Preview Section */}
      <section className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-[1100px] mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-semibold mb-3">
              Preview the Map
            </h2>
            <p className="text-black/50 text-lg">
              Explore 500+ curated spots across Shanghai
            </p>
          </div>

          {/* Filter Pills Row */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-black/40">Type:</span>
              <div className="flex gap-1.5">
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedCategory === cat 
                        ? 'bg-black text-white' 
                        : 'bg-white text-black/60 border border-black/10 hover:border-black/30'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* District Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-black/40">Area:</span>
              <select 
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-3 py-1.5 rounded-full text-sm bg-white border border-black/10 text-black/70 outline-none cursor-pointer"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Budget Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-black/40">Budget:</span>
              <div className="flex gap-1">
                {budgetOptions.map((budget) => (
                  <button
                    key={budget}
                    onClick={() => setSelectedBudget(selectedBudget === budget ? null : budget)}
                    className={`w-9 h-8 rounded-full text-sm font-medium transition-all ${
                      selectedBudget === budget 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-white text-black/60 border border-black/10 hover:border-black/30'
                    }`}
                  >
                    {budget}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Map Card */}
          <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
            <div className="h-[450px] md:h-[500px]">
              <MapWithNoSSR 
                selectedCategory={selectedCategory}
                selectedBudget={selectedBudget}
              />
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-8">
            <Link href="/explore">
              <Button className="bg-black text-white hover:bg-black/90 rounded-full h-12 px-8 text-base gap-2">
                Explore Full Map
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pain Points - Minimal List */}
      <section className="py-24 px-6">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4">
            Sound familiar?
          </h2>
          <p className="text-black/50 text-lg text-center mb-16">
            Planning a trip to Shanghai shouldn&apos;t feel like a research project.
          </p>

          <div className="space-y-12">
            <div className="flex gap-6">
              <span className="text-5xl font-light text-black/20">01</span>
              <div>
                <h3 className="font-semibold text-xl mb-2">Scattered Saves</h3>
                <p className="text-black/50 leading-relaxed">
                  Instagram reels, TikTok bookmarks, WeChat articles... your recommendations are everywhere except where you need them.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <span className="text-5xl font-light text-black/20">02</span>
              <div>
                <h3 className="font-semibold text-xl mb-2">Tourist Trap Roulette</h3>
                <p className="text-black/50 leading-relaxed">
                  Google shows ads. Dianping is in Chinese. You end up at overpriced spots while gems stay hidden from foreigners.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <span className="text-5xl font-light text-black/20">03</span>
              <div>
                <h3 className="font-semibold text-xl mb-2">Research Overload</h3>
                <p className="text-black/50 leading-relaxed">
                  Hours spent translating menus and cross-referencing reviews. Still not sure if it&apos;s actually good.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Spotly Solves This */}
      <section className="py-24 px-6">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4">
            How Spotly Solves This
          </h2>
          <p className="text-black/50 text-lg text-center mb-14">
            Every feature designed to save you money, time, and disappointment.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-black/10 p-6">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mb-5">
                <Users className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Local-Curated Only</h3>
              <p className="text-black/50 leading-relaxed">
                Every spot handpicked by Shanghai locals who actually live here. No tourist traps, no sponsored listings.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-black/10 p-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-5">
                <Wallet className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Filter by Budget</h3>
              <p className="text-black/50 leading-relaxed">
                See only places that match your budget: Free, $, or $$. Know the cost before you go.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-black/10 p-6">
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center mb-5">
                <MapPin className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Map & List Views</h3>
              <p className="text-black/50 leading-relaxed">
                See everything on an interactive map or browse by category. Find what&apos;s nearby in seconds.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-black/10 p-6">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-5">
                <Bookmark className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Save Your Favorites</h3>
              <p className="text-black/50 leading-relaxed">
                Bookmark places you want to visit. Build your own personalized Shanghai guide in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-semibold mb-2">500+</div>
              <div className="text-black/50">Curated Spots</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-semibold mb-2">12</div>
              <div className="text-black/50">Neighborhoods</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-semibold mb-2">70%</div>
              <div className="text-black/50">Under 50 RMB</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-semibold mb-2">100%</div>
              <div className="text-black/50">Foreigner Tested</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Ready to explore like a local?
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Join thousands of expats discovering the real Shanghai.
          </p>
          <Link href="/explore">
            <Button className="bg-white text-black hover:bg-white/90 rounded-full h-12 px-8 text-base gap-2">
              Start Exploring
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#fafafa] border-t border-black/10">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold">Spotly</span>
              </Link>
              <p className="text-sm text-black/40 max-w-xs">
                The city discovery app for foreigners in China.
              </p>
            </div>

            <div className="flex gap-12 text-sm">
              <div>
                <h4 className="font-medium mb-3">Product</h4>
                <ul className="space-y-2 text-black/50">
                  <li><Link href="/explore" className="hover:text-black transition-colors">Explore</Link></li>
                  <li><Link href="/submit" className="hover:text-black transition-colors">Submit a Spot</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">Legal</h4>
                <ul className="space-y-2 text-black/50">
                  <li><Link href="#" className="hover:text-black transition-colors">Privacy</Link></li>
                  <li><Link href="#" className="hover:text-black transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-black/10 mt-10 pt-6 text-center text-sm text-black/40">
            <p>&copy; 2026 Spotly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
