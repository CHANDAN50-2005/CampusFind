import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { FormField } from '../components/UI.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-blue-400';

export function AuthPage({ mode }) {
  const registerMode = mode === 'register';
  const { user, loading: sessionLoading, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!sessionLoading && user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (registerMode && password !== confirmPassword) {
      setError('Passwords do not match. Please check them and try again.');
      return;
    }
    setSubmitting(true);
    try {
      if (registerMode) await register({ name, email, password });
      else await login({ email, password });
      const destination = location.state?.from || '/dashboard';
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not complete that request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-10 text-slate-100">
    <section className="w-full max-w-md">
      <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16} /> CampusFind home</Link>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-7 sm:p-9">
        <span className="grid size-11 place-items-center rounded-xl bg-blue-500/15 text-blue-300"><LockKeyhole size={20} /></span>
        <h1 className="mt-5 text-2xl font-semibold">{registerMode ? 'Create your account' : 'Welcome back'}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{registerMode ? 'Join your campus lost and found community.' : 'Sign in to manage your campus reports.'}</p>
        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          {registerMode && <FormField label="Full name"><input className={inputClass} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required disabled={submitting} /></FormField>}
          <FormField label="Campus email"><input className={inputClass} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required disabled={submitting} /></FormField>
          <FormField label="Password"><div className="relative"><input className={inputClass + ' pr-12'} type={showPassword ? 'text' : 'password'} autoComplete={registerMode ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} minLength={registerMode ? 8 : undefined} maxLength={72} required disabled={submitting} /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-white"><span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button></div></FormField>
          {registerMode && <FormField label="Confirm password"><div className="relative"><input className={inputClass + ' pr-12'} type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} maxLength={72} required disabled={submitting} /><button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'} aria-pressed={showConfirmPassword} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-white"><span className="sr-only">{showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}</span>{showConfirmPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button></div></FormField>}
          {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-3 text-sm text-rose-200">{error}</p>}
          <button disabled={submitting || sessionLoading} className="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-wait disabled:opacity-60">{submitting ? 'Please wait…' : registerMode ? 'Create account' : 'Sign in'}</button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-400">{registerMode ? 'Already have an account?' : 'New to CampusFind?'} <Link className="font-medium text-blue-300 hover:text-blue-200" to={registerMode ? '/login' : '/register'}>{registerMode ? 'Log in' : 'Create an account'}</Link></p>
      </div>
    </section>
  </main>;
}
