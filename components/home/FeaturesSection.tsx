'use client';

import { memo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { motion, useInView } from 'framer-motion';
import { designTokens } from '@/lib/design-tokens';

type FeatureItem = {
  icon: string;
  title: string;
  desc: string;
  stat: string;
  delay: number;
};

const FEATURES: FeatureItem[] = [
  {
    icon: 'DI',
    title: 'Institutional Flow Analysis',
    desc: 'Track real-money positions from central banks, sovereign funds, and tier-1 institutions before price discovery.',
    stat: '2.4M+ data points/day',
    delay: 0,
  },
  {
    icon: 'AL',
    title: 'Executable Algo Strategies',
    desc: 'Deploy pre-built, backtested algorithmic strategies with institutional-grade risk parameters and live execution.',
    stat: '94.2% verified accuracy',
    delay: 0.1,
  },
  {
    icon: 'MI',
    title: 'Macro Intelligence Stream',
    desc: 'Real-time synthesis of central bank policy, COT data, liquidity cycles, and cross-asset correlations.',
    stat: '24/7 live research',
    delay: 0.2,
  },
];

type CardStyle = CSSProperties & {
  '--beam-delay'?: string;
};

type CharStyle = CSSProperties & {
  '--char-delay'?: string;
};

function TiltCardComponent({ feature, index }: { feature: FeatureItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) {
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setMouse({ x, y });

    const tiltX = ((y - 50) / 50) * -10;
    const tiltY = ((x - 50) / 50) * 10;

    ref.current.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;
    ref.current.style.setProperty('--mouse-x', `${x}%`);
    ref.current.style.setProperty('--mouse-y', `${y}%`);
  };

  const onLeave = () => {
    if (!ref.current) {
      return;
    }

    ref.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
  };

  const cardStyle: CardStyle = {
    borderTop: '3px solid var(--gold-muted)',
    transition: 'transform 0.15s ease, box-shadow 0.3s ease',
    '--beam-delay': `${index * 1.3}s`,
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: feature.delay, ease: designTokens.easing.outExpo }}
      className="tilt-card beam-sweep-container glass-2 rounded-2xl p-8 cursor-default"
      style={cardStyle}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="tilt-shine" />

      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold mb-6"
        style={{
          background: 'var(--gold-glow)',
          border: '1px solid var(--border-gold)',
          color: 'var(--gold-pure)',
        }}
      >
        {feature.icon}
      </div>

      <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Playfair Display', color: 'var(--text-primary)' }}>
        {feature.title}
      </h3>
      <p className="mb-6" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        {feature.desc}
      </p>

      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
        style={{ background: 'var(--gold-glow)', border: '1px solid var(--border-gold)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold-bright)' }} />
        <span className="text-xs font-mono font-semibold tracking-wide" style={{ color: 'var(--gold-pure)' }}>
          {feature.stat}
        </span>
      </div>

      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(450px circle at ${mouse.x}% ${mouse.y}%, rgba(201,168,76,0.08), transparent 45%)`,
        }}
      />
    </motion.div>
  );
}

const TiltCard = memo(TiltCardComponent);
TiltCard.displayName = 'TiltCard';

function FeaturesSectionComponent() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-32 px-6 lg:px-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-center mb-20"
        >
          <div className="inline-block mb-4">
            {'PLATFORM CAPABILITIES'.split('').map((char, index) => {
              const charStyle: CharStyle = {
                '--char-delay': `${index * 0.03}s`,
                fontSize: 11,
                letterSpacing: '0.25em',
                color: 'var(--gold-pure)',
                fontWeight: 600,
              };

              return (
                <span key={`${char}-${index}`} className="split-char inline-block" style={charStyle}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold" style={{ fontFamily: 'Playfair Display', color: 'var(--text-primary)' }}>
            Built for capital that matters
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <TiltCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export const FeaturesSection = memo(FeaturesSectionComponent);
FeaturesSection.displayName = 'FeaturesSection';
