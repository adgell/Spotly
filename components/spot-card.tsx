'use client';

/**
 * SpotCard — shared card component used on both the landing page map section
 * and the explore page browse grid. Minimalist, premium, and clean.
 */

import { useState } from 'react';
import {
  MapPin, Star, Coffee, Utensils, Wine, Music, ShoppingBag,
  Trees, Eye, Bookmark, BookmarkCheck, Navigation,
  Activity, BookOpen, Sparkles
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
      background: '#f5f5f4',
    }}>
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
          color: '#a8a29e', fontSize: '11px',
          fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          background: '#f5f5f4',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          {getFirstCategory(spot) || 'Spot'}
        </div>
      )}

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 40%)',
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
                background: i === idx ? 'white' : 'rgba(255,255,255,0.4)',
                transition: 'width 0.2s',
              }} />
            ))}
          </div>
        </>
      )}

      {spot.rating != null && spot.rating > 0 && (
        <div style={{
          position: 'absolute', top: '12px', left: '12px', zIndex: 3,
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
          borderRadius: '30px', padding: '4px 8px',
          display: 'flex', alignItems: 'center', gap: '3px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <Star style={{ width: '10px', height: '10px', fill: '#eab308', color: '#eab308' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#1c1917', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {spot.rating.toFixed(1)}
          </span>
        </div>
      )}

      {formatPriceBadge(spot.price, spot.averageSpend) && (
        <div style={{
          position: 'absolute', bottom: '12px', left: '12px', zIndex: 3,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          borderRadius: '30px', padding: '4px 9px',
        }}>
          <span style={{ fontSize: '11px', fontWeight: 500, color: 'white', fontFamily: 'Inter, system-ui, sans-serif' }}>
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
    width: '26px', height: '26px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
    border: 'none',
    color: '#1c1917', fontSize: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', lineHeight: 1, boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
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
      border: '1px solid #e7e5e4',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      transition: 'all 0.2s ease',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#d6d3d1';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 24px rgba(0,0,0,0.04)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#e7e5e4';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Image area */}
      <div style={{ position: 'relative' }}>
        <CardImageArea spot={spot} />

        {/* Save Toggle */}
        <button
          onClick={e => { e.stopPropagation(); onToggleSave(spot.id); }}
          style={{
            position: 'absolute', top: '12px', right: '12px', zIndex: 5,
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'transform 0.15s',
          }}
        >
          {isSaved
            ? <BookmarkCheck style={{ width: '14px', height: '14px', color: '#1c1917' }} />
            : <Bookmark style={{ width: '14px', height: '14px', color: '#78716c' }} />}
        </button>
      </div>

      {/* Card body */}
      <div style={{ 
        padding: '20px', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        
        {/* upper section container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Title and Category Icon */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3 style={{
                fontSize: '16px', fontWeight: 600, color: '#1c1917',
                letterSpacing: '-0.01em', lineHeight: 1.3, margin: 0,
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              } as React.CSSProperties}>
                {spot.name}
              </h3>
              {spot.chineseName && (
                <p style={{
                  fontSize: '12px', color: '#a8a29e', marginTop: '3px',
                  margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {spot.chineseName}
                </p>
              )}
            </div>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
              background: '#f5f5f4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon style={{ width: '13px', height: '13px', color: '#57534e' }} />
            </div>
          </div>

          {/* Subheader / Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {cat && (
              <span style={{
                fontSize: '10px', fontWeight: 600, color: '#44403c',
                background: '#f5f5f4', padding: '3px 8px', borderRadius: '4px',
                letterSpacing: '0.02em', textTransform: 'uppercase'
              }}>{cat}</span>
            )}
            {spot.neighborhood && (
              <span style={{ fontSize: '12px', color: '#78716c', fontWeight: 400 }}>
                {spot.neighborhood}
              </span>
            )}
          </div>

          {/* Main Content Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {spot.hours && (
              <p style={{ fontSize: '11px', color: '#78716c', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ opacity: 0.8 }}>🕒</span> {spot.hours}
              </p>
            )}
            {spot.description && (
              <p style={{
                fontSize: '13px', color: '#57534e', lineHeight: 1.5, margin: 0,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden', textOverflow: 'ellipsis',
              } as React.CSSProperties}>
                {spot.description}
              </p>
            )}
          </div>

          {/* Clean minimal hash tags */}
          {spot.vibes && spot.vibes.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {spot.vibes.slice(0, 3).map(tag => (
                <span key={tag} style={{
                  fontSize: '11px', fontWeight: 400, color: '#78716c'
                }}>
                  #{tag.toLowerCase()}
                </span>
              ))}
            </div>
          )}

          {/* Polished Minimalist Local Tip Section */}
          {spot.localTip && (
            <div style={{
              borderLeft: '1.5px solid #d6d3d1',
              paddingLeft: '12px',
              marginTop: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#78716c' }}>
                <Sparkles style={{ width: '10px', height: '10px', color: '#a8a29e' }} />
                <span style={{
                  fontSize: '9px', fontWeight: 600, letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}>
                  Local Tip
                </span>
              </div>
              <p style={{
                fontSize: '12px', color: '#57534e', margin: 0,
                lineHeight: 1.45, fontStyle: 'normal',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden', textOverflow: 'ellipsis',
              } as React.CSSProperties}>
                {spot.localTip}
              </p>
            </div>
          )}
        </div>

        {/* Clean Minimal Action Buttons */}
        <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
          {spot.tiktokUrl && (
            <a href={spot.tiktokUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()} style={actionBtnStyle('#1c1917', 'white')}>
              <span style={{ fontSize: '10px', fontWeight: 700 }}>TT</span>
              <span>TikTok</span>
            </a>
          )}
          {spot.rednoteUrl && (
            <a href={spot.rednoteUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()} style={actionBtnStyle('#ef4444', 'white')}>
              <span>小红书</span>
            </a>
          )}
          {spot.amapUrl && (
            <a href={spot.amapUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ ...actionBtnStyle('#1c1917', 'white'), flex: 1 }}>
              <Navigation style={{ width: '11px', height: '11px', fill: 'currentColor' }} />
              <span style={{ fontWeight: 500 }}>Navigate</span>
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
    padding: '10px 14px', borderRadius: '8px',
    background: bg, color,
    fontSize: '12px', fontWeight: 500,
    textDecoration: 'none',
    transition: 'opacity 0.15s ease',
    cursor: 'pointer',
    border: 'none',
    flexShrink: 0,
  };
}