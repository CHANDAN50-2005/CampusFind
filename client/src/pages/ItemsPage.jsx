import { Link, useParams } from 'react-router';
import { ArrowLeft, CalendarDays, MapPin, Package, Plus } from 'lucide-react';
import { EmptyState, FormField, PageHeader, SearchField } from '../components/UI.jsx';

export function BrowsePage({ type }) {
  const title = type === 'lost' ? 'Lost items' : 'Found items';
  return <>
    <PageHeader eyebrow="Item directory" title={title} description={`Search campus ${type} reports. Listings will show here when the item API is available.`} action={<Link to="/report" className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-400"><Plus size={17} /> Report an item</Link>} />
    <section className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/55 p-4" aria-label="Report filters">
      <div className="flex flex-col gap-3 lg:flex-row">
        <SearchField placeholder="Search by item name or description" disabled />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-[540px]">
          <select disabled aria-label="Category" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-400"><option>All categories</option></select>
          <select disabled aria-label="Location" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-400"><option>All locations</option></select>
          <select disabled aria-label="Sort order" className="col-span-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-400 sm:col-span-1"><option>Most recent</option></select>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Filters will activate when report browsing is connected to the API.</p>
    </section>
    <EmptyState icon={Package} title={`No ${type} reports to show`} description="The reports API is not connected yet. When it is, this page will show current campus listings with search and filters." action={<Link to="/report" className="text-sm font-medium text-blue-300 hover:text-blue-200">Create a report</Link>} />
  </>;
}

export function MyReportsPage() {
  return <>
    <PageHeader eyebrow="Your activity" title="My reports" description="Manage reports that you have submitted." />
    <EmptyState title="Sign in to view your reports" description="Your reports are private. Sign in after authentication is available to see and manage them." action={<Link to="/login" className="text-sm font-medium text-blue-300 hover:text-blue-200">Go to sign in</Link>} />
  </>;
}

export function ItemDetailsPage() {
  const { itemId } = useParams();
  return <>
    <Link to="/found" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16} /> Back to items</Link>
    <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
      <div className="grid min-h-72 place-items-center rounded-2xl border border-slate-800 bg-slate-900/50 text-slate-600"><Package size={44} strokeWidth={1.2} /></div>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-6">
        <p className="text-xs uppercase tracking-widest text-blue-300">Item report</p><h1 className="mt-2 text-2xl font-semibold">Report details</h1>
        <p className="mt-2 text-sm text-slate-400">Report ID: <span className="font-mono text-slate-500">{itemId}</span></p>
        <div className="mt-6 space-y-4 border-t border-slate-800 pt-5 text-sm text-slate-400"><p className="flex items-center gap-3"><MapPin size={17} /> Location details unavailable</p><p className="flex items-center gap-3"><CalendarDays size={17} /> Incident date unavailable</p></div>
        <p className="mt-6 rounded-xl bg-slate-800/60 p-4 text-sm leading-6 text-slate-400">Report details will load here after the item API is implemented.</p>
      </section>
    </div>
  </>;
}
