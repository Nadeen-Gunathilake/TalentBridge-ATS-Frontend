import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

export function RecruiterLayout() {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium ${
      isActive ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <span className="text-lg font-semibold text-white">TalentBridge · Recruiter</span>
            <nav className="flex items-center gap-1">
              <NavLink to="/recruiter" end className={linkClass}>
                Jobs
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">{user?.email}</span>
            <button type="button" onClick={logout} className="text-sm font-medium text-slate-300 hover:text-white">
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
