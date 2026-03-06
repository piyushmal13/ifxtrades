'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ReviewSummary } from '@/lib/data/platform';

type ReviewCardItem = {
  id: string;
  quote: string;
  author: string;
  role: string;
  initials: string;
  stars: number;
};

const DEFAULT_REVIEWS: ReviewCardItem[] = [
  {
    id: 'default-1',
    quote:
      'IFXTrades gave us the institutional edge we were missing. The flow data alone is worth 10x the subscription.',
    author: 'Marcus K.',
    role: 'Portfolio Manager, Tier-1 Family Office',
    initials: 'MK',
    stars: 5,
  },
  {
    id: 'default-2',
    quote: "The algo licensing program has transformed our desk's execution strategy. Unmatched precision.",
    author: 'Sarah L.',
    role: 'Head of FX, Prop Trading Firm',
    initials: 'SL',
    stars: 5,
  },
  {
    id: 'default-3',
    quote: 'Finally, research that reads like it was written by someone who actually trades with size.',
    author: 'Raj P.',
    role: 'Director, Asset Management',
    initials: 'RP',
    stars: 5,
  },
];

function deriveInitials(name: string) {
  const chunks = name.split(/\s+/).filter(Boolean);
  if (chunks.length === 0) {
    return 'IFX';
  }

  if (chunks.length === 1) {
    return chunks[0].slice(0, 2).toUpperCase();
  }

  return `${chunks[0][0] ?? ''}${chunks[1][0] ?? ''}`.toUpperCase();
}

function mapReviews(reviews: ReviewSummary[]): ReviewCardItem[] {
  return reviews.slice(0, 3).map((review, index) => ({
    id: review.id,
    quote: review.quote,
    author: review.companyName,
    role: review.brokerEndorsement ?? `Institutional Partner ${index + 1}`,
    initials: deriveInitials(review.companyName),
    stars: 5,
  }));
}

function ReviewsSectionComponent({ reviews }: { reviews?: ReviewSummary[] }) {
  const displayReviews = useMemo(() => {
    if (reviews && reviews.length > 0) {
      return mapReviews(reviews);
    }

    return DEFAULT_REVIEWS;
  }, [reviews]);

  return (
    <section className="py-32 px-6 lg:px-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-20">
          <p className="text-xs tracking-widest uppercase mb-4 font-semibold" style={{ color: 'var(--gold-pure)' }}>
            CLIENT TESTIMONIALS
          </p>
          <h2 className="text-4xl font-bold" style={{ fontFamily: 'Playfair Display', color: 'var(--text-primary)' }}>
            Trusted by institutional capital
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: index * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="glass-2 rounded-2xl p-8 relative"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5, type: 'spring' }}
                className="absolute -top-4 -left-2 text-6xl leading-none select-none"
                style={{ fontFamily: 'Playfair Display', color: 'var(--gold-dim)' }}
              >
                &quot;
              </motion.div>

              <div className="flex gap-1 mb-4">
                {Array.from({ length: review.stars }).map((_, starIndex) => (
                  <motion.span
                    key={`${review.id}-star-${starIndex}`}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: index * 0.1 + starIndex * 0.08 + 0.2,
                      type: 'spring',
                      stiffness: 300,
                    }}
                    style={{ color: 'var(--gold-bright)', fontSize: 16 }}
                  >
                    *
                  </motion.span>
                ))}
              </div>

              <p className="mb-6 italic" style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: 15 }}>
                {review.quote}
              </p>

              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold-dim), var(--gold-muted))',
                    color: 'var(--bg-void)',
                  }}
                >
                  {review.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {review.author}
                    </span>
                    <span className="verified-chip">VERIFIED</span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {review.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const ReviewsSection = memo(ReviewsSectionComponent);
ReviewsSection.displayName = 'ReviewsSection';
