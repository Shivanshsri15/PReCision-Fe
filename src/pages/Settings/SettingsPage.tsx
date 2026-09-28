import { LogOut } from 'lucide-react';
import { useEffect } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { logout } from '../../features/auth/authSlice';
import { fetchGithubProfile } from '../../features/auth/authThunks';
import { fetchGeminiKeyStatus } from '../../features/settings/settingsThunks';
import { GeminiKeyCard } from './components/GeminiKeyCard';
import { ProfileCard } from './components/ProfileCard';

export function SettingsPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(fetchGeminiKeyStatus());
    void dispatch(fetchGithubProfile());
  }, [dispatch]);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" description="Manage your account and AI provider key." />
      <div className="space-y-6">
        <ProfileCard />
        <GeminiKeyCard />
        <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Sign out</h2>
            <p className="mt-0.5 text-xs text-slate-500">End your session on this device.</p>
          </div>
          <Button variant="danger" icon={LogOut} onClick={() => dispatch(logout())}>
            Sign out
          </Button>
        </Card>
      </div>
    </div>
  );
}
