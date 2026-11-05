import SiteNav from '@/components/SiteNav';

// Every section page is dynamic (per-user Supabase data), so without this a nav
// click shows nothing until the server finishes rendering. With it, Next.js
// prefetches this shell for linked sections and swaps it in instantly on click
// while the real page streams in.
export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '1.25rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <SiteNav />
        <div aria-busy="true" aria-label="Loading" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="route-skeleton" style={{ height: '2.25rem', width: '40%' }} />
          <div className="route-skeleton" style={{ height: '7rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            <div className="route-skeleton" style={{ height: '9rem' }} />
            <div className="route-skeleton" style={{ height: '9rem' }} />
            <div className="route-skeleton" style={{ height: '9rem' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
