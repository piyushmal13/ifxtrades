'use client';

import Link from 'next/link';
import { memo, useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
};

const PARTICLE_COUNT = 80;
const CONNECT_DISTANCE = 100;

function createParticles(width: number, height: number): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 2 + 0.5,
    alpha: Math.random() * 0.5 + 0.2,
  }));
}

function FinalCTASectionComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    let animationId = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      particles = createParticles(width, height);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) {
          particle.x = width;
        } else if (particle.x > width) {
          particle.x = 0;
        }

        if (particle.y < 0) {
          particle.y = height;
        } else if (particle.y > height) {
          particle.y = 0;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${particle.alpha})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance < CONNECT_DISTANCE) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(201,168,76,${0.15 * (1 - distance / CONNECT_DISTANCE)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      animationId = window.requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section className="relative py-40 px-6 overflow-hidden" style={{ background: 'var(--bg-void)' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.6 }} />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <p className="text-xs tracking-widest uppercase mb-6 font-semibold" style={{ color: 'var(--gold-pure)' }}>
          JOIN THE INTELLIGENCE NETWORK
        </p>

        <h2
          className="mb-6"
          style={{
            fontFamily: 'Playfair Display',
            fontSize: 'clamp(36px, 5vw, 64px)',
            lineHeight: 1.15,
            background:
              'linear-gradient(135deg, var(--text-primary) 0%, var(--gold-bright) 50%, var(--text-primary) 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gold-shimmer 5s linear infinite',
          }}
        >
          Integrate intelligence into your existing capital processes.
        </h2>

        <p className="mb-12 text-lg" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Request structured access, review sample documentation, and evaluate governance before any capital is deployed.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/signup"
            className="btn-pulse px-10 py-5 rounded-xl font-bold tracking-widest uppercase text-sm relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--gold-dim), var(--gold-bright))',
              color: '#0D0A00',
              letterSpacing: '0.15em',
            }}
          >
            Request Access
          </Link>
          <Link
            href="/login"
            className="px-10 py-5 rounded-xl font-semibold tracking-widest uppercase text-sm"
            style={{
              border: '1px solid var(--border-gold)',
              color: 'var(--gold-pure)',
              letterSpacing: '0.12em',
            }}
          >
            Existing Members -&gt;
          </Link>
        </div>
      </div>
    </section>
  );
}

export const FinalCTASection = memo(FinalCTASectionComponent);
FinalCTASection.displayName = 'FinalCTASection';
