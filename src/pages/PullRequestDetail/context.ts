import { useOutletContext } from 'react-router-dom';
import type { PullRequest } from '../../types/github';
import type { Finding, ReviewRun } from '../../types/review';

export interface PrDetailContext {
  owner: string;
  repo: string;
  number: number;
  prKey: string;
  pr: PullRequest | null;
  runs: ReviewRun[];
  run: ReviewRun | undefined;
  /** True while the selected run's full report is being fetched. */
  runLoading: boolean;
  runsLoading: boolean;
  /** Appends `?run=` so links keep the selected run. */
  withRun: (path: string) => string;
  /** Diff tab link that focuses a finding's file and line. */
  diffHref: (finding: Pick<Finding, 'file' | 'line'>) => string;
  analyze: () => void;
  /** False once the PR's latest review is marked complete. */
  canAnalyze: boolean;
}

export const usePrDetail = () => useOutletContext<PrDetailContext>();
