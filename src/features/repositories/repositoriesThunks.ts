import { createApiThunk } from '../../app/createAppThunk';
import { githubApi } from '../../services/githubApi';
import { repoIndexApi } from '../../services/repoIndexApi';
import type { BranchRef } from '../../types/repoIndex';

export const REPOS_PER_PAGE = 30;

export const fetchRepos = createApiThunk(
  'repositories/fetchRepos',
  async ({ page }: { page: number }) => ({
    page,
    repos: await githubApi.listRepositories(page, REPOS_PER_PAGE),
  }),
  { condition: (_, { getState }) => getState().repositories.reposStatus !== 'loading' },
);

export const fetchIndexedRepos = createApiThunk('repositories/fetchIndexed', () =>
  repoIndexApi.listIndexed(),
);

export const fetchIndexStatus = createApiThunk('repositories/fetchIndexStatus', (ref: BranchRef) =>
  repoIndexApi.getStatus(ref),
);

/** Runs a full index; on failure refreshes the record so the stored error is shown. */
export const indexBranch = createApiThunk('repositories/indexBranch', async (ref: BranchRef, { dispatch }) => {
  try {
    return await repoIndexApi.indexBranch(ref);
  } catch (error) {
    void dispatch(fetchIndexStatus(ref));
    throw error;
  }
});
