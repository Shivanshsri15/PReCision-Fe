import { Eye, EyeOff, KeyRound, ShieldCheck, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input, Label } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { selectSettings } from '../../../features/settings/settingsSlice';
import { deleteGeminiKey, saveGeminiKey } from '../../../features/settings/settingsThunks';
import { showToast } from '../../../features/ui/uiSlice';

const MIN_KEY_LENGTH = 20;

export function GeminiKeyCard() {
  const dispatch = useAppDispatch();
  const { geminiKey, status, mutation } = useAppSelector(selectSettings);
  const [apiKey, setApiKey] = useState('');
  const [visible, setVisible] = useState(false);

  const trimmed = apiKey.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < MIN_KEY_LENGTH;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (trimmed.length < MIN_KEY_LENGTH) return;
    const result = await dispatch(saveGeminiKey(trimmed));
    if (saveGeminiKey.fulfilled.match(result)) {
      setApiKey('');
      dispatch(showToast({ tone: 'success', title: 'Gemini key saved', message: 'It is encrypted at rest and used for your reviews.' }));
    }
  };

  const remove = async () => {
    const result = await dispatch(deleteGeminiKey());
    if (deleteGeminiKey.fulfilled.match(result)) {
      dispatch(showToast({ tone: 'info', title: 'Gemini key removed' }));
    }
  };

  const source = geminiKey?.configured ? 'personal' : 'none';

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <KeyRound className="size-4 text-brand-600" /> Gemini API key
          </h2>
          <p className="mt-0.5 max-w-lg text-xs text-slate-500">
            Used for LLM reviews and code embeddings. Your key is encrypted (AES-256-GCM) and never returned by the API.
          </p>
        </div>
        {status === 'loading' && !geminiKey ? (
          <Skeleton className="h-6 w-28" />
        ) : source === 'personal' ? (
          <Badge tone="green" dot>
            Personal key active
          </Badge>
        ) : (
          <Badge tone="amber" dot>
            Not configured
          </Badge>
        )}
      </div>

      <form onSubmit={save} className="mt-5 space-y-3">
        <div>
          <Label htmlFor="gemini-key">{source === 'personal' ? 'Replace key' : 'API key'}</Label>
          <div className="relative">
            <Input
              id="gemini-key"
              type={visible ? 'text' : 'password'}
              autoComplete="off"
              spellCheck={false}
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="AIza…"
              className="pr-10 font-mono"
            />
            <button
              type="button"
              aria-label={visible ? 'Hide key' : 'Show key'}
              onClick={() => setVisible(!visible)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
            >
              {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {tooShort && <p className="mt-1 text-xs text-red-600">Keys are at least {MIN_KEY_LENGTH} characters.</p>}
          <p className="mt-1.5 text-xs text-slate-500">
            Create one in{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="font-medium text-brand-600 hover:underline">
              Google AI Studio
            </a>
            .
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" icon={ShieldCheck} loading={mutation === 'saving'} disabled={trimmed.length < MIN_KEY_LENGTH}>
            Save key
          </Button>
          {source === 'personal' && (
            <Button variant="danger" icon={Trash2} loading={mutation === 'deleting'} onClick={() => void remove()}>
              Remove key
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
