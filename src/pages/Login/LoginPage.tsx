import {
  AlertCircle,
  ArrowRight,
  Boxes,
  ChevronDown,
  Database,
  GitPullRequest,
  KeyRound,
  Lock,
  MessageSquareCode,
  Network,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { startGithubLogin } from '../../features/auth/authThunks';
import { selectAuthError, selectLoginStatus } from '../../features/auth/selectors';
import { Logo } from '../../components/layout/Logo';
import { Button } from '../../components/ui/Button';
import { GithubIcon } from '../../components/ui/GithubIcon';
import { ReviewPreview } from './components/ReviewPreview';

type IconType = ComponentType<{ className?: string }>;

const NEXT_STEPS: Array<{ icon: IconType; title: string; text: string }> = [
  { icon: GithubIcon, title: 'Authorize with GitHub', text: 'Takes a few seconds. Your repositories load automatically.' },
  { icon: KeyRound, title: 'Add your Gemini API key', text: 'Reviews run on your own key. It is stored encrypted.' },
  { icon: GitPullRequest, title: 'Index a branch & analyze a PR', text: 'Get scored findings in a couple of minutes.' },
];

const FEATURES: Array<{ icon: IconType; title: string; text: string }> = [
  {
    icon: Network,
    title: 'Context-aware',
    text: 'Your repository is indexed , so every review sees callers, related files and conventions — not just the diff.',
  },
  {
    icon: Boxes,
    title: 'Multi-agent',
    text: 'Quality, security and performance reviewers run in parallel, then a bug-detection pass catches what they missed.',
  },
  {
    icon: MessageSquareCode,
    title: 'Inline on GitHub',
    text: 'Optionally post findings as review comments on the exact changed lines, with a suggested fix for each.',
  },
  {
    icon: RotateCcw,
    title: 'Re-run after fixes',
    text: 'Push your fixes and re-run: previous findings are re-checked and the old comments are resolved.',
  },
];

const STEPS: Array<{ icon: IconType; title: string; text: string }> = [
  { icon: GithubIcon, title: 'Connect GitHub', text: 'Sign in and pick from the repositories you already have access to.' },
  { icon: Database, title: 'Index a branch', text: 'PReCision embeds your code so reviewers can pull in the context around each change.' },
  { icon: GitPullRequest, title: 'Analyze a pull request', text: 'Watch the pipeline run live: retrieval, parallel reviewers, bug detection.' },
  { icon: ShieldCheck, title: 'Fix & mark complete', text: 'Work through severity-ranked findings, re-run after pushing, then mark the review complete.' },
];

const FAQ = [
  {
    q: 'What access does PReCision need?',
    a: 'Repository access through GitHub OAuth, used to read pull requests and files, index branches, and — only when you turn it on — post review comments.',
  },
  {
    q: 'Why do I need my own Gemini key?',
    a: 'All embeddings and reviews run on Google Gemini. Using your own key keeps usage on your quota. The key is encrypted at rest (AES-256-GCM) and never returned by the API.',
  },
  {
    q: 'Will it comment on my pull requests automatically?',
    a: 'No. Analyses start when you ask for them, and comments are posted only if you enable “Post comments to GitHub” for that run.',
  },
];

export function LoginPage() {
  const dispatch = useAppDispatch();
  const loginStatus = useAppSelector(selectLoginStatus);
  const error = useAppSelector(selectAuthError);

  return (
    <div className="min-h-full bg-[radial-gradient(ellipse_at_top_left,var(--color-brand-100),transparent_55%),linear-gradient(to_bottom,white,var(--color-slate-50))]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo to="/login" />
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
          <a href="#features" className="hover:text-slate-900">Features</a>
          <a href="#how-it-works" className="hover:text-slate-900">How it works</a>
          <a href="#faq" className="hover:text-slate-900">FAQ</a>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid items-center gap-16 pt-8 lg:grid-cols-2 lg:pt-14">
          <section>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
              AI pull request reviews for GitHub
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Code review that understands your entire codebase.
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-slate-600">
              PReCision reviews each pull request with the context of the whole repository, so it catches broken
              contracts, security gaps and regressions a diff-only review would miss.
            </p>

            <div className="mt-8 max-w-md rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
              <Button
                variant="dark"
                size="lg"
                className="w-full"
                loading={loginStatus === 'loading'}
                iconRight={ArrowRight}
                onClick={() => void dispatch(startGithubLogin())}
              >
                <GithubIcon className="size-5" />
                {loginStatus === 'loading' ? 'Redirecting to GitHub…' : 'Continue with GitHub'}
              </Button>

              {error && (
                <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>
                    {error.message}
                    <span className="block text-xs text-red-600/80">Please try again.</span>
                  </span>
                </p>
              )}

              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">What happens next</p>
              <ol className="mt-3 space-y-3">
                {NEXT_STEPS.map(({ icon: Icon, title, text }, index) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                        <Icon className="size-3.5 text-slate-400" />
                        {title}
                      </p>
                      <p className="text-xs text-slate-500">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="mt-5 flex items-start gap-1.5 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <Lock className="mt-0.5 size-3.5 shrink-0" />
                No password to create. We only use GitHub to identify you and access the repositories you choose to review.
              </p>
            </div>
          </section>

          <section className="hidden lg:block">
            <ReviewPreview />
          </section>
        </div>

        <section id="features" className="mt-28 scroll-mt-8">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-brand-600">Features</h2>
          <p className="mt-2 text-center text-2xl font-bold tracking-tight text-slate-900">
            Built for reviews you can actually act on
          </p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon className="size-4" />
                </span>
                <p className="mt-4 text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="how-it-works" className="mt-24 scroll-mt-8">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-brand-600">How it works</h2>
          <p className="mt-2 text-center text-2xl font-bold tracking-tight text-slate-900">
            From sign-in to your first review in minutes
          </p>
          <ol className="relative mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <Icon className="size-4" />
                  </span>
                  <span className="font-mono text-xs text-slate-300">0{index + 1}</span>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="faq" className="mx-auto mt-24 max-w-3xl scroll-mt-8">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-brand-600">FAQ</h2>
          <p className="mt-2 text-center text-2xl font-bold tracking-tight text-slate-900">Good to know before you sign in</p>
          <div className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group px-5 py-4">
                <summary className="flex list-none items-center justify-between gap-4 text-sm font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
                  {q}
                  <ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        PReCision — context-aware, multi-agent code review.
      </footer>
    </div>
  );
}
