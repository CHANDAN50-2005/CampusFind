import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router';
import { Bell, ChevronDown, CircleHelp, Compass, FilePlus2, LayoutDashboard, Menu, Search, Shield, Sparkles, Tag, UserRound, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const navigation = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Lost items', to: '/lost', icon: Search },
  { label: 'Found items', to: '/found', icon: Tag },
  { label: 'My reports', to: '/my-reports', icon: Compass },
  { label: 'Potential matches', to: '/matches', icon: Sparkles },
  { label: 'Claims', to: '/claims', icon: Shield },
  { label: 'Notifications', to: '/notifications', icon: Bell },
];

function SidebarContent({ onNavigate, user, onLogout }) {
  return (
    <>
      <Link to="/" className="mb-9 flex items-center gap-3 px-2" onClick={onNavigate}>
        <span className="grid size-10 place-items-center rounded-xl bg-blue-500 font-bold text-white">C</span>
        <span className="text-lg font-semibold tracking-tight text-white">CampusFind</span>
      </Link>
      <Link to="/report" onClick={onNavigate} className="mb-7 flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-400">
        <FilePlus2 size={17} /> Report an item
      </Link>
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Workspace</p>
      <nav className="space-y-1" aria-label="Workspace navigation">
        {navigation.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onNavigate} className={({ isActive }) => 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ' + (isActive ? 'bg-blue-500/15 font-medium text-blue-200' : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100')}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-slate-800 pt-5">
        {user.role === 'admin' && <NavLink to="/admin" onClick={onNavigate} className={({ isActive }) => 'mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ' + (isActive ? 'bg-blue-500/15 text-blue-200' : 'text-slate-400 hover:bg-slate-800/70 hover:text-white')}>
          <Shield size={18} /><span>Admin area</span>
        </NavLink>}
        <div className="flex items-center gap-3 rounded-xl bg-slate-900 p-3">
          <span className="grid size-9 place-items-center rounded-full bg-slate-800 text-slate-300"><UserRound size={17} /></span>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-200">{user.name}</span><span className="block truncate text-xs text-slate-500">{user.email}</span></span>
          <button onClick={onLogout} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Sign out" title="Sign out"><LogOut size={17} /></button>
          <ChevronDown size={16} className="text-slate-600" aria-hidden="true" />
        </div>
      </div>
    </>
  );
}

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    setLogoutError('');
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      setLogoutError('Could not sign out. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800/80 bg-slate-950 px-4 py-6 lg:flex">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>
      {menuOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <aside className={'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-950 px-4 py-6 transition-transform lg:hidden ' + (menuOpen ? 'translate-x-0' : '-translate-x-full')} aria-label="Mobile navigation">
        <button className="absolute right-4 top-6 rounded-lg p-2 text-slate-400 hover:bg-slate-800" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={19} /></button>
        <SidebarContent user={user} onLogout={handleLogout} onNavigate={() => setMenuOpen(false)} />
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-800/80 bg-slate-950/90 px-4 backdrop-blur sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
            <span className="hidden text-sm text-slate-500 sm:block">Campus community</span>
          </div>
          <Link to="/notifications" className="rounded-lg p-2.5 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Notifications"><Bell size={19} /></Link>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-7 sm:py-9 lg:px-10">
          {logoutError && <p role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{logoutError}</p>}
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-400/15 bg-amber-300/[0.06] px-4 py-3 text-sm text-amber-100/80">
            <CircleHelp size={18} className="mt-0.5 shrink-0 text-amber-200" />
            <p><span className="font-medium text-amber-100">CampusFind.</span> Reports and claims use live campus data.</p>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
