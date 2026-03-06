'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-provider';
import { marketStatus, primaryNavLinks } from '@/lib/design-tokens';

type UtilityLink = {
  label: string;
  href: string;
  strong?: boolean;
};

function NavLinkComponent({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className="relative text-sm font-medium tracking-wide group"
      style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}
    >
      {label}
      <motion.span
        className="absolute -bottom-1 left-0 h-0.5 rounded-full"
        style={{ background: 'var(--gold-pure)' }}
        initial={{ width: active ? '100%' : '0%' }}
        animate={{ width: active ? '100%' : '0%' }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
    </Link>
  );
}

const NavLink = memo(NavLinkComponent);
NavLink.displayName = 'NavLink';

function NavbarComponent() {
  const pathname = usePathname();
  const { session, role, supabase } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      return;
    }

    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const utilityLinks = useMemo<UtilityLink[]>(() => {
    if (!session) {
      return [
        { label: 'LOGIN', href: '/login' },
        { label: 'SIGNUP', href: '/signup', strong: true },
      ];
    }

    const links: UtilityLink[] = [{ label: 'DASHBOARD', href: '/dashboard' }];

    if (role === 'admin') {
      links.push({ label: 'ADMIN', href: '/admin' });
    } else {
      links.push({ label: 'ADMIN ACCESS', href: '/admin-access' });
    }

    return links;
  }, [role, session]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      setMobileOpen(false);
      window.location.href = '/login';
    } finally {
      setSigningOut(false);
    }
  };

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        animate={{
          background: scrolled ? 'rgba(5,8,15,0.95)' : 'transparent',
          borderBottomColor: scrolled ? 'rgba(201,168,76,0.2)' : 'transparent',
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
        }}
        style={{
          backdropFilter: scrolled ? 'blur(40px) saturate(200%)' : 'none',
          boxShadow: scrolled ? '0 0 40px rgba(201,168,76,0.08), 0 4px 32px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="relative group flex items-center gap-3" aria-label="IFXTrades home">
            <span className="relative w-10 h-10">
              <span className="absolute inset-0 rounded-xl gradient-border" style={{ animation: 'border-spin 3s linear infinite' }} />
              <span
                className="relative w-full h-full rounded-xl flex items-center justify-center text-sm font-black z-10"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'Playfair Display',
                }}
              >
                IFX
              </span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {primaryNavLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} active={pathname === link.href} />
            ))}

            <Link
              href="/blog"
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300"
              style={{ border: '1px solid var(--border-gold)', background: 'var(--gold-glow)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--gold-bright)' }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--gold-pure)' }}>
                Intelligence
              </span>
            </Link>

            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: marketStatus.color }} />
              <span className="text-xs font-mono font-bold tracking-wide" style={{ color: marketStatus.color }}>
                {marketStatus.label}
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {utilityLinks.map((link) =>
              link.strong ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative group px-6 py-2.5 rounded-xl text-sm font-bold tracking-widest uppercase overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold-muted), var(--gold-bright))',
                    color: '#0D0A00',
                    letterSpacing: '0.1em',
                  }}
                >
                  <span className="relative z-10">{link.label}</span>
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                      backgroundSize: '200% auto',
                      animation: 'gold-shimmer 1.5s linear infinite',
                    }}
                  />
                </Link>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-semibold tracking-wide transition-colors duration-200"
                  style={{ color: pathname === link.href ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                  {link.label}
                </Link>
              ),
            )}

            {session && (
              <button
                type="button"
                className="text-xs font-semibold tracking-wide uppercase transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? 'SIGNING OUT' : 'SIGN OUT'}
              </button>
            )}
          </div>

          <button
            type="button"
            className="lg:hidden p-2"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span className="space-y-1.5 block">
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={`hamburger-${index}`}
                  className="h-0.5 rounded-full block"
                  style={{ background: 'var(--gold-pure)', width: index === 1 ? 20 : 28 }}
                  animate={
                    mobileOpen
                      ? {
                          rotate: index === 0 ? 45 : index === 2 ? -45 : 0,
                          y: index === 0 ? 8 : index === 2 ? -8 : 0,
                          opacity: index === 1 ? 0 : 1,
                        }
                      : { rotate: 0, y: 0, opacity: 1 }
                  }
                  transition={{ duration: 0.3 }}
                />
              ))}
            </span>
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 z-40 w-80 glass-3 flex flex-col pt-24 px-8"
          >
            {primaryNavLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.07 + 0.1 }}
              >
                <Link
                  href={link.href}
                  className="block py-4 text-xl font-semibold"
                  style={{
                    fontFamily: 'Playfair Display',
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            <div className="mt-8 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              {utilityLinks.map((link) => (
                <Link
                  key={`mobile-${link.href}`}
                  href={link.href}
                  className="block py-3 text-sm font-semibold tracking-[0.14em] uppercase"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {link.label}
                </Link>
              ))}
              {session && (
                <button
                  type="button"
                  className="py-3 text-sm font-semibold tracking-[0.14em] uppercase"
                  style={{ color: 'var(--text-secondary)' }}
                  onClick={handleSignOut}
                  disabled={signingOut}
                >
                  {signingOut ? 'SIGNING OUT' : 'SIGN OUT'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export const Navbar = memo(NavbarComponent);
Navbar.displayName = 'Navbar';
