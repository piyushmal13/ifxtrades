'use client';

import { memo } from 'react';

const TRUST_ITEMS = [
  { icon: 'SEC', label: '256-BIT SSL' },
  { icon: 'ISO', label: 'ISO 27001' },
  { icon: 'KYC', label: 'KYC/AML COMPLIANT' },
  { icon: 'LOG', label: 'AUDIT LOGS' },
  { icon: 'GDPR', label: 'GDPR COMPLIANT' },
  { icon: 'SOC2', label: 'SOC 2 TYPE II' },
] as const;

const STATUS = { label: 'ALL SYSTEMS OPERATIONAL', color: '#22C55E' } as const;

function TrustBarComponent() {
  return (
    <div
      className="relative py-4 border-y"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}
    >
      <div className="marquee-wrap">
        <div className="marquee-track" style={{ animationDuration: '25s' }}>
          {[...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS].map((item, index) => (
            <div key={`${item.label}-${index}`} className="flex items-center gap-3 px-12 whitespace-nowrap">
              <span className="text-[10px] font-mono font-semibold" style={{ color: 'var(--gold-pure)' }}>
                {item.icon}
              </span>
              <span className="text-xs tracking-[0.2em] font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>
                {item.label}
              </span>
              <span style={{ color: 'var(--border-gold)', fontSize: 8 }}>*</span>
            </div>
          ))}
          <div className="flex items-center gap-2 px-12 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: STATUS.color }} />
            <span className="text-xs tracking-[0.15em] font-bold uppercase" style={{ color: STATUS.color }}>
              {STATUS.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const TrustBar = memo(TrustBarComponent);
TrustBar.displayName = 'TrustBar';
