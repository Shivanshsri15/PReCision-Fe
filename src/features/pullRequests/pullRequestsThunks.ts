import { createApiThunk } from '../../app/createAppThunk';
import { githubApi } from '../../services/githubApi';

export interface RepoArg {
  owner: string;
  repo: string;
}

export interface PullArg extends RepoArg {
  number: number;
}

export const fetchPulls = createApiThunk('pullRequests/fetchPulls', ({ owner, repo }: RepoArg) =>
  githubApi.listPullRequests(owner, repo),
);

export const fetchPull = createApiThunk('pullRequests/fetchPull', ({ owner, repo, number }: PullArg) =>
  githubApi.getPullRequest(owner, repo, number),
);

export const fetchPullFiles = createApiThunk('pullRequests/fetchPullFiles', ({ owner, repo, number }: PullArg) =>
  githubApi.listPullRequestFiles(owner, repo, number),
);
