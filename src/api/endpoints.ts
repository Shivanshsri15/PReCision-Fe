const seg = encodeURIComponent;
const repoPath = (owner: string, repo: string) => `/repositories/${seg(owner)}/${seg(repo)}`;

export const endpoints = {
  auth: {
    me: '/api/v1/auth/me',
    geminiKey: '/api/v1/auth/gemini-key',
  },
  events: {
    stream: '/api/v1/events/stream',
  },
  github: {
    oauthUrl: '/api/v1/github/oauth/url',
    profile: '/api/v1/github/profile',
    repositories: '/api/v1/github/repositories',
    pulls: (owner: string, repo: string) => `/api/v1/github${repoPath(owner, repo)}/pulls`,
    pull: (owner: string, repo: string, number: number) =>
      `/api/v1/github${repoPath(owner, repo)}/pulls/${number}`,
    pullFiles: (owner: string, repo: string, number: number) =>
      `/api/v1/github${repoPath(owner, repo)}/pulls/${number}/files`,
  },
  repoIndex: {
    list: '/api/v1/repo-index/repositories',
    index: (owner: string, repo: string, branch: string) =>
      `/api/v1/repo-index${repoPath(owner, repo)}/branches/${seg(branch)}/index`,
    status: (owner: string, repo: string, branch: string) =>
      `/api/v1/repo-index${repoPath(owner, repo)}/branches/${seg(branch)}/status`,
  },
  codeReview: {
    runs: '/api/v1/code-review/runs',
    run: (runId: string) => `/api/v1/code-review/runs/${seg(runId)}`,
    completeRun: (runId: string) => `/api/v1/code-review/runs/${seg(runId)}/complete`,
    cancelRun: (runId: string) => `/api/v1/code-review/runs/${seg(runId)}/cancel`,
    runStream: (runId: string) => `/api/v1/code-review/runs/${seg(runId)}/stream`,
    stats: '/api/v1/code-review/stats',
    prRuns: (owner: string, repo: string, number: number) =>
      `/api/v1/code-review${repoPath(owner, repo)}/pulls/${number}/runs`,
    analyzeStream: (owner: string, repo: string, number: number) =>
      `/api/v1/code-review${repoPath(owner, repo)}/pulls/${number}/analyze/stream`,
  },
};
