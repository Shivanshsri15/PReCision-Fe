export type RepoIndexStatus =
  | 'pending'
  | 'indexing'
  | 'ready'
  | 'failed'
  | 'partial'
  | 'missing';

export interface RepoIndexRecord {
  owner: string;
  repo: string;
  branch: string;
  repoId?: string;
  status: RepoIndexStatus;
  indexedSha?: string;
  fileCount?: number;
  chunkCount?: number;
  lastIndexedAt?: string;
  lastError?: string;
  webhookId?: number;
  webhookUrl?: string;
  updatedAt?: string;
}

export interface BranchRef {
  owner: string;
  repo: string;
  branch: string;
}
