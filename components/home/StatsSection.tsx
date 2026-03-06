'use client';

import { memo, useRef, type CSSProperties } from 'react';
import { motion, useInView } from 'framer-motion';

type StatItem = {
  label: string;
  value: number;
  suffix: string;
  progress: number;
  color: string;
  prefix?: string;
};

const STATS: StatItem[] = [
  { label: 'MEMBER INSTITUTIONS', value: 2400, suffix: '+', progress: 85, color: 'var(--gold-pure)' },
  { label: 'CAPITAL TRACKED', value: 847, prefix: '$', suffix: 'M+', progress: 78, color: '#3B82F6' },
  { label: 'VERIFIED ACCURACY', value: 94.2, suffix: '%', progress: 94, color: '#22C55E' },
  { label: 'ALGO STRATEGIES LIVE', value: 38, suffix: '', progress: 62, color: 'var(--gold-pure)' },
];

type ProgressStyle = CSSProperties & {
  '--progress-target'?: string;
  '--progress-delay'?: string;
};

function StatsSectionComponent() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-24 px-6 lg:px-12" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="terminal-box p-8 scanlines">
          <div className="flex items-center gap-3 mb-8 pb-6" style={{ borderBottom: '1px solid var(--border-gold)' }}>
            <div className="flex gap-1.5">
              {['#EF4444', '#F59E0B', '#22C55E'].map((color) => (
                <div key={color} className="w-3 h-3 rounded-full" style={{ background: color, opacity: 0.8 }} />
              ))}
            </div>
            <span className="text-xs tracking-widest uppercase" style={{ fontFamily: 'JetBrains Mono', color: 'var(--gold-muted)' }}>
              SYSTEM METRICS - LIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {STATS.map((stat, index) => {
              const progressStyle: ProgressStyle = {
                background: stat.color,
                '--progress-target': `${stat.progress}%`,
                '--progress-delay': `${0.3 + index * 0.15}s`,
                boxShadow: `0 0 12px ${stat.color}60`,
              };

              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.12, duration: 0.6 }}
                >
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-xs tracking-widest uppercase" style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-tertiary)' }}>
                      {stat.label}
                    </span>
                    <span className="text-3xl font-bold tabular-nums" style={{ fontFamily: 'JetBrains Mono', color: stat.color }}>
                      {stat.prefix ?? ''}
                      {inView ? stat.value.toLocaleString() : 0}
                      {stat.suffix}
                    </span>
                  </div>

                  <div className="h-1 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="h-full rounded-full progress-bar-fill" style={progressStyle} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export const StatsSection = memo(StatsSectionComponent);
StatsSection.displayName = 'StatsSection';
