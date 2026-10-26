import { Search, PackageOpen } from 'lucide-react';

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon = PackageOpen, title, description, action }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-12 text-center">
      <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-slate-800 text-slate-400"><Icon size={22} /></span>
      <h2 className="font-semibold text-slate-200">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Panel({ title, description, children, className = '' }) {
  return <section className={`rounded-2xl border border-slate-800 bg-slate-900/55 ${className}`}>
    {(title || description) && <div className="border-b border-slate-800 px-5 py-4"><h2 className="font-medium text-slate-200">{title}</h2>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div>}
    {children}
  </section>;
}

export function SearchField({ placeholder = 'Search reports', disabled = false }) {
  return <label className="relative block min-w-0 flex-1">
    <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
    <input type="search" placeholder={placeholder} disabled={disabled} className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400 disabled:cursor-not-allowed disabled:opacity-60" />
  </label>;
}

export function FormField({ label, hint, children }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>{children}{hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}</label>;
}
