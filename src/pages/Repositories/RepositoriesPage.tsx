import { FolderGit2, Plus } from 'lucide-react';
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
          <Button icon={Plus} onClick={() => setModal({ card: null })} disabled={!repos.length}>
            Index Repository
          </Button>
        }
      />

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
            <RepositoryCard key={card.key} card={card} onIndex={(selected) => setModal({ card: selected })} />
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
