'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const SECTIONS = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/journal', icon: '📓', label: 'Journal' },
  { href: '/goals', icon: '🎯', label: 'Goals' },
  { href: '/', icon: '🧩', label: 'DSA Problems' },
  { href: '/theory', icon: '📖', label: 'Theory Q&A' },
  { href: '/roadmap', icon: '💸', label: 'Salary Roadmap' },
  { href: '/revision', icon: '🔁', label: 'Revision' },
  { href: '/net-worth', icon: '💰', label: 'Net Worth' },
] as const;

// One nav for every page so sections are always in the same order and the
// current one is highlighted. `sidebar` stacks vertically for the problem /
// theory sidebars; `bar` is a wrapping row for the centred pages.
export default function SiteNav({ variant = 'bar' }: { variant?: 'bar' | 'sidebar' }) {
  const pathname = usePathname();
  const vertical = variant === 'sidebar';

  return (
    <nav
      aria-label="Sections"
      style={{
        display: 'flex', flexDirection: vertical ? 'column' : 'row', flexWrap: vertical ? 'nowrap' : 'wrap',
        gap: vertical ? '2px' : '4px',
      }}
    >
      {SECTIONS.map((s) => {
        const active = pathname === s.href;
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={active ? 'page' : undefined}
            className="site-nav-link"
            style={{
              display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none',
              fontSize: vertical ? '0.8rem' : '0.78rem', padding: vertical ? '5px 9px' : '4px 10px',
              borderRadius: vertical ? '6px' : '999px',
              border: vertical ? 'none' : `1px solid ${active ? 'rgba(88,166,255,0.45)' : '#30363d'}`,
              background: active ? 'rgba(88,166,255,0.1)' : 'transparent',
              color: active ? '#58a6ff' : '#8b949e',
              fontWeight: active ? 600 : 400,
            }}
          >
            <span aria-hidden>{s.icon}</span>
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
