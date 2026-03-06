'use client';

import { memo } from 'react';
import type { ReviewSummary } from '@/lib/data/platform';
import { HeroSection } from '@/components/home/HeroSection';
import { TrustBar } from '@/components/home/TrustBar';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { StatsSection } from '@/components/home/StatsSection';
import { ReviewsSection } from '@/components/home/ReviewsSection';
import { FinalCTASection } from '@/components/home/FinalCTASection';

type HomePageClientProps = {
  reviews: ReviewSummary[];
};

function HomePageClientComponent({ reviews }: HomePageClientProps) {
  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: 'var(--bg-void)', color: 'var(--text-primary)' }}>
      <HeroSection />
      <TrustBar />
      <FeaturesSection />
      <StatsSection />
      <ReviewsSection reviews={reviews} />
      <FinalCTASection />
    </main>
  );
}

const HomePageClient = memo(HomePageClientComponent);
HomePageClient.displayName = 'HomePageClient';

export default HomePageClient;
