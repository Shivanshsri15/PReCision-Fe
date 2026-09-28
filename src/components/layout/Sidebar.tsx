import clsx from 'clsx';
import { FolderGit2, GitPullRequest, History, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { selectDisplayName, selectGithubProfile, selectLogin } from '../../features/auth/selectors';
import { selectSidebarOpen, setSidebarOpen } from '../../features/ui/uiSlice';
import { Avatar } from '../ui/Avatar';
import { Logo } from './Logo';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/repositories', label: 'Repositories', icon: FolderGit2 },
  { to: '/pull-requests', label: 'Pull Requests', icon: GitPullRequest },
  { to: '/reviews', label: 'Reviews', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectSidebarOpen);
  const profile = useAppSelector(selectGithubProfile);
  const name = useAppSelector(selectDisplayName);
  const login = useAppSelector(selectLogin);
  const close = () => dispatch(setSidebarOpen(false));

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={close} />}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center px-5">
          <Logo />
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={close}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 border-t border-slate-100 p-4">
          <Avatar src={profile?.avatar_url} name={name} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{name}</p>
            {login && <p className="truncate text-xs text-slate-500">@{login}</p>}
          </div>
          <button
            type="button"
            aria-label="Sign out"
            title="Sign out"
            onClick={() => dispatch(logout())}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
