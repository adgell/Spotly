'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  MapPin, Coffee, Utensils, Wine, Music, ShoppingBag, Sparkles,
  ChevronLeft, ChevronDown, List, Map, X, SlidersHorizontal,
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
  'Any Vibe', 'Chill', 'Lively', 'Scenic', 'Unique',
  'Date Night', 'With Friends', 'Outdoor',
];

const validCategories = [
  'All', 'Food', 'Cafés & Bakery', 'Nightlife', 'Culture',
  'Shopping', 'Activities', 'Nature', 'Viewpoints', 'Study',
];

const validNeighborhoods = ['All Areas', 'French Concession', "Jing'an", 'The Bund', 'North Bund', 'Xintiandi', 'Xuhui', 'West Bund', 'Pudong', 'Old Town'];

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
  const [showMobileFilters,    setShowMobileFilters]    = useState(false);

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

  // Lock body scroll when mobile filter sheet is open
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showMobileFilters]);

  const filteredSpots = useMemo(() => spots.filter(spot => {
    const catArr  = Array.isArray(spot.category)     ? spot.category     : (spot.category     ? [spot.category]     : []);
    const hoodArr = Array.isArray(spot.neighborhood) ? spot.neighborhood : (spot.neighborhood ? [spot.neighborhood] : []);
    const catMatch  = selectedCategory     === 'All'       || catArr.includes(selectedCategory);
    const hoodMatch = selectedNeighborhood === 'All Areas' || hoodArr.includes(selectedNeighborhood);
    const budgMatch = !selectedBudget || spot.price === selectedBudget;
    const vibeMatch = selectedVibe === 'Any Vibe' || spot.vibes?.includes(selectedVibe);
    return catMatch && hoodMatch && budgMatch && vibeMatch;
  }), [spots, selectedCategory, selectedNeighborhood, selectedBudget, selectedVibe]);

  const displaySpots = activeTab === 'saved'
    ? spots.filter(s => savedSpots.includes(s.id))
    : filteredSpots;

  const toggleSaved = (id: string) =>
    setSavedSpots(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedNeighborhood !== 'All Areas' ? 1 : 0) +
    (selectedBudget ? 1 : 0) +
    (selectedVibe !== 'Any Vibe' ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedNeighborhood('All Areas');
    setSelectedBudget(null);
    setSelectedVibe('Any Vibe');
  };

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

        .mobile-only { display: none !important; }
        .desktop-only { display: flex; }

        @media (max-width: 768px) {
          .mobile-only { display: flex !important; }
          .desktop-only { display: none !important; }
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @media (max-width: 768px) {
          .mobile-bottom-pad { padding-bottom: 80px !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* DESKTOP HEADER                                                       */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <header
        className="desktop-only"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
          borderBottom: '0.5px solid #ebebeb',
        }}
      >
        {/* full-width container — NO max-width here, so contents span the entire screen */}
        <div style={{
          padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '52px',
          width: '100%',
        }}>

          {/* Left: back + logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '0 0 auto' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(0,0,0,0.45)', textDecoration: 'none', fontSize: '13px' }}>
              <ChevronLeft style={{ width: '15px', height: '15px' }} />
              <span>Back</span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(0,0,0,0.5)', flex: '0 1 auto' }}>
              <span>Viewing:</span>
              <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(0,0,0,0.06)', color: 'black', fontWeight: 500 }}>{selectedCategory}</span>
              <button onClick={() => setSelectedCategory('All')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.4)', padding: '2px' }}>
                <X style={{ width: '12px', height: '12px' }} />
              </button>
            </div>
          )}

          {/* Right: tab switcher */}
          <div style={{ display: 'flex', background: '#f3f3f2', borderRadius: '10px', padding: '3px', gap: '2px', flex: '0 0 auto' }}>
            {(['browse', 'map', 'saved'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 12px', borderRadius: '8px', border: 'none',
                fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                background: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? 'black' : 'rgba(0,0,0,0.45)',
                boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}>
                {tab === 'browse' && <><List style={{ width: '14px', height: '14px' }} /><span>Browse</span></>}
                {tab === 'map'    && <><Map style={{ width: '14px', height: '14px' }} /><span>Map</span></>}
                {tab === 'saved'  && (
                  <>
                    <Bookmark style={{ width: '14px', height: '14px' }} />
                    <span>Saved</span>
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
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MOBILE HEADER                                                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <header
        className="mobile-only"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)',
          borderBottom: '0.5px solid #ebebeb',
          flexDirection: 'column',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '52px', padding: '0 16px',
        }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px',
            color: 'rgba(0,0,0,0.7)', textDecoration: 'none',
          }}>
            <ChevronLeft style={{ width: '22px', height: '22px' }} />
          </Link>

          <Link href="/" style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none',
          }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '7px', background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin style={{ width: '12px', height: '12px', color: 'white' }} />
            </div>
            <span style={{ fontWeight: 600, fontSize: '16px', color: 'black', letterSpacing: '-0.01em' }}>Spotly</span>
          </Link>

          {activeTab !== 'saved' ? (
            <button
              onClick={() => setShowMobileFilters(true)}
              style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '36px', height: '36px',
                background: activeFilterCount > 0 ? 'black' : 'rgba(0,0,0,0.04)',
                color: activeFilterCount > 0 ? 'white' : 'black',
                borderRadius: '10px', border: 'none', cursor: 'pointer',
              }}
            >
              <SlidersHorizontal style={{ width: '16px', height: '16px' }} />
              {activeFilterCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: '#7f1d1d', color: 'white',
                  fontSize: '10px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid white',
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          ) : (
            <div style={{ width: '36px' }} />
          )}
        </div>

        {activeFilterCount > 0 && activeTab !== 'saved' && (
          <div className="scroll-hide" style={{
            display: 'flex', gap: '6px',
            padding: '0 16px 10px',
            overflowX: 'auto',
          }}>
            {selectedCategory !== 'All' && (
              <ActiveFilterChip label={selectedCategory} onRemove={() => setSelectedCategory('All')} />
            )}
            {selectedNeighborhood !== 'All Areas' && (
              <ActiveFilterChip label={selectedNeighborhood} onRemove={() => setSelectedNeighborhood('All Areas')} />
            )}
            {selectedBudget && (
              <ActiveFilterChip label={selectedBudget.replace(/\$/g, '¥')} onRemove={() => setSelectedBudget(null)} />
            )}
            {selectedVibe !== 'Any Vibe' && (
              <ActiveFilterChip label={selectedVibe} onRemove={() => setSelectedVibe('Any Vibe')} />
            )}
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════════════════ */}
      <main style={{ paddingTop: '52px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {activeTab !== 'saved' && (
          <div className="desktop-only" style={{ background: 'white', borderBottom: '0.5px solid #ebebeb' }}>
            <div style={{ padding: '10px 24px', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>

                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                  {categories.map(({ name, icon: Icon }) => (
                    <button key={name} onClick={() => setSelectedCategory(name)}
                      style={selectedCategory === name ? pillActive : pillInactive}>
                      <Icon style={{ width: '12px', height: '12px' }} />{name}
                    </button>
                  ))}
                </div>

                <div style={{ width: '1px', height: '20px', background: '#ebebeb', flexShrink: 0 }} />

                <div style={{ display: 'flex', gap: '6px' }}>
                  {budgetLevels.map(level => (
                    <button key={level} onClick={() => setSelectedBudget(selectedBudget === level ? null : level)}
                      style={selectedBudget === level ? pillActive : pillInactive}>
                      {level.replace(/\$/g, '¥')}
                    </button>
                  ))}
                </div>

                <div style={{ width: '1px', height: '20px', background: '#ebebeb', flexShrink: 0 }} />

                <div style={{ position: 'relative' }}>
                  <select value={selectedNeighborhood} onChange={e => setSelectedNeighborhood(e.target.value)} className="filter-select">
                    {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: 'rgba(0,0,0,0.4)', pointerEvents: 'none' }} />
                </div>

                <div style={{ position: 'relative' }}>
                  <select value={selectedVibe} onChange={e => setSelectedVibe(e.target.value)} className="filter-select">
                    {vibes.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: 'rgba(0,0,0,0.4)', pointerEvents: 'none' }} />
                </div>

                <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.35)', marginLeft: 'auto' }}>
                  {loading ? 'Loading…' : `${filteredSpots.length} spots`}
                </span>
              </div>
            </div>
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {activeTab === 'browse' && (
            <div style={{ width: '100%', overflowY: 'auto' }}>
              <div className="mobile-bottom-pad" style={{ padding: '20px 24px', maxWidth: '1400px', margin: '0 auto' }}>

                {loading && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '80px 0', color: 'rgba(0,0,0,0.4)' }}>
                    <Loader2 style={{ width: '18px', height: '18px' }} className="animate-spin" />
                    <span style={{ fontSize: '14px' }}>Loading spots…</span>
                  </div>
                )}

                {error && (
                  <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <p style={{ color: 'rgba(0,0,0,0.4)', marginBottom: '8px', fontSize: '14px' }}>Couldn&apos;t load spots right now.</p>
                    <Button variant="link" onClick={() => window.location.reload()}>Try again</Button>
                  </div>
                )}

                {!loading && !error && (
                  <>
                    <div className="grid gap-[14px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                        <Button variant="link" onClick={clearAllFilters}>Clear filters</Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div style={{ flex: 1, position: 'relative', minHeight: 'calc(100vh - 52px)' }}>
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

          {activeTab === 'saved' && (
            <div style={{ width: '100%', overflowY: 'auto' }}>
              <div className="mobile-bottom-pad" style={{ padding: '20px 24px', maxWidth: '1400px', margin: '0 auto' }}>
                {savedSpots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <Heart style={{ width: '40px', height: '40px', color: 'rgba(0,0,0,0.15)', margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No saved spots yet</h3>
                    <p style={{ color: 'rgba(0,0,0,0.45)', fontSize: '14px', marginBottom: '20px' }}>Bookmark places as you browse — they&apos;ll appear here</p>
                    <Button onClick={() => setActiveTab('browse')}>Browse spots</Button>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '24px' }}>
                      <h2 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '4px' }}>Saved spots</h2>
                      <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.4)' }}>{savedSpots.length} places saved</p>
                    </div>
                    <div className="grid gap-[14px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      {/* MOBILE BOTTOM TAB BAR */}
      <nav
        className="mobile-only"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
          background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
          borderTop: '0.5px solid #ebebeb',
          paddingBottom: 'env(safe-area-inset-bottom)',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        {(['browse', 'map', 'saved'] as const).map(tab => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '3px',
                padding: '10px 16px 12px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: isActive ? 'black' : 'rgba(0,0,0,0.4)',
                position: 'relative',
                flex: 1,
                minWidth: 0,
              }}
            >
              {tab === 'browse' && <List style={{ width: '20px', height: '20px', strokeWidth: isActive ? 2.5 : 2 }} />}
              {tab === 'map'    && <Map  style={{ width: '20px', height: '20px', strokeWidth: isActive ? 2.5 : 2 }} />}
              {tab === 'saved'  && (
                <div style={{ position: 'relative' }}>
                  <Bookmark style={{ width: '20px', height: '20px', strokeWidth: isActive ? 2.5 : 2 }} />
                  {savedSpots.length > 0 && (
                    <span style={{
                      position: 'absolute', top: '-4px', right: '-7px',
                      minWidth: '15px', height: '15px', padding: '0 4px',
                      borderRadius: '99px', background: '#7f1d1d', color: 'white',
                      fontSize: '9px', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid white',
                    }}>
                      {savedSpots.length}
                    </span>
                  )}
                </div>
              )}
              <span style={{
                fontSize: '10.5px',
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '0.01em',
              }}>
                {tab === 'browse' ? 'Browse' : tab === 'map' ? 'Map' : 'Saved'}
              </span>
            </button>
          );
        })}
      </nav>

      {/* MOBILE FILTER SHEET */}
      {showMobileFilters && (
        <>
          <div
            onClick={() => setShowMobileFilters(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 60,
              background: 'rgba(0,0,0,0.4)',
              animation: 'fadeIn 0.2s ease',
            }}
          />

          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 61,
            background: 'white',
            borderRadius: '20px 20px 0 0',
            maxHeight: '85vh',
            overflowY: 'auto',
            animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'center',
              padding: '10px 0 6px',
            }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '99px', background: '#e0e0e0' }} />
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '4px 20px 16px',
              borderBottom: '0.5px solid #ebebeb',
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'black', letterSpacing: '-0.01em' }}>
                Filters
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '13px', color: '#7f1d1d', fontWeight: 500,
                      padding: 0,
                    }}
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setShowMobileFilters(false)}
                  style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X style={{ width: '15px', height: '15px', color: 'rgba(0,0,0,0.6)' }} />
                </button>
              </div>
            </div>

            <div style={{ padding: '20px' }}>
              <FilterSection title="Category">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {categories.map(({ name, icon: Icon }) => (
                    <button key={name} onClick={() => setSelectedCategory(name)}
                      style={selectedCategory === name ? pillActive : pillInactive}>
                      <Icon style={{ width: '12px', height: '12px' }} />{name}
                    </button>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Neighborhood">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {neighborhoods.map(n => (
                    <button key={n} onClick={() => setSelectedNeighborhood(n)}
                      style={selectedNeighborhood === n ? pillActive : pillInactive}>
                      {n}
                    </button>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Vibe">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {vibes.map(v => (
                    <button key={v} onClick={() => setSelectedVibe(v)}
                      style={selectedVibe === v ? pillActive : pillInactive}>
                      {v}
                    </button>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Budget" lastSection>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {budgetLevels.map(level => (
                    <button key={level} onClick={() => setSelectedBudget(selectedBudget === level ? null : level)}
                      style={selectedBudget === level ? pillActive : pillInactive}>
                      {level.replace(/\$/g, '¥')}
                    </button>
                  ))}
                </div>
              </FilterSection>
            </div>

            <div style={{
              position: 'sticky', bottom: 0,
              padding: '12px 20px 20px',
              background: 'white',
              borderTop: '0.5px solid #ebebeb',
            }}>
              <button
                onClick={() => setShowMobileFilters(false)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'black',
                  color: 'white',
                  fontSize: '14px', fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                }}
              >
                Show {filteredSpots.length} {filteredSpots.length === 1 ? 'spot' : 'spots'}
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

const pillBase: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '6px',
  padding: '7px 14px', borderRadius: '99px',
  fontSize: '12px', fontWeight: 500,
  cursor: 'pointer', border: 'none',
  whiteSpace: 'nowrap',
};
const pillActive: React.CSSProperties = { ...pillBase, background: 'black', color: 'white' };
const pillInactive: React.CSSProperties = { ...pillBase, background: 'white', color: 'rgba(0,0,0,0.65)', border: '0.5px solid #e0e0e0' };

function ActiveFilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '5px 8px 5px 12px', borderRadius: '99px',
      background: 'black', color: 'white',
      fontSize: '11.5px', fontWeight: 500,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      <span>{label}</span>
      <button
        onClick={onRemove}
        style={{
          width: '18px', height: '18px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', padding: 0,
        }}
      >
        <X style={{ width: '11px', height: '11px' }} />
      </button>
    </div>
  );
}

function FilterSection({ title, children, lastSection }: { title: string; children: React.ReactNode; lastSection?: boolean }) {
  return (
    <div style={{ marginBottom: lastSection ? 0 : '24px' }}>
      <h4 style={{
        fontSize: '11px', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        color: 'rgba(0,0,0,0.4)', marginBottom: '10px',
      }}>
        {title}
      </h4>
      {children}
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