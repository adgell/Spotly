'use client';

/**
 * SpotCard + shared card UI for explore grid and map popup.
 */

import { useState } from 'react';
import {
  MapPin, Star, Coffee, Utensils, Wine, Music, ShoppingBag,
  Trees, Eye, Bookmark, BookmarkCheck, Navigation,
  Activity, BookOpen, Sparkles,
} from 'lucide-react';

export const ACCENT = {
  black: '#111110',
  red: '#7f1d1d',
  linen: '#faf7f2',
  border: '#ebebeb',
  muted: '#a8a29e',
  faint: '#d6d3d1',
  body: '#57534e',
} as const;

export const FONT = 'var(--font-inter), "Inter", system-ui, -apple-system, sans-serif';

/** ~3 lines at 13px / 1.65 line-height */
const READ_MORE_MIN_CHARS = 130;

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

function needsTruncation(text: string, lines: number): boolean {
  const trimmed = text.trim();
  if (trimmed.length < READ_MORE_MIN_CHARS) return false;
  const lineCount = trimmed.split(/\n/).length;
  if (lineCount > lines) return true;
  return trimmed.length >= READ_MORE_MIN_CHARS;
}

export function ExpandableText({
  text,
  lines = 3,
  fontSize = 13,
}: {
  text: string;
  lines?: number;
  fontSize?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const canTruncate = needsTruncation(text, lines);

  const paragraphStyle: React.CSSProperties = {
    margin: 0,
    fontSize,
    fontWeight: 400,
    color: ACCENT.body,
    lineHeight: 1.65,
    fontFamily: FONT,
    wordBreak: 'break-word',
    ...(canTruncate && !expanded
      ? {
          display: '-webkit-box',
          WebkitLineClamp: lines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }
      : {}),
  };

  return (
    <div style={{ flexShrink: 0 }}>
      <p style={paragraphStyle}>{text}</p>
      {canTruncate && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          style={{
            marginTop: '8px',
            padding: 0,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
            color: ACCENT.red,
            fontFamily: FONT,
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
        margin: '12px 0 0',
        flexShrink: 0,
      }}
    />
  );
}

export function HashtagPills({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        flexShrink: 0,
        marginTop: '4px',
      }}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: ACCENT.body,
            padding: '6px 12px',
            borderRadius: '100px',
            border: `1px solid ${ACCENT.border}`,
            background: '#fafaf9',
            fontFamily: FONT,
            lineHeight: 1,
          }}
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}

export function LocalTipBlock({ tip }: { tip: string }) {
  const canTruncate = needsTruncation(tip, 3);

  return (
    <div
      style={{
        flexShrink: 0,
        marginTop: '4px',
        background: ACCENT.linen,
        borderLeft: `3px solid ${ACCENT.red}`,
        borderRadius: '0 10px 10px 0',
        padding: '14px 16px',
        boxShadow: 'inset 0 0 0 1px rgba(127, 29, 29, 0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '10px',
        }}
      >
        <Sparkles
          style={{ width: '12px', height: '12px', color: ACCENT.red, flexShrink: 0 }}
          strokeWidth={2}
        />
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: ACCENT.red,
            fontFamily: FONT,
          }}
        >
          ★ Local tip
        </span>
      </div>
      <LocalTipBody tip={tip} canTruncate={canTruncate} />
    </div>
  );
}

function LocalTipBody({ tip, canTruncate }: { tip: string; canTruncate: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <p
        style={{
          margin: 0,
          fontSize: '12.5px',
          color: ACCENT.body,
          lineHeight: 1.6,
          fontFamily: FONT,
          wordBreak: 'break-word',
          ...(canTruncate && !expanded
            ? {
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }
            : {}),
        }}
      >
        {tip}
      </p>
      {canTruncate && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          style={{
            marginTop: '8px',
            padding: 0,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
            color: ACCENT.red,
            fontFamily: FONT,
          }}
        >
          {expanded ? 'Show less' : 'Read more…'}
        </button>
      )}
    </>
  );
}

/** Shared card body layout — no flex:1 on main (prevents action overlap). */
export function SpotCardBody({
  name,
  chineseName,
  category,
  neighborhood,
  priceLabel,
  hours,
  description,
  vibes,
  localTip,
  amapUrl,
  exploreUrl,
  tiktokUrl,
  rednoteUrl,
  headerPaddingRight,
  pinActions = false,
}: {
  name: string;
  chineseName?: string;
  category?: string;
  neighborhood?: string;
  priceLabel?: string;
  hours?: string;
  description?: string;
  vibes?: string[];
  localTip?: string;
  amapUrl?: string;
  exploreUrl?: string;
  tiktokUrl?: string;
  rednoteUrl?: string;
  headerPaddingRight?: number;
  /** Grid cards: push actions to bottom. Map popup: natural flow + scroll. */
  pinActions?: boolean;
}) {
  return (
    <div
      style={{
        padding: '16px 18px 18px',
        display: 'flex',
        flexDirection: 'column',
        flex: pinActions ? 1 : undefined,
        minHeight: pinActions ? 0 : undefined,
        boxSizing: 'border-box',
      }}
    >
      <header style={{ flexShrink: 0, paddingRight: headerPaddingRight ?? 0 }}>
        <h3
          style={{
            margin: 0,
            fontSize: '17px',
            fontWeight: 600,
            color: ACCENT.black,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            fontFamily: FONT,
          }}
        >
          {name}
        </h3>
        {chineseName && (
          <p
            style={{
              margin: '3px 0 0',
              fontSize: '12px',
              color: ACCENT.muted,
              fontFamily: FONT,
            }}
          >
            {chineseName}
          </p>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            marginTop: '6px',
          }}
        >
          {category && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: ACCENT.muted,
                fontFamily: FONT,
              }}
            >
              {category}
            </span>
          )}
          {neighborhood && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 500,
                color: ACCENT.body,
                fontFamily: FONT,
              }}
            >
              <Navigation
                style={{ width: '11px', height: '11px', color: ACCENT.red, flexShrink: 0 }}
                strokeWidth={2}
              />
              {neighborhood}
            </span>
          )}
          {priceLabel && (
            <span style={{ fontSize: '12px', color: ACCENT.muted, fontFamily: FONT }}>
              {priceLabel}
            </span>
          )}
        </div>
      </header>

      <SectionDivider />

      {/* Main — natural height only (never flex:1) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          flexShrink: 0,
          paddingTop: '16px',
        }}
      >
        {hours && (
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              color: ACCENT.muted,
              lineHeight: 1.45,
              fontFamily: FONT,
            }}
          >
            {hours}
          </p>
        )}

        {description && <ExpandableText text={description} lines={3} />}

        {vibes && vibes.length > 0 && <HashtagPills tags={vibes} />}

        {localTip && <LocalTipBlock tip={localTip} />}
      </div>

      <CardActions
        amapUrl={amapUrl}
        exploreUrl={exploreUrl}
        tiktokUrl={tiktokUrl}
        rednoteUrl={rednoteUrl}
        pinActions={pinActions}
      />
    </div>
  );
}

function CardActions({
  amapUrl,
  exploreUrl,
  tiktokUrl,
  rednoteUrl,
  pinActions,
}: {
  amapUrl?: string;
  exploreUrl?: string;
  tiktokUrl?: string;
  rednoteUrl?: string;
  pinActions: boolean;
}) {
  const hasSecondary = Boolean(tiktokUrl || rednoteUrl);
  if (!amapUrl && !exploreUrl && !hasSecondary) return null;

  return (
    <div
      style={{
        flexShrink: 0,
        marginTop: pinActions ? 'auto' : '20px',
        paddingTop: pinActions ? '20px' : 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {amapUrl && (
        <a
          href={amapUrl}
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
            textDecoration: 'none',
            fontFamily: FONT,
            boxSizing: 'border-box',
          }}
        >
          <Navigation style={{ width: '14px', height: '14px' }} strokeWidth={2} />
          Navigate
        </a>
      )}
      {exploreUrl && (
        <a
          href={exploreUrl}
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'block',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 500,
            color: ACCENT.body,
            padding: '4px 0',
            textDecoration: 'none',
            fontFamily: FONT,
          }}
        >
          See more like this →
        </a>
      )}
      {hasSecondary && (
        <div style={{ display: 'flex', gap: '8px' }}>
          {tiktokUrl && (
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={secondaryLinkStyle}
            >
              TikTok
            </a>
          )}
          {rednoteUrl && (
            <a
              href={rednoteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={secondaryLinkStyle}
            >
              小红书
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function getCategoryIcon(cat: string) {
  switch (cat) {
    case 'Food':
      return Utensils;
    case 'Cafés & Bakery':
      return Coffee;
    case 'Nightlife':
      return Wine;
    case 'Culture':
      return Music;
    case 'Shopping':
      return ShoppingBag;
    case 'Nature':
      return Trees;
    case 'Viewpoints':
      return Eye;
    case 'Activities':
      return Activity;
    case 'Study':
      return BookOpen;
    default:
      return MapPin;
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
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 200,
        overflow: 'hidden',
        background: '#fafaf9',
        flexShrink: 0,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={spot.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 70%',
            display: 'block',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: ACCENT.muted,
            fontFamily: FONT,
          }}
        >
          {getFirstCategory(spot) || 'Spot'}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIdx((i) => (i - 1 + images.length) % images.length);
            }}
            style={navBtn('left')}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIdx((i) => (i + 1) % images.length);
            }}
            style={navBtn('right')}
          >
            ›
          </button>
        </>
      )}

      {spot.rating != null && spot.rating > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(8px)',
            borderRadius: '100px',
            padding: '3px 8px',
          }}
        >
          <Star style={{ width: '10px', height: '10px', fill: '#ca8a04', color: '#ca8a04' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: ACCENT.black, fontFamily: FONT }}>
            {spot.rating.toFixed(1)}
          </span>
        </div>
      )}

      {formatPriceBadge(spot.price, spot.averageSpend) && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            zIndex: 3,
            background: 'rgba(17,17,16,0.72)',
            backdropFilter: 'blur(6px)',
            borderRadius: '100px',
            padding: '3px 9px',
          }}
        >
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
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: '8px',
    zIndex: 4,
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    color: ACCENT.black,
    fontSize: '15px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(spot.id);
          }}
          aria-label={isSaved ? 'Remove bookmark' : 'Save spot'}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 5,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {isSaved ? (
            <BookmarkCheck style={{ width: '14px', height: '14px', color: ACCENT.red }} strokeWidth={2} />
          ) : (
            <Bookmark style={{ width: '14px', height: '14px', color: ACCENT.muted }} strokeWidth={1.75} />
          )}
        </button>
      </div>

      <SpotCardBody
        name={spot.name}
        chineseName={spot.chineseName}
        category={cat}
        neighborhood={hood}
        hours={spot.hours}
        description={spot.description}
        vibes={spot.vibes}
        localTip={spot.localTip}
        amapUrl={spot.amapUrl}
        tiktokUrl={spot.tiktokUrl}
        rednoteUrl={spot.rednoteUrl}
        pinActions
      />
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
  border: `1px solid ${ACCENT.border}`,
  fontFamily: FONT,
};
