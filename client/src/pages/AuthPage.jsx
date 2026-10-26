import { Link } from 'react-router';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { FormField } from '../components/UI.jsx';

const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600';

export function AuthPage({ mode }) {
  const register = mode === 'register';
  return <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-10 text-slate-100">
    <section className="w-full max-w-md">
      <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16} /> CampusFind home</Link>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-7 sm:p-9">
        <span className="grid size-11 place-items-center rounded-xl bg-blue-500/15 text-blue-300"><LockKeyhole size={20} /></span>
        <h1 className="mt-5 text-2xl font-semibold">{register ? 'Create your account' : 'Welcome back'}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{register ? 'Join your campus lost and found community.' : 'Sign in to manage your campus reports.'}</p>
        <form className="mt-7 space-y-5" onSubmit={(event) => event.preventDefault()}>
          {register && <FormField label="Full name"><input className={inputClass} autoComplete="name" placeholder="Your name" disabled /></FormField>}
          <FormField label="Campus email"><input className={inputClass} type="email" autoComplete="email" placeholder="you@college.edu" disabled /></FormField>
          <FormField label="Password"><input className={inputClass} type="password" autoComplete={register ? 'new-password' : 'current-password'} placeholder="••••••••" disabled /></FormField>
          <button disabled className="w-full cursor-not-allowed rounded-xl bg-blue-500/50 px-4 py-3 text-sm font-semibold text-white/70">{register ? 'Registration coming soon' : 'Sign in coming soon'}</button>
        </form>
        <p className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs leading-5 text-slate-500">Authentication is not connected yet. No credentials will be submitted or stored from this screen.</p>
        <p className="mt-5 text-center text-sm text-slate-400">{register ? 'Already have an account?' : 'New to CampusFind?'} <Link className="font-medium text-blue-300 hover:text-blue-200" to={register ? '/login' : '/register'}>{register ? 'Log in' : 'Create an account'}</Link></p>
      </div>
    </section>
  </main>;
}
