'use client';

/**
 * SpotCard — premium minimal card for explore grid.
 */

import { useState } from 'react';
import {
  MapPin, Star, Coffee, Utensils, Wine, Music, ShoppingBag,
  Trees, Eye, Bookmark, BookmarkCheck, Navigation,
  Activity, BookOpen,
} from 'lucide-react';

export const ACCENT = {
  black: '#111110',
  red: '#7f1d1d',
  border: '#ebebeb',
  muted: '#a8a29e',
  faint: '#d6d3d1',
  body: '#57534e',
} as const;

/** Matches root layout Inter variable */
export const FONT = 'var(--font-inter), "Inter", system-ui, -apple-system, sans-serif';

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

const CLAMP_MIN_CHARS = 100;

export function ExpandableText({
  text,
  lines = 3,
  fontSize = 13,
  onToggleClick,
}: {
  text: string;
  lines?: number;
  fontSize?: number;
  onToggleClick?: (e: React.MouseEvent) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const showToggle = text.length > CLAMP_MIN_CHARS;

  return (
    <div>
      <p
        style={{
          margin: 0,
          fontSize,
          fontWeight: 400,
          color: ACCENT.body,
          lineHeight: 1.65,
          fontFamily: FONT,
          wordBreak: 'break-word',
          ...(expanded
            ? {}
            : ({
                display: '-webkit-box',
                WebkitLineClamp: lines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              } as React.CSSProperties)),
        }}
      >
        {text}
      </p>
      {showToggle && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleClick?.(e);
            setExpanded((v) => !v);
          }}
          style={{
            marginTop: '6px',
            padding: 0,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
            color: ACCENT.red,
            fontFamily: FONT,
            letterSpacing: '0.01em',
          }}
        >
          {expanded ? 'Show less' : 'Read more…'}
        </button>
      )}
    </div>
  );
}

export function SectionDivider() {
  return (
    <div
      role="presentation"
      style={{
        width: '28px',
        height: '2px',
        background: ACCENT.red,
        borderRadius: '1px',
        margin: '14px 0 16px',
        flexShrink: 0,
      }}
    />
  );
}

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
  if (averageSpend?.trim()) return averageSpend.trim();
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
  const src = images[idx]?.url ?? null;

  return (
    <div style={{ position: 'relative', width: '100%', height: 200, overflow: 'hidden', background: '#fafaf9' }}>
      {src ? (
        <img
          src={src}
          alt={spot.name}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 70%', display: 'block',
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: 500, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: ACCENT.muted, fontFamily: FONT,
        }}>
          {getFirstCategory(spot) || 'Spot'}
        </div>
      )}

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      {images.length > 1 && (
        <>
          <button type="button" onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); }}
            style={navBtn('left')}>‹</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); }}
            style={navBtn('right')}>›</button>
        </>
      )}

      {spot.rating != null && spot.rating > 0 && (
        <div style={{
          position: 'absolute', top: '10px', left: '10px', zIndex: 3,
          display: 'flex', alignItems: 'center', gap: '3px',
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
          borderRadius: '100px', padding: '3px 8px',
        }}>
          <Star style={{ width: '10px', height: '10px', fill: '#ca8a04', color: '#ca8a04' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: ACCENT.black, fontFamily: FONT }}>
            {spot.rating.toFixed(1)}
          </span>
        </div>
      )}

      {formatPriceBadge(spot.price, spot.averageSpend) && (
        <div style={{
          position: 'absolute', bottom: '10px', left: '10px', zIndex: 3,
          background: 'rgba(17,17,16,0.72)', backdropFilter: 'blur(6px)',
          borderRadius: '100px', padding: '3px 9px',
        }}>
          <span style={{ fontSize: '10px', fontWeight: 500, color: 'white', fontFamily: FONT }}>
            {formatPriceBadge(spot.price, spot.averageSpend)}
          </span>
        </div>
      )}
    </div>
  );
}

function navBtn(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    [side]: '8px', zIndex: 4,
    width: '26px', height: '26px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.9)', border: 'none',
    color: ACCENT.black, fontSize: '15px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
}

export function MinimalHashtags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <p style={{
      margin: 0,
      fontSize: '12px',
      fontWeight: 400,
      color: ACCENT.muted,
      lineHeight: 1.5,
      fontFamily: FONT,
      letterSpacing: '0.01em',
    }}>
      {tags.map((tag, i) => (
        <span key={tag}>
          {i > 0 && <span style={{ margin: '0 6px', color: ACCENT.faint }}>·</span>}
          #{tag.toLowerCase()}
        </span>
      ))}
    </p>
  );
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
    <article
      style={{
        background: '#fff',
        borderRadius: '14px',
        border: `1px solid ${ACCENT.border}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: FONT,
        transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#d6d3d1';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = ACCENT.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <CardImageArea spot={spot} />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleSave(spot.id); }}
          aria-label={isSaved ? 'Remove bookmark' : 'Save spot'}
          style={{
            position: 'absolute', top: '10px', right: '10px', zIndex: 5,
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {isSaved
            ? <BookmarkCheck style={{ width: '14px', height: '14px', color: ACCENT.red }} strokeWidth={2} />
            : <Bookmark style={{ width: '14px', height: '14px', color: ACCENT.muted }} strokeWidth={1.75} />}
        </button>
      </div>

      {/* Body: flex column; content grows; actions pinned to bottom */}
      <div style={{
        padding: '16px 18px 18px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}>
        {/* ── Upper block: title + meta (tight group) ── */}
        <header style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3 style={{
                margin: 0,
                fontSize: '17px',
                fontWeight: 600,
                color: ACCENT.black,
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
                fontFamily: FONT,
              }}>
                {spot.name}
              </h3>
              {spot.chineseName && (
                <p style={{
                  margin: '3px 0 0',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: ACCENT.muted,
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {spot.chineseName}
                </p>
              )}
              {/* Meta row — sits close under title */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                marginTop: '6px',
              }}>
                {cat && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: ACCENT.muted,
                  }}>
                    {cat}
                  </span>
                )}
                {hood && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: ACCENT.body,
                  }}>
                    <Navigation style={{ width: '11px', height: '11px', color: ACCENT.red, flexShrink: 0 }} strokeWidth={2} />
                    {hood}
                  </span>
                )}
              </div>
            </div>
            <Icon style={{ width: '16px', height: '16px', color: ACCENT.faint, flexShrink: 0, marginTop: '2px' }} strokeWidth={1.5} />
          </div>
        </header>

        <SectionDivider />

        {/* ── Lower content (fills space above actions) ── */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          minHeight: 0,
        }}>
          {spot.hours && (
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: ACCENT.muted,
              lineHeight: 1.45,
              fontFamily: FONT,
            }}>
              {spot.hours}
            </p>
          )}

          {spot.description && (
            <ExpandableText text={spot.description} lines={3} />
          )}

          {spot.vibes && spot.vibes.length > 0 && (
            <MinimalHashtags tags={spot.vibes} />
          )}

          {spot.localTip && (
            <div>
              <p style={{
                margin: '0 0 6px',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: ACCENT.red,
                fontFamily: FONT,
              }}>
                Local tip
              </p>
              <ExpandableText text={spot.localTip} lines={2} fontSize={12.5} />
            </div>
          )}
        </div>

        {/* ── Actions — always at card bottom ── */}
        <div style={{
          flexShrink: 0,
          marginTop: 'auto',
          paddingTop: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {spot.amapUrl && (
            <a
              href={spot.amapUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                background: ACCENT.black,
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                textDecoration: 'none',
                fontFamily: FONT,
              }}
            >
              <Navigation style={{ width: '14px', height: '14px' }} strokeWidth={2} />
              Navigate
            </a>
          )}
          {(spot.tiktokUrl || spot.rednoteUrl) && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {spot.tiktokUrl && (
                <a href={spot.tiktokUrl} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={secondaryLinkStyle}>
                  TikTok
                </a>
              )}
              {spot.rednoteUrl && (
                <a href={spot.rednoteUrl} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={secondaryLinkStyle}>
                  小红书
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

const secondaryLinkStyle: React.CSSProperties = {
  flex: 1,
  textAlign: 'center',
  padding: '9px',
  fontSize: '12px',
  fontWeight: 500,
  color: ACCENT.body,
  textDecoration: 'none',
  borderRadius: '8px',
  background: 'transparent',
  border: `1px solid ${ACCENT.border}`,
  fontFamily: FONT,
};
