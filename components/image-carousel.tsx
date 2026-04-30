'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Img = { url: string };

export default function ImageCarousel({
  images,
  alt,
  height = 176,
  fallback,
}: {
  images: Img[];
  alt: string;
  height?: number;
  fallback?: React.ReactNode;
}) {
  const [idx, setIdx] = useState(0);
  const [errored, setErrored] = useState<Set<number>>(new Set());

  const valid = images.filter((_, i) => !errored.has(i));
  const total = valid.length;

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIdx((i) => (i - 1 + total) % total);
  };
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIdx((i) => (i + 1) % total);
  };

  if (total === 0) {
    return (
      <div
        style={{
          width: '100%',
          height,
          background: 'linear-gradient(135deg, #f5f2ee, #ede6db)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          color: 'rgba(0,0,0,0.2)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 700,
        }}
      >
        {fallback ?? 'No image'}
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        background: '#f0efed',
      }}
    >
      {/* Image strip */}
      <div
        style={{
          display: 'flex',
          width: `${total * 100}%`,
          height: '100%',
          transform: `translateX(-${idx * (100 / total)}%)`,
          transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {valid.map((img, i) => (
          <div key={i} style={{ width: `${100 / total}%`, height: '100%', flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={`${alt} ${i + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={() =>
                setErrored((prev) => {
                  const s = new Set(prev);
                  s.add(i);
                  return s;
                })
              }
            />
          </div>
        ))}
      </div>

      {/* Arrows — only if 2+ images */}
      {total > 1 && (
        <>
          <button
            onClick={goPrev}
            style={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              zIndex: 2,
            }}
            aria-label="Previous image"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goNext}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              zIndex: 2,
            }}
            aria-label="Next image"
          >
            <ChevronRight size={16} />
          </button>

          {/* Dots */}
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: 0,
              right: 0,
              display: 'flex',
              gap: 4,
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            {valid.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === idx ? 16 : 5,
                  height: 5,
                  borderRadius: 5,
                  background: i === idx ? 'white' : 'rgba(255,255,255,0.55)',
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}