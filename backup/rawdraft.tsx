'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  MapPin, ArrowRight, Bookmark, Languages, Wallet, Users,
  Search, Sparkles, UtensilsCrossed, Coffee, Wine, Landmark, ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/navbar';

const MapWithNoSSR = dynamic(() => import('@/components/leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center rounded-2xl">
      <div className="text-white/50">Loading map...</div>
    </div>
  ),
});

const categories = [
  { name: 'All', icon: Sparkles },
  { name: 'Food', icon: UtensilsCrossed },
  { name: 'Coffee', icon: Coffee },
  { name: 'Nightlife', icon: Wine },
  { name: 'Culture', icon: Landmark },
  { name: 'Shopping', icon: ShoppingBag },
];

const vibes = ['Any Vibe', 'Cozy', 'Solo', 'Date Night', 'With Friends', 'Family', 'Work-Friendly'];

const budgetOptions = [
  { label: 'All', value: null },
  { label: '$', value: '$' },
  { label: '$$', value: '$$' },
  { label: '$$$', value: '$$$' },
];

const painPoints = [
  {
    num: '01',
    title: 'Scattered Saves',
    body: "Instagram reels, TikTok bookmarks, WeChat articles... your recommendations are everywhere except where you need them.",
  },
  {
    num: '02',
    title: 'Tourist Trap Roulette',
    body: "Google shows ads. Dianping is in Chinese. You end up at overpriced spots while gems stay hidden from foreigners.",
  },
  {
    num: '03',
    title: 'Research Overload',
    body: "Hours spent translating menus and cross-referencing reviews. Still not sure if it's actually good.",
  },
];

const features = [
  {
    icon: Users,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    glowColor: 'rgba(255,228,230,0.6)',
    title: 'Local-Curated Only',
    body: 'Every spot handpicked by Shanghai locals who actually live here. No tourist traps, no sponsored listings.',
  },
  {
    icon: Wallet,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    glowColor: 'rgba(209,250,229,0.6)',
    title: 'Filter by Budget',
    body: 'See only places that match your budget: Free, $, or $$. Know the cost before you go.',
  },
  {
    icon: MapPin,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-500',
    glowColor: 'rgba(224,242,254,0.6)',
    title: 'Map & List Views',
    body: "See everything on an interactive map or browse by category. Find what's nearby in seconds.",
  },
  {
    icon: Bookmark,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    glowColor: 'rgba(254,243,199,0.6)',
    title: 'Save Your Favorites',
    body: 'Bookmark places you want to visit. Build your own personalized Shanghai guide in seconds.',
  },
];

const districts = [
  {
    name: 'French Concession',
    chinese: '法租界',
    vibe: 'artsy & walkable',
    count: 87,
    img: '/district-ffc.jpg',
    description: 'The most sought-after neighborhood in Shanghai. Tree-lined lanes, independent cafes, vintage boutiques, and some of the best brunch spots in the city.',
    tags: ['Cafes', 'Brunch', 'Shopping', 'Nightlife'],
  },
  {
    name: "Jing'an",
    chinese: '静安',
    vibe: 'temples & towers',
    count: 64,
    img: '/district-jingan.jpg',
    description: "Ancient temple meets modern skyline. The Jing'an Temple sits steps from luxury malls and rooftop bars. Culture and nightlife in one district.",
    tags: ['Culture', 'Rooftop Bars', 'Fine Dining', 'Shopping'],
  },
  {
    name: 'Xintiandi',
    chinese: '新天地',
    vibe: 'trendy & upscale',
    count: 45,
    img: '/district-xintiandi.jpg',
    description: 'Restored shikumen architecture turned into a premium dining and entertainment district. The go-to for date nights and weekend brunches.',
    tags: ['Date Night', 'Brunch', 'Cocktails', 'Architecture'],
  },
  {
    name: 'Hongkou',
    chinese: '虹口',
    vibe: 'local & hidden',
    count: 34,
    img: '/district-hongkou.jpg',
    description: "Off the tourist radar and proud of it. Raw creative energy, underground art spaces, and local food joints that haven't been discovered yet.",
    tags: ['Hidden Gems', 'Art', 'Local Food', 'Authentic'],
  },
  {
    name: 'Pudong',
    chinese: '浦东',
    vibe: 'modern & vast',
    count: 41,
    img: '/district-pudong.jpg',
    description: "Home to the Pearl Tower and Shanghai's most iconic skyline. Modern observation decks, world-class hotels, and the financial heart of China.",
    tags: ['Skyline', 'Landmarks', 'Hotels', 'Modern'],
  },
];

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function PainItem({ num, title, body, index }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="pain-item flex gap-8 items-start group" style={{ '--delay': `${index * 130}ms` }}>
      <span className="pain-num flex-shrink-0 text-5xl font-semibold leading-none tracking-tight select-none">{num}</span>
      <div className="pt-1">
        <h3 className="font-semibold text-xl mb-2 tracking-tight text-black">{title}</h3>
        <p className="text-black/50 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, iconBg, iconColor, glowColor, title, body, index }) {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className="feature-card group relative bg-white rounded-2xl border border-black/10 p-6 overflow-hidden transition-all duration-300 hover:border-black/20 hover:shadow-lg"
      style={{ '--delay': `${index * 90}ms`, '--glow': glowColor }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 15% 15%, var(--glow) 0%, transparent 60%)` }} />
      <div className={`relative w-12 h-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="relative font-semibold text-lg mb-2 tracking-tight text-black">{title}</h3>
      <p className="relative text-black/50 leading-relaxed">{body}</p>
    </div>
  );
}

function HeroSection() {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);

  useEffect(() => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;
    const update = () => {
      const x = mouseRef.current.x * -12;
      const y = mouseRef.current.y * -6 + scrollRef.current * 0.3;
      img.style.transform = `translate(${x}px, ${y}px)`;
    };
    const onScroll = () => { scrollRef.current = window.scrollY; update(); };
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width - 0.5;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height - 0.5;
      update();
    };
    const onMouseLeave = () => { mouseRef.current = { x: 0, y: 0 }; update(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
    return () => {
      window.removeEventListener('scroll', onScroll);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <section className="w-full bg-white">
      <div ref={containerRef} className="w-full overflow-hidden relative" style={{ height: '48vh', minHeight: '280px', maxHeight: '460px' }}>
        <img
          ref={imgRef}
          src="/shanghai-hero.jpg"
          alt="Shanghai skyline"
          style={{ width: '100%', height: '130%', objectFit: 'cover', objectPosition: 'center 45%', willChange: 'transform', display: 'block', marginLeft: '0%', marginTop: '-0.5%', transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, white 0%, transparent 30%)', pointerEvents: 'none' }} />
      </div>
      <div className="text-center px-6 pt-10 pb-24 max-w-[700px] mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 text-black text-sm mb-8">
          <Sparkles className="w-4 h-4" /><span>Your Chinese friend in your pocket</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.06] mb-6 text-black">
          Discover Shanghai<br />Like a Local
        </h1>
        <p className="text-xl text-black/50 mb-10 leading-relaxed">
          Stop juggling Instagram saves, TikTok bookmarks, and scattered pins. All the best local spots, curated for foreigners.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Link href="/explore">
            <Button className="bg-black text-white h-12 px-8 text-base gap-2 transition-all duration-200 hover:bg-black/75 hover:shadow-lg hover:scale-[1.02]">
              <Search className="w-5 h-5" />Start Exploring
            </Button>
          </Link>
          <Link href="/submit">
            <Button variant="outline" className="border-black/20 text-black h-12 px-8 text-base gap-2 transition-all duration-200 hover:bg-black hover:text-white hover:border-black">
              <MapPin className="w-5 h-5" />Submit a Spot
            </Button>
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2 text-sm text-black/40"><Languages className="w-4 h-4" /><span>English Only</span></div>
          <div className="flex items-center gap-2 text-sm text-black/40"><Wallet className="w-4 h-4" /><span>Budget Friendly</span></div>
          <div className="flex items-center gap-2 text-sm text-black/40"><Users className="w-4 h-4" /><span>Verified by Locals</span></div>
        </div>
      </div>
    </section>
  );
}

function DistrictCard({ district }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => window.location.href = '/explore'}
      style={{
        width: '260px',
        height: '360px',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        cursor: 'pointer',
      }}
    >
      {/* Photo */}
      <img
        src={district.img}
        alt={district.name}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: hovered ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      />

      {/* Dark gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.05) 100%)' }} />

      {/* Spot count badge */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', borderRadius: '20px', padding: '4px 10px' }}>
        <span style={{ fontSize: '11px', color: 'white', fontWeight: 500 }}>{district.count} spots</span>
      </div>

      {/* Default label */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', zIndex: 10,
        opacity: hovered ? 0 : 1,
        transform: hovered ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '4px' }}>{district.chinese}</p>
        <p style={{ color: 'white', fontWeight: 600, fontSize: '18px', lineHeight: 1.2 }}>{district.name}</p>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '4px' }}>{district.vibe}</p>
      </div>

      {/* Hover white panel */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
        background: 'white',
        borderRadius: '0 0 16px 16px',
        padding: '20px',
        transform: hovered ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}>
        <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '11px', marginBottom: '4px' }}>{district.chinese} · {district.count} spots</p>
        <p style={{ fontWeight: 600, fontSize: '15px', color: 'black', marginBottom: '8px' }}>{district.name}</p>
        <p style={{ color: 'rgba(0,0,0,0.55)', fontSize: '13px', lineHeight: 1.6, marginBottom: '12px' }}>{district.description}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {district.tags.map(tag => (
            <span key={tag} style={{ fontSize: '11px', background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.55)', padding: '3px 8px', borderRadius: '20px' }}>{tag}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'rgba(0,0,0,0.4)' }}>
          <span>Explore {district.name}</span>
          <ArrowRight style={{ width: '12px', height: '12px' }} />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVibe, setSelectedVibe] = useState('Any Vibe');
  const [selectedBudget, setSelectedBudget] = useState(null);

  return (
    <div className="min-h-screen bg-white text-black">
      <style>{`
        .pain-item {
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
          transition-delay: var(--delay, 0ms);
        }
        .feature-card {
          opacity: 0; transform: translateY(18px);
          transition: opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          transition-delay: var(--delay, 0ms);
        }
        .pain-item.revealed, .feature-card.revealed { opacity: 1; transform: translateY(0); }
        .pain-num { color: transparent; -webkit-text-stroke: 1.5px rgba(0,0,0,0.15); transition: -webkit-text-stroke 0.3s; }
        .pain-item:hover .pain-num { -webkit-text-stroke: 1.5px #7f1d1d; }
        .pain-divider { height: 1px; background: linear-gradient(90deg, transparent, #e5e7eb 15%, #e5e7eb 85%, transparent); }
        .eyebrow { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #7f1d1d; }
        .burg-line { display: inline-block; position: relative; }
        .burg-line::after { content: ''; position: absolute; left: 0; bottom: -2px; width: 100%; height: 2px; background: #7f1d1d; border-radius: 2px; opacity: 0.4; }
      `}</style>

      <Navbar />
      <HeroSection />

      {/* Map Preview */}
      <section className="py-20 px-6 bg-[#fafafa] border-t border-[#ebebeb]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-semibold mb-3">Preview the Map</h2>
            <p className="text-black/50 text-lg">Filter by category and budget to find a match out of 100+ curated spots.</p>
          </div>
          <div className="space-y-4 mb-10">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button key={cat.name} onClick={() => setSelectedCategory(cat.name)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.name ? 'bg-black text-white' : 'bg-white text-black/70 border border-black/10 hover:border-black/30'}`}>
                    <Icon className="w-4 h-4" />{cat.name}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap justify-center items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-black/40">
                  <Sparkles className="w-3.5 h-3.5" /><span>Vibe</span>
                </div>
                <select value={selectedVibe} onChange={(e) => setSelectedVibe(e.target.value)}
                  className="px-4 py-2.5 rounded-full text-sm font-medium bg-white border border-black/10 text-black/70 outline-none cursor-pointer hover:border-black/30 transition-colors">
                  {vibes.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="flex gap-1.5">
                {budgetOptions.map((budget) => (
                  <button key={budget.label} onClick={() => setSelectedBudget(budget.value)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${selectedBudget === budget.value ? 'bg-black text-white' : 'bg-white text-black/70 border border-black/10 hover:border-black/30'}`}>
                    <Wallet className="w-3.5 h-3.5" />{budget.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
            <div className="h-[450px] md:h-[500px]">
              <MapWithNoSSR selectedCategory={selectedCategory} selectedBudget={selectedBudget} />
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/explore">
              <button className="group inline-flex items-center gap-3 text-lg font-medium text-black hover:opacity-70 transition-opacity">
                Explore Full Map
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-black text-white group-hover:scale-105 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-24 px-6">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-14">
            <span className="eyebrow mb-4">The Problem</span>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Sound <span className="burg-line">familiar?</span></h2>
            <p className="text-black/50 text-lg">Planning a trip to Shanghai shouldn&apos;t feel like a research project.</p>
          </div>
          <div className="space-y-0">
            {painPoints.map((p, i) => (
              <div key={p.num}>
                <PainItem {...p} index={i} />
                {i < painPoints.length - 1 && <div className="pain-divider my-10" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-[#fafafa] border-t border-[#ebebeb]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <span className="eyebrow mb-4">How Spotly Solves This</span>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Every feature <span className="burg-line">designed</span> for you</h2>
            <p className="text-black/50 text-lg">Built to save you money, time, and disappointment.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
          </div>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="py-24 px-6 border-t border-[#ebebeb]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <span className="eyebrow mb-4">Explore the City</span>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Shanghai by <span className="burg-line">Neighborhood</span></h2>
            <p className="text-black/50 text-lg">Each area has its own personality. Find the vibe that matches yours.</p>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {districts.map((d) => <DistrictCard key={d.name} district={d} />)}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 border-t border-[#ebebeb] border-b border-[#ebebeb]">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div><div className="text-4xl md:text-5xl font-semibold mb-2">500+</div><div className="text-black/50">Curated Spots</div></div>
            <div><div className="text-4xl md:text-5xl font-semibold mb-2">12</div><div className="text-black/50">Neighborhoods</div></div>
            <div><div className="text-4xl md:text-5xl font-semibold mb-2">70%</div><div className="text-black/50">Under 50 RMB</div></div>
            <div><div className="text-4xl md:text-5xl font-semibold mb-2">100%</div><div className="text-black/50">Foreigner Tested</div></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Ready to explore like a local?</h2>
          <p className="text-white/60 text-lg mb-8">Join thousands of expats discovering the real Shanghai.</p>
          <Link href="/explore">
            <Button className="bg-white text-black hover:bg-white/90 rounded-full h-12 px-8 text-base gap-2">
              Start Exploring<ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#fafafa] border-t border-black/10">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-3 group">
                <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center group-hover:bg-black/75 transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold group-hover:text-black/70 transition-colors">Spotly</span>
              </Link>
              <p className="text-sm text-black/40 max-w-xs">The city discovery app for foreigners in China.</p>
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