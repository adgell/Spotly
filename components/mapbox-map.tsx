'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ChevronLeft, ChevronRight, Navigation, Star } from 'lucide-react';
import { FONT, SpotCardBody } from '@/components/spot-card';

type Spot = {
  id: string | number;
  name: string;
  chineseName?: string;
  category: string | string[];
  neighborhood: string | string[];
  address?: string;
  lat: number;
  lng: number;
  price?: string;
  averageSpend?: string;
  hours?: string;
  vibes?: string[];
  localTip?: string;
  description?: string;
  amapUrl?: string;
  rating?: number;
  images?: { url: string }[];
};

type CardSpot = {
  name: string;
  chineseName: string;
  category: string;
  neighborhood: string;
  price: string;
  averageSpend: string;
  description: string;
  localTip: string;
  vibes: string[];
  rating: number;
  images: { url: string }[];
  amapUrl: string;
  exploreUrl: string;
};

type CardState = { spot: CardSpot; x: number; y: number };

const CARD_W = 300;
const CARD_MAX_H = 560;

// truncate long text gracefully
function truncate(s: string, max: number) {
  if (!s) return '';
  if (s.length <= max) return s;
  // cut at last space before max to avoid mid-word
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max - 30 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

function makePinEl(hovered = false): HTMLDivElement {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'cursor:pointer; user-select:none;';
  wrap.innerHTML = `
    <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.268 21.732 0 14 0Z"
        fill="${hovered ? '#ffffff' : '#111110'}"
        stroke="${hovered ? '#111110' : '#ffffff'}"
        stroke-width="2"
      />
      <circle cx="14" cy="14" r="5"
        fill="${hovered ? '#111110' : '#ffffff'}"
      />
    </svg>
  `;
  return wrap;
}

export default function MapboxMap({
  spots, selectedCategory, selectedBudget, selectedVibe,
}: {
  spots?: any[];
  selectedCategory?: string;
  selectedBudget?: string | null;
  selectedVibe?: string;
}) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
  const hasToken    = Boolean(mapboxToken);

  const wrapperRef   = useRef<HTMLDivElement>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map          = useRef<mapboxgl.Map | null>(null);
  const markersRef   = useRef<mapboxgl.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [card,     setCard]     = useState<CardState | null>(null);
  const [imgIdx,   setImgIdx]   = useState(0);

  useEffect(() => { setImgIdx(0); }, [card?.spot?.name]);

  const validSpots = useMemo(() => {
    const base = spots && spots.length > 0 ? spots : [];
    return base.filter(s => {
      if (!Number.isFinite(s.lat) || !Number.isFinite(s.lng) || s.lat === 0 || s.lng === 0) return false;
      const cats: string[] = Array.isArray(s.category) ? s.category : (s.category ? [s.category] : []);
      const catOk  = !selectedCategory || selectedCategory === 'All' || cats.includes(selectedCategory);
      const budOk  = !selectedBudget   || s.price === selectedBudget;
      const vibOk  = !selectedVibe     || selectedVibe === 'Any Vibe' ||
        (Array.isArray(s.vibes) && s.vibes.includes(selectedVibe));
      return catOk && budOk && vibOk;
    });
  }, [spots, selectedCategory, selectedBudget, selectedVibe]);

  const getCardDimensions = useCallback(() => {
    const wrap = wrapperRef.current;
    const contW = wrap?.clientWidth ?? CARD_W;
    const contH = wrap?.clientHeight ?? CARD_MAX_H;
    const width = Math.min(CARD_W, Math.max(260, contW - 24));
    const height = Math.min(CARD_MAX_H, Math.max(360, contH - 24));
    return { width, height };
  }, []);

  const computePos = useCallback((pinX: number, pinY: number) => {
    const wrap  = wrapperRef.current;
    const contW = wrap?.clientWidth  ?? 800;
    const contH = wrap?.clientHeight ?? 500;
    const { width: cardW, height: cardH } = getCardDimensions();
    const gap   = 16;
    const pad   = 12;

    let x = pinX - cardW / 2;
    let y = pinY - cardH - gap;

    if (y < pad)             y = pinY + gap + 30;
    if (y + cardH > contH)   y = contH - cardH - pad;
    x = Math.max(pad, Math.min(x, contW - cardW - pad));
    y = Math.max(pad, y);

    return { x, y };
  }, [getCardDimensions]);

  useEffect(() => {
    if (!hasToken || map.current || !mapContainer.current) return;

    mapboxgl.accessToken = mapboxToken!;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style:     'mapbox://styles/mapbox/dark-v11',
      center:    [121.4737, 31.2304],
      zoom:      12,
    });

    m.addControl(new mapboxgl.NavigationControl(), 'top-right');

    m.on('click', () => setCard(null));

    m.on('load', () => {
      map.current = m;
      setMapReady(true);
    });

    return () => { m.remove(); map.current = null; setMapReady(false); };
  }, [hasToken, mapboxToken]);

  useEffect(() => {
    if (!mapReady || !map.current) return;

    markersRef.current.forEach(mk => mk.remove());
    markersRef.current = [];

    validSpots.forEach(spot => {
      const el = makePinEl(false);

      el.addEventListener('mouseenter', () => { el.innerHTML = makePinEl(true).innerHTML; });
      el.addEventListener('mouseleave', () => { el.innerHTML = makePinEl(false).innerHTML; });

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const point = map.current!.project([spot.lng, spot.lat]);
        const { x, y } = computePos(point.x, point.y);

        const cats: string[] = Array.isArray(spot.category) ? spot.category : (spot.category ? [spot.category] : []);
        const primaryCategory = cats[0] ?? '';
        const neigh = Array.isArray(spot.neighborhood) ? spot.neighborhood[0] ?? '' : (spot.neighborhood ?? '');

        setCard({
          spot: {
            name:         spot.name,
            chineseName:  spot.chineseName  ?? '',
            category:     primaryCategory,
            neighborhood: neigh,
            price:        spot.price        ?? '',
            averageSpend: (spot.averageSpend ?? '').trim(),
            description:  spot.description  ?? '',
            localTip:     spot.localTip     ?? '',
            vibes:        (spot.vibes ?? []).slice(0, 3),
            rating:       spot.rating ?? 0,
            images:       spot.images ?? [],
            amapUrl:      spot.amapUrl ?? '',
            exploreUrl:   `/explore?category=${encodeURIComponent(primaryCategory)}`,
          },
          x, y,
        });
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([spot.lng, spot.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    const onMove = () => {
      setCard(prev => {
        if (!prev || !map.current) return prev;
        const spot = validSpots.find(s => s.name === prev.spot.name);
        if (!spot) return prev;
        const point = map.current.project([spot.lng, spot.lat]);
        const { x, y } = computePos(point.x, point.y);
        return { ...prev, x, y };
      });
    };
    map.current.on('move', onMove);

    return () => { map.current?.off('move', onMove); };
  }, [mapReady, validSpots, computePos]);

  if (!hasToken) {
    return (
      <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center p-6 text-center">
        <p className="text-white/70 text-sm">
          Add <code className="text-white">NEXT_PUBLIC_MAPBOX_TOKEN</code> to .env.local and restart.
        </p>
      </div>
    );
  }

  const s = card?.spot;
  const { width: cardWidth, height: cardHeight } = getCardDimensions();
  const totalImages = s?.images?.length ?? 0;
  const currentImage = s?.images?.[imgIdx];

  const priceLabel = s?.price && s.price !== 'Free'
    ? (s.averageSpend
        ? `${s.price} · ~${s.averageSpend}`
        : s.price === '$' ? '$ Budget' : s.price === '$$' ? '$$ Mid-range' : '$$$ Splurge')
    : '';

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {card && s && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position:     'absolute',
            left:         card.x,
            top:          card.y,
            width:        cardWidth,
            maxHeight:    cardHeight,
            zIndex:       20,
            background:   '#ffffff',
            borderRadius: '20px',
            overflow:     'auto',
            boxShadow:    '0 16px 48px rgba(0,0,0,0.24), 0 2px 8px rgba(0,0,0,0.06)',
            fontFamily:   FONT,
            display:      'flex',
            flexDirection:'column',
            animation:    'cardIn 0.18s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <style>{`
            @keyframes cardIn {
              from { opacity:0; transform:translateY(8px) scale(0.97); }
              to   { opacity:1; transform:translateY(0) scale(1); }
            }
            .clamp-2 {
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            .clamp-3 {
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          `}</style>

          {/* Close */}
          <button onClick={() => setCard(null)} style={{
            position: 'absolute', top: 12, right: 12, zIndex: 30,
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)', border: 'none',
            color: '#fff', fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}>✕</button>

          {/* Rating badge — top left over image */}
          {s.rating > 0 && (
            <div style={{
              position: 'absolute', top: 12, left: 12, zIndex: 30,
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
              padding: '4px 9px', borderRadius: 20,
              color: 'white', fontSize: 11, fontWeight: 600,
            }}>
              <Star size={11} fill="white" stroke="none" />
              {s.rating.toFixed(1)}
            </div>
          )}

          {/* Image carousel */}
          <div style={{ position: 'relative', width: '100%', height: 150, background: '#f0efed', overflow: 'hidden', flexShrink: 0 }}>
            {currentImage ? (
              <img
                key={currentImage.url}
                src={currentImage.url}
                alt={s.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(135deg, #f5f2ee, #ede6db)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'rgba(0,0,0,0.16)',
              }}>{s.category}</div>
            )}

            {totalImages > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i - 1 + totalImages) % totalImages); }}
                  style={{
                    position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(6px)', zIndex: 5,
                  }}
                  aria-label="Previous"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i + 1) % totalImages); }}
                  style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(6px)', zIndex: 5,
                  }}
                  aria-label="Next"
                >
                  <ChevronRight size={14} />
                </button>
                <div style={{
                  position: 'absolute', bottom: 8, left: 0, right: 0,
                  display: 'flex', gap: 4, justifyContent: 'center', zIndex: 5,
                }}>
                  {s.images.map((_, i) => (
                    <span
                      key={i}
                      style={{
                        width: i === imgIdx ? 14 : 5,
                        height: 5,
                        borderRadius: 5,
                        background: i === imgIdx ? 'white' : 'rgba(255,255,255,0.55)',
                        transition: 'all 0.2s',
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <SpotCardBody
            name={s.name}
            chineseName={s.chineseName}
            category={s.category}
            neighborhood={s.neighborhood}
            priceLabel={priceLabel}
            description={s.description}
            vibes={s.vibes}
            localTip={s.localTip}
            amapUrl={s.amapUrl}
            exploreUrl={s.exploreUrl}
            headerPaddingRight={28}
            pinActions={false}
          />
        </div>
      )}
    </div>
  );
}