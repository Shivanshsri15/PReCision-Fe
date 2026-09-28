import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { BranchRef, RepoIndexRecord } from '../types/repoIndex';

export const repoIndexApi = {
  async listIndexed(): Promise<RepoIndexRecord[]> {
    const { data } = await apiClient.get<RepoIndexRecord[]>(endpoints.repoIndex.list);
    return data;
  },

  async getStatus({ owner, repo, branch }: BranchRef): Promise<RepoIndexRecord> {
    const { data } = await apiClient.get<RepoIndexRecord>(
      endpoints.repoIndex.status(owner, repo, branch),
    );
    return data;
  },

  /** Resolves once the full index finishes (can take minutes on large repos). */
  async indexBranch({ owner, repo, branch }: BranchRef): Promise<RepoIndexRecord> {
    const { data } = await apiClient.post<RepoIndexRecord>(
      endpoints.repoIndex.index(owner, repo, branch),
    );
    return data;
  },
};
