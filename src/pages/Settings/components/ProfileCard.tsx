import { ExternalLink } from 'lucide-react';
import { useAppSelector } from '../../../app/hooks';
import { Avatar } from '../../../components/ui/Avatar';
import { Card } from '../../../components/ui/Card';
import { GithubIcon } from '../../../components/ui/GithubIcon';
import { Skeleton } from '../../../components/ui/Skeleton';
import { selectCurrentUser, selectDisplayName, selectGithubProfile } from '../../../features/auth/selectors';
import { shortDate } from '../../../utils/format';

export function ProfileCard() {
  const user = useAppSelector(selectCurrentUser);
  const profile = useAppSelector(selectGithubProfile);
  const name = useAppSelector(selectDisplayName);

  return (
    <Card className="p-6">
      <h2 className="text-sm font-semibold text-slate-900">Profile</h2>
      <p className="mt-0.5 text-xs text-slate-500">Your account is linked to GitHub.</p>

      <div className="mt-5 flex items-center gap-4">
        <Avatar src={profile?.avatar_url} name={name} size="lg" />
        <div className="min-w-0">
          <p className="text-lg font-semibold text-slate-900">{name}</p>
          {profile ? (
            <a href={profile.html_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
              <GithubIcon className="size-3.5" /> @{profile.login} <ExternalLink className="size-3" />
            </a>
          ) : (
            <Skeleton className="mt-1 h-4 w-32" />
          )}
        </div>
      </div>

      <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-slate-500">Email</dt>
          <dd className="mt-0.5 truncate text-sm font-medium text-slate-800">{user?.email ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Public repositories</dt>
          <dd className="mt-0.5 text-sm font-medium text-slate-800">{profile?.public_repos ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Member since</dt>
          <dd className="mt-0.5 text-sm font-medium text-slate-800">{shortDate(user?.createdAt)}</dd>
        </div>
      </dl>
    </Card>
  );
}
