'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const profiles = [
  {
    emoji: '☕',
    label: 'The slow morning',
    name: 'Your café friend',
    description: 'Knows every hidden courtyard and the best window seat in the French Concession.',
    tags: ['Cafés', 'Parks', 'Bookstores'],
    filter: 'Coffee',
  },
  {
    emoji: '🍜',
    label: 'The obsessive',
    name: 'Your food friend',
    description: 'Will drag you 45 min on the metro for one specific bowl of noodles. Always worth it.',
    tags: ['Local Eats', 'Markets', 'Hidden Gems'],
    filter: 'Food',
  },
  {
    emoji: '🎨',
    label: 'The curious one',
    name: 'Your culture friend',
    description: 'Always has a neighborhood you\'ve never heard of and a story about every building.',
    tags: ['Galleries', 'History', 'Architecture'],
    filter: 'Culture',
  },
  {
    emoji: '🌙',
    label: 'After midnight',
    name: 'Your night friend',
    description: 'Knows which bars don\'t have signs and which ones close at 6am.',
    tags: ['Bars', 'Jazz', 'Late Night'],
    filter: 'Nightlife',
  },
  {
    emoji: '🛍️',
    label: 'The hunter',
    name: 'Your shopping friend',
    description: 'Finds the vintage store inside a parking garage and the designer you\'ve never heard of.',
    tags: ['Vintage', 'Local Brands', 'Markets'],
    filter: 'Shopping',
  },
];

function ProfileCard({ profile, index }: { profile: typeof profiles[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('profile-revealed');
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Link href={`/explore?category=${profile.filter}`}>
      <div
        ref={ref}
        className="profile-card group relative bg-white rounded-2xl border border-black/10 p-6 cursor-pointer transition-all duration-300 hover:border-black/25 hover:shadow-lg overflow-hidden"
        style={{ '--card-delay': `${index * 80}ms` } as React.CSSProperties}
      >
        {/* Subtle hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{ background: 'radial-gradient(ellipse at 10% 10%, rgba(127,29,29,0.04) 0%, transparent 65%)' }} />

        <div className="relative">
          {/* Emoji */}
          <div className="text-3xl mb-4 leading-none">{profile.emoji}</div>

          {/* Label + Name */}
          <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#7f1d1d] mb-1">
            {profile.label}
          </p>
          <h3 className="font-semibold text-lg tracking-tight text-black mb-3 leading-tight">
            {profile.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-black/50 leading-relaxed mb-4">
            {profile.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {profile.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2.5 py-1 rounded-full bg-black/5 text-black/50 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-black/30 group-hover:text-black/60 transition-colors">
            <span>Explore spots</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function GuideProfiles() {
  return (
    <section className="py-24 px-6 border-t border-[#ebebeb]">
      <style>{`
        .profile-card {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          transition-delay: var(--card-delay, 0ms);
        }
        .profile-card.profile-revealed {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="block text-[11px] font-semibold tracking-[0.12em] uppercase text-[#7f1d1d] mb-4">
            Your guide to Shanghai
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-black">
            Who are you going with?
          </h2>
          <p className="text-black/50 text-lg max-w-[520px] mx-auto leading-relaxed">
            Not a list of places. A way of experiencing the city — through the lens of a friend who actually knows it.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {profiles.map((profile, i) => (
            <ProfileCard key={profile.filter} profile={profile} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
