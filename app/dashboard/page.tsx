import { getCurrentUser } from '@/lib/auth-helpers';
import { getUserFinance, getTotalEarned, getEarningsBreakdown, getAllEarningsSeries } from '@/lib/finance';
import NetWorthDashboard from '@/components/NetWorthDashboard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0d1117',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '12px',
            padding: '2.5rem',
            textAlign: 'center',
            maxWidth: '360px',
          }}
        >
          <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>💰</div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>
            Log in to see your Net Worth dashboard
          </h1>
          <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: '8px' }}>
            Your earnings are tracked per account.
          </p>
          <a
            href="/login"
            style={{
              display: 'inline-block', marginTop: '1.25rem', padding: '0.5rem 1.25rem',
              borderRadius: '8px', background: '#238636', color: '#fff',
              fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
            }}
          >
            Log in
          </a>
        </div>
      </div>
    );
  }

  const [finance, totalEarned, earnings, series] = await Promise.all([
    getUserFinance(user.id),
    getTotalEarned(user.id),
    getEarningsBreakdown(user.id),
    getAllEarningsSeries(user.id),
  ]);

  return <NetWorthDashboard finance={finance} totalEarned={totalEarned} earnings={earnings} series={series} />;
}
