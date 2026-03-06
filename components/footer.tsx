'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useEffect, useState } from 'react';

type FooterLink = {
  label: string;
  href: string;
};

const FOOTER_LINKS: Record<string, FooterLink[]> = {
  Platform: [
    { label: 'Webinars', href: '/webinars' },
    { label: 'Algo Licensing', href: '/algos' },
    { label: 'University', href: '/university' },
    { label: 'Research Stream', href: '/blog' },
    { label: 'Reviews', href: '/reviews' },
  ],
  Account: [
    { label: 'User Dashboard', href: '/dashboard' },
    { label: 'Member Login', href: '/login' },
    { label: 'Request Access', href: '/signup' },
    { label: 'Account Settings', href: '/settings' },
  ],
  Legal: [
    { label: 'Terms & Conditions', href: '/legal' },
    { label: 'Privacy Policy', href: '/legal#privacy' },
    { label: 'Risk Disclosure', href: '/legal#risk' },
    { label: 'Help Centre', href: '/help' },
  ],
};

const SOCIAL = [
  { label: 'X', href: 'https://x.com', icon: 'X' },
  { label: 'LI', href: 'https://www.linkedin.com', icon: 'in' },
  { label: 'TG', href: 'https://t.me', icon: 'TG' },
  { label: 'YT', href: 'https://youtube.com', icon: 'YT' },
] as const;

function FooterComponent() {
  const pathname = usePathname();
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    const tick = () => setTimestamp(new Date().toUTCString().replace('GMT', 'UTC'));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer style={{ background: 'var(--bg-void)' }}>
      <div
        className="w-full h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--gold-dim) 20%, var(--gold-bright) 50%, var(--gold-dim) 80%, transparent 100%)',
        }}
      />

      <div className="py-12 px-6 lg:px-12" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Playfair Display', color: 'var(--text-primary)' }}>
              Intelligence Dispatch
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Weekly macro briefings for institutional allocators.
            </p>
          </div>
          <form className="flex gap-0 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-gold)' }}>
            <input
              type="email"
              placeholder="your@institution.com"
              className="px-6 py-3 bg-transparent text-sm outline-none flex-1 min-w-0"
              style={{ color: 'var(--text-primary)' }}
              aria-label="Email"
            />
            <button
              type="submit"
              className="px-6 py-3 text-xs font-bold tracking-widest uppercase"
              style={{
                background: 'linear-gradient(135deg, var(--gold-dim), var(--gold-bright))',
                color: '#0D0A00',
                whiteSpace: 'nowrap',
              }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="py-20 px-6 lg:px-12">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-16">
          <div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black mb-6"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontFamily: 'Playfair Display',
                border: '1px solid var(--border-gold)',
              }}
            >
              IFX
            </div>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 260 }}>
              Institutional capital intelligence platform providing macro research, executable strategies, and
              structured education for sophisticated investors.
            </p>

            <div className="flex gap-3">
              {SOCIAL.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-secondary)',
                  }}
                >
                  {social.icon}
                </Link>
              ))}
            </div>

            <div
              className="mt-8 p-4 rounded-xl text-xs"
              style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.15)',
                color: 'var(--text-tertiary)',
                lineHeight: 1.6,
              }}
            >
              <span style={{ color: 'var(--amber)', fontWeight: 700 }}>RISK NOTICE</span> - Trading foreign
              exchange on margin carries a high level of risk. Past performance is not indicative of future results.
              Capital at risk.
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs tracking-widest uppercase font-semibold mb-6" style={{ color: 'var(--gold-pure)' }}>
                {group}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-0 text-sm transition-all duration-200"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <span
                        className="text-xs mr-0 group-hover:mr-2 overflow-hidden transition-all duration-300"
                        style={{ color: 'var(--gold-pure)', maxWidth: 0, display: 'inline-block' }}
                      >
                        -&gt;
                      </span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 lg:px-12 py-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            (c) 2026 IFXTRADES. ALL RIGHTS RESERVED.
          </p>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--green)' }} />
            <span className="text-xs tabular-nums" style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-tertiary)' }}>
              {timestamp}
            </span>
          </div>

          <div className="flex gap-6">
            <Link href="/legal#privacy" className="text-xs tracking-wide transition-colors duration-200" style={{ color: 'var(--text-tertiary)' }}>
              PRIVACY
            </Link>
            <Link href="/legal#risk" className="text-xs tracking-wide transition-colors duration-200" style={{ color: 'var(--text-tertiary)' }}>
              RISK DISCLOSURE
            </Link>
            <Link href="/help" className="text-xs tracking-wide transition-colors duration-200" style={{ color: 'var(--text-tertiary)' }}>
              SUPPORT
            </Link>
          </div>

          <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-tertiary)' }}>
            INSTITUTIONAL CAPITAL INTELLIGENCE PLATFORM
          </span>
        </div>
      </div>
    </footer>
  );
}

export const Footer = memo(FooterComponent);
Footer.displayName = 'Footer';
