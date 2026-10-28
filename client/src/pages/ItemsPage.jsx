import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, CalendarDays, MapPin, Package, Plus, Search } from 'lucide-react';
import { EmptyState, PageHeader } from '../components/UI.jsx';
import { ItemCard } from '../components/ItemCard.jsx';
import api from '../services/api.js';

const categories = [
  ['electronics', 'Electronics'], ['accessories', 'Accessories'], ['books', 'Books'],
  ['clothing', 'Clothing'], ['id-cards', 'ID cards'], ['keys', 'Keys'], ['bags', 'Bags'], ['other', 'Other'],
];
const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-400 disabled:opacity-60';

export function BrowsePage({ type }) {
  const [filters, setFilters] = useState({ q: '', category: '', location: '', status: 'open', dateFrom: '', dateTo: '', sort: 'recent' });
  const [result, setResult] = useState({ items: [], pagination: { page: 1, pages: 0, total: 0 } });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      api.get('/items', { params: { type, ...filters, page, limit: 12 }, signal: controller.signal })
        .then(({ data }) => setResult(data))
        .catch((requestError) => {
          if (requestError.code !== 'ERR_CANCELED') setError(requestError.response?.data?.message || 'Could not load reports.');
        })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, filters.q ? 250 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [type, filters, page]);

  function updateFilter(key, value) {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return <>
    <PageHeader eyebrow="Item directory" title={type === 'lost' ? 'Lost items' : 'Found items'} description={'Search current campus ' + type + ' reports.'} action={<Link to="/report" className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-400"><Plus size={17} /> Report an item</Link>} />
    <section className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/55 p-4" aria-label="Report filters">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="relative md:col-span-2"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" /><input className={inputClass + ' pl-10'} type="search" placeholder="Search item names or descriptions" value={filters.q} onChange={(event) => updateFilter('q', event.target.value)} aria-label="Search item reports" /></label>
        <select className={inputClass} value={filters.category} onChange={(event) => updateFilter('category', event.target.value)} aria-label="Filter by category"><option value="">All categories</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <input className={inputClass} value={filters.location} onChange={(event) => updateFilter('location', event.target.value)} placeholder="Location" aria-label="Filter by location" />
        <select className={inputClass} value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} aria-label="Filter by status"><option value="open">Open</option><option value="all">All statuses</option><option value="matched">Matched</option><option value="claimed">Claimed</option><option value="returned">Returned</option><option value="closed">Closed</option></select>
        <input type="date" className={inputClass} value={filters.dateFrom} onChange={(event) => updateFilter('dateFrom', event.target.value)} aria-label="Incident date from" />
        <input type="date" className={inputClass} value={filters.dateTo} onChange={(event) => updateFilter('dateTo', event.target.value)} aria-label="Incident date to" />
        <select className={inputClass} value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)} aria-label="Sort order"><option value="recent">Most recent</option><option value="oldest">Oldest first</option></select>
      </div>
    </section>
    {error && <p role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
    {loading ? <div className="grid min-h-52 place-items-center text-sm text-slate-500">Loading reports…</div> : result.items.length ? <>
      <p className="mb-3 text-sm text-slate-500">{result.pagination.total} report{result.pagination.total === 1 ? '' : 's'}</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{result.items.map((item) => <ItemCard key={item._id} item={item} />)}</div>
      {result.pagination.pages > 1 && <div className="mt-6 flex items-center justify-between"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 disabled:opacity-40">Previous</button><span className="text-sm text-slate-500">Page {page} of {result.pagination.pages}</span><button disabled={page >= result.pagination.pages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 disabled:opacity-40">Next</button></div>}
    </> : <EmptyState icon={Package} title="No reports found" description="Try changing your search or filters. Campus reports will appear here as students submit them." />}
  </>;
}

export function MyReportsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function refresh() {
    setLoading(true);
    api.get('/items/my').then(({ data }) => setItems(data.items)).catch((requestError) => setError(requestError.response?.data?.message || 'Could not load your reports.')).finally(() => setLoading(false));
  }
  useEffect(() => { refresh(); }, []);

  async function closeReport(id) {
    if (!window.confirm('Close this report? Pending claims will be rejected.')) return;
    try {
      await api.delete('/items/' + id);
      refresh();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not close this report.');
    }
  }

  return <>
    <PageHeader eyebrow="Your activity" title="My reports" description="Manage your lost and found reports." action={<Link to="/report" className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white">New report</Link>} />
    {error && <p role="alert" className="mb-4 text-sm text-rose-300">{error}</p>}
    {loading ? <p className="py-16 text-center text-sm text-slate-500">Loading your reports…</p> : items.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((item) => <div key={item._id}><ItemCard item={item} />{!['returned', 'closed'].includes(item.status) && <button onClick={() => closeReport(item._id)} className="mt-2 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white">Close report</button>}</div>)}</div> : <EmptyState title="You have no reports yet" description="When you report a lost or found item, you can manage it here." action={<Link to="/report" className="text-sm font-medium text-blue-300">Create your first report</Link>} />}
  </>;
}

export function ItemDetailsPage() {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimMessage, setClaimMessage] = useState('');
  const [claimState, setClaimState] = useState('');

  function refresh() {
    return api.get('/items/' + itemId).then(({ data }) => {
      setItem(data.item);
      setIsOwner(Boolean(data.isOwner));
      setEditForm({
        itemName: data.item.itemName,
        category: data.item.category,
        description: data.item.description,
        location: data.item.location,
        dateOfIncident: new Date(data.item.dateOfIncident).toISOString().slice(0, 10),
      });
    });
  }
  useEffect(() => { refresh().catch((requestError) => setError(requestError.response?.data?.message || 'Could not load this report.')).finally(() => setLoading(false)); }, [itemId]);

  async function submitClaim(event) {
    event.preventDefault();
    setClaimState('');
    try {
      await api.post('/claims', { itemId, message: claimMessage });
      setClaimState('Your claim was submitted for review.');
      setClaimMessage('');
      await refresh();
    } catch (requestError) {
      setClaimState(requestError.response?.data?.message || 'Could not submit your claim.');
    }
  }

  async function saveEdit(event) {
    event.preventDefault();
    setError('');
    try {
      const { data } = await api.patch('/items/' + itemId, editForm);
      setItem(data.item);
      setEditForm({ ...editForm, dateOfIncident: new Date(data.item.dateOfIncident).toISOString().slice(0, 10) });
      setIsEditing(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update this report.');
    }
  }

  async function closeReport() {
    if (!window.confirm('Close this report? Pending claims will be rejected.')) return;
    setError('');
    try {
      const { data } = await api.delete('/items/' + itemId);
      setItem(data.item);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not close this report.');
    }
  }

  if (loading) return <p className="py-20 text-center text-sm text-slate-500">Loading report…</p>;
  if (error && !item) return <EmptyState title="Report unavailable" description={error} />;
  if (!item) return <EmptyState title="Report unavailable" description="This report could not be found." />;

  const date = new Date(item.dateOfIncident).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  const canClaim = !isOwner && item.type === 'found' && ['open', 'matched', 'claimed'].includes(item.status);
  const categories = [['electronics', 'Electronics'], ['accessories', 'Accessories'], ['books', 'Books'], ['clothing', 'Clothing'], ['id-cards', 'ID cards'], ['keys', 'Keys'], ['bags', 'Bags'], ['other', 'Other']];
  const fieldClass = 'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100';

  return <>
    <Link to={item.type === 'lost' ? '/lost' : '/found'} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16} /> Back to {item.type} items</Link>
    {error && <p role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
    <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
      <div className="grid min-h-72 place-items-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 text-slate-600">{item.imageUrl ? <img src={item.imageUrl} alt={item.itemName} className="max-h-[520px] w-full object-contain" /> : <Package size={44} strokeWidth={1.2} />}</div>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-6">
        <div className="flex items-center justify-between"><p className="text-xs uppercase tracking-widest text-blue-300">{item.type} · {item.category}</p><span className="rounded-full bg-slate-800 px-3 py-1 text-xs capitalize text-slate-300">{item.status}</span></div>
        {!isEditing ? <>
          <h1 className="mt-3 text-2xl font-semibold">{item.itemName}</h1>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">{item.description}</p>
          <div className="mt-6 space-y-4 border-t border-slate-800 pt-5 text-sm text-slate-400"><p className="flex items-center gap-3"><MapPin size={17} /> {item.location}</p><p className="flex items-center gap-3"><CalendarDays size={17} /> {date}</p></div>
          {canClaim && <form onSubmit={submitClaim} className="mt-6 border-t border-slate-800 pt-5"><label className="block text-sm font-medium text-slate-200">Think this is yours?</label><p className="mt-1 text-xs leading-5 text-slate-500">Describe a detail that helps the report owner verify your claim. Match suggestions are not proof of ownership.</p><textarea required minLength={10} maxLength={1200} value={claimMessage} onChange={(event) => setClaimMessage(event.target.value)} className="mt-3 min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" placeholder="Share identifying information…" /><button className="mt-3 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white">Submit claim</button>{claimState && <p role="status" className="mt-3 text-sm text-blue-200">{claimState}</p>}</form>}
          {isOwner && <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800 pt-4"><button onClick={() => setIsEditing(true)} disabled={['returned', 'closed'].includes(item.status)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 disabled:opacity-40">Edit report</button>{!['returned', 'closed'].includes(item.status) && <button onClick={closeReport} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">Close report</button>}</div>}
        </> : <form onSubmit={saveEdit} className="mt-4 space-y-4">
          <label className="block text-sm text-slate-400">Item name<input required minLength={2} maxLength={120} value={editForm.itemName} onChange={(event) => setEditForm({ ...editForm, itemName: event.target.value })} className={fieldClass + ' mt-1'} /></label>
          <label className="block text-sm text-slate-400">Category<select value={editForm.category} onChange={(event) => setEditForm({ ...editForm, category: event.target.value })} className={fieldClass + ' mt-1'}>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="block text-sm text-slate-400">Description<textarea required minLength={8} maxLength={2000} value={editForm.description} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} className={fieldClass + ' mt-1 min-h-24'} /></label>
          <label className="block text-sm text-slate-400">Location<input required minLength={2} maxLength={160} value={editForm.location} onChange={(event) => setEditForm({ ...editForm, location: event.target.value })} className={fieldClass + ' mt-1'} /></label>
          <label className="block text-sm text-slate-400">Date<input type="date" required value={editForm.dateOfIncident} onChange={(event) => setEditForm({ ...editForm, dateOfIncident: event.target.value })} className={fieldClass + ' mt-1'} /></label>
          <div className="flex gap-2"><button className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white">Save changes</button><button type="button" onClick={() => setIsEditing(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300">Cancel</button></div>
        </form>}
      </section>
    </div>
  </>;
}
