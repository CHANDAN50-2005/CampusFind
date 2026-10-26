import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, Bell, CheckCircle2, Database, FilePlus2, PackageCheck, Search, Sparkles } from 'lucide-react';
import { PageHeader, Panel, EmptyState } from '../components/UI.jsx';

const metrics = [
  { label: 'Lost reports', icon: Search },
  { label: 'Found reports', icon: PackageCheck },
  { label: 'Potential matches', icon: Sparkles },
  { label: 'Items returned', icon: CheckCircle2 },
];

export function DashboardPage() {
  const [health, setHealth] = useState({ state: 'loading' });
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('API returned an error');
        return response.json();
      })
      .then((data) => setHealth({ state: 'ready', database: data.database }))
      .catch((error) => {
        if (error.name !== 'AbortError') setHealth({ state: 'error' });
      });
    return () => controller.abort();
  }, []);

  return <>
    <PageHeader eyebrow="Campus overview" title="Dashboard" description="A quick view of campus reports, matches, and recoveries." action={<Link to="/report" className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-400"><FilePlus2 size={17} /> New report</Link>} />
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ label, icon: Icon }) => <Panel key={label} className="p-4"><div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-xl bg-slate-800 text-slate-300"><Icon size={17} /></span><span className="text-xs text-slate-500">Unavailable</span></div><p className="mt-5 text-2xl font-semibold text-slate-300">—</p><p className="mt-1 text-sm text-slate-400">{label}</p></Panel>)}
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
      <Panel title="Recent reports" description="Reports will appear here once item reporting is connected."><div className="p-4"><EmptyState title="No report data yet" description="The item API has not been implemented, so there are no reports to show." /></div></Panel>
      <div className="space-y-5">
        <Panel title="Service status" description="Live connection status from the API."><div className="space-y-4 p-5">
          <div className="flex items-center gap-3"><span className={`size-2.5 rounded-full ${health.state === 'ready' && health.database === 'connected' ? 'bg-emerald-400' : health.state === 'loading' ? 'bg-amber-300' : 'bg-rose-400'}`} /><div className="flex-1"><p className="text-sm font-medium text-slate-200">MongoDB</p><p className="text-xs text-slate-500">{health.state === 'loading' ? 'Checking connection…' : health.state === 'error' ? 'API unavailable' : health.database === 'connected' ? 'Connected' : 'Disconnected'}</p></div><Database size={17} className="text-slate-500" /></div>
        </div></Panel>
        <Panel title="Quick links"><div className="divide-y divide-slate-800">{[{ label: 'Browse lost items', to: '/lost', icon: Search }, { label: 'Check potential matches', to: '/matches', icon: Sparkles }, { label: 'View notifications', to: '/notifications', icon: Bell }].map(({ label, to, icon: Icon }) => <Link key={to} to={to} className="flex items-center gap-3 px-5 py-3.5 text-sm text-slate-300 transition hover:bg-slate-800/50 hover:text-white"><Icon size={17} className="text-slate-500" /><span className="flex-1">{label}</span><ArrowUpRight size={15} className="text-slate-500" /></Link>)}</div></Panel>
      </div>
    </div>
  </>;
}
