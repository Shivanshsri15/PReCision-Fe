import { Bug, Gauge, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_URL } from '../../api/client';
import { Button } from '../ui/Button';
import { Critter } from './Critter';

interface CrewMember {
  name: string;
  color: string;
  icon: LucideIcon;
  /** Seconds into the wait before this one wakes up on its own. */
  wakeAt: number;
  lines: string[];
}

const CREW: CrewMember[] = [
  { name: 'Quality', color: '#6366f1', icon: Sparkles, wakeAt: 0, lines: ['Looking sharp today!', 'I dreamt of clean code.', 'Naming things is hard.'] },
  { name: 'Security', color: '#10b981', icon: ShieldCheck, wakeAt: 9, lines: ['Who goes there?', 'Never commit secrets.', 'Sanitise your inputs!'] },
  { name: 'Performance', color: '#f59e0b', icon: Gauge, wakeAt: 18, lines: ['Warming up the engines!', 'Zoom zoom.', 'Is that an N+1 query?'] },
  { name: 'Bugs', color: '#f43f5e', icon: Bug, wakeAt: 28, lines: ['I smell a bug.', "It's not a bug, it's a feature.", 'Off-by-one? Never.'] },
];

const SLEEPY_LINES = ['Mmh… five more minutes.', "*yawn* I'm up, I'm up!", 'Is it Monday already?'];

const STAGES: Array<[number, string]> = [
  [0, "Knocking on the server's door…"],
  [6, 'The server is stretching and yawning…'],
  [15, 'Brewing a fresh pot of coffee…'],
  [25, 'Waking up the review crew…'],
  [40, 'Almost there, lacing up its shoes…'],
];

const SLOW_AFTER_S = 90;

const pick = (lines: string[]) => lines[Math.floor(Math.random() * lines.length)];

interface WakeScreenProps {
  ready: boolean;
  onSkip: () => void;
}

export function WakeScreen({ ready, onSkip }: WakeScreenProps) {
  const [elapsed, setElapsed] = useState(1);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [pokes, setPokes] = useState<Record<string, number>>({});
  const [speech, setSpeech] = useState<{ name: string; text: string } | null>(null);

  useEffect(() => {
    if (ready) return;
    const timer = window.setInterval(() => setElapsed((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [ready]);

  useEffect(() => {
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setLook({ x: (event.clientX / window.innerWidth) * 2 - 1, y: (event.clientY / window.innerHeight) * 2 - 1 }),
      );
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!speech) return;
    const timer = window.setTimeout(() => setSpeech(null), 2200);
    return () => window.clearTimeout(timer);
  }, [speech]);

  const isAwake = (member: CrewMember) => ready || elapsed >= member.wakeAt || (pokes[member.name] ?? 0) > 0;

  const poke = (member: CrewMember) => {
    setSpeech({ name: member.name, text: pick(isAwake(member) ? member.lines : SLEEPY_LINES) });
    setPokes((current) => ({ ...current, [member.name]: (current[member.name] ?? 0) + 1 }));
  };

  const awakeCount = CREW.filter(isAwake).length;
  const progress = ready ? 100 : Math.min(94, Math.round(100 * (1 - Math.exp(-elapsed / 22))));
  const stage = [...STAGES].reverse().find(([at]) => elapsed >= at)?.[1] ?? STAGES[0][1];
  const slow = !ready && elapsed >= SLOW_AFTER_S;

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--color-brand-100),transparent_60%),linear-gradient(to_bottom,white,var(--color-slate-50))] px-6 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 overflow-hidden">
        <div className="perspective-grid absolute inset-x-0 top-0 h-[200%]" />
      </div>

      <div className="relative w-full max-w-xl text-center">
        <div className="inline-flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-extrabold text-white shadow-md shadow-brand-600/30">
            P
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            PRe<span className="text-brand-600">C</span>ision
          </span>
        </div>

        <h1 className="mt-8 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {ready ? "We're up! Let's review some code." : 'Waking up the server…'}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          {ready ? 'Taking you in…' : 'The server takes a little while to start. Hang tight, the crew is getting ready.'}
        </p>

        <div className="mt-14 flex flex-wrap items-end justify-center gap-x-6 gap-y-8 sm:gap-x-10">
          {CREW.map((member, index) => (
            <Critter
              key={member.name}
              name={member.name}
              color={member.color}
              icon={member.icon}
              awake={isAwake(member)}
              look={look}
              delay={index * 180}
              hop={(pokes[member.name] ?? 0) + (ready ? 100 : 0)}
              speech={speech?.name === member.name ? speech.text : null}
              onPoke={() => poke(member)}
            />
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400">
          {ready
            ? 'The whole crew is awake.'
            : `${awakeCount} of ${CREW.length} reviewers awake · psst, click one to say hi`}
        </p>

        <div className="mx-auto mt-10 max-w-sm">
          <p role="status" aria-live="polite" className="text-xs text-slate-500">
            {ready ? 'Server is awake' : stage}
          </p>
          <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-linear-to-r from-brand-500 via-violet-500 to-emerald-500 transition-[width] duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
            {!ready && (
              <div className="wake-shine absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/60 to-transparent" />
            )}
          </div>
        </div>

        {slow && (
          <div className="animate-pop-in mx-auto mt-8 max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-xs text-amber-800">
            This is taking longer than usual. Check that the API at{' '}
            <code className="font-mono [overflow-wrap:anywhere]">{API_URL}</code> is running.
            <div className="mt-2">
              <Button size="sm" variant="secondary" onClick={onSkip}>
                Continue anyway
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
