import { Database, LogOut, MessageSquareCode, Sparkles } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Logo } from '../../components/layout/Logo';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import { logout } from '../../features/auth/authSlice';
import { selectDisplayName } from '../../features/auth/selectors';
import { selectSettings } from '../../features/settings/settingsSlice';
import { GeminiKeyCard } from '../Settings/components/GeminiKeyCard';

const USES = [
  { icon: Database, text: 'Embedding your repository when you index a branch' },
  { icon: Sparkles, text: 'Running the quality, security, performance and bug reviewers' },
  { icon: MessageSquareCode, text: 'Writing the findings posted on your pull requests' },
];

/** Onboarding step shown after sign-in until the user saves a personal Gemini key. */
export function GeminiKeySetupPage() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const name = useAppSelector(selectDisplayName);
  const { geminiKey } = useAppSelector(selectSettings);

  if (geminiKey?.configured) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from && from !== location.pathname ? from : '/'} replace />;
  }
  if (!geminiKey) return <PageSpinner label="Loading your workspace…" />;

  return (
    <div className="min-h-full bg-[radial-gradient(ellipse_at_top_left,var(--color-brand-100),transparent_55%),linear-gradient(to_bottom,white,var(--color-slate-50))]">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Logo to="/setup/gemini-key" />
        <Button variant="ghost" size="sm" icon={LogOut} onClick={() => dispatch(logout())}>
          Sign out
        </Button>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <p className="text-sm font-medium text-brand-600">One last step{name ? `, ${name}` : ''}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Add your Gemini API key</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          PReCision runs every review with your own Google Gemini key, so usage stays on your quota. You need to
          add it before you can index repositories or analyze pull requests.
        </p>

        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {USES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
              <Icon className="mt-0.5 size-4 shrink-0 text-brand-600" />
              {text}
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <GeminiKeyCard />
        </div>
      </main>
    </div>
  );
}
