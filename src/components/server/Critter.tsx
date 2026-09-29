import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

export interface CritterProps {
  name: string;
  color: string;
  icon: LucideIcon;
  awake: boolean;
  /** Pointer position normalised to -1..1 on each axis; the pupils follow it. */
  look: { x: number; y: number };
  /** Staggers the idle animations so the crew doesn't move in lockstep. */
  delay: number;
  /** Changing this replays the hop animation. */
  hop: number;
  speech: string | null;
  onPoke: () => void;
}

const INK = '#0f172a';

export function Critter({ name, color, icon: Icon, awake, look, delay, hop, speech, onPoke }: CritterProps) {
  const px = awake ? look.x * 2.6 : 0;
  const py = awake ? look.y * 2.2 : 0;

  return (
    <button
      type="button"
      onClick={onPoke}
      aria-label={awake ? `Say hi to ${name}` : `Wake up ${name}`}
      className="group relative flex w-20 flex-col items-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      {speech && (
        <span className="animate-pop-in absolute -top-10 z-10 whitespace-nowrap rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-md ring-1 ring-slate-200">
          {speech}
          <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-white ring-1 ring-slate-200 [clip-path:polygon(100%_0,100%_100%,0_100%)]" />
        </span>
      )}

      <div key={hop} className={clsx('relative', hop > 0 && 'critter-hop')}>
        <div className={awake ? 'critter-bob' : 'critter-breathe'} style={{ animationDelay: `${delay}ms` }}>
          <svg viewBox="0 0 80 80" className="size-20 transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
            <ellipse cx="40" cy="76" rx="20" ry="3" fill="rgb(15 23 42 / 0.12)" />
            <line x1="40" y1="19" x2="40" y2="9" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <circle cx="40" cy="7" r="4.5" fill={awake ? '#fde047' : color} className={awake ? 'critter-glow' : undefined} />
            <rect x="10" y="18" width="60" height="54" rx="26" fill={color} />
            <ellipse cx="40" cy="60" rx="18" ry="9" fill="white" opacity="0.18" />

            {awake ? (
              <g className="critter-blink" style={{ animationDelay: `${delay * 3}ms` }}>
                <circle cx="29" cy="40" r="7.5" fill="white" />
                <circle cx="51" cy="40" r="7.5" fill="white" />
                <circle cx={29 + px} cy={40 + py} r="3.8" fill={INK} />
                <circle cx={51 + px} cy={40 + py} r="3.8" fill={INK} />
                <circle cx={30.4 + px} cy={38.6 + py} r="1.2" fill="white" />
                <circle cx={52.4 + px} cy={38.6 + py} r="1.2" fill="white" />
              </g>
            ) : (
              <g stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none">
                <path d="M23 41 q6 4 12 0" />
                <path d="M45 41 q6 4 12 0" />
              </g>
            )}

            <circle cx="20" cy="50" r="3.5" fill="#fb7185" opacity="0.45" />
            <circle cx="60" cy="50" r="3.5" fill="#fb7185" opacity="0.45" />
            {awake ? (
              <path d="M34 53 q6 5 12 0" stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none" />
            ) : (
              <ellipse cx="40" cy="54" rx="2.4" ry="2" fill={INK} />
            )}
          </svg>
          <span
            className="absolute -right-1 bottom-2 flex size-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200"
            style={{ color }}
          >
            <Icon className="size-3.5" />
          </span>
        </div>

        {!awake && (
          <span aria-hidden className="pointer-events-none absolute -right-1 top-1 font-bold text-slate-400">
            <span className="zzz absolute text-xs">z</span>
            <span className="zzz absolute text-sm [animation-delay:0.9s]">z</span>
            <span className="zzz absolute text-base [animation-delay:1.8s]">Z</span>
          </span>
        )}
      </div>

      <span className="mt-1.5 text-xs font-semibold text-slate-700">{name}</span>
      <span
        className={clsx(
          'text-[10px] font-medium uppercase tracking-wider transition-colors',
          awake ? 'text-emerald-600' : 'text-slate-400',
        )}
      >
        {awake ? 'awake' : 'sleeping'}
      </span>
    </button>
  );
}
