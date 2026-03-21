'use client';

import Link from 'next/link';
import { memo, useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { designTokens } from '@/lib/design-tokens';
import { TradingRobot3D } from '@/components/home/TradingRobot3D';

const TICKER_PAIRS = [
  { pair: 'EUR/USD', price: '1.08432', change: '+0.12%', up: true },
  { pair: 'GBP/USD', price: '1.26789', change: '-0.08%', up: false },
  { pair: 'USD/JPY', price: '149.234', change: '+0.31%', up: true },
  { pair: 'XAU/USD', price: '2,034.50', change: '+0.54%', up: true },
  { pair: 'BTC/USD', price: '67,234', change: '-1.23%', up: false },
  { pair: 'USD/CHF', price: '0.88912', change: '+0.07%', up: true },
  { pair: 'AUD/USD', price: '0.65234', change: '-0.19%', up: false },
  { pair: 'NZD/USD', price: '0.60123', change: '+0.22%', up: true },
  { pair: 'USD/CAD', price: '1.35678', change: '-0.05%', up: false },
  { pair: 'EUR/GBP', price: '0.85432', change: '+0.03%', up: true },
] as const;

const HUD_STATS = [
  { label: 'ACTIVE SIGNALS', value: '247', unit: 'LIVE', color: '#22C55E' },
  { label: 'ACCURACY RATE', value: '94.2', unit: '%', color: '#C9A84C' },
  { label: 'CAPITAL TRACKED', value: '$847M', unit: 'AUM', color: '#3B82F6' },
  { label: 'MEMBER SESSIONS', value: '1,204', unit: 'TODAY', color: '#C9A84C' },
] as const;

const HEADLINE = [
  { text: 'Precision', style: 'white' },
  { text: 'forex', style: 'white' },
  { text: 'intelligence', style: 'gold-italic' },
  { text: 'built', style: 'gold-italic' },
  { text: 'for', style: 'white' },
  { text: 'institutional', style: 'white' },
  { text: 'flow.', style: 'white' },
] as const;

function HeroSectionComponent() {
  const containerRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [time, setTime] = useState('');

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC',
    });

    const tick = () => setTime(formatter.format(new Date()));

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 100;
      const y = (event.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, -80]);

  const goldOrbStyle: CSSProperties = {
    width: 700,
    height: 700,
    top: '-10%',
    left: `${20 + mousePos.x * 0.05}%`,
    transform: `translate(-50%, 0) translateY(${mousePos.y * 0.08}px)`,
    transition: 'left 1.5s ease, transform 1.5s ease',
  };

  const blueOrbStyle: CSSProperties = {
    width: 500,
    height: 500,
    bottom: '5%',
    right: '15%',
    transform: `translateY(${-mousePos.y * 0.05}px)`,
    transition: 'transform 2s ease',
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col overflow-hidden terminal-grid"
      style={{ background: 'var(--bg-void)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '128px',
        }}
      />

      <div className="glow-orb glow-orb-gold" style={goldOrbStyle} />
      <div className="glow-orb glow-orb-blue" style={blueOrbStyle} />

      <div
        className="relative z-10 w-full py-2 border-b scanlines"
        style={{ borderColor: 'var(--border-gold)', background: 'rgba(8,12,20,0.95)' }}
      >
        <div className="marquee-wrap">
          <div className="marquee-track">
            {[...TICKER_PAIRS, ...TICKER_PAIRS].map((item, index) => (
              <div key={`${item.pair}-${index}`} className="flex items-center gap-4 px-8 whitespace-nowrap">
                <span className="font-mono text-xs tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                  {item.pair}
                </span>
                <span className="font-mono text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                  {item.price}
                </span>
                <span className="font-mono text-xs font-semibold" style={{ color: item.up ? 'var(--green)' : 'var(--red)' }}>
                  {item.up ? 'UP' : 'DOWN'} {item.change}
                </span>
                <span style={{ color: 'var(--border-gold)', fontSize: 10 }}>*</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.div className="relative z-10 flex-1 flex items-center" style={{ opacity: heroOpacity, y: heroY }}>
        <div className="max-w-[1280px] mx-auto w-full px-6 lg:px-12 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full glass-2"
                style={{ border: '1px solid var(--border-gold)' }}
              >
                <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" />
                <span className="text-xs tracking-[0.2em] uppercase font-semibold" style={{ color: 'var(--gold-pure)' }}>
                  Institutional Capital Intelligence
                </span>
              </motion.div>

              <h1 className="mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                {HEADLINE.map((word, index) => (
                  <motion.span
                    key={`${word.text}-${index}`}
                    initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      duration: 0.7,
                      delay: 0.4 + index * 0.1,
                      ease: designTokens.easing.outExpo,
                    }}
                    className="inline-block mr-[0.2em]"
                    style={{
                      fontSize: 'clamp(44px, 6vw, 80px)',
                      lineHeight: 1.1,
                      fontWeight: word.style === 'gold-italic' ? 600 : 700,
                      fontStyle: word.style === 'gold-italic' ? 'italic' : 'normal',
                      color: word.style === 'gold-italic' ? 'var(--gold-pure)' : 'var(--text-primary)',
                    }}
                  >
                    {word.text}
                  </motion.span>
                ))}
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="mb-10 max-w-md"
                style={{
                  fontSize: 18,
                  lineHeight: 1.75,
                  color: 'var(--text-secondary)',
                  fontWeight: 400,
                }}
              >
                Macro research, executable strategies, and real-time institutional flow data structured for
                sophisticated capital allocators.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href="/signup"
                  className="btn-pulse relative group px-8 py-4 rounded-xl font-semibold tracking-widest uppercase text-sm overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold-muted), var(--gold-bright), var(--gold-pure))',
                    color: '#0D0A00',
                    letterSpacing: '0.12em',
                  }}
                >
                  <span className="relative z-10">Request Access</span>
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                      backgroundSize: '200% auto',
                      animation: 'gold-shimmer 1.5s linear infinite',
                    }}
                  />
                </Link>

                <Link
                  href="/blog"
                  className="px-8 py-4 rounded-xl font-semibold tracking-widest uppercase text-sm transition-all duration-300"
                  style={{
                    border: '1px solid var(--border-gold)',
                    color: 'var(--gold-pure)',
                    background: 'transparent',
                    letterSpacing: '0.12em',
                  }}
                >
                  View Intelligence -&gt;
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.6, ease: designTokens.easing.outExpo }}
              className="flex flex-col gap-4"
            >
              {/* 3D Trading Robot */}
              <div className="relative w-full h-[340px]">
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)" }} />
                <TradingRobot3D className="w-full h-full" />
              </div>

              {/* Terminal Stats Box */}
              <div className="terminal-box p-6 scanlines">
              <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-gold)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
                  <div className="w-3 h-3 rounded-full" style={{ background: 'var(--green)' }} />
                </div>
                <span className="text-xs tracking-widest uppercase" style={{ fontFamily: 'JetBrains Mono', color: 'var(--gold-muted)' }}>
                  IFX_TERMINAL v3.0
                </span>
                <span className="text-xs tabular-nums" style={{ fontFamily: 'JetBrains Mono', color: 'var(--green)' }}>
                  {time} UTC
                </span>
              </div>

              <div className="space-y-4">
                {HUD_STATS.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.12, duration: 0.5 }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs tracking-widest uppercase" style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-tertiary)' }}>
                      {stat.label}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tabular-nums" style={{ fontFamily: 'JetBrains Mono', color: stat.color }}>
                        {stat.value}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {stat.unit}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <div className="flex items-end gap-1 h-12">
                  {[40, 65, 55, 80, 70, 90, 75, 95, 85, 92, 78, 94].map((height, index) => (
                    <motion.div
                      key={`bar-${index}`}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 1.2 + index * 0.05, duration: 0.4, ease: designTokens.easing.outExpo }}
                      style={{
                        flex: 1,
                        height: `${height}%`,
                        background:
                          index === 11 ? 'var(--gold-bright)' : `rgba(201,168,76,${0.2 + height / 250})`,
                        borderRadius: '2px 2px 0 0',
                        transformOrigin: 'bottom',
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-tertiary)' }}>12H AGO</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-tertiary)' }}>NOW</span>
                </div>
              </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export const HeroSection = memo(HeroSectionComponent);
HeroSection.displayName = 'HeroSection';
