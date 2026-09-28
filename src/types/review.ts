export type Severity = 'high' | 'medium' | 'low';
export type DomainKey = 'quality' | 'security' | 'performance' | 'bugDetection';
export type SeverityCounts = Record<Severity, number>;

export interface Finding {
  file: string;
  issue: string;
  severity: Severity;
  suggestion?: string;
  line?: number;
  domain?: DomainKey;
}

export interface DomainReport {
  domain: DomainKey;
  rating: 1 | 2 | 3 | 4 | 5;
  summary: string;
  weakAreas?: string[];
  findings: Finding[];
}

export interface FinalReport {
  prId: number;
  overallSummary: string;
  summary?: string;
  domainReports: Partial<Record<DomainKey, DomainReport>>;
  findings: Finding[];
  counts?: {
    severity: SeverityCounts;
    domain: Record<DomainKey, number>;
  };
  extraPromptApplied?: string;
  bugDetectionPromptAddendum?: string;
  relatedContextCount?: number;
  relatedContextPaths?: string[];
}

export type RunStatus = 'running' | 'completed' | 'failed';

export interface ReviewRun {
  _id: string;
  owner: string;
  repo: string;
  pullNumber: number;
  status: RunStatus;
  baseSha: string;
  headSha: string;
  baseBranch: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  /** Summary listings only include `counts` and `overallSummary`. */
  finalReport?: Partial<FinalReport>;
  /** Once marked complete, the next analysis starts fresh instead of re-running this one. */
  markedComplete?: boolean;
  markedCompleteAt?: string;
  /** The run this one re-ran, reusing its cached context and findings. */
  rerunOf?: string;
  /** Present once the run's findings were posted to GitHub. */
  postedComments?: PostedComment[];
  reviewUrl?: string;
}

export interface PostedComment {
  commentId?: number;
  file: string;
  line?: number;
  issue: string;
  severity: Severity;
  resolved: boolean;
  resolvedAt?: string;
}

export type AnalysisResult = FinalReport & { runId: string; rerunOf?: string };

export interface PostedReview {
  posted: boolean;
  inlineComments: number;
  summaryOnly: number;
  /** Comments from earlier runs on this PR that were marked resolved. */
  resolvedPrevious: number;
  url?: string;
  error?: string;
}

export interface DashboardStats {
  repositories: number;
  indexedBranches: number;
  indexedChunks: number;
  indexedFiles: number;
  reviews: number;
  completedReviews: number;
  findings: number;
  severity: SeverityCounts;
}

export interface RunComparison {
  newFindings: Finding[];
  resolved: Finding[];
  unchanged: Finding[];
}
