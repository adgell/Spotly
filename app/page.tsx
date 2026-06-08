'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  MapPin, ArrowRight, Bookmark, Languages, Wallet, Users,
  Search, Sparkles, UtensilsCrossed, Coffee, Wine, Landmark, ShoppingBag,
  Trees, Eye, Activity, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/navbar';

const MapWithNoSSR = dynamic(() => import('@/components/mapbox-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center rounded-2xl">
      <div className="text-white/50">Loading map...</div>
    </div>
  ),
});

const categories = [
  { name: 'All',              icon: Sparkles },
  { name: 'Food',             icon: UtensilsCrossed },
  { name: 'Cafés & Bakery',   icon: Coffee },
  { name: 'Nightlife',        icon: Wine },
  { name: 'Culture',          icon: Landmark },
  { name: 'Shopping',         icon: ShoppingBag },
  { name: 'Activities',       icon: Activity },
  { name: 'Nature',           icon: Trees },
  { name: 'Viewpoints',       icon: Eye },
  { name: 'Study',            icon: BookOpen },
];

const vibes = [
  'Any Vibe',
  'Chill',
  'Lively',
  'Scenic',
  'Unique',
  'Date Night',
  'With Friends',
  'Outdoor',
];

const budgetOptions = [
  { label: 'All', value: null },
  { label: '¥',   value: '$' },
  { label: '¥¥',  value: '$$' },
  { label: '¥¥¥', value: '$$$' },
];

const painPoints = [
  {
    num: '01',
    title: "The city is incredible. Finding it in English isn't.",
    body: "Most travel tools weren't built for Shanghai. The ones that were aren't in English. You end up navigating one of the world's most exciting cities with tools that make it harder than it needs to be.",
  },
  {
    num: '02',
    title: 'Your saves are everywhere but useful',
    body: "You've done the research. It's just scattered across six apps in three languages — Instagram, Xiaohongshu, TikTok, WeChat — and none of it is where you need it when you're actually out.",
  },
  {
    num: '03',
    title: "You can't plan a real day from a list",
    body: "A spot in Jing'an and three more in the French Concession isn't a day — it's a commute. There's no tool that helps you string places together by neighborhood, vibe, and how your day actually flows.",
  },
];

const guides = [
  {
    name: 'The Café Hopper',
    line: 'Specialty roasts, brunch spots, matcha lattes and pastries that travel well',
    spots: 40,
    accentColor: '#D4537E',
    filter: 'Cafés & Bakery',
  },
  {
    name: 'The Quiet Reader',
    line: 'Stunning libraries, indie bookshops, work-friendly cafés that don\'t mind laptops',
    spots: 12,
    accentColor: '#6B63C4',
    filter: 'Study',
  },
  {
    name: 'The Foodie Local',
    line: 'Hot pot, dumplings, food courts and themed restaurants worth the trip',
    spots: 17,
    accentColor: '#1D9E75',
    filter: 'Food',
  },
  {
    name: 'The Haul Friend',
    line: 'Flea markets, indie fashion, mall hauls — knows what\'s worth ¥30 and what isn\'t',
    spots: 14,
    accentColor: '#D85A30',
    filter: 'Shopping',
  },
  {
    name: 'The Skyline Chaser',
    line: 'Rooftop bars, hidden observation decks, secret elevators with city views',
    spots: 11,
    accentColor: '#2E86AB',
    filter: 'Viewpoints',
  },
  {
    name: 'The Culture Nerd',
    line: 'Photography museums, concession-era buildings, art districts and old-Shanghai streets',
    spots: 11,
    accentColor: '#A8826E',
    filter: 'Culture',
  },
];

const features = [
  {
    icon: Users,
    accentColor: '#D85A30',
    title: 'Sourced from everywhere locals actually talk',
    body: 'We pull from Xiaohongshu, TikTok, expat forums, and word-of-mouth — then vet everything ourselves. Viral finds and hidden gems, in one place, in English.',
  },
  {
    icon: Wallet,
    accentColor: '#1D9E75',
    title: 'Know the cost before you walk in',
    body: "Filter by budget before you go. No surprises, no walking out because you didn't realise it was that kind of place.",
  },
  {
    icon: MapPin,
    accentColor: '#6B63C4',
    title: 'Plan by neighbourhood, not by tab',
    body: "See everything worth doing in one district, sorted so you're not doubling back across the city. One afternoon, one area, one plan.",
  },
  {
    icon: Bookmark,
    accentColor: '#D4537E',
    title: 'Build your day in seconds',
    body: "Bookmark spots as you browse. Your saved list becomes your itinerary — no screenshots, no notes app, no 'wait, where did I see that.'",
  },
];

const districts = [
  {
    name: 'French Concession',
    chinese: '法租界',
    vibe: 'artsy & walkable',
    count: 38,
    img: '/district-ffc.jpg',
    description: 'Tree-lined lanes, independent cafés, vintage boutiques, and some of the best brunch spots in the city. The most walkable neighbourhood in Shanghai.',
    tags: ['Cafés & Bakery', 'Brunch', 'Shopping', 'Nightlife'],
  },
  {
    name: "Jing'an",
    chinese: '静安',
    vibe: 'temples & towers',
    count: 29,
    img: '/district-jingan.jpg',
    description: "Ancient temple meets modern skyline. Zhangyuan's luxury heritage district, Fotografiska, and some of the city's best bookstores all in one neighbourhood.",
    tags: ['Culture', 'Art', 'Shopping', 'Cafés & Bakery'],
  },
  {
    name: 'The Bund',
    chinese: '外滩',
    vibe: 'iconic & electric',
    count: 22,
    img: '/bund.jpg',
    description: "Shanghai's most iconic waterfront — art deco architecture on one side, the Pudong skyline on the other. Rooftop bars, riverside walks, and the city's best views.",
    tags: ['Viewpoints', 'Nightlife', 'Culture', 'Date Night'],
  },
  {
    name: 'North Bund',
    chinese: '北外滩',
    vibe: 'local & scenic',
    count: 18,
    img: '/north-bund.webp',
    description: "The Bund's quieter twin across Suzhou Creek. Secret elevators, riverside cafés, 1933 Old Millfun, and views of the skyline without the tourist crowds.",
    tags: ['Viewpoints', 'Art', 'Hidden Gems', 'Cafés & Bakery'],
  },
  {
    name: 'Pudong',
    chinese: '浦东',
    vibe: 'modern & vast',
    count: 24,
    img: '/district-pudong.jpg',
    description: "Home to the Pearl Tower and Shanghai's most iconic skyline. The world's highest bookstore, luxury malls, immersive dining, and the best city views from above.",
    tags: ['Viewpoints', 'Shopping', 'Dining', 'Modern'],
  },
  {
    name: 'Xintiandi',
    chinese: '新天地',
    vibe: 'trendy & upscale',
    count: 16,
    img: '/district-xintiandi.jpg',
    description: 'Restored shikumen architecture turned into a premium dining and lifestyle district. TX Huaihai, Haus Nowhere, and the best date night restaurants in one compact area.',
    tags: ['Date Night', 'Shopping', 'Art', 'Architecture'],
  },

  {
    name: 'Old Town',
    chinese: '老城厢',
    vibe: 'historic & local',
    count: 10,
    img: '/old-town.jpg',
    description: "The historic core of Shanghai — Yu Garden, narrow lanes, traditional snacks, and the only neighbourhood that gives you a sense of how the city looked before the towers.",
    tags: ['Culture', 'Food', 'History', 'Family'],
  },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
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

function SectionHeader({ step, heading, sub, centered = true, light = false }: {
  step: string; heading: React.ReactNode; sub?: string; centered?: boolean; light?: boolean;
}) {
  return (
    <div style={{ marginBottom: '56px', textAlign: centered ? 'center' : 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: centered ? 'center' : 'flex-start', marginBottom: '16px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', color: light ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.22)', fontVariantNumeric: 'tabular-nums' }}>
          {step}
        </span>
        <span style={{ display: 'block', height: '1px', width: '28px', background: light ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }} />
      </div>
      <h2 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.1, color: light ? 'white' : 'black', marginBottom: sub ? '14px' : 0 }}>
        {heading}
      </h2>
      {sub && (
        <p style={{ fontSize: '17px', color: light ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)', lineHeight: 1.65, maxWidth: '520px', margin: centered ? '0 auto' : '0' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function PainItem({ num, title, body, index }: { num: string; title: string; body: string; index: number }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="pain-item flex flex-col sm:flex-row gap-5 sm:gap-8 items-start" style={{ '--delay': `${index * 130}ms` } as React.CSSProperties}>
      <span className="pain-num flex-shrink-0 text-5xl font-semibold leading-none tracking-tight select-none">{num}</span>
      <div className="pt-1">
        <h3 className="font-semibold text-xl mb-2 tracking-tight text-black">{title}</h3>
        <p className="text-black/50 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function GuideStrip({ guide, index }: { guide: typeof guides[0]; index: number }) {
  const ref = useReveal();
  return (
    <Link
      ref={ref as any}
      href={`/explore?category=${encodeURIComponent(guide.filter)}`}
      className="guide-strip"
      style={{ '--delay': `${index * 70}ms` } as React.CSSProperties}
    >
      <div className="guide-strip-bar" style={{ background: guide.accentColor }} />
      <div className="guide-strip-body">
        <span className="guide-strip-name">{guide.name}</span>
        <span className="guide-strip-line">{guide.line}</span>
      </div>
      <div className="guide-strip-right">
        <span className="guide-strip-count">{guide.spots} spots</span>
        <div className="guide-strip-arrow" style={{ borderColor: guide.accentColor }}>
          <ArrowRight style={{ width: '14px', height: '14px', color: guide.accentColor }} />
        </div>
      </div>
    </Link>
  );
}

function FeatureCard({ icon: Icon, accentColor, title, body, index }: {
  icon: React.ElementType; accentColor: string; title: string; body: string; index: number;
}) {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className="feature-card group relative bg-white rounded-2xl border border-black/8 p-6 overflow-hidden transition-all duration-300 hover:shadow-lg"
      style={{ '--delay': `${index * 90}ms`, borderLeft: `3px solid ${accentColor}` } as React.CSSProperties}
    >
      <div className="relative w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105"
        style={{ background: `${accentColor}15` }}>
        <Icon className="w-5 h-5" style={{ color: accentColor }} />
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
        <img ref={imgRef} src="/shanghai-hero.jpg" alt="Shanghai skyline"
          style={{ width: '100%', height: '110%', objectFit: 'cover', objectPosition: 'center 40%', willChange: 'transform', display: 'block', marginTop: '-0.5%', transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, white 0%, transparent 30%)', pointerEvents: 'none' }} />
      </div>

      <div className="text-center px-6 pt-10 pb-24 max-w-[700px] mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 text-black/60 text-sm mb-8">
          <Sparkles className="w-4 h-4" /><span>Your Chinese friend in your pocket</span>
        </div>
        <h1 className="text-4xl md:text-[64px] font-semibold tracking-tight leading-[1.05] mb-6 text-black">
          Experience the city <br />
          <span style={{ color: '#7f1d1d', fontStyle: 'italic', fontFamily: 'var(--font-serif, Georgia, serif)', fontWeight: 400 }}>
            through their eyes.
          </span>
        </h1>
        <p className="text-xl text-black/50 mb-10 leading-relaxed max-w-[540px] mx-auto">
          Every great spot in Shanghai, in English — viral finds and hidden gems to feel like a local, organized by vibe and neighborhood so your day actually makes sense.
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
          <div className="flex items-center gap-2 text-sm text-black/35"><Languages className="w-4 h-4" /><span>Fully in English</span></div>
          <div className="flex items-center gap-2 text-sm text-black/35"><MapPin className="w-4 h-4" /><span>Viral spots & hidden gems</span></div>
          <div className="flex items-center gap-2 text-sm text-black/35"><Users className="w-4 h-4" /><span>Sourced from locals</span></div>
        </div>
      </div>
    </section>
  );
}

function DistrictCard({ district }: { district: typeof districts[0] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => window.location.href = `/explore?neighborhood=${encodeURIComponent(district.name)}`}
      style={{ width: '260px', height: '360px', borderRadius: '16px', overflow: 'hidden', position: 'relative', flexShrink: 0, cursor: 'pointer' }}
    >
      <img src={district.img} alt={district.name}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.05) 100%)' }} />
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', borderRadius: '20px', padding: '4px 10px' }}>
        <span style={{ fontSize: '11px', color: 'white', fontWeight: 500 }}>{district.count} spots</span>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', zIndex: 10, opacity: hovered ? 0 : 1, transform: hovered ? 'translateY(8px)' : 'translateY(0)', transition: 'opacity 0.3s ease, transform 0.3s ease' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '4px' }}>{district.chinese}</p>
        <p style={{ color: 'white', fontWeight: 600, fontSize: '18px', lineHeight: 1.2 }}>{district.name}</p>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '4px' }}>{district.vibe}</p>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, background: 'white', borderRadius: '0 0 16px 16px', padding: '20px', transform: hovered ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
        <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '11px', marginBottom: '4px' }}>{district.chinese} · {district.count} spots</p>
        <p style={{ fontWeight: 600, fontSize: '15px', color: 'black', marginBottom: '8px' }}>{district.name}</p>
        <p style={{ color: 'rgba(0,0,0,0.55)', fontSize: '13px', lineHeight: 1.6, marginBottom: '12px' }}>{district.description}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {district.tags.map(tag => (
            <span key={tag} style={{ fontSize: '11px', background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.55)', padding: '3px 8px', borderRadius: '20px' }}>{tag}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#7f1d1d' }}>
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
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [mapSpots, setMapSpots] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/spots')
      .then(r => r.ok ? r.json() : [])
      .then(data => setMapSpots(Array.isArray(data) ? data : []))
      .catch(() => setMapSpots([]));
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      <style>{`
        .pain-item, .feature-card, .guide-strip {
          opacity: 0; transform: translateY(18px);
          transition: opacity 0.5s ease, transform 0.5s ease;
          transition-delay: var(--delay, 0ms);
        }
        .pain-item.revealed, .feature-card.revealed, .guide-strip.revealed { opacity: 1; transform: translateY(0); }
        .pain-num { color: transparent; -webkit-text-stroke: 1.5px rgba(0,0,0,0.12); transition: -webkit-text-stroke 0.3s; }
        .pain-item:hover .pain-num { -webkit-text-stroke: 1.5px #7f1d1d; }
        .pain-divider { height: 1px; background: linear-gradient(90deg, transparent, #e8e8e8 15%, #e8e8e8 85%, transparent); }
        .guide-strip {
          display: flex; align-items: center;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden;
          margin-bottom: 8px; cursor: pointer; text-decoration: none;
          background: rgba(255,255,255,0.04);
          transition: background 0.2s ease, border-color 0.2s ease, opacity 0.5s ease, transform 0.5s ease;
        }
        .guide-strip:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.18); }
        .guide-strip-bar   { width: 4px; align-self: stretch; flex-shrink: 0; }
        .guide-strip-body  { flex: 1; display: flex; align-items: baseline; gap: 16px; padding: 20px 24px; min-width: 0; }
        .guide-strip-name  { font-size: 15px; font-weight: 600; color: white; letter-spacing: -0.01em; white-space: nowrap; flex-shrink: 0; min-width: 190px; }
        .guide-strip-line  { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .guide-strip-right { display: flex; align-items: center; gap: 14px; padding: 20px 24px 20px 0; flex-shrink: 0; }
        .guide-strip-count { font-size: 13px; color: rgba(255,255,255,0.3); white-space: nowrap; }
        .guide-strip-arrow { width: 30px; height: 30px; border-radius: 50%; border: 1px solid; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
        .guide-strip:hover .guide-strip-arrow { transform: scale(1.1); }

        .category-strip { scrollbar-width: none; -ms-overflow-style: none; }
        .category-strip::-webkit-scrollbar { display: none; }

        @media (max-width: 640px) {
          .guide-strip-body { padding: 16px 14px; }
          .guide-strip-line { display: none; }
          .guide-strip-count { display: none; }
          .guide-strip-name { min-width: unset; }
          .guide-strip-right { padding: 16px 14px 16px 0; }
        }
      `}</style>

      <Navbar />

      <HeroSection />

      <section style={{ padding: '96px 24px', background: '#111110', borderTop: '1px solid #1a1a19' }}>
        <div className="max-w-[760px] mx-auto">
          <SectionHeader
            step="01"
            heading={<>Six friends.<br />Six ways to see the city.</>}
            sub="Not a list. Not a filter. A way to feel Shanghai — through six lenses built around how people actually want to spend a day."
            light
          />
          <div>
            {guides.map((guide, i) => (
              <GuideStrip key={guide.name} guide={guide} index={i} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/explore">
              <button className="group inline-flex items-center gap-3 text-base font-medium text-white/70 hover:text-white transition-colors">
                Browse all spots
                <span className="flex items-center justify-center w-9 h-9 rounded-full border border-white/20 group-hover:border-white/50 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '96px 24px', background: 'white', borderTop: '1px solid #ebebeb' }}>
        <div className="max-w-[800px] mx-auto">
          <SectionHeader
            step="02"
            heading={<>Why does finding a good spot<br />feel this hard?</>}
            sub="You're not bad at planning. The tools just weren't built for this."
          />
          <div>
            {painPoints.map((p, i) => (
              <div key={p.num}>
                <PainItem {...p} index={i} />
                {i < painPoints.length - 1 && <div className="pain-divider" style={{ margin: '40px 0' }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '96px 24px', background: 'white', borderTop: '1px solid #ebebeb' }}>
        <div className="max-w-[1100px] mx-auto">
          <SectionHeader
            step="03"
            heading="Every spot. One map."
            sub="Hand-picked, in English, filterable by vibe and budget. No filler, no tourist traps you didn't ask for."
          />

          <div className="mb-10">
            <div className="category-strip flex gap-2 overflow-x-auto sm:flex-wrap sm:justify-center sm:overflow-visible -mx-6 px-6 pb-2 mb-3 sm:mx-0 sm:px-0">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                      selectedCategory === cat.name
                        ? 'bg-black text-white'
                        : 'bg-white text-black/70 border border-black/10 hover:border-black/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap justify-center items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-black/40">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Vibe</span>
                </div>
                <select
                  value={selectedVibe}
                  onChange={(e) => setSelectedVibe(e.target.value)}
                  className="px-4 py-2.5 rounded-full text-sm font-medium bg-white border border-black/10 text-black/70 outline-none cursor-pointer hover:border-black/30 transition-colors"
                >
                  {vibes.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="flex gap-1.5">
                {budgetOptions.map((budget) => (
                  <button
                    key={budget.label}
                    onClick={() => setSelectedBudget(budget.value)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      selectedBudget === budget.value
                        ? 'bg-black text-white'
                        : 'bg-white text-black/70 border border-black/10 hover:border-black/30'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    {budget.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
            <div className="h-[450px] md:h-[500px]">
              <MapWithNoSSR
                selectedCategory={selectedCategory}
                selectedBudget={selectedBudget}
                selectedVibe={selectedVibe}
                spots={mapSpots}
              />
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/explore">
              <button className="group inline-flex items-center gap-3 text-lg font-medium text-black hover:opacity-70 transition-opacity">
                Open full map
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-black text-white group-hover:scale-105 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '96px 24px', background: 'white', borderTop: '1px solid #ebebeb' }}>
        <div className="max-w-[1100px] mx-auto">
          <SectionHeader
            step="04"
            heading="Everything we built, and why"
            sub="Every decision came from watching foreigners navigate Shanghai with tools that weren't made for them."
          />
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
          </div>
        </div>
      </section>

      <section style={{ padding: '96px 24px', background: 'white', borderTop: '1px solid #ebebeb' }}>
        <div className="max-w-[1100px] mx-auto">
          <SectionHeader
            step="05"
            heading="Shanghai by neighbourhood."
            sub="Each district has its own energy. You don't need to know the city — just pick the vibe and go."
            centered={false}
          />
          <div className="flex gap-5 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {districts.map((d) => <DistrictCard key={d.name} district={d} />)}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 24px', background: 'white', borderTop: '1px solid #ebebeb' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { n: '110+', label: 'Curated spots' },
              { n: '7',    label: 'Neighbourhoods' },
              { n: '6',    label: 'Guide personas' },
              { n: '100%', label: 'In English' },
            ].map(({ n, label }) => (
              <div key={label}>
                <div className="text-4xl md:text-5xl font-semibold mb-2 text-black">{n}</div>
                <div className="text-black/40 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '96px 24px', background: '#111110', borderTop: '1px solid #1a1a19' }}>
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 tracking-tight text-white">
            Stop researching.<br />Start experiencing.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px', marginBottom: '32px', lineHeight: 1.6 }}>
            Your next great day in Shanghai is already here. You just need somewhere to start.
          </p>
          <Link href="/explore">
            <Button className="bg-white text-black hover:bg-white/90 rounded-full h-12 px-8 text-base gap-2">
              Start Exploring <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer style={{ padding: '48px 24px', background: '#0d0d0c', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-3 group">
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-black" />
                </div>
                <span className="font-semibold text-white group-hover:text-white/70 transition-colors">Spotly</span>
              </Link>
              <p className="text-sm text-white/30 max-w-xs">The city guide for foreigners in Shanghai.</p>
            </div>
            <div className="flex gap-12 text-sm">
              <div>
                <h4 className="font-medium mb-3 text-white/50">Product</h4>
                <ul className="space-y-2 text-white/30">
                  <li><Link href="/explore" className="hover:text-white/60 transition-colors">Explore</Link></li>
                  <li><Link href="/submit" className="hover:text-white/60 transition-colors">Submit a Spot</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '40px', paddingTop: '24px', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.2)' }}>
            <p>&copy; 2026 Spotly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}