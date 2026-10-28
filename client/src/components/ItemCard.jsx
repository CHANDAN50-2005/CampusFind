import { Link } from 'react-router';
import { CalendarDays, MapPin, Package } from 'lucide-react';

const categoryLabels = {
  'id-cards': 'ID cards',
  electronics: 'Electronics',
  accessories: 'Accessories',
  books: 'Books',
  clothing: 'Clothing',
  keys: 'Keys',
  bags: 'Bags',
  other: 'Other',
};

const statusStyles = {
  open: 'bg-emerald-400/10 text-emerald-300',
  matched: 'bg-cyan-400/10 text-cyan-200',
  claimed: 'bg-amber-300/10 text-amber-200',
  returned: 'bg-blue-400/10 text-blue-200',
  closed: 'bg-slate-700 text-slate-300',
};

export function ItemCard({ item }) {
  const date = new Date(item.dateOfIncident).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  return <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition hover:border-slate-700">
    <Link to={'/items/' + item._id} className="block">
      <div className="relative grid h-44 place-items-center bg-slate-900 text-slate-700">
        {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" /> : <Package size={40} strokeWidth={1.2} />}
        <span className={'absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium capitalize ' + (statusStyles[item.status] || statusStyles.open)}>{item.status}</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><p className="text-xs font-medium uppercase tracking-wider text-blue-300">{item.type} · {categoryLabels[item.category] || item.category}</p><h2 className="mt-1 truncate font-semibold text-slate-100">{item.itemName}</h2></div>
        </div>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-400">{item.description}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-800 pt-3 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><MapPin size={13} />{item.location}</span><span className="inline-flex items-center gap-1.5"><CalendarDays size={13} />{date}</span></div>
      </div>
    </Link>
  </article>;
}
