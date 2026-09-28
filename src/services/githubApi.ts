import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { GithubRepo, PullRequest, PullRequestFile } from '../types/github';
import type { GithubProfile } from '../types/user';

export const githubApi = {
  async getOAuthUrl(): Promise<string> {
    const { data } = await apiClient.get<{ authorizationUrl: string }>(endpoints.github.oauthUrl);
    return data.authorizationUrl;
  },

  async getProfile(): Promise<GithubProfile> {
    const { data } = await apiClient.get<GithubProfile>(endpoints.github.profile);
    return data;
  },

  async listRepositories(page: number, perPage: number): Promise<GithubRepo[]> {
    const { data } = await apiClient.get<GithubRepo[]>(endpoints.github.repositories, {
      params: { page, perPage },
    });
    return data;
  },

  async listPullRequests(owner: string, repo: string): Promise<PullRequest[]> {
    const { data } = await apiClient.get<PullRequest[]>(endpoints.github.pulls(owner, repo), {
      params: { state: 'all' },
    });
    return data;
  },

  async getPullRequest(owner: string, repo: string, number: number): Promise<PullRequest> {
    const { data } = await apiClient.get<PullRequest>(endpoints.github.pull(owner, repo, number));
    return data;
  },

  async listPullRequestFiles(owner: string, repo: string, number: number): Promise<PullRequestFile[]> {
    const { data } = await apiClient.get<PullRequestFile[]>(
      endpoints.github.pullFiles(owner, repo, number),
    );
    return data;
  },
};
