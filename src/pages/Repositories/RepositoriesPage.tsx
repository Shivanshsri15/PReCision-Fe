import { FolderGit2, Loader2, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SearchInput, Select } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { useIndexStatusPolling, useRepositoriesBootstrap } from '../../features/repositories/hooks';
import { fetchRepos } from '../../features/repositories/repositoriesThunks';
import {
  selectActiveIndexKey,
  selectFilteredRepositoryCards,
  selectRepositoriesState,
  selectRepositoryLanguages,
  type RepositoryCardModel,
} from '../../features/repositories/selectors';
import { IndexBranchModal } from './components/IndexBranchModal';
import { RepositoryCard } from './components/RepositoryCard';

export function RepositoriesPage() {
  useRepositoriesBootstrap();
  useIndexStatusPolling();

  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [language, setLanguage] = useState('');
  const [modal, setModal] = useState<{ card: RepositoryCardModel | null } | null>(null);

  const filters = useMemo(() => ({ query, language }), [query, language]);
  const cards = useAppSelector((state) => selectFilteredRepositoryCards(state, filters));
  const languages = useAppSelector(selectRepositoryLanguages);
  const { reposStatus, hasMore, page, repos } = useAppSelector(selectRepositoriesState);
  const activeIndexKey = useAppSelector(selectActiveIndexKey);
  const indexLockHint = activeIndexKey ? `${activeIndexKey} is being indexed. Wait for it to finish.` : undefined;

  const setQuery = (value: string) =>
    setSearchParams((params) => {
      if (value) params.set('q', value);
      else params.delete('q');
      return params;
    }, { replace: true });

  const initialLoading = reposStatus === 'loading' && !repos.length;

  return (
    <>
      <PageHeader
        title="Repositories"
        description="Connect and manage the GitHub repositories PReCision reviews."
        actions={
          <Button
            icon={Plus}
            onClick={() => setModal({ card: null })}
            disabled={!repos.length || Boolean(activeIndexKey)}
            title={indexLockHint}
          >
            Index Repository
          </Button>
        }
      />

      {activeIndexKey && (
        <p className="mb-4 flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800 ring-1 ring-brand-100">
          <Loader2 className="size-4 shrink-0 animate-spin" />
          <span>
            <span className="font-medium">{activeIndexKey}</span> is being indexed. Other repositories can be indexed once it
            finishes.
          </span>
        </p>
      )}

      <div className="mb-5 flex flex-wrap gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Search repositories…" className="w-full sm:w-72" />
        <Select value={language} onChange={(event) => setLanguage(event.target.value)} className="w-auto">
          <option value="">All languages</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </Select>
      </div>

      {initialLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : cards.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <RepositoryCard
              key={card.key}
              card={card}
              lockHint={indexLockHint}
              onIndex={(selected) => setModal({ card: selected })}
            />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={FolderGit2}
            title={repos.length ? 'No repositories match your filters' : 'No repositories found'}
            description={repos.length ? 'Try a different search or filter.' : 'Repositories you can access on GitHub appear here.'}
          />
        </Card>
      )}

      {hasMore && repos.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" loading={reposStatus === 'loading'} onClick={() => void dispatch(fetchRepos({ page: page + 1 }))}>
            Load more repositories
          </Button>
        </div>
      )}

      {modal && <IndexBranchModal card={modal.card} onClose={() => setModal(null)} />}
    </>
  );
}
