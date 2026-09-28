export interface GithubUserRef {
  login: string;
  avatar_url: string;
  html_url?: string;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: GithubUserRef;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  default_branch: string;
  private: boolean;
  html_url: string;
  updated_at: string;
  pushed_at?: string;
}

export interface GitRef {
  ref: string;
  sha: string;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  draft?: boolean;
  html_url: string;
  user: GithubUserRef;
  head: GitRef;
  base: GitRef;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  additions?: number;
  deletions?: number;
  changed_files?: number;
  commits?: number;
  comments?: number;
}

export type PullRequestFileStatus =
  | 'added'
  | 'removed'
  | 'modified'
  | 'renamed'
  | 'copied'
  | 'changed'
  | 'unchanged';

export interface PullRequestFile {
  sha: string;
  filename: string;
  status: PullRequestFileStatus;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previous_filename?: string;
}

/** UI-level PR state: GitHub only knows open/closed, merged is derived from `merged_at`. */
export type PullRequestTab = 'open' | 'closed' | 'merged' | 'all';
export type PullRequestDisplayState = 'open' | 'closed' | 'merged' | 'draft';
