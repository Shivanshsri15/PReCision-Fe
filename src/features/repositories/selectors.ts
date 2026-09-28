import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import type { RepoIndexRecord } from '../../types/repoIndex';
import { indexKey, repoKey } from '../../utils/keys';
import { isIndexInFlight } from '../../utils/status';

export interface RepositoryCardModel {
  key: string;
  owner: string;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  defaultBranch: string;
  isPrivate: boolean;
  htmlUrl: string;
  avatarUrl?: string;
  updatedAt?: string;
  /** Index record for the default branch, else the most recently indexed branch. */
  index: RepoIndexRecord | null;
  branches: RepoIndexRecord[];
}

export interface RepositoryFilters {
  query: string;
  language: string;
}

export const selectRepositoriesState = (state: RootState) => state.repositories;
export const selectIndexRecords = (state: RootState) => state.repositories.indexRecords;
export const selectIndexingKeys = (state: RootState) => state.repositories.indexingKeys;

export const selectIndexRecord = (state: RootState, owner: string, repo: string, branch: string) =>
  state.repositories.indexRecords[indexKey(owner, repo, branch)];

const byRecency = (a: RepoIndexRecord, b: RepoIndexRecord) =>
  new Date(b.lastIndexedAt ?? b.updatedAt ?? 0).getTime() -
  new Date(a.lastIndexedAt ?? a.updatedAt ?? 0).getTime();

const selectRecordsByRepo = createSelector([selectIndexRecords], (records) => {
  const grouped = new Map<string, RepoIndexRecord[]>();
  for (const record of Object.values(records)) {
    const key = repoKey(record.owner, record.repo);
    grouped.set(key, [...(grouped.get(key) ?? []), record]);
  }
  grouped.forEach((list) => list.sort(byRecency));
  return grouped;
});

/** GitHub repos merged with their index records; indexed repos missing from the loaded pages are appended. */
export const selectRepositoryCards = createSelector(
  [(state: RootState) => state.repositories.repos, selectRecordsByRepo],
  (repos, recordsByRepo): RepositoryCardModel[] => {
    const cards: RepositoryCardModel[] = repos.map((repo) => {
      const branches = recordsByRepo.get(repoKey(repo.owner.login, repo.name)) ?? [];
      return {
        key: repoKey(repo.owner.login, repo.name),
        owner: repo.owner.login,
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        defaultBranch: repo.default_branch,
        isPrivate: repo.private,
        htmlUrl: repo.html_url,
        avatarUrl: repo.owner.avatar_url,
        updatedAt: repo.pushed_at ?? repo.updated_at,
        index: branches.find((b) => b.branch === repo.default_branch) ?? branches[0] ?? null,
        branches,
      };
    });

    const known = new Set(cards.map((card) => card.key));
    recordsByRepo.forEach((branches, key) => {
      if (known.has(key)) return;
      const [first] = branches;
      cards.push({
        key,
        owner: first.owner,
        name: first.repo,
        description: null,
        language: null,
        stars: 0,
        forks: 0,
        defaultBranch: first.branch,
        isPrivate: false,
        htmlUrl: `https://github.com/${key}`,
        index: first,
        branches,
      });
    });
    return cards;
  },
);

export const selectFilteredRepositoryCards = createSelector(
  [selectRepositoryCards, (_: RootState, filters: RepositoryFilters) => filters],
  (cards, filters) => {
    const query = filters.query.trim().toLowerCase();
    return cards.filter(
      (card) =>
        (!filters.language || card.language === filters.language) &&
        (!query ||
          card.key.toLowerCase().includes(query) ||
          (card.description ?? '').toLowerCase().includes(query)),
    );
  },
);

export const selectRepositoryLanguages = createSelector([selectRepositoryCards], (cards) =>
  [...new Set(cards.map((card) => card.language).filter((l): l is string => Boolean(l)))].sort(),
);

/** Repo keys ordered indexed-first, for pickers. */
export const selectRepoOptions = createSelector([selectRepositoryCards], (cards) =>
  [...cards]
    .sort((a, b) => Number(Boolean(b.index)) - Number(Boolean(a.index)) || a.key.localeCompare(b.key))
    .map((card) => ({ key: card.key, owner: card.owner, name: card.name, indexed: Boolean(card.index), defaultBranch: card.defaultBranch })),
);

export const selectInFlightIndexRecords = createSelector([selectIndexRecords], (records) =>
  Object.values(records).filter((record) => isIndexInFlight(record.status)),
);
