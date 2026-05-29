'use client';

/**
 * SpotCard — shared card component used on both the landing page map section
 * and the explore page browse grid. One component, one design, everywhere.
 */

import { useState } from 'react';
import {
  MapPin, Star, Coffee, Utensils, Wine, Music, ShoppingBag,
  Trees, Eye, Bookmark, BookmarkCheck, Navigation,
  Activity, BookOpen,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Spot = {
  id: string;
  name: string;
  chineseName?: string;
  category: string | string[];
  neighborhood: string;
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

/**
 * Price badge: averageSpend if set, else tier symbol.
 * Always shown in ¥ for Chinese context.
 */
function formatPriceBadge(price?: string, averageSpend?: string): string | null {
  if (averageSpend && averageSpend.trim()) return averageSpend.trim();
  if (!price || price === 'Free') return price === 'Free' ? 'Free' : null;
  return price.replace(/\$/g, '¥');
}

function getFirstCategory(spot: Spot): string {
  if (Array.isArray(spot.category)) return spot.category[0] ?? '';
  return spot.category ?? '';
}

// ─── Image area ──────────────────────────────────────────────────────────────

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
      position: 'relative', width: '100%', height: 240,
      overflow: 'hidden',
      background: '#f0efed',
    }}>
      {/* Photo or placeholder */}
      {src ? (
        <img
          src={src}
          alt={spot.name}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 70%',
            display: 'block',
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(0,0,0,0.18)', fontSize: '11px',
          fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
          background: 'linear-gradient(135deg, #f5f2ee, #ede6db)',
        }}>
          {getFirstCategory(spot) || 'Spot'}
        </div>
      )}

      {/* Bottom gradient for badge readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 40%)',
        pointerEvents: 'none',
      }} />

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button onClick={prev} style={navBtnStyle('left')}>‹</button>
          <button onClick={next} style={navBtnStyle('right')}>›</button>
          <div style={{
            position: 'absolute', bottom: '10px', left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', gap: '4px', zIndex: 4,
          }}>
            {images.map((_, i) => (
              <div key={i} style={{
                width: i === idx ? '14px' : '5px',
                height: '5px', borderRadius: '3px',
                background: i === idx ? 'white' : 'rgba(255,255,255,0.5)',
                transition: 'width 0.2s',
              }} />
            ))}
          </div>
        </>
      )}

      {/* Rating */}
      {spot.rating != null && spot.rating > 0 && (
        <div style={{
          position: 'absolute', top: '10px', left: '10px', zIndex: 3,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          borderRadius: '20px', padding: '4px 10px',
          display: 'flex', alignItems: 'center', gap: '4px',
          border: '0.5px solid rgba(255,255,255,0.12)',
        }}>
          <Star style={{ width: '11px', height: '11px', fill: '#f5c542', color: '#f5c542' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'white' }}>
            {spot.rating.toFixed(1)}
          </span>
        </div>
      )}

      {/* Price badge */}
      {formatPriceBadge(spot.price, spot.averageSpend) && (
        <div style={{
          position: 'absolute', bottom: '10px', left: '10px', zIndex: 3,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          borderRadius: '20px', padding: '4px 10px',
          border: '0.5px solid rgba(255,255,255,0.12)',
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
    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
    border: '0.5px solid rgba(255,255,255,0.15)',
    color: 'white', fontSize: '17px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', lineHeight: 1, fontWeight: 400,
  };
}

// ─── SpotCard ─────────────────────────────────────────────────────────────────

type SpotCardProps = {
  spot: Spot;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
};

export function SpotCard({ spot, isSaved, onToggleSave }: SpotCardProps) {
  const cat = getFirstCategory(spot);
  const Icon = getCategoryIcon(cat);

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      border: '0.5px solid #e5e5e5',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%', // <-- FIXED: Ensures card stretches fully inside grid columns
      transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,0,0,0.2)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e5e5';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Image area */}
      <div style={{ position: 'relative' }}>
        <CardImageArea spot={spot} />

        {/* Save */}
        <button
          onClick={e => { e.stopPropagation(); onToggleSave(spot.id); }}
          style={{
            position: 'absolute', top: '10px', right: '10px', zIndex: 5,
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
            border: '0.5px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {isSaved
            ? <BookmarkCheck style={{ width: '14px', height: '14px', color: 'white' }} />
            : <Bookmark style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.85)' }} />}
        </button>
      </div>

      {/* Card body */}
      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Name row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '4px' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{
              fontSize: '16px', fontWeight: 700, color: '#0a0a0a',
              letterSpacing: '-0.02em', lineHeight: 1.25,
              margin: 0,
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            } as React.CSSProperties}>
              {spot.name}
            </h3>
            {spot.chineseName && (
              <p style={{
                fontSize: '12px', color: 'rgba(0,0,0,0.36)', marginTop: '2px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {spot.chineseName}
              </p>
            )}
          </div>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon style={{ width: '15px', height: '15px', color: 'rgba(0,0,0,0.5)' }} />
          </div>
        </div>

        {/* Meta row: category pill + neighbourhood */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          {cat && (
            <span style={{
              fontSize: '10px', fontWeight: 600, color: 'white',
              background: '#111110', padding: '3px 9px', borderRadius: '20px',
              letterSpacing: '0.01em',
            }}>{cat}</span>
          )}
          {spot.neighborhood && (
            <span style={{ fontSize: '11px', color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>
              {spot.neighborhood}
            </span>
          )}
        </div>

        {/* Hours */}
        {spot.hours && (
          <p style={{
            fontSize: '11px', color: 'rgba(0,0,0,0.45)',
            marginBottom: '10px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            🕒 {spot.hours}
          </p>
        )}

        {/* Description — clamped to 2 lines */}
        {spot.description && (
          <p style={{
            fontSize: '12.5px', color: 'rgba(0,0,0,0.62)', lineHeight: 1.55,
            marginBottom: '10px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', textOverflow: 'ellipsis',
          } as React.CSSProperties}>
            {spot.description}
          </p>
        )}

        {/* Vibe tags */}
        {spot.vibes && spot.vibes.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
            {spot.vibes.slice(0, 3).map(tag => (
              <span key={tag} style={{
                fontSize: '10.5px', fontWeight: 500,
                padding: '3px 9px', borderRadius: '20px',
                background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.55)',
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Local tip — accent box, 3 line clamp */}
        {spot.localTip && (
          <div style={{
            background: '#faf7f2',
            borderLeft: '2px solid #7f1d1d',
            borderRadius: '0 10px 10px 0',
            padding: '9px 12px', marginBottom: '10px',
          }}>
            <p style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#7f1d1d', marginBottom: '3px',
            }}>
              Local tip
            </p>
            <p style={{
              fontSize: '11px', color: 'rgba(0,0,0,0.62)',
              lineHeight: 1.5, fontStyle: 'italic',
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
              overflow: 'hidden', textOverflow: 'ellipsis',
            } as React.CSSProperties}>
              {spot.localTip}
            </p>
          </div>
        )}

        {/* Action row */}
        <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}> {/* <-- FIXED: Replaced spacer div with marginTop: 'auto' */}
          {spot.tiktokUrl && (
            <a href={spot.tiktokUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()} style={actionBtnStyle('#010101', 'white')}>
              <span style={{ fontSize: '10px', fontWeight: 700 }}>TT</span>
              <span>TikTok</span>
            </a>
          )}
          {spot.rednoteUrl && (
            <a href={spot.rednoteUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()} style={actionBtnStyle('#FF2442', 'white')}>
              <span>小红书</span>
            </a>
          )}
          {spot.amapUrl && (
            <a href={spot.amapUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ ...actionBtnStyle('black', 'white'), flex: 1 }}>
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
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
    padding: '9px 12px', borderRadius: '10px',
    background: bg, color,
    fontSize: '12px', fontWeight: 500,
    textDecoration: 'none',
    transition: 'opacity 0.15s',
    cursor: 'pointer',
    border: 'none',
    flexShrink: 0,
  };
}