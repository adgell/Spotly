'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  MapPin, Coffee, Utensils, Wine, Music, ShoppingBag, Sparkles,
  ChevronLeft, ChevronDown, List, Map, X, Filter,
  Bookmark, Heart, Trees, Eye, Loader2, Activity, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpotCard, type Spot } from '@/components/spot-card';

const MapWithNoSSR = dynamic(() => import('@/components/mapbox-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Loading map...</div>
    </div>
  ),
});

// ─── Filter options ───────────────────────────────────────────────────────────

const categories = [
  { name: 'All',              icon: Sparkles },
  { name: 'Food',             icon: Utensils },
  { name: 'Cafés & Bakery',   icon: Coffee },
  { name: 'Nightlife',        icon: Wine },
  { name: 'Culture',          icon: Music },
  { name: 'Shopping',         icon: ShoppingBag },
  { name: 'Activities',       icon: Activity },
  { name: 'Nature',           icon: Trees },
  { name: 'Viewpoints',       icon: Eye },
  { name: 'Study',            icon: BookOpen },
];
 

const budgetLevels = ['$', '$$', '$$$'];

const neighborhoods = [
  'All Areas', 'French Concession', "Jing'an", 'The Bund',
  'North Bund', 'Xintiandi', 'Xuhui', 'West Bund', 'Pudong', 'Old Town',
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

const validCategories = [
  'All', 'Food', 'Cafés & Bakery', 'Nightlife', 'Culture',
  'Shopping', 'Activities', 'Nature', 'Viewpoints', 'Study',
];
 
const validNeighborhoods = ['All Areas', 'French Concession', "Jing'an", 'The Bund', 'North Bund', 'Xintiandi', 'Xuhui', 'West Bund', 'Pudong', 'Old Town'];

// ─── Shared button styles (matches landing page pill aesthetic) ───────────────

const pillBase: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '6px',
  padding: '7px 14px', borderRadius: '99px',
  fontSize: '12px', fontWeight: 500,
  cursor: 'pointer', border: 'none', transition: 'all 0.15s',
  whiteSpace: 'nowrap',
};
const pillActive: React.CSSProperties = { ...pillBase, background: 'black', color: 'white' };
const pillInactive: React.CSSProperties = { ...pillBase, background: 'white', color: 'rgba(0,0,0,0.65)', border: '0.5px solid #e0e0e0' };

// ─── Inner content ────────────────────────────────────────────────────────────

function ExploreContent() {
  const searchParams = useSearchParams();

  const urlCategory     = searchParams.get('category');
  const urlNeighborhood = searchParams.get('neighborhood');
  const initialCategory     = urlCategory     && validCategories.includes(urlCategory)         ? urlCategory     : 'All';
  const initialNeighborhood = urlNeighborhood && validNeighborhoods.includes(urlNeighborhood)  ? urlNeighborhood : 'All Areas';

  const [spots,   setSpots]   = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const [activeTab,            setActiveTab]            = useState<'browse' | 'map' | 'saved'>('browse');
  const [selectedCategory,     setSelectedCategory]     = useState(initialCategory);
  const [selectedBudget,       setSelectedBudget]       = useState<string | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(initialNeighborhood);
  const [selectedVibe,         setSelectedVibe]         = useState('Any Vibe');
  const [savedSpots,           setSavedSpots]           = useState<string[]>([]);
  const [showFilters,          setShowFilters]          = useState(false);

  useEffect(() => {
    fetch('/api/spots')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: Spot[]) => { setSpots(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  useEffect(() => {
    const cat  = searchParams.get('category');
    const hood = searchParams.get('neighborhood');
    if (cat  && validCategories.includes(cat))     setSelectedCategory(cat);
    if (hood && validNeighborhoods.includes(hood)) setSelectedNeighborhood(hood);
  }, [searchParams]);

  const filteredSpots = useMemo(() => spots.filter(spot => {
    const catArr = Array.isArray(spot.category) ? spot.category : [spot.category];
    const catMatch  = selectedCategory     === 'All'       || catArr.includes(selectedCategory);
    const hoodMatch = selectedNeighborhood === 'All Areas' || spot.neighborhood === selectedNeighborhood;
    const budgMatch = !selectedBudget || spot.price === selectedBudget;
    const vibeMatch = selectedVibe === 'Any Vibe' || spot.vibes?.includes(selectedVibe);
    return catMatch && hoodMatch && budgMatch && vibeMatch;
  }), [spots, selectedCategory, selectedNeighborhood, selectedBudget, selectedVibe]);

  const displaySpots = activeTab === 'saved'
    ? spots.filter(s => savedSpots.includes(s.id))
    : filteredSpots;

  const toggleSaved = (id: string) =>
    setSavedSpots(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div style={{ minHeight: '100vh', background: 'white', color: 'black' }}>

      <style>{`
        .filter-select {
          appearance: none; background: white;
          border: 0.5px solid #e0e0e0; border-radius: 99px;
          padding: 7px 28px 7px 14px; font-size: 12px; font-weight: 500;
          color: rgba(0,0,0,0.65); cursor: pointer; outline: none;
          transition: border-color 0.15s;
        }
        .filter-select:hover { border-color: rgba(0,0,0,0.3); }
        .filter-select:focus { border-color: black; }
        .scroll-hide::-webkit-scrollbar { display: none; }
        .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .mobile-only { display: none; }
        .desktop-only { display: inline-flex; }
        @media (max-width: 768px) {
          .mobile-only { display: inline-flex; }
          .desktop-only { display: none; }
          .filters-mobile-hidden { display: none !important; }
        }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid #ebebeb',
      }}>
        <div style={{ padding: '0 20px', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>

            {/* Left: back + logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(0,0,0,0.45)', textDecoration: 'none', fontSize: '13px', transition: 'color 0.15s' }}>
                <ChevronLeft style={{ width: '15px', height: '15px' }} />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <div style={{ width: '1px', height: '18px', background: '#ebebeb' }} />
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin style={{ width: '13px', height: '13px', color: 'white' }} />
                </div>
                <span style={{ fontWeight: 600, fontSize: '15px', color: 'black' }}>Spotly</span>
              </Link>
            </div>

            {/* Centre: active filter pill */}
            {selectedCategory !== 'All' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(0,0,0,0.5)' }} className="hidden sm:flex">
                <span>Viewing:</span>
                <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(0,0,0,0.06)', color: 'black', fontWeight: 500 }}>{selectedCategory}</span>
                <button onClick={() => setSelectedCategory('All')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.4)', padding: '2px' }}>
                  <X style={{ width: '12px', height: '12px' }} />
                </button>
              </div>
            )}

            {/* Right: tab switcher */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', background: '#f3f3f2', borderRadius: '10px', padding: '3px', gap: '2px' }}>
                {(['browse', 'map', 'saved'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '5px 12px', borderRadius: '8px', border: 'none',
                    fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                    transition: 'background 0.15s, color 0.15s',
                    background: activeTab === tab ? 'white' : 'transparent',
                    color: activeTab === tab ? 'black' : 'rgba(0,0,0,0.45)',
                    boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}>
                    {tab === 'browse' && <><List style={{ width: '14px', height: '14px' }} /><span className="hidden sm:inline">Browse</span></>}
                    {tab === 'map'    && <><Map  style={{ width: '14px', height: '14px' }} /><span className="hidden sm:inline">Map</span></>}
                    {tab === 'saved'  && (
                      <>
                        <Bookmark style={{ width: '14px', height: '14px' }} />
                        <span className="hidden sm:inline">Saved</span>
                        {savedSpots.length > 0 && (
                          <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'black', color: 'white', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                            {savedSpots.length}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>

              {/* Mobile filter toggle */}
              <button onClick={() => setShowFilters(!showFilters)} style={{
                marginLeft: '8px',
                padding: '6px 10px', borderRadius: '8px',
                background: showFilters ? 'black' : 'white',
                color: showFilters ? 'white' : 'black',
                border: '0.5px solid #e0e0e0', cursor: 'pointer', fontSize: '12px',
              }} className="mobile-only">
                <Filter style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main style={{ paddingTop: '52px', height: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* ── Filter bar ──────────────────────────────────────────────────── */}
        {activeTab !== 'saved' && (
          <div
            style={{ background: 'white', borderBottom: '0.5px solid #ebebeb' }}
            className={!showFilters ? 'filters-mobile-hidden' : ''}
          >
            <div style={{ padding: '10px 20px', maxWidth: '1400px', margin: '0 auto' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>

                {/* Category pills */}
                <div className="scroll-hide" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                  {categories.map(({ name, icon: Icon }) => (
                    <button key={name} onClick={() => setSelectedCategory(name)}
                      style={selectedCategory === name ? pillActive : pillInactive}>
                      <Icon style={{ width: '12px', height: '12px' }} />{name}
                    </button>
                  ))}
                </div>

                <div style={{ width: '1px', height: '20px', background: '#ebebeb', flexShrink: 0 }} />

                {/* Budget pills */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {budgetLevels.map(level => (
                    <button key={level} onClick={() => setSelectedBudget(selectedBudget === level ? null : level)}
                      style={selectedBudget === level ? pillActive : pillInactive}>
                      {level.replace(/\$/g, '¥')}
                    </button>
                  ))}
                </div>

                <div style={{ width: '1px', height: '20px', background: '#ebebeb', flexShrink: 0 }} />

                {/* Neighbourhood select */}
                <div style={{ position: 'relative' }}>
                  <select value={selectedNeighborhood} onChange={e => setSelectedNeighborhood(e.target.value)} className="filter-select">
                    {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: 'rgba(0,0,0,0.4)', pointerEvents: 'none' }} />
                </div>

                {/* Vibe select */}
                <div style={{ position: 'relative' }}>
                  <select value={selectedVibe} onChange={e => setSelectedVibe(e.target.value)} className="filter-select">
                    {vibes.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: 'rgba(0,0,0,0.4)', pointerEvents: 'none' }} />
                </div>

                {/* Result count */}
                <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.35)', marginLeft: 'auto' }} className="hidden sm:block">
                  {loading ? 'Loading…' : `${filteredSpots.length} spots`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Browse tab */}
          {activeTab === 'browse' && (
            <div style={{ width: '100%', overflowY: 'auto' }}>
              <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

                {loading && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '80px 0', color: 'rgba(0,0,0,0.4)' }}>
                    <Loader2 style={{ width: '18px', height: '18px' }} className="animate-spin" />
                    <span style={{ fontSize: '14px' }}>Loading spots…</span>
                  </div>
                )}

                {error && (
                  <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <p style={{ color: 'rgba(0,0,0,0.4)', marginBottom: '8px', fontSize: '14px' }}>Couldn't load spots right now.</p>
                    <Button variant="link" onClick={() => window.location.reload()}>Try again</Button>
                  </div>
                )}

                {!loading && !error && (
                  <>
                    {/* ── Card grid — uses shared SpotCard ── */}
                    <div className="grid gap-[14px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {displaySpots.map(spot => (
                        <SpotCard
                          key={spot.id}
                          spot={spot}
                          isSaved={savedSpots.includes(spot.id)}
                          onToggleSave={toggleSaved}
                        />
                      ))}
                    </div>

                    {displaySpots.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <MapPin style={{ width: '40px', height: '40px', color: 'rgba(0,0,0,0.15)', margin: '0 auto 16px' }} />
                        <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: '8px', fontSize: '14px' }}>No spots match these filters</p>
                        <Button variant="link" onClick={() => {
                          setSelectedCategory('All');
                          setSelectedNeighborhood('All Areas');
                          setSelectedBudget(null);
                          setSelectedVibe('Any Vibe');
                        }}>Clear filters</Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Map tab */}
          {activeTab === 'map' && (
            <div style={{ flex: 1, position: 'relative' }}>
              {loading ? (
                <div style={{ position: 'absolute', inset: 0, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <Loader2 style={{ width: '18px', height: '18px', color: 'rgba(255,255,255,0.4)' }} className="animate-spin" />
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Loading map…</span>
                </div>
              ) : (
                <MapWithNoSSR
                  spots={filteredSpots}
                  selectedCategory={selectedCategory}
                  selectedBudget={selectedBudget}
                  selectedVibe={selectedVibe}
                />
              )}
            </div>
          )}

          {/* Saved tab */}
          {activeTab === 'saved' && (
            <div style={{ width: '100%', overflowY: 'auto' }}>
              <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                {savedSpots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <Heart style={{ width: '40px', height: '40px', color: 'rgba(0,0,0,0.15)', margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No saved spots yet</h3>
                    <p style={{ color: 'rgba(0,0,0,0.45)', fontSize: '14px', marginBottom: '20px' }}>Bookmark places as you browse — they'll appear here</p>
                    <Button onClick={() => setActiveTab('browse')}>Browse spots</Button>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '24px' }}>
                      <h2 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '4px' }}>Saved spots</h2>
                      <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.4)' }}>{savedSpots.length} places saved</p>
                    </div>
                    <div className="grid gap-[14px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {displaySpots.map(spot => (
                        <SpotCard
                          key={spot.id}
                          spot={spot}
                          isSaved={savedSpots.includes(spot.id)}
                          onToggleSave={toggleSaved}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <Loader2 style={{ width: '18px', height: '18px', color: 'rgba(0,0,0,0.3)' }} className="animate-spin" />
        <span style={{ fontSize: '13px', color: 'rgba(0,0,0,0.4)' }}>Loading…</span>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}