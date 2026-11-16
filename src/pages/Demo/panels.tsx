import {
  CheckCircle2,
  Database,
  GitBranch,
  GitPullRequest,
  Loader2,
  MessageSquareCode,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { PipelineStepper } from '../../components/review/PipelineStepper';
import { Button } from '../../components/ui/Button';
import { GithubIcon } from '../../components/ui/GithubIcon';
import { Toggle } from '../../components/ui/Toggle';
import { DemoFindingsWorkspace } from './DemoFindingsWorkspace';
import type { DemoScenario } from './scenarios';
import { useFakePipeline } from './useFakePipeline';

export function WelcomePanel({ scenario }: { scenario: DemoScenario }) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
        <Sparkles className="size-3.5" />
        Interactive demo
      </span>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
        How a PReCision review works
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        You will walk through a sample pull request on{' '}
        <span className="font-medium text-slate-800">
          {scenario.owner}/{scenario.repo}
        </span>{' '}
        (PR #{scenario.pullNumber}). The layout matches the real app; the findings are sample data.
      </p>
    </div>
  );
}

export function RepositoriesPanel({
  scenario,
  onIndex,
}: {
  scenario: DemoScenario;
  onIndex: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg">
      <h2 className="text-lg font-semibold text-slate-900">Your repositories</h2>
      <p className="mt-1 text-sm text-slate-500">
        Index a branch once so every PR review can use that code as context.
      </p>
      <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {scenario.owner}/{scenario.repo}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <GitBranch className="size-3.5" />
              Branch: {scenario.branch}
            </p>
          </div>
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-100">
            Not indexed yet
          </span>
        </div>
        <Button className="mt-4 w-full" icon={Database} onClick={onIndex}>
          Index this branch
        </Button>
      </article>
    </div>
  );
}

export function IndexingPanel({
  scenario,
  onDone,
}: {
  scenario: DemoScenario;
  onDone: () => void;
}) {
  const [percent, setPercent] = useState(0);
  const [fileIndex, setFileIndex] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const duration = 4000;
    const tick = window.setInterval(() => {
      const t = Math.min(1, (Date.now() - started) / duration);
      setPercent(Math.round(t * 100));
      setFileIndex(Math.min(scenario.indexFiles.length - 1, Math.floor(t * scenario.indexFiles.length)));
      if (t >= 1) {
        window.clearInterval(tick);
        window.setTimeout(onDone, 400);
      }
    }, 80);
    return () => window.clearInterval(tick);
  }, [onDone, scenario.indexFiles]);

  const current = scenario.indexFiles[fileIndex] ?? scenario.indexFiles.at(-1);

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Loader2 className="size-4 animate-spin text-brand-600" />
        Indexing branch “{scenario.branch}”…
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-600 transition-[width] duration-100"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-3 font-mono text-xs text-slate-500">{current}</p>
      <p className="mt-1 text-xs tabular-nums text-slate-400">{percent}%</p>
    </div>
  );
}

export function PullRequestPanel({
  scenario,
  postComments,
  onPostCommentsChange,
  onAnalyze,
}: {
  scenario: DemoScenario;
  postComments: boolean;
  onPostCommentsChange: (value: boolean) => void;
  onAnalyze: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
          <GitPullRequest className="size-3.5" />
          Open · {scenario.owner}/{scenario.repo}
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">
          #{scenario.pullNumber} {scenario.title}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Merging into <span className="font-mono text-slate-700">{scenario.branch}</span> · Ready to
          analyze
        </p>

        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <Toggle
            checked={postComments}
            onChange={onPostCommentsChange}
            label="Post comments to GitHub"
            description="When on, findings are also left as review comments on the PR (on the changed lines)."
          />
        </div>

        <Button className="mt-4 w-full" icon={Sparkles} onClick={onAnalyze}>
          Start analysis
        </Button>
      </article>
    </div>
  );
}

export function AnalyzingPanel({
  active,
  postComments,
  onDone,
}: {
  active: boolean;
  postComments: boolean;
  onDone: () => void;
}) {
  const { steps, done } = useFakePipeline(active, 650);

  useEffect(() => {
    if (done) {
      const t = window.setTimeout(onDone, 600);
      return () => window.clearTimeout(t);
    }
  }, [done, onDone]);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Running the review</h2>
        {postComments && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
            <MessageSquareCode className="size-3.5" />
            Comments will be posted to GitHub
          </span>
        )}
      </div>
      <PipelineStepper steps={steps} />
    </div>
  );
}

export function FindingsPanel({
  scenario,
  postComments,
}: {
  scenario: DemoScenario;
  postComments: boolean;
}) {
  return <DemoFindingsWorkspace scenario={scenario} postComments={postComments} />;
}

export function DonePanel({
  onSignIn,
  onExit,
  loading,
}: {
  onSignIn: () => void;
  onExit: () => void;
  loading: boolean;
}) {
  return (
    <div className="mx-auto max-w-md text-center">
      <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
      <h2 className="mt-4 text-2xl font-bold text-slate-900">That’s the full flow</h2>
      <p className="mt-2 text-sm text-slate-600">
        Next, sign in with GitHub to run the same steps on your own repositories.
      </p>
      <Button
        variant="dark"
        size="lg"
        className="mt-6 w-full"
        loading={loading}
        onClick={onSignIn}
      >
        <GithubIcon className="size-5" />
        {loading ? 'Opening GitHub…' : 'Sign in with GitHub'}
      </Button>
      <button
        type="button"
        onClick={onExit}
        className="mt-3 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        Return to login
      </button>
    </div>
  );
}
