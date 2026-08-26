import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

export function CandidateLayout() {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium ${isActive ? 'text-brand-700' : 'text-slate-600 hover:text-slate-900'}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <NavLink to="/" className="text-lg font-semibold text-slate-900">
            TalentBridge
          </NavLink>
          <nav className="flex items-center gap-6">
            <NavLink to="/" end className={linkClass}>
              Jobs
            </NavLink>
            {user && (
              <NavLink to="/my-applications" className={linkClass}>
                My Applications
              </NavLink>
            )}
            {user ? (
              <button type="button" onClick={logout} className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Log out
              </button>
            ) : (
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
