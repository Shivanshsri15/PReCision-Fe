import { Info } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Button } from '../../../components/ui/Button';
import { Input, Label, Select } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { indexBranch } from '../../../features/repositories/repositoriesThunks';
import { selectRepoOptions, type RepositoryCardModel } from '../../../features/repositories/selectors';
import { showToast } from '../../../features/ui/uiSlice';
import { splitRepoKey } from '../../../utils/keys';

interface IndexBranchModalProps {
  /** Pre-selected repository; when null the modal shows a repository picker. */
  card: RepositoryCardModel | null;
  onClose: () => void;
}

export function IndexBranchModal({ card, onClose }: IndexBranchModalProps) {
  const dispatch = useAppDispatch();
  const repoOptions = useAppSelector(selectRepoOptions);
  const [repoKey, setRepoKey] = useState(card?.key ?? repoOptions[0]?.key ?? '');
  const selected = repoOptions.find((option) => option.key === repoKey);
  const [branch, setBranch] = useState(card?.defaultBranch ?? selected?.defaultBranch ?? 'main');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const repo = splitRepoKey(repoKey);
    const ref = branch.trim();
    if (!repo || !ref) return;

    dispatch(showToast({ tone: 'info', title: 'Indexing started', message: `${repoKey}@${ref}` }));
    void dispatch(indexBranch({ ...repo, branch: ref }))
      .unwrap()
      .then((record) =>
        dispatch(
          showToast({
            tone: 'success',
            title: 'Indexing complete',
            message: `${repoKey}@${ref}: ${record.fileCount ?? 0} files, ${record.chunkCount ?? 0} chunks`,
          }),
        ),
      )
      .catch(() => undefined);
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={card ? `Index ${card.name}` : 'Index a repository'}
      description="Chunks and embeds the branch so reviews get codebase context."
    >
      <form onSubmit={submit} className="space-y-4">
        {!card && (
          <div>
            <Label htmlFor="index-repo">Repository</Label>
            <Select
              id="index-repo"
              value={repoKey}
              onChange={(event) => {
                setRepoKey(event.target.value);
                setBranch(repoOptions.find((o) => o.key === event.target.value)?.defaultBranch ?? 'main');
              }}
            >
              {repoOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.key}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="index-branch">Branch</Label>
          <Input id="index-branch" value={branch} onChange={(event) => setBranch(event.target.value)} placeholder="main" required />
          <p className="mt-1.5 text-xs text-slate-500">Index the base branch your pull requests target.</p>
        </div>

        <p className="flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          A push webhook is registered first so the index stays in sync with new commits. Large repositories can
          take a few minutes.
        </p>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!repoKey || !branch.trim()}>
            Start indexing
          </Button>
        </div>
      </form>
    </Modal>
  );
}
