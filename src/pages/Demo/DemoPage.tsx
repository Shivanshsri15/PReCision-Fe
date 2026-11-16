import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Logo } from '../../components/layout/Logo';
import { startGithubLogin } from '../../features/auth/authThunks';
import { selectLoginStatus } from '../../features/auth/selectors';
import { DemoCoach } from './DemoCoach';
import {
  AnalyzingPanel,
  DonePanel,
  FindingsPanel,
  IndexingPanel,
  PullRequestPanel,
  RepositoriesPanel,
  WelcomePanel,
} from './panels';
import { pickDemoScenario } from './scenarios';
import { useDemoTour } from './useDemoTour';

export function DemoPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loginStatus = useAppSelector(selectLoginStatus);
  const scenario = useMemo(() => pickDemoScenario(), []);
  const tour = useDemoTour();
  const [postComments, setPostComments] = useState(true);

  const exit = useCallback(() => navigate('/login', { replace: true }), [navigate]);

  // In-panel CTAs drive repositories / pullRequest; timers drive indexing / analyzing.
  const coachNext =
    tour.step === 'welcome'
      ? { label: 'Start' as const }
      : tour.step === 'findings'
        ? { label: 'Finish demo' as const }
        : null;

  return (
    <div className="flex min-h-full flex-col bg-[radial-gradient(ellipse_at_top,var(--color-brand-50),transparent_55%),linear-gradient(to_bottom,white,var(--color-slate-50))]">
      <div className="border-b border-amber-200/80 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900">
        Practice demo with sample data — nothing is saved and GitHub is not contacted.
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo to="/login" />
        <button
          type="button"
          onClick={exit}
          className="text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          Exit
        </button>
      </header>

      <main
        className={
          tour.step === 'findings'
            ? 'mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-40 pt-4 sm:px-6'
            : 'mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-36 pt-6 sm:px-6 sm:pb-28'
        }
      >
        {tour.step === 'welcome' && <WelcomePanel scenario={scenario} />}
        {tour.step === 'repositories' && (
          <RepositoriesPanel
            scenario={scenario}
            onIndex={() => tour.goTo('indexing')}
          />
        )}
        {tour.step === 'indexing' && (
          <IndexingPanel scenario={scenario} onDone={() => tour.goTo('pullRequest')} />
        )}
        {tour.step === 'pullRequest' && (
          <PullRequestPanel
            scenario={scenario}
            postComments={postComments}
            onPostCommentsChange={setPostComments}
            onAnalyze={() => tour.goTo('analyzing')}
          />
        )}
        {tour.step === 'analyzing' && (
          <AnalyzingPanel
            active
            postComments={postComments}
            onDone={() => tour.goTo('findings')}
          />
        )}
        {tour.step === 'findings' && (
          <FindingsPanel scenario={scenario} postComments={postComments} />
        )}
        {tour.step === 'done' && (
          <DonePanel
            loading={loginStatus === 'loading'}
            onSignIn={() => void dispatch(startGithubLogin())}
            onExit={exit}
          />
        )}
      </main>

      {tour.step !== 'done' && (
        <DemoCoach
          stepId={tour.step}
          stepIndex={tour.index}
          total={tour.total}
          title={tour.copy.title}
          body={tour.copy.body}
          showNext={coachNext !== null}
          nextLabel={coachNext?.label}
          onNext={() => tour.goNext()}
          onSkip={exit}
        />
      )}
    </div>
  );
}
