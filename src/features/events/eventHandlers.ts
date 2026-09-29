import type { AppDispatch, RootState } from '../../app/store';
import type {
  ActiveAnalysis,
  AnalysisFinishedEvent,
  AppEvent,
  EventsSnapshot,
  IndexCompletedEvent,
  IndexedFile,
  IndexFailedEvent,
  IndexJobSummary,
  PushReceivedEvent,
} from '../../types/events';
import { indexKey } from '../../utils/keys';
import { fetchIndexStatus } from '../repositories/repositoriesThunks';
import { trackAnalysis } from '../reviews/analysisController';
import { fetchPrRuns, resumeAnalysis } from '../reviews/reviewsThunks';
import { showToast } from '../ui/uiSlice';
import { indexJobCompleted, indexJobFailed, indexJobUpdated, snapshotReceived } from './indexJobsSlice';

type Api = { dispatch: AppDispatch; getState: () => RootState };

const shortSha = (sha?: string) => (sha ? sha.slice(0, 7) : '');

/** Re-attaches the analysis page to a run the server is still working on (e.g. after a refresh). */
function resumeActiveAnalysis(analyses: ActiveAnalysis[], { dispatch, getState }: Api) {
  if (!analyses.length || getState().analysis.status === 'running') return;
  const latest = [...analyses].sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  trackAnalysis(
    dispatch(
      resumeAnalysis({
        runId: latest.runId,
        params: {
          owner: latest.owner,
          repo: latest.repo,
          number: latest.pullNumber,
          postComments: latest.postComments,
        },
      }),
    ),
  );
}

export function handleSnapshot(snapshot: EventsSnapshot, api: Api) {
  api.dispatch(snapshotReceived(snapshot));
  resumeActiveAnalysis(snapshot.analyses ?? [], api);
}

export function handleAppEvent({ type, data }: AppEvent, api: Api) {
  const { dispatch, getState } = api;

  switch (type) {
    case 'push.received': {
      const push = data as PushReceivedEvent;
      const changed = push.changed + push.removed;
      const message = [
        push.message ? `"${push.message}"` : shortSha(push.sha),
        push.pusher ? `by ${push.pusher}` : '',
        `· syncing ${changed} changed file${changed === 1 ? '' : 's'}`,
      ]
        .filter(Boolean)
        .join(' ');
      dispatch(showToast({ tone: 'info', title: `New push to ${push.owner}/${push.repo}@${push.branch}`, message }));
      break;
    }

    case 'index.started':
    case 'index.progress':
    case 'index.file': {
      const job = data as IndexJobSummary & { file?: IndexedFile };
      dispatch(indexJobUpdated(job));
      if (type === 'index.started') {
        void dispatch(fetchIndexStatus({ owner: job.owner, repo: job.repo, branch: job.branch }));
      }
      break;
    }

    case 'index.completed': {
      const job = data as IndexCompletedEvent;
      dispatch(indexJobCompleted(job));
      void dispatch(fetchIndexStatus({ owner: job.owner, repo: job.repo, branch: job.branch }));
      const where = indexKey(job.owner, job.repo, job.branch);
      const title = job.kind === 'incremental' ? `Index synced: ${where}` : `Indexing complete: ${where}`;
      const message =
        job.kind === 'incremental'
          ? `${job.processed} changed file${job.processed === 1 ? '' : 's'} applied · ${job.chunkCount} chunks total`
          : `${job.fileCount} files · ${job.chunkCount} chunks. Reviews now use this codebase context.`;
      dispatch(showToast({ tone: 'success', title, message }));
      break;
    }

    case 'index.failed': {
      const job = data as IndexFailedEvent;
      dispatch(indexJobFailed(job));
      void dispatch(fetchIndexStatus({ owner: job.owner, repo: job.repo, branch: job.branch }));
      const title = `Indexing failed: ${indexKey(job.owner, job.repo, job.branch)}`;
      dispatch(showToast({ tone: 'error', title, message: job.error }));
      break;
    }

    case 'analysis.finished': {
      const run = data as AnalysisFinishedEvent;
      void dispatch(fetchPrRuns({ owner: run.owner, repo: run.repo, number: run.pullNumber }));
      if (run.error?.startsWith('Cancelled')) break;

      // The live analysis page already announces the run it is following.
      const watching = getState().analysis.runId === run.runId && window.location.pathname.endsWith('/analyze');
      if (watching) break;

      const ok = run.status === 'completed';
      const pr = `${run.owner}/${run.repo} #${run.pullNumber}`;
      dispatch(
        showToast({
          tone: ok ? 'success' : 'error',
          title: ok ? `Review ready: ${pr}` : `Review failed: ${pr}`,
          message: ok ? `${run.findings} finding${run.findings === 1 ? '' : 's'} detected` : run.error,
        }),
      );
      break;
    }
  }
}
