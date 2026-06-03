'use client';

/**
 * SpotCard — shared card for explore browse grid (and anywhere else).
 */

import { useState } from 'react';
import {
  MapPin, Star, Coffee, Utensils, Wine, Music, ShoppingBag,
  Trees, Eye, Bookmark, BookmarkCheck, Navigation,
  Activity, BookOpen, Sparkles,
} from 'lucide-react';

const ACCENT = {
  black: '#111110',
  red: '#7f1d1d',
  redTint: '#faf6f6',
  border: '#e7e5e4',
  muted: '#78716c',
  body: '#44403c',
} as const;

export type Spot = {
  id: string;
  name: string;
  chineseName?: string;
  category: string | string[];
  neighborhood: string | string[];
  address?: string;
  price?: string;
  averageSpend?: string;
  hours?: string;
  vibes?: string[];
  description?: string;
  localTip?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  amapUrl?: string;
  tiktokUrl?: string;
  rednoteUrl?: string;
  images?: { url: string }[];
};

function getCategoryIcon(cat: string) {
  switch (cat) {
    case 'Food':           return Utensils;
    case 'Cafés & Bakery': return Coffee;
    case 'Nightlife':      return Wine;
    case 'Culture':        return Music;
    case 'Shopping':       return ShoppingBag;
    case 'Nature':         return Trees;
    case 'Viewpoints':     return Eye;
    case 'Activities':     return Activity;
    case 'Study':          return BookOpen;
    default:               return MapPin;
  }
}

function formatPriceBadge(price?: string, averageSpend?: string): string | null {
  if (averageSpend && averageSpend.trim()) return averageSpend.trim();
  if (!price || price === 'Free') return price === 'Free' ? 'Free' : null;
  return price.replace(/\$/g, '¥');
}

function getFirstCategory(spot: Spot): string {
  if (Array.isArray(spot.category)) return spot.category[0] ?? '';
  return spot.category ?? '';
}

function formatNeighborhood(neighborhood?: string | string[]): string {
  if (!neighborhood) return '';
  if (Array.isArray(neighborhood)) return neighborhood[0] ?? '';
  return neighborhood;
}

function CardImageArea({ spot }: { spot: Spot }) {
  const images = spot.images ?? [];
  const [idx, setIdx] = useState(0);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx(i => (i - 1 + images.length) % images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx(i => (i + 1) % images.length);
  };

  const src = images[idx]?.url ?? null;

  return (
    <div style={{
      position: 'relative', width: '100%', height: 220,
      overflow: 'hidden', background: '#f5f5f4',
    }}>
      {src ? (
        <img
          src={src}
          alt={spot.name}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 70%',
            display: 'block',
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: ACCENT.muted, fontSize: '11px',
          fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {getFirstCategory(spot) || 'Spot'}
        </div>
      )}

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 45%)',
        pointerEvents: 'none',
      }} />

      {images.length > 1 && (
        <>
          <button onClick={prev} style={navBtnStyle('left')}>‹</button>
          <button onClick={next} style={navBtnStyle('right')}>›</button>
          <div style={{
            position: 'absolute', bottom: '12px', left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', gap: '4px', zIndex: 4,
          }}>
            {images.map((_, i) => (
              <div key={i} style={{
                width: i === idx ? '12px' : '4px',
                height: '4px', borderRadius: '2px',
                background: i === idx ? 'white' : 'rgba(255,255,255,0.45)',
                transition: 'width 0.2s',
              }} />
            ))}
          </div>
        </>
      )}

      {spot.rating != null && spot.rating > 0 && (
        <div style={{
          position: 'absolute', top: '12px', left: '12px', zIndex: 3,
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
          borderRadius: '20px', padding: '4px 9px',
          display: 'flex', alignItems: 'center', gap: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <Star style={{ width: '11px', height: '11px', fill: '#eab308', color: '#eab308' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: ACCENT.black }}>
            {spot.rating.toFixed(1)}
          </span>
        </div>
      )}

      {formatPriceBadge(spot.price, spot.averageSpend) && (
        <div style={{
          position: 'absolute', bottom: '12px', left: '12px', zIndex: 3,
          background: 'rgba(17,17,16,0.75)', backdropFilter: 'blur(8px)',
          borderRadius: '20px', padding: '4px 10px',
        }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'white' }}>
            {formatPriceBadge(spot.price, spot.averageSpend)}
          </span>
        </div>
      )}
    </div>
  );
}

function navBtnStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    top: '50%', transform: 'translateY(-50%)',
    [side]: '8px',
    zIndex: 4,
    width: '28px', height: '28px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.95)',
    border: 'none',
    color: ACCENT.black, fontSize: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', lineHeight: 1,
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  };
}

type SpotCardProps = {
  spot: Spot;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
};

export function SpotCard({ spot, isSaved, onToggleSave }: SpotCardProps) {
  const cat = getFirstCategory(spot);
  const hood = formatNeighborhood(spot.neighborhood);
  const Icon = getCategoryIcon(cat);

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        border: `1px solid ${ACCENT.border}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = '#d6d3d1';
        el.style.transform = 'translateY(-2px)';
        el.style.boxShadow = '0 12px 28px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = ACCENT.border;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'none';
      }}
    >
      <div style={{ position: 'relative' }}>
        <CardImageArea spot={spot} />
        <button
          onClick={e => { e.stopPropagation(); onToggleSave(spot.id); }}
          style={{
            position: 'absolute', top: '12px', right: '12px', zIndex: 5,
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {isSaved
            ? <BookmarkCheck style={{ width: '15px', height: '15px', color: ACCENT.red }} />
            : <Bookmark style={{ width: '15px', height: '15px', color: ACCENT.muted }} />}
        </button>
      </div>

      <div style={{
        padding: '18px 20px 20px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{
              fontSize: '17px', fontWeight: 700, color: ACCENT.black,
              letterSpacing: '-0.02em', lineHeight: 1.25, margin: 0,
            }}>
              {spot.name}
            </h3>
            {spot.chineseName && (
              <p style={{
                fontSize: '12px', color: ACCENT.muted, margin: '4px 0 0',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {spot.chineseName}
              </p>
            )}
          </div>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
            background: ACCENT.black,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon style={{ width: '14px', height: '14px', color: 'white' }} />
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {cat && (
            <span style={{
              fontSize: '10px', fontWeight: 600, color: 'white',
              background: ACCENT.black, padding: '4px 10px', borderRadius: '20px',
              letterSpacing: '0.02em',
            }}>
              {cat}
            </span>
          )}
          {hood && (
            <span style={{ fontSize: '12px', color: ACCENT.muted, fontWeight: 500 }}>
              {hood}
            </span>
          )}
        </div>

        {/* Hours */}
        {spot.hours && (
          <p style={{
            fontSize: '12px', color: ACCENT.muted, margin: 0, lineHeight: 1.45,
          }}>
            🕒 {spot.hours}
          </p>
        )}

        {/* Description — full text, no clamp */}
        {spot.description && (
          <p style={{
            fontSize: '13.5px', color: ACCENT.body, lineHeight: 1.6, margin: 0,
            wordBreak: 'break-word',
          }}>
            {spot.description}
          </p>
        )}

        {/* Vibes */}
        {spot.vibes && spot.vibes.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {spot.vibes.map(tag => (
              <span key={tag} style={{
                fontSize: '11px', fontWeight: 500,
                color: ACCENT.black,
                background: '#f5f5f4',
                padding: '5px 10px',
                borderRadius: '20px',
                border: `1px solid ${ACCENT.border}`,
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Local tip */}
        {spot.localTip && (
          <div style={{
            background: ACCENT.redTint,
            borderLeft: `3px solid ${ACCENT.red}`,
            borderRadius: '0 10px 10px 0',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: ACCENT.red }}>
              <Sparkles style={{ width: '11px', height: '11px' }} />
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                Local tip
              </span>
            </div>
            <p style={{
              fontSize: '12.5px', color: ACCENT.body, margin: 0,
              lineHeight: 1.55, wordBreak: 'break-word',
            }}>
              {spot.localTip}
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '8px',
          paddingTop: '4px',
          borderTop: `1px solid ${ACCENT.border}`,
          marginTop: 'auto',
        }}>
          {spot.tiktokUrl && (
            <a href={spot.tiktokUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()} style={actionBtnStyle(ACCENT.black, 'white')}>
              <span style={{ fontSize: '10px', fontWeight: 700 }}>TT</span>
              <span>TikTok</span>
            </a>
          )}
          {spot.rednoteUrl && (
            <a href={spot.rednoteUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()} style={actionBtnStyle(ACCENT.red, 'white')}>
              <span>小红书</span>
            </a>
          )}
          {spot.amapUrl && (
            <a href={spot.amapUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ ...actionBtnStyle(ACCENT.black, 'white'), flex: '1 1 120px' }}>
              <Navigation style={{ width: '12px', height: '12px' }} />
              <span>Navigate</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function actionBtnStyle(bg: string, color: string): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '10px 14px', borderRadius: '10px',
    background: bg, color,
    fontSize: '12px', fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    border: 'none',
    flexShrink: 0,
    minHeight: '40px',
  };
}
