import { Link } from 'react-router';
import { ArrowRight, Search, ShieldCheck, Sparkles } from 'lucide-react';

const features = [
  { icon: Search, title: 'Search campus reports', text: 'Browse lost and found items with filters for category, place, and date.' },
  { icon: Sparkles, title: 'Get match suggestions', text: 'See reports that share item details, descriptions, and locations.' },
  { icon: ShieldCheck, title: 'Recover with confidence', text: 'Submit a claim and keep ownership details visible only to the right people.' },
];

export function HomePage() {
  return <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
      <Link to="/" className="flex items-center gap-3 font-semibold tracking-tight"><span className="grid size-10 place-items-center rounded-xl bg-blue-500 text-lg font-bold text-white">C</span><span className="text-lg">CampusFind</span></Link>
      <nav className="flex items-center gap-3" aria-label="Main navigation"><Link className="rounded-lg px-4 py-2 text-sm text-slate-300 transition hover:text-white" to="/login">Log in</Link><Link className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400" to="/dashboard">Explore</Link></nav>
    </header>
    <section className="mx-auto grid max-w-7xl gap-14 px-6 pb-20 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-20">
      <div>
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-200"><span className="size-2 rounded-full bg-cyan-300" /> A better way to reunite campus belongings</p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">Lost something? <span className="text-blue-400">Let’s find it.</span></h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Report an item, search campus listings, and get helpful suggestions when a lost report looks like a found one.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link to="/report" className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-400">Create a report <ArrowRight size={18} /></Link><Link to="/found" className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900">Browse found items</Link></div>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-blue-950/30 sm:p-8">
        <div><p className="text-sm text-slate-400">A simple place to start</p><h2 className="mt-1 text-2xl font-semibold">Your campus, connected</h2></div>
        <div className="mt-8 space-y-3">{features.map(({ icon: Icon, title, text }, index) => <article key={title} className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-400/10 text-blue-300"><Icon size={20} /></span><div><p className="font-medium">{String(index + 1).padStart(2, '0')} · {title}</p><p className="mt-1 text-sm leading-6 text-slate-400">{text}</p></div></article>)}</div>
        <p className="mt-5 text-xs leading-5 text-slate-500">Suggestions help connect reports. A match is never proof of ownership.</p>
      </div>
    </section>
    <footer className="border-t border-slate-900 px-6 py-5 text-center text-sm text-slate-500">CampusFind · Helping campus belongings find their way home</footer>
  </main>;
}
