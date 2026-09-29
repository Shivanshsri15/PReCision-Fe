export type IndexJobKind = 'full' | 'incremental';
export type IndexedFileStatus = 'indexed' | 'skipped' | 'failed' | 'removed';

export interface IndexedFile {
  path: string;
  status: IndexedFileStatus;
  chunks?: number;
}

export interface IndexJobSummary {
  owner: string;
  repo: string;
  branch: string;
  kind: IndexJobKind;
  total: number;
  processed: number;
  startedAt: string;
}

export interface IndexCompletedEvent extends IndexJobSummary {
  status: string;
  fileCount: number;
  chunkCount: number;
  skipped: number;
  failed: number;
}

export interface IndexFailedEvent extends IndexJobSummary {
  error: string;
}

export interface PushReceivedEvent {
  owner: string;
  repo: string;
  branch: string;
  sha?: string;
  message?: string;
  pusher?: string;
  compareUrl?: string;
  changed: number;
  removed: number;
}

export interface ActiveAnalysis {
  runId: string;
  owner: string;
  repo: string;
  pullNumber: number;
  postComments: boolean;
  startedAt: string;
}

export interface AnalysisFinishedEvent extends ActiveAnalysis {
  status: 'completed' | 'failed';
  findings: number;
  error?: string;
}

export interface EventsSnapshot {
  indexing?: Array<IndexJobSummary & { files: IndexedFile[] }>;
  analyses?: ActiveAnalysis[];
}

export interface AppEvent {
  type: string;
  data: unknown;
  at: string;
}
