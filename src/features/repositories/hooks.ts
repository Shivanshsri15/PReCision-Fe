import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchIndexedRepos, fetchRepos, fetchIndexStatus } from './repositoriesThunks';
import { selectInFlightIndexRecords, selectRepositoriesState } from './selectors';

const POLL_INTERVAL_MS = 5000;

/** Loads the first page of GitHub repos and the user's index records once. */
export function useRepositoriesBootstrap(): void {
  const dispatch = useAppDispatch();
  const { reposStatus, indexedStatus } = useAppSelector(selectRepositoriesState);

  useEffect(() => {
    if (reposStatus === 'idle') void dispatch(fetchRepos({ page: 1 }));
  }, [dispatch, reposStatus]);

  useEffect(() => {
    if (indexedStatus === 'idle') void dispatch(fetchIndexedRepos());
  }, [dispatch, indexedStatus]);
}

/** Polls the status of every branch that is currently indexing until it settles. */
export function useIndexStatusPolling(): void {
  const dispatch = useAppDispatch();
  const inFlight = useAppSelector(selectInFlightIndexRecords);
  const signature = inFlight.map((r) => `${r.owner}/${r.repo}@${r.branch}`).join('|');

  useEffect(() => {
    if (!signature) return;
    const refs = signature.split('|').map((key) => {
      const at = key.indexOf('@');
      const [owner, repo] = key.slice(0, at).split('/');
      return { owner, repo, branch: key.slice(at + 1) };
    });
    const timer = window.setInterval(() => {
      refs.forEach((ref) => void dispatch(fetchIndexStatus(ref)));
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [dispatch, signature]);
}
