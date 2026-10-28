import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Bell, Check, CheckCheck, Circle, ExternalLink, Sparkles } from 'lucide-react';
import { EmptyState, PageHeader } from '../components/UI.jsx';
import api from '../services/api.js';

function MatchRow({ match, onStatus }) {
  const lost = match.lostItemId;
  const found = match.foundItemId;
  return <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><span className="rounded-full bg-blue-400/10 px-2.5 py-1 text-xs font-semibold text-blue-200">{match.score}% similarity</span><span className="text-xs capitalize text-slate-500">{match.status}</span></div><p className="mt-3 text-sm text-slate-300"><span className="text-slate-500">Lost:</span> {lost?.itemName || 'Unavailable'} <span className="mx-1 text-slate-600">↔</span> <span className="text-slate-500">Found:</span> {found?.itemName || 'Unavailable'}</p></div><Sparkles size={19} className="text-cyan-300" /></div>
    <div className="mt-4 flex flex-wrap gap-2">{match.matchingReasons.map((reason) => <span key={reason} className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-slate-400">{reason}</span>)}</div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4"><div className="flex gap-4 text-sm">{lost && <Link className="inline-flex items-center gap-1.5 text-blue-300 hover:text-blue-200" to={'/items/' + lost._id}>Lost report <ExternalLink size={14} /></Link>}{found && <Link className="inline-flex items-center gap-1.5 text-blue-300 hover:text-blue-200" to={'/items/' + found._id}>Found report <ExternalLink size={14} /></Link>}</div>{match.status !== 'resolved' && <div className="flex gap-2"><button onClick={() => onStatus(match._id, 'dismissed')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800">Dismiss</button><button onClick={() => onStatus(match._id, 'confirmed')} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-400"><Check size={14} /> Confirm possible match</button></div>}</div>
    <p className="mt-3 text-xs text-slate-600">A similarity suggestion is not proof of ownership.</p>
  </article>;
}

export function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function refresh() {
    api.get('/matches').then(({ data }) => setMatches(data.matches)).catch((requestError) => setError(requestError.response?.data?.message || 'Could not load matches.')).finally(() => setLoading(false));
  }
  useEffect(() => { refresh(); }, []);

  async function changeStatus(id, status) {
    setError('');
    try {
      await api.patch('/matches/' + id + '/status', { status });
      refresh();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update this match.');
    }
  }

  return <>
    <PageHeader eyebrow="Suggestions" title="Potential matches" description="Compare open lost and found reports. Similarity helps prioritize a review; students still verify ownership." />
    {error && <p role="alert" className="mb-4 text-sm text-rose-300">{error}</p>}
    {loading ? <p className="py-16 text-center text-sm text-slate-500">Looking for possible matches…</p> : matches.length ? <div className="space-y-4">{matches.map((match) => <MatchRow key={match._id} match={match} onStatus={changeStatus} />)}</div> : <EmptyState icon={CheckCheck} title="No potential matches yet" description="Suggestions will appear when a lost report resembles an open found report." />}
  </>;
}

export function ClaimsPage() {
  const [claims, setClaims] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function refresh() {
    api.get('/claims/my').then(({ data }) => setClaims(data)).catch((requestError) => setError(requestError.response?.data?.message || 'Could not load claims.')).finally(() => setLoading(false));
  }
  useEffect(() => { refresh(); }, []);

  async function review(id, status) {
    setError('');
    try {
      await api.patch('/claims/' + id + '/status', { status });
      refresh();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not review this claim.');
    }
  }

  function ClaimCard({ claim, received }) {
    const item = claim.itemId;
    return <article className="rounded-xl border border-slate-800 bg-slate-900/55 p-4">
      <div className="flex items-start justify-between gap-3"><div><p className="font-medium text-slate-200">{item?.itemName || 'Report unavailable'}</p><p className="mt-1 text-xs capitalize text-slate-500">{item?.type} item · {claim.status}</p></div><span className={'rounded-full px-2.5 py-1 text-xs capitalize ' + (claim.status === 'approved' ? 'bg-emerald-400/10 text-emerald-300' : claim.status === 'rejected' ? 'bg-rose-400/10 text-rose-300' : 'bg-amber-300/10 text-amber-200')}>{claim.status}</span></div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">{claim.message}</p>
      {received && claim.claimantId && <p className="mt-3 text-xs text-slate-500">Claimant: {claim.claimantId.name} · {claim.claimantId.email}</p>}
      {item?._id && <Link to={'/items/' + item._id} className="mt-3 inline-block text-xs text-blue-300 hover:text-blue-200">Open report</Link>}
      {received && claim.status === 'pending' && <div className="mt-4 flex gap-2 border-t border-slate-800 pt-3"><button onClick={() => review(claim._id, 'approved')} className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-medium text-emerald-200 hover:bg-emerald-500/25">Approve and mark returned</button><button onClick={() => review(claim._id, 'rejected')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800">Reject</button></div>}
    </article>;
  }

  return <>
    <PageHeader eyebrow="Ownership workflow" title="Claims" description="Review claims on your reports and track claims you have submitted." />
    {error && <p role="alert" className="mb-4 text-sm text-rose-300">{error}</p>}
    {loading ? <p className="py-16 text-center text-sm text-slate-500">Loading claims…</p> : <div className="grid gap-5 xl:grid-cols-2">
      <section className="space-y-3"><h2 className="font-medium text-slate-200">Claims on your reports <span className="text-sm text-slate-500">({claims.received.length})</span></h2>{claims.received.length ? claims.received.map((claim) => <ClaimCard key={claim._id} claim={claim} received />) : <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500">No incoming claims</div>}</section>
      <section className="space-y-3"><h2 className="font-medium text-slate-200">Claims you submitted <span className="text-sm text-slate-500">({claims.sent.length})</span></h2>{claims.sent.length ? claims.sent.map((claim) => <ClaimCard key={claim._id} claim={claim} />) : <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500">No claims submitted</div>}</section>
    </div>}
  </>;
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function refresh() {
    api.get('/notifications').then(({ data }) => { setNotifications(data.notifications); setUnread(data.unread); }).catch((requestError) => setError(requestError.response?.data?.message || 'Could not load notifications.')).finally(() => setLoading(false));
  }
  useEffect(() => { refresh(); }, []);

  async function markRead(notification) {
    if (notification.isRead) return;
    try {
      await api.patch('/notifications/' + notification._id + '/read');
      setNotifications((current) => current.map((entry) => entry._id === notification._id ? { ...entry, isRead: true } : entry));
      setUnread((count) => Math.max(0, count - 1));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update notification.');
    }
  }

  return <>
    <PageHeader eyebrow="Updates" title="Notifications" description={unread ? unread + ' unread update' + (unread === 1 ? '' : 's') : 'Your report and claim activity.'} />
    {error && <p role="alert" className="mb-4 text-sm text-rose-300">{error}</p>}
    {loading ? <p className="py-16 text-center text-sm text-slate-500">Loading notifications…</p> : notifications.length ? <div className="space-y-2">{notifications.map((notification) => <article key={notification._id} className={'flex items-start gap-4 rounded-xl border p-4 ' + (notification.isRead ? 'border-slate-800 bg-slate-900/40' : 'border-blue-400/20 bg-blue-400/[0.05]')}><Circle size={15} className={'mt-1 shrink-0 ' + (notification.isRead ? 'text-slate-600' : 'fill-blue-400 text-blue-400')} /><div className="min-w-0 flex-1"><p className="text-sm text-slate-200">{notification.message}</p><p className="mt-1 text-xs capitalize text-slate-500">{notification.type} · {new Date(notification.createdAt).toLocaleString()}</p>{notification.relatedItemId && <Link to={'/items/' + notification.relatedItemId} className="mt-2 inline-flex items-center gap-1 text-xs text-blue-300">Open related report <ExternalLink size={13} /></Link>}</div>{!notification.isRead && <button onClick={() => markRead(notification)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Mark as read"><Check size={16} /></button>}</article>)}</div> : <EmptyState icon={Bell} title="You are all caught up" description="Updates about possible matches, claims, and recoveries will show here." />}
  </>;
}
