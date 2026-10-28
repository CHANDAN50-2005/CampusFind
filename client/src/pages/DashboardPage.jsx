import { Link } from 'react-router';
import { ArrowUpRight, Bell, CheckCircle2, Database, FilePlus2, PackageCheck, Search, Sparkles } from 'lucide-react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { PageHeader, Panel, EmptyState } from '../components/UI.jsx';
import { ItemCard } from '../components/ItemCard.jsx';
import api from '../services/api.js';

const DashboardCharts = lazy(() => import('./DashboardCharts.jsx').then((module) => ({ default: module.DashboardCharts })));

const metrics = [
  ['lost', 'Lost reports', Search],
  ['found', 'Found reports', PackageCheck],
  ['matches', 'Potential matches', Sparkles],
  ['returned', 'Items returned', CheckCircle2],
];
const chartColors = ['#60a5fa', '#22d3ee', '#34d399', '#fbbf24', '#a78bfa', '#fb7185', '#94a3b8'];

function monthLabel(value) {
  const [year, month] = value.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'short' });
}

export function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      api.get('/dashboard/stats', { signal: controller.signal }),
      api.get('/health', { signal: controller.signal }),
    ]).then(([statsResponse, healthResponse]) => {
      setStats(statsResponse.data);
      setHealth(healthResponse.data.database);
    }).catch((requestError) => {
      if (requestError.code !== 'ERR_CANCELED') {
        setError(requestError.response?.data?.message || 'Could not load dashboard data.');
        setHealth('unavailable');
      }
    });
    return () => controller.abort();
  }, []);

  const totals = stats?.totals;
  return <>
    <PageHeader eyebrow="Campus overview" title="Dashboard" description="Current reports, possible matches, and recoveries across campus." action={<Link to="/report" className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-400"><FilePlus2 size={17} /> New report</Link>} />
    {error && <p role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(([key, label, Icon]) => <Panel key={key} className="p-4"><div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-xl bg-slate-800 text-slate-300"><Icon size={17} /></span><span className="text-xs text-slate-500">Live</span></div><p className="mt-5 text-2xl font-semibold text-white">{totals ? totals[key] : '—'}</p><p className="mt-1 text-sm text-slate-400">{label}</p></Panel>)}
    </div>
    <Suspense fallback={<div className="mb-6 grid h-72 place-items-center rounded-2xl border border-slate-800 text-sm text-slate-500">Loading charts…</div>}>
      <DashboardCharts monthly={stats?.monthly || []} categories={stats?.categories || []} />
    </Suspense>
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <Panel title="Recent reports" description="Latest reports submitted by students.">
        <div className="p-4">{stats?.recentReports.length ? <div className="grid gap-4 sm:grid-cols-2">{stats.recentReports.slice(0, 4).map((item) => <ItemCard key={item._id} item={item} />)}</div> : <EmptyState title="No reports yet" description="New campus lost and found reports will appear here." action={<Link to="/report" className="text-sm font-medium text-blue-300">Create a report</Link>} />}</div>
      </Panel>
      <div className="space-y-5">
        <Panel title="Service status" description="Live API and database connection."><div className="flex items-center gap-3 p-5"><span className={'size-2.5 rounded-full ' + (health === 'connected' ? 'bg-emerald-400' : health === 'loading' ? 'bg-amber-300' : 'bg-rose-400')} /><div className="flex-1"><p className="text-sm font-medium text-slate-200">MongoDB</p><p className="text-xs capitalize text-slate-500">{health}</p></div><Database size={17} className="text-slate-500" /></div></Panel>
        <Panel title="Quick links"><div className="divide-y divide-slate-800">{[{ label: 'Browse lost items', to: '/lost', icon: Search }, { label: 'Review potential matches', to: '/matches', icon: Sparkles }, { label: 'View notifications', to: '/notifications', icon: Bell }].map(({ label, to, icon: Icon }) => <Link key={to} to={to} className="flex items-center gap-3 px-5 py-3.5 text-sm text-slate-300 transition hover:bg-slate-800/50 hover:text-white"><Icon size={17} className="text-slate-500" /><span className="flex-1">{label}</span><ArrowUpRight size={15} className="text-slate-500" /></Link>)}</div></Panel>
      </div>
    </div>
  </>;
}
