import { Loader2, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectDisplayName, selectGithubProfile } from '../../features/auth/selectors';
import { selectAnalysis } from '../../features/reviews/selectors';
import { setSidebarOpen } from '../../features/ui/uiSlice';
import { prPath } from '../../utils/keys';
import { Avatar } from '../ui/Avatar';

export function Topbar() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectGithubProfile);
  const name = useAppSelector(selectDisplayName);
  const analysis = useAppSelector(selectAnalysis);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => dispatch(setSidebarOpen(true))}
        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="ml-auto flex items-center gap-3">
        {analysis.status === 'running' && analysis.params && (
          <Link
            to={`${prPath(analysis.params.owner, analysis.params.repo, analysis.params.number)}/analyze`}
            className="hidden items-center gap-2 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100 sm:inline-flex"
          >
            <Loader2 className="size-3.5 animate-spin" />
            Analyzing {analysis.params.repo} #{analysis.params.number}
          </Link>
        )}
        <Link to="/settings" aria-label="Settings">
          <Avatar src={profile?.avatar_url} name={name} size="md" />
        </Link>
      </div>
    </header>
  );
}
