import { useEffect, useState } from 'react';
import { PageHeader, EmptyState } from '../components/UI.jsx';
import api from '../services/api.js';

const statuses = ['open', 'matched', 'claimed', 'returned', 'closed'];

export function AdminPage() {
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function refresh() {
    setLoading(true);
    Promise.all([
      api.get('/admin/items'),
      api.get('/admin/claims'),
      api.get('/admin/query-plans'),
      api.get('/dashboard/stats'),
    ])
      .then(([itemResponse, claimResponse, plansResponse, statsResponse]) => {
        setItems(itemResponse.data.items);
        setClaims(claimResponse.data.claims);
        setPlans(plansResponse.data.queries);
        setStats(statsResponse.data);
      })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Could not load administrative data.'))
      .finally(() => setLoading(false));
  }
  useEffect(() => { refresh(); }, []);

  async function setStatus(itemId, status) {
    setError('');
    try {
      await api.patch('/admin/items/' + itemId + '/status', { status });
      refresh();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update this report.');
    }
  }

  async function reviewClaim(claimId, status) {
    setError('');
    try {
      await api.patch('/claims/' + claimId + '/status', { status });
      refresh();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not review this claim.');
    }
  }

  if (loading) return <p className="py-16 text-center text-sm text-slate-500">Loading administrative data…</p>;
  return <>
    <PageHeader eyebrow="Administration" title="Admin dashboard" description="Moderate reports and review claims. Every action is checked by the server." />
    {error && <p role="alert" className="mb-4 text-sm text-rose-300">{error}</p>}
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[['All reports', stats?.totals.total], ['Open reports', stats?.totals.open], ['Potential matches', stats?.totals.matches], ['Pending claims', stats?.totals.pendingClaims]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"><p className="text-2xl font-semibold">{value ?? '—'}</p><p className="mt-1 text-sm text-slate-400">{label}</p></div>)}
    </div>
    <section className="mb-7 rounded-2xl border border-slate-800 bg-slate-900/45 p-4">
      <h2 className="mb-3 font-medium text-slate-200">Report moderation</h2>
      {items.length ? <div className="space-y-2">{items.map((item) => <article key={item._id} className="flex flex-col justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4 sm:flex-row sm:items-center"><div className="min-w-0"><p className="truncate font-medium text-slate-200">{item.itemName} <span className="ml-1 text-xs font-normal capitalize text-slate-500">({item.type})</span></p><p className="mt-1 truncate text-xs text-slate-500">{item.location} · {item.userId?.name} · {item.userId?.email}</p></div><select aria-label={'Moderate status for ' + item.itemName} value={item.status} onChange={(event) => setStatus(item._id, event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm capitalize text-slate-200">{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></article>)}</div> : <EmptyState title="No reports to moderate" description="Student reports will appear here." />}
    </section>
    <section className="mb-7 rounded-2xl border border-slate-800 bg-slate-900/45 p-4">
      <h2 className="mb-3 font-medium text-slate-200">Claims</h2>
      {claims.length ? <div className="space-y-2">{claims.map((claim) => <article key={claim._id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"><div className="flex flex-wrap justify-between gap-2"><p className="text-sm font-medium text-slate-200">{claim.itemId?.itemName || 'Report unavailable'} · {claim.claimantId?.name || 'Student'}</p><span className="text-xs capitalize text-slate-400">{claim.status}</span></div><p className="mt-2 text-sm text-slate-400">{claim.message}</p><p className="mt-2 text-xs text-slate-600">{claim.claimantId?.email}</p>{claim.status === 'pending' && <div className="mt-3 flex gap-2"><button onClick={() => reviewClaim(claim._id, 'approved')} className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-medium text-emerald-200 hover:bg-emerald-500/25">Approve and mark returned</button><button onClick={() => reviewClaim(claim._id, 'rejected')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800">Reject</button></div>}</article>)}</div> : <EmptyState title="No claims to review" description="Claims submitted by students will appear here." />}
    </section>
    <section className="rounded-2xl border border-slate-800 bg-slate-900/45 p-4">
      <h2 className="mb-1 font-medium text-slate-200">MongoDB query plans</h2><p className="mb-4 text-xs text-slate-500">Execution statistics from explain() for common indexed queries.</p>
      {plans && <div className="grid gap-3 sm:grid-cols-3">{Object.entries(plans).map(([name, plan]) => <div key={name} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3"><p className="text-xs font-medium text-slate-300">{name.replace(/[A-Z]/g, (letter) => ' ' + letter).trim()}</p><p className="mt-2 text-xs text-slate-500">Stage: {plan.stages.join(', ') || 'none'}</p><p className="mt-1 text-xs text-slate-500">Docs examined: {plan.documentsExamined} · Keys: {plan.keysExamined}</p></div>)}</div>}
    </section>
  </>;
}
