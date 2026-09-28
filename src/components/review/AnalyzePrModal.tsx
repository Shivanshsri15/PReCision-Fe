import { AlertTriangle, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchPulls } from '../../features/pullRequests/pullRequestsThunks';
import { selectRepoPulls } from '../../features/pullRequests/selectors';
import { useRepositoriesBootstrap } from '../../features/repositories/hooks';
import { selectIndexRecords, selectRepoOptions } from '../../features/repositories/selectors';
import { useStartAnalysis } from '../../features/reviews/hooks';
import { indexKey, splitRepoKey } from '../../utils/keys';
import { Button } from '../ui/Button';
import { Label, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Toggle } from '../ui/Toggle';

interface AnalyzePrModalProps {
  open: boolean;
  onClose: () => void;
}

/** Repo + open PR picker that launches a streamed analysis. */
export function AnalyzePrModal({ open, onClose }: AnalyzePrModalProps) {
  useRepositoriesBootstrap();
  const dispatch = useAppDispatch();
  const startAnalysis = useStartAnalysis();
  const repoOptions = useAppSelector(selectRepoOptions);
  const indexRecords = useAppSelector(selectIndexRecords);

  const [repoKey, setRepoKey] = useState('');
  const [prNumber, setPrNumber] = useState('');
  const [postComments, setPostComments] = useState(false);

  const selectedRepoKey = repoKey || repoOptions[0]?.key || '';
  const pulls = useAppSelector((state) => selectRepoPulls(state, selectedRepoKey));
  const openPulls = useMemo(() => pulls.items.filter((pr) => pr.state === 'open'), [pulls.items]);
  const selectedPr = openPulls.find((pr) => String(pr.number) === prNumber) ?? openPulls[0];

  useEffect(() => {
    const repo = splitRepoKey(selectedRepoKey);
    if (open && repo && pulls.status === 'idle') void dispatch(fetchPulls(repo));
  }, [dispatch, open, selectedRepoKey, pulls.status]);

  const repo = splitRepoKey(selectedRepoKey);
  const baseIndex = repo && selectedPr ? indexRecords[indexKey(repo.owner, repo.repo, selectedPr.base.ref)] : undefined;
  const baseReady = baseIndex?.status === 'ready' || baseIndex?.status === 'partial';

  const submit = () => {
    if (!repo || !selectedPr) return;
    startAnalysis({ owner: repo.owner, repo: repo.repo, number: selectedPr.number, postComments });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Analyze a pull request"
      description="Run the multi-agent review pipeline on an open PR."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon={Sparkles} disabled={!selectedPr} onClick={submit}>
            Analyze PR
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="analyze-repo">Repository</Label>
          <Select
            id="analyze-repo"
            value={selectedRepoKey}
            onChange={(event) => {
              setRepoKey(event.target.value);
              setPrNumber('');
            }}
          >
            {repoOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.key}
                {option.indexed ? ' — indexed' : ''}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="analyze-pr">Open pull request</Label>
          <Select
            id="analyze-pr"
            value={selectedPr ? String(selectedPr.number) : ''}
            disabled={!openPulls.length}
            onChange={(event) => setPrNumber(event.target.value)}
          >
            {pulls.status === 'loading' && <option>Loading pull requests…</option>}
            {pulls.status !== 'loading' && !openPulls.length && <option>No open pull requests</option>}
            {openPulls.map((pr) => (
              <option key={pr.number} value={pr.number}>
                #{pr.number} {pr.title}
              </option>
            ))}
          </Select>
        </div>

        {selectedPr && !baseReady && (
          <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <span>
              The base branch <code className="font-mono">{selectedPr.base.ref}</code> does not look indexed yet. The
              analysis needs it —{' '}
              <Link to="/repositories" onClick={onClose} className="font-medium underline">
                index it from Repositories
              </Link>
              .
            </span>
          </p>
        )}

        <Toggle
          checked={postComments}
          onChange={setPostComments}
          label="Post comments to GitHub"
          description="Publish findings as an inline review on the pull request."
        />
      </div>
    </Modal>
  );
}
